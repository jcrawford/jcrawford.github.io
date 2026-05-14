---
slug: long-running-ai-agents-adk
title: "Building Long-Running AI Agents That Actually Survive: A Practical Look at Google's ADK"
excerpt: "Most agent tutorials build stateless chatbots that forget everything when the container restarts. Google's Agent Development Kit takes a different approach—durable state machines, event-driven dormancy, and multi-agent coordination. Here's how it works and why it matters."
featuredImage: /images/content/long-running-agents-adk/featured.png
tags:
  - AI
  - Developer Tools
author: joseph-crawford
publishedAt: "2026-05-14"
---

# Building Long-Running AI Agents That Actually Survive: A Practical Look at Google's ADK

Here's the uncomfortable truth about most AI agent tutorials: they build chatbots that forget everything the moment you restart the container. That's fine for a five-minute demo. It falls apart the second you try to run anything real.

HR onboarding takes two weeks. Invoice disputes stall for days. Sales prospecting stretches across a month of touchpoints. These workflows are dominated by idle time—long pauses where the agent sits dormant, waiting for a human signature, a shipping confirmation, or an approval gate. A stateless chatbot simply cannot survive that.

Google's [Agent Development Kit (ADK)](https://adk.dev/) takes a different approach, and a [recent walkthrough on the Google Developers Blog](https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/) lays out the architecture in refreshing detail. The post builds a New Hire Onboarding Coordinator Agent that sends welcome packets, pauses for days while employees sign documents, delegates IT provisioning to a sub-agent, waits for hardware delivery, and sends a final day-one schedule—all without losing a single byte of context.

Let's walk through what makes this architecture work, because the ideas here apply far beyond Google's ecosystem.

## Why Stateless Agents Break

The standard stateless pattern is deceptively simple: append every user message and model response to a growing conversation history, then feed the entire blob back into the next LLM call. Over short sessions, this works. Over days or weeks, three problems emerge:

**Prompt context pollution.** After hundreds of turns across a two-week flow, conversation history fills up with irrelevant chatter, old tool outputs, and duplicated instructions. The model starts confusing which step it's on.

**Token cost explosion.** Replaying a full two-week history on every inference call burns through token budgets fast. A single onboarding run could generate thousands of turns—most no longer relevant to the current decision.

**Reasoning hallucinations over idle time.** When an agent pauses for three days, then resumes with a massive context dump, the model frequently hallucinates intermediate steps that never happened. It "remembers" approvals that weren't given or skips steps it assumes were completed.

The fix isn't a bigger context window. It's a fundamentally different architecture—where the agent's state is explicit, durable, and decoupled from raw chat history.

## The Core Idea: Replace Chat History With a Durable State Machine

Instead of relying on conversation history to track progress, ADK's approach defines an explicit state schema that tells the agent exactly where it is in the workflow at all times.

```python
# app/state_schema.py

class OnboardingStep:
    START = "START"
    WELCOME_SENT = "WELCOME_SENT"
    DOCUMENTS_SIGNED = "DOCUMENTS_SIGNED"
    IT_PROVISIONED = "IT_PROVISIONED"
    HARDWARE_DELIVERED = "HARDWARE_DELIVERED"
    COMPLETED = "COMPLETED"
```

Six states. No ambiguity. The agent cannot skip a step or hallucinate progress because the state machine enforces the sequence. Compare this to a typical stateless agent that has to infer where it is from a wall of chat history—there's simply no contest.

This state gets wired directly into the agent's system instruction, so the model always knows its current position:

```python
# app/agent.py

from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import Gemini
from app.state_schema import OnboardingStep
from app.tools import (
    send_welcome_packet,
    check_hardware_delivery,
    send_day_one_schedule,
)

async def initialize_onboarding_state(callback_context: CallbackContext) -> None:
    """Ensures all state machine keys are initialized."""
    state = callback_context.state
    if "current_step" not in state:
        state["current_step"] = OnboardingStep.START
    if "new_hire_details" not in state:
        state["new_hire_details"] = {}
    if "pending_signals" not in state:
        state["pending_signals"] = []

instruction = """You are an HR Onboarding Coordinator Agent.

Current Step: {current_step}
New Hire Details: {new_hire_details}
Pending Signals: {pending_signals}

Follow this state machine flow exactly:
1. If current_step is 'START': Ask for name, email, and start date. Then invoke 'send_welcome_packet'.
2. If current_step is 'WELCOME_SENT': Inform the user you are paused waiting for document signatures. Do not call other tools.
3. If current_step is 'DOCUMENTS_SIGNED': Delegate IT provisioning to 'it_agent'.
4. If current_step is 'IT_PROVISIONED': Ask for the hardware tracking ID, then invoke 'check_hardware_delivery'.
5. If current_step is 'HARDWARE_DELIVERED': Invoke 'send_day_one_schedule'.
6. If current_step is 'COMPLETED': Confirm onboarding is done.

Always stay grounded in your tools and current state. Do not skip steps."""
```

By putting `{current_step}`, `{new_hire_details}`, and `{pending_signals}` directly into the instruction, Python fills in these blanks with real data every time the agent runs. No guesswork. No digging through old messages.

## Tools That Advance the State Machine

Each tool function updates the checkpoint atomically through ADK's `ToolContext.state`:

```python
# app/tools.py

from google.adk.tools import ToolContext
from app.state_schema import OnboardingStep

def send_welcome_packet(
    name: str, email: str, start_date: str, tool_context: ToolContext
) -> dict:
    """Sends the welcome packet and transitions to WELCOME_SENT."""
    state = tool_context.state
    state["new_hire_details"] = {
        "name": name, "email": email, "start_date": start_date
    }
    state["current_step"] = OnboardingStep.WELCOME_SENT
    state["pending_signals"] = ["document_signed"]

    return {
        "status": "success",
        "message": f"Welcome packet sent to {name} ({email}). Documents pending signature.",
    }
```

Every tool call creates an automatic checkpoint. If the container crashes immediately after `send_welcome_packet` runs, the state has already been written. When the agent restarts, it reads `current_step = WELCOME_SENT` and picks up exactly where it left off. This is the kind of reliability guarantee that production systems need.

## Persistent Sessions That Survive Restarts

A state machine only stays durable if the underlying session storage survives container restarts. In a containerized environment like Cloud Run, containers cold-start, scale to zero during idle periods, and restart unexpectedly. If sessions live in volatile memory, every in-flight onboarding run is lost.

ADK solves this with a single configuration change—swap in-memory sessions for `DatabaseSessionService` backed by SQLite locally or Cloud SQL in production:

```python
# app/fast_api_app.py

from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.sessions.database_session_service import DatabaseSessionService

# Persistent SQLite session configuration
session_service_uri = "sqlite+aiosqlite:///sessions.db"

app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    session_service_uri=session_service_uri,
)
```

That's it. One config change, and every `ToolContext.state` write is durably persisted to disk. Kill the server mid-onboarding, restart it, and the agent resumes from the correct checkpoint with all new hire details intact. For production, swap the SQLite URI for a Cloud SQL connection string—the API is identical.

## Event-Driven Resumption: The Agent That Sleeps

Idle time is the defining challenge of long-running agents. After sending the welcome packet, the agent might sit dormant for days while the employee signs documents. Active polling wastes compute. Blocked threads don't scale. The agent needs to truly sleep and wake up only when an external event arrives.

ADK's approach: expose webhook endpoints that external systems call when real-world events complete. The agent hydrates its session, transitions state, and resumes reasoning:

```python
# app/fast_api_app.py

from pydantic import BaseModel
from app.resume_handler import OnboardingResumeHandler

db_session_service = DatabaseSessionService(db_url=session_service_uri)
webhook_runner = Runner(app=agent_app, session_service=db_session_service)
resume_handler = OnboardingResumeHandler(runner=webhook_runner)

class WebhookPayload(BaseModel):
    user_id: str
    session_id: str

@app.post("/webhooks/document_signed")
async def trigger_document_signed_webhook(payload: WebhookPayload) -> dict[str, str]:
    """Wakes up the agent when the employee signs their contract."""
    await resume_handler.receive_signed_documents_callback(
        user_id=payload.user_id, session_id=payload.session_id
    )
    return {"status": "success", "message": "Document signature processed, agent resumed."}
```

And the resume handler does the critical work—hydrating the persisted session and applying the state transition atomically:

```python
# app/resume_handler.py

import json
import logging

from google.adk.runners import Runner
from google.genai import types
from app.state_schema import OnboardingStep

logger = logging.getLogger(__name__)

class OnboardingResumeHandler:
    def __init__(self, runner: Runner):
        self.runner = runner

    async def receive_signed_documents_callback(
        self, user_id: str, session_id: str
    ) -> None:
        """Hydrates the session, transitions to DOCUMENTS_SIGNED, and resumes."""
        async for event in self.runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=types.Content(
                role="user",
                parts=[types.Part.from_text(
                    text="Resume onboarding: Contract has been signed."
                )],
            ),
            state_delta={
                "current_step": OnboardingStep.DOCUMENTS_SIGNED,
                "pending_signals": [],
            },
        ):
            logger.info(json.dumps({
                "severity": "INFO",
                "message": f"Wake-up execution event: {event}",
                "event": "runner_event",
                "session_id": session_id,
            }))
```

The key mechanism is `state_delta`. When the webhook fires, `run_async` atomically applies the state transition *before* the agent's next inference call. The model sees `current_step = DOCUMENTS_SIGNED` in its system prompt and immediately knows to delegate IT provisioning—no replaying old conversation history, no hallucinated intermediate steps.

The container can scale to zero during the entire idle period. When the webhook arrives, the container spins up, the session hydrates from SQLite, and the agent resumes exactly where it paused.

## Multi-Agent Delegation: Don't Stuff Everything in One Prompt

Stuffing all tools into a single agent's system prompt degrades reasoning quality, especially in long-running contexts where the prompt is already loaded with state variables and workflow instructions. ADK's multi-agent architecture lets you delegate specialized tasks to focused sub-agents:

```python
# app/agent.py

from app.tools import provision_software_accounts

it_agent = Agent(
    name="it_agent",
    model=Gemini(model="gemini-3.1-flash-lite"),
    instruction="""You are an IT Provisioning Agent. Provision corporate software
    accounts (email, Slack) for new hires based on the details provided.
    Call provision_software_accounts with the employee's name and email.""",
    tools=[provision_software_accounts],
)
```

The coordinator delegates to `it_agent` after documents are signed. Each sub-agent has a narrow, focused prompt that's less prone to confusion—and you can swap in different models for different tasks. The IT provisioning agent uses `gemini-3.1-flash-lite` instead of the coordinator's heavier model, which keeps costs down without sacrificing reliability on straightforward provisioning steps.

## The Three Architectural Shifts Worth Remembering

Whether you use ADK or not, these three ideas are the real takeaway:

1. **Durable memory schemas** instead of dumping raw JSON into a vector database. Explicit state machines make it impossible for the model to hallucinate progress or skip steps.

2. **Event-driven dormancy gates** instead of active polling or blocked threads. Let the agent truly sleep and wake on webhook signals. Your compute bill (and your reasoning quality) will thank you.

3. **Multi-agent delegation** instead of monolithic single-agent prompts. Narrow, focused sub-agents with smaller prompts reason better than one bloated coordinator trying to do everything.

These patterns apply to any long-running workflow—loan origination, insurance claims, legal review, supply chain tracking. Anywhere the process stretches across idle time measured in days rather than seconds, the stateless chatbot pattern collapses and these architectural ideas become essential.

## Getting Started

The complete source code for the onboarding agent is available on [GitHub](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/agents/adk/new-hire-onboarding). You can bootstrap a new ADK project with the Agents CLI:

```bash
uv tool install google-agents-cli
```

Then feed a coding agent a high-level prompt like:

```
Create an HR onboarding agent using ADK. It needs to run as a
long-running background process with persistent sessions.
```

The CLI handles scaffolding, session configuration, and project structure. From there, you iterate—describe what you need, review what it generates, refine.

ADK is still young, and the ecosystem around long-running agent patterns is evolving fast. But the architectural ideas here—explicit state, event-driven resumption, multi-agent delegation—are the right ones. If you're building agents that need to survive more than a single conversation, start here.

---

*Have you tried building long-running agents with ADK or a similar framework? I'd love to hear what's working and what's not—drop a comment or reach out on [LinkedIn](https://www.linkedin.com/in/crawfordjoseph).*
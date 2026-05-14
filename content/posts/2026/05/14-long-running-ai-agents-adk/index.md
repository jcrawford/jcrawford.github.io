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

A software license compliance audit can stretch across weeks. A vulnerability scan finds 47 out-of-compliance packages. Engineers need days to review and remediate each one. The security team needs to sign off before anything ships. These workflows are dominated by idle time—long pauses where the agent sits dormant, waiting for a human decision, a remediation pull request to merge, or an approval gate. A stateless chatbot simply cannot survive that.

Google's [Agent Development Kit (ADK)](https://adk.dev/) takes a different approach, and a [recent walkthrough on the Google Developers Blog](https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/) lays out the architecture in refreshing detail. The blog post uses an HR onboarding scenario, but the patterns it teaches—durable state machines, event-driven resumption, multi-agent delegation—are universal. Let's adapt them to a scenario closer to home for anyone running production infrastructure: a **license compliance audit agent** that discovers violations, pauses while engineers remediate, delegates CVE research to a sub-agent, waits for security sign-off, and produces a final audit report—all without losing a byte of context across container restarts.

## Why Stateless Agents Break

The standard stateless pattern is deceptively simple: append every user message and model response to a growing conversation history, then feed the entire blob back into the next LLM call. Over short sessions, this works. Over days or weeks, three problems emerge:

**Prompt context pollution.** After hundreds of turns across a multi-week audit, conversation history fills up with irrelevant chatter—old vulnerability descriptions, outdated remediation suggestions, and duplicated instructions. The model starts confusing which packages have been resolved and which are still pending.

**Token cost explosion.** Replaying a full audit history on every inference call burns through token budgets fast. A single compliance run could generate thousands of turns—most no longer relevant to the current decision.

**Reasoning hallucinations over idle time.** When an agent pauses for three days waiting on a security review, then resumes with a massive context dump, the model frequently hallucinates intermediate steps that never happened. It "remembers" approvals that weren't given or skips packages it assumes were remediated.

The fix isn't a bigger context window. It's a fundamentally different architecture—where the agent's state is explicit, durable, and decoupled from raw chat history.

## The Core Idea: Replace Chat History With a Durable State Machine

Instead of relying on conversation history to track progress, define an explicit state schema that tells the agent exactly where it is in the workflow at all times. Here's what that looks like for a compliance audit:

```python
# app/state_schema.py

class AuditStep:
    START = "START"
    SCAN_COMPLETE = "SCAN_COMPLETE"
    REMEDIATION_UNDERWAY = "REMEDIATION_UNDERWAY"
    CVE_REVIEW_COMPLETE = "CVE_REVIEW_COMPLETE"
    SECURITY_SIGNED_OFF = "SECURITY_SIGNED_OFF"
    REPORT_GENERATED = "REPORT_GENERATED"
    COMPLETED = "COMPLETED"
```

Seven states. No ambiguity. The agent cannot skip a step or hallucinate progress because the state machine enforces the sequence. Compare this to a typical stateless agent that has to infer where it is from a wall of chat history—there's simply no contest.

This state gets wired directly into the agent's system instruction, so the model always knows its current position:

```python
# app/agent.py

from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import Gemini
from app.state_schema import AuditStep
from app.tools import (
    run_license_scan,
    check_remediation_status,
    generate_audit_report,
)

async def initialize_audit_state(callback_context: CallbackContext) -> None:
    """Ensures all state machine keys are initialized."""
    state = callback_context.state
    if "current_step" not in state:
        state["current_step"] = AuditStep.START
    if "audit_details" not in state:
        state["audit_details"] = {}
    if "pending_signals" not in state:
        state["pending_signals"] = []

instruction = """You are a License Compliance Audit Agent.

Current Step: {current_step}
Audit Details: {audit_details}
Pending Signals: {pending_signals}

Follow this state machine flow exactly:
1. If current_step is 'START': Ask for the repository URL and audit scope. Then invoke 'run_license_scan'.
2. If current_step is 'SCAN_COMPLETE': Present the violations found. Inform the user you are pausing while engineers remediate.
3. If current_step is 'REMEDIATION_UNDERWAY': Delegate CVE and vulnerability research to 'cve_agent'.
4. If current_step is 'CVE_REVIEW_COMPLETE': Summarize findings. Pause for security team sign-off.
5. If current_step is 'SECURITY_SIGNED_OFF': Invoke 'generate_audit_report'.
6. If current_step is 'REPORT_GENERATED': Confirm the audit is complete and provide the report link.
7. If current_step is 'COMPLETED': Audit is fully resolved.

Always stay grounded in your tools and current state. Do not skip steps."""
```

By putting `{current_step}`, `{audit_details}`, and `{pending_signals}` directly into the instruction, Python fills in these blanks with real data every time the agent runs. No guesswork. No digging through old messages.

## Tools That Advance the State Machine

Each tool function updates the checkpoint atomically through ADK's `ToolContext.state`:

```python
# app/tools.py

from google.adk.tools import ToolContext
from app.state_schema import AuditStep

def run_license_scan(
    repo_url: str, scope: str, tool_context: ToolContext
) -> dict:
    """Scans the repository for license compliance violations and transitions to SCAN_COMPLETE."""
    state = tool_context.state

    # In practice, this calls your scanning service
    violations = scan_repository(repo_url, scope)

    state["audit_details"] = {
        "repo_url": repo_url,
        "scope": scope,
        "violations": violations,
        "total_violations": len(violations),
    }
    state["current_step"] = AuditStep.SCAN_COMPLETE
    state["pending_signals"] = ["remediation_merged"]

    return {
        "status": "success",
        "message": f"Scan complete. Found {len(violations)} violations in {repo_url}.",
        "violations": violations,
    }
```

Every tool call creates an automatic checkpoint. If the container crashes immediately after `run_license_scan` finishes, the state has already been written. When the agent restarts, it reads `current_step = SCAN_COMPLETE` and picks up exactly where it left off. This is the kind of reliability guarantee that production systems need.

## Persistent Sessions That Survive Restarts

A state machine only stays durable if the underlying session storage survives container restarts. In a containerized environment like Cloud Run, containers cold-start, scale to zero during idle periods, and restart unexpectedly. If sessions live in volatile memory, every in-flight audit run is lost.

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

That's it. One config change, and every `ToolContext.state` write is durably persisted to disk. Kill the server mid-audit, restart it, and the agent resumes from the correct checkpoint with all violation details intact. For production, swap the SQLite URI for a Cloud SQL connection string—the API is identical.

## Event-Driven Resumption: The Agent That Sleeps

Idle time is the defining challenge of long-running agents. After presenting the scan results, the agent might sit dormant for days while engineers open pull requests, update dependencies, and merge remediations. Active polling wastes compute. Blocked threads don't scale. The agent needs to truly sleep and wake up only when an external event arrives.

ADK's approach: expose webhook endpoints that external systems call when real-world events complete. The agent hydrates its session, transitions state, and resumes reasoning:

```python
# app/fast_api_app.py

from pydantic import BaseModel
from app.resume_handler import AuditResumeHandler

db_session_service = DatabaseSessionService(db_url=session_service_uri)
webhook_runner = Runner(app=agent_app, session_service=db_session_service)
resume_handler = AuditResumeHandler(runner=webhook_runner)

class WebhookPayload(BaseModel):
    user_id: str
    session_id: str

@app.post("/webhooks/remediation_complete")
async def trigger_remediation_webhook(payload: WebhookPayload) -> dict[str, str]:
    """Wakes up the audit agent when engineers finish remediating violations."""
    await resume_handler.receive_remediation_callback(
        user_id=payload.user_id, session_id=payload.session_id
    )
    return {"status": "success", "message": "Remediation processed, agent resumed."}

@app.post("/webhooks/security_signoff")
async def trigger_security_signoff_webhook(payload: WebhookPayload) -> dict[str, str]:
    """Wakes up the audit agent when the security team approves the remediations."""
    await resume_handler.receive_security_signoff_callback(
        user_id=payload.user_id, session_id=payload.session_id
    )
    return {"status": "success", "message": "Security sign-off received, agent resumed."}
```

And the resume handler does the critical work—hydrating the persisted session and applying the state transition atomically:

```python
# app/resume_handler.py

import json
import logging

from google.adk.runners import Runner
from google.genai import types
from app.state_schema import AuditStep

logger = logging.getLogger(__name__)

class AuditResumeHandler:
    def __init__(self, runner: Runner):
        self.runner = runner

    async def receive_remediation_callback(
        self, user_id: str, session_id: str
    ) -> None:
        """Hydrates the session, transitions to REMEDIATION_UNDERWAY, and resumes."""
        async for event in self.runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=types.Content(
                role="user",
                parts=[types.Part.from_text(
                    text="Resume audit: All remediation PRs have been merged."
                )],
            ),
            state_delta={
                "current_step": AuditStep.REMEDIATION_UNDERWAY,
                "pending_signals": [],
            },
        ):
            logger.info(json.dumps({
                "severity": "INFO",
                "message": f"Wake-up execution event: {event}",
                "event": "runner_event",
                "session_id": session_id,
            }))

    async def receive_security_signoff_callback(
        self, user_id: str, session_id: str
    ) -> None:
        """Hydrates the session, transitions to SECURITY_SIGNED_OFF, and resumes."""
        async for event in self.runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=types.Content(
                role="user",
                parts=[types.Part.from_text(
                    text="Resume audit: Security team has signed off on all remediations."
                )],
            ),
            state_delta={
                "current_step": AuditStep.SECURITY_SIGNED_OFF,
                "pending_signals": [],
            },
        ):
            logger.info(json.dumps({
                "severity": "INFO",
                "message": f"Security sign-off event: {event}",
                "event": "runner_event",
                "session_id": session_id,
            }))
```

The key mechanism is `state_delta`. When the webhook fires, `run_async` atomically applies the state transition *before* the agent's next inference call. The model sees `current_step = REMEDIATION_UNDERWAY` in its system prompt and immediately knows to delegate CVE research—no replaying old conversation history, no hallucinated intermediate steps.

The container can scale to zero during the entire idle period. When the webhook arrives, the container spins up, the session hydrates from SQLite, and the agent resumes exactly where it paused.

## Multi-Agent Delegation: Don't Stuff Everything in One Prompt

A compliance audit involves distinct domains of expertise. Stuffing all tools—license scanning, CVE database lookups, security policy checks, report generation—into a single agent's system prompt degrades reasoning quality. ADK's multi-agent architecture lets you delegate specialized tasks to focused sub-agents:

```python
# app/agent.py

from app.tools import lookup_cve_details, assess_vulnerability_risk

cve_agent = Agent(
    name="cve_agent",
    model=Gemini(model="gemini-3.1-flash-lite"),
    instruction="""You are a CVE and Vulnerability Research Agent. Given a list of
    out-of-compliance packages, research known CVEs, assess severity, and recommend
    remediation priorities. Call lookup_cve_details for each package, then
    assess_vulnerability_risk to rank them.""",
    tools=[lookup_cve_details, assess_vulnerability_risk],
)
```

The coordinator delegates to `cve_agent` after remediation is underway. Each sub-agent has a narrow, focused prompt that's less prone to confusion—and you can swap in different models for different tasks. The CVE research agent uses `gemini-3.1-flash-lite` instead of the coordinator's heavier model, which keeps costs down without sacrificing reliability on straightforward database lookups.

## The Three Architectural Shifts Worth Remembering

Whether you use ADK or not, these three ideas are the real takeaway:

1. **Durable memory schemas** instead of dumping raw JSON into a vector database. Explicit state machines make it impossible for the model to hallucinate progress or skip steps. Our audit agent always knows whether it's at `SCAN_COMPLETE` or `SECURITY_SIGNED_OFF` because the state lives in a persisted schema, not in a growing blob of chat history.

2. **Event-driven dormancy gates** instead of active polling or blocked threads. Let the agent truly sleep and wake on webhook signals—whether that's a remediation PR merging or a security team approval. Your compute bill (and your reasoning quality) will thank you.

3. **Multi-agent delegation** instead of monolithic single-agent prompts. Narrow, focused sub-agents with smaller prompts reason better than one bloated coordinator trying to handle license scanning, CVE research, security policy, and report generation all at once.

These patterns apply to any long-running workflow—loan origination, insurance claims, legal review, supply chain tracking, incident response. Anywhere the process stretches across idle time measured in days rather than seconds, the stateless chatbot pattern collapses and these architectural ideas become essential.

## Getting Started

The complete source code for Google's reference agent is available on [GitHub](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/agents/adk/new-hire-onboarding). You can bootstrap a new ADK project with the Agents CLI:

```bash
uv tool install google-agents-cli
```

Then feed a coding agent a high-level prompt describing your own long-running workflow:

```
Create a license compliance audit agent using ADK. It needs to
run as a long-running background process with persistent sessions,
scan repositories for violations, and pause for engineer remediation
and security sign-off before generating a final report.
```

The CLI handles scaffolding, session configuration, and project structure. From there, you iterate—describe what you need, review what it generates, refine.

ADK is still young, and the ecosystem around long-running agent patterns is evolving fast. But the architectural ideas here—explicit state, event-driven resumption, multi-agent delegation—are the right ones. If you're building agents that need to survive more than a single conversation, start here.

---

*Have you tried building long-running agents with ADK or a similar framework? I'd love to hear what's working and what's not—drop a comment or reach out on [LinkedIn](https://www.linkedin.com/in/crawfordjoseph).*
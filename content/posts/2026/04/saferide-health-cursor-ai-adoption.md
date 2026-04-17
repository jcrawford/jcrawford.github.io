---
slug: saferide-health-cursor-ai-adoption
title: "How SafeRide Health Adopted AI in Engineering: Velocity Gains, Budget Lessons, and a Veteran Engineer's Perspective"
excerpt: >-
  After adopting Cursor across our engineering team at SafeRide Health, we saw
  major velocity improvements—but also burned through a third of our yearly AI
  budget in the first month. Here's what we learned about model selection, cost
  management, agentic workflows, and how a 20+ year veteran engineer is adapting
  to the AI era.
featuredImage: /images/content/posts/2026/04/saferide-health-cursor-ai-adoption/featured.jpg
tags:
  - ai
  - engineering
  - developer-tools
  - team-culture
author: joseph-crawford
publishedAt: '2026-04-11'
updatedAt: '2026-04-11'
---

Over the last few months, our engineering team at SafeRide Health has been all-in on AI-powered development using Cursor, the AI-native code editor.

The results have been striking. Our velocity has improved significantly. And I've discovered something unexpected about my own role: **I'm now a full-time code reviewer and mentor to the AI agent**.

Most of my day is spent planning with the agent, reviewing its code, and testing implementations. When set up correctly, the AI agents produce readable, well-structured code. That's the good news.

The challenging news? We learned some expensive lessons about budget management along the way. And honestly, this whole venture has been a humbling experience for someone like me who has spent over 20 years writing his own code.

This is an honest account of what worked, what didn't, and the standards we've now put in place to make AI adoption sustainable for the long term.

## The Velocity Gain Is Real

Let me start with the positive, because it's significant.

Since adopting Cursor, our team moves faster. Not marginally faster—noticeably faster. Features that used to take days now take hours. Refactors that felt daunting become manageable. Boilerplate that used to eat up afternoon productivity gets generated in seconds.

The AI agents handle routine work with impressive competence. They follow patterns. They don't get tired or make careless typos. For a team working on healthcare software where reliability matters, this has been a genuine productivity multiplier.

But velocity isn't free. And the journey to finding the right workflow was more complicated than I expected.

## The Budget Problem: A Third of the Year in Three Months

Here's what happened: within the first month of adoption, **we had already blown through a third of our yearly AI budget**.

The burn rate was alarming. What we expected to last all year was gone in thirty days.

When we noticed the burn rate, we panicked a bit. Then we investigated. What we found was both obvious and embarrassing: **we were all new to AI, and it showed**.

Most engineers on the team—including me initially—were not being selective about what model we were using for what task. We defaulted to the most powerful, most expensive models available, often with high-reasoning modes enabled for tasks that didn't need them.

The problem? We were using high-reasoning models to create simple pull requests on GitHub. That's like calling in a senior architect to move a meeting room whiteboard. Overkill doesn't begin to describe it.

## Why This Happened

I want to be clear: this wasn't negligence. It was inexperience.

When you're new to AI coding tools, it's natural to assume "more powerful model = better results." That intuition isn't entirely wrong, but it's incomplete. The real equation is:

**Right model for the task + appropriate settings = good results without waste**

We skipped the "right model" part. We defaulted to maximum power for everything because we didn't yet know how to differentiate between tasks that need heavy reasoning and tasks that don't.

This is a mishap that was bound to happen to teams new to AI. The important part is what we did next.

## Creating Standards: When to Use High-Thinking Models

Once we understood the problem, we moved quickly to create standards. Here's what we put in place:

### Use High-Thinking Models for:
- Complex architectural decisions
- Multi-file refactors with interdependencies
- Debugging non-obvious issues
- Designing new systems or APIs
- Code that touches critical healthcare compliance logic
- Final verification of implementations

### Use Standard Models for:
- Routine feature implementations
- Unit test generation
- Documentation updates
- Simple bug fixes
- Boilerplate and scaffolding
- GitHub PR descriptions and summaries

### Use Lighter Models (or Tab completions) for:
- Auto-complete while typing
- Small function edits
- Variable renaming
- Formatting and cleanup tasks

The key insight: **being selective about model choice per task is essential**. Not every job needs the smartest model in the room.

## My Workflow: Plan High, Implement Low, Verify High

Over time, I've developed a workflow that balances cost and quality:

1. **Plan high**: I develop plans and do initial research with a high-thinking model. This is where I define scope, constraints, and architectural approach.

2. **Implement low**: I allow a lower, cheaper model to do the actual implementation work. For routine coding, this is more than sufficient.

3. **Verify high**: I have the larger, more capable model review the implementation for edge cases, correctness, and alignment with our standards.

This approach has been cost-effective without sacrificing quality. It leverages the strengths of different models at different stages of the work.

Lately, I've been gravitating toward faster, lighter models for implementation work. They're surprisingly capable for day-to-day coding—good reasoning, noticeably faster response times, and a fraction of the cost. For most implementation work, they strike the right balance.

## The Auto Mode Problem

Here's something I've learned the hard way: **a lot of people using Cursor just leave it on auto mode, and I don't like the results**.

Auto mode produces code that works, but some of it is not very clean or extremely hard to follow and read. The code lacks readability. It gets the job done, but it's not code I'd want to maintain six months from now.

I've become much more intentional about model selection. Auto mode is convenient, but convenience comes at a cost to code quality. For enterprise healthcare software, readability and maintainability matter. I'd rather spend a few extra seconds choosing the right model than deal with confusing code later.

## Building an Agentic Dev Platform

Our workspace setup has evolved significantly since we started.

Initially, we loaded each project into the Cursor workspace individually, working on projects one at a time. We soon learned that when working on one application, **sometimes you need to make modifications in another application for the same task**. This was proving difficult with how we were using it.

So we decided to create what we now call our **agentic dev platform**—a unified workspace that encompasses all our repositories under one roof.

This changed everything. The agents can now:
- Work on multiple projects at once
- Include cross-repository context in research and planning
- Understand how changes in one service affect others
- Plan implementations that span multiple applications

This holistic view has made our AI workflows significantly more effective. The agents aren't working in isolation anymore. They understand the broader system.

## Custom Skills and MCP Integrations

To make the agentic platform work, we've invested heavily in customization.

We've written many of our own **skills** so the agent can understand what application is responsible for what. This contextual knowledge is critical for multi-repository work.

We've also integrated connections to **Jira, GitHub, and other services through MCP (Model Context Protocol) servers**. These integrations allow the agents to:
- Pull context from Jira tickets
- Reference existing GitHub PRs and issues
- Access documentation and runbooks
- Understand deployment pipelines

The result is an AI assistant that actually understands our ecosystem, not just generic coding patterns.

## Evaluating Other Systems: OpenClaw in the Cloud

We're not putting all our eggs in the Cursor basket. Our DevOps team is currently evaluating **OpenClaw in the cloud** as a way to complete long-running tasks such as:
- Refactoring large portions of code
- Upgrading project dependencies
- Multi-step migration work

I run OpenClaw on my local system, so I'm familiar with it. It looks cool and fun. But here's the catch: we're currently using cloud-hosted open-source models with it, which are **not as fast as Cursor's optimized models**.

For long-running background tasks, OpenClaw might make sense. For day-to-day development velocity, Cursor has been our primary tool. We're still evaluating where each fits in our workflow.

## Code Review Is Non-Negotiable

This is where I need to be firm.

**A lot of people don't review AI-generated code. They just let AI do it and call it a day—if the feature works, it works.**

I find that hard to believe when working in a large enterprise application. Just shipping generated code to production with a mild test does not guarantee that someplace else in the application wasn't broken by the new implementation.

Code review is non-negotiable. Full stop.

When an AI generates code, I review it like I would for any other engineer—maybe more rigorously. AI can be confidently wrong in ways that are hard to spot at a glance. It can introduce subtle bugs, miss edge cases, or make assumptions that don't hold in production.

For healthcare software, where reliability and correctness directly impact patient safety, skipping review isn't an option. The AI is a collaborator, not a replacement for human judgment.

## The Veteran Engineer's Perspective

I need to be honest about something personal.

This AI venture is all new to me after being an engineer for over 20 years writing his own code. For two decades, I was the one typing out implementations, debugging line by line, and feeling the code under my fingers.

Now? **It feels like I'm more distant from the code since I'm not the one writing it anymore**.

That's a strange feeling. Part of me misses the hands-on work. Part of me worries that I'm losing touch with the craft. And trying to keep up with all the changes as AI moves this fast is quite difficult.

The landscape shifts every few months. New models, new tools, new best practices. What worked six months ago might be obsolete today. Staying current requires constant learning, and at this stage in my career, that's both exciting and exhausting.

But here's what I've come to accept: **my value isn't in typing code anymore. It's in judgment, context, and oversight**.

The AI can write code faster than I ever could. But it can't understand the business context like I can. It can't anticipate how a change will affect a downstream system three teams over. It can't make the judgment call on whether a feature is worth the technical debt it introduces.

That's my role now. And while it feels different, I'm coming to see it as evolution, not loss.

## Practical Tips for Teams New to AI Coding Tools

If your team is considering or just starting with AI coding tools like Cursor, here's what I'd recommend based on our experience:

### 1. Start with a budget conversation
Before anyone writes a line of AI-assisted code, talk about costs. Understand the pricing model. Set expectations. Decide on a monthly or quarterly budget and make sure everyone knows what it is.

### 2. Create a model selection guide early
Don't wait until you've burned through your budget to create standards. Document which models are appropriate for which tasks from day one. Update it as you learn.

### 3. Track usage visibly
Make budget consumption visible to the whole team. When everyone can see the burn rate, everyone becomes more thoughtful about their choices.

### 4. Invest in prompt training
The quality of AI output depends heavily on how you ask. Invest time in teaching your team how to frame tasks, provide context, and set constraints. This pays dividends in both cost and quality.

### 5. Review AI code like any other PR
Don't skip code review just because an AI wrote it. If anything, be more rigorous. AI can be confidently wrong in ways that are hard to spot at a glance.

### 6. Build cross-repository context
If you work on multiple applications, consider creating a unified workspace. Agents perform better when they understand the full system, not just isolated projects.

### 7. Customize with skills and integrations
Invest in custom skills and MCP integrations that teach the AI about your specific ecosystem. Generic AI is useful. Context-aware AI is transformative.

### 8. Expect a learning curve
Your team will make mistakes. You'll overspend. You'll use the wrong model for a task. That's normal. The key is to learn quickly and adjust.

### 9. Stay flexible about tools
Don't lock into one tool forever. Evaluate alternatives. We're looking at OpenClaw for long-running tasks while using Cursor for daily work. Different tools for different jobs.

### 10. Acknowledge the emotional side
For veteran engineers, this shift can feel disorienting. It's okay to miss writing your own code. It's okay to feel distant from the craft. Talk about it. Adapt intentionally.

## The Bottom Line

Adopting AI in our engineering department has been worth it. The velocity improvements are real. The code quality—when managed correctly—has been good. And the shift in my role—from writer to reviewer and mentor—has been surprisingly rewarding, even if it feels different than what I'm used to.

But it required us to learn some lessons the hard way. The budget burn was a wake-up call. Creating standards around model selection was necessary work. Building an agentic platform with custom skills took significant investment. And being intentional about AI usage is now part of our team culture.

If you're on a similar journey, my advice is simple: **embrace the technology, but manage it intentionally**. AI coding tools are powerful. They're also expensive if used without thought. The teams that win will be the ones that treat this as a strategic adoption, not just a productivity hack.

We're still learning. We're still adjusting. But I'm confident we're moving in the right direction.

And I'm excited to see where this goes next—even if keeping up with the pace of change is the hardest part of being an engineer right now.

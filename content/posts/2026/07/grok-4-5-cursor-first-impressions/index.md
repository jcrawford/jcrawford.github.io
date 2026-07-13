---
slug: grok-4-5-cursor-first-impressions
title: "Grok 4.5 in Cursor: First Impressions of the New Frontier Coding Model"
excerpt: "SpaceXAI and Cursor shipped Grok 4.5 — a jointly-trained model priced at a fraction of the competition. After a few days of real work, here's how it holds up against the frontier models I've been using."
featuredImage: /images/content/grok-4-5-cursor-first-impressions/hero.jpg
tags:
  - ai
  - development
  - developer-tools
author: joseph-crawford
publishedAt: "2026-07-10"
draft: false
---

On July 8th, SpaceXAI and Cursor jointly released Grok 4.5 — the first model built from the ground up since SpaceX acquired Cursor in mid-June for $60 billion in stock. It's a mixture-of-experts model trained on trillions of tokens of Cursor developer-interaction data, with a deliberately broad training mix that goes beyond pure coding into STEM, research, and knowledge work.

I've been using it for real work over the last few days, and I want to share my initial impressions.

## What Makes Grok 4.5 Different

The headline here isn't just benchmark numbers — it's the story behind the model. Cursor contributed trillions of tokens of developer-interaction data to the training pipeline. That means Grok 4.5 learned not just from existing codebases, but from how developers actually work with agents: the back-and-forth, the tool calls, the recovery from mistakes, the verification of results.

This is qualitatively different from training on GitHub scraped code alone. The model has seen what real agent sessions look like, and it shows in how it behaves.

Cursor also applied reinforcement learning on difficult problems in realistic environments — the kind of problems where even frontier models fail. They built a distributed agent system to construct and verify these training environments at scale, which is a genuinely interesting approach to the data wall problem. As models improve, existing tasks stop teaching them anything new, so you have to keep raising the difficulty floor.

## The Benchmark Picture

Grok 4.5 doesn't top every leaderboard, but it doesn't need to. Here's where it stands against the other frontier models:

| Model | SWE-Bench Pro | Terminal-Bench 2.1 | DeepSWE 1.1 |
|-------|--------------|--------------------| ------------|
| Fable 5 (max) | 80.4% | 84.3% | 70% |
| GPT-5.5 (xhigh) | 58.6% | 83.4% | 67% |
| Opus 4.8 (max) | 69.2% | 78.9% | 59% |
| **Grok 4.5** | **64.7%** | **83.3%** | **53%** |

On Terminal-Bench 2.1 — complex command-line tasks — Grok 4.5 scores 83.3%, nearly matching GPT-5.5 at 83.4% and trailing Fable 5 by a single point. On SWE-Bench Pro it beats GPT-5.5 and Opus 4.8 in standard configurations. On DeepSWE 1.1, which measures real GitHub issue resolution, it trails the leaders more noticeably.

Artificial Analysis ranks it fourth on their Intelligence Index, behind Fable 5, GPT-5.5, and Opus 4.8 — but it gained 16 points over Grok 4.3, putting it close to frontier territory. And on the Coding Agent Index, Grok 4.5 running in Grok Build scores 76 points, matching GPT-5.5 in Codex and trailing Fable 5 in Claude Code by just one point.

The benchmark gap is real, but it's narrow — and it's not the whole story.

## The Pricing Story Has a Catch

The headline pricing is where Grok 4.5 makes its strongest case — but there's a tiered structure that doesn't show up in the marketing materials, and it matters more than you might think.

### Standard pricing (up to 200K context)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Cached Input |
|-------|----------------------|----------------------|--------------|
| **Grok 4.5** | **$2** | **$6** | **$0.50** |
| Grok 4.3 | $1.25 | $2.50 | $0.20 |
| Opus 4.8 | $5 | $25 | — |
| GPT-5.5 / GPT-5.6 | $5 | $30 | — |
| Fable 5 | $10 | $50 | — |

At standard context sizes, Grok 4.5 is 2.5× cheaper on input and over 4× cheaper on output than Opus 4.8. Compared to Fable 5, it's 5× cheaper on input and over 8× cheaper on output. Cached input drops to $0.50 per million — a 75% discount — which adds up fast in agentic workflows where the same system prompt and codebase context get sent repeatedly.

It's worth noting that Grok 4.5 is actually *more expensive* than its own predecessor, Grok 4.3 ($1.25/$2.50), which also offers a 1M token context window versus Grok 4.5's 500K. The "lower cost" framing is relative to the frontier competition — Opus, GPT, Fable — not to SpaceXAI's own lineup. If you're doing general-purpose work that doesn't need the Cursor-tuned coding specialization, Grok 4.3 at half the price is still the better deal.

### Long-context surcharge (above 200K tokens)

Here's the part that doesn't make the headline: SpaceXAI applies a high-context surcharge when you exceed 200K tokens of context. This follows the same tiered pattern they introduced with Grok 4.3, where long-context pricing doubled from $1.25/$2.50 to $2.50/$5.00 above the 200K threshold.

For Grok 4.5, the model supports up to 500K tokens of context — but once you cross 200K, you're paying a premium. The exact surcharge multiplier hasn't been spelled out as clearly in the Grok 4.5 docs as it was for Grok 4.3, but the structure is consistent across the Grok family: expect roughly 2× the standard rates when you're in the long-context tier.

That means a large-context request could effectively cost closer to $4/M input and $12/M output — still cheaper than Opus 4.8's $5/$25, but not by the dramatic margin the standard pricing table suggests.

### Why this matters for real workflows

If you're using Grok 4.5 through Cursor, you might never hit this tier. Most agent sessions stay well under 200K tokens, and Cursor's own infrastructure manages context windowing. The model also uses 4.2× fewer tokens than Opus 4.8 on SWE-Bench Pro tasks, according to SpaceXAI — so even at the long-context rate, the total token consumption is lower.

But if you're calling the API directly for large-codebase analysis, long-document processing, or multi-file refactors that push past 200K tokens, you need to budget for the surcharge. A coding agent that loads a 300K-token codebase context and generates 50K tokens of output would cost roughly $1.20 in standard pricing — but at the long-context rate, that same request could cost closer to $2.40. Still cheap compared to the competition, but not the $0.70 you'd calculate from the headline rates alone.

The practical takeaway: for most Cursor-based workflows, the standard pricing is what you'll pay. For API users working with large contexts, model your costs with the surcharge in mind. The price advantage holds, but the gap narrows at scale.

### The token efficiency multiplier

The real cost story isn't just per-token pricing — it's how many tokens the model actually consumes. According to Artificial Analysis, Grok 4.5 uses 4.2× fewer tokens than Opus 4.8 on SWE-Bench Pro tasks (roughly 16,000 vs 67,000 tokens per task). It also averages just 1.9 million tokens per agentic task, compared to 6.2 million for GPT-5.5 and 7.2 million for Fable 5.

Lower per-token pricing *and* fewer tokens per task means the total cost gap compounds. Per agentic coding task, Grok 4.5 in Grok Build costs $2.49, compared to $5.07 for GPT-5.5 in Codex and $11.80 for Fable 5 in Claude Code. That's not a marginal difference — it's a fundamentally different cost structure for high-volume agent work.

There's also a fast variant available at $4/M input and $18/M output if you need additional speed, though the standard model's 80 tokens per second is already faster than most competitors in this tier.

For anyone running agents at scale, the math is clear: Grok 4.5's standard pricing is aggressive, the cached-input discount is meaningful for repetitive agent loops, and the token efficiency means your actual bill lands well below what the per-token rates suggest. Just keep the long-context surcharge in your mental model if you're pushing past 200K tokens.

## My Experience So Far

I've been using Grok 4.5 in Cursor for the last few days on real work — not toy benchmarks, not carefully constructed test cases, but the actual day-to-day engineering tasks I get paid to do.

Here's what I've found:

**Code quality is comparable to frontier models.** The code Grok 4.5 produces is clean, well-structured, and idiomatic. It reads like code written by someone who understands the codebase, not code generated by a model that's pattern-matching against a training corpus. It makes reasonable architectural decisions and doesn't over-engineer solutions.

**It's fast.** SpaceXAI reports 80 tokens per second, and in practice that feels right. Responses come back quickly, and agent runs don't feel like they're stalling the way heavier models sometimes do. When I'm in a flow state, that speed matters — the gap between asking a question and getting an answer stays short enough that I don't lose my train of thought.

**It's cheap.** I've been watching my usage numbers, and the cost per task is noticeably lower than what I was seeing with Claude and GPT models. For the kind of iterative, high-volume agent work that dominates my day, that adds up fast.

**It handles multi-file changes well.** This is where the Cursor training data really seems to pay off. The model navigates across files, makes coordinated changes, and seems to understand the broader context of a codebase rather than treating each file in isolation.

**Tool use feels natural.** The agent loops — investigating, running commands, checking results, adjusting — feel smooth and purposeful. The model recovers from errors gracefully and doesn't get stuck in repetitive loops the way earlier models sometimes did.

## The Caveats

I want to be clear: a few days of usage is a first impression, not a verdict. The things that matter most for a coding model only show up over time:

- **Consistency across different codebases.** I've tested it in my primary work environment, but every codebase has its own conventions, quirks, and edge cases. A model that's great in one project might fumble in another.

- **Long-running agent tasks.** The benchmarks show strong performance on Terminal-Bench, but real agentic work can stretch over hours. I haven't pushed it hard enough in that regime yet.

- **Edge cases and unusual languages.** My work is mostly TypeScript, JavaScript, and PHP. I haven't tested it on less common languages or frameworks.

- **Hallucination rate.** Artificial Analysis flagged that Grok 4.5's hallucination rate jumped from 25% to 54% — the model knows more, but it's also more confident when it's wrong. That's worth watching. In practice I haven't hit obvious hallucinations yet, but a few days isn't enough to evaluate this rigorously.

I'll need to use this model for a while to see how well it performs over time. First impressions are encouraging, but they're still first impressions.

## The Bigger Picture

Grok 4.5 represents something interesting beyond the model itself. The Cursor acquisition gave SpaceXAI something that pure AI labs don't have: a direct pipeline into how developers actually work. That training data advantage is compounding — every Cursor session makes the next model better.

The pricing strategy is also worth noting. By coming in at $2/$6 per million tokens, SpaceXAI is making a clear play for volume. They're betting that being "close enough" on benchmarks while being dramatically cheaper will win developer mindshare. Given how cost-sensitive agentic workflows are — where a single task might consume millions of tokens — that bet looks reasonable.

For the first time in a while, I'm genuinely uncertain about which model I'll default to next month. That competition is good for everyone.

## Should You Try It?

If you're already a Cursor user, Grok 4.5 is available right now across desktop, web, iOS, CLI, and their SDK. Individual and team plans include significant usage with double usage for the first week. There's also a fast variant at $4/M input and $18/M output if you need additional speed.

If you're not on Cursor but you're doing agentic coding work, the API pricing alone makes it worth a look. The model supports function calling, structured outputs, and reasoning, with a 500K token context window. It's available in `us-east-1` and `us-west-2`.

My recommendation: try it on a real task, not a benchmark. Write a feature. Fix a bug. Refactor something. See how it feels in your codebase, with your conventions, under your time pressure. That's the test that actually matters.

I'm going to keep using it and will share a more thorough follow-up once I have a few weeks of data. But my initial read is that Grok 4.5 is a legitimate frontier-tier coding model at a price point that changes the math on what agentic workflows cost to run. That's a meaningful combination.
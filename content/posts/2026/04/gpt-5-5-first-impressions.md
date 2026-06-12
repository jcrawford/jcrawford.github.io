---
slug: gpt-5-5-first-impressions
title: "GPT-5.5 First Impressions: What OpenAI's Latest Model Means for Developers"
excerpt: "OpenAI just shipped GPT-5.5 with big claims about agentic coding, efficiency, and real-world autonomy. I haven't tried it yet—but here's what the announcement, benchmarks, and early signals tell us before Monday's hands-on test."
featuredImage: /images/content/gpt-5-5-first-impressions-hero.png
tags:
  - AI
  - GPT
  - Developer Tools
  - OpenAI
  - Machine Learning
author: joseph-crawford
publishedAt: "2026-04-26"
featured: true
draft: false
---

OpenAI released GPT-5.5 this week, and the claims are bold: their smartest model yet, a step-change in agentic coding, and—critically—no speed penalty over GPT-5.4. That last point caught my eye more than anything else.

I haven't tried it yet. I'll be kicking the tires on Monday and will update this post with real hands-on findings after that. For now, this is a first-pass look at what OpenAI announced, what the benchmarks show, and where I'm skeptical versus optimistic.

## What GPT-5.5 Claims to Deliver

The headline pitch is deceptively simple: give GPT-5.5 a messy, multi-part task and trust it to plan, use tools, check its work, and keep going. That's the agentic promise in a sentence. But the details matter more.

OpenAI is emphasizing four areas where GPT-5.5 shows the biggest gains:

1. **Agentic coding** — not just generating snippets, but holding context across large codebases, reasoning through ambiguous failures, and carrying changes through to surrounding files.
2. **Computer use** — operating software and moving across tools to finish a task end-to-end.
3. **Knowledge work** — research, data analysis, document creation.
4. **Scientific research** — early-stage, but OpenAI is clearly signaling this direction.

The model is available now in ChatGPT and Codex for Plus, Pro, Business, and Enterprise users. GPT-5.5 Pro (the extended-thinking variant) is rolling out to Pro, Business, and Enterprise. API access went live April 24th.

## The Benchmark Numbers

OpenAI published a comparison table against GPT-5.4, Claude Opus 4.7, and Gemini 3.1 Pro. A few stand out:

| Benchmark | GPT-5.5 | GPT-5.4 | Claude Opus 4.7 | Gemini 3.1 Pro |
|---|---|---|---|---|
| Terminal-Bench 2.0 | 82.7% | 75.1% | 69.4% | 68.5% |
| Expert-SWE (Internal) | 73.1% | 68.5% | — | — |
| GDPval (wins/ties) | 84.9% | 83.0% | 80.3% | 67.3% |
| OSWorld-Verified | 78.7% | 75.0% | 78.0% | — |
| FrontierMath Tier 1–3 | 51.7% | 47.6% | 43.8% | 36.9% |
| FrontierMath Tier 4 | 35.4% | 27.1% | 22.9% | 16.7% |
| CyberGym | 81.8% | 79.0% | 73.1% | — |

A few observations:

- **Terminal-Bench 2.0** is the most relevant benchmark for anyone doing real development work. It tests complex command-line workflows that require planning, iteration, and tool coordination. GPT-5.5's 82.7% is a meaningful jump over GPT-5.4's 75.1%, and it's a wide margin over the competition.
- **FrontierMath** results are interesting—Tier 4 (the hardest problems) shows a leap from 27.1% to 35.4%, which suggests genuine reasoning gains rather than shallow pattern matching.
- **OSWorld** shows GPT-5.5 and Claude Opus 4.7 roughly neck-and-neck at ~78%, so the "computer use" claim isn't a blowout.

The missing data is worth noting. OpenAI didn't publish GPT-5.5 Pro numbers for Terminal-Bench, Expert-SWE, OSWorld, Toolathlon, or CyberGym, which makes it hard to evaluate the Pro variant's real-world coding edge. And we all know benchmarks are benchmarks—what matters is whether the model holds up in an actual Monday-morning codebase.

## Speed and Efficiency: The Quiet Story

Here's the claim that might matter most: GPT-5.5 matches GPT-5.4's per-token latency while delivering higher intelligence. Larger models are typically slower to serve, so if OpenAI actually pulled this off, it's a genuine engineering achievement.

On top of that, GPT-5.5 reportedly uses significantly fewer tokens to complete the same Codex tasks. According to OpenAI, it delivers state-of-the-art coding intelligence at roughly half the cost of competitive frontier coding models on the Artificial Analysis Coding Index.

Fewer tokens + same latency + better output = a model that changes the economics of AI-assisted development. If it holds up in practice.

## What Early Testers Are Saying

OpenAI shared quotes from early-access partners, and a few are worth examining:

- **Dan Shipper (Every)** described GPT-5.5 as "the first coding model I've used that has serious conceptual clarity." He tested it by rewinding a real debugging scenario—GPT-5.4 couldn't solve it; GPT-5.5 could.

- **Pietro Schirano (MagicPath)** reported that GPT-5.5 merged a branch with hundreds of frontend and refactor changes into a substantially-changed main branch in one shot, in about 20 minutes.

- Engineers at NVIDIA described losing access to GPT-5.5 as feeling "like I've had a limb amputated"—which is either the strongest endorsement I've seen for a model or the most dramatic metaphor of the week.

Take all of this with the usual grain of salt. These are hand-picked testimonials from partners who had early access. They're data points, not evidence.

## Where I'm Skeptical

A few things give me pause before declaring a new era:

**"Agentic" is doing a lot of heavy lifting.** OpenAI's framing keeps returning to the idea that you can hand GPT-5.5 a messy task and trust it to run. That's a high bar. In my experience, the gap between "model handles this in a benchmark" and "model handles this in my codebase without supervision" is wide. I'll be testing specifically for that gap on Monday.

**Safety claims need real scrutiny.** OpenAI says this is their strongest set of safeguards to date, with nearly 200 early-access partners providing feedback. That's good to hear, but the system card will need close reading—especially around cybersecurity and biology capabilities. I haven't had time to dig into it yet, but I plan to.

**Pro variant numbers are sparse.** The benchmark comparison mostly covers the standard model. If you're paying for Pro-tier access, you're doing it for extended reasoning, and the data supporting that use case is thin in the announcement.

**The competition isn't standing still.** Claude Opus 4.7 ties GPT-5.5 on OSWorld and beats it on BrowseComp (90.1% vs 84.4%). Gemini 3.1 Pro is competitive on several axes. This isn't a runaway.

## What I'll Be Testing On Monday

When I get hands-on with GPT-5.5, here's what I'm focusing on:

1. **Long-horizon coding tasks.** Can it refactor a multi-file project end-to-end without losing context or producing inconsistent changes?
2. **Debugging complex failures.** Shipper's "conceptual clarity" claim is compelling. Does GPT-5.5 actually diagnose root causes, or does it pattern-match symptoms?
3. **Token efficiency.** Does it genuinely solve tasks with fewer tokens, or does the efficiency only show up in OpenAI's curated benchmarks?
4. **Speed in practice.** Latency claims are easy to make. I'll time real interactions against GPT-5.4 on the same tasks.
5. **Agentic reliability.** The "trust it to keep going" promise is the one most likely to break in real use. I want to see where it stops, where it hallucinates, and where it actually delivers.

## Bottom Line (For Now)

GPT-5.5 looks like a genuine step forward on paper. The benchmark jumps are real, the efficiency story is compelling, and the early tester feedback—while curated—is directionally consistent with the numbers.

But "on paper" is exactly where this assessment lives right now. The difference between a model that looks good in a comparison table and one that changes your daily workflow is usually found in the small, frustrating gaps between promise and practice.

I'll update this post after testing on Monday. If GPT-5.5 delivers even half of what it claims, it'll be a meaningful upgrade for developers using AI in their daily work. If it doesn't, the gap between the benchmark numbers and lived experience will be a story worth telling in its own right.

Stay tuned.

---

*This is a draft. I'll revise with hands-on findings after testing GPT-5.5 on Monday, April 28.*
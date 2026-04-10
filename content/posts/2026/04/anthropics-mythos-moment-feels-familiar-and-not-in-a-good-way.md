---
slug: "anthropics-mythos-moment-feels-familiar-and-not-in-a-good-way"
title: "Anthropic’s Mythos Moment Feels Familiar, and Not in a Good Way"
excerpt: "Anthropic’s Project Glasswing and Mythos Preview may point to real advances in AI-assisted security work, but for developers and tool builders the louder story is how ‘too powerful’ narratives can blur into marketing while access, integrations, and product decisions remain the issues that actually shape day-to-day use."
featuredImage: /images/content/anthropics-mythos-moment-feels-familiar-and-not-in-a-good-way/featured.jpg
tags:
  - ai
  - developer-tools
  - work
  - opinions
author: joseph-crawford
publishedAt: "2026-04-10"
updatedAt: "2026-04-10"
---

# Anthropic’s Mythos Moment Feels Familiar, and Not in a Good Way

Anthropic’s new **Project Glasswing** announcement is being framed in the biggest possible terms.

The company says **Claude Mythos Preview** has reached a level of capability where it can find and exploit software vulnerabilities at a level that surpasses nearly all human experts, and it has wrapped that claim in a major security initiative with big-name partners and a lot of apocalyptic language about what happens if these capabilities spread too widely.

Some of that may be real. If frontier models are genuinely becoming much better at vulnerability research, that matters. It matters for defenders, for open source maintainers, for cloud platforms, and for anyone building software that has to survive in the real world.

But it also feels very familiar.

If you have been around AI long enough, this has a strong echo of the earlier moment when OpenAI framed GPT-2 as something close to **too dangerous to release**. Back then, the combination of capability claims, safety language, partial access, and public suspense did not just start a technical discussion. It also generated an enormous amount of attention. Safety may have been part of the story, but hype was definitely part of the outcome.

From my perspective, Anthropic’s Mythos and Glasswing moment lands in that same uncomfortable zone where legitimate safety concerns and attention economics start to blur together.

## The part worth taking seriously

To be fair, Anthropic is not talking about a toy use case.

In its Glasswing announcement, the company describes Mythos Preview as a limited-access model being used for defensive security work with a long list of major partners. The core claim is that models are approaching, or have reached, a point where they can uncover serious software vulnerabilities at a level that changes the economics of cyber defense.

That is not an absurd thing to worry about. It is probably one of the more credible high-stakes arguments for frontier model risk, because software security is a domain where automation, scale, and asymmetry already matter a lot.

If an AI system can consistently surface dangerous bugs faster than most humans can, then yes, the safety questions become more concrete than the usual vague talk about "transformative AI." That deserves scrutiny.

## But the marketing pattern is hard to miss

What I keep coming back to is the presentation.

Whenever an AI lab starts telling the world that it has something unusually powerful, unusually risky, unusually restricted, and only carefully available to a select group, the message does not stay inside the safety box. It becomes branding. It becomes status. It becomes a way of saying: **we are holding the scary future in our hands**.

That is why this reminds me so much of the GPT-2 era.

When OpenAI initially withheld the full GPT-2 model in 2019, the official rationale centered on concerns about misuse. That move kicked off a much bigger public narrative: if the lab was nervous about releasing it, then the model must be extraordinary. Whether or not that was the complete intention, it absolutely amplified the mystique.

The same dynamic is easy to see now. If you announce that your unreleased system can find major vulnerabilities across operating systems and browsers, and you pair that with national-security-adjacent language, the result is not just caution. The result is attention.

From where I sit, a lot of this feels like the hype train trying to put Anthropic back in the spotlight.

That does not mean the underlying work is fake. It means I do not think the safety framing can be separated cleanly from the marketing value of sounding uniquely powerful.

## What developers actually care about

For researchers, policymakers, and security leaders, the headline may be about dangerous capability.

For developers and tool builders, the practical questions are usually much less theatrical:

- Can I access the model in a stable, supported way?
- Can I integrate it into the tools I actually use?
- Are the product boundaries clear?
- Will the platform keep changing its rules in ways that break downstream tooling?
- If I build on top of this, am I building on rock or on sand?

Those questions matter more than myth-making.

A model can be impressive and still be frustrating to work with. A company can talk about safety and still make product choices that feel hostile to the ecosystem around it. And for people building real tools, those decisions often matter more than whatever frontier story is dominating the week.

## My frustration with Anthropic is not abstract

Part of why I am skeptical here is that my view is shaped less by press releases and more by tool-building experience.

From my perspective, Anthropic has made product decisions that are hard to square with the idea of wanting a healthy developer ecosystem around its models. One example is the way OAuth access has felt increasingly constrained around **Claude Code** rather than opened up across the broader product surface. Another is the set of restrictions and policy choices that, in practice, make third-party tooling harder to integrate cleanly.

If you are building tools instead of screenshots, those choices are not minor details. They shape what is possible.

And that is where some of my frustration comes from. I do not just want models that benchmark well or generate headlines. I want products that developers can actually depend on, integrate with, and build around without feeling like the rug may get pulled out from under them.

That is also why this moment lands a little sideways for me. It is hard to get swept up in messaging about a uniquely powerful future when the present-day developer experience still feels narrower and more brittle than it should.

## Safety talk is easy, product trust is harder

There is a broader pattern in AI right now where companies can get a lot of mileage out of saying some version of:

- this model is extraordinary
- this model is risky
- this model requires careful stewardship
- trust us to manage access

Sometimes that is true. Sometimes it is partly true. Sometimes it is true enough to justify caution, while still being extremely convenient from a positioning standpoint.

What is harder, and much more important, is building trust through boring things:

- consistent access models
- clear API and auth policies
- stable integrations
- predictable product direction
- respect for developers building adjacent tools

Those are not as headline-friendly as “too dangerous to release.” But they are what determine whether a platform is actually useful.

## The part I do agree with

I do not want to flatten this into “everything is fake.” That would be lazy.

I think there is a serious conversation to have about AI systems becoming genuinely useful, and potentially genuinely dangerous, in security contexts. Glasswing may end up being an important signal that model capabilities in vulnerability discovery are crossing into a new category. If that turns out to be true, developers should pay attention.

But paying attention does not require surrendering skepticism.

In fact, skepticism is exactly what this moment needs, especially from the people who build tools and have to live with the consequences of platform decisions after the press cycle moves on.

## What I would rather see

I would rather see AI companies spend less time performing the aura of danger and more time earning developer trust.

Show the work where you can. Be precise about what is known, what is measured, and what is still uncertain. Do not turn access restrictions into mythology. Do not expect builders to confuse exclusivity with excellence. And if you want developers to take your platform seriously, make the product more open, more stable, and easier to integrate, not just more dramatic to talk about.

That is the standard I care about.

Not whether a company can tell the most compelling story about standing between the world and a model that is supposedly too powerful for ordinary hands.

Because we have seen that story before.

And if the last few years of AI have taught us anything, it is that the gap between **what gets marketed** and **what actually helps builders** can be very large.

## Closing thought

Project Glasswing may point to something real. Mythos may be a meaningful step in AI-assisted security work. I am open to that.

But from my perspective, the bigger lesson is not just about whether Anthropic has a powerful system. It is about how quickly the industry falls back into a familiar script where safety language, restricted access, and prestige signaling reinforce each other.

Developers should be able to hold two thoughts at once:

1. these capabilities may matter
2. the hype machine is still the hype machine

That balance feels healthier than either naive enthusiasm or reflexive dismissal.

And right now, it feels like exactly the balance this conversation needs.


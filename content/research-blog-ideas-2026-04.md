# Blog Content Ideas — Research Results (April 2026)

**Researcher:** Lyra (subagent)  
**Date:** 2026-04-14  
**For:** Joseph's blog at ~/Projects/jcrawford.github.io

---

## Summary of Existing Content

**Recent Posts (2026):**
- NASA Artemis II coverage (April 13) — comprehensive, personal, technical
- SafeRide Health Cursor AI adoption (April 11) — honest budget lessons, agentic workflows
- Anthropic critique (April 10) — skeptical take on Mythos/Glasswing hype
- Running this blog with an AI team (April 10)
- WordPress plugin supply chain attack (April 14)

**Reviews Already Published:**
- Total TypeScript Pro Complete (just published April 14)
- GitHub Copilot, WebStorm, VS Code, Docker Desktop, Figma, Notion, Postman
- Hardware: Keychron K8 Pro, iPhone 15 Pro, MacBook Pro M3, monitors, audio gear
- Voyager keyboard (32KB — major deep dive)

**Topics Well-Covered:** TypeScript learning, AI in engineering, space/NASA, developer tools, product reviews

---

## Recommended Content Ideas

### 📝 STANDALONE ARTICLES (3 ideas)

---

#### 1. "TypeScript 5.8's Quiet Killer Feature: Why Return Expression Checks Matter"

**Why timely:** TypeScript 5.8 just shipped with granular checks for branches in return expressions — a feature that catches real bugs but flew under the radar compared to flashier releases.

**Unique angle:** Most coverage will be dry release notes. Joseph's take: show actual bugs this would have caught in production code at SafeRide Health, with before/after examples. Tie it to his "20+ year veteran learning AI" voice — this is the kind of unglamorous feature that actually saves hours of debugging.

**Outline:**
- The bug that got away (real example from his codebase)
- How the new check works (technical but accessible)
- Why this matters more than yet another syntax sugar feature
- Practical migration tips for teams

**Target word count:** 1,800–2,400 words

---

#### 2. "I Tested Three AI Code Reviewers on My Own PRs: Here's What Each Missed"

**Why timely:** LogRocket just published "I let Claude review my PRs" (April 7). Cursor's Bugbot now self-improves with learned rules (April 8). GitHub Copilot continues evolving. This is a hot conversation.

**Unique angle:** Joseph has the perfect position to do this credibly:
- He's written reviews of Copilot and now uses Cursor daily
- He works in healthcare software where mistakes matter
- He has the skeptical-but-pragmatic voice from his Anthropic post

Test: Claude Code Review, Cursor Bugbot, GitHub Copilot PR summaries — all on the same real PRs from SafeRide Health. Report what each caught, what slipped through, and which he'd actually trust.

**Outline:**
- Setup: the PRs I tested (real examples, anonymized if needed)
- Claude Code Review: what it flagged, what it missed
- Cursor Bugbot: the learned rules feature in practice
- GitHub Copilot: how it compares after a year of use
- The one thing none of them caught (the real lesson)
- My verdict: which tool for which job

**Target word count:** 2,200–3,000 words

---

#### 3. "The AI Testing Trap: Why I'm Not Letting Agents Write My Unit Tests"

**Why timely:** LogRocket published "I replaced my entire test suite with AI agents: Here's what actually broke" (April 10). This is a controversial, conversation-starting topic.

**Unique angle:** Push back against the hype. Joseph's voice is perfect for this — he's all-in on AI for velocity but learned expensive lessons about blind trust (see his Cursor budget post). This is the natural follow-up: "We use AI for everything, but not this."

**Outline:**
- The temptation: why AI-generated tests look so good
- The failure modes I've seen (specific examples)
- What tests need that AI doesn't understand yet
- Where AI *does* help in testing (be fair — test data generation, boilerplate)
- My team's actual testing workflow with AI in the loop
- The line I won't cross (yet)

**Target word count:** 2,000–2,600 words

---

### 📚 SERIES IDEAS (2 ideas)

---

#### 4. "Building a Self-Driving Codebase: A Practical Guide" (3-part series)

**Why timely:** Cursor's blog post "Towards self-driving codebases" (Feb 2026) is aspirational. Box, NVIDIA, Salesforce, and PlanetScale are all publishing customer stories about agent-driven workflows. But there's no practical "how to actually start" guide.

**Unique angle:** Joseph is living this at SafeRide Health. He built an "agentic dev platform" unifying all repos. He has real experience, not just theory. This series documents the actual journey — mistakes, costs, wins.

**Part 1: The Foundation — What "Self-Driving" Actually Means**
- Define the spectrum: autocomplete → agent-assisted → agent-led → self-driving
- What SafeRide Health actually built (architecture overview)
- The infrastructure you need before agents can be trusted
- Cost realities (tie back to his budget burn lesson)

**Part 2: Agent Workflows That Actually Work**
- The Plan High, Implement Low, Verify High workflow (from his Cursor post)
- Specific prompts and patterns that work
- When to escalate to high-thinking models (the decision tree)
- Real examples: features built this way

**Part 3: The Human Role — Reviewer, Mentor, and Safety Net**
- Joseph's discovery: "I'm now a full-time code reviewer and mentor to the AI agent"
- What code review looks like when AI writes the first draft
- Catching the subtle bugs AI misses
- Building trust without going blind

**Target word count:** 2,500–3,000 words per part

---

#### 5. "WordPress Under Attack: A Developer's Security Audit Series" (2-part series)

**Why timely:** Joseph just published about the 2026 WordPress plugin supply chain attack (April 14). This is a natural expansion — turn one post into a practical security series for WordPress developers.

**Unique angle:** Most WordPress security content is either fear-mongering or superficial. Joseph can go deep: actual audit steps, tools, and hardening that matters.

**Part 1: Auditing Your WordPress Site Like a Security Engineer**
- The checklist I use (concrete, actionable)
- Tools that actually help (not just plugin recommendations)
- Supply chain risks: themes, plugins, and the hidden dependencies
- What the 2026 attack taught us

**Part 2: Hardening Without Breaking Everything**
- Security measures that don't tank performance
- The balance between security and developer workflow
- Monitoring and incident response for solo devs/small teams
- When to call in professionals

**Target word count:** 2,200–2,800 words per part

---

### 🔍 PRODUCT REVIEWS (2 ideas)

---

#### 6. "Cursor 3 After 30 Days: The Good, The Expensive, and The Verdict"

**Why timely:** Cursor 3 just launched (April 2, 2026) as a "unified workspace for building software with agents." Joseph already wrote about Cursor adoption at SafeRide Health — this is the natural product review follow-up.

**Unique angle:** He's not a fresh user. He's been through the budget disaster, built standards, and now has 30 days with Cursor 3 specifically. This is a "veteran user review" not a "first impressions" post.

**Review structure:**
- What's new in Cursor 3 (Composer 2, Bugbot learning, cloud agents)
- Performance vs. cost: is the upgrade worth it?
- How it compares to his established workflow
- The features he actually uses daily vs. the marketing
- Who should upgrade, who should wait
- Rating: ★★★★☆ (predicted, let him decide)

**Target word count:** 2,500–3,200 words

**Note:** This pairs well with the AI code reviewer comparison post — could publish as a "AI Developer Tools Week" series.

---

#### 7. "The Mechanical Keyboard Gap: What I'm Using After the Voyager"

**Why timely:** Joseph's Voyager keyboard review (32KB!) is a major deep dive. But that was... checking date... it's in the reviews folder without a 2026 date stamp. If he's due for a new keyboard or has been testing alternatives, this is evergreen content that performs well.

**Unique angle:** The "what came after" story. Most reviews are "I got this keyboard, here's my first week." Joseph can write "I've used the Voyager for X months, then tried Y and Z, and here's what actually stuck."

**Potential products to cover:**
- Keychron Q1 Pro / K8 Pro update (he reviewed the K8 Pro already)
- Any new 2026 launches from Mode, Glorious, or custom builders
- The "endgame" question: did he stop searching or keep tinkering?

**Review structure:**
- Where the Voyager left off (what I loved, what I wanted more of)
- What I tried next (2-3 keyboards, briefly)
- The daily driver now (honest assessment)
- Is endgame real or a myth?
- Rating and recommendation

**Target word count:** 2,000–2,800 words

**Alternative if no new keyboard:** "The Monitor Upgrade I Didn't Know I Needed" — he reviewed the Samsung Odyssey G9. If he's tested anything new (or the G9 after long-term use), that's solid evergreen content.

---

## Topics to Avoid (Already Covered)

❌ Total TypeScript Pro review — just published (April 14)  
❌ NASA Artemis — just published comprehensive piece (April 13)  
❌ Cursor adoption at SafeRide — just published (April 11)  
❌ Anthropic/Mythos critique — just published (April 10)  
❌ Generic "AI in engineering" — covered in multiple recent posts  
❌ Basic TypeScript tutorials — covered by Total TypeScript review  

---

## Priority Recommendations

**If Joseph wants to publish this week:**
1. **TypeScript 5.8 feature deep-dive** — timely, technical, fits his voice
2. **Cursor 3 review** — natural follow-up to his Cursor adoption post

**If Joseph wants to start a series:**
1. **Self-Driving Codebase series** — leverages his real experience, differentiates from hype pieces
2. **WordPress security audit series** — capitalizes on the supply chain attack post

**If Joseph wants conversation-starting content:**
1. **AI Testing Trap** — contrarian take, will generate discussion
2. **AI Code Reviewer comparison** — practical, useful, shareable

---

## Research Sources Used

- TypeScript 5.8 release notes (typescriptlang.org)
- Cursor blog (cursor.com/blog) — Cursor 3, Composer 2, Bugbot, customer stories
- LogRocket blog — AI testing, Claude PR review, React performance patterns
- GitHub Changelog
- The Verge tech section
- Existing blog content analysis (~/Projects/jcrawford.github.io/content/)

---

**End of research report.**

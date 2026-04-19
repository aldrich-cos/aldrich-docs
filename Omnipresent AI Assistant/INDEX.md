# Aldrich — Project Documentation Index

Welcome. This folder contains the full set of working documents for Aldrich, a personal AI chief of staff.

Documents below are listed in recommended reading order. Each is standalone, but together they form a complete picture: what we're building, why it's hard, who it's for, how we'll build it, how we'll sell it, and what might go wrong.

---

## Reading order

### 1. [Idea Validation](./Idea_Validation.md) — *Start here. Honest reality check.*

A critical assessment of the Aldrich thesis. Scores 11 core claims, flags the real weaknesses (iOS constraints, LLM reliability, capital needs, competitive risk), and lands on an honest Go/No-Go verdict. Written to challenge, not to flatter.

**Key takeaways:** Core thesis is defensible, but only with (a) radically descoped V1, (b) reframed pitch, (c) roughly 2x the capital implied by the base plan.

---

### 2. [Target User & Positioning](./Target_User_Positioning.md) — *Who is this for.*

Three personas (Maya the exec, Sam the solo operator, Jordan the creator), their jobs-to-be-done, and how Aldrich positions against ChatGPT, Siri, and productivity apps. Defines the "AI chief of staff" category-of-one narrative.

**Key takeaway:** V1 is designed for Maya. Sam and Jordan get a vote; everyone else self-filters.

---

### 3. [Competitor Analysis](./Competitor_Analysis.md) — *What we're up against.*

Direct competitors (ChatGPT, Apple Intelligence, Gemini, Copilot, Rewind/Limitless/Bee, MultiOn/Lindy/Adept, Notion AI/Slack AI) and indirect ones (Notion, Motion, Superhuman). Feature matrix, moats analysis, scenario planning with probabilities.

**Key takeaway:** Aldrich's defensible position is at the intersection of proactive + personal + cross-platform + trust-first. Few competitors hold all four; fewer still hold them credibly.

---

### 4. [Cost Feasibility](./Cost_Feasibility.md) — *What this actually costs to build and run.*

Year 1 burn model (~$2.55M), infra cost tables at 100 / 10K / 100K / 1M users, LLM cost per user ($3.39 blended), unit economics at each scale. Fundraise sizing: plan for $4M seed, not $2M.

**Key takeaways:** Unit economics work at 10K+ scale; break-even at ~173K paying users; Year 1 can be executed on $2.5M with discipline, but only with a ~25% buffer.

---

### 5. [MVP Roadmap](./MVP_Roadmap.md) — *What we build, when, and in what order.*

A 22-week path from kickoff to paid GA. Phase 0–8, with decision gates between phases. Clear in-scope / out-of-scope list for V1. Staffing plan. Definition of "ready for paid GA."

**Key takeaway:** Safety foundation before memory before reasoning before features. Never ship a feature whose blast radius hasn't been scoped first.

---

### 6. [Process](./Process.md) — *How the product works day-to-day.*

Four processes: development (the build critical path), runtime (voice → action flow with ReAct loop and safety layers), UX (onboarding, morning briefing, approval flow), operations (on-call, incident response, kill switch hierarchy).

**Key takeaway:** The product's safety comes from defense in depth: sandbox classifier → approval gate → biometric gate → undo stack → circuit breaker. No single layer is trusted alone.

---

### 7. [Go-to-Market & Pricing](./Go_To_Market_Pricing.md) — *How we reach users and make money.*

Five stages from 0 → 100K users. Pricing architecture (Free / $18 Pro / $35 Power). Channel strategy: founder-led PR → content → referrals → partnerships. No paid acquisition until LTV:CAC > 4x. Launch day playbook. B2B wedge for Year 2+.

**Key takeaway:** Retention (D30 > 30%) is the north star, not raw signups. Launch is a single-day moment; the machinery that follows is a content flywheel and referral loop.

---

### 8. [Risk Register](./Risk_Register.md) — *What could kill us, and what we'll do about it.*

25 risks across platform, AI, financial, trust, operational, and competitive categories. Each has likelihood, impact, trigger, mitigation, contingency, and owner. The top 5 most-likely-to-kill list.

**Key takeaway:** Every critical risk is survivable with preparation. The discipline is to keep them visible even when abstract — so when the trigger fires, we already know the response.

---

## Source documents (background reading)

Not part of the deliverable set, but useful for depth and cross-reference:

- [Full Business Plan](./Full_Business_Plan.md) — The original 24-section comprehensive plan.
- [Technical Master Plan](./Technical_Master_Plan.md) — The deep technical architecture and engineering spec.
- [feasibility_analysis.md](./feasibility_analysis.md) — A one-page reality-check table of hard constraints.

---

## How to use this set

- **For a fast orientation:** Read docs 1 and 2 (Idea Validation + Target User). ~45 minutes.
- **For a technical deep-dive:** Docs 4, 5, and 6 (Cost, Roadmap, Process). ~2 hours.
- **For a GTM view:** Docs 2, 3, 7 (Positioning, Competitors, GTM). ~90 minutes.
- **For investor prep:** Docs 1, 4, 7, 8 (Validation, Cost, GTM, Risk). ~2 hours.
- **For team planning:** Docs 5 and 6 (Roadmap, Process). ~60 minutes.

---

## Review and update cadence

| Document | Review frequency |
|----------|-----------------|
| Idea Validation | Quarterly re-baseline; sooner if a premise changes |
| Target User & Positioning | Monthly during beta; quarterly post-launch |
| Competitor Analysis | After each WWDC, Google I/O, and major incumbent announcement |
| Cost Feasibility | Quarterly, or whenever Anthropic/AWS pricing changes |
| MVP Roadmap | End of every phase gate |
| Process | When any major sub-system ships or changes ownership |
| GTM & Pricing | Monthly through beta; quarterly thereafter |
| Risk Register | Monthly exec review; quarterly deep-dive; annual re-baseline |

---

*Last updated: 2026-04-19. Owner: CEO.*

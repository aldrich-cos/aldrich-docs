# Aldrich — MVP Scope & 0-to-Launch Roadmap

**Document purpose:** Define exactly what we are building for V1, what we are deliberately *not* building, and the week-by-week path from today to a live paying product.

**Stance:** Ruthless scope discipline. Every feature cut in V1 is a feature we can add with confidence once the foundation is trustworthy. Every feature shipped in V1 should feel *finished* — not a beta of an idea.

**Duration from kickoff to paid GA:** ~22 weeks (17-week build path + 5-week beta).

---

## Executive summary

**The V1 thesis:** A user who downloads Aldrich and uses it for 30 days should feel that (a) it remembers what they tell it, (b) it proactively surfaces things they'd have missed, and (c) they can trust it to act on their behalf on a narrow set of tasks — without fearing it will do something wrong.

If those three things are true, everything else can be added later. If any one of them is false, nothing else matters.

So V1 is built in that exact priority order:

1. **Remember** — Memory Hub that actually works across 30+ days of daily use.
2. **Surface** — Proactive briefings, reminders, context card on the right device at the right moment.
3. **Act** — A small set of bulletproof actions (calendar, messaging, task creation), every one approval-gated.

Everything outside this is V1.5+.

**What is V1 emphatically not:**
- An open-ended agent that can do anything
- A replacement for ChatGPT as a general chat interface
- A cross-device real-time sync dream
- A voice-only product
- An "always-on listening" experience

---

## What's in, what's out — the V1 scope gate

### In V1 (ship week 0)

| Capability | Scope | Platform | Rationale |
|------------|-------|----------|-----------|
| **Memory Hub** | Store, retrieve, search, correct personal facts and events | iOS, Android, Web | Core differentiator; everything else builds on it |
| **Morning Briefing** | Calendar preview + top 3 actionable surfaces | iOS, Android | Highest-value daily touchpoint |
| **Context Cards** | Surface relevant memory at moments (calendar event, location, notification) | iOS (Siri Suggestion + Widget), Android | Proactive without being intrusive |
| **Smart Reminders** | Natural-language reminders with context ("remind me to ask X when I see Y") | iOS, Android | Familiar pattern, high trust |
| **Calendar Actions** | Schedule, reschedule, find times, invite attendees | iOS, Android, Web | Well-scoped, high-impact, reversible |
| **Email Triage** | Top 3 emails summarized; draft replies (approval-gated) | iOS, Android, Web | Valuable, risky — so approval gate is non-negotiable |
| **Task Creation** | Create tasks in user's existing tool (Todoist, Apple Reminders, Notion) | iOS, Android | Low risk, high daily use |
| **Ask Aldrich** | Natural language Q&A against personal memory + general knowledge | iOS, Android, Web | The "universal interface" |
| **Settings & Controls** | Permissions dial, memory viewer, activity log, undo stack | All | Trust infrastructure |
| **Onboarding (48h calibration)** | Connect accounts, capture preferences, first-week tuning | iOS, Android | Critical for first-run retention |

### Deferred to V1.5 (Month 2–4 post-launch)

- Desktop companion app (Mac first, Windows second)
- Deeper Slack / Linear / Jira integration (V1 ships read-only for these)
- Travel planning (multi-step, high-risk; wait for reliability track record)
- Group / team memory (requires team plan infra)
- Custom "Aldrich skills" — user-defined automations
- Android Wear / Apple Watch complications
- Broader email action set (bulk triage, filter learning)

### Deferred to V2 (Month 4–9)

- Ambient capture (non-audio; e.g., screen context, document monitoring with consent)
- Multi-agent delegation ("assistant for my assistant")
- Team plans with shared memory
- API for developers
- Web browsing agent for research tasks

### Deferred to V3 (Month 9+)

- Financial actions (with full compliance surface)
- Health-adjacent features (within regulatory scope)
- On-device federated learning for personalization
- Enterprise (SSO, admin console, custom DPAs, SOC 2 Type II)

### Explicitly never in scope (unless platform constraints change)

- iOS true always-on listening
- Actions without user approval in high-trust categories (payments, new recipients, data sharing)
- Training on user data without explicit opt-in
- Selling user data or using for ad targeting

---

## The 17-week build plan

The build is sequenced by *dependency*, not by calendar convenience. We build the foundation first (safety, memory, auth) even though it's not demo-able, because every later feature depends on it being right.

### Phase 0 — Week 0 to 1: Kickoff and foundations

**Outcomes of this phase:**
- Team assembled, roles clear
- Architecture decisions made and documented
- Dev environments, CI/CD, observability stack in place
- Legal/privacy framework agreed
- Design system v0 drafted

**Key milestones:**
- Kickoff meeting; onboarding for any late-join staff
- ADRs for: model provider strategy, memory store, auth provider, cloud provider
- Staging environment bootstrapped
- Privacy and ToS drafts in legal review

**Gate to proceed:** All critical-path hires in seat; architecture ADRs signed off.

---

### Phase 1 — Week 2 to 4: Safety foundation

We start with safety because retrofitting it later is the most common pattern of failure in agent products. If the safety layer is in place first, every feature we add fits within a bounded blast radius.

**Outcomes:**
- Undo stack operational (any write action is logged and reversible for 30 days)
- Kill switch hierarchy (global, per-action-class, per-user)
- Sandbox classifier (destructive actions routed through policy engine)
- Biometric gate for high-trust actions
- Circuit breaker (stops autonomous action after N errors in session)
- Audit log write path

**Key milestones:**
- Internal demo: run 10 realistic destructive-action attempts against the sandbox; verify each is gated correctly
- End-of-phase gate: a red-team session where we try to make the unfinished system do something bad — it should fail in the right way every time

**Why this first:** Every subsequent sprint will write to the action system. If the action system is unsafe from the start, every feature adds risk. If it's safe from the start, every feature inherits the safety.

---

### Phase 2 — Week 4 to 7: Memory Hub

The Memory Hub is the most differentiating pillar and the longest lever for retention. Done well, the product gets better the more you use it. Done poorly, the user churns because "it never remembers anything."

**Outcomes:**
- Memory write path: conversations, approved facts, extracted entities
- Retrieval: vector search + structured schema retrieval
- Fact provenance: source, timestamp, confidence
- Contradiction detector
- User-facing memory viewer and editor
- Retention policies (cold storage after 365 days, user delete)
- Cross-device sync with encryption at rest

**Key milestones:**
- Retrieval quality eval: 90%+ precision on top-5 for a 200-query internal set
- Memory write latency p95 < 500ms
- Demo: a test user runs 100 interactions over a week; then a memory-dependent query correctly retrieves a fact from 5 days earlier
- End-of-phase gate: one week of internal dogfooding where every engineer uses the memory daily

---

### Phase 3 — Week 7 to 10: ReAct engine and model routing

With safety and memory in place, we build the brain. The ReAct engine is the component that takes user intent, decides the plan, calls tools (memory, actions, providers), and returns a response.

**Outcomes:**
- Claude integration with tool-use format
- Fallback provider (GPT-4 via Azure) configured and tested
- Small-model router for intent classification (Gemma 2B on-device on Tier 1, cloud small model fallback)
- Planner → Executor → Critic pattern (plan validated before execution for multi-step chains)
- Chain-depth cap enforced (≤3 without explicit per-step approval)
- Observability: per-call latency, cost, model, success

**Key milestones:**
- End-to-end flow: user says "schedule lunch with Alex next week" → ReAct plans → calls calendar tool → returns confirmation
- Chain success eval: 200 realistic queries; 95%+ on single-step, 88%+ on 3-step
- Cost-per-query dashboard live and accurate

---

### Phase 4 — Week 10 to 13: V1 features (in parallel streams)

This is the longest phase because multiple feature streams run in parallel. Each stream has a clear owner and isolated interfaces so they don't block each other.

**Stream A — Morning Briefing & Context Cards**
- Calendar preview synthesis
- "Top 3 things" intent on morning trigger (alarm-based + first-unlock-based)
- Notification / widget surfacing of memory-relevant info
- Siri Suggestions integration

**Stream B — Calendar & Task Actions**
- Full calendar action suite (schedule, reschedule, find times, invite)
- Task creation in Todoist, Apple Reminders, Notion
- Smart reminders with context triggers

**Stream C — Email Triage & Reply**
- Gmail and Outlook integration
- Triage summarization
- Draft reply generation (approval-gated)

**Stream D — Onboarding Flow**
- 48-hour calibration sequence
- Account connection UX
- Preference capture
- First-week "tell me more about X" prompts

**Stream E — Settings & Trust UI**
- Permissions dial (four tiers)
- Memory viewer and editor
- Activity log with undo
- Privacy settings (export, delete, pause)

**Cross-cutting milestones:**
- Feature-flag system operational (every feature gated for staged rollout)
- A/B framework for key UX decisions
- End-of-phase: internal alpha with all streams integrated

---

### Phase 5 — Week 13 to 15: Polish, hardening, internal alpha

**Outcomes:**
- All V1 features integrated end-to-end
- Cross-device sync validated on 3 device configurations per platform
- Error states designed and tested
- Empty states designed and tested
- Accessibility pass (WCAG 2.1 AA)
- Localization structure in place (English only in V1; infra for later)
- Performance pass (app startup < 2s, first meaningful paint < 1s)

**Key milestones:**
- 100% of P0 bugs closed
- Full regression test on iPhone 13–16, Pixel 7–8 Pro
- Internal alpha: all staff use daily for two weeks; dogfooding reports reviewed weekly

---

### Phase 6 — Week 15 to 17: External beta prep and submission

**Outcomes:**
- App Store submission materials (screenshots, preview video, description, privacy labels, reviewer notes)
- Play Store submission materials
- Beta TestFlight group (target 200 external testers)
- Marketing site live (waitlist-only)
- Support infra: Intercom or equivalent, docs site, FAQ
- Legal: ToS and Privacy Policy finalized and published

**Key milestones:**
- Apple Developer Relations meeting completed (pre-submission feedback)
- Submission to App Store and Play Store
- First 25 beta invites sent

**Gate to proceed to public beta:** App Store approval, zero P0 bugs in internal alpha for 7 days.

---

### Phase 7 — Week 17 to 20: Beta (controlled)

**Outcomes:**
- 200 → 1,000 → 5,000 external beta users
- Telemetry on activation, retention, feature usage, errors
- Weekly release cadence with bug fixes and polish
- Feedback channel (in-app + Discord/Slack)
- Churn reason tagging and analysis

**Key milestones:**
- Day 7 retention > 60%
- Day 30 retention > 35%
- NPS > 30 by end of beta
- LLM cost per active user stable within forecast
- Zero high-severity trust incidents

**Gate to proceed to paid GA:** All four metrics hit, no critical outstanding issues.

---

### Phase 8 — Week 20 to 22: Paid GA launch

**Outcomes:**
- Paid tiers enabled (Free / Pro $18 / Power $35)
- Product Hunt, HN, Twitter launch coordinated
- Press outreach to 20 tier-1 publications
- Content marketing: 5 launch-adjacent pieces live
- Founder videos on YouTube, TikTok
- Referral program live

**Key milestones:**
- 10K users signed up in launch week
- 3–5% paid conversion from signups in Week 1
- Launch-day traffic handled without infra incident

---

## Decision gates — when to advance, when to hold

Between phases we don't advance automatically. A gate meeting assesses:

1. **Are the phase outcomes actually met?** Not "mostly" — *actually*.
2. **Are there any critical bugs that must be fixed before next phase?**
3. **Are we on burn?** If we're >10% over plan, what's the tradeoff?
4. **Do we have the team to execute the next phase?** Hiring on track?
5. **Has anything in the market changed that should re-scope?**

If any answer is red, we pause and re-plan instead of rolling forward.

---

## Staffing plan through 22 weeks

### Week 0 team (at kickoff)

- CEO (product + fundraising)
- CTO (architecture + backend)
- Founding iOS engineer
- Founding Android engineer
- AI engineer (ML + prompting)
- Product designer
- Part-time legal counsel

### Week 4 hires (before Phase 2)

- Second backend engineer (memory + sync)
- Second AI engineer (routing + evals)

### Week 8 hires (before Phase 4)

- Product manager (V1 scope + launch)
- Head of CX / support (part-time)
- Security engineer (part-time contractor acceptable)

### Week 14 hires (before beta)

- Head of growth / marketing
- DevRel / community lead (for integrations and beta community)

### Week 20 hires (paid GA)

- Full-time support engineers (2)
- Data analyst (retention and unit-economics dashboards)

**Total at paid GA: ~12–14 people.** Matches the $2.55M Year 1 burn plan.

---

## Critical-path dependencies

These are the things that, if they slip, everything slips:

1. **App Store first approval** — blocks beta and GA. Mitigated by early Apple relations meeting.
2. **Memory Hub retrieval quality** — blocks Phase 4. Mitigated by evals starting in Phase 2.
3. **Safety foundation** — blocks all action work. Mitigated by making it Phase 1.
4. **Claude pricing and rate limits** — could derail unit economics. Mitigated by provider abstraction.
5. **Legal/Privacy framework** — blocks public launch. Mitigated by engaging counsel at Week 0.

---

## What could go wrong (roadmap risks)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| App Store rejection (first submission) | 30% | 2–4 week slip | Pre-submission relations meeting; conservative V1 scope |
| Retention below target in beta | 40% | Delay paid GA | Feature polish round; re-examine onboarding |
| Claude API reliability issues | 20% | Bugs and user friction | Fallback provider wired in from Phase 3 |
| Hiring slippage in AI roles | 40% | 2–4 week slip | Start recruiting 3 months ahead; use contractors |
| LLM unit economics worse than modeled | 30% | Pricing adjustment | Per-user cost dashboard live from Phase 3 |
| Privacy regulator inquiry | 15% | 4–8 week slip | Privacy-by-design from Phase 0; DPIA completed |
| Key person leaves mid-build | 15% | 4–6 week slip | Pair programming; runbooks |

---

## Definition of "ready for paid GA"

All of the following must be true before we flip paid on:

**Product**
- Zero P0 bugs in the past 14 days
- Day 7 retention > 55% on beta cohort
- Day 30 retention > 30% on beta cohort
- NPS > 30 sustained for 2 weeks
- All V1 features described above are live and working
- Onboarding completion rate > 70%

**Reliability & Safety**
- Chain success rate > 90% on 3-step eval
- Zero high-severity trust incidents in past 30 days
- Circuit breaker and undo stack exercised successfully in prod
- Red-team pass against V1 feature set

**Business**
- App Store and Play Store approved, reviewer relations positive
- Payment infra tested, legal review of ToS/Privacy complete
- Support team trained and on-call schedule set
- Marketing site live, email infrastructure for transactional comms tested
- Referral program tested

**Financial**
- LLM cost per active user tracking within 20% of forecast
- Cash runway > 9 months at current burn
- Series A story components in place (retention, conversion, ARPU, cohort unit economics)

---

## Post-launch rhythm (Month 1 to 6)

**Weekly:**
- Product metrics review (Monday)
- Engineering standup & demo (Tuesday, Friday)
- Support queue triage (Wednesday)
- User interview(s) — 2–3/week by a PM or founder

**Monthly:**
- Exec review: product metrics, unit economics, risk register
- Roadmap re-prioritization
- Hiring pipeline review
- Investor update

**Quarterly:**
- Board meeting
- Company offsite / all-hands strategic review
- Risk register re-baseline
- Strategic product review: are we still building the right thing?

---

## V1.5 and beyond — the feature pipeline

Once V1 is live and we have 4 weeks of stable metrics, we start on V1.5 features. The priority is set by (a) what retention/cohort analysis tells us, (b) what beta users asked for most, (c) what unit economics tell us we can afford.

**Candidate V1.5 features in priority order (subject to data):**
1. Desktop companion (Mac first) — highest-value power-user unlock
2. Deeper Slack and Linear read/write
3. "Aldrich skills" — user-defined automations
4. Group memory (households or teams)
5. Watch complications (context at a glance)
6. Travel planning (once reliability metrics allow)
7. More integrations (Notion, Gmail labels, Calendly, Superhuman, etc.)

**Key principle for post-V1 scope:** every new capability ships with the same discipline — safety first, approval-gated, logged, undoable.

---

## The "no" list — things people will ask for that we will decline

These are pre-decided rejections to protect focus and trust. If a user, investor, or team member asks for these in the first 6 months, the answer is no.

- Make Aldrich always-listening on iOS (impossible, see Risk Register)
- Skip the approval gate on email send for Power users (no)
- Add "Aldrich will train on your data" opt-in with financial incentive (no, privacy brand damage)
- Integrate with cryptocurrency trading (regulatory and trust risk)
- Add a "GPT-4 / open model / pick your LLM" power-user feature (adds complexity, hurts consistency)
- Build an enterprise version before Month 9 (focus)
- Localize to more than 2 languages before Month 12 (focus; English + Spanish in V1.5)

---

## Summary timeline

| Weeks | Phase | Output |
|-------|-------|--------|
| 0–1 | Kickoff | Team, architecture, environments |
| 2–4 | Safety foundation | Undo, kill switch, sandbox, biometric gate |
| 4–7 | Memory Hub | Write, retrieve, search, correct |
| 7–10 | ReAct + routing | Intent → plan → tool → result |
| 10–13 | V1 features (parallel streams) | Briefing, actions, triage, onboarding, settings |
| 13–15 | Polish | Integration, perf, error states, a11y |
| 15–17 | Beta prep & submission | Store approval, beta ramp |
| 17–20 | Controlled beta | 200 → 5K users, metrics |
| 20–22 | Paid GA launch | 10K users week-1, paid tier live |

From kickoff to paid revenue: ~5 months. From paid GA to Series A readiness (healthy cohort metrics): ~12 months.

The discipline here is that every phase ships *finished work*. We would rather be a month late with something trustworthy than on time with something that damages the brand in its first week.

---

*End of MVP Roadmap v1.0 — re-review at end of every phase gate.*

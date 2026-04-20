# Aldrich — Process (How It Gets Built, How It Works, How It Runs)

> **Purpose:** Describe the end-to-end process of Aldrich in four dimensions: (1) how the product is engineered, (2) how it operates at runtime when a user interacts, (3) how the user experiences it day-to-day, and (4) how the team operates it in production.
>
> **Audience:** Engineers, operators, designers, and anyone who needs to understand "how does this actually happen" at each layer.
>
> **Related docs:** Full Business Plan (§5–8), Technical Master Plan (all pillars), Cost Feasibility, MVP Roadmap.

---

## 1. The Four Processes Inside Aldrich

Aldrich isn't a single process — it's four overlapping workflows, each with its own cadence, owner, and failure modes:

| Process | Who owns it | What triggers it | How long it takes |
|---|---|---|---|
| **Development process** | Engineering | Product decision / user feedback / backlog | 1–8 weeks per iteration |
| **Runtime process** | System | User intent / scheduled trigger / inbound webhook | 200ms–8s per ReAct chain |
| **User experience process** | User | Morning / incoming event / explicit command | 5s–45s per interaction |
| **Operations process** | DevOps / Support | Alert / incident / user report | 1min–24h per event |

The rest of this document describes each process in the detail needed to actually run it.

---

## 2. Development Process — How a Feature Gets Built

### 2.1 Engineering principles

1. **Safety layer first.** No feature that takes an action ships before its action type is categorized in the Sandbox Classifier, given an undo path, and covered by the adversarial test suite.
2. **Every PR ships with tests.** Integration tests against sandbox accounts (Gmail test account, test Slack workspace, test Notion workspace) are the gate, not unit tests.
3. **LLM-dependent code has a non-LLM fallback.** If a feature depends on the LLM and the LLM is unavailable or wrong, the feature must degrade gracefully to a human-visible fallback.
4. **Latency budgets are enforced in CI.** A PR that regresses P99 latency by >10% on any critical path fails CI.
5. **Every action has a compensation.** If it can't be undone, it has a compensating transaction (e.g., sending an apology email after an incorrect email went out).
6. **No experimental ML in production write paths.** Experimental models can inform; they can't decide.

### 2.2 The feature lifecycle

```
IDEA                 SPEC                  DESIGN                BUILD               TEST               SHIP               OBSERVE
 │                    │                      │                     │                   │                  │                   │
 ▼                    ▼                      ▼                     ▼                   ▼                  ▼                   ▼
User insight     Written PRD            Figma mocks          Engineering         Integration &      Feature flag       Observability
Backlog item     w/ acceptance           w/ SDUI             implementation       adversarial        rollout            dashboards
Customer req     criteria               schema specified                          test suites        10% → 50% → 100%   Post-launch
                                        + accessibility                                                                  retro (1 wk)
                 ↓ PM, eng, design       ↓ Design + eng      ↓ Small PRs (<400   ↓ Automated gate   ↓ Gradual, w/
                 review together           review together      LOC) w/ tests       + manual QA        kill switch

Duration:        2-5 days                2-4 days             1-3 weeks            3-5 days           Hours to days       Ongoing
```

### 2.3 Build order — The Critical Path

The Technical Master Plan correctly identifies that certain things must be built before others. The dependency graph:

```
Week 1-2: SAFETY FOUNDATION
 ├─ Action Record schema (PostgreSQL partitioned by month)
 ├─ Sandbox Classifier (deterministic, no LLM)
 ├─ Circuit Breaker (Redis + UDP broadcast)
 └─ Undo Stack with 30-second window
    ▼ blocks everything below ▼

Week 3-4: AUTH & VAULT
 ├─ Supabase Auth + OAuth 2.0 PKCE
 ├─ KMS envelope encryption for tokens
 └─ Token refresh background worker
    ▼ blocks all integrations ▼

Week 5-7: FIRST INTEGRATION (Gmail + Calendar)
 ├─ Tool adapters (read + draft, NOT send in V1 week 1)
 ├─ Schema validation on all API responses
 └─ Integration test suite with sandbox accounts
    ▼ proves architecture before replication ▼

Week 8-10: REACT ENGINE
 ├─ Go FSM implementation
 ├─ Claude Sonnet integration with tool-calling
 ├─ Error recovery (3 retries, 6K token budget)
 ├─ Llama Guard firewall (even as a stub in V1)
 └─ ReAct chain test suite (50+ scenarios)

Week 11-12: MEMORY SYSTEM
 ├─ Cognimemo integration
 ├─ Ingestion from email/calendar events
 ├─ Retrieval for ReAct context
 └─ TTL-based forgetting (basic)

Week 13-15: MOBILE CLIENTS (parallel: iOS + Android)
 ├─ Intent capture (push-to-listen)
 ├─ SDUI renderer (5 component types: text, button, action_row, list, card)
 ├─ Biometric approval gate
 └─ WebSocket keep-alive

Week 16: INTEGRATION + HARDENING
 ├─ End-to-end flow tests
 ├─ External pentest
 ├─ Load test (1,000 concurrent users)
 └─ App Store submission prep
```

### 2.4 Non-negotiable gates

A feature cannot ship unless:

- [ ] Its action type is in the Sandbox Classifier's registry (or explicitly marked read-only).
- [ ] It has an undo path OR a compensating transaction OR is in the "biometric-required" tier.
- [ ] It has at least 5 integration tests against real sandbox accounts.
- [ ] Its latency P99 is inside the budget for its path (200ms local, 1500ms cloud).
- [ ] Its data access uses the minimum-scope OAuth permission.
- [ ] Its failure mode has a user-visible explanation.
- [ ] The adversarial test suite includes at least 3 cases attempting to abuse the new capability.
- [ ] A kill switch exists (feature flag that disables the capability for all users in seconds).

### 2.5 Release cadence

| Frequency | What ships |
|---|---|
| Every 2 weeks | Minor feature releases, bug fixes |
| Monthly | Integration additions, UI refinements |
| Quarterly | Major version (V1.1, V1.2, etc.) with net-new capabilities |
| Emergency | Security fixes, App Store-required changes (hours, not days) |

All releases gated by feature flags. Default rollout: 1% → 10% → 50% → 100% over 48 hours with health monitoring at each step.

---

## 3. Runtime Process — What Happens When a User Interacts

This is the most critical process. It's what executes 5–15 times per day per active user.

### 3.1 The full data journey (voice → action → approval)

```
USER INITIATES                       LOCAL PROCESSING                  CLOUD REASONING                EXECUTION                OUTCOME
═══════════════              ═══════════════════════           ══════════════════           ══════════════          ═══════════════

 1. Wake word    ─────▶      2. Voice Activity Detection       5. Memory retrieval          8. Safety Layer         10. Action
    OR                          (Silero VAD, on-device,            (pgvector HNSW,             check:                  executed on
    Push-to-talk                 ANE/NPU accelerated)               retrieve top-20            a. category OK?         external service
    OR                                                              relevant memories)         b. risk level?           (Gmail, Slack)
    Scheduled                                                                                  c. budget OK?
    trigger                   3. On-device intent                                              d. classifier OK?
    OR                           classification (Gemma 2B,                                     
    Incoming event               ~180ms TTFT)                  6. ReAct loop begins:                                 11. Action Record
                                                                 • Reason: "user wants       9. Biometric gate         stored in
                              4. Decision: simple intent →        dinner Thursday"             (if high-risk):         PostgreSQL w/
                                 handle locally                   • Act: query Calendar        Face ID / PIN           forward_payload
                                                                     API for availability      required                + inverse_payload
                                 complex intent → send to        • Observe: 4 people free                              (30-sec undo
                                 cloud (encrypted payload         • Reason: now query                                   window)
                                 via WebSocket keep-alive)         OpenTable
                                                                 • Act: OpenTable.search()                          
                                                                 • Observe: 3 options
                                                                 • Reason: send invites
                                                                 • Act: generate invite
                                                                 • Stop: ready to approve

                              7. Safety layer pre-check:                                                            12. SDUI card 
                                 - Is this in an enabled                                                                rendered on
                                   action category?                                                                     user device:
                                 - Is user over action                                                                  Approve/Edit/
                                   budget?                                                                               Reject
                                 - Any active circuit
                                   breaker?                                                                         13. User approves
                                                                                                                        (Face ID)
                                                                                                                    14. Action fires
                                                                                                                    15. Undo window
                                                                                                                         opens (30s)
                                                                                                                    16. If not undone
                                                                                                                         → committed
```

### 3.2 The ReAct loop in plain English

When the AI needs to accomplish something complex (more than a single lookup):

1. **Reason:** "What is the user actually asking for?"
2. **Act:** Pick a tool from the allowed registry (e.g., `calendar.getFreeBusy`) and call it.
3. **Observe:** What did the tool return? Is it what I expected?
4. **Reason:** "Given what I now know, what's the next step?"
5. **Repeat** steps 2–4, up to 8 times max.
6. **Produce:** Generate the final output (a drafted email, a confirmation card, etc.) as SDUI JSON.

Each step is an LLM call. Each tool call is a real API hit. The whole loop runs inside a Go finite-state machine that enforces the 8-step cap and the 30k token budget.

### 3.3 When the loop fails

```
FAILURE TYPE                         RESPONSE
─────────────────────────────        ───────────────────────────────────────────────
LLM returns invalid tool JSON  →    Retry with error feedback in prompt (max 3 retries)
Tool call returns 5xx from API →    Exponential backoff; try secondary provider if avail
Loop exceeds 8 steps           →    Halt; surface "I need more info" SDUI card to user
Token budget exceeded          →    Halt; surface "This is more complex than expected"
Llama Guard flags output       →    Halt; log incident; surface generic safe response
Circuit breaker trips          →    All loops for this user halt; alert ops; kill any
                                    in-flight tool calls via UDP broadcast
```

### 3.4 Memory update during runtime

Every ReAct loop updates the memory hub:

- **Input:** User intent, context used, actions proposed.
- **Output:** Action approved? Action rejected? Action edited? Action undone?

Every outcome updates the memory: confidence scores, routine patterns, user preferences, relationship context. This is what makes the product better over time.

**Memory write rules:**
- Facts require a source (email, calendar event, user statement). No fact written from LLM hallucination.
- Routines require N ≥ 3 observations to be trusted.
- Overrides of a trusted routine decay its confidence; 3 consecutive overrides demote it.
- Memory writes are asynchronous (Kafka ingest → pgvector). The user-visible action doesn't wait.

### 3.5 Privacy boundary during runtime

What stays on-device:
- Raw audio
- Full screen content (desktop daemon)
- Biometric data (Face ID / Touch ID hashes)
- Any local-app content not explicitly sent

What leaves the device (encrypted in transit via TLS; at rest via KMS):
- Intent summaries ("user asked about dinner")
- Email metadata (sender, subject, timestamps) — full body only on user approval
- Calendar event titles and times
- Approved action payloads

What the system does *not* store after the session:
- Raw audio (deleted after transcription)
- Draft content that was rejected (unless user opts in to "learn from my rejections")

---

## 4. User Experience Process — What It Feels Like

This is the process from the user's point of view: what they do, what they see, how it feels.

### 4.1 Onboarding process (first 48 hours)

```
DAY 0 HOUR 0: Install
  ↓
  App Store install →
  Welcome screen →
  "Aldrich watches, then acts. Let's calibrate."
  ↓
DAY 0 HOUR 0-10 min: Calibration interview
  5 questions, 2-3 min total:
   1. What tools do you live in? [Gmail/Outlook, Calendar, Slack, Notion...]
   2. When does your work day start/end?
   3. What's your biggest daily frustration?
   4. How much autonomy do you want today? [Ask me first / Handle routine things / Be proactive]
   5. Who are 3 people I should know about?
  ↓
DAY 0 HOUR 0-15 min: Integrations
  OAuth flow for 1-3 integrations
  "You can add more anytime"
  ↓
DAY 0 HOUR 0-15 min: Calibration mode begins
  "For 48 hours I'll observe without acting. I'll show you what I notice."
  ↓
DAY 0 HOUR 1-48: Observation phase
  - Daily "I noticed..." briefings (no actions proposed)
  - User sees Aldrich understanding their world
  - Trust is built through visible intelligence without risk
  ↓
DAY 2 HOUR 0: First proposed action
  "Based on your schedule, can I suggest a 15-min buffer before your 9am calls?"
  Low-stakes, reversible, educational.
  ↓
DAY 2-7: Graduated trust
  - Week 1: Suggestions only
  - Week 2: Low-stakes actions with approval (draft emails, schedule suggestions)
  - Week 3+: Routine auto-actions; exceptions escalated
  - Month 2+: High-frequency routine tasks auto-executed; destructive/financial always gated
```

### 4.2 The daily rhythm

```
6:00-7:30 AM  User wakes up
  ↓
              Aldrich has been processing overnight:
              - New emails (scored by urgency + relationship importance)
              - Calendar changes (conflicts detected)
              - Slack mentions while user was offline
              - Sleep data from wearable (energy score)
  ↓
              MORNING BRIEFING CARD on lock screen:
              "3 things need your attention:
               (1) Server alert at 2 AM — email drafted, review?
               (2) Client call conflict Thursday — suggest reschedule?
               (3) Low energy — buffered 15 min before your 9am"
  ↓
              User scrolls briefing, 45 seconds total:
              - Tap Approve on (1) → email sends
              - Tap Edit on (2) → tweak message, then send
              - (3) already applied; user sees it and moves on
  ↓
Throughout   User in deep work.
  the day    Aldrich mostly silent.
             Real-time intervention only if:
             - Calendar invite lands that conflicts with Deep Work block
             - Critical message from pre-defined VIP contacts
             - Reminder for time-sensitive commitment

  ↓
Evening      Summary card:
             "You had 11 actions today. 9 auto-approved. 2 needed your input."
             Optional: review anything interesting from the day.
```

### 4.3 The approval process (single action)

```
     ┌────────────────────────────┐
     │ SDUI Action Card           │
     │                            │
     │ ┌────────────────────────┐ │
     │ │ Reschedule call with   │ │     ← Clear title
     │ │ Sarah to 3 PM?         │ │
     │ ├────────────────────────┤ │
     │ │ Why: Current 2 PM slot │ │     ← Reasoning (one line)
     │ │ conflicts with Deep    │ │
     │ │ Work block             │ │
     │ ├────────────────────────┤ │
     │ │ Source: Sarah's email  │ │     ← Source attribution
     │ │ at 9:14 AM             │ │
     │ ├────────────────────────┤ │
     │ │ [Edit] [Approve]       │ │     ← Clear affordances
     │ │     [Reject]           │ │
     │ └────────────────────────┘ │
     │                            │
     └────────────────────────────┘
          │            │
          │            ▼
          │    User taps Approve
          │    ↓
          │    Face ID prompt
          │    (if high-risk tier)
          │    ↓
          │    Action fires
          │    ↓
          │    30-second undo banner appears
          │    "Undo" button available
          │    ↓
          │    After 30s, committed
          │
          ▼
    User taps Edit
    ↓
    Inline editor appears
    ↓
    User tweaks
    ↓
    Approve flow resumes
```

### 4.4 The error recovery process (when AI makes a mistake)

```
USER NOTICES SOMETHING WRONG
  ↓
  "Something went wrong" button (visible in every card and action log)
  ↓
User describes what happened: 3 preset options + freeform
  "Wrong recipient" / "Wrong time" / "Wrong decision" / "Other"
  ↓
Aldrich offers immediate compensation options:
  ├─ If reversible: "I can undo this" → one-tap undo
  ├─ If not reversible: "I can send an apology" → generated apology shown
  └─ If serious: "Let me escalate this to human support" → ticket opened
  ↓
In parallel (system side):
  - Incident logged in action_records with user_reported = TRUE
  - If reaches threshold (>5 incidents in 24h), T&S team alerted
  - Feedback automatically added to training pool for next model iteration
  ↓
Follow-up:
  Within 24h, user receives explanation:
  "Here's what happened: [brief summary]. I've updated my approach so this doesn't
  repeat. If this caused harm, here's how to escalate."
```

---

## 5. Operations Process — How the System Is Run in Production

### 5.1 On-call rotation

Team operates a 24×7 PagerDuty rotation in year 2+. Year 1 is best-effort with the founding team.

**Severity levels:**

| Severity | Example | Response |
|---|---|---|
| SEV-1 | Circuit breaker triggered for any user / LLM API error rate > 5% for >2min / OAuth vault unreachable / unauthorized action report | Page immediately (any time) |
| SEV-2 | Local inference cold-start > 10s for >1% of users / memory retrieval P99 > 1s / any new-category safety incident | Slack notification; fix same business day |
| SEV-3 | Single user issue / minor UI bug / non-critical integration failure | Ticket; fix within SLA (48h) |

### 5.2 Incident response process

```
ALERT FIRES (e.g., circuit breaker tripped)
  ↓
PagerDuty pages on-call engineer
  ↓
ACKNOWLEDGE (within 5 min for SEV-1)
  ↓
INVESTIGATE:
  - Query Datadog for the user's action history
  - Inspect ReAct chain logs
  - Identify if it's a single-user issue or system-wide
  ↓
CONTAIN:
  - If system-wide: kill switch activates; feature-flag the affected capability off
  - If single-user: freeze that user's autonomous actions; notify user
  ↓
COMMUNICATE:
  - If single-user: in-app message within 1 hour
  - If system-wide: status page + X/twitter within 15 min
  ↓
RESOLVE:
  - Root-cause identified
  - Fix deployed (bypassing normal release cadence if SEV-1)
  ↓
POSTMORTEM:
  - Blameless postmortem written within 5 business days
  - Circuit breaker trigger list updated if applicable
  - Adversarial test suite updated to cover this case
```

### 5.3 Weekly operational ritual

- **Monday:** Weekly metrics review — AAPUW (North Star), Day-30 retention, error rates, LLM cost/user. Red/yellow/green scorecard.
- **Wednesday:** Adversarial test suite review — any failures in the 500-case corpus? Any new attack patterns seen in production?
- **Friday:** "Ship it" review — what ships next week? Go/no-go on each feature flag.

### 5.4 The kill switch hierarchy

Aldrich has three levels of emergency kill:

1. **User-level:** User hits the kill switch in the app → all their active ReAct loops halt within 5 seconds (UDP broadcast). All pending approvals are dismissed. OAuth tokens remain but are flagged as "paused."
2. **Feature-level:** Product team disables a specific capability (e.g., auto-send email) via feature flag → all instances of that capability halt within 60 seconds globally.
3. **System-level:** Engineering on-call hits the system kill switch → all new ReAct loops are rejected at the API gateway; in-flight loops complete but no new ones start. Used only in absolute emergency.

---

## 6. The Release Process in Detail

```
FEATURE READY IN STAGING
  ↓
AUTOMATED TESTS PASS
  ├─ Unit tests (Go + mobile)
  ├─ Integration tests (real sandbox accounts)
  ├─ ReAct chain simulation (50+ scenarios)
  ├─ Adversarial safety suite (500 cases — MUST pass 100%)
  ├─ Latency regression test (must not regress >10%)
  ├─ Load test (simulated production-scale traffic)
  └─ GDPR compliance test (deletion within SLA)
  ↓
MANUAL QA ON REAL DEVICES
  ├─ iPhone 15 Pro (tier 1)
  ├─ iPhone 14 (tier 2)
  ├─ iPhone 12 (tier 3 — cloud fallback validated)
  ├─ Pixel 8 Pro (tier 1 Android)
  ├─ Samsung S23+ (tier 2 Android)
  └─ Budget Android (Moto G) (tier 3)
  ↓
FEATURE FLAG ENABLED AT 1%
  ├─ Monitor for 4 hours
  ├─ Watch error rate, action success rate, user feedback
  └─ If healthy → continue
  ↓
ROLLOUT TO 10%
  ├─ Monitor for 12 hours
  └─ If healthy → continue
  ↓
ROLLOUT TO 50%
  ├─ Monitor for 24 hours
  ├─ This is where most issues surface
  └─ If healthy → continue
  ↓
ROLLOUT TO 100%
  ├─ Announce in release notes (in-app + email)
  └─ Keep flag for 30 days in case of need to roll back
  ↓
CLEANUP:
  ├─ After 30 days stable, remove feature flag
  └─ Deprecate old paths
```

At any point, one bad metric triggers auto-rollback. The system is designed so that "off" is always safe.

---

## 7. Cross-Team Process — How PMs, Engineers, and Designers Collaborate

### 7.1 Weekly cadence

| Day | Meeting | Attendees | Purpose |
|---|---|---|---|
| Monday | Sprint planning (30min) | Product + Eng + Design | Set the week's priorities |
| Monday | Metrics review (30min) | Leadership + Product | Check the north star |
| Wednesday | Design review (45min) | Design + Eng + Product | Review in-progress mocks |
| Wednesday | Safety review (30min) | Security + Eng + Product | Any new action types? |
| Friday | Ship review (45min) | All of the above | What ships Monday? |
| Friday | Retro (30min, bi-weekly) | Full team | What's working, what's broken |

### 7.2 Documentation norms

- Every feature has a PRD (3–5 pages): problem, solution, acceptance criteria, risks.
- Every architecture decision has an ADR (Architecture Decision Record): context, options considered, decision, consequences. Stored in the repo.
- Every incident has a postmortem. Published internally within 5 business days.
- Every integration has an `adapters/<service>/README.md` documenting scopes, rate limits, gotchas.

### 7.3 How product decisions get made

Three types of decisions:

- **Reversible (95% of decisions):** Team lead decides. Move fast.
- **One-way-door technical (privacy model, data schema, safety policy):** CTO decides with written rationale.
- **One-way-door strategic (pricing change, major pivot, integration deprecation):** Founder + leadership team decides, documented.

Default: bias toward reversibility.

---

## 8. The Safety Process — The Immune System

This is the process that runs *continuously* around every other process.

### 8.1 Three lines of defense

```
LINE 1: Input validation
  - Every user input goes through a deterministic sandbox classifier
  - LLM-generated content is schema-validated against tool registry
  - Untrusted external content (emails, API responses) is tagged as untrusted
    and passed through Llama Guard before entering LLM context

LINE 2: Action-level enforcement
  - Sandbox classifier assigns risk level (low/medium/high/critical)
  - High/critical actions require biometric gate
  - All actions have a budget (rate limit per user per hour)
  - Circuit breaker detects anomalies (runaway loops, unusual patterns)

LINE 3: Post-action reversibility
  - 30-second undo window for all reversible actions
  - Compensating transactions for irreversible actions
  - Full audit log for forensic review
  - Account-level pause button for the user
```

### 8.2 The adversarial testing ritual

Every quarter, the team runs a formal red-team exercise:
1. Internal red team (security engineer + outside contractor) attempts 100+ attack scenarios:
   - Prompt injections via email
   - Impersonation attacks
   - Privilege escalation
   - Data exfiltration attempts
   - Bulk-action abuse
2. Every successful attack becomes a test case in the adversarial test suite (grows to 500+ cases).
3. Every discovered weakness becomes a ticket with SLA (critical: 48h; high: 1 week; medium: 1 month).
4. Results reviewed by leadership and published internally.

### 8.3 User-reportable safety process

- Every action card has a "Report a concern" link.
- Reports route to Trust & Safety queue with 24h SLA.
- Patterns across reports trigger review of the underlying capability.
- Repeated policy violations by a user result in account suspension.

---

## 9. Data Lifecycle Process

A user's data follows this lifecycle:

```
CREATION
  User authorizes integration → tokens encrypted with user-specific key → stored in vault
  User data flows from integrations → classified → summarized → stored in memory hub

ACTIVE USE
  Memory retrieved on every ReAct loop (pgvector similarity search, ~50–300ms)
  Frequently retrieved memories stay "warm"
  Rarely retrieved memories cool off

ARCHIVAL (after 90 days of inactivity)
  Cold memories moved to S3 + DynamoDB (cheaper, slower)
  Can be resurrected on demand (~200ms extra latency)

DELETION (GDPR right to erasure)
  User requests deletion via web or in-app
  Cascade delete across 8 tables + S3 prefix + pgvector namespace + Kafka consumer offset reset
  Completes within 30 days (GDPR SLA)
  Confirmation email sent to user
  OAuth tokens revoked with all third parties

ACCOUNT EXPORT (GDPR right to portability)
  User requests data export
  Background job exports all data in JSON format
  Signed URL delivered via email, valid 7 days
```

---

## 10. Process Summary at a Glance

| Layer | Key process | Measure of health |
|---|---|---|
| Development | Safety-first build order, feature flag rollouts | Cycle time from merge to 100% rollout |
| Runtime | ReAct loop, sandbox + circuit breaker, SDUI | AAPUW, action success rate, chain failure rate |
| User experience | Morning briefing, graduated trust, undo | Day-30 retention, NPS, action approval rate |
| Operations | On-call rotation, incident response, postmortems | MTTR, SEV-1 rate, incident recurrence |
| Safety | Three lines of defense, adversarial tests, red team | Adversarial suite pass rate (target 100%) |
| Data lifecycle | Ingest → memory → archive → deletion | GDPR SLA compliance, archival efficiency |

The common thread across all processes: **every step is instrumented, every action is reversible, and every failure has a documented recovery path.** That is what makes an agentic AI product trustworthy at scale.

---

*This document should be revised every 6 months as the system matures and new processes emerge.*

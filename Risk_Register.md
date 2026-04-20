# Aldrich — Risk Register & Mitigations

**Document purpose:** A living catalog of every risk that could kill, stall, or materially damage Aldrich — the omnipresent personal AI assistant. Each risk is scored, owned, and paired with concrete triggers, mitigations, and contingency plans.

**Document audience:** Founders, investors, board, exec team. Re-reviewed quarterly.

**Version:** v1.0 — Initial register based on Business Plan + Technical Master Plan + Feasibility Analysis.

---

## How to read this register

Every risk entry contains:

**Likelihood** — Probability this risk materializes over the next 18 months.
- Very Low (<5%) / Low (5–20%) / Medium (20–50%) / High (50–80%) / Very High (>80%)

**Impact** — Severity if it happens.
- Cosmetic (annoying, easy to fix) / Minor (slows a roadmap item) / Major (forces a pivot or significant rework) / Severe (threatens fundraise or retention) / Existential (company dies)

**Risk Score** — Qualitative rating from combining likelihood × impact. Reviewed monthly.

**Trigger** — The observable signal that tells us the risk is happening *now*, not hypothetical.

**Mitigation** — Prevention. What we do *before* the risk fires to reduce likelihood or impact.

**Contingency** — Response. What we do *when* the trigger fires.

**Owner** — Named individual (by role) accountable. Not a team; a person.

**Monitoring cadence** — How often we check the trigger signals.

---

## Risk summary dashboard

| # | Category | Risk | Likelihood | Impact | Score | Owner |
|---|----------|------|-----------|--------|-------|-------|
| 1 | Platform | iOS always-on listening blocked | Very High | Severe | Critical | CTO |
| 2 | AI | LLM reliability at long chains (<80%) | High | Severe | Critical | Head of AI |
| 3 | Platform | App Store / Play Store rejection | Medium | Severe | High | CEO |
| 4 | AI | Prompt injection / jailbreak in production | High | Major | High | Head of Security |
| 5 | Financial | Runway exhaustion before PMF | Medium | Existential | Critical | CEO / CFO |
| 6 | Competitive | Apple/Google ship first-party equivalent | High | Severe | Critical | CEO |
| 7 | User trust | First public trust incident (wrong action, leaked data) | High | Severe | Critical | CEO / Head of Safety |
| 8 | Regulatory | GDPR/CCPA/EU AI Act violation or investigation | Medium | Major | High | Legal counsel |
| 9 | Technical | API integration breakage cascade | Very High | Minor | Medium | Head of Integrations |
| 10 | Financial | LLM unit economics inversion | Medium | Severe | High | CFO |
| 11 | Market | Low willingness to pay / weak conversion | Medium | Severe | High | CPO |
| 12 | Operational | Key-person dependency | Medium | Major | High | CEO |
| 13 | Product | Memory drift / contradiction accumulation | High | Major | High | Head of AI |
| 14 | Platform | iOS Shortcuts deprecated or throttled | Low | Severe | High | CTO |
| 15 | Product | Over-automation causes user backlash | Medium | Major | High | CPO |
| 16 | Security | Data breach (user memory leaked) | Low | Existential | Critical | Head of Security |
| 17 | Financial | Unable to raise Series A | Medium | Existential | Critical | CEO |
| 18 | Legal | IP litigation (patent troll or incumbent) | Low | Major | Medium | Legal counsel |
| 19 | Ops | Vendor lock-in / Anthropic pricing change | Medium | Major | High | CTO |
| 20 | Talent | Unable to hire AI talent in competitive market | Medium | Major | High | CEO |
| 21 | Product | Voice-first UX rejection (users prefer text) | Low | Major | Medium | CPO |
| 22 | Market | Incumbent bundling undercuts pricing | High | Major | High | CEO |
| 23 | Regulatory | Forced to become a licensed AI service provider | Low | Severe | High | Legal counsel |
| 24 | Technical | On-device LLM quality plateau | Medium | Major | High | Head of AI |
| 25 | Operational | Support load explodes | High | Minor | Medium | Head of CX |

Critical risks require weekly review at exec meeting. High risks reviewed monthly.

---

## Category 1: Platform & Distribution Risks

These are risks that stem from the fact that Aldrich lives inside two walled gardens — Apple and Google — controlled by companies that could at any point change the rules, block an update, or ship a competing feature.

### Risk #1 — iOS always-on listening is not feasible (Critical)

**Description:** The original vision includes "ambient listening" — Aldrich captures conversations passively, surfaces relevant info in the moment, and builds a richer memory from overheard context. On iOS this is not possible. The OS enforces an orange indicator dot whenever a mic is live, kills background audio sessions after short windows, and requires foreground activation for any mic use in practice. Any attempt to circumvent this is grounds for App Store rejection, and no workaround has lasted through a major iOS release since iOS 14.

**Likelihood:** Very High — it's effectively a certainty, this is the current state of iOS.

**Impact:** Severe — a core vision pillar ("omnipresent") must be reframed or engineered around.

**Trigger signals:**
- Review team writes "background audio" into MVP scope.
- Marketing copy promises "always listening" or "ambient capture."
- Any iOS entitlement request for extended background audio.

**Mitigation (prevention):**
- Reframe the product language: from "omnipresent" to "present on demand." Aldrich responds when summoned (wake word from foreground, watch tap, Action Button, lock-screen widget). No false promises.
- Build the iOS product around push-triggered moments: location arrival, calendar-triggered briefings, notification-arrival interception. These give the *feeling* of omnipresence without requiring always-on mic.
- On Android, exercise the Accessibility Service and foreground service capabilities carefully — but with the same "user must feel in control" philosophy, not as a loophole.
- Update every piece of external copy — pitch deck, landing page, investor memo — to eliminate "always-on listening" language before V1.

**Contingency (if triggered):**
- If a reviewer or investor is under the impression that iOS background listening is part of the plan, proactively correct it with the above mitigation set. Do not let the misperception persist — it's a trust-eroder when they find out.
- If a user requests it: explain the OS constraint, demonstrate the alternative proactive moments, and ask what specific scenario they wanted it for (almost always we can solve the underlying job with a trigger-based design).

**Owner:** CTO. Engineering lead accountable for enforcing this boundary in scope and copy.

**Monitoring:** Reviewed during every scope conversation and at monthly marketing-copy review.

---

### Risk #2 — App Store or Play Store rejection during launch

**Description:** Aldrich's value proposition depends on deep, cross-app actions: reading and replying to messages, drafting emails, booking travel, controlling smart home. Each of these touches App Store review triggers: background activity, accessibility usage, deep OS hooks, automation. Apple in particular has a history of rejecting apps that appear to "replicate OS functionality" (which is much of what Aldrich does).

**Likelihood:** Medium (30–40%) — for the initial submission; Low for later updates once approved.

**Impact:** Severe — a rejected app delays launch by weeks, costs runway, and publicly signals distress.

**Trigger signals:**
- Review feedback with guideline numbers 2.5.1 (OS functionality), 4.0 (design), or 5.1.1 (privacy).
- 14+ days in review with no response (escalation needed).
- A policy update from Apple or Google that implicates assistant apps.

**Mitigation (prevention):**
- Pre-launch App Store Office Hours meetings with Apple's developer relations. Walk them through the product *before* submission. Ideally secure a positive signal.
- Scope the V1 to the *least OS-intrusive* feature set possible: voice briefing, calendar summarization, memory search, user-invoked actions only. Defer automation.
- Do not use private APIs. Do not attempt background-listening workarounds. Do not scrape data from other apps.
- Every permission request is paired with a plain-English in-app explanation *before* the system prompt, so the reviewer understands why.
- Use Apple's own Intents and Shortcuts framework as the primary automation surface — Apple approves of this pattern.
- Prepare a 2-minute screen recording that demonstrates the reviewer-relevant flows. Attach to the submission.
- Have a legal-reviewed privacy policy and DPA ready to link.

**Contingency (if rejected):**
- Day 1: Read the rejection notice carefully, identify the exact guideline cited, do not attempt to re-submit.
- Day 2: File an appeal if the rejection is factually wrong, or begin the fix if it's valid.
- Day 3–5: Engineer the minimum change to pass; re-submit with a detailed explanation note.
- If rejected twice on the same grounds, request a live call with App Review.
- If rejected three times: pivot the affected feature out of V1, ship without it, add back later via Shortcuts/extension rather than in-app.
- Always have a *backup UI surface* — a web app or companion site — so that even if the mobile app is blocked, the product can demo to early users.

**Owner:** CEO (relationship), CTO (technical response).

**Monitoring:** Pre-launch weekly; post-launch after every major submission.

---

### Risk #3 — Apple or Google ships a first-party equivalent

**Description:** Apple Intelligence and Google Gemini are both moving toward personal AI agents tied into OS primitives — contacts, calendar, messages, photos, and on-device LLMs. At WWDC or Google I/O in any given year, either can announce a feature that makes a significant portion of Aldrich's value redundant, bundled free with the OS. Historically, Apple has absorbed category-defining third-party apps (Sherlock, Tweetie, F.lux-style features).

**Likelihood:** High (60–80% over 24 months). Not *all* of Aldrich's value will be absorbed, but enough to materially change the positioning fight.

**Impact:** Severe — re-framing, loss of some differentiation, narrative pressure with investors.

**Trigger signals:**
- WWDC / Google I/O announcements mentioning personal agents, cross-app Siri/Assistant memory, or proactive suggestions tied to calendar + mail + messages.
- Siri/Assistant demos that do multi-step tasks ("summarize my inbox and put the top 3 on my calendar").
- Public news of on-device LLM models launched by Apple or Google for developers.

**Mitigation (prevention):**
- Build where the platforms *won't* — cross-platform (iOS + Android + web + desktop), cross-app including non-native integrations (Notion, Slack, Linear, Airtable, Jira, etc.), opinionated proactive behaviors, memory sovereignty.
- Own the "category of one" narrative: "your data, your agent, not Apple's." Target users who distrust big tech with their full life data.
- Integrate with OS primitives where available (Shortcuts, App Intents) so we *benefit* from platform improvements rather than compete with them.
- Maintain a 6-month feature runway ahead of the incumbents on proactive behavior — this is our moat, not feature coverage.
- Build B2B/prosumer use cases (integration depth, team memory, custom agents) that Apple/Google are structurally slow to ship.

**Contingency (if triggered):**
- Same week of announcement: Publish a blog post articulating the difference (data ownership, cross-platform, non-native app coverage, customization).
- Customer-facing: Email blast to existing users with "here's what changed and why Aldrich is still the right choice for you."
- Internal: Board meeting within 2 weeks to re-assess roadmap and positioning.
- If direct feature overlap >60%: Pivot to a narrower wedge — e.g., B2B only, or a specific vertical (sales, consultants) where cross-platform + integration depth wins.

**Owner:** CEO.

**Monitoring:** WWDC (June), Google I/O (May), and any mid-year announcement event.

---

### Risk #14 — iOS Shortcuts / App Intents deprecated or throttled

**Description:** Much of Aldrich's iOS automation path relies on App Intents and the Shortcuts framework. If Apple deprecates, restricts, or throttles this path (as they have with other developer capabilities), a chunk of the product's cross-app functionality breaks.

**Likelihood:** Low (10–20%) — Apple is actively expanding App Intents, but they have moved quickly in the past.

**Impact:** Severe — core automations degrade or break.

**Trigger signals:**
- Deprecation notice in iOS release notes.
- Rate limits introduced on Shortcuts execution.
- App Intents API surface shrinks between iOS versions.

**Mitigation (prevention):**
- Do not rely on a single automation path. Every cross-app action should have a fallback: Shortcut → native SDK if available → web/API integration → manual user assist.
- Maintain a scoped abstraction layer ("ActionAdapter") so automation backends are swappable per platform.
- Join Apple's developer program as a named developer, not anonymous. Participate in feedback sessions. Being visible helps with exception requests.

**Contingency (if triggered):**
- Pivot affected features to the next-best automation path listed above.
- Communicate transparently with users — "Apple has changed X, so we're working around it" is far better than silent degradation.
- Accelerate the web/desktop surface if iOS becomes too hostile.

**Owner:** CTO.

**Monitoring:** Each iOS beta release; monthly review of App Intents change log.

---

## Category 2: AI and Product Reliability Risks

These are risks that come from the probabilistic nature of LLMs: they will make mistakes, they will drift, they will be adversarially attacked. The mitigation strategy has to accept that the *model itself* will fail some percentage of the time, and make the *system* safe anyway.

### Risk #2 (duplicate numbering — the AI one) — LLM reliability at long tool chains (Critical)

**Description:** Per the feasibility analysis, LLM tool calls succeed at roughly 97% per step. An 8-step chain therefore fails end-to-end about 22% of the time. For Aldrich's positioning as an "agent" — where multi-step workflows are the value — this is disastrous. A 22% failure rate on a single chain means no user trusts it twice.

**Likelihood:** High (60–70%) if we attempt long chains in V1.

**Impact:** Severe — loss of trust, churn.

**Trigger signals:**
- Internal testing shows <85% success rate on 5-step chains in beta.
- User complaints about "it got confused halfway through."
- Support tickets referencing partial completions.

**Mitigation (prevention):**
- **Cap chain depth in V1:** No automation should exceed 3 tool calls without explicit user confirmation at each subsequent step.
- **Approval gates:** Every non-reversible action (send, pay, book) requires explicit user approval per step.
- **Classifier + router:** Classify intents into "simple deterministic" (calendar lookup, memory search — these route to traditional code) vs. "reasoning-required" (these go to LLM). Keep the LLM off the deterministic paths.
- **Retry with decay:** On tool failure, retry once with reduced context. If still failing, degrade gracefully — explain to user what partial completion was done.
- **Eval harness:** Maintain an internal eval set of 200+ realistic chains. Run weekly; track pass rate. Block releases if pass rate drops >5%.
- **Circuit breaker:** If three user-visible errors happen in a single session, pause further autonomous action and prompt the user.

**Contingency (if triggered):**
- Immediate: Tighten approval gates across the board (promote optional approvals to mandatory).
- Short-term: Reduce chain depth cap system-wide; communicate this change to users as a "quality improvement."
- Medium-term: Invest in a planner model that outputs plans *before* execution, validated by a critic model, before running.

**Owner:** Head of AI.

**Monitoring:** Weekly eval harness; daily error rate dashboard.

---

### Risk #4 — Prompt injection / jailbreak attacks in production

**Description:** An attacker embeds instructions in an email, calendar invite, document, or web page that Aldrich reads as context. Those instructions tell Aldrich to exfiltrate memory, send money, change settings, or take destructive action. This is not theoretical — it's one of the top threats to any LLM-agent system today, and there is no fully reliable defense.

**Likelihood:** High (70%+) — attempts will happen; the question is how many succeed.

**Impact:** Major (if caught early) to Severe (if a successful breach goes public).

**Trigger signals:**
- Red-team finds a working injection in internal eval.
- User report describes unexpected actions ("Aldrich emailed someone I didn't ask it to").
- Security audit flags context-handling weakness.

**Mitigation (prevention):**
- **Content-role separation:** All content read from external sources (emails, docs, pages) is wrapped in a clearly delimited "untrusted content" tag and the system prompt instructs the model never to execute instructions found inside.
- **Instruction quarantine:** A first-pass classifier (small on-device model) flags any content that looks like it's trying to issue instructions; flagged content is either stripped of imperatives or surfaced to the user for review.
- **Hard-coded allowlist of destructive actions:** A separate, non-LLM policy engine approves or denies actions like "send money," "send email to new recipient," "delete data," "share memory." LLM output that requests these goes through a second-stage confirmation dialog with the user.
- **Biometric gate:** Any action in a "high-trust" category (payment, bulk email, data deletion) requires Face ID / Touch ID at time of action.
- **Memory-write permission:** Content read from external sources cannot write to long-term memory without an explicit user tap.
- **Red-team program:** Continuous internal red-teaming plus an external bounty program within 6 months of launch.
- **Undo stack:** Every reversible action is logged and undoable for 30 days. This gives us recovery from a successful injection even if detection fails.

**Contingency (if triggered):**
- Hour 1: Trigger the kill switch for any action class implicated. Disable the action entirely globally until root cause is known.
- Hour 2–24: Incident response — notify affected users, log all actions taken while the vector was active, estimate blast radius.
- 24–72h: Public postmortem (for any user-affecting incident) with root cause and fix.
- Ongoing: Add the specific vector to the eval harness so we catch regressions.

**Owner:** Head of Security.

**Monitoring:** Continuous — any action taken by Aldrich is logged; anomaly detection runs on the log stream.

---

### Risk #13 — Memory drift and contradiction accumulation

**Description:** Aldrich's long-term memory (Cognimemo) stores facts. But the world changes. A user who "works at Google" will later work somewhere else. A "favorite coffee shop" closes. A "spouse's birthday" was wrong once and Aldrich memorized it. Over months, contradictory facts pile up and the system has no authoritative signal about which is current. Retrieval quality degrades; the assistant feels dumb.

**Likelihood:** High (70%+) over 18+ months of use for a long-tenured user.

**Impact:** Major — degraded value prop precisely for the highest-value (longest-tenured) users.

**Trigger signals:**
- Retrieval quality eval shows declining precision on memory-heavy queries.
- User complaints of "it keeps getting my X wrong."
- Support tickets tagged "memory error."

**Mitigation (prevention):**
- **Fact provenance:** Every memory record stores source (conversation, document, inference), timestamp, and user-confirmation flag.
- **Recency bias in retrieval:** Newer facts weighted higher at retrieval time unless explicitly marked "stable."
- **Contradiction detector:** A background job scans for contradictions (same entity, conflicting values) and surfaces to user for resolution ("I have two job titles for you. Which is current?").
- **Memory-hygiene rituals:** Monthly "memory review" UI where user skims flagged items.
- **Forgetting curve:** Facts not referenced in 90 days decay in retrieval weight; facts not referenced in 365 days move to cold storage.
- **User-authoritative override:** User can pin any fact as canonical ("pinned memory") which overrides all inferred variants.

**Contingency (if triggered):**
- User-facing: In-app memory review flow ("help me clean up your profile").
- System-wide: Emergency retrieval-weight adjustment if a release makes drift worse.
- Long-term: Structured memory for high-value entity types (employer, location, spouse, routines) — move these out of the vector store and into a typed schema with explicit "current" and "historical" fields.

**Owner:** Head of AI.

**Monitoring:** Weekly retrieval eval; monthly user NPS survey tagged by tenure.

---

### Risk #15 — Over-automation causes user backlash

**Description:** Users say they want "automation," but the product can cross a line — acting too proactively, making assumptions, executing actions they didn't sanction. This produces anger, not delight. "Why did you just send that?" is a churn moment.

**Likelihood:** Medium (40–50%) — depends entirely on our UX discipline.

**Impact:** Major — churn, public complaints, trust erosion.

**Trigger signals:**
- Negative app reviews mentioning "did things I didn't ask."
- High rate of undo-stack usage on a given feature.
- Social media post about "creepy" or "presumptuous" behavior.

**Mitigation (prevention):**
- **Default to suggest, not act:** Every new feature ships as a suggestion first. Automation is opt-in, per feature.
- **Transparent logs:** User can always see "what did Aldrich do today?" in plain language.
- **Dial of control:** Global settings — "Ask me for everything / ask me for money and new people / trust for low-stakes / full autopilot." Default is middle tier.
- **Celebration of restraint:** The UX should occasionally *not* act and explain why ("I noticed X but didn't want to assume. Here's a draft for you").

**Contingency (if triggered):**
- Emergency patch: Elevate permission level for the affected feature to "approval required."
- Public acknowledgment: Explain in release notes.
- Product review: Dig into whether the feature should exist at all.

**Owner:** CPO.

**Monitoring:** Daily review of app store reviews and support tickets; weekly user-session recordings.

---

### Risk #24 — On-device LLM quality plateau

**Description:** A key cost-saving strategy is running intent classification and simple responses on-device with small models (Gemma 2B on Apple Neural Engine, equivalent on Android). If these models stall out at quality levels that can't keep pace with user expectations set by cloud LLMs, we either pay cloud costs for everything (ruining unit economics) or ship a worse experience.

**Likelihood:** Medium (30–40%).

**Impact:** Major — unit economics pressure or quality regression.

**Trigger signals:**
- On-device eval accuracy plateaus below cloud equivalents by >15%.
- Updates to on-device models yield diminishing returns.
- Hardware generations stop delivering meaningful NPU improvements.

**Mitigation (prevention):**
- Design the router so that on-device handles only well-scoped tasks (intent classification, extraction, simple retrieval) where small-model quality is sufficient.
- Keep reasoning and generation on cloud where needed.
- Continuously evaluate new on-device models (Phi, Llama-small, Gemma variants) every quarter.

**Contingency (if triggered):**
- Shift marginal tasks to cloud; absorb the cost hit temporarily.
- Raise prices on the Power tier to recover margin.
- Invest in better on-device routing (accept-or-escalate pattern).

**Owner:** Head of AI.

**Monitoring:** Quarterly on-device eval against cloud baseline.

---

## Category 3: Financial Risks

### Risk #5 — Runway exhaustion before PMF (Critical)

**Description:** The Cost Feasibility analysis shows Year 1 burn of ~$2.55M. If we raise less, spend faster, or take longer to find product-market fit, we will hit zero before metrics support a Series A. The most common founder-killing failure mode.

**Likelihood:** Medium (30–40%) — baseline for seed-stage consumer AI products.

**Impact:** Existential.

**Trigger signals:**
- Cash runway drops below 9 months.
- Burn multiple (net burn ÷ net new ARR) exceeds 3x.
- Fundraising conversations past Month 9 with no term sheet.

**Mitigation (prevention):**
- **Raise $4M, plan for $3M, spend $2.5M.** Maintain 25% buffer.
- **Burn discipline monthly:** CEO/CFO review actual vs. plan, with hard stop at +10% variance that triggers immediate scope cut.
- **Milestone-gated spend:** Critical hires are contingent on specific product milestones. If product slips, hire slips.
- **Revenue milestones early:** Start revenue-generating beta at Month 6, not Month 12. Even $10K MRR by Month 9 improves Series A positioning dramatically.
- **Stage the fundraise:** Raise seed, hit explicit metrics, raise extension, then hit A-metrics. Don't plan for one giant round.

**Contingency (if triggered):**
- 9 months of runway left: Freeze all hiring, cut discretionary spend, accelerate fundraise.
- 6 months: Layoffs of non-essential roles, defer planned investments, pivot to cash-generating features (increase paid conversion, contact B2B prospects).
- 3 months: Existential mode. Bridge round from existing investors or down-round. Consider acquihire discussions in parallel.
- 1 month: Notify board, pursue emergency options, avoid irreversible decisions (don't sign a bad deal under duress).

**Owner:** CEO, with CFO once hired.

**Monitoring:** Weekly cash position; monthly board update; quarterly model re-forecast.

---

### Risk #10 — LLM unit economics inversion

**Description:** Per the cost model, Aldrich pays ~$3.39 per user per month in LLM costs at 10K-user scale, against an average subscription revenue of ~$14.70 (after App Store fees). If Anthropic raises prices, or power users consume 5x the average, or we get popular with a non-paying tier, unit economics can invert and every user becomes a net loss.

**Likelihood:** Medium (30%).

**Impact:** Severe — margin compression blocks Series A.

**Trigger signals:**
- Average LLM cost per user exceeds $5/month.
- Power-user (top 5%) LLM cost exceeds $25/month.
- Anthropic announces a pricing change > 20%.

**Mitigation (prevention):**
- **Multi-provider strategy:** Maintain live integrations with Claude, GPT, and a backup (open-source via AWS Bedrock or similar). Route cheapest model that meets quality bar per task.
- **Aggressive caching:** Deterministic sub-responses cached; repeated queries served without LLM call.
- **Token-budget enforcement:** Per-user daily token budget; Free tier at ~10K tokens/day, Pro at 100K, Power at 300K. Transparent limits.
- **Router with quality tiers:** Use cheapest model that passes eval for each task class.
- **Price changes baked into contracts:** Negotiate volume-tier commitments with providers with advance-notice clauses.

**Contingency (if triggered):**
- Short-term: Increase free-tier rate limits; nudge heavy free users to paid.
- Medium-term: Raise prices with 60-day notice, framed as investment in quality.
- Long-term: Accelerate on-device handling for more classes of queries.

**Owner:** CFO (when hired), CTO pre-CFO.

**Monitoring:** Daily cost-per-user dashboard; monthly cohort unit-economics review.

---

### Risk #17 — Unable to raise Series A

**Description:** Even if we execute well, the Series A market for consumer AI is selective. Metrics that would have raised easily in 2021 don't clear the bar today. Series A requires demonstrable retention, conversion, and revenue — not just user count.

**Likelihood:** Medium (30–50%).

**Impact:** Existential.

**Trigger signals:**
- No term sheets 6 weeks into an active raise.
- Investor feedback clusters around a specific gap (retention, conversion, LTV).
- Comparable consumer AI rounds drying up.

**Mitigation (prevention):**
- **Retention-first product:** Day-1, Day-7, Day-30 retention should be healthy before going out to raise.
- **Capital efficiency story:** Show LTV:CAC improving cohort-over-cohort.
- **Moat narrative:** Memory sovereignty, cross-platform, proactive behavior — a defensible story that isn't just "we have an LLM."
- **Investor relationships built early:** CEO maintains quarterly updates with ~25 Series A investors starting at seed close.
- **Revenue story:** Paid conversion and ARPU trends preferred over raw DAU.
- **Alternative capital:** Revenue-based financing, bridge extensions, strategic investors (e.g., a platform partner).

**Contingency (if triggered):**
- Extend runway via bridge round from existing investors at current cap.
- Pivot to a more efficient GTM (B2B, paid-from-day-one, niche vertical).
- Accept smaller A at lower valuation rather than no A.
- In worst case: lifestyle business path — $5–10M ARR as profitable standalone.

**Owner:** CEO.

**Monitoring:** Quarterly investor pipeline review.

---

### Risk #11 — Low willingness to pay / weak paid conversion

**Description:** Consumers often say they'd pay $10–20/month for an AI assistant; far fewer actually do. Paid conversion for consumer AI has historically been 2–5% of DAU. The business plan's projections assume something in that range. If actual conversion is below 2%, unit economics and revenue plans collapse.

**Likelihood:** Medium (40%).

**Impact:** Severe.

**Trigger signals:**
- Trial-to-paid conversion below 15% after 30 days in paid-trial cohort.
- Free-tier users showing usage but not converting at 90 days.
- NPS high but paid conversion low — signals "love it but wouldn't pay."

**Mitigation (prevention):**
- **Paywall design tested early:** A/B test price points ($8, $15, $25, $35) in first 1K paying users cohort.
- **Anchor to pain-point moments:** Prompt upgrade at the exact moment user hits a free-tier cap on something they value.
- **Annual discount:** 20% off for annual commit; doubles conversion historically.
- **Team plans:** Power users bring their team/family — shifts psychology and ARPU.
- **Feature-gated premium:** A specific "only on Pro" feature that appears often enough in free usage to pull conversions.

**Contingency (if triggered):**
- Re-test pricing: $10 Pro, $25 Power.
- Add a "pay what you think" tier for feedback learning.
- Pivot to B2B where willingness to pay is dramatically higher.
- Freemium-to-pay flows overhauled — longer free period, harder cap.

**Owner:** CPO.

**Monitoring:** Weekly cohort conversion; monthly pricing page A/B results.

---

## Category 4: Trust, Security & Regulatory Risks

### Risk #7 — First public trust incident (Critical)

**Description:** Aldrich will, at some point, take a wrong action or leak a piece of data in a way that becomes public. It could be sending an embarrassing message, booking a wrong flight, mis-summarizing to a boss, or memorizing something it shouldn't. Whether it becomes a churn event for one user or a press cycle for the company depends on how we respond.

**Likelihood:** High (80%+) over 18 months — something will go wrong publicly.

**Impact:** Severe if handled poorly; Minor if handled well.

**Trigger signals:**
- Support ticket or social media post about Aldrich doing something wrong publicly.
- Journalist asking for comment about an incident.
- Sudden spike in negative reviews citing trust.

**Mitigation (prevention):**
- **Comprehensive incident response plan:** Pre-written playbooks for trust incidents, owner defined, comms drafted.
- **Transparency as default:** Every action logged, user-visible, reversible. Incident visibility = incident recovery.
- **"Restraint over reach" product principle:** Every PRD asks "what's the worst thing this feature can do?" and whether we can defuse it pre-launch.
- **User pre-flight:** For risky actions, show what Aldrich is about to do and require approval. This makes incidents easier to explain ("user approved") and rarer in absolute numbers.

**Contingency (if triggered):**
- Hour 1: Acknowledge privately to affected user. Do not deflect.
- Hour 2: Internal incident channel opened. CEO, Safety, CX, Comms on call.
- Hour 4: Decision on user-base-wide communication. Default to yes, transparent.
- Day 1: Public postmortem if scale > 100 users or press attention > one tweet.
- Day 3: Product change to prevent recurrence deployed.
- Day 7: All affected users directly contacted with explanation and remedy.

**Owner:** CEO for incident leadership; Head of Safety for technical response.

**Monitoring:** Daily review of support tickets and social media; weekly incident review.

---

### Risk #16 — Data breach (user memory leaked)

**Description:** Aldrich's memory contains the most sensitive data a user has: personal relationships, plans, health, finances, work. A breach isn't "500M credentials on HaveIBeenPwned" — it's "your life story is on 4chan." This is uniquely existential for a product like ours.

**Likelihood:** Low (5–10% over 24 months). Industry rate for startups with average security hygiene.

**Impact:** Existential.

**Trigger signals:**
- Unauthorized access alert in monitoring.
- Security researcher reports a critical vulnerability.
- Anomalous data access patterns detected.

**Mitigation (prevention):**
- **Encryption at rest and in transit** for all user data — not negotiable.
- **Per-user encryption keys** held in user-controlled keychain; keys are not accessible to Aldrich staff.
- **Least-privilege access internally:** No engineer has access to raw user memory except via audited, alerted break-glass procedure.
- **SOC 2 Type II** within 12 months of launch; ISO 27001 within 24.
- **Continuous external pentesting**: quarterly with rotating firms; annual security audit.
- **Bug bounty program** launched before 10K paying users.
- **Zero-knowledge architecture target:** Client-side encryption for highly sensitive memory classes ("finances," "health") by Year 2.

**Contingency (if triggered):**
- Hour 0–2: Containment. Revoke keys, isolate affected systems.
- Hour 2–12: Scope assessment. Which users, which data, attack vector.
- Hour 12–72: Legal notifications per GDPR/CCPA (72h notification requirement).
- Week 1: Public disclosure; individual user notifications.
- Week 2: Independent forensic review; remediation plan published.
- Ongoing: Offer credit monitoring, consider free lifetime service for affected users, major security posture upgrade.

**Owner:** Head of Security.

**Monitoring:** Continuous SIEM; quarterly access audit; annual pentest.

---

### Risk #8 — GDPR / CCPA / EU AI Act violation

**Description:** Aldrich is a personal-data-intensive, automated-decision-making system. It falls squarely under GDPR's automated-decision rules, CCPA's personal information definitions, and the EU AI Act's "high-risk" or "limited-risk" categorizations depending on use case. A violation can produce fines up to 4% of global revenue (GDPR) or $7,500 per record (CCPA).

**Likelihood:** Medium (20–30%) — some interpretation error is likely over time.

**Impact:** Major to Severe.

**Trigger signals:**
- DSR (data subject request) that we cannot fulfill within 30 days.
- User complaint to a regulator.
- Audit of our privacy practices flagging a material gap.

**Mitigation (prevention):**
- **Privacy by design:** Data minimization — collect only what's needed; process locally where possible.
- **Clear legal basis** for each data-processing activity, documented in a ROPA (Record of Processing Activities).
- **Data subject rights self-serve:** Users can export, delete, and restrict their data from in-app settings.
- **DPIA (Data Protection Impact Assessment)** completed before launch and updated per major feature.
- **DPO or external privacy counsel** on retainer from Day 1.
- **AI Act compliance map:** For each capability, classify under AI Act (minimal/limited/high risk) and meet the applicable transparency and human-oversight requirements.
- **Transparent privacy policy** written in plain language, not just legalese.

**Contingency (if triggered):**
- Immediate engagement of privacy counsel.
- Cooperate fully with any regulator inquiry.
- Pause affected data-processing activity while investigation is ongoing.
- If violation confirmed: remediate, notify affected users, document for lessons-learned.

**Owner:** Legal counsel / DPO.

**Monitoring:** Monthly DSR tracking; quarterly privacy compliance review.

---

### Risk #23 — Forced into regulated-AI-service status

**Description:** The EU AI Act and analogous laws may categorize Aldrich as a "high-risk" AI system if our actions include health advice, financial decisions, or legal matters. This would require conformity assessments, CE marking, and significantly heavier compliance overhead.

**Likelihood:** Low (10–15%) with careful scope; higher if we expand into health/finance.

**Impact:** Severe — significant compliance cost and timeline hit.

**Trigger signals:**
- Product roadmap includes health, finance, or legal recommendations.
- Regulator contacts us about high-risk classification.
- EU AI Act implementing acts clarify scope against our product.

**Mitigation (prevention):**
- **Scope discipline:** Clearly disclaim that Aldrich is not a medical, legal, or financial advisor. Route these intents to "ask a professional" rather than giving advice.
- **Feature gating by region:** If we add advisory features, gate them out of EU until conformity is achieved.
- **Monitor the AI Act implementing acts** quarterly.

**Contingency (if triggered):**
- Geo-gate affected features.
- Invest in conformity assessment if strategically worthwhile.
- Otherwise, exit that feature class.

**Owner:** Legal counsel.

**Monitoring:** Quarterly EU AI Act update review.

---

### Risk #18 — IP litigation (patent troll or incumbent)

**Description:** AI agent patents are a thicket; AI interaction patterns are heavily patented by Apple, Google, Microsoft, IBM, and a swarm of patent trolls. Even frivolous claims cost legal fees.

**Likelihood:** Low (10–15%) while small; rises with revenue scale.

**Impact:** Major — distraction and cost, rarely existential unless incumbent.

**Mitigation (prevention):**
- **Legal review of key interactions** pre-launch.
- **File defensive patents** on our own novel architecture (memory hub, ReAct routing).
- **Join a patent defense pool** (LOT Network, Open Invention Network) if available and affordable.
- **Insurance:** IP litigation insurance as scale grows.

**Contingency (if triggered):**
- Early-stage troll: Engage specialized counsel, negotiate settlement if cheaper than litigation, but don't set a precedent as easy target.
- Incumbent: Full legal defense, potentially cross-licensing negotiation.

**Owner:** Legal counsel.

**Monitoring:** Annual IP landscape scan.

---

## Category 5: Operational Risks

### Risk #9 — API integration breakage cascade

**Description:** Aldrich integrates with dozens of third-party services. Each service can change its API, rate limits, authentication, or UI. Every change can break Aldrich silently until users complain.

**Likelihood:** Very High — will happen continuously.

**Impact:** Minor per incident; Major cumulative if we don't manage it.

**Trigger signals:**
- Integration-specific error rate spikes.
- User complaints about a specific service.
- Third-party deprecation notice.

**Mitigation (prevention):**
- **Integration health monitoring:** Every integration has synthetic test calls run every 15 minutes; alert on failure.
- **Versioned adapters:** Each integration wrapped in a versioned adapter; new API versions spun up side-by-side and switched after validation.
- **Graceful degradation:** If an integration fails, Aldrich explains it instead of silently breaking ("Can't reach Gmail right now — want me to retry or use a different path?").
- **Scope discipline:** V1 integrates only top 10 services. Don't promise breadth we can't maintain.

**Contingency (if triggered):**
- Alert triggers on-call.
- Hot-fix to adapter deployed within hours.
- User comms if degradation is customer-visible for > 30 minutes.

**Owner:** Head of Integrations.

**Monitoring:** Continuous uptime dashboard per integration.

---

### Risk #12 — Key-person dependency

**Description:** At seed stage, every senior hire is a single point of failure. If the CTO leaves mid-build, the founding AI engineer walks, or a key founder gets sick, the company stalls.

**Likelihood:** Medium (25%) over 18 months.

**Impact:** Major.

**Trigger signals:**
- One person is sole owner of a critical system with no documentation.
- Single person on-call for a critical service 24/7 with no backup.
- Visible burnout signals from key staff.

**Mitigation (prevention):**
- **Pair programming / knowledge shares** on all critical systems.
- **Runbooks** for every key operational task.
- **Equity retention structure:** 4-year vesting with cliff; accelerated on change of control.
- **Cross-training:** Engineers rotate through core systems.
- **Bench depth:** Target 2+ engineers deeply familiar with each critical system within 6 months.

**Contingency (if triggered):**
- Immediate knowledge transfer session with any departing key person during notice period.
- Rapid backfill via existing network; interim delegation of responsibilities.

**Owner:** CEO.

**Monitoring:** Monthly bus-factor assessment for each critical system.

---

### Risk #19 — Vendor lock-in / Anthropic pricing change

**Description:** If we build deeply on Claude-specific features (tool use format, prompt caching patterns, context window), switching providers becomes costly. Anthropic can raise prices, throttle us, or change terms.

**Likelihood:** Medium (25%).

**Impact:** Major.

**Mitigation (prevention):**
- **Provider abstraction layer:** Every model call goes through an internal provider abstraction so model swap is config-only.
- **Parallel testing in prod:** Shadow-test 10% of traffic on a backup provider continuously.
- **Contract negotiation:** Negotiate volume tiers with notice periods for price changes.
- **Diversify early:** Even if Claude is preferred, route intent classification to cheaper open models from day one.

**Contingency:** Switch providers for affected traffic; publish user comms if quality shifts.

**Owner:** CTO.

**Monitoring:** Quarterly provider-cost and quality review.

---

### Risk #20 — Unable to hire AI talent

**Description:** Senior AI engineers and ML researchers are in extreme demand. A seed-stage startup cannot compete on comp with FAANG. Hiring slips cascade into roadmap slips.

**Likelihood:** Medium (30%) for specific roles.

**Impact:** Major.

**Mitigation (prevention):**
- **Compelling mission + equity story:** Consumer AI that touches users' lives is often preferred by mission-driven engineers.
- **Hire early with real equity:** 0.5–2% equity for strong early engineers is worth it.
- **Remote-friendly global hiring:** Expand pool beyond SF/NYC.
- **Founder-led sourcing:** CEO spends 30% of time recruiting through Year 1.

**Contingency:** Contractor network for surge capacity; rebalance roadmap around available talent.

**Owner:** CEO.

**Monitoring:** Monthly hiring pipeline review.

---

### Risk #25 — Support load explodes

**Description:** A product that does a lot for the user generates a lot of "why did it do X?" questions. Support load per user is higher than typical SaaS.

**Likelihood:** High.

**Impact:** Minor per incident; Major cumulative.

**Mitigation (prevention):**
- **In-app "explain that action" button:** Lets users ask Aldrich itself why it did something, reducing support tickets.
- **Self-service memory and action logs.**
- **Tiered support: AI-first, human-second, premium-response for Power tier.**
- **Content marketing and docs** that preemptively answer common questions.

**Contingency:** Scale support team ahead of user growth; prioritize by tier.

**Owner:** Head of CX.

**Monitoring:** Weekly support-ticket-per-user ratio.

---

## Category 6: Competitive and Market Risks

### Risk #6 / #22 — Incumbent bundles or matches

**Description:** Apple, Google, Microsoft, or OpenAI could bundle a personal assistant into their existing products (iCloud+, Google One, M365 Copilot, ChatGPT Plus) that undercuts our paid price or matches our feature set at $0 marginal cost.

**Likelihood:** High (70%+).

**Impact:** Major to Severe.

**Mitigation (prevention):**
- **Don't compete on features they'll copy — compete on neutrality.** Apple won't work well with Google stack; Microsoft won't integrate with Slack competitors; we will.
- **Cross-platform as moat:** Be the one AI assistant that works identically across iOS, Android, Mac, Windows, and web.
- **Memory sovereignty narrative:** User owns their data; can export; we don't train on it. Incumbents can't easily promise this.
- **Community and brand:** Build a loyal user community that prefers us for identity reasons, not just features.

**Contingency:** See Risk #6 playbook above.

**Owner:** CEO.

---

### Risk #21 — Voice-first UX rejection

**Description:** We are betting partly on voice as a primary interaction mode. Users may prefer text / tap / on-screen interaction, especially in public, at work, or in households with others.

**Likelihood:** Low (15%) — most users want multi-modal; we likely over-indexed on voice in demos, but the product supports all modes.

**Impact:** Major if true.

**Mitigation (prevention):**
- **Multi-modal from day one:** Voice, text, tap, generative UI — all primary, not secondary.
- **Usage data-driven UX:** Let telemetry tell us which mode users actually pick.
- **Default sensibly per context:** In a calendar invite, tap. On a walk, voice.

**Contingency:** Re-weight UX toward text/visual if voice usage < 30% of sessions after Month 3.

**Owner:** CPO.

---

## Cross-cutting risks and how we review this register

### Monthly risk review process

1. Exec team reviews the dashboard table at month-start.
2. Any risk with score change is discussed.
3. Triggers fired in prior month → contingency post-mortem.
4. New risks added; outdated risks archived (not deleted — archived with date).
5. Update version number; circulate to board.

### Quarterly deep-dive

Once a quarter, we pick the three highest-score risks and do a 60-minute team deep-dive: "If this fires next month, what's our actual response?" Stress-test the contingency.

### Annual register re-baseline

Annual process with board: zero-based re-creation of the register. Don't just edit last year's; start fresh, then compare to catch what we've unconsciously dropped.

---

## The five risks most likely to kill Aldrich

Weighted by likelihood × impact and adjusted for manageability:

1. **Runway exhaustion before PMF (#5).** Mitigated by disciplined burn and early revenue milestones.
2. **First public trust incident (#7).** Mitigated by design principles and response playbook.
3. **LLM reliability at long chains (#2/AI).** Mitigated by scope cap, approval gates, eval harness.
4. **Apple/Google ship competing feature (#3).** Mitigated by cross-platform, memory sovereignty moat.
5. **Prompt injection in production (#4).** Mitigated by defense-in-depth, undo stack, circuit breaker.

Every one of these is survivable. What isn't survivable is ignoring them. The discipline of this register is to keep them visible even when they feel abstract, so that when the trigger fires, we already know what to do.

---

*End of Risk Register v1.0 — Next review: monthly exec meeting.*

# Aldrich — Cost Feasibility Analysis

> **Purpose:** Deep cost model for building and operating Aldrich. Covers one-time build cost, ongoing operating cost, per-user unit economics, funding requirements by stage, break-even math, and sensitivity analysis.
>
> **Time horizon:** Years 0–3 (pre-launch through Series B readiness).
>
> **Currency:** All figures USD unless noted.
>
> **Assumptions:** Numbers are grounded in the Full Business Plan and Technical Master Plan, with independent cross-checks against public salary benchmarks (Levels.fyi, Blind), AWS public pricing, LLM API public pricing (Anthropic, OpenAI, Google), and observed SaaS unit economics.

---

## 1. Cost Model Overview

Aldrich's cost base has four components:

1. **People** — by far the biggest line, especially in years 0–2
2. **Cloud infrastructure** — scales super-linearly with user count
3. **LLM API usage** — scales with user count × action volume
4. **Third-party software, legal, and compliance** — step-function costs at key milestones

A healthy target: People = 55–65% of total spend; infra + LLM = 20–30%; other = 10–15%. If people is below 50%, you're either underpaying or undercapitalized. If infra+LLM is above 35% at 100k users, unit economics are broken.

---

## 2. One-Time Build Cost (V1 — Months 1–12)

### 2.1 Team cost

The Technical Master Plan implies a 17-week critical-path build with parallel team members. Realistic year-1 team and fully-loaded cost (salary × 1.3 burden rate for benefits, payroll tax, equipment):

| Role | When Hired | Annual Fully-Loaded | Year 1 Cost (pro-rata) |
|---|---|---|---|
| CEO / Founder | Month 0 | $180,000 | $180,000 |
| CTO / Lead Backend (Go, distributed systems) | Month 0 | $340,000 | $340,000 |
| Senior iOS Engineer (SwiftUI, CoreML, Secure Enclave) | Month 1 | $280,000 | $257,000 |
| Senior Android Engineer (Jetpack Compose, on-device ML) | Month 2 | $260,000 | $217,000 |
| ML Engineer (LLM routing, quantization, on-device inference) | Month 3 | $290,000 | $218,000 |
| Product Designer (Mobile UX, SDUI, trust design) | Month 1 | $220,000 | $202,000 |
| Product Manager (Consumer mobile + AI) | Month 4 | $230,000 | $153,000 |
| Security / Backend Engineer (contract, then hire M7) | Month 4 contract | $200,000 contract + $260k salary | $220,000 |
| **Subtotal (people)** |  |  | **$1,787,000** |

**Fringe and perks:** Add ~$50,000 for software licenses, equipment refresh, team meals, office or co-working.

**People cost, Year 1: ~$1.84M**

### 2.2 Legal, compliance, and IP

| Item | Cost | Timing |
|---|---|---|
| Company formation, stock plan, IP assignment | $15,000 | Month 0 |
| Privacy policy + ToS (privacy-specialized attorney) | $25,000 | Months 4–6 |
| GDPR readiness (DPIA, DPA templates, ROPA) | $35,000 | Months 6–9 |
| Trademark (US + EU + UK for "Aldrich") | $8,000 | Month 3 |
| Data Processing Agreements with all vendors | $5,000 (attorney review) | Months 6–8 |
| Pre-launch security audit (external) | $60,000 | Months 10–11 |
| Pre-launch penetration test | $40,000 | Month 11 |
| Cyber liability insurance (year 1 premium) | $18,000 | Month 10 |
| Google OAuth verification (staff time + external review) | $20,000 | Months 2–4 |
| **Subtotal (legal + compliance)** |  | **$226,000** |

### 2.3 Infrastructure and tools (year 1, pre-launch → closed beta)

| Item | Monthly | Year 1 Total |
|---|---|---|
| AWS (dev, staging, prod environments; minimal scale) | $2,500 avg | $30,000 |
| Anthropic (Claude) API — dev + test + early users | $3,000 avg | $36,000 |
| OpenAI + Gemini fallback APIs | $800 avg | $10,000 |
| Cognimemo (V1 memory vendor) | $2,500 avg | $30,000 |
| Supabase Auth + PostgreSQL | $500 avg | $6,000 |
| Datadog (observability) | $1,200 avg | $14,000 |
| GitHub, Linear, Figma, Notion, Slack, Zoom | $900 avg | $11,000 |
| Apple Developer Program + Google Play | $200 | $2,400 |
| Test device farm (~15 real devices: iOS tiers, Android tiers) | — | $12,000 |
| **Subtotal (infra + tools)** |  | **$151,400** |

### 2.4 Marketing and launch (Year 1)

| Item | Cost |
|---|---|
| Brand identity (logo, design system) | $25,000 |
| Marketing site + waitlist | $15,000 |
| Initial content production (hero videos, LinkedIn content, launch assets) | $35,000 |
| ProductHunt launch prep | $5,000 |
| Conference/event attendance (selective) | $20,000 |
| **Subtotal (marketing)** | **$100,000** |

### 2.5 Year-1 total build cost

| Category | Amount |
|---|---|
| People | $1,840,000 |
| Legal + compliance | $226,000 |
| Infrastructure + tools | $151,000 |
| Marketing | $100,000 |
| Contingency (10% of above) | $232,000 |
| **Total Year 1 cost** | **~$2.55M** |

> **Reality check vs. the Business Plan's implied seed:** The Business Plan implies a ~$2M seed. That's underfunded. A realistic seed is **$3.5M–$4M** to give 16–20 months of runway to a credible Series A inflection point.

---

## 3. Ongoing Operating Cost — Infrastructure at Scale

The plan gives a "rough magnitude" cost table by user count. Here is the decomposed version grounded in actual AWS and LLM API pricing.

### 3.1 Infrastructure cost per month, by user count

| Component | 100 users | 10k users | 100k users | 1M users |
|---|---|---|---|---|
| ECS Fargate (API, workers, ReAct engine) | $250 | $3,500 | $18,000 | $120,000 |
| RDS PostgreSQL (primary + read replica) | $180 | $1,200 | $8,500 | $65,000 |
| ElastiCache Redis (Sentinel + cluster mode) | $100 | $600 | $3,500 | $22,000 |
| Kafka (MSK, 3-broker V1 → 12-broker scale) | $350 | $1,200 | $7,000 | $45,000 |
| S3 + object storage (archives, backups) | $40 | $400 | $3,000 | $25,000 |
| CloudFront + data transfer | $50 | $700 | $5,500 | $45,000 |
| pgvector storage + HNSW index | included in RDS | included | $2,500 | $30,000 (migrated to Qdrant) |
| Observability (Datadog APM, logs, metrics) | $600 | $2,200 | $9,500 | $55,000 |
| KMS + Secrets Manager | $50 | $200 | $1,000 | $6,500 |
| Supabase Auth | $150 | $900 | $4,000 | $18,000 |
| Cognimemo (V1) / self-hosted Hindsight (V2+) | $200 | $2,400 | $12,000 | $0 (self-hosted) / +compute $40k |
| **Subtotal (non-LLM infra)** | **$1,970** | **$13,300** | **$74,500** | **$471,500** |

### 3.2 LLM API cost per month, by user count

From the Business Plan: blended LLM cost per Pro user per month is approximately **$1.80–$3.20** using the routing strategy (80% Gemini Flash for simple calls, 15% Claude Sonnet for complex, 5% on-device Gemma). That assumes an *average* user at 8 actions/day.

The honest version of this has higher variance. Realistic distribution:

| User type | % of paid users | Actions/day | LLM cost/user/month |
|---|---|---|---|
| Light (just morning briefing) | 40% | 2 | $0.60 |
| Normal | 40% | 8 | $2.50 |
| Heavy (power user) | 15% | 20 | $7.00 |
| Extreme (multi-context, large inbox) | 5% | 50+ | $22.00 |

**Blended:** 0.40 × $0.60 + 0.40 × $2.50 + 0.15 × $7.00 + 0.05 × $22.00 = **~$3.39/user/month blended**.

That's higher than the plan's $1.80–$3.20 implied blend. The 5% extreme users are the ones who destroy the blended average if not throttled. Soft caps on daily actions are essential.

| User count | LLM cost/month |
|---|---|
| 100 | $340 |
| 10,000 | $33,900 |
| 100,000 | $339,000 |
| 1,000,000 | $3,390,000 |

### 3.3 Combined infra + LLM cost per month

| Scale | Infra | LLM | Total |
|---|---|---|---|
| 100 users | $1,970 | $340 | **$2,310** |
| 10,000 users | $13,300 | $33,900 | **$47,200** |
| 100,000 users | $74,500 | $339,000 | **$413,500** |
| 1,000,000 users | $471,500 | $3,390,000 | **$3,861,500** |

> **Note:** The Business Plan cites $600,000/month infra at 1M users. That figure likely understates LLM costs by ~5x. The real number, without aggressive caching and self-hosted LLM for bulk operations, is closer to **$3.8M/month** at 1M users. This is still <20% of revenue at that scale, but it changes the Series C fundraising math.

### 3.4 Cost-per-user at each scale

| Scale | Cost/user/month | Implication |
|---|---|---|
| 100 | $23.10 | Pre-revenue R&D scale; ignore |
| 10,000 | $4.72 | Healthy if ARPU > $12 |
| 100,000 | $4.14 | Healthy; scale efficiencies kicking in |
| 1,000,000 | $3.86 | Healthy if routing optimization works |

At 10k+ paying users, infra+LLM is ~$4–5/user/month. Against $18 ARPU, that leaves ~$13–14 gross margin before people, legal, and acquisition costs.

---

## 4. Unit Economics

### 4.1 Per-user monthly P&L at scale (100k paying users)

| Line | Amount per user | Comment |
|---|---|---|
| Revenue (blended tier) | $18.00 | Plan's stated ARPU |
| Less: Apple/Google App Store fee (30% on mobile sub) | -$4.50 | Applies to ~70% of subs (mobile checkout) |
| Less: payment processing (Stripe, 2.9% + $0.30 on web subs) | -$0.16 | For web checkouts |
| **Net revenue** | **~$13.50** | After store fees blended |
| Cost of goods sold (LLM + infra + vendor) | -$4.14 | From section 3 |
| Customer support (tier 2 ticket handling) | -$0.75 | ~3% support cost assumption |
| **Gross profit per user** | **~$8.61** | ~48% gross margin net of store fees |

**This is meaningfully worse than the plan's stated 82–90% gross margin.** The plan calculates gross margin *before* the App Store fee. Once that's included, true gross margin is 45–50%. That's still a reasonable SaaS business, but it changes the valuation multiple story.

Two paths to fix:
1. **Drive users to web subscriptions** (no App Store fee): 40%+ web signup conversion gets blended gross margin to ~65%.
2. **Apple's "Reader App" exception** (if Aldrich qualifies): allows external subscription link. Saves ~25% on Apple platform.

### 4.2 Customer Acquisition Cost (CAC)

Most consumer AI products are seeing CAC of $20–60 blended across channels as of 2025–2026. For Aldrich:

| Channel | CAC estimate | Volume assumption |
|---|---|---|
| Organic / word of mouth | $0 | 35–40% of users (the plan says 40%) |
| App Store organic | $3 | 20% of users |
| Content marketing (blended) | $15 | 15% of users |
| Product Hunt / launches | $5 | 5% of users |
| Paid acquisition (Meta, Google) | $45 | 20% of users |
| Influencer partnerships | $35 | 5% of users |

**Blended CAC: ~$20–25**

### 4.3 LTV and payback period

Assumptions:
- Blended gross profit/month: $8.61
- Monthly churn: 5% in months 1–3, 3% in months 4–6, 2% steady-state
- Average user lifetime: 24 months (implied by 2% steady-state churn)

**LTV = $8.61 × 24 = ~$207**

**LTV : CAC = 207 : 22 = ~9.4x** — healthy (target is ≥3x).

**CAC payback period:** 22 ÷ 8.61 = ~2.5 months — excellent (target is <12 months).

**These are strong unit economics IF churn holds at 2%.** If actual monthly churn is 5% (very possible for a new AI product), LTV drops to $172 and LTV:CAC becomes 7.8x — still healthy.

If monthly churn is 8% (likely failure scenario), LTV drops to $108, LTV:CAC becomes 4.9x, still defensible but not great. Below 6% steady-state churn is the threshold for a good business. Below 10% steady-state churn is required to avoid insolvency.

### 4.4 Break-even user count

Target steady-state fixed cost per month (year 3):
- People: ~$1.2M/month (~40-person company)
- Legal / compliance / insurance: ~$60k/month
- Marketing: ~$150k/month
- Overhead (office, software, misc): ~$80k/month
- **Total fixed cost: ~$1.49M/month**

Break-even paying users: $1.49M ÷ $8.61 gross profit per user = **~173,000 paying users**

The plan's year 3 target is 900k paying users → implies ~$7.7M gross profit/month = ~$6.2M net monthly (after fixed cost) = **~$74M annual free cash flow** at that scale. That's extremely strong *if it happens*.

---

## 5. Funding Requirements by Stage

### Stage 1: Seed (Months 0–14)

- **Use:** Build V1, reach 50k paid users (or 5k with strong retention), validate product-market fit
- **Target raise:** $3.5M–$4.5M
- **Valuation range:** $15M–$25M post-money (reasonable for a pre-product AI startup with strong team in 2026)
- **Milestones to hit before Series A:** 25k–50k paying users, >55% Day-30 retention, NPS >40, clear unit economics

### Stage 2: Series A (Months 14–20)

- **Use:** Scale from 50k to 250k paying users; build V1.5 (desktop daemon, 5 more integrations); hire distribution and enterprise prep
- **Target raise:** $15M–$25M
- **Valuation range:** $60M–$150M post-money, depending on ARR trajectory and retention
- **Milestones to hit before Series B:** $15M+ ARR, <6% steady-state monthly churn, proven CAC payback <6 months, early enterprise traction

### Stage 3: Series B (Months 26–36)

- **Use:** Scale to 900k users; international expansion (EU + UK); V2 (on-device LLM, wearable, Hindsight memory migration); enterprise
- **Target raise:** $50M–$80M
- **Valuation range:** $300M–$700M post-money
- **Goal:** Path to IPO at $1B+ valuation or premium acquisition

### Total capital needed to reach 900k users: **~$70M–$110M over 3 years**

This is within normal range for consumer AI at the implied growth rate. The big variable is whether Series B is raisable in 2028 market conditions — which no one can predict.

---

## 6. Runway Math — Why the Seed Must Be ≥$3.5M

**At a $2M seed:**
- Month 1 burn: ~$70k (2 people + infra)
- Month 6 burn: ~$180k (6 people + infra)
- Month 12 burn: ~$280k (8 people + infra + legal + launch)
- Cumulative burn at month 14: ~$2.8M
- **Runs out of cash at month 10–11** before reaching the Series A milestone. Death spiral.

**At a $3.5M seed:**
- Cumulative burn at month 14: ~$2.8M
- Remaining: ~$700k
- **18–20 months runway** to hit Series A milestone with buffer for rework. Survivable.

**At a $4.5M seed:**
- **24+ months runway**; can take a bigger swing on features or distribution. Comfortable.

**Recommendation:** Raise $4M seed at $20M post-money. Dilution ~17%. That's the right balance of runway and founder ownership preservation.

---

## 7. Sensitivity Analysis — What Breaks the Model?

### 7.1 ARPU compression

If competitive pressure forces $18/mo down to $12/mo (likely if Apple or Google launch a $5/mo proactive assistant that's "good enough"):
- Net revenue/user drops from $13.50 to $9.00
- Gross profit/user drops from $8.61 to $4.11
- Break-even user count rises from 173k to **362k** — a much harder target

### 7.2 Churn elevation

If monthly churn is 6% steady-state (instead of 2%):
- LTV drops from $207 to $143
- LTV:CAC drops from 9.4x to 6.5x — still healthy
- But total lifetime revenue drops 30%, which pushes Series B valuations down significantly

### 7.3 LLM cost reduction (upside scenario)

If LLM API pricing drops 50% by end of 2026 (plausible given trend):
- LLM cost/user/month drops from $3.39 to $1.70
- Gross profit/user rises from $8.61 to $10.30
- Gross margin improves 10 percentage points

### 7.4 Power-user tax (downside scenario)

If the top 5% of users generate 30% of LLM cost (instead of the 20% in our model):
- Blended LLM cost rises from $3.39 to ~$4.80
- Gross profit drops by ~$1.40/user/month
- Forces introduction of usage-based pricing for top tier (the Power tier at $35/mo exists partly to fund this)

### 7.5 Regulatory cost spike

If EU AI Act high-risk classification applies and requires a full conformity assessment before launch:
- One-time cost: ~$150k–$300k
- Ongoing cost: +$50k/year in documentation/audit
- Pushes EU launch 6 months later than planned
- Impact: revenue delay, not an existential risk

### 7.6 App Store policy shift

If Apple bans third-party "personal assistant" apps that process email/calendar data in the background (worst case):
- 55–60% of willingness-to-pay market unreachable on iOS
- Company pivots to Android + macOS desktop
- ARR growth slows ~40%
- Not existential but requires strategic response

---

## 8. Cost Efficiency Levers

Five cost reduction mechanisms that should be prioritized:

### 8.1 Aggressive LLM caching

Many calls are redundant: same user asking "what meetings do I have today" 3 times, identical morning briefings requiring the same context retrieval. Cache hit rate target: 40%.
- **Expected savings:** $0.80/user/month at 100k scale → **$80k/month**

### 8.2 LLM routing optimization

Use Gemini Flash for 80% of calls, Claude Sonnet only for complex multi-step ReAct. The plan gets this right. Continuing to optimize the routing decision tree can further reduce blended cost by 15%.
- **Expected savings:** $0.50/user/month at 100k scale → **$50k/month**

### 8.3 Reserved capacity (AWS Savings Plans)

Committing to 1-year compute plans saves 30–40% on ECS Fargate, RDS, ElastiCache. Only commit once usage is stable (month 10+).
- **Expected savings:** $15k/month at 100k scale

### 8.4 Batch processing for non-urgent tasks

Morning briefings don't require real-time generation. Batch them during low-traffic hours using cheaper capacity. Same for memory consolidation, archive operations.
- **Expected savings:** $0.30/user/month → **$30k/month at 100k**

### 8.5 Self-hosted LLM for bulk operations (year 3+)

At 500k+ users, self-hosting Llama 3.1 70B or similar on 8×A100 cluster for bulk operations (morning briefings, email categorization) becomes cheaper than API calls.
- **Expected savings:** ~40% of LLM costs at 1M users = **~$1.3M/month**

---

## 9. Cost Structure Summary

### Year 1 cost profile (pre-launch → closed beta → public launch)

```
People: ██████████████████████████████████████████████ $1,840K (72%)
Legal:  █████▓                                          $226K  (9%)
Infra:  ████                                            $151K  (6%)
Mktg:   ██▓                                             $100K  (4%)
Buffer: █████▓                                          $232K  (9%)
Total:                                                  $2.55M
```

### Year 2 cost profile (scaling to 50k–250k users)

```
People: ████████████████████████████████████████   $5.2M (56%)  
LLM API:████████▓                                   $1.4M (15%)
Infra:  ██████                                      $0.9M (10%)
Mktg:   █████                                       $0.8M (9%)
Legal:  ██▓                                         $0.3M (3%)
Other:  ████▓                                       $0.6M (7%)
Total:                                              $9.2M
```

### Year 3 cost profile (scaling to ~900k users)

```
People: ████████████████████████████           $15M (44%)
LLM API:████████████████████▓                  $11M (32%)
Infra:  ██████████▓                            $5.1M (15%)
Mktg:   ██████                                 $2.8M (8%)
Other:  ███                                    $1.1M (3%)
Total:                                         $34M
```

### 3-year total cost: ~$45.8M

At $194M year-3 ARR and ~$34M year-3 run rate cost, the implied operating margin at maturity is ~82% — consistent with a strong SaaS company if the unit economics hold.

---

## 10. Cost Feasibility Verdict

### Is this financially feasible?

**Yes, within a reasonable capital plan, if:**

1. **Seed is ≥$3.5M** (not $2M as implied). Funds 18+ months runway to Series A milestones.
2. **Blended gross margin stays above 45% after App Store fees.** Achievable with web checkout + LLM cost control.
3. **Steady-state churn stays below 6% monthly.** Achievable if the product delivers the promised daily value.
4. **Apple Store fee pressure is mitigated** via web subscription flow for at least 40% of users.
5. **LLM routing is aggressive from day one** — default to cheapest capable model, only escalate when needed.

### What changes if any of these break?

- If seed is underfunded, company dies before validating PMF. Highest risk.
- If gross margin collapses below 30%, growth capital becomes much harder to raise and valuation multiples compress.
- If churn goes above 8% steady-state, LTV:CAC drops to 3–4x and the business is marginal, not excellent.
- If App Store policy tightens, revenue line drops 20–25% until web subscription grows.
- If LLM routing is naive, cost/user is $6–8 instead of $3–4, blowing up unit economics.

### Key numbers to memorize

- **Target seed:** $4M
- **Blended LLM cost/paying user/month:** $3.39
- **Blended gross profit/paying user/month:** $8.61
- **LTV:CAC:** ~9x at 2% steady-state churn
- **Break-even:** ~173k paying users
- **Year 3 target:** 900k users, $194M ARR, ~$34M operating cost, ~$160M net contribution

---

*This cost model uses public AWS and LLM API pricing as of April 2026 and is subject to change. Revisit quarterly as pricing evolves.*

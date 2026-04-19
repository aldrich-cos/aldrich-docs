# Aldrich — Target User & Positioning

**Document purpose:** Define exactly who Aldrich is for, what jobs they are hiring it to do, and how we position it so the right users self-identify and the wrong users self-filter out.

**Stance:** The worst thing a consumer AI product can do is be for "everyone." Aldrich is built for a specific type of person with a specific set of problems. Serving them well — and politely not serving others — is the whole game at this stage.

---

## The one-line positioning

> Aldrich is your personal AI chief of staff — remembers what matters, surfaces what you'd miss, and acts on your behalf across your apps — so your mind is free for the work only you can do.

**What each phrase does:**

- *"Personal AI chief of staff"* — category anchor. Chief of staff is a familiar role; users intuit the proactive, discreet, trusted-assistant relationship.
- *"Remembers what matters"* — the memory pillar; differentiator from stateless ChatGPT.
- *"Surfaces what you'd miss"* — proactive behavior; differentiator from reactive assistants.
- *"Acts on your behalf across your apps"* — agentic capability; differentiator from note-taking or chatbot apps.
- *"So your mind is free for the work only you can do"* — the actual benefit; what the user feels.

**What it deliberately avoids:**
- "AI assistant" — too generic, hundreds of products use this.
- "Personal productivity app" — too small; understates the ambition.
- "Your second brain" — overused, vague, and Notion/Mem/Reflect own it.
- Anything about "agent" as the first word — hype-loaded, already misunderstood.

---

## Primary target user

### Persona 1: The Multi-Threaded Executive (primary V1 target)

**Name placeholder:** "Maya, VP of Product"

**Context:**
- Age 32–45
- Senior IC or first-level exec at a scaling company (50–2,000 employees)
- Tech industry or adjacent (SaaS, fintech, agencies, consultancies)
- Comp in the $150K–$400K range
- Located in a major metro in the US, UK, EU, or Canada

**A day in Maya's life:**
- 6am: phone alarm; check messages and calendar before getting out of bed
- 7am: school drop-off / commute; listens to a podcast or a Slack voice note
- 8am–12pm: back-to-back meetings with engineering, design, her boss
- 12pm: lunch — usually working while eating
- 12pm–6pm: more meetings, interspersed with Slack triage, doc reviews, email
- 6pm: parenting / partner time; tries not to look at phone
- 9pm–11pm: the "second shift" — responding to things she couldn't during the day, sending the 2–3 key emails she owed, prepping for tomorrow
- Sleep, repeat

**Pain points:**
- Context-switching tax — moving between tools and projects 50+ times a day
- Missing small but important things (remembered commitments to people, birthdays, follow-ups)
- "What did I tell [person] last time we talked?" — needs fast recall
- Shallow-work flood drowning deep-work time
- Feeling always-on but never caught up

**Jobs Maya is hiring Aldrich to do:**
1. *Be my memory.* Know what I told Alex last Tuesday so I don't look like a jerk.
2. *Prep me.* Before my 9am, tell me the three things that matter and any context I should have.
3. *Execute small tasks.* Schedule, reschedule, reply-ack, draft a follow-up, add a task — without me opening each app.
4. *Surface the needle.* Tell me the 3 things I'd have missed today; hide the noise.
5. *Give me a quiet mind.* Let me trust that nothing's slipping so I can do deep work without guilt.

**Where Maya hears about Aldrich:**
- A peer posts on LinkedIn or X
- A leadership-focused newsletter (Lenny's, The Generalist, Trung Phan)
- A trusted podcast mention
- Her Chief of Staff mentions it

**What would make Maya a promoter (NPS 9–10):**
- "I genuinely rely on it. I stopped missing commitments."
- "I actually used my evenings with my family again."
- "It prepped me for a board meeting better than my Chief of Staff would have."

**What would make Maya a detractor:**
- "It sent something I didn't mean it to send."
- "It got confused about my team and embarrassed me."
- "I couldn't trust it, so I stopped using it."

---

### Persona 2: The Independent Operator

**Name placeholder:** "Sam, Solo Consultant / Agency Owner"

**Context:**
- Age 35–55
- Running their own business or in a partnership of <10 people
- 10+ clients across different industries; context-switching is the business
- Comp $120K–$500K, heavily variable
- Every hour tracked; every admin minute costs money

**Jobs Sam is hiring Aldrich to do:**
1. *Remember every client's context.* Who they are, what we're doing for them, what I promised last.
2. *Execute admin fast.* Invoicing, scheduling, follow-ups — the stuff eating billable time.
3. *Be a thought partner.* Draft the email, structure the proposal, stress-test the idea.
4. *Protect my time.* Don't let me forget my kid's school thing because I was in client flow.

**Differences from Maya:**
- More willing to pay more for power features (Power tier natural fit)
- More integrations-heavy need (accounting, contracts, client CRM)
- Lower tolerance for unreliability — every error has a client visible consequence
- Word-of-mouth in small professional communities is the #1 marketing channel

---

### Persona 3: The Creator-Operator

**Name placeholder:** "Jordan, Content Creator / Solo Founder"

**Context:**
- Age 25–40
- Making a living through creator economy, solo SaaS, or small team of 2–5
- Lives in their browser and phone; no traditional office stack
- Values: speed, autonomy, self-directed growth
- Comp variable; often high but lumpy

**Jobs Jordan is hiring Aldrich to do:**
1. *Capture everything.* Every idea, insight, reference from what I read/watch.
2. *Help me ship.* Turn a messy note into a draft, a draft into a post, a post into a tweet thread.
3. *Keep my life running.* Because I'm bad at admin and refuse to feel bad about it.
4. *Extend my attention.* Monitor the 5 threads/people/things I care about without me having to remember.

**Differences from Maya and Sam:**
- Most natively AI-positive persona; will try features others won't
- Vocal on social media — a great promoter or detractor
- Lower willingness to pay per-seat but happy to pay for power
- Less dependence on corporate software integrations; more on creator tools

---

## Secondary target users (who we will happily serve but not design for)

- **Students and early-career knowledge workers** — will love Aldrich but have lower willingness to pay; we welcome them on Free tier.
- **Retirees managing complex lives** — hi-value but service-heavy; we can build for them later.
- **Neurodivergent users** needing executive-function support — underserved; will be vocal, loyal, and demanding. We should not design specifically for them in V1 (risks over-claim) but they will find us.

---

## Users we are NOT for in V1

- **Enterprise teams** (deferred to V3 — requires SSO, admin console, DPAs)
- **Developers** looking for an API to build on (deferred — V2 roadmap item)
- **People seeking a ChatGPT replacement for general Q&A** — we are opinionated about proactivity and memory; ChatGPT is better for them if they don't want agency
- **Privacy purists who want zero cloud processing** — we are cloud-heavy with selective on-device; Kagi Assistant or local-only tools are a better fit
- **Users who want a life coach / therapist** — we are not that, and should not pretend to be

---

## The "jobs to be done" framework

### Functional jobs

1. **Remember personal facts and context across time**
2. **Surface the right information at the right moment**
3. **Execute routine actions across apps without manual navigation**
4. **Prepare me for upcoming meetings, conversations, and decisions**
5. **Keep my commitments from slipping**
6. **Draft communications that sound like me**
7. **Triage incoming noise so I only see signal**

### Emotional jobs

1. **Feel in control of my day, not controlled by it**
2. **Feel like I am not forgetting important things**
3. **Feel ahead, not behind**
4. **Feel trusted and private** (Aldrich works for me, not on me)
5. **Feel professionally on top of things without the stress**

### Social jobs

1. **Appear reliable and attentive to peers, reports, and family**
2. **Not be the person who forgets a commitment**
3. **Demonstrate thoughtfulness and preparation**
4. **Have a narrative of "I use AI well" rather than "AI is coming for me"**

A product that nails functional jobs but misses emotional jobs will see good reviews and low retention. A product that hits emotional jobs builds loyalty. Aldrich must do both.

---

## Positioning map — where we sit

### Two axes

**Horizontal axis: Reactive ← → Proactive**
- Reactive: You ask, it answers. ChatGPT, Claude, Gemini.
- Proactive: It reaches out to you at the right moment. Aldrich, Apple Intelligence (future), Notion AI (future).

**Vertical axis: Generic ← → Personal**
- Generic: Same answers for everyone. Most chat-AI products.
- Personal: Deeply knows your context. Aldrich, Rewind/Limitless/Bee.

**Aldrich's quadrant: Proactive × Personal.** This is the quadrant where Apple, Google, and OpenAI will all eventually land, but right now it's sparsely occupied by well-funded or well-distributed players.

```
              Proactive
                 |
      Aldrich ◉  |  Apple Intelligence (emerging)
                 |  Google Gemini (emerging)
    Rewind       |
    Limitless    |
Personal---------+---------Generic
                 |
    ChatGPT custom GPT
    Mem, Reflect, Notion AI
                 |  ChatGPT
                 |  Claude
                 |  Gemini
              Reactive
```

---

## Messaging framework

### Top-level story (30 seconds)

"Aldrich is a personal AI chief of staff that remembers what matters to you, surfaces what you'd otherwise miss, and acts on your behalf across your apps. It works on your phone, your laptop, your watch — one assistant, one memory, wherever you are. Unlike ChatGPT, it knows you. Unlike Siri, it gets things done. Unlike anything else, it's yours — your data stays yours, and it only acts when you want it to."

### Tagline candidates

- "Your mind. Your data. Your assistant." (privacy emphasis)
- "The assistant that remembers." (memory emphasis)
- "Quietly ahead." (emotional emphasis)
- "A chief of staff, for everyone." (category emphasis)

### Three-benefit stack

**1. It remembers so you don't have to.**
Your conversations, your commitments, your people, your preferences — Aldrich keeps track, across apps, across time.

**2. It stays ahead of your day.**
Morning briefings, meeting prep, well-timed nudges. Everything you'd have missed, surfaced before you need it.

**3. It acts, carefully.**
When you give it the reins, it schedules, drafts, replies, and organizes. When it's unsure, it asks. You're always in control.

### Messaging by context

**Landing page headline:** *Quietly ahead.* / Aldrich is a personal AI chief of staff that remembers what matters, surfaces what you'd miss, and acts across your apps.

**App Store short description:** *Your personal AI chief of staff. Remembers what matters, surfaces what you'd miss, acts on your behalf — carefully.*

**One-liner for investors:** *We're building the first personal AI that actually feels personal — a memory-native, proactive, cross-platform chief of staff.*

**One-liner for skeptics:** *Think ChatGPT, but it remembers you — and can actually get things done across your apps. With a trust layer that makes you want to let it.*

**One-liner for busy executives:** *The 24/7 chief of staff you wish you had, in your pocket.*

---

## Brand voice and principles

### Voice pillars

**Capable, not show-offy.** Aldrich can do a lot, but it doesn't flex. Copy is direct, understated, confident.

**Discreet.** Aldrich is the assistant who knows everything and says nothing it shouldn't. Brand language mirrors that.

**Human-warm, not chatty.** Warm enough to feel relational, never gushy or fake.

**Honest about limits.** "I'm not sure — want me to draft it and you review?" beats "Sure! Done!" when the confidence isn't there.

### Messaging don'ts

- No "game-changing," "revolutionary," "mind-blowing" — we are neither.
- No emoji overload in marketing; one-per-screen maximum.
- No "powered by AI" as a value prop (it's table stakes).
- No "imagine if..." copy. We show, we don't imagine.
- No dunk on competitors by name in public. Position by what we are, not what they're not.

---

## Category-of-one narrative

The hardest positioning work is convincing people that "AI chief of staff" is its own category, not a sub-category of "chatbot" or "productivity app."

### The argument

ChatGPT, Claude, Gemini — these are general intelligence rentals. You ask, they answer, the conversation ends, they forget you. Productivity apps like Notion or ClickUp store information, but you have to go to them. Voice assistants like Siri and Alexa do commands, but have no memory and no context.

A chief of staff is categorically different from any of these. A chief of staff has *memory across interactions*, *proactive intelligence*, *limited agency to act*, and *trusted discretion*. That role, until now, has been purely human and available only to a handful of people. Aldrich is what happens when that role becomes software — available to everyone who needs one.

Every other product is a tool. Aldrich is a role.

That is the category. It is not "a better chatbot." It is "the role of chief of staff, shipped as software."

### Why this framing wins

- **Resonates with the buyer.** Executives already know what a chief of staff is and wish they had one.
- **Sets appropriate expectations.** A chief of staff remembers, prepares, acts carefully. Not "answers every question in the universe."
- **Justifies the price.** A human chief of staff is $120K+/year. $18/month is trivial by comparison.
- **Creates a moat in words.** If we are the first to plant this flag, we own the associative space.

---

## Anti-positioning: things we will be tempted to say but shouldn't

- **"We're the ChatGPT for X."** No — we're not a ChatGPT variant.
- **"We're an autonomous AI agent."** No — autonomous is scary. "Acts carefully on your behalf" is the frame.
- **"We're the all-in-one platform for..."** No — we are opinionated and narrow.
- **"We replace your assistant / VA / Chief of Staff."** No — we *augment* and make the role accessible to those who don't have one.
- **"We learn from all your data."** No — too creepy. "We remember what you tell us and what you let us see."

---

## Trust as positioning

A core part of our positioning is *trust posture*, not just features:

**"Your data stays yours."** No training on user data without explicit opt-in. Clear export. Clear delete. Verifiable.

**"It acts only when you approve."** Default posture is ask-first for anything consequential. Users control the autonomy dial.

**"You can always see, and always undo."** Activity log, memory viewer, 30-day undo stack.

**"We tell you when we're uncertain."** Confidence communication is built into copy ("I'm not sure — draft for you to review?").

This is not just UX. It is the positioning. Every competitor could add a "delete" button — none of them can credibly say "your data stays yours" the way a privacy-native startup can.

---

## Distribution narrative by persona

### To Maya (exec)

*"You don't have the time to read more books on productivity. You need something that works on the days when you're running between meetings and forgetting half of what's said. Aldrich remembers, prepares you, and handles the admin you'd otherwise do at 10pm. The best $18/month you'll spend this year — and it'll replace $500/month of mental overhead."*

### To Sam (solo)

*"Every hour you spend on admin is an hour you're not billing. Aldrich knows your clients' contexts, handles scheduling and follow-up, and drafts the things you procrastinate on. Pays for itself in the first week."*

### To Jordan (creator)

*"You have 40 ideas and 4 hours. Aldrich captures every idea from every input, turns rough notes into polished outputs, and runs the admin behind the scenes. The tool that makes you more you."*

---

## What defines success in positioning

We will know our positioning is working when:

1. **Users describe us in their own words** using phrases close to ours. When 3 out of 5 interviewed users say "it's like a chief of staff" without prompting, we've made it.
2. **Wrong-fit users self-filter.** Free-trial-to-paid conversion stays healthy because we attract the right people; we don't have to churn out people we mis-sold.
3. **We stop being compared to ChatGPT.** Early on every review says "how is this different from ChatGPT?" — that should fade as category awareness grows.
4. **Press and influencers use our framing.** Not "another AI assistant" but "the AI chief of staff" in headlines.
5. **Internal messaging discipline holds.** Every landing page, tweet, and deck uses the same three-benefit stack. Nothing contradicts.

---

## Messaging evolution by stage

**Seed / pre-launch:** "What if everyone had a chief of staff?" — aspirational, curiosity-inducing.

**Beta:** "Your personal AI chief of staff. Join the waitlist." — simple, category-claiming.

**Paid launch:** "Quietly ahead." — emotional benefit, confident.

**Post-Series A:** "The operating system for your day." — broader, category-defining.

**Year 3:** *(owned positioning earns shorter messaging)* "Aldrich." — brand equity does the work.

---

## The "ideal user" gut check

When we are tempted to add a feature, change positioning, or chase a market segment, the first question is: *does Maya want this?*

If Maya asks for it, we should probably do it.
If Maya doesn't care about it, we should probably not.
If Maya would actively dislike it (e.g., more notifications, ads, a public profile feature), we shouldn't.

Sam and Jordan get a vote, but Maya is the primary. This discipline protects us from the biggest failure mode of consumer AI: trying to be everything to everyone.

---

## Open questions (to resolve during beta)

- Does "chief of staff" resonate globally, or should we localize (e.g., "personal assistant" in markets where CoS isn't familiar)?
- Is the primary emotional benefit really "quietly ahead," or is it closer to "less anxious"?
- Should we lean more on productivity-efficiency framing or on life-balance framing?
- What's the right density of "privacy" in the messaging — hero-level or sub-brand?

These are data-collectable during beta with direct user interviews and A/B testing.

---

*End of Target User & Positioning v1.0 — revisit monthly through beta; quarterly post-launch.*

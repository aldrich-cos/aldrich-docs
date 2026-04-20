# Technical Master Plan: The Omnipresent Personal AI Assistant

> **Prepared by:** Senior Product Architect + Senior Full-Stack Engineer + UI/UX Reviewer  
> **Date:** 2026-04-10  
> **Status:** Ready to Build (with guardrails)

---

## Executive Vision

We are building a proactive, hyper-personalized, "always-on" AI assistant that acts as a continuous thread across a user's entire digital life (mobile, desktop, browser, wearables). Unlike generic cloud chatbots (like ChatGPT or Claude's web interface), which are fundamentally reactive and siloed, this system is highly secure, stateful, and agentic. It doesn't just answer questions; it observes context, remembers routines, and autonomously executes tasks across applications on behalf of the user.

### The "Day in the Life" Scenario

Imagine waking up. Before you've opened your eyes, your phone's local AI has processed your overnight emails, noted a critical server alert from Slack, and observed via your sleep tracker that you had a terrible night's rest. Without prompting, it has already drafted an email to your 9 AM meeting to push it to 10 AM, rescheduled your morning gym block in your calendar, and generated a custom Server-Driven UI notification on your lock screen:

> *"Server outage detected overnight. I've drafted a delay for your 9 AM meeting and shifted your workout. Tap FaceID to approve."*

This is the omnipresent vision: an assistant that acts as an invisible, highly competent Chief of Staff.

---

## Core Philosophy

To achieve this level of intimacy and power, we must abandon traditional app architectures. We are building for the "Post-App Era" using three foundational pillars:

1. **Decoupled Intelligence** — The "brain" (memory and reasoning) must be entirely separated from the "limbs" (the client apps). Local clients become ultra-efficient sensor nodes; the cloud-hosted orchestration layer acts as the centralized engine.

2. **Deterministic Security** — The AI must interact with the world strictly through validated APIs and structured tool-calling. We treat the LLM as an untrusted reasoning engine that must fill strongly-typed JSON schemas to interact with the outside world.

3. **Local-First Privacy** — High-bandwidth sensory data must be processed entirely locally on the device. Only highly compressed, encrypted, and explicitly authorized payloads are sent to the backend for heavy reasoning. The cloud never sees the raw microphone feed.

---

## SYSTEM ARCHITECTURE OVERVIEW

> **Read this before the pillars.** The five pillars each go deep on one layer of the system. This section gives you the complete picture first — every client, every backend service, every communication path, and the exact journey data takes from a user's mouth to a completed action and back. If you understand this section, the pillars will make immediate sense. If you skip it, the pillars will feel disconnected.

---

### The 10,000-Foot View

This system has three physical zones that must work as one coherent brain:

```
╔══════════════════════════════════════════════════════════════════════╗
║  ZONE 1: USER DEVICES (The Senses + The Hands)                      ║
║  iOS · Android · macOS · Windows                                    ║
║  What runs here: audio capture, local AI, UI rendering, approvals   ║
╠══════════════════════════════════════════════════════════════════════╣
║  ZONE 2: THE WIRE (The Nervous System)                              ║
║  WebSocket · HTTPS · BLE · mDNS · Local P2P                        ║
║  What flows here: encrypted intents, SDUI cards, action approvals  ║
╠══════════════════════════════════════════════════════════════════════╣
║  ZONE 3: ALDRICH CLOUD (The Brain)                                  ║
║  Go services · LLM · Memory · OAuth Vault · Safety Layer           ║
║  What runs here: reasoning, memory, agentic execution, persistence  ║
╚══════════════════════════════════════════════════════════════════════╝
```

No zone can operate usefully without the others. The design goal is that **Zone 1 degrades gracefully when Zone 3 is unreachable**, and Zone 3 **never sees raw user data** — only the compressed, authorized summaries that Zone 1 chooses to send.

---

### Zone 1: What Lives on the Client

Every client is fundamentally a **sensor node and approval surface**. It captures context, classifies intent, and renders decisions. It does not make high-stakes decisions on its own.

#### iOS Application

```
┌─────────────────────────────────────────────────────────────────┐
│  iOS APPLICATION LAYERS                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  UI LAYER (SwiftUI)                                    │   │
│  │  • SDUI Renderer — parses server JSON → native views   │   │
│  │  • Lock screen widget (WidgetKit extension)            │   │
│  │  • Notification handling + biometric approval gate     │   │
│  │  • Settings, action history, memory viewer             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕ Swift actors                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  INTELLIGENCE LAYER                                    │   │
│  │  • Intent Router — local vs. cloud routing decision    │   │
│  │  • Gemma 2B (Core ML / BNPL quantized) — local LLM    │   │
│  │  • Wake-word detector (OpenWakeWord, CoreML compiled)  │   │
│  │  • Thermal state monitor → dynamic routing switch      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SENSOR LAYER                                          │   │
│  │  • VAD (Silero, CoreML — runs on ANE at ~6mAh/hr)     │   │
│  │  • AVAudioEngine — 16kHz mono PCM ring buffer (3s)    │   │
│  │  • HealthKit reader (sleep, HRV, activity)            │   │
│  │  • Location context (coarse — city level only)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SECURITY & STORAGE LAYER                              │   │
│  │  • Secure Enclave — audio buffer AES-256-GCM keys      │   │
│  │  • Keychain — JWT access token + WebSocket session key │   │
│  │  • SQLite (encrypted, SQLCipher) — local memory cache  │   │
│  │  • BGProcessingTask scheduler — model pre-warm         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  COMMUNICATION LAYER                                   │   │
│  │  • WebSocket client (URLSessionWebSocketTask)          │   │
│  │  • HTTP/2 REST client (URLSession)                    │   │
│  │  • BLE Peripheral Manager (CoreBluetooth)             │   │
│  │  • mDNS advertiser (Network.framework / Bonjour)      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**What the iOS app owns and never gives up:**
- Raw audio (processed and discarded on-device)
- Biometric data (touch/face ID result — a boolean yes/no — is all that crosses the wire)
- Health metrics (processed into a scalar "energy score" on-device)
- The audio ring buffer (encrypted in RAM via Secure Enclave, wiped after intent extraction)

**What the iOS app sends to the cloud:**
- Text transcript of the user's intent (never the audio)
- Encrypted action approvals (biometric result + action ID + device attestation token)
- Memory ingestion events (entities extracted from email/calendar, never full content by default)
- Session heartbeat (keeps the WebSocket alive, carries device state: thermal level, battery %)

---

#### Android Application

The Android app mirrors the iOS architecture with platform-specific implementations:

```
iOS Component               → Android Equivalent
─────────────────────────────────────────────────
AVAudioEngine               → AudioRecord + MediaProjection API
CoreML / ANE                → TensorFlow Lite + Google Tensor TPU
Secure Enclave (AES key)    → Android Keystore + StrongBox HSM
BGProcessingTask            → WorkManager (PeriodicWorkRequest)
CoreBluetooth (Peripheral)  → BluetoothLeAdvertiser
WidgetKit                   → Glance API (Jetpack)
URLSessionWebSocketTask     → OkHttp WebSocket
AVAudioSession (.record)    → Foreground Service (required for bg audio on Android 14+)
```

**Key Android-specific difference:** Android 14+ requires a **foreground service with a persistent notification** for any background audio processing. This means the user will see "Aldrich is listening" in their notification shade — always. On Android this is less stigmatized than iOS (where it is a hardware orange dot) but it must be designed as a trust signal, not apologized for.

**Android foreground service declaration:**
```xml
<!-- AndroidManifest.xml -->
<service
    android:name=".AldrichListeningService"
    android:foregroundServiceType="microphone|mediaProjection"
    android:exported="false" />

<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

#### macOS Desktop Daemon

The macOS daemon is a distinct binary from the main app — it runs as a **Login Item** (LaunchAgent), starts at boot, lives in the menu bar, and never shows a dock icon. It has fundamentally different capabilities than mobile:

```
┌─────────────────────────────────────────────────────────────────┐
│  macOS DAEMON (separate binary, runs as LaunchAgent)           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SCREEN CONTEXT ENGINE                                 │   │
│  │  • AXUIElement API — reads active window title,        │   │
│  │    frontmost app, focused text field content           │   │
│  │  • CGWindowList — captures visible app list            │   │
│  │  • No screenshot/OCR — only accessibility tree data   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LOCAL ACTION EXECUTOR                                 │   │
│  │  • AXUIElement write API — types into text fields,    │   │
│  │    clicks buttons, navigates menus                    │   │
│  │  • NSAppleEventDescriptor — sends Apple Events to     │   │
│  │    scriptable apps (Mail, Calendar, Finder)           │   │
│  │  • NSWorkspace — opens URLs, launches apps            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  P2P MESH HUB (desktop is the hub, phone is leaf)     │   │
│  │  • mDNS (Bonjour) service advertisement               │   │
│  │  • BLE Central Manager — pairs with phone             │   │
│  │  • Local TCP server (127.0.0.1 + LAN) for commands    │   │
│  │  • WebRTC data channel (fallback if LAN isolated)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MENU BAR UI (SwiftUI MenuBarExtra)                    │   │
│  │  • Activity status (idle / listening / acting)        │   │
│  │  • Quick approve/reject for pending actions           │   │
│  │  • Settings and permission management                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Required macOS entitlements:**
```xml
<key>com.apple.security.automation.apple-events</key><true/>
<key>com.apple.security.temporary-exception.apple-events</key>
<array>
  <string>com.apple.mail</string>
  <string>com.apple.iCal</string>
</array>
```

The Accessibility permission (`kAXTrustedCheckOptionPrompt`) must be granted by the user in **System Settings → Privacy & Security → Accessibility**. This is a one-time prompt that cannot be pre-approved. Onboarding must explain this clearly with a visual walkthrough — a raw OS permission dialog without context causes ~40% drop-off.

---

#### Windows Desktop Daemon (V2)

The Windows daemon mirrors macOS functionality using the Windows-native equivalent APIs:

```
macOS API                   → Windows Equivalent
─────────────────────────────────────────────────
AXUIElement (read)          → IUIAutomation COM interface
AXUIElement (write)         → IUIAutomation InvokePattern / ValuePattern
NSAppleEventDescriptor      → WScript.Shell COM + SendKeys (limited)
CoreBluetooth Central       → Windows.Devices.Bluetooth (WinRT)
Bonjour mDNS                → DNS-SD via Bonjour for Windows (or native mDNS)
LaunchAgent (login item)    → Windows Task Scheduler (logon trigger) or Registry Run key
MenuBarExtra (SwiftUI)      → System tray icon (Win32 NOTIFYICONDATA)
```

Language choice for Windows daemon: **C++ with WinRT projections**. C# works too but requires .NET runtime dependency. C++ produces a ~2MB self-contained binary with no runtime prerequisites, which is important for a background daemon that users will not think about.

---

### Zone 2: How Clients Talk to the Cloud

Every byte that crosses the wire between a client and the Aldrich backend follows these rules:

1. **All connections are TLS 1.3 minimum.** No exceptions. Certificate pinning enforced in mobile apps.
2. **All requests carry a short-lived JWT (15-minute TTL).** Refresh tokens are stored in Keychain/Keystore only — never in app state.
3. **Persistent connections for real-time.** REST for mutations (create, approve, reject). WebSocket for everything the server needs to push to the client (SDUI cards, notifications, circuit breaker signals).
4. **Local-first for local commands.** Phone-to-desktop commands use the P2P mesh and never touch the cloud server.

#### Connection Types Map

```
┌──────────────────────────────────────────────────────────────────────┐
│  WHO TALKS TO WHOM, HOW, AND WHAT THEY SEND                        │
│                                                                      │
│  Mobile App ──── HTTPS/2 ──────────────────▶ Aldrich API            │
│               (REST: mutations, auth)                                │
│                                                                      │
│  Mobile App ──── WebSocket ────────────────▶ Aldrich WS Hub         │
│               (real-time: SDUI push,                                 │
│                circuit breaker kill signals,                         │
│                cross-device state sync)                              │
│                                                                      │
│  Desktop Daemon ── WebSocket ──────────────▶ Aldrich WS Hub         │
│                  (same as mobile)                                    │
│                                                                      │
│  Mobile ──── BLE (GATT) ─────────────────▶ Desktop Daemon           │
│           (pairing + session key exchange)                           │
│                                                                      │
│  Mobile ──── TCP (LAN) ──────────────────▶ Desktop Daemon           │
│           (local commands: "type this", "open app X")               │
│           (AES-256-GCM encrypted with BLE-derived session key)      │
│                                                                      │
│  Mobile ──── mDNS (Bonjour) ─────────────▶ Desktop Daemon           │
│           (discovery: "find Aldrich daemon on this LAN")            │
│                                                                      │
│  Backend ──── OAuth 2.0 (HTTPS) ──────────▶ Gmail / Slack / etc.    │
│           (action execution on user's behalf)                        │
└──────────────────────────────────────────────────────────────────────┘
```

#### WebSocket Message Protocol

All WebSocket messages use a single envelope format. The `type` field determines how the client processes the payload:

```go
// Every WebSocket message in both directions uses this envelope
type WSMessage struct {
    Type      string          `json:"type"`
    MessageID string          `json:"message_id"` // UUID, for dedup
    UserID    string          `json:"user_id"`
    DeviceID  string          `json:"device_id"`  // which device sent/should receive
    Timestamp int64           `json:"ts"`         // Unix ms
    Payload   json.RawMessage `json:"payload"`
}

// Server → Client message types:
// "sdui_card"         → render an action card
// "action_status"     → update status of a pending action
// "memory_sync"       → push a memory update to all devices
// "circuit_breaker"   → STOP_ALL kill signal
// "session_expire"    → JWT about to expire, trigger refresh
// "notification"      → simple text notification (fallback)

// Client → Server message types:
// "intent"            → user spoke or typed an intent
// "action_approve"    → biometric approved; payload contains action_id + device_attestation
// "action_reject"     → user rejected an action
// "action_undo"       → user undid an executed action
// "heartbeat"         → device state: thermal_level, battery_pct, network_type
// "memory_event"      → new memory to ingest (email summary, calendar change)
```

#### Authentication Flow (Every Request)

```
1. App launch / session start:
   POST /auth/refresh  { refresh_token: "..." }
   ← { access_token: "eyJ...", expires_in: 900 }  (15 min)

2. Every API request:
   Authorization: Bearer eyJ...

3. Every WebSocket frame:
   First frame after connect: { type: "auth", token: "eyJ..." }
   Server validates; rejects connection if invalid

4. Token refresh (proactive, 2 min before expiry):
   POST /auth/refresh  (same as step 1)
   New access_token replaces old in Keychain

5. Token refresh failure (revoked/expired):
   WS connection closes with code 4001
   App redirects to OAuth re-authorization flow
```

---

### Zone 3: What the Backend Does

The backend is a collection of **Go microservices** (or a single modular monolith in V1 — avoid premature splitting) running on ECS Fargate, all communicating internally via direct function calls (monolith) or gRPC (microservices phase in V2+).

#### Complete Backend Service Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        ALDRICH BACKEND                              │
│                                                                      │
│  INGRESS                                                             │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  API Gateway (Go net/http + gorilla/mux)                  │     │
│  │  • TLS termination (ACM certificate)                      │     │
│  │  • JWT validation (all routes)                            │     │
│  │  • Rate limiting (per user: 100 req/min REST, WS exempt) │     │
│  │  • Request ID injection (for distributed tracing)        │     │
│  │  • Panic recovery middleware                              │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │ routes to:                        │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  WebSocket Hub (gorilla/websocket)                        │     │
│  │  • One goroutine per connection (up to 100K concurrent)   │     │
│  │  • Per-user connection registry (device_id → conn)        │     │
│  │  • Broadcast: push to all devices for a user_id          │     │
│  │  • Ping/pong keepalive (30s interval)                     │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  CORE PROCESSING                │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  Safety Middleware (runs before everything else)           │     │
│  │  • Sandbox Classifier: is this action safe to auto-exec?  │     │
│  │  • Circuit Breaker check: is this user's breaker tripped? │     │
│  │  • Action budget: has this user exceeded actions/minute?  │     │
│  │  • Idempotency: is this a duplicate request?              │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  Intent Orchestrator                                      │     │
│  │  • Parses incoming intent (text + device context)         │     │
│  │  • Queries Memory Hub for relevant context                │     │
│  │  • Passes enriched context to ReAct Engine               │     │
│  │  • Receives action plan from ReAct Engine                │     │
│  │  • Routes: auto-execute vs. pending approval vs. reject   │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  ReAct Engine (Go FSM)                                    │     │
│  │  • Calls Claude claude-sonnet-4-6 API with tool schemas          │     │
│  │  • Executes tool calls through Tool Registry             │     │
│  │  • Enforces 8-step chain max + 30K token budget          │     │
│  │  • Error recovery loop (3 retries, 6K token budget)      │     │
│  │  • Writes each step to action_records table              │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  Tool Registry                                            │     │
│  │  • Maintains map[string]Tool (interface)                  │     │
│  │  • Each tool: Gmail, Calendar, Slack, Notion, Yelp...     │     │
│  │  • Pre-call: fetches OAuth token from Vault              │     │
│  │  • Post-call: validates response schema                  │     │
│  │  • Pre-call: runs response through LLM Firewall          │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  SUPPORTING SERVICES            │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  Memory Hub Service                                       │     │
│  │  • Ingestion: Kafka consumer → normalize → embed → store  │     │
│  │  • Retrieval: TEMPR (semantic + keyword + graph + time)   │     │
│  │  • CRDT merge on reconnect                               │     │
│  │  • Forgetting curve GC (nightly batch job)               │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  OAuth Vault Service                                      │     │
│  │  • Stores all user OAuth tokens (KMS envelope encrypted)  │     │
│  │  • Proactive refresh (5 min before expiry)               │     │
│  │  • Handles Google/Slack/Notion token revocation recovery  │     │
│  │  • Per-provider rate limit tracking + backoff             │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  SDUI Generator                                           │     │
│  │  • Converts action plan output → JSON schema card         │     │
│  │  • Selects component types based on action category       │     │
│  │  • Adds accessibility labels, expiry, biometric flag      │     │
│  │  • Pushes via WebSocket Hub to all user devices           │     │
│  └──────────────────────────────┬─────────────────────────────┘     │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────┐     │
│  │  Background Workers (separate goroutines / ECS tasks)     │     │
│  │  • Memory GC: nightly Ebbinghaus decay + cold archive     │     │
│  │  • Token refresh: poll expiring tokens every 60s          │     │
│  │  • Integration schema drift: weekly API spec check        │     │
│  │  • Action record archival: monthly S3 migration           │     │
│  └──────────────────────────────────────────────────────────--┘     │
│                                                                      │
│  DATA STORES                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │  PostgreSQL  │ │   Redis      │ │    Kafka     │ │    S3     │  │
│  │  + pgvector  │ │ (cache +     │ │  (3-broker   │ │ (cold     │  │
│  │  (primary DB)│ │  sessions +  │ │   cluster,   │ │  archive) │  │
│  │              │ │  circuit     │ │   12 parts)  │ │           │  │
│  │              │ │  breaker)    │ │              │ │           │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### The Complete Data Journey: Voice to Action to Approval

This is the most important thing to understand about the system. Every autonomous action follows this exact path. Nothing is skipped, nothing is reordered.

```
STEP 0: ALWAYS-ON SENSING (on-device, zero cloud involvement)
  ┌─────────────────────────────────────────────────────────┐
  │  DSP chip captures audio at 16kHz mono                  │
  │  → 3-second rolling ring buffer in Secure Enclave RAM   │
  │  → Silero VAD runs on ANE (<6mAh/hr), looks for speech  │
  │  If silence: buffer overwrites itself, nothing saved    │
  └───────────────────────────┬─────────────────────────────┘
                              │ speech detected
                              ▼
STEP 1: WAKE WORD + INTENT CAPTURE
  ┌─────────────────────────────────────────────────────────┐
  │  Wake-word model fires (OpenWakeWord, ANE compiled)     │
  │  → Whisper Tiny transcribes speech to text (on-device) │
  │  → Transcript: "Set up dinner with the team this week" │
  │  → Raw audio discarded from ring buffer immediately     │
  └───────────────────────────┬─────────────────────────────┘
                              │ text only from here
                              ▼
STEP 2: LOCAL INTENT CLASSIFICATION
  ┌─────────────────────────────────────────────────────────┐
  │  Gemma 2B Intent Router classifies:                     │
  │  • Complexity: simple (local) vs. complex (cloud)       │
  │  • Domain: calendar / email / general / search          │
  │  • Urgency: immediate vs. queueable                     │
  │  • Thermal check: if CRITICAL → force cloud path        │
  │                                                         │
  │  Decision: "calendar + multi-person + restaurant        │
  │             = complex → cloud path"                     │
  └───────────────────────────┬─────────────────────────────┘
                              │ encrypted intent payload
                              ▼
STEP 3: CLOUD HANDOFF (HTTPS/WS to Aldrich API)
  ┌─────────────────────────────────────────────────────────┐
  │  Payload sent (all encrypted in transit via TLS 1.3):  │
  │  {                                                      │
  │    "intent": "Set up dinner with the team this week",  │
  │    "device_context": {                                  │
  │      "thermal": "nominal",                             │
  │      "battery": 82,                                    │
  │      "timezone": "America/New_York",                   │
  │      "local_time": "2026-04-10T14:23:00-04:00"        │
  │    },                                                   │
  │    "session_id": "uuid...",                            │
  │    "idempotency_key": "sha256(intent+device+ts)"       │
  │  }                                                      │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 4: API GATEWAY VALIDATION
  ┌─────────────────────────────────────────────────────────┐
  │  JWT verified (signature + expiry)                      │
  │  Rate limit check (100 req/min per user)                │
  │  Idempotency check (Redis: seen this key in 5s? skip)   │
  │  Request ID injected for tracing                        │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 5: SAFETY PRE-CHECK
  ┌─────────────────────────────────────────────────────────┐
  │  Circuit breaker check: is this user's breaker tripped? │
  │  → If yes: return 503, notify device                    │
  │                                                         │
  │  Sandbox pre-classification:                            │
  │  "dinner + team" → involves calendar + communication   │
  │  → Likely moderate risk; full check deferred to post-  │
  │     ReAct when actual tool calls are known              │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 6: MEMORY CONTEXT RETRIEVAL
  ┌─────────────────────────────────────────────────────────┐
  │  Memory Hub receives user_id + intent text              │
  │  Runs TEMPR retrieval (parallel):                       │
  │  • Semantic search: "team dinner, restaurant"          │
  │  • Entity search: known team members, dietary prefs     │
  │  • Temporal: recent calendar events, last dinner        │
  │  • Graph: "team" → resolves to [Alice, Bob, Carol, Dan]│
  │                                                         │
  │  Returns context block (~2,000 tokens):                │
  │  "Team: Alice (vegetarian), Bob, Carol, Dan            │
  │   Alice prefers Italian. Last team dinner: Feb 14.     │
  │   User works until 6 PM most weekdays."               │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 7: REACT ENGINE EXECUTION
  ┌─────────────────────────────────────────────────────────┐
  │  System prompt + memory context + intent → Claude claude-sonnet-4-6  │
  │                                                         │
  │  Step 1 — Reason: "Need to find overlapping free time  │
  │            for 4 people this week (Thu/Fri best)"      │
  │  Step 2 — Act: call calendar.getFreeBusy(4 people)     │
  │  Step 3 — Observe: "Thursday 7 PM all 4 are free"     │
  │  Step 4 — Reason: "Need a restaurant, Alice vegetarian,│
  │            Italian preferred, near office"             │
  │  Step 5 — Act: call yelp.search(Italian, vegetarian,  │
  │            near:office, evening, seats:5)              │
  │  Step 6 — Observe: "Osteria Marco, 4.6★, 0.3mi,      │
  │            has vegetarian menu, open Thurs 6-11 PM"   │
  │  Step 7 — Reason: "Create invite + draft confirmation" │
  │  Step 8 — Act: call calendar.createEvent(draft=true)   │
  │                                                         │
  │  Each Act call:                                         │
  │  1. Passes through Sandbox Classifier                   │
  │  2. LLM Firewall sanitizes API response (Steps 3,6)    │
  │  3. Action recorded to action_records table            │
  │  4. Circuit breaker counter incremented                │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 8: SANDBOX FINAL CLASSIFICATION
  ┌─────────────────────────────────────────────────────────┐
  │  Now that we know exact tool calls:                     │
  │  • calendar.createEvent → reversible, moderate risk    │
  │  • email.sendInvites to 4 people → REQUIRES APPROVAL   │
  │    (bulk communication threshold = 5, we're at 4,      │
  │     but this is first send → approval required)        │
  │                                                         │
  │  Decision: PENDING APPROVAL — push to user             │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 9: SDUI CARD GENERATION
  ┌─────────────────────────────────────────────────────────┐
  │  SDUI Generator builds the approval card:              │
  │  {                                                      │
  │    "type": "action_card",                              │
  │    "title": "Team Dinner — Thursday 7 PM",             │
  │    "components": [                                      │
  │      { "type": "text", "content": "Osteria Marco      │
  │        (Italian, vegetarian-friendly, 0.3mi away)" }, │
  │      { "type": "text", "content": "Inviting Alice,    │
  │        Bob, Carol, Dan" },                             │
  │      { "type": "action_row", "actions": [             │
  │        { "label": "Send Invites", "style": "primary", │
  │          "requires_biometric": true,                   │
  │          "action": { "type": "approve",               │
  │                      "action_id": "uuid..." } },       │
  │        { "label": "Edit", ... },                       │
  │        { "label": "Reject", ... }                      │
  │      ]}                                                 │
  │    ],                                                   │
  │    "expires_at": "+10 minutes"                         │
  │  }                                                      │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 10: PUSH TO ALL DEVICES (WebSocket)
  ┌─────────────────────────────────────────────────────────┐
  │  WebSocket Hub looks up all connections for user_id     │
  │  Pushes SDUI card to:                                   │
  │  • iPhone (shows as lock screen notification + card)   │
  │  • macOS daemon (shows as menu bar badge + popover)    │
  │  • iPad (if connected)                                 │
  │  All devices show the same card simultaneously         │
  └───────────────────────────┬─────────────────────────────┘
                              │ user sees card, taps "Send Invites"
                              ▼
STEP 11: BIOMETRIC APPROVAL ON DEVICE
  ┌─────────────────────────────────────────────────────────┐
  │  iOS: LAContext.evaluatePolicy(.biometrics)             │
  │  → FaceID scan succeeds                                │
  │  → One-time approval token generated:                  │
  │    { action_id: "uuid", nonce: "random32",             │
  │      device_attestation: DCAppAttestService.attest(),  │
  │      timestamp: now() }                                │
  │  → Signed with device private key (Secure Enclave)     │
  │  → Sent to backend via WebSocket or HTTPS POST         │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 12: APPROVAL VALIDATION + EXECUTION
  ┌─────────────────────────────────────────────────────────┐
  │  Backend validates:                                     │
  │  • Nonce is unused (Redis SET NX: one-time only)       │
  │  • Timestamp within 30-second window                   │
  │  • Device attestation valid (DCAppAttestService)       │
  │  • action_id matches a pending record for this user    │
  │                                                         │
  │  If valid:                                              │
  │  1. Fetch OAuth token from Vault (Google Calendar)     │
  │  2. Execute: POST /calendar/v3/events (create event)   │
  │  3. Execute: POST /gmail/v1/messages/send (invites)    │
  │  4. Update action_records: status → 'executed'         │
  │  5. Set undo_deadline = NOW() + 30 seconds             │
  │  6. Ingest outcome to Memory Hub:                      │
  │     "Organized team dinner, Thursday 7 PM, Osteria     │
  │      Marco, all 4 attended on [date]" (stored post)   │
  └───────────────────────────┬─────────────────────────────┘
                              ▼
STEP 13: CONFIRMATION PUSH + UNDO WINDOW
  ┌─────────────────────────────────────────────────────────┐
  │  WebSocket push to all devices:                        │
  │  { type: "action_status",                              │
  │    status: "executed",                                 │
  │    summary: "Calendar invite sent to 4 people.        │
  │              Osteria Marco, Thursday 7 PM.",           │
  │    undo_available_until: "2026-04-10T14:24:30Z" }     │
  │                                                         │
  │  UI shows: "Done ✓  Undo (28s)" snackbar               │
  │                                                         │
  │  If user taps Undo within 30s:                         │
  │  → DELETE /calendar/v3/events/{id}  (calendar)        │
  │  → action_records: status → 'undone'                  │
  │  → Memory Hub: retract the outcome entry              │
  └─────────────────────────────────────────────────────────┘

TOTAL ELAPSED TIME (typical):
  Step 0-2:  ~800ms (VAD + wake word + local classification)
  Step 3-6:  ~400ms (network + gateway + memory retrieval)
  Step 7:    ~2,800ms (8-step ReAct chain with Claude)
  Step 8-10: ~200ms (sandbox + SDUI generation + WS push)
  Step 11:   ~600ms (FaceID scan)
  Step 12-13: ~300ms (execution + confirmation push)
  ─────────────────────────────────────────────────
  TOTAL: ~5.1 seconds from voice to "Done ✓"
  (vs. 15-20 minutes if done manually)
```

---

### How the Clients Stay in Sync Across Devices

A user has three devices connected: iPhone, iPad, MacBook. All three must show consistent state at all times.

```
SYNC EVENTS AND WHO HANDLES THEM:

Event: User approves action on iPhone
→ iPhone sends approval to backend
→ Backend executes action
→ Backend WebSocket broadcasts action_status to ALL devices
→ iPad and MacBook dismiss the pending card automatically
→ All three show "Done ✓" simultaneously

Event: User adds memory on MacBook ("My dentist appointment is next Monday")
→ MacBook daemon sends memory_event to backend
→ Backend ingests to Memory Hub
→ Backend WebSocket pushes memory_sync to iPhone and iPad
→ All devices now have this memory in local SQLite cache

Event: Phone goes offline (airplane mode)
→ WebSocket drops
→ Phone switches to offline mode: queues new memory events locally
→ Pending action approvals are held in local queue
→ When connection restores: phone sends queued events with original timestamps
→ Backend applies CRDT merge for any conflicting state

Event: Circuit breaker trips on backend
→ Backend broadcasts via WebSocket AND UDP broadcast (LAN)
→ All connected WebSocket clients receive circuit_breaker message
→ Desktop daemon receives UDP broadcast independently
→ All devices freeze pending actions and show "AI paused" banner
```

---

### How the Local P2P Mesh Works

When the phone and desktop are on the same Wi-Fi network, they can communicate directly without going through the cloud. This enables sub-50ms local commands (vs. 200ms+ cloud round trip) and works even during internet outages.

```
PAIRING (one-time, via BLE):

  Phone (BLE Peripheral)         Desktop (BLE Central)
       │                               │
       │ advertise: service UUID       │
       │ ◄──────────────────────────── │ scan + connect
       │                               │
       │ ──── public key (P256) ──────▶│
       │ ◄─── public key (P256) ────── │
       │                               │
       │  Both compute:                │
       │  ECDH(myPrivKey, peerPubKey)  │
       │  → shared secret              │
       │  HKDF(shared, salt, info)     │
       │  → 32-byte session key        │
       │                               │
       │  All future P2P traffic       │
       │  encrypted: AES-256-GCM       │
       │  with this session key        │

DISCOVERY (on each LAN connection):

  Phone broadcasts mDNS: "_aldrich._tcp.local" with TXT record:
    deviceID=<uuid>, publicKeyHash=<hash>

  Desktop sees the advertisement, verifies publicKeyHash matches
  the paired device's key → establishes local TCP connection

  If mDNS fails (corporate Wi-Fi with client isolation):
    Fallback 1: BLE for small payloads directly
    Fallback 2: WebRTC data channel via public STUN server
    Fallback 3: Route through cloud (highest latency but always works)

LOCAL COMMAND FLOW (phone instructs desktop):

  Phone: "Open my notes for the 2 PM meeting"
  → Local intent classification: "desktop action, low complexity"
  → Skip cloud entirely
  → Encrypt: AES-GCM(session_key, { action: "open_app",
                                     app: "Notion",
                                     context: "2PM meeting" })
  → Send over local TCP to Desktop daemon
  → Desktop daemon: AXUIElement opens Notion, searches for "2PM"
  → Result sent back to phone via same local channel
  → Total latency: ~30-80ms (vs. 400ms+ via cloud)
```

---

### What Happens When Things Go Wrong

The system must degrade gracefully, not catastrophically. Here is the failure matrix:

```
COMPONENT DOWN       │ IMPACT                  │ DEGRADED BEHAVIOR
─────────────────────┼─────────────────────────┼──────────────────────────────
Anthropic API        │ No complex reasoning     │ Gemini fallback → Gemma local
                     │                         │ Simple tasks still work
─────────────────────┼─────────────────────────┼──────────────────────────────
Kafka                │ Memory ingestion queued  │ Direct DB write fallback
                     │                         │ Slight memory lag acceptable
─────────────────────┼─────────────────────────┼──────────────────────────────
Redis                │ No circuit breaker,      │ In-memory counter fallback
                     │ no session cache         │ Circuit breaker still fires
                     │                         │ (local) but not broadcast
─────────────────────┼─────────────────────────┼──────────────────────────────
PostgreSQL           │ No memory retrieval,     │ READONLY mode: surface cached
                     │ no action records        │ memories from device SQLite
                     │                         │ No new actions until restored
─────────────────────┼─────────────────────────┼──────────────────────────────
Internet (phone)     │ No cloud reasoning       │ Local Gemma 2B for simple Q&A
                     │                         │ Queue complex tasks for retry
                     │                         │ P2P mesh still works locally
─────────────────────┼─────────────────────────┼──────────────────────────────
WebSocket connection │ No real-time push        │ Client polls every 30s (REST)
                     │                         │ until WS reconnects (expo backoff)
─────────────────────┼─────────────────────────┼──────────────────────────────
OAuth token expired  │ Specific tool broken     │ Surface re-auth prompt for
 or revoked          │                         │ that integration only; others
                     │                         │ continue unaffected
─────────────────────┼─────────────────────────┼──────────────────────────────
Entire AWS region    │ Full service outage      │ Route53 DNS failover to
                     │                         │ standby region (15 min RTO)
```

---

### Summary: The Single Mental Model

If you take away one thing from this overview, it is this:

> **The client is the senses. The cloud is the brain. The wire is the nervous system. The safety layer is the immune system. They must work together, fail independently, and the user must always feel in control.**

Every design decision in the five pillars that follow flows from this principle. The local processing exists because the brain should not need to see everything the senses perceive. The safety layer exists because the brain can be wrong and must be constrained. The SDUI push exists because the user is the final authority, not the AI.

---

## PILLAR 1: The Memory Hub (Cognimemo vs. Hindsight)

### 1. Feasibility

Technically possible. The hardest part is not storage — it's **retrieval quality under adversarial conditions**: stale context, conflicting facts across devices, and junk data drowning signal. Both Cognimemo and Hindsight are real, but neither solves the specific problem out of the box.

**Verdict on the two paths:**

| Dimension | Cognimemo (SaaS) | Hindsight (OSS) |
|---|---|---|
| Time-to-production | Weeks | 3–6 months |
| Retrieval quality | Unknown (closed) | 91.4% LongMemEval (verified) |
| Latency control | None (vendor) | Full (self-hosted) |
| CRDT support | None documented | Must be layered on |
| Cost at 10K users | Predictable (SaaS pricing) | High infra cost |
| Split-brain handling | Unverified | Must build |

**Recommendation: Hindsight with a custom ingestion/conflict layer.** Cognimemo is a black box you can't debug when it fails at 3 AM. At startup scale, you need to understand your own memory layer.

---

### 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MEMORY HUB                            │
│                                                         │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Kafka   │──▶│  Ingestion   │──▶│   Hindsight    │  │
│  │ (buffer) │   │  Layer (Go)  │   │  (TEMPR index) │  │
│  └──────────┘   └──────────────┘   └────────────────┘  │
│        ▲               │                    │           │
│        │          CRDT Merge            Forgetting      │
│   Device events   (conflict free)        Curve GC       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Cold Storage (S3 + metadata DB)          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Memory taxonomy (typed, not a blob):**

```go
type MemoryType string

const (
    MemoryFact     MemoryType = "fact"     // "Mom's birthday is May 12"
    MemoryOpinion  MemoryType = "opinion"  // "I prefer morning workouts"
    MemoryAction   MemoryType = "action"   // "Emailed John at 14:03 yesterday"
    MemoryRoutine  MemoryType = "routine"  // "Gym plan: Week 3 of 24"
)

type Memory struct {
    ID            string           `json:"id"`
    Type          MemoryType       `json:"type"`
    Content       string           `json:"content"`
    Entities      []string         `json:"entities"`      // ["mom", "birthday"]
    CreatedAt     time.Time        `json:"created_at"`
    LastRetrieved time.Time        `json:"last_retrieved"`
    RetrievalCount int             `json:"retrieval_count"`
    Confidence    float64          `json:"confidence"`    // Hindsight opinion score
    DeviceOrigin  string           `json:"device_origin"`
    VectorClock   map[string]int64 `json:"vector_clock"`  // CRDT
}
```

---

### 3. Implementation Plan

**Phase 1 (Weeks 1–4): Foundation**
1. Deploy Hindsight in Docker on a dedicated instance (8-core, 32GB RAM minimum for TEMPR)
2. Stand up Kafka cluster (3-broker, `memory-ingest` topic, 12 partitions)
3. Build Go ingestion service: consume Kafka → normalize → write to Hindsight
4. Implement Vector Clock tracking per device per memory

**Phase 2 (Weeks 5–8): Conflict Resolution**
1. Implement CRDT merge logic per memory type
2. Build forgetting curve scorer and nightly GC job
3. Cold storage tiering to S3 with DynamoDB metadata index

**Phase 3 (Weeks 9–12): Cross-device sync**
1. WebSocket push from memory hub to all connected clients on mutation
2. Optimistic local writes with server reconciliation on reconnect

---

### 4. Code Suggestions

#### Q1 — CRDT Split-Brain Resolution

Different memory types need different CRDT semantics:

```go
// Facts use LWW-Register (Last-Write-Wins with vector clocks, not wall clock)
type LWWRegister struct {
    Value     string
    Timestamp int64  // Lamport timestamp, not wall clock
    DeviceID  string
}

func (r *LWWRegister) Merge(other LWWRegister) {
    if other.Timestamp > r.Timestamp {
        *r = other
    }
    // Tie-break deterministically by device ID to avoid flip-flopping
    if other.Timestamp == r.Timestamp && other.DeviceID > r.DeviceID {
        *r = other
    }
}

// Actions use OR-Set (Observed-Remove Set) — never lose completed actions
type ORSet struct {
    Elements map[string]map[string]struct{} // element -> {unique-tag}
    Removed  map[string]map[string]struct{} // tombstones
}

func (s *ORSet) Add(element, tag string) {
    if s.Elements[element] == nil {
        s.Elements[element] = make(map[string]struct{})
    }
    s.Elements[element][tag] = struct{}{}
}

func (s *ORSet) Merge(other ORSet) {
    for elem, tags := range other.Elements {
        for tag := range tags {
            s.Add(elem, tag)
        }
    }
    for elem, tags := range other.Removed {
        for tag := range tags {
            if s.Elements[elem] != nil {
                delete(s.Elements[elem], tag)
            }
        }
    }
}

// Opinions use G-Counter for confidence scoring (monotonically increases)
type ConfidenceCounter struct {
    Counts map[string]int64 // deviceID -> local count
}

func (c *ConfidenceCounter) Increment(deviceID string) {
    c.Counts[deviceID]++
}

func (c *ConfidenceCounter) Value() int64 {
    var total int64
    for _, v := range c.Counts {
        total += v
    }
    return total
}

func (c *ConfidenceCounter) Merge(other ConfidenceCounter) {
    for deviceID, count := range other.Counts {
        if count > c.Counts[deviceID] {
            c.Counts[deviceID] = count
        }
    }
}
```

**CRDT type assignment per memory category:**

| Memory Type | CRDT Type | Reason |
|---|---|---|
| Facts | LWW-Register | One canonical truth, latest device wins |
| Opinions | G-Counter (confidence) | Confidence can only grow |
| Actions | OR-Set | Never lose a completed action |
| Routines | LWW-Register | Latest plan version is authoritative |

#### Q2 — Ebbinghaus Forgetting Curve GC

```go
import "math"

type MemoryScore struct {
    BaseRetention   float64   // Initial strength (1.0 = perfect)
    StabilityFactor float64   // Increases with each retrieval
    LastRetrieved   time.Time
    EntityCount     int       // Number of strong entity connections
}

// R(t) = e^(-t/S) where t = days since last retrieval, S = stability
func (m *MemoryScore) RetentionAt(now time.Time) float64 {
    daysSince := now.Sub(m.LastRetrieved).Hours() / 24
    return math.Exp(-daysSince / m.StabilityFactor)
}

// Stability grows with each successful retrieval (spaced repetition)
func (m *MemoryScore) OnRetrieval() {
    m.StabilityFactor *= 2.5 // Roughly doubles each retrieval
    m.LastRetrieved = time.Now()
}

type GarbageCollector struct {
    DB          MemoryStore
    ColdStorage ObjectStore
    Threshold   float64 // e.g., 0.15 = 15% retention
    BatchSize   int
}

func (gc *GarbageCollector) Run(ctx context.Context) error {
    cursor := ""
    for {
        memories, next, err := gc.DB.ScanLowRetention(ctx, cursor, gc.BatchSize)
        if err != nil {
            return err
        }
        for _, m := range memories {
            score := m.Score.RetentionAt(time.Now())
            hasStrongLinks := len(m.Entities) > 0

            if score < gc.Threshold && !hasStrongLinks {
                // Archive, don't delete — enable resurrection
                if err := gc.ColdStorage.Archive(ctx, m); err != nil {
                    continue
                }
                gc.DB.MarkCold(ctx, m.ID)
            }
        }
        if next == "" {
            break
        }
        cursor = next
    }
    return nil
}
```

#### Q5 — Kafka Consumer Group (100 msgs/min)

```go
import "github.com/segmentio/kafka-go"

type MemoryIngester struct {
    reader    *kafka.Reader
    hindsight HindsightClient
    dedup     *BloomFilter // Prevent duplicate ingestion after reconnect
}

func NewIngester(brokers []string) *MemoryIngester {
    return &MemoryIngester{
        reader: kafka.NewReader(kafka.ReaderConfig{
            Brokers:        brokers,
            Topic:          "memory-ingest",
            GroupID:        "memory-hub-consumer",
            MinBytes:       1,
            MaxBytes:       10e6,
            MaxWait:        100 * time.Millisecond,
            CommitInterval: 0, // Manual commit only after successful write
        }),
        dedup: NewBloomFilter(1_000_000, 0.01),
    }
}

func (i *MemoryIngester) Run(ctx context.Context) {
    for {
        msg, err := i.reader.FetchMessage(ctx)
        if err != nil {
            if ctx.Err() != nil {
                return
            }
            continue
        }

        var event MemoryEvent
        if err := json.Unmarshal(msg.Value, &event); err != nil {
            i.reader.CommitMessages(ctx, msg) // Skip malformed
            continue
        }

        // Idempotency check
        if i.dedup.Contains(event.ID) {
            i.reader.CommitMessages(ctx, msg)
            continue
        }

        if err := i.hindsight.Retain(ctx, event); err != nil {
            // Don't commit — let Kafka retry
            time.Sleep(100 * time.Millisecond)
            continue
        }

        i.dedup.Add(event.ID)
        i.reader.CommitMessages(ctx, msg)
    }
}
```

---

### 5. UI/UX Improvements

- **Memory Timeline View** — Give users a scrollable "memory log" with filter by type (facts, opinions, actions). Trust is built by transparency.
- **Confidence Badges** — Show `[High Confidence]` vs `[Low Confidence]` on AI actions derived from opinion-type memories.
- **Manual Override** — Users must be able to correct a memory in 2 taps. "The AI thinks I prefer evenings — tap to fix."
- **Memory Health Dashboard** — Show storage used, memories expiring soon, entities most referenced.

---

### 6. Scalability & Bottlenecks

| Risk | Scale Point | Mitigation |
|---|---|---|
| Vector DB size | ~10M memories/user | Tiered: hot (pgvector), warm (Hindsight), cold (S3 + DynamoDB) |
| TEMPR retrieval cost | >500ms at 1M vectors | Pre-filter by entity graph before vector search |
| Kafka lag during peak | >10K events/sec | Scale to 24 partitions, 3 consumer instances |
| CRDT merge cost | O(n) per merge | Cap OR-Set size; expire tombstones after 30 days |

---

### 7. Risks & Edge Cases

- **Hallucinated facts becoming permanent** — If the LLM writes a fabricated "fact" into the memory store, it propagates forever. Mitigation: facts require a source reference (email ID, message URL, explicit user confirmation).
- **CRDT does not prevent semantic conflicts** — Two devices might both write factually correct but contextually contradictory opinions. This requires a semantic deduplication pass before ingestion, not just CRDT.
- **Cold storage resurrection is expensive** — Bringing archived memories back into the active vector index requires re-embedding. Budget 200ms latency for resurrection events.
- **Hindsight TEMPR is a research system** — 91.4% on LongMemEval doesn't mean it's production-hardened. Plan for a 3-month stabilization period.

---

### 8. Final Verdict

**⚠️ Risky but build it.** Hindsight over Cognimemo. The CRDT + forgetting curve combination is the right architecture, but it will take 3 months to stabilize. Ship Cognimemo in V1 as a placeholder, migrate to Hindsight in V2 once your ingestion patterns are understood.

---

## PILLAR 2: The Agentic "ReAct" Engine (The Doer)

### 1. Feasibility

Fully feasible. The Go-based state machine concern is **valid and the right call** — Python LangChain at production scale is a reliability nightmare (GIL, slow JSON parsing, memory leaks). A custom Go state machine is 100x more predictable.

The hard problems are:
1. Non-OpenAPI APIs (~40% of real-world APIs)
2. Token budget management across long chains
3. Prompt injection in API responses

---

### 2. Architecture

```
┌───────────────────────────────────────────────────────────┐
│                  REACT ORCHESTRATION ENGINE               │
│                                                           │
│   User Intent                                             │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────┐     ┌──────────────┐     ┌───────────────┐  │
│  │  Input  │────▶│ LLM Firewall │────▶│  ReAct Loop   │  │
│  │ Sanitize│     │ (Llama Guard)│     │  (Go FSM)     │  │
│  └─────────┘     └──────────────┘     └───────┬───────┘  │
│                                               │           │
│                                    ┌──────────▼────────┐ │
│                                    │   Tool Registry   │ │
│                                    │  (dynamic loader) │ │
│                                    └──────────┬────────┘ │
│                                               │           │
│                          ┌────────────────────┼──────┐   │
│                          │                    │      │   │
│                   ┌──────▼───┐    ┌───────────▼──┐   │   │
│                   │ Calendar │    │  Yelp/Maps   │  ...   │
│                   │  API     │    │    API       │   │   │
│                   └──────────┘    └──────────────┘   │   │
│                                                       │   │
│                        OAuth Vault (KMS)              │   │
└───────────────────────────────────────────────────────────┘
```

---

### 3. Implementation Plan

**Phase 1: Core FSM + Tool Registry (Weeks 1–3)**
1. Define the Go FSM interface
2. Build static tool registry with 5 hard-coded tools (Calendar, Gmail, Slack, Notion, Yelp)
3. Integrate Claude claude-sonnet-4-6 with structured tool-calling via `tools` parameter

**Phase 2: Dynamic API Ingestion (Weeks 4–6)**
1. OpenAPI v3 spec parser
2. Fallback: HAR file recorder for non-standard APIs
3. Pagination handler with sliding context window

**Phase 3: OAuth Vault (Weeks 7–9)**
1. AWS KMS envelope encryption for tokens
2. Background token refresher with jitter-based retry
3. Mid-loop token recovery without breaking the chain

---

### 4. Code Suggestions

#### Q2 — Go Agentic State Machine

```go
// Tool is the core interface every integration implements
type Tool interface {
    Name() string
    Description() string
    Schema() json.RawMessage   // JSON Schema for LLM tool-calling
    Execute(ctx context.Context, params json.RawMessage) (ToolResult, error)
}

type ToolResult struct {
    Content    string
    IsError    bool
    RawPayload json.RawMessage
}

type FSMState string

const (
    StateReasoning FSMState = "reasoning"
    StateActing    FSMState = "acting"
    StateObserving FSMState = "observing"
    StateCompleted FSMState = "completed"
    StateFailed    FSMState = "failed"
)

type ReActLoop struct {
    llm         LLMClient
    tools       map[string]Tool
    memory      MemoryClient
    maxSteps    int
    tokenBudget int
}

type Step struct {
    State      FSMState
    Thought    string
    ToolName   string
    ToolParams json.RawMessage
    Result     *ToolResult
    TokensUsed int
}

func (r *ReActLoop) Execute(ctx context.Context, userIntent string) (string, []Step, error) {
    history := []Step{}
    messages := r.buildInitialMessages(userIntent)
    totalTokens := 0

    for i := 0; i < r.maxSteps; i++ {
        if totalTokens > r.tokenBudget {
            return "", history, ErrTokenBudgetExceeded
        }

        resp, tokens, err := r.llm.Complete(ctx, messages, r.toolSchemas())
        totalTokens += tokens
        if err != nil {
            return "", history, err
        }

        if resp.ToolCall == nil {
            // Final answer — no more tool calls
            return resp.Content, history, nil
        }

        tool, ok := r.tools[resp.ToolCall.Name]
        if !ok {
            return "", history, fmt.Errorf("unknown tool: %s", resp.ToolCall.Name)
        }

        result, err := tool.Execute(ctx, resp.ToolCall.Parameters)
        step := Step{
            State:      StateActing,
            ToolName:   resp.ToolCall.Name,
            ToolParams: resp.ToolCall.Parameters,
            Result:     &result,
            TokensUsed: tokens,
        }
        history = append(history, step)

        // Feed result back into context
        messages = append(messages, LLMMessage{
            Role:    "tool",
            Content: result.Content,
            Name:    resp.ToolCall.Name,
        })
    }

    return "", history, ErrMaxStepsExceeded
}
```

#### Q3 — OAuth Token Vault with Mid-Loop Recovery

```go
type TokenVault struct {
    kms      KMSClient
    db       TokenStore
    mu       sync.RWMutex
    refreshQ chan refreshRequest
}

type OAuthToken struct {
    AccessToken  string
    RefreshToken string // Encrypted at rest via KMS envelope encryption
    ExpiresAt    time.Time
    ProviderID   string
    Scopes       []string
}

func (v *TokenVault) GetValid(ctx context.Context, providerID string) (string, error) {
    v.mu.RLock()
    token, err := v.db.Get(ctx, providerID)
    v.mu.RUnlock()
    if err != nil {
        return "", err
    }

    if time.Until(token.ExpiresAt) > 5*time.Minute {
        plaintext, err := v.kms.Decrypt(ctx, token.AccessToken)
        if err != nil {
            return "", err
        }
        return plaintext, nil
    }

    // Proactive refresh before expiry
    return v.refresh(ctx, token)
}

func (v *TokenVault) refresh(ctx context.Context, token OAuthToken) (string, error) {
    v.mu.Lock()
    defer v.mu.Unlock()

    refreshToken, err := v.kms.Decrypt(ctx, token.RefreshToken)
    if err != nil {
        return "", err
    }

    backoff := 1 * time.Second
    for attempt := 0; attempt < 5; attempt++ {
        newToken, err := v.doOAuthRefresh(ctx, token.ProviderID, refreshToken)
        if err == nil {
            encAccess, _ := v.kms.Encrypt(ctx, newToken.AccessToken)
            encRefresh, _ := v.kms.Encrypt(ctx, newToken.RefreshToken)
            v.db.Save(ctx, OAuthToken{
                AccessToken:  encAccess,
                RefreshToken: encRefresh,
                ExpiresAt:    newToken.ExpiresAt,
                ProviderID:   token.ProviderID,
            })
            return newToken.AccessToken, nil
        }

        var rateLimitErr *RateLimitError
        if errors.As(err, &rateLimitErr) {
            backoff = rateLimitErr.RetryAfter // Respect provider's Retry-After header
        } else {
            backoff *= 2 // Exponential backoff
        }

        select {
        case <-ctx.Done():
            return "", ctx.Err()
        case <-time.After(backoff + jitter()):
        }
    }

    return "", ErrTokenRevoked{ProviderID: token.ProviderID}
}
```

#### Q4 — Error Recovery Token Budget

> **The magic number: 3 retries, 2,000 tokens per retry, hard stop at 6,000 total recovery tokens before user escalation.**

```go
type APIErrorRecovery struct {
    llm        LLMClient
    maxRetries int // 3
    maxTokens  int // 6000
    usedTokens int
}

func (r *APIErrorRecovery) RecoverFromHTTP400(
    ctx context.Context,
    originalPayload json.RawMessage,
    errorResponse json.RawMessage,
    toolSchema json.RawMessage,
) (json.RawMessage, error) {
    prompt := fmt.Sprintf(`
API call failed with HTTP 400.
Error: %s
Original payload: %s
Current schema: %s

Analyze the error and produce a corrected payload that strictly conforms to the schema.
Respond with ONLY valid JSON, no explanation.`, errorResponse, originalPayload, toolSchema)

    for attempt := 0; attempt < r.maxRetries; attempt++ {
        if r.usedTokens >= r.maxTokens {
            return nil, ErrRecoveryBudgetExceeded
        }

        resp, tokens, err := r.llm.Complete(ctx, []LLMMessage{
            {Role: "user", Content: prompt},
        }, nil)
        r.usedTokens += tokens

        if err != nil {
            continue
        }

        var corrected json.RawMessage
        if err := json.Unmarshal([]byte(resp.Content), &corrected); err != nil {
            continue // LLM didn't produce valid JSON — try again
        }

        return corrected, nil
    }

    return nil, ErrNeedsUserIntervention{
        Reason:          "API schema mismatch after 3 attempts",
        OriginalPayload: originalPayload,
        LastError:       errorResponse,
    }
}
```

#### Q5 — Two-LLM Firewall / Prompt Injection Defense

```go
type LLMFirewall struct {
    guardModel     LLMClient // Small, fast: Llama Guard 3 8B or Granite Guardian
    mainModel      LLMClient
    maxPayloadSize int
}

type FirewallVerdict struct {
    Safe     bool
    Category string  // "prompt_injection", "pii_leak", "clean"
    Score    float64
}

func (f *LLMFirewall) Sanitize(ctx context.Context, apiResponse string) (string, error) {
    if len(apiResponse) > f.maxPayloadSize {
        apiResponse = apiResponse[:f.maxPayloadSize] + "[TRUNCATED]"
    }

    verdict, err := f.classifyWithGuard(ctx, apiResponse)
    if err != nil {
        return "", err // Fail closed on guard errors
    }

    if !verdict.Safe {
        return "", ErrPromptInjectionDetected{
            Category: verdict.Category,
            Score:    verdict.Score,
        }
    }

    // Structural sanitization REGARDLESS of guard verdict
    sanitized := removeInstructionPatterns(apiResponse)
    sanitized = wrapInDataContext(sanitized)

    return sanitized, nil
}

func removeInstructionPatterns(s string) string {
    // Hard regex patterns — never trust LLM to clean this
    patterns := []string{
        `(?i)ignore (all |previous |prior |above |earlier )?(instructions?|prompts?|context)`,
        `(?i)you are now`,
        `(?i)act as`,
        `(?i)system:`,
        `(?i)<\|im_start\|>`,
        `(?i)\[INST\]`,
    }
    for _, p := range patterns {
        re := regexp.MustCompile(p)
        s = re.ReplaceAllString(s, "[REMOVED]")
    }
    return s
}

func wrapInDataContext(content string) string {
    // Structural isolation — data cannot escape its role boundary
    return fmt.Sprintf(
        `<external_data source="api_response" trust="untrusted">%s</external_data>`,
        content,
    )
}
```

---

### 5. UI/UX Improvements

- **Reasoning Transparency Panel** — Show the ReAct chain in a collapsible "How I did this" drawer. Users need to understand what the AI did before trusting it with more.
- **Tool Call Preview** — Before executing a destructive tool call, show: "I'm about to call `DELETE /calendar/event/123`. Approve?"
- **Step Replay** — Allow users to "rewind" the agent to any step in the chain and try a different path.

---

### 6. Scalability & Bottlenecks

| Risk | Impact | Mitigation |
|---|---|---|
| ReAct loop token costs | $0.15–0.50 per complex query | Cache tool results aggressively; limit tool calls to 8 per loop |
| Parallel user chains | CPU-bound at 100 concurrent loops | Goroutine pool with 1000 max concurrent ReAct loops |
| Dynamic API spec parsing | 500ms overhead per new API | Pre-parse and cache specs in Redis with 24h TTL |
| LLM Firewall latency | +200ms per round trip | Co-locate guard model in same datacenter; use quantized 4-bit version |

---

### 7. Risks & Edge Cases

- **Infinite tool loop** — Agent calls Tool A, which returns data that triggers Tool A again. Mitigation: hash the `(tool_name, params)` combination and refuse re-entry within a single chain.
- **Context window overflow on paginated APIs** — A Slack channel with 10,000 messages will exceed any LLM's context. Mitigation: sliding-window pagination with summarization — summarize each page before loading the next.
- **Token revocation during a chain** — Google revokes an OAuth token mid-chain. The chain must not silently fail — it must pause, surface the re-auth UI, and resume from the last committed step.
- **Llama Guard false positives** — The guard model may flag legitimate content as injection. Rate should be logged and tuned. Never use guard verdicts as the only signal — combine with structural regex.

---

### 8. Final Verdict

**✅ Safe to build in Go.** The custom Go FSM is the right call. Budget 6 weeks to stabilize the ReAct loop alone. The LLM firewall is non-negotiable — ship it in V1, not V2.

---

## PILLAR 3: The Local "Always-On" Gatekeepers (The Senses)

### 1. Feasibility

This is the **hardest pillar** technically. You are fighting iOS background execution restrictions, thermal budgets, and RAM pressure simultaneously. The "always-on" dream is achievable on Android; on iOS it is severely constrained by design.

**Brutal truth about iOS:**
- You cannot run a background audio processing loop without the orange mic indicator. Full stop. iOS enforces this at the kernel level since iOS 14. **There is no workaround.**
- A 2B parameter model loaded in RAM permanently is not feasible on iOS background tasks. Budget for a 3–5 second cold start.

---

### 2. Architecture

```
DEVICE (iOS/Android)
┌────────────────────────────────────────────────────────────┐
│  Audio Hardware                                            │
│       │                                                    │
│       ▼                                                    │
│  [DSP / Low-Power Core]  ──── 3s ring buffer              │
│       │ VAD trigger (< 5mW)                                │
│       ▼                                                    │
│  [NPU]  ─── Wake-word model (Whisper Tiny / custom)        │
│       │                                                    │
│  ┌────▼───────────────────────────────────────────────┐   │
│  │            Intent Router                          │   │
│  │                                                    │   │
│  │  Local path: Gemma 2B (on-device, 4-bit quant)    │   │
│  │  Cloud path: Claude claude-sonnet-4-6 via API            │   │
│  │                                                    │   │
│  │  Thermal state: NOMINAL/FAIR → local              │   │
│  │  Thermal state: SERIOUS/CRITICAL → cloud          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Secure Enclave: audio buffer encryption keys             │
└────────────────────────────────────────────────────────────┘
```

---

### 3. Implementation Plan

1. **Weeks 1–2**: VAD integration (Silero VAD via ONNX Runtime on both platforms)
2. **Weeks 3–4**: Wake-word model (use OpenWakeWord or custom trained on your product name)
3. **Weeks 5–6**: Gemma 2B quantized to 4-bit via llama.cpp; benchmark cold start times
4. **Weeks 7–8**: Intent Router with thermal and latency-based routing decisions
5. **Weeks 9–10**: iOS BGProcessingTask configuration for model pre-warming
6. **Weeks 11–12**: Secure Enclave buffer encryption

---

### 4. Code Suggestions

#### Q1 — iOS Background Task + RAM Limits

iOS 18+ allocates a maximum of **~50MB for BGAppRefreshTask** and **no strict limit for BGProcessingTask** (but typically killed above 500MB total app footprint). A 2B parameter model at 4-bit quantization is ~1GB — it **cannot stay resident** in a background extension. It must live in the main app process.

```swift
import BackgroundTasks

func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.yourapp.model.prewarm",
        using: nil
    ) { task in
        self.handleModelPrewarm(task: task as! BGProcessingTask)
    }
    return true
}

func handleModelPrewarm(task: BGProcessingTask) {
    task.expirationHandler = {
        ModelManager.shared.cancelLoad()
        task.setTaskCompleted(success: false)
    }

    Task {
        do {
            try await ModelManager.shared.loadGemma2B()
            task.setTaskCompleted(success: true)
            scheduleNextPrewarm()
        } catch {
            task.setTaskCompleted(success: false)
        }
    }
}

func scheduleNextPrewarm() {
    let request = BGProcessingTaskRequest(identifier: "com.yourapp.model.prewarm")
    request.requiresNetworkConnectivity = false
    request.requiresExternalPower = false
    request.earliestBeginDate = Date(timeIntervalSinceNow: 30 * 60) // 30 min
    try? BGTaskScheduler.shared.submit(request)
}
```

#### Q2 — AVAudioSession for VAD Without Orange Mic

> **Critical note:** The ONLY way to avoid the orange mic on iOS is to NOT use the microphone in background. The architecture must be foreground listening ONLY, with push-to-listen UX. If always-on listening is a hard requirement, you MUST show the orange indicator. This is a UX decision, not a technical one.

```swift
import AVFoundation

class VADController {
    private let audioEngine = AVAudioEngine()
    private let vadModel: SileroVAD

    func startListening() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(
            .record,
            mode: .measurement,    // Lower power than .default
            options: [.allowBluetooth]
        )
        try session.setActive(true)

        let inputNode = audioEngine.inputNode
        let format = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: 16000,  // VAD works at 16kHz — don't record at 44.1kHz
            channels: 1,
            interleaved: false
        )!

        inputNode.installTap(onBus: 0, bufferSize: 512, format: format) { [weak self] buffer, _ in
            self?.processAudioBuffer(buffer)
        }

        try audioEngine.start()
    }

    private func processAudioBuffer(_ buffer: AVAudioPCMBuffer) {
        vadQueue.async { [weak self] in
            guard let speech = self?.vadModel.detect(buffer) else { return }
            if speech.probability > 0.85 {
                self?.onSpeechDetected(buffer)
            }
        }
    }
}
```

#### Q4 — Thermal State Handler

```swift
import Foundation

class ThermalRouter: ObservableObject {
    @Published var currentRoute: InferenceRoute = .local

    enum InferenceRoute {
        case local
        case cloud
    }

    private var thermalObserver: NSObjectProtocol?

    func startMonitoring() {
        thermalObserver = NotificationCenter.default.addObserver(
            forName: ProcessInfo.thermalStateDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.updateRoute()
        }
        updateRoute()
    }

    private func updateRoute() {
        let state = ProcessInfo.processInfo.thermalState
        switch state {
        case .nominal, .fair:
            currentRoute = .local
            LocalInferenceEngine.shared.setQuality(.full)
        case .serious:
            currentRoute = .local
            LocalInferenceEngine.shared.setQuality(.reduced) // 2-bit quant fallback
        case .critical:
            // Full cloud handoff — kill all local ML immediately
            currentRoute = .cloud
            LocalInferenceEngine.shared.suspend()
            CloudRouter.shared.takeover()
        @unknown default:
            currentRoute = .cloud
        }
    }
}
```

**iOS Thermal State Thresholds:**

| Thermal State | Meaning | Action |
|---|---|---|
| `.nominal` | Cool, normal | Full local inference |
| `.fair` | Slightly warm | Full local inference |
| `.serious` | Warm, throttling starting | Reduce model quality |
| `.critical` | Hot, aggressive throttling | Full cloud handoff |

#### Q5 — Secure Enclave Audio Buffer Encryption

```swift
import Security
import CryptoKit

class SecureAudioBuffer {
    private var encryptedChunks: [Data] = []
    private let key: SymmetricKey

    init() throws {
        // AES-256 key — in production, derive via Secure Enclave ECDH
        self.key = SymmetricKey(size: .bits256)
    }

    func append(_ pcmData: Data) {
        let sealedBox = try! AES.GCM.seal(pcmData, using: key)
        encryptedChunks.append(sealedBox.combined!)

        // Ring buffer: keep only last 3 seconds at 16kHz mono float32
        // 3s * 16000 samples * 4 bytes = 192KB
        let maxChunks = 3 * 16000 / 512
        if encryptedChunks.count > maxChunks {
            encryptedChunks.removeFirst()
        }
    }

    func extractAndClear() throws -> Data {
        defer {
            encryptedChunks = []
            // For true forensic resistance: use mlock() + explicit memset via C interop
        }

        let allData = encryptedChunks.compactMap { combined -> Data? in
            guard let box = try? AES.GCM.SealedBox(combined: combined),
                  let plaintext = try? AES.GCM.open(box, using: key) else { return nil }
            return plaintext
        }.reduce(Data(), +)

        return allData
    }
}
```

---

### 5. UI/UX Improvements

- **Listening Indicator Design** — The orange dot is unavoidable on iOS. Make it a feature: design a beautiful "listening wave" animation in your UI that frames the orange dot as intentional and trustworthy.
- **Privacy Mode** — One-tap "pause all sensing" — prominently surfaced in Control Center widget and lock screen.
- **Local vs Cloud Badge** — Show users a small indicator when processing is local (shield icon) vs cloud (cloud icon). Builds trust.

---

### 6. Scalability & Bottlenecks

The bottleneck is **device heterogeneity**. Your AI will run differently on an iPhone 15 Pro (ANE capable, fast) vs iPhone 12 (no ANE, slow) vs a budget Android. You need:

**Model tiering by device capability:**

| Device Tier | Model | Routing |
|---|---|---|
| iPhone 15 Pro / Pixel 8 Pro | Gemma 2B (4-bit) | Local first |
| iPhone 12–14 / mid-range Android | Gemma 500M | Local for simple, cloud for complex |
| iPhone 11 or older / budget Android | Cloud only | Always cloud |

---

### 7. Risks & Edge Cases

- **Apple rejects app for background mic use** — This is a real App Store review risk. Have a strong privacy narrative ready. Position as an accessibility tool, not surveillance.
- **Gemma 2B accuracy on noisy audio** — Local models degrade significantly in cafes, cars, or with accents. Have a user-calibrated confidence threshold — if local confidence < 0.7, automatically route to cloud.
- **The cold start problem is unsolvable on iOS background** — The only mitigation is to pre-warm the model via BGProcessingTask when the device is charging + on Wi-Fi + screen off. Accept the cold start as a known constraint.

---

### 8. Final Verdict

**⚠️ Risky.** The always-on local processing vision is **not achievable on iOS without the orange microphone indicator**. This is a fundamental UX constraint.

**Recommended pivot:** Ship as **push-to-listen** for V1 (hold button or raise-to-speak), ship always-on as an opt-in Android-first feature in V2. Don't let this kill the launch.

---

## PILLAR 4: Cross-Device Actuation & Generative UI (The Limbs)

### 1. Feasibility

SDUI is **proven at scale** (Airbnb, Lyft, Facebook all run production SDUI). The risk is not whether it works — it's schema drift between backend and client versions. This is a versioning and deployment discipline problem, not a technical one.

---

### 2. Architecture

```
BACKEND (Go)
┌───────────────────────────────────┐
│  AI decides to show UI            │
│       │                           │
│       ▼                           │
│  SDUIBuilder.build(intent)        │
│       │                           │
│       ▼                           │
│  SDUISchema (typed JSON) ─────────┼──── WebSocket push
└───────────────────────────────────┘
                │
┌───────────────┴────────────────────┐
│                                    │
iOS (SwiftUI)                Android (Compose)
SDUIRenderer.render(schema)   SDUIRenderer.render(schema)
```

---

### 3. Implementation Plan

1. **Week 1–2**: Define the JSON schema spec — this is the contract, get it right
2. **Week 3–4**: Build iOS SwiftUI renderer for 10 core component types
3. **Week 5–6**: Build Android Jetpack Compose renderer for same 10 types
4. **Week 7–8**: Schema versioning + backward compatibility layer
5. **Week 9–10**: macOS daemon with AXUIElement-based automation

---

### 4. Code Suggestions

#### Q1 — SDUI JSON Schema + Cross-Platform Renderer

**JSON Schema Spec:**

```json
{
  "version": "1.2",
  "id": "card_20260410_001",
  "type": "action_card",
  "title": "Server Outage Detected",
  "subtitle": "I've drafted responses for 3 actions",
  "components": [
    {
      "type": "text",
      "content": "AWS us-east-1 showing 40% error rate since 02:14 AM",
      "style": "body"
    },
    {
      "type": "action_row",
      "actions": [
        {
          "id": "approve_all",
          "type": "button",
          "label": "Approve All",
          "style": "primary",
          "requires_biometric": true,
          "action": {
            "type": "batch_execute",
            "payload": { "action_ids": ["email_delay", "cal_reschedule"] }
          }
        },
        {
          "id": "review",
          "type": "button",
          "label": "Review",
          "style": "secondary",
          "action": {
            "type": "navigate",
            "payload": { "screen": "action_detail", "id": "card_20260410_001" }
          }
        }
      ]
    }
  ],
  "expires_at": "2026-04-10T12:00:00Z"
}
```

**iOS SwiftUI Renderer:**

```swift
struct SDUIView: View {
    let schema: SDUISchema

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(schema.components, id: \.id) { component in
                SDUIComponentView(component: component)
            }
        }
    }
}

struct SDUIComponentView: View {
    let component: SDUIComponent

    var body: some View {
        switch component.type {
        case "text":
            Text(component.content ?? "")
                .font(fontForStyle(component.style))
        case "action_row":
            HStack(spacing: 8) {
                ForEach(component.actions ?? [], id: \.id) { action in
                    SDUIActionButton(action: action)
                }
            }
        case "slider":
            SDUISlider(config: component)
        default:
            EmptyView() // Unknown components silently ignored — future-proof
        }
    }
}
```

**Android Jetpack Compose Renderer:**

```kotlin
@Composable
fun SDUIView(schema: SDUISchema) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        schema.components.forEach { component ->
            SDUIComponent(component)
        }
    }
}

@Composable
fun SDUIComponent(component: SDUIComponentSchema) {
    when (component.type) {
        "text" -> Text(
            text = component.content ?: "",
            style = when(component.style) {
                "title" -> MaterialTheme.typography.headlineSmall
                "body"  -> MaterialTheme.typography.bodyMedium
                else    -> MaterialTheme.typography.bodySmall
            }
        )
        "action_row" -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            component.actions?.forEach { action ->
                SDUIButton(action = action)
            }
        }
        "slider" -> SDUISlider(config = component)
        // Unknown: render nothing, log for analytics
    }
}
```

> **Key insight:** Both platforms share the same `SDUISchema` data model. Only the rendering layer differs. Use a shared JSON Schema validation library on both clients to reject malformed payloads before rendering.

#### Q5 — BLE Bootstrap + ECDH for Seamless P2P Auth

**iOS (Swift) — BLE Peripheral:**

```swift
import CoreBluetooth
import CryptoKit

class BLEPairingManager: NSObject, CBPeripheralManagerDelegate {
    private var peripheralManager: CBPeripheralManager!
    private let serviceUUID = CBUUID(string: "YOUR-SERVICE-UUID")
    private let keyPair = P256.KeyAgreement.PrivateKey()

    func startAdvertising() {
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        guard peripheral.state == .poweredOn else { return }

        let publicKeyData = keyPair.publicKey.rawRepresentation

        let characteristic = CBMutableCharacteristic(
            type: CBUUID(string: "PUBLIC-KEY-CHAR-UUID"),
            properties: [.read, .notify],
            value: publicKeyData,
            permissions: [.readable]
        )

        let service = CBMutableService(type: serviceUUID, primary: true)
        service.characteristics = [characteristic]
        peripheralManager.add(service)
        peripheralManager.startAdvertising([CBAdvertisementDataServiceUUIDsKey: [serviceUUID]])
    }

    func deriveSessionKey(peerPublicKeyData: Data) throws -> SymmetricKey {
        let peerPublicKey = try P256.KeyAgreement.PublicKey(rawRepresentation: peerPublicKeyData)
        let sharedSecret = try keyPair.sharedSecretFromKeyAgreement(with: peerPublicKey)
        return sharedSecret.hkdfDerivedSymmetricKey(
            using: SHA256.self,
            salt: "omnipresent-local-mesh".data(using: .utf8)!,
            sharedInfo: Data(),
            outputByteCount: 32
        )
    }
}
```

**Go (Desktop Daemon) — BLE Central + ECDH:**

```go
type P2PAuthManager struct {
    privateKey *ecdh.PrivateKey
    sessionKey []byte
}

func NewP2PAuthManager() (*P2PAuthManager, error) {
    privKey, err := ecdh.P256().GenerateKey(rand.Reader)
    if err != nil {
        return nil, err
    }
    return &P2PAuthManager{privateKey: privKey}, nil
}

func (m *P2PAuthManager) DeriveSessionKey(peerPublicKeyBytes []byte) error {
    peerPub, err := ecdh.P256().NewPublicKey(peerPublicKeyBytes)
    if err != nil {
        return err
    }

    sharedSecret, err := m.privateKey.ECDH(peerPub)
    if err != nil {
        return err
    }

    hkdf := hkdf.New(sha256.New, sharedSecret, nil,
        []byte("omnipresent-local-mesh"))
    m.sessionKey = make([]byte, 32)
    _, err = io.ReadFull(hkdf, m.sessionKey)
    return err
}

// All P2P commands are AES-GCM encrypted with sessionKey.
// BLE exchange happens once; DHCP changes don't break the session
// because the session key persists in memory until the app is killed.
```

---

### 5. UI/UX Improvements

- **SDUI Component Preview Mode** — In settings, show users a gallery of AI-generated UI components so they understand what the AI can show them. Reduces surprise.
- **Component Accessibility** — Every SDUI component must support VoiceOver/TalkBack from day one. Include `accessibility_label` in the schema spec.
- **Desktop Daemon Onboarding** — The macOS accessibility permission request should be triggered from a beautiful, full-screen onboarding flow — not a random OS dialog. Show exactly what the AI will do with those permissions.

---

### 6. Scalability & Bottlenecks

| Risk | Mitigation |
|---|---|
| SDUI schema version drift | Schema versioning + backward-compatible additions only |
| mDNS fails on corporate Wi-Fi | Fallback chain: mDNS → BLE bootstrap → WebRTC STUN → cloud relay |
| Desktop daemon update lag | Ship as separate binary with auto-updater (Sparkle on macOS) |

---

### 7. Risks & Edge Cases

**Android FLAG_SECURE is a hard wall.** You cannot read content from FLAG_SECURE-protected windows using the Accessibility Service API. Attempting to do so will:
1. Return null/empty for the window content
2. Potentially trigger Play Store policy violation for Section 4.8 (Accessibility)

**What you CAN do:** Use your own app's Accessibility Service to read content in your own UI contexts only. Never advertise automation of banking or password manager apps in your Play Store listing.

**macOS JXA vs AXUIElement:** JXA requires Script Editor entitlements and is deprecated. Use `AXUIElement` via Swift directly:

```swift
import ApplicationServices

func getActiveWindowTitle() -> String? {
    let app = AXUIElementCreateSystemWide()
    var focusedApp: CFTypeRef?
    AXUIElementCopyAttributeValue(app, kAXFocusedApplicationAttribute as CFString, &focusedApp)

    guard let axApp = focusedApp else { return nil }
    var focusedWindow: CFTypeRef?
    AXUIElementCopyAttributeValue(axApp as! AXUIElement,
                                   kAXFocusedWindowAttribute as CFString,
                                   &focusedWindow)

    guard let axWindow = focusedWindow else { return nil }
    var title: CFTypeRef?
    AXUIElementCopyAttributeValue(axWindow as! AXUIElement,
                                   kAXTitleAttribute as CFString,
                                   &title)

    return title as? String
}
```

**mDNS Fallback Chain:**

```
1. mDNS (Bonjour) — works on most home/office Wi-Fi
2. BLE bootstrap — works even when Wi-Fi isolation is enabled
3. WebRTC STUN — works across NAT, requires internet
4. Cloud relay (WebSocket) — always works, highest latency
```

---

### 8. Final Verdict

**✅ Safe to build.** SDUI is proven. The P2P auth via BLE + ECDH is elegant and works. The macOS daemon via AXUIElement is production-viable. Do NOT attempt to automate FLAG_SECURE apps — it will get you banned.

---

## PILLAR 5: Trust, Safety & Production Realities (The Immune System)

### 1. Feasibility

This is the **most underestimated pillar** and the one most startups skip until something catastrophic happens. Build it first, or you will regret it on the first accidental bulk email blast.

---

### 2. Architecture

```
ALL API CALLS
      │
      ▼
┌─────────────────────────────────────────────────────┐
│             SAFETY MIDDLEWARE LAYER (Go)            │
│                                                     │
│  ┌──────────────┐   ┌──────────────┐               │
│  │ Action       │   │ Sandbox      │               │
│  │ Classifier   │──▶│ Boundary     │               │
│  │              │   │ Check        │               │
│  └──────────────┘   └──────┬───────┘               │
│                            │                        │
│              ┌─────────────┴───────────┐            │
│              │                         │            │
│         SAFE PATH                 PENDING PATH      │
│              │                         │            │
│         Execute                   Queue + Push      │
│         Record                    Biometric Gate    │
│         Undo State                Mobile Approval   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         Global Circuit Breaker               │  │
│  │    (Redis atomic counter + UDP broadcast)    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### 3. Implementation Plan

1. **Week 1**: Build ActionRecord + Undo Stack storage schema
2. **Week 2**: Build Sandbox Classifier (deterministic regex, no LLM)
3. **Week 3**: Build Pending UI State + WebSocket push to mobile
4. **Week 4**: Integrate Swift LocalAuthentication gate on mobile
5. **Week 5**: Build Circuit Breaker (Redis + UDP broadcast)
6. **Week 6**: Build Compensating Transaction registry

---

### 4. Code Suggestions

#### Q1 — Global Circuit Breaker (UDP Broadcast + Redis)

```go
type CircuitBreaker struct {
    redis         *redis.Client
    udpConn       *net.UDPConn
    broadcastAddr *net.UDPAddr
    threshold     int           // Max actions per minute before trip
    window        time.Duration
}

func (cb *CircuitBreaker) RecordAction(userID string) error {
    key := fmt.Sprintf("circuit:%s:%d", userID, time.Now().Unix()/60)
    count, err := cb.redis.Incr(context.Background(), key).Result()
    if err != nil {
        return err
    }
    cb.redis.Expire(context.Background(), key, 2*time.Minute)

    if count > int64(cb.threshold) {
        return cb.Trip(userID)
    }
    return nil
}

func (cb *CircuitBreaker) Trip(userID string) error {
    // 1. Set Redis flag — all API calls check this before executing
    cb.redis.Set(context.Background(),
        fmt.Sprintf("breaker:tripped:%s", userID),
        "1",
        10*time.Minute,
    )

    // 2. UDP broadcast to all local edge devices on same LAN segment
    payload := CircuitBreakerPayload{
        UserID:    userID,
        Action:    "STOP_ALL",
        Timestamp: time.Now().Unix(),
        Reason:    "runaway_loop_detected",
    }
    data, _ := json.Marshal(payload)
    cb.udpConn.WriteToUDP(data, cb.broadcastAddr)

    // 3. Push via WebSocket for cloud-connected devices
    WebSocketHub.Broadcast(userID, "circuit_breaker", payload)

    log.Printf("CIRCUIT BREAKER TRIPPED: user=%s threshold=%d/min", userID, cb.threshold)
    return ErrCircuitBreakerTripped{UserID: userID}
}

// Middleware: check breaker before every execution
func (cb *CircuitBreaker) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        userID := getUserID(r)
        key := fmt.Sprintf("breaker:tripped:%s", userID)
        tripped, _ := cb.redis.Exists(context.Background(), key).Result()
        if tripped > 0 {
            http.Error(w, "Circuit breaker active — all actions paused", http.StatusServiceUnavailable)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

**iOS — UDP Listener for STOP_ALL:**

```swift
import Network

class CircuitBreakerListener {
    private var listener: NWListener?

    func startListening() {
        let params = NWParameters.udp
        listener = try? NWListener(using: params, on: 9999)

        listener?.newConnectionHandler = { [weak self] connection in
            self?.receiveData(on: connection)
        }

        listener?.start(queue: .global(qos: .userInteractive))
    }

    private func receiveData(on connection: NWConnection) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 1024) { data, _, _, _ in
            guard let data = data,
                  let payload = try? JSONDecoder().decode(CircuitBreakerPayload.self, from: data),
                  payload.action == "STOP_ALL" else { return }

            DispatchQueue.main.async {
                AgentRunner.shared.stopAll()
                NotificationCenter.default.post(name: .circuitBreakerTripped, object: payload)
            }
        }
    }
}
```

#### Q2 — ActionRecord + Undo Stack + Compensating Transactions

```go
type ActionType string

const (
    ActionTypeReversible    ActionType = "reversible"    // Has direct undo
    ActionTypeCompensatable ActionType = "compensatable" // Needs compensating transaction
    ActionTypeReadOnly      ActionType = "readonly"      // No undo needed
)

type ActionRecord struct {
    ID             string          `json:"id" db:"id"`
    UserID         string          `json:"user_id" db:"user_id"`
    ToolName       string          `json:"tool_name" db:"tool_name"`
    ForwardPayload json.RawMessage `json:"forward_payload" db:"forward_payload"`
    InversePayload json.RawMessage `json:"inverse_payload,omitempty" db:"inverse_payload"`
    ActionType     ActionType      `json:"action_type" db:"action_type"`
    ExecutedAt     time.Time       `json:"executed_at" db:"executed_at"`
    UndoneAt       *time.Time      `json:"undone_at,omitempty" db:"undone_at"`
    Compensation   *Compensation   `json:"compensation,omitempty" db:"compensation"`
}

type Compensation struct {
    ToolName string          `json:"tool_name"`
    Payload  json.RawMessage `json:"payload"`
    Reason   string          `json:"reason"` // "email_sent_in_error"
}

// CompensationResolver maps action types to their compensating transactions
type CompensationResolver struct {
    strategies map[string]CompensationStrategy
}

type CompensationStrategy func(forward json.RawMessage) (Compensation, error)

func NewCompensationResolver() *CompensationResolver {
    r := &CompensationResolver{strategies: make(map[string]CompensationStrategy)}

    // Email sent → draft apology
    r.strategies["gmail.sendEmail"] = func(fwd json.RawMessage) (Compensation, error) {
        var email SendEmailPayload
        json.Unmarshal(fwd, &email)
        return Compensation{
            ToolName: "gmail.draftEmail",
            Payload: mustMarshal(DraftEmailPayload{
                To:      email.To,
                Subject: "Re: " + email.Subject,
                Body: fmt.Sprintf(
                    "Apologies for my previous email. That was sent in error by my AI assistant. "+
                    "Please disregard it. — %s", email.From,
                ),
            }),
            Reason: "sent_in_error",
        }, nil
    }

    // Calendar invite sent → send cancellation
    r.strategies["calendar.createEvent"] = func(fwd json.RawMessage) (Compensation, error) {
        var event CreateEventPayload
        json.Unmarshal(fwd, &event)
        return Compensation{
            ToolName: "calendar.deleteEvent",
            Payload:  mustMarshal(DeleteEventPayload{EventID: event.CreatedEventID}),
            Reason:   "created_in_error",
        }, nil
    }

    return r
}
```

#### Q3 — Sandbox Boundary (Turing Red Line) + Biometric Gate

**Go Middleware — Deterministic Sandbox Classifier:**

```go
type SandboxClassifier struct {
    financialAPIs    map[string]bool
    destructiveVerbs map[string]bool
    bulkThreshold    int
}

func NewSandboxClassifier() *SandboxClassifier {
    return &SandboxClassifier{
        financialAPIs: map[string]bool{
            "stripe": true, "plaid": true, "paypal": true,
            "braintree": true, "square": true,
        },
        destructiveVerbs: map[string]bool{
            "DELETE": true, "PURGE": true,
        },
        bulkThreshold: 5,
    }
}

func (sc *SandboxClassifier) Classify(call ToolCall) SandboxDecision {
    // Rule 1: Financial APIs always require approval
    if sc.financialAPIs[call.ServiceName] {
        return SandboxDecision{
            RequiresApproval: true,
            Reason:           "financial_api",
            RiskLevel:        RiskHigh,
        }
    }

    // Rule 2: Destructive HTTP methods
    if sc.destructiveVerbs[call.HTTPMethod] {
        return SandboxDecision{
            RequiresApproval: true,
            Reason:           "destructive_operation",
            RiskLevel:        RiskHigh,
        }
    }

    // Rule 3: Bulk communication
    if recipients, ok := call.Params["recipients"].([]interface{}); ok {
        if len(recipients) > sc.bulkThreshold {
            return SandboxDecision{
                RequiresApproval: true,
                Reason:           "bulk_communication",
                RiskLevel:        RiskMedium,
                RecipientCount:   len(recipients),
            }
        }
    }

    return SandboxDecision{RequiresApproval: false, RiskLevel: RiskLow}
}
```

**iOS Swift — Biometric Gate:**

```swift
import LocalAuthentication

class BiometricGate {
    func requestApproval(
        for action: PendingAction,
        completion: @escaping (Bool, Error?) -> Void
    ) {
        let context = LAContext()
        context.localizedCancelTitle = "Reject Action"

        let reason = "Approve: \(action.humanReadableDescription)"

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) else {
            context.evaluatePolicy(.deviceOwnerAuthentication,
                                   localizedReason: reason,
                                   reply: completion)
            return
        }

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                               localizedReason: reason,
                               reply: completion)
    }
}

func handlePendingAction(_ action: PendingAction) {
    BiometricGate().requestApproval(for: action) { success, error in
        guard success else {
            ActionQueue.shared.reject(action.id, reason: "biometric_failed")
            return
        }
        ActionQueue.shared.approve(action.id)
        // Backend now executes the actual HTTP request
    }
}
```

---

### 5. UI/UX Improvements

- **Undo UI Pattern** — After every AI action, show a 5-second "Undo" snackbar (like Gmail's send undo). This is the most trusted pattern for reversible actions.
- **Action History Screen** — A chronological log of everything the AI did, with Undo buttons where applicable and "Compensate" buttons for irreversible actions.
- **Red Line Actions** — Financial and bulk-send actions should have a distinct visual treatment — red border, bold confirmation text, biometric icon prominently displayed.

---

### 6. Scalability & Bottlenecks

| Risk | Impact | Mitigation |
|---|---|---|
| ActionRecord table grows unbounded | 10M rows/day at scale | Partition by user_id + month; archive to S3 after 90 days |
| UDP broadcast doesn't cross subnets | Cloud devices don't receive STOP_ALL | WebSocket push as primary; UDP as LAN-only supplement |
| Redis circuit breaker is a SPOF | No breaker protection if Redis goes down | Redis Sentinel cluster; local in-memory fallback counter |
| Undo state for third-party APIs changes | API updates its response schema | Store full snapshot of response, not just IDs |

---

### 7. Risks & Edge Cases

- **The compensating transaction paradox** — Sending an automated apology email for an accidentally sent email may create more confusion than saying nothing. Include a user-visible delay (30 seconds) before firing compensating transactions, with a "Cancel" option.
- **Circuit breaker false positives** — A legitimate bulk calendar invite (all-hands meeting) looks like a runaway loop. Tune threshold per tool category.
- **Biometric gate UX friction** — If every AI action requires FaceID, users will hate the product. Carefully calibrate what triggers the gate. Established patterns (reschedule a single meeting) should never require biometrics.

---

### 8. Final Verdict

**✅ Safe to build. Build it FIRST.** This is the load-bearing pillar. Without it, every other pillar is dangerous. The circuit breaker and sandbox classifier must ship in V1 even if they're simple. You can always make them more sophisticated — you cannot un-send 1,000 emails.

---

## SYSTEM-WIDE VERDICT

### Architecture Score: 7.5 / 10

The vision is architecturally sound. Points deducted for:
- iOS background processing constraints that fundamentally limit the "always-on" promise (-1.5)
- CRDT complexity for a V1 product (-0.5)
- Hindsight is not production-hardened yet (-0.5)

---

### The 3 Riskiest Bets (Ranked)

| Rank | Risk | Why It's Dangerous |
|---|---|---|
| 1 | Always-on iOS audio | Apple will reject or hobble your app. Platform policy risk, not a technical one. |
| 2 | Dynamic API ingestion without OpenAPI spec | ~40% of real-world APIs are non-standard. Could take 6+ months and still be brittle. |
| 3 | Hindsight in production | Research framework with ~1 year of production history. Painful stabilization phase guaranteed. |

---

### Single Most Important Component to Build First

**Pillar 5: The Safety Layer.** Every other pillar generates actions that could cause real harm. Build the circuit breaker, sandbox classifier, and undo stack before you write a single line of tool-calling logic. This is not optional.

---

### Consolidated Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Backend orchestration | Go 1.22+ | Performance, goroutines, strong typing |
| LLM integration | Claude claude-sonnet-4-6 (primary), Gemini Flash (parallel) | Best tool-calling accuracy |
| Memory | Hindsight (self-hosted) + pgvector (hot cache) | Control + quality |
| Message broker | Apache Kafka (3-broker) | Durability + replay capability |
| Token vault | AWS KMS + PostgreSQL | Envelope encryption, auditable |
| iOS client | SwiftUI + Swift Concurrency | Native performance |
| Android client | Jetpack Compose + Coroutines | Native performance |
| Desktop daemon | Swift (macOS) / C++ (Windows) | AXUIElement access |
| P2P mesh | BLE + ECDH + AES-GCM | No server required for local commands |
| Cold storage | S3 + DynamoDB | Cost-efficient archival |
| Circuit breaker | Redis Sentinel + UDP broadcast | Sub-millisecond trip time |
| LLM Firewall | Llama Guard 3 (8B, quantized) | Open-source, self-hostable, auditable |
| SDUI | Custom JSON schema + SwiftUI/Compose renderers | No third-party dependency |
| Auth | Auth0 or Supabase Auth + OAuth 2.0 + PKCE | Battle-tested |
| Infra | AWS ECS Fargate + RDS PostgreSQL + ElastiCache | Familiar, scalable |

---

### MVP Scope — What to Cut for V1

**Keep (load-bearing):**
- Safety Layer (Pillar 5) — non-negotiable
- ReAct Engine with 5 hard-coded tools: Gmail, Calendar, Slack, Notion, Yelp
- Memory hub (use Cognimemo as placeholder — swap to Hindsight in V2)
- iOS + Android apps with SDUI for action approval
- Push-to-listen (NOT always-on audio)
- SDUI for 5 component types: text, button, action_row, list, card

**Cut for V1:**
- Dynamic OpenAPI ingestion (use hand-coded tool adapters instead)
- Always-on background audio (ship as Android-only beta)
- Desktop daemon (ship in V1.5)
- CRDT conflict resolution (use last-write-wins for V1, add CRDTs in V2)
- Ebbinghaus GC (basic TTL-based pruning for V1)
- Wearable integration
- Local P2P mesh (use cloud relay for V1)

---

### Final Go/No-Go

## ✅ GO — with guardrails

This is a legitimate, buildable product. The core value proposition (proactive AI that acts across apps with user approval) is technically sound and the market timing is right. The risks are manageable if you:

1. Ship push-to-listen first, not always-on
2. Build the safety layer before the capability layer
3. Use Cognimemo to de-risk memory complexity in V1
4. Accept that dynamic API ingestion is a V2 feature

The "omnipresent" vision is a 2-year build. The "hyper-useful personal assistant" that reschedules your meetings and drafts your emails is an 8-month build. **Ship the 8-month version first.**

---

*Remote plan session: https://claude.ai/code/scheduled/trig_01CvVNn1Vtxfewo3Ld6w7RAd*

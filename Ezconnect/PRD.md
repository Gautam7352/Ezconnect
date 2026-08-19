# Ezconnect — Product Requirements Document (PRD)

**Version:** 1.2.0
**Previous Version:** 1.1.0
**Status:** Approved for MVP
**Target Platform:** Android (Universal cross-platform with iOS & Web support via Expo SDK 57)
**Author:** Gautam Kumar & Antigravity

> **Changelog v1.1.0 → v1.2.0 (2026-08-20):**
> - Tech Stack § 4.1 corrected: 3 library errors found and fixed (BLE, NFC HCE, notification, ORM).
> - Decision Log § 4.3 entries 007–010 added for each corrected decision.
> - `ai/feasibility-analysis.md` created as the authoritative technical feasibility reference.
> - Risk Register added to feasibility analysis.

> **Changelog v1.0.0 → v1.1.0 (2026-08-20):**
> - Section 4.1 Tech Stack updated to reflect confirmed library decisions from technical feasibility research.
> - Section 4.3 Decision Log added — documents every architectural decision, what was originally assumed, what the reality is, and what we chose instead.
> - Phase 1 roadmap updated: BLE moved to MVP (not post-MVP), NFC Beam replaced with NFC HCE + BLE.
> - Phase 2 updated to reflect what post-MVP actually means now.


---

## 1. Executive Summary & Vision

**Ezconnect** is an intelligent, offline-first in-person networking companion designed for meetups, conferences, and hackathons. It solves the two most common friction points in professional networking:
1. **Frictionless Contact Exchange:** Instantly sharing contact info, LinkedIn, GitHub, and portfolio links without relying on cellular network availability (via NFC HCE tap, BLE proximity handshake, and QR code fallbacks).
2. **Contextual Conversation Memory:** Non-invasively capturing voice memos and conversations via quick Android shortcuts, transcribing them offline via a two-stage pipeline (native STT + Whisper), extracting names and topics, and smartly linking them to exchanged contacts so you never forget who you met or what was discussed.

---

## 2. Target Audience & Problem Statements

### 2.1 Target Audience
- Tech meetup & conference attendees (developers, founders, investors, designers).
- Hackathon participants forming teams on the fly.
- Event organizers and power networkers who meet 20+ new people in a single evening.

### 2.2 Core Problems Solved
- **Network Blackouts:** High-density venues often have jammed Wi-Fi and congested cellular data, making web-based exchanges fail.
- **Clunky Friction:** Exchanging social links manually (searching usernames, typing URLs) disrupts conversational flow.
- **Context Loss ("Who was that again?"):** Meeting dozens of people leads to forgotten names, lost follow-ups, and mixed-up business cards.

---

## 3. Core Features & Specifications

### 🎯 Feature 1: Digital Business Cards & Multi-Persona Profiles
Users can create and customize rich digital contact cards.

- **Multi-Persona Profiles:**
  - Switch between distinct personas: *Developer / Hacker*, *Founder / Business*, and *Casual / Social*.
  - Persona fields: Full Name, Headline / Role, Company, Avatar, Phone, Email, LinkedIn URL, GitHub URL, Portfolio / Website, Custom Social Links.
- **Dynamic QR Code Display:**
  - In-app QR code display encoding the active persona's vCard data or universal web URL.
  - High-contrast, easily scan-able offline QR code with custom logo branding.

---

### 📡 Feature 2: Tap-to-Share & Instant Offline Exchange
Seamless contact sharing requiring zero internet connection.

**Note (v1.1.0):** The original plan referenced "NFC / BLE P2P Handshake" generically and mentioned "Android Beam". These have been corrected below after technical feasibility analysis confirmed Android Beam was removed in Android 10. See Decision Log § 4.3 for full rationale.

- **Ezconnect-to-Ezconnect (Bidirectional — Three-Layer Strategy):**
  - **Layer 1 — BLE Proximity Exchange (Primary):** When both users have Ezconnect, the app advertises a custom BLE Service UUID. RSSI proximity filtering (> -60 dBm) ensures exchange only triggers with the person in front of you. Full profile JSON transfers over GATT after initial BLE handshake. Bidirectional — both profiles exchange simultaneously.
  - **Layer 2 — NFC HCE Tap (Secondary):** Your phone emulates an NFC card via Android Host Card Emulation. The other user taps their phone to yours — no app required on their side — and receives your vCard or web card URL. Closest Android equivalent to iOS "just tap phones".
  - **Layer 3 — QR Code (Universal Fallback):** Always works. No permissions, no hardware negotiation. Camera scan opens web card or triggers vCard download.
  - Haptic feedback and confirmation dialog on bidirectional BLE exchange to accept and save the connection.

- **Universal Non-App Fallback:**
  - NFC HCE tap delivers vCard/URL to any NFC-capable phone.
  - QR code scan with any camera app opens the web card page or downloads `.vcf` directly into native address book.

---

### 🎙️ Feature 3: Non-Invasive Background Audio Recording
Frictionless audio capture that does not interrupt real-world conversations.

**Note (v1.1.0):** Original plan mentioned "double-press power button" as a trigger. This is technically impossible on Android — the OS reserves it for Google Assistant / Emergency SOS. Dropped and replaced with official Android mechanisms below.

- **Android System Triggers (All Official, OS-Approved):**
  - **Quick Settings Tile:** One-tap toggle in the Android notification shade. Implemented via Expo Inline Module (Kotlin `TileService`). Android 13+ supports `requestAddTileService()` to prompt user to add tile.
  - **Persistent Notification Control:** Ongoing notification with "Stop & Transcribe" action button. Zero friction, works from any app or lock screen.
  - **In-App Button:** Fast-access floating action button within the app for when the user has the app open.
- **Foreground Audio Service:**
  - Powered by `expo-audio` with `enableBackgroundRecording: true` config plugin. Auto-injects all required Android 14+ manifest entries (`FOREGROUND_SERVICE_MICROPHONE`, `foregroundServiceType="microphone"`).
  - OS microphone privacy indicator is always visible during recording — this is required by Android and is a **user trust feature**, not a bug.

---

### 🧠 Feature 4: Hybrid Offline-First AI Conversation Memory

**Note (v1.1.0):** Transcription is now a confirmed **two-stage pipeline**. "On-device local transcription (e.g. embedded Whisper / on-device STT)" from v1.0.0 has been made concrete with specific libraries and performance characteristics.

- **Stage 1 — Real-Time Interim (expo-speech-recognition):**
  - Wraps Android's native `SpeechRecognizer`. Streams partial live results during recording.
  - Low latency, low battery, shown live in the recording notification.
  - Quality is device/OEM dependent. Requires offline language pack on device.
- **Stage 2 — Deep Post-Recording Analysis (whisper.rn):**
  - Runs `whisper.cpp` via JNI (C++ NDK). Processes full audio file after recording stops.
  - Default model: Whisper `tiny` (75MB, ~15s for 5-min audio). Produces high-accuracy transcript + entity extraction (names, topics, action items).
  - Requires `npx expo prebuild` (NDK compilation).
- **Cloud AI Enhancement (Optional):**
  - User-triggered "Re-analyze with AI" button when connected.
  - Sends audio to Gemini Flash / Deepgram for speaker-labeled, deeply structured output.
  - Stores enhanced transcript only with user confirmation.
- **Privacy & Storage Control:**
  - User can auto-delete raw audio post-transcription to save disk space, or keep it.
  - Full manual deletion control over any transcript, audio, or contact.

---

### 🔗 Feature 5: Smart Contact-to-Conversation Linking

- **Intelligent Suggestion Engine:**
  - When a recording is completed shortly after a contact exchange, Ezconnect suggests linking the conversation memory to that contact.
  - Suggestion signals: Timestamp proximity, event context, name match in transcript.
  - **User Validation:** Suggestions are presented as interactive confirmation cards (Accept / Reject / Link to Other).

---

### 📅 Feature 6: Event-Based CRM & Smart Search

- **Event Grouping:**
  - Tag contacts and conversations with Event Name, Date, and Venue (e.g., "React India 2026", "AI Hackathon").
  - Filter and view all connections made at a specific event.
- **Search (Two-Layer):**
  - **MVP: SQLite FTS5 keyword search** — zero model size, instant, supports prefix and partial queries.
  - **Post-MVP: Semantic vector search** — `sqlite-vec` + on-device `all-MiniLM-L6-v2` embeddings via `react-native-executorch` for natural language topic search (e.g. *"founder building robotics"*).
- **Optional AI Follow-Up Drafter:**
  - One-tap button to draft a personalized follow-up message for LinkedIn or Email referencing the specific topics discussed.
  - Left entirely optional and editable by the user before sending.

---

## 4. Technical Architecture & Data Model

### 4.1 Tech Stack (Confirmed — v1.2.0)

> Updated 2026-08-20 from v1.1.0. See Decision Log § 4.3 (decisions 007–010) for the four library corrections made after full feasibility analysis. See [`ai/feasibility-analysis.md`](./ai/feasibility-analysis.md) for the complete analysis.
>
> **v1.1.0 tech stack had 4 errors (now corrected):**
> - `react-native-ble-plx` → `munim-bluetooth` (ble-plx is Central-only, no advertising API)
> - `react-native-nfc-manager` alone → add `react-native-hce` (nfc-manager doesn't include HCE)
> - `@notifee/react-native` → `react-native-notify-kit` (Notifee is officially archived)
> - `WatermelonDB` → `expo-sqlite` v14 + Drizzle ORM (WatermelonDB has New Architecture issues)

- **Framework:** Expo SDK 57 (React Native 0.86, React 19.2) — **Bare Workflow via CNG (Continuous Native Generation)**
- **Build System:** `npx expo prebuild` → `npx expo run:android` (dev) / EAS Build (production). The `android/` directory is a **generated artifact** (gitignored), not hand-edited.
- **Routing:** Expo Router v4 (Typed Routes)
- **Native Extension Method:** Expo Inline Modules (SDK 57 — Experimental. Write Kotlin in `modules/`, auto-bridged to JS via prebuild)

**Hardware Integration (v1.2.0 — corrected):**
| Feature | Library (v1.2.0) | Was in v1.1.0 | Native? |
| :--- | :--- | :--- | :--- |
| Background audio recording | `expo-audio` (enableBackgroundRecording) | Same | ✅ (config plugin) |
| Quick Settings Tile | Expo Inline Module (Kotlin `TileService`) | Same | ✅ (experimental) |
| Persistent notification controls | `react-native-notify-kit` | ~~`@notifee/react-native`~~ (archived) | ✅ |
| NFC HCE (phone emulates card) | `react-native-hce` | ~~not included~~ (missing library) | ✅ |
| NFC tag read/write | `react-native-nfc-manager` v4.x | Same | ✅ |
| BLE bidirectional (Central + Peripheral) | `munim-bluetooth` | ~~`react-native-ble-plx`~~ (Central-only) | ✅ |
| QR code generation | `react-native-qrcode-svg` | Same | ❌ (JS only) |
| QR code scanning | `expo-camera` (barcode API) | Same | ✅ (config plugin) |
| Offline transcription (Whisper) | `whisper.rn` (use `tiny-q8` quantized) | Same | ✅ (NDK/C++) |
| Real-time STT | `expo-speech-recognition` | Same | ✅ |

**Data & State (v1.2.0 — corrected):**
| Feature | Library (v1.2.0) | Was in v1.1.0 |
| :--- | :--- | :--- |
| Primary ORM & queries | `expo-sqlite` v14 + Drizzle ORM | ~~WatermelonDB~~ (New Arch issues) |
| FTS5 full-text search | `expo-sqlite` raw SQL + triggers | ~~`@op-engineering/op-sqlite`~~ (redundant) |
| State management | Zustand | Same |
| Secure local config/flags | MMKV | Same |

**Styling & Animations:** Theme tokens (`@/constants/theme`), React Native Reanimated 4, React Native Worklets



---

### 4.2 Local Data Model

```
┌──────────────┐         ┌──────────────┐
│   Profile    │ 1     * │   Contact    │
│  (Personas)  │─────────│  (Received)  │
└──────────────┘         └──────────────┘
                                │ 1
                                │
                                │ *
                         ┌──────────────┐
                         │ Conversation │
                         │  (Memories)  │
                         └──────────────┘
                                │ *
                                │
                                │ 1
                         ┌──────────────┐
                         │    Event     │
                         │ (Meetup/Tag) │
                         └──────────────┘
```

**Search indexes (separate virtual tables in same SQLite file):**
- `contacts_fts` — FTS5 virtual table over name, headline, topics, notes, event_name
- `embeddings` (Post-MVP) — `sqlite-vec` vector table for semantic search

---

### 4.3 Decision Log

This section permanently records every significant architectural decision: what was originally assumed, what reality revealed, and what was chosen — so future developers and AI assistants understand the *why* behind every choice.

---

#### Decision 001: Recording Trigger — Double-Press Power Button → DROPPED
- **Originally Assumed (PRD v1.0.0):** Double-pressing the power button could be used as a quick, non-intrusive recording trigger.
- **Reality Discovered (2026-08-20):** Android OS fully reserves the double-press power button event for Google Assistant / Emergency SOS. No third-party app can intercept it at any API level. There is no workaround.
- **Decision:** Dropped entirely. Replaced with three official Android mechanisms:
  1. Quick Settings Tile (`TileService`) — most discoverable
  2. Persistent Notification action button — accessible from lock screen
  3. In-App FAB — for when app is open
- **Why:** All three are standard Android SDK APIs that do not conflict with system functions, do not require special permissions beyond what the recording itself requires, and are familiar to Android users.

---

#### Decision 002: NFC Bidirectional P2P Exchange → DROPPED, replaced by BLE + NFC HCE
- **Originally Assumed (PRD v1.0.0):** "NFC / BLE P2P Handshake" for bidirectional exchange. Also referenced "NFC Tag / Beam" for non-app users.
- **Reality Discovered (2026-08-20):** Android Beam (the NFC P2P API) was fully deprecated and removed in Android 10 (API 29). There is no public API for two Android phones to directly exchange data via NFC in a P2P fashion. It cannot be brought back via any workaround.
- **Decision:** Replaced with a three-layer strategy:
  1. **BLE** (`react-native-ble-plx`) for bidirectional Ezconnect-to-Ezconnect exchange using advertising + GATT profile read. RSSI threshold (-60 dBm) limits exchange to physically proximate devices.
  2. **NFC HCE (Host Card Emulation)** via `react-native-nfc-manager` — the phone emulates an NFC contactless card. Any NFC reader (including another phone without the app) can tap and receive vCard/URL. Closest to iOS "just tap phones" on Android.
  3. **QR Code** as universal offline-always-works fallback.
- **Why:** BLE is the modern standard for short-range P2P on Android. NFC HCE is the legitimate Android API for one-way NFC delivery without requiring the other device to have the app. QR eliminates any dependency on hardware radio support.

---

#### Decision 003: Expo Workflow — Managed → CNG (Continuous Native Generation)
- **Originally Assumed (PRD v1.0.0):** Implied standard Expo managed workflow.
- **Reality Discovered (2026-08-20):** Multiple required features (background audio foreground service, Quick Settings Tile, `whisper.rn` NDK compilation, BLE, NFC HCE) cannot run in the Expo Go sandbox or the managed workflow without native code access.
- **Decision:** Use **Expo CNG (Continuous Native Generation)** — `npx expo prebuild` generates the `android/` and `ios/` directories from `app.json` and config plugins. These generated directories are gitignored and regenerated cleanly. Development uses `npx expo run:android` or EAS Build.
- **Why:** CNG gives full native code access while preserving Expo's config-driven DX. The `android/` directory is treated as a build artifact, not source, avoiding the "eject and never look back" trap of traditional bare workflow. Expo Inline Modules (SDK 57) further reduce the need to write boilerplate Kotlin.

---

#### Decision 004: Audio Recording Library — expo-av → expo-audio (with plugin)
- **Originally Assumed (PRD v1.0.0):** "`expo-av` / custom native audio module for foreground background recording."
- **Reality Discovered (2026-08-20):** `expo-audio` (the modern replacement for `expo-av`) in SDK 57 ships a config plugin supporting `enableBackgroundRecording: true`. This auto-generates all Android 14+ manifest requirements (`FOREGROUND_SERVICE_MICROPHONE`, `foregroundServiceType="microphone"`) without any custom Kotlin.
- **Decision:** Use `expo-audio` with `enableBackgroundRecording: true`. Drop `expo-av`. Only write a minimal Kotlin Inline Module for the Quick Settings `TileService`.
- **Why:** Eliminates an entire custom native module. Config plugins are the Expo-idiomatic way to handle manifest entries and service declarations.

---

#### Decision 005: Transcription Strategy — Generic "Whisper" → Two-Stage Pipeline
- **Originally Assumed (PRD v1.0.0):** "On-device local transcription (e.g. embedded Whisper / on-device STT)" — vague.
- **Reality Discovered (2026-08-20):** Real-time on-device Whisper is too compute-heavy for background use on mid-range Android devices. Native STT (Android `SpeechRecognizer`) is fast but internet-dependent on most OEM builds. A single solution cannot satisfy both "immediate feedback" and "high accuracy."
- **Decision:** Two-stage hybrid pipeline:
  - **Stage 1:** `expo-speech-recognition` (native STT) → real-time streaming interim results during recording. Low latency, low battery.
  - **Stage 2:** `whisper.rn` (Whisper tiny, 75MB) → deep post-recording analysis. High accuracy, ~15s for 5min audio.
  - **Stage 3 (optional):** Cloud AI (Gemini/Deepgram) on user request.
- **Why:** Separating real-time feedback from accuracy-critical analysis lets each stage be optimal for its purpose without compromising either.

---

#### Decision 006: Search — Semantic Vector Search (MVP) → FTS5 (MVP) + Vector (Post-MVP)
- **Originally Assumed (PRD v1.0.0):** "Semantic / Natural Language Search" implied as an MVP feature.
- **Reality Discovered (2026-08-20):** True semantic vector search requires: (a) running an embedding model on-device to generate vectors, (b) storing them in a vector index (`sqlite-vec`), (c) integrating `react-native-executorch` to run `all-MiniLM-L6-v2`. This is non-trivial and adds significant complexity for MVP.
- **Decision:** MVP ships SQLite FTS5 full-text search via `expo-sqlite` raw SQL. Semantic vector search (`sqlite-vec` + `react-native-executorch`) is a Post-MVP enhancement.
- **Why:** FTS5 covers ~80% of real-world search use cases at ~10% of the complexity. Delivers a working, fast, offline search experience from day one.

---

#### Decision 007: BLE Library — react-native-ble-plx → munim-bluetooth (v1.1.0 → v1.2.0)
- **Previously Documented (PRD v1.1.0):** `react-native-ble-plx` for BLE bidirectional exchange.
- **Reality Discovered (2026-08-20 feasibility analysis):** `react-native-ble-plx` is a Central-only library. It provides no API for BLE advertising (Peripheral role). Bidirectional BLE requires a device to simultaneously scan AND advertise — the Peripheral role is mandatory.
- **Decision:** Replace with `munim-bluetooth`. Built on Nitro modules (Expo's modern native bridge). Supports both Central and Peripheral roles. New Architecture compatible. Actively maintained in 2026.
- **Why:** `munim-bluetooth` is the only React Native library in 2026 that robustly handles simultaneous BLE Central + Peripheral roles with New Architecture support. `react-native-ble-plx` simply does not have the peripheral advertising API needed.

---

#### Decision 008: NFC HCE Library — Missing → react-native-hce added (v1.1.0 → v1.2.0)
- **Previously Documented (PRD v1.1.0):** `react-native-nfc-manager` listed as handling "NFC HCE + tag write."
- **Reality Discovered (2026-08-20 feasibility analysis):** `react-native-nfc-manager` is a tag reader/writer library. HCE (Host Card Emulation) — turning the phone into an emulated NFC card via `HostApduService` — is a completely separate Android API not included in `react-native-nfc-manager`.
- **Decision:** Keep `react-native-nfc-manager` v4.x for tag reading/writing. Add `react-native-hce` as the dedicated HCE library for the phone-emulates-card use case. Both libraries are needed; they do not overlap.
- **Why:** `react-native-hce` correctly implements the Android `HostApduService` lifecycle. HCE is iOS-incompatible in most regions (Apple restricts it to enterprise entitlements); treat HCE as Android-only with QR as universal fallback.

---

#### Decision 009: Notification Library — @notifee/react-native → react-native-notify-kit (v1.1.0 → v1.2.0)
- **Previously Documented (PRD v1.1.0):** `@notifee/react-native` for persistent notifications and foreground service controls.
- **Reality Discovered (2026-08-20 feasibility analysis):** `@notifee/react-native` has been officially archived by its maintainer. It does not support the React Native New Architecture (TurboModules), is known to be flaky on RN 0.76+, and is not receiving updates for Android 14+ foreground service requirements.
- **Decision:** Replace with `react-native-notify-kit` — a community-maintained drop-in replacement. 100% API compatible (swap import only). Built for New Architecture (TurboModules/JSI). Correctly handles Android 14+ `foregroundServiceType` declarations. Supports Expo CNG config plugin.
- **Why:** Using an archived library with no New Architecture support in a project built on RN 0.86 + New Architecture is a blocking risk. `react-native-notify-kit` is a direct API-compatible replacement with no migration cost beyond changing the import path.

---

#### Decision 010: ORM / Database — WatermelonDB → expo-sqlite v14 + Drizzle ORM (v1.1.0 → v1.2.0)
- **Previously Documented (PRD v1.1.0):** `WatermelonDB` as primary ORM + `@op-engineering/op-sqlite` for FTS5.
- **Reality Discovered (2026-08-20 feasibility analysis):** WatermelonDB has significant React Native New Architecture compatibility issues. It previously relied on `JSIModulePackage` which was removed in RN 0.75+ Bridgeless mode. While v0.28.0 addressed some of this, the library's maintenance has slowed, there are unresolved New Architecture issues, and the community has largely moved on.
- **Decision:** Replace with `expo-sqlite` v14 (official Expo, first-class New Architecture support) + `Drizzle ORM` (type-safe schema, migrations, CRUD). For FTS5, use `expo-sqlite` raw SQL with virtual tables and triggers — no additional library needed. Drop `@op-engineering/op-sqlite` as it is now redundant.
- **Why:** `expo-sqlite` + Drizzle is the 2026 industry standard for React Native local databases. Official Expo maintenance means it will always be in sync with Expo SDK updates. Drizzle provides type-safe queries without legacy decorators. FTS5 works natively via raw SQL on `expo-sqlite`. This eliminates two problematic dependencies in one change.

---

#### Decision 011: Whisper Model Delivery — Bundled in App
- **Options Considered:** Download model on first run vs. Bundle inside the app.
- **Decision:** Bundle the ~75MB `tiny-q8` model directly in the app binary.
- **Why:** Guarantees a 100% offline-ready experience immediately upon installation without requiring a first-run download screen or internet connection.

#### Decision 012: Cloud Transcription — Bring Your Own Key (BYOK)
- **Options Considered:** Hardcoding a paid API vs. user-provided keys.
- **Decision:** Use a BYOK (Bring Your Own Key) model in the Settings screen. Users can input keys for free/freemium APIs (e.g., Gemini API, Groq, or OpenAI). The app will provide an in-app guide on how to get these keys.
- **Why:** Keeps the app completely free to use and distribute without the developer incurring API costs, while giving power-users options for cloud-enhanced transcription.

#### Decision 013: Avatar Storage — Aggressive Compression
- **Options Considered:** Saving raw camera images vs. compressed copies.
- **Decision:** All avatars and images will be resized and compressed using `expo-image-manipulator` (e.g., 512x512 JPEG) before saving the local `file://` URI to the database.
- **Why:** Prevents the app's local storage footprint from bloating when users upload 5MB+ photos.

#### Decision 014: Supported Languages — English, Hindi, Hinglish
- **Decision:** Use the multilingual Whisper model (not the English-only version) and configure `expo-speech-recognition` to support English, Hindi, and Hinglish.
- **Why:** Meets the regional demographic requirements for the user base out-of-the-box.

---

## 5. Phased Implementation Roadmap

### Phase 1: MVP Core (Current Scope — Updated v1.2.0)
1. **Project Setup:** `expo prebuild` → CNG pipeline, EAS Build configuration, development build.
2. **Profiles & Personas:** Multi-persona creation, editing, local `expo-sqlite` + Drizzle ORM persistence.
3. **QR Code Sharing & Scanner:** Dynamic offline QR generation (`react-native-qrcode-svg`) + `expo-camera` barcode scanner.
4. **NFC HCE + BLE Tap-to-Share:** `react-native-hce` one-way vCard HCE + `munim-bluetooth` bidirectional profile exchange with RSSI proximity filter. QR as universal fallback.
5. **Background Audio Capture:** `expo-audio` foreground service + Quick Settings Tile (Inline Module Kotlin + trampoline Activity for Android 14+) + `react-native-notify-kit` notification controls.
6. **Two-Stage Transcription:** `expo-speech-recognition` (real-time) + `whisper.rn` `tiny-q8` quantized (post-recording analysis). Language pack onboarding flow.
7. **Smart Linking & Event Tagging:** Interactive suggestions to link contacts and recordings, event grouping.
8. **FTS5 Search & CRM:** Contact list, event filter, keyword search via `expo-sqlite` FTS5 virtual tables.

### Phase 2: Post-MVP Enhancements
- Semantic vector search (`sqlite-vec` + `react-native-executorch` all-MiniLM-L6-v2).
- Cloud encrypted backup & sync across devices.
- AI follow-up drafter (Gemini integration for post-meeting messages).
- Collaborative event directories (shared contact lists per event).
- Calendar integration for scheduled follow-ups.
- Whisper `base` model option for higher accuracy (145MB opt-in download).

---

## 6. Success Metrics & Quality Gates
- **Exchange Speed:** Complete BLE bidirectional contact exchange in under 5 seconds. QR scan under 2 seconds.
- **Offline Reliability:** 100% functionality of contact exchange and audio transcription in airplane mode.
- **Battery & Performance:** Background recording service consumes < 3% battery per hour of active use.
- **Link Accuracy:** Smart suggestion precision > 85% for contact-audio association.
- **Transcription Latency:** Whisper tiny post-recording analysis completes in < 20s for a 5-minute recording on a mid-range Android device.

# Ezconnect — Technical Feasibility Analysis v1.0

> **Date:** 2026-08-20
> **Scope:** Full Android-first analysis of every PRD feature, every library decision, and every architectural assumption.
> **Method:** Live research against current library states, Android OS documentation, and community reports for React Native 0.86 / Expo SDK 57.
> **Status:** This document supersedes the informal feasibility notes from the previous session. All decisions in PRD.md § 4.3 should be cross-referenced with this document.

---

## 📊 Master Verdict Table

| Feature / Decision | Status | Confidence | Action Required |
| :--- | :--- | :--- | :--- |
| `expo-audio` background recording config plugin | ✅ Confirmed Viable | High | None — as planned |
| Background recording must start while app is foreground | ⚠️ Critical Constraint | High | UX flow must account for this |
| Quick Settings Tile via Expo Inline Modules | ✅ Confirmed Viable (Experimental) | Medium | Mark as experimental, have fallback |
| `whisper.rn` on RN New Architecture 0.86 | ✅ Confirmed Viable | High | Use quantized models (q8) |
| `expo-speech-recognition` offline on Android | ⚠️ Partial — Device Dependent | Medium | Must prompt user to download language pack |
| `react-native-ble-plx` BLE peripheral/advertising | 🔴 Insufficient — Central only | High | Replace with `munim-bluetooth` |
| `react-native-nfc-manager` for NFC HCE | 🔴 Wrong Library — HCE not included | High | Add `react-native-hce` for HCE specifically |
| `@notifee/react-native` | 🔴 Archived — Dead Library | High | Replace with `react-native-notify-kit` |
| `WatermelonDB` on RN 0.86 New Architecture | 🔴 Risky — Not officially supported | High | Replace with `expo-sqlite` + Drizzle ORM |
| FTS5 search with `expo-sqlite` + Drizzle | ✅ Confirmed Viable | High | Use raw SQL for FTS5 queries |
| Android Beam / NFC P2P | 🔴 Impossible — Removed API 29 | Absolute | Already documented — confirmed |
| Double-press power button | 🔴 Impossible — OS reserved | Absolute | Already documented — confirmed |
| BLE simultaneous Central + Peripheral | ⚠️ Hardware dependent | Medium | RSSI filter + fallback to QR |
| Expo Inline Modules (SDK 57) | ⚠️ Experimental | Medium | Use for TileService, have fallback |

---

## Feature 1: Digital Business Cards & Multi-Persona Profiles

### QR Code Generation & Scanning
- **`react-native-qrcode-svg`** — JS-only, no native dependency, fully compatible with RN 0.86 ✅
- **`expo-camera`** barcode scanning — officially maintained by Expo team, New Architecture compatible ✅

**Verdict: ✅ Fully viable, no blockers.**

---

## Feature 2: Tap-to-Share & Contact Exchange

### Layer 1 — BLE Bidirectional Exchange

**Finding: `react-native-ble-plx` is Central-role only. It does NOT support BLE advertising (Peripheral role).**

This is a critical correction from what was previously documented. BLE bidirectional exchange requires one device to scan (Central) and simultaneously advertise (Peripheral). `react-native-ble-plx` handles Central only — for Peripheral/advertising, it provides no API.

**Corrected library decision:**

| Role | Library |
| :--- | :--- |
| BLE Central (scanning) | `react-native-ble-plx` OR `munim-bluetooth` |
| BLE Peripheral (advertising) | `munim-bluetooth` only |
| Both roles simultaneously | **`munim-bluetooth`** (Nitro modules, New Architecture, active maintenance) |

**`munim-bluetooth`** is the correct 2026 choice. It is built on Nitro modules (Expo's modern native bridge), explicitly supports both Central and Peripheral roles, is New Architecture compatible, and is actively maintained.

**Hardware caveat:** Simultaneous Central + Peripheral BLE is supported by most Android phones with Bluetooth 5.0+. On Android 12+, requires runtime permissions: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_ADVERTISE`. Low-end or older devices (Bluetooth 4.0) may not support both roles simultaneously.

**Mitigation:** RSSI threshold filter (> -60 dBm) to ensure proximity. If BLE advertising fails on a device, gracefully degrade to Layer 3 (QR code).

**Verdict: ✅ Viable with library replacement. `react-native-ble-plx` → `munim-bluetooth`.**

---

### Layer 2 — NFC HCE (Host Card Emulation)

**Finding: `react-native-nfc-manager` does NOT include HCE support. HCE requires a separate dedicated library.**

`react-native-nfc-manager` is a reader/writer library (scanning NFC tags, writing NDEF). HCE — which turns your phone into an emulated NFC tag — requires implementing Android's `HostApduService`, which is a completely different API surface. HCE is not in `react-native-nfc-manager`.

**Corrected library decision:**

| Capability | Library |
| :--- | :--- |
| NFC tag reading / writing (scan a QR, write NDEF) | `react-native-nfc-manager` v4.x (New Architecture compatible) |
| NFC HCE (your phone emulates a card) | `react-native-hce` |

**Both libraries are needed.** They serve different roles and do not overlap.

**HCE practicalities:**
- Requires `NFC_TRANSACTION_EVENT` and `BIND_NFC_SERVICE` in `AndroidManifest.xml`
- Works even when screen is off (Android allows background HCE)
- The NDEF payload (vCard or URL) must fit in the APDU response — typically < 2KB, easily sufficient for a contact card
- iOS: Apple restricts HCE to specific enterprise/payment entitlements in most regions. **HCE is Android-only.**

**Verdict: ✅ Viable with library addition. Add `react-native-hce` alongside `react-native-nfc-manager`.**

---

### Layer 3 — QR Code

**Verdict: ✅ No blockers. Always viable.**

---

## Feature 3: Background Audio Recording

### Foreground Service Setup

**`expo-audio` with `enableBackgroundRecording: true`** is confirmed viable in SDK 57. The config plugin correctly handles:
- `RECORD_AUDIO`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_MICROPHONE` (required Android 14+)
- `android:foregroundServiceType="microphone"` on the service manifest declaration

**Verdict for recording infrastructure: ✅ Confirmed.**

---

### Critical Android OS Constraint — Recording Must Start in Foreground

**Finding (New — not previously documented):** Android 14+ enforces that a `foregroundServiceType="microphone"` service can ONLY be started while the app is in the foreground (visible to the user). You CANNOT start the recording foreground service while the app is already backgrounded.

**Implication for Quick Settings Tile UX:**
When the user taps the Quick Settings Tile while the app is in the background, the `TileService.onClick()` fires — but at that point, the app is not in the foreground. Starting a microphone foreground service directly from this context will fail on Android 14+.

**Required workaround:**
The Tile tap must launch a transparent trampoline Activity (`FLAG_ACTIVITY_NEW_TASK + FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS`) that:
1. Briefly brings the app to the foreground
2. Starts the foreground audio service
3. Immediately finishes itself (invisible to user)

This is the only valid Android API pattern for this use case. It requires ~10 lines of Kotlin in the Inline Module.

---

### OEM Battery Optimization (Samsung, OnePlus, Huawei, Xiaomi)

Even with a properly declared foreground service, aggressive OEM battery managers (especially Samsung and Xiaomi) may kill the service. Users may need to set battery optimization to "Unrestricted" for the app.

**Mitigation:** In-app prompt pointing users to battery settings when recording is interrupted. Reference: [dontkillmyapp.com](https://dontkillmyapp.com).

---

### Notification Library — @notifee/react-native is ARCHIVED

**Finding: `@notifee/react-native` has been officially archived and is no longer maintained.** It does not properly support the React Native New Architecture (TurboModules) and is known to be flaky on RN 0.76+.

**Replacement: `react-native-notify-kit`**
- Drop-in API replacement for `@notifee/react-native`
- Built for New Architecture (TurboModules/JSI)
- Correctly handles Android 14+ `foregroundServiceType` declarations
- Supports Expo CNG config plugin
- 100% public API compatible — swap import path only

**Verdict: 🔴 `@notifee/react-native` → `react-native-notify-kit` (required replacement).**

---

### Quick Settings Tile — Inline Modules are Experimental

**Finding:** Expo Inline Modules are still flagged as **experimental** in SDK 57. The API is subject to breaking changes. They work as documented but carry stability risk.

**Mitigation strategy:**
- Use Inline Modules for the TileService (it's the correct path)
- Also implement the Persistent Notification trigger via `react-native-notify-kit` as primary fallback
- The notification trigger works without any Kotlin and is fully stable
- TileService is the "nice to have" power-user shortcut, not the only recording entry point

**Verdict: ⚠️ Viable but experimental. Treat as progressive enhancement — not a critical dependency.**

---

## Feature 4: AI Conversation Memory & Transcription

### Stage 1 — Real-Time STT: expo-speech-recognition

**Confirmed viable** with the following important constraint:

**Offline language pack is NOT automatically available.** Android's `SpeechRecognizer` with `requiresOnDeviceRecognition: true` requires the device to have the offline language pack installed (typically from Google's speech services). The pack is not installed by default on all devices.

**Required UX handling:**
- On first launch, call `getSupportedLocales()` to check if an offline model is installed
- If not, call `androidTriggerOfflineModelDownload()` to prompt download
- If the user declines or it fails, gracefully fall back to: (a) cloud STT with internet, or (b) Whisper-only (post-recording)
- Must test on physical device (Android Emulator lacks complete speech services)

**Verdict: ✅ Viable with required onboarding flow for language pack.**

---

### Stage 2 — Post-Recording Whisper: whisper.rn

**Confirmed fully viable.** `whisper.rn` has explicit TurboModule support (`NativeRNWhisper.ts`), uses JSI for zero-copy `ArrayBuffer` transfers, and is considered production-ready for RN 0.86.

**Refined model guidance:**
- Default: **quantized `tiny-q8`** — significantly better than `tiny` at the same file size (~80MB), much faster inference
- Avoid full-precision `tiny` — the quantized version is strictly better
- GPU/Metal acceleration is available — ensure it's enabled in the `whisper.rn` config

**Memory management (must-do):** Always call `context.release()` after transcription completes. Failing to release the context leaks native memory — the Whisper model keeps a large C++ allocation alive.

**Verdict: ✅ Confirmed viable. Use `tiny-q8` quantized model.**

---

## Feature 5: Smart Linking (Suggestion Engine)

This is pure TypeScript business logic. No native dependencies. Runs in-process.

**Logic:** After recording stops and contact exchange history is queried from SQLite, the suggestion engine compares:
- Timestamp delta (recording end time vs. contact exchange time)
- Entity names extracted from Whisper transcript vs. contact name
- Event tag matching

**Verdict: ✅ No blockers. Straightforward implementation.**

---

## Feature 6: Event-Based CRM & Search

### Database — WatermelonDB is RISKY

**Finding: WatermelonDB has significant New Architecture compatibility issues with RN 0.86.** It previously depended on `JSIModulePackage`, which was removed in RN 0.75's "Bridgeless" mode. While v0.28.0 attempted to address this, there are still unresolved issues. The library's maintenance has slowed significantly. Many developers are actively migrating away.

**Replacement (Industry 2026 standard): `expo-sqlite` v14+ + `Drizzle ORM`**

| Capability | WatermelonDB | expo-sqlite + Drizzle ORM |
| :--- | :--- | :--- |
| New Architecture support | ❌ Problematic / unverified | ✅ First-class (official Expo) |
| TypeScript support | Legacy decorators | ✅ First-class, zero-overhead |
| Maintenance | ⚠️ Slowing | ✅ Actively maintained (Expo team) |
| FTS5 search | Via raw SQL adapter | ✅ Via raw SQL + triggers |
| Reactivity | ✅ Observables | Via `useLiveQuery` |
| Boilerplate | High | Low |
| Drizzle Studio debug tool | ❌ | ✅ |

**Architecture:**
```
expo-sqlite v14       ← Native SQLite driver (official Expo, New Arch compatible)
    + Drizzle ORM     ← Type-safe schema, migrations, CRUD queries
    + raw SQL layer   ← FTS5 virtual tables + search queries (Drizzle doesn't generate FTS5 SQL)
```

**FTS5 with expo-sqlite is confirmed viable.** Create FTS5 virtual table manually, sync it via SQLite triggers, query with `db.getAllAsync(SQL, params)`.

**Verdict: 🔴 WatermelonDB → `expo-sqlite` + Drizzle ORM (required replacement).**

---

## Revised Confirmed Library Stack

> Updated 2026-08-20. Previous stack in PRD.md § 4.1 (v1.1.0) had three errors: wrong BLE library, missing HCE library, archived notification library, and risky ORM. All corrected below.

### Hardware Integration

| Feature | Previously Planned | Corrected Library | Change Reason |
| :--- | :--- | :--- | :--- |
| BLE bidirectional (Central + Peripheral) | `react-native-ble-plx` | **`munim-bluetooth`** | `ble-plx` is Central-only; no Peripheral/advertising API |
| NFC HCE (phone emulates tag) | `react-native-nfc-manager` | **`react-native-hce`** (additional) | `nfc-manager` is reader/writer only; HCE is a separate API |
| NFC tag read/write | `react-native-nfc-manager` | `react-native-nfc-manager` v4.x | No change — confirmed correct |
| Persistent notifications + foreground service | `@notifee/react-native` | **`react-native-notify-kit`** | Notifee is archived; not New Architecture compatible |
| Background audio recording | `expo-audio` (config plugin) | `expo-audio` (config plugin) | No change — confirmed correct |
| Quick Settings Tile | Expo Inline Module (TileService) | Expo Inline Module (TileService) | No change — confirmed, but needs trampoline Activity for Android 14+ |
| QR generation | `react-native-qrcode-svg` | `react-native-qrcode-svg` | No change — confirmed |
| QR scanning | `expo-camera` barcode | `expo-camera` barcode | No change — confirmed |
| On-device Whisper | `whisper.rn` | `whisper.rn` (use `q8` quantized) | No change — confirmed; use quantized model |
| Real-time STT | `expo-speech-recognition` | `expo-speech-recognition` | No change — confirmed; requires language pack onboarding |

### Data & State

| Feature | Previously Planned | Corrected Library | Change Reason |
| :--- | :--- | :--- | :--- |
| Primary ORM | `WatermelonDB` | **`expo-sqlite` v14 + Drizzle ORM`** | WatermelonDB has New Architecture issues, slowing maintenance |
| Advanced SQL & FTS5 | `@op-engineering/op-sqlite` | **`expo-sqlite` v14 raw SQL** | Drizzle + expo-sqlite covers this natively; no extra library needed |
| State management | Zustand | Zustand | No change — confirmed correct |
| Secure config/flags | MMKV | MMKV | No change — confirmed correct |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| Inline Modules API changes (experimental) | Medium | Medium | Use for TileService only; notification trigger is stable fallback |
| OEM battery managers kill foreground service | High | Medium | In-app battery exemption prompt; dontkillmyapp.com guidance |
| Android 14+ microphone service start restriction | High | High | Trampoline Activity pattern in TileService Kotlin module |
| Device doesn't support BLE simultaneous roles | Medium | Medium | Graceful fallback to QR; detect and surface to user |
| Offline language pack not installed (STT) | High | Low | Onboarding flow + `androidTriggerOfflineModelDownload()` |
| `munim-bluetooth` community size (smaller than ble-plx) | Low | Low | Nitro modules architecture; actively maintained in 2026 |
| iOS NFC HCE not available | Certain | Low | Feature is Android-only; iOS uses QR fallback |

---

## What Is Genuinely Impossible on Android (Final List)

| Feature | Status | Reason |
| :--- | :--- | :--- |
| Double-press power button intercept | 🔴 Impossible | OS-reserved at kernel level |
| NFC bidirectional P2P (Android Beam) | 🔴 Impossible | Removed in Android 10 (API 29) |
| Silent background microphone (no OS indicator) | 🔴 Impossible | Android 12+ forces status bar microphone dot + notification |
| Starting microphone foreground service from background (Android 14+) | 🔴 Impossible directly | Requires trampoline Activity (workaround exists) |
| NFC HCE two-way between two apps | 🔴 Impossible | HCE is always one-way: one emulates tag, one reads |
| iOS NFC HCE for contact sharing | 🔴 Impossible (generally) | Apple restricts HCE to enterprise entitlements in most regions |

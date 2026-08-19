# Technical Feasibility Deep-Dive & Solutions

> Last Updated: 2026-08-20
> Scope: MVP feasibility analysis with concrete library, architecture, and tradeoff decisions

---

## Challenge 1: Background Audio Recording & Quick Trigger

### Problem Summary
- Pure managed Expo cannot spawn an Android Foreground Service
- Double-press power button is blocked by Android OS (impossible)
- Android 12+ requires persistent notification + microphone indicator during recording

### ✅ Solution: expo-audio with enableBackgroundRecording

The modern `expo-audio` package (SDK 57) now ships a `config plugin` with built-in foreground service support. This is the cleanest path — no raw Kotlin boilerplate required.

**app.json config:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow Ezconnect to record conversations.",
          "enableBackgroundRecording": true
        }
      ]
    ]
  }
}
```

This automatically injects:
- `RECORD_AUDIO` permission
- `FOREGROUND_SERVICE` permission
- `FOREGROUND_SERVICE_MICROPHONE` permission (Android 14+ required)
- `android:foregroundServiceType="microphone"` in the manifest

**Workflow requirement:** Must use `npx expo prebuild` + Development Build (not Expo Go).

---

### ✅ Solution: Quick Settings Tile (TileService) via Inline Modules (SDK 57)

Expo SDK 57 introduces **Inline Modules** — write Kotlin directly in your app directory without a full separate local module. The system auto-generates native bindings on `prebuild`.

**app.json:**
```json
{
  "expo": {
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["modules"]
      }
    }
  }
}
```

**`modules/RecordingTile.kt`** (minimal Kotlin TileService):
```kotlin
@RequiresApi(Build.VERSION_CODES.N)
class RecordingTileService : TileService() {
  override fun onClick() {
    super.onClick()
    // Send broadcast → JS picks up via DeviceEventEmitter
    val intent = Intent("com.ezconnect.TOGGLE_RECORDING")
    sendBroadcast(intent)
    updateTile(isRecording)
  }
}
```

Then register in `AndroidManifest.xml` via a config plugin. Android 13+ supports `requestAddTileService()` to prompt the user to add your tile from within the app.

**Alternative Trigger:** Persistent Notification with action buttons via `@notifee/react-native` — fully JS-controlled, zero Kotlin required, works on all Android versions.

---

### Tradeoff Table: Recording Triggers

| Trigger | Effort | Android Support | Recommended |
| :--- | :--- | :--- | :--- |
| `expo-audio` background recording | Low | API 26+ | ✅ Yes (primary) |
| Quick Settings Tile (Inline Module) | Medium | API 24+ | ✅ Yes (secondary) |
| Persistent Notification action | Low | API 21+ | ✅ Yes (fallback) |
| Double-press power button | ❌ Impossible | Not supported | 🚫 Never |

---

## Challenge 2: Bidirectional Tap-to-Share (NFC P2P is Dead)

### Problem Summary
- Android Beam (NFC P2P) removed in Android 10 (API 29)
- There is no OS-level equivalent for app-to-app NFC exchange
- NFC is still useful one-way (tag write → vCard to any phone)

### ✅ Solution A: BLE Advertising + Scanning (Ezconnect-to-Ezconnect)

The correct modern approach is BLE: one device advertises a custom Service UUID with a short payload, the other scans and connects. Both devices simultaneously do both roles.

**Library:** `react-native-ble-plx` (most mature) or `munim-bluetooth` (Nitro-based, newer, simpler API for device-to-device messaging)

**Flow:**
```
Device A (Alice)               Device B (Bob)
  ↓ Advertise UUID + hash        ↓ Scan for UUID
  ↓ Scan for UUID                ↓ Advertise UUID + hash
        ← RSSI proximity check →
        ← GATT Connect          →
        ← Exchange full profile JSON over characteristic →
  ↓ Accept/Reject UI            ↓ Accept/Reject UI
```

**Key implementation details:**
- Use RSSI threshold (e.g. > -60 dBm) to filter for genuinely close devices and avoid exchanging with someone across the room
- Payload in advertisement packet is limited to ~20 bytes — use it only for a short user ID / session token. Full profile exchanges over GATT after connection
- Permissions required (Android 12+): `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_ADVERTISE` — all runtime-granted
- Average handshake time: 2–5 seconds in normal environments

### ✅ Solution B: NFC One-Way Tag Write (Non-Ezconnect users)

Write a vCard or URL to an NFC NDEF record. Any phone with NFC (no app needed) can read it.

**Library:** `react-native-nfc-manager`

**HCE (Host Card Emulation):** Android supports emulating an NFC card without physical hardware. Your phone *becomes* the NFC tag. The other user taps your phone with their phone's NFC reader and it reads your vCard/URL — works with any NFC-enabled phone even with screen off.

This is the closest thing to the iOS "just tap phones" UX achievable on Android.

### ✅ Solution C: QR Code (Universal Fallback)

Always available. No permissions, no hardware negotiation, works even if Bluetooth is off.
- Use `react-native-qrcode-svg` for generation
- Use `expo-camera` with built-in barcode scanning for reading

### Recommended Sharing Strategy (Three Layers)
```
1. Both have Ezconnect + BLE available → BLE bidirectional exchange (best UX)
2. One side doesn't have app + NFC → HCE NFC tap → vCard / web card (good UX)
3. No NFC or Bluetooth → QR code scan → web card or vCard download (always works)
```

---

## Challenge 3: On-Device Offline Transcription

### Problem Summary
- Android's native `SpeechRecognizer` requires internet by default on most devices
- True offline needs a bundled model (adds APK size)
- Real-time on-device Whisper is too slow for background use on mid-range devices

### ✅ Solution: Hybrid Two-Stage Transcription Pipeline

**Stage 1 — Real-Time Interim (Native STT, Low Latency):**
- `expo-speech-recognition` wraps Android's `SpeechRecognizer` with offline language pack support
- Streams partial results in real-time → shows live "what's being said" in notification
- Fast, low battery, no model bundling
- Caveat: quality varies by device/OEM, requires offline language pack installed

**Stage 2 — Deep Analysis (Whisper, Post-Recording):**
- `whisper.rn` (wraps `whisper.cpp` via JNI, C++ NDK)
- Triggered after recording stops — processes the full audio file
- Produces high-accuracy transcript → entity extraction (names, topics, action items)
- Requires `npx expo prebuild` (NDK compilation)
- Model sizes and tradeoffs:

| Whisper Model | Size | Speed (5min audio) | Accuracy | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `tiny` | 75 MB | ~15s | Good | ✅ MVP default |
| `base` | 145 MB | ~30s | Better | Optional upgrade |
| `small` | 470 MB | ~90s | Best offline | Post-MVP |

**NDK requirement for `whisper.rn`:**
```groovy
// android/build.gradle
ndkVersion = "24.0.8215888"
```

**ProGuard rule:**
```proguard
-keep class com.rnwhisper.** { *; }
```

### ✅ Optional: Cloud Enhancement (Gemini / Deepgram)

When connected, offer user a "Re-analyze with AI" button:
- Send raw audio to Gemini 2.0 Flash or Deepgram API
- Returns structured JSON (speaker labels, named entities, topics, action items)
- Store enhanced transcript over the local one (with user confirmation)

---

## Challenge 4: Smart On-Device Search

### Problem Summary
- Full semantic vector search is complex to set up on-device
- Generating embeddings on-device requires running a small ML model

### ✅ Solution: Hybrid FTS5 + SQLite-Vec (Progressive Enhancement)

**MVP Layer: SQLite FTS5 Full-Text Search**
- Built into SQLite natively — zero extra libraries
- `@op-engineering/op-sqlite` as the SQLite driver (JSI-based, fastest for RN)
- Create FTS5 virtual table over transcripts and contact notes
- Supports keyword search, prefix queries, snippet highlighting
- Zero model size, zero inference time

```sql
CREATE VIRTUAL TABLE contacts_fts USING fts5(
  name, headline, topics, notes, event_name
);
```

**Post-MVP Layer: sqlite-vec + on-device embeddings**
- `sqlite-vec` adds vector similarity search as a SQLite extension
- `react-native-executorch` runs `all-MiniLM-L6-v2` (22MB) locally to generate text embeddings
- Combine FTS5 (keyword) + vector (semantic) with Reciprocal Rank Fusion for best results

**Database Architecture:**
```
WatermelonDB       ← Primary ORM for CRUD, relations, offline sync
    ↓ same SQLite file
op-sqlite           ← Raw SQL for FTS5 queries + future sqlite-vec
```

---

## Challenge 5: The "Must Eject from Managed Expo" Problem

### ✅ Solution: Expo CNG (Continuous Native Generation) with Prebuild

This is the cleanest architecture. You don't permanently "eject" — you use `expo prebuild` to generate native `android/` files from your `app.json` + config plugins. The generated files are gitignored and regenerated on every `prebuild` run.

```
app.json (source of truth)
    ↓ npx expo prebuild
android/  (generated — gitignore this)
ios/      (generated — gitignore this)
    ↓ npx expo run:android (local dev)
    ↓ eas build --platform android (production)
```

**What needs prebuild:**
- `expo-audio` with `enableBackgroundRecording: true`
- `whisper.rn` (C++ NDK compilation)
- `react-native-nfc-manager`
- `react-native-ble-plx`
- Quick Settings Tile (Inline Module)

**What doesn't need prebuild (works in Expo Go or standard build):**
- QR code generation/scanning (`expo-camera` + `react-native-qrcode-svg`)
- WatermelonDB
- UI, theming, Reanimated 4

---

## Final Revised Library Stack

| Feature | Library | Expo Go? | Notes |
| :--- | :--- | :--- | :--- |
| Background audio recording | `expo-audio` (enableBackgroundRecording) | ❌ | Config plugin handles manifest |
| Quick Settings Tile | Expo Inline Module (Kotlin) | ❌ | ~50 lines of Kotlin |
| Notification controls | `@notifee/react-native` | ❌ | Full foreground service control |
| NFC one-way (HCE + tag write) | `react-native-nfc-manager` | ❌ | |
| BLE bidirectional exchange | `react-native-ble-plx` | ❌ | |
| QR generation | `react-native-qrcode-svg` | ✅ | |
| QR scanning | `expo-camera` (barcode) | ✅ | |
| Offline transcription | `whisper.rn` | ❌ | NDK required |
| Native STT (real-time) | `expo-speech-recognition` | ❌ | |
| Primary database & ORM | `WatermelonDB` | ✅ | |
| Advanced SQL & FTS5 | `@op-engineering/op-sqlite` | ❌ | |
| State management | Zustand or Jotai | ✅ | Lightweight, RN New Arch friendly |

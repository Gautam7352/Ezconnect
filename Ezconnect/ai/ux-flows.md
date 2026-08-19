> Added 2026-08-20 — initial definition

# Complete UX Flows

This document details the step-by-step user experience flows for critical journeys within Ezconnect.

---

## Flow 1: First-Run Onboarding (Permission Request Sequence)

**Screen:** `src/app/onboarding.tsx`
**Gate Check:** On app start in `_layout.tsx`, check MMKV key `onboarding_complete`. If true, skip to tabs.

**Steps:**
1. **Welcome Screen**: App name, tagline, and a prominent "Get Started" button.
2. **Microphone Permission**:
   - Shows rationale: *"To record conversations."*
   - User taps request button → Native Android/iOS permission dialog appears.
   - If denied: Handle gracefully, allow continuation.
3. **Camera Permission**:
   - Shows rationale: *"To scan QR codes."*
   - Request → Native dialog. Handle denied.
4. **Bluetooth Permission**:
   - Shows rationale: *"To exchange contacts wirelessly."*
   - Request all three BT permissions (`BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_ADVERTISE`).
   - If denied: Handle gracefully.
5. **NFC Info**:
   - Not a runtime permission on Android. Just performs a hardware check.
   - If unavailable: Show message *"NFC not available on this device — you'll use QR codes"* and continue.
6. **Done Screen**:
   - Displays *"You're all set! Let's create your first profile card."*
   - Action navigates to `/persona/new`.
7. **On Completion**: Write MMKV `onboarding_complete = true`.

*Note: If any permission is denied, show a non-blocking toast: "You can grant this later in Settings", and allow the user to continue with reduced features.*

---

## Flow 2: Creating / Editing a Persona

**Screen:** `src/app/persona/[id].tsx` (use `id='new'` for creation)
**Entry Points:** Onboarding Done screen, Persona list "+ New" button, Persona row tap.

**Steps:**
1. **Fields**:
   - `displayName` (required, max 50 chars).
   - `email` (optional, standard email validation).
   - `phone` (optional).
   - `URLs` (optional, must start with `https://`).
2. **Avatar**: User taps avatar placeholder → opens image picker (camera or gallery).
3. **Custom Links**: User can dynamically add/remove rows of `{ label, url }`.
4. **Save**:
   - Validates fields.
   - Creates/Updates DB record.
   - If this is the *first* persona created, auto-set it as the Active persona.
5. **"Set as Active"**: A toggle/button that updates `isActive` in DB and updates `use-persona-store`.
6. **Delete**: Shows a confirmation dialog. Upon confirm → delete from DB → navigate back.

---

## Flow 3: BLE Contact Exchange

**Trigger:** User opens Share tab (`activateShare()` called automatically).

**State Progression & UI:**
1. **State `advertising`**: UI shows a green indicator *"Your card is visible"*.
2. **State `scanning`**: UI shows a pulsing radar animation *"Looking for nearby Ezconnect users"*.
3. **Device Discovered**: A nearby device card appears with an RSSI signal bar and an "Exchange" button.
4. **User taps "Exchange"**:
   - **State `connecting`**: Show loading spinner on the device card.
   - **State `reading`**: Show text *"Reading profile..."*.
   - **State `confirming`**: Show a modal dialog: *"[Name] wants to exchange contacts"* featuring their name/headline and [Accept] / [Reject] buttons.
5. **User taps [Accept]**:
   - **State `saving`**: Save the incoming Contact to DB.
   - **State `done`**: Trigger haptic success feedback, show a toast *"Contact saved!"*, and display a checkmark on the device card.

**Error Handling:**
- `connecting` timeout: *"Couldn't connect — move closer and try again"*.
- `reading` failure: *"Failed to read profile — try again"*.
- Bluetooth off: Bottom sheet prompting *"Enable Bluetooth to exchange contacts"* with a settings button.
- Permissions blocked: Bottom sheet with a deep-link button to open OS Settings.

---

## Flow 4: Background Audio Recording

There are three ways to trigger a recording.

### Trigger A — From Record Tab
1. User taps Record tab, sees a large microphone button.
2. Taps microphone → checks permission → starts recording.
3. UI updates: Timer shows, waveform animation plays, interim transcript scrolls live.
4. Taps Stop → Processing indicator appears → `whisper.rn` runs in background → Toast *"Recording saved"*.

### Trigger B — Quick Settings Tile (Android)
1. User pulls down Android notification shade and taps the Ezconnect tile.
2. `TileService.onClick()` fires → sends a broadcast intent.
3. **Trampoline Activity** launches (invisible, `FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS`) to satisfy Android 14+ foreground service launch constraints.
4. If `status` is 'idle': calls `startRecording()` → Trampoline finishes → Foreground service notification appears.
5. If `status` is 'recording': calls `stopRecording()` → processing happens in background → Notification updates to 'Processing'.
6. TileService updates tile icon (microphone on vs off).

### Trigger C — Persistent Notification
1. While recording, a notification is pinned: *"🔴 Recording 02:34"* with a "Stop & Transcribe" action button.
2. User taps "Stop & Transcribe" → intent routes to app → calls `stopRecording()`.

**Recording Error States:**
- Microphone permission denied: Show permission rationale dialog.
- Storage full (`< 50MB` free): Show warning *"Not enough storage space"*.
- Service killed by OEM: Notification shows *"Recording was interrupted"*. In-app conversation row shows `status: 'failed'`.
- Audio file corrupted: Update conversation status to 'failed', show a retry/delete option.

---

## Flow 5: Smart Link Suggestion

**Trigger:** Completes immediately after a recording transitions to `status: 'done'`.

1. Smart link engine runs (logic defined in `state-design.md`).
2. If a suggestion is found, a dismissible card appears on the Home screen (or top of the Conversation detail view):
   > 💡 "Did you talk with **Rahul Sharma** during this recording?"
   > Reasons: *"Recorded 4 minutes after exchange · Name mentioned in transcript"*
   > Buttons: **[Link ✓]** **[Not This Person]** **[Choose Different]**
3. **[Link ✓]**: Calls `acceptSuggestion()` → creates `contactConversations` row with `linkType: 'confirmed'`.
4. **[Not This Person]**: Calls `rejectSuggestion()` → removes from pending, never suggests this exact pair again.
5. **[Choose Different]**: Opens a standard contact picker → user selects manually → saves as `linkType: 'manual'`.

---

## Flow 6: Search (Contacts)

1. User navigates to Contacts tab and taps the search bar at the top.
2. As user types (debounced 300ms), an FTS5 query is executed against the `contacts_fts` virtual table.
3. Results render as Contact cards with snippet highlighting matching terms (utilizing the SQLite FTS5 `snippet()` function).
4. **Empty query**: Shows all contacts grouped by the Event they were met at.
5. **No results**: Shows an empty state: *"No contacts matching '[query]'"* with a suggestion to check spelling.
6. *(Post-MVP)*: A separate "Topics" search tab will search `conversations_fts` for transcript matches.

---

## Flow 7: Error Recovery Patterns

Throughout the app, adhere to these standard error recovery patterns:

- **Transient Errors** (network blip, short timeout): Show a bottom Snackbar/toast that auto-dismisses after 4 seconds.
- **Blocking Errors** (permission denied, hardware unavailable): Show a modal Bottom Sheet with a clear explanation and an action button (e.g., "Open Settings").
- **Persistent Errors** (failed conversation processing, failed contact exchange): Show an inline error state directly on the relevant card/row with a "Retry" button.
- **NEVER** show raw stack traces, JSON errors, or unhandled exceptions to users. Always map to human-readable copy.
- **Logging**: All errors must be logged to a local error ring-buffer in MMKV (key: `error_log`, keep max last 50 errors) for debugging purposes.

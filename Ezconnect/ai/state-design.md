> Added 2026-08-20 — initial definition

# Zustand State Management Design

This document defines the complete state management architecture for the Ezconnect app using **Zustand**. We use React 19 + React Native 0.86 with the New Architecture.

## Guiding Principles

- **Domain Split**: Stores are split by domain concern, not bundled into one giant root store.
- **Location**: All stores live in `src/stores/`.
- **Export Pattern**: Each store file exports both the store hook and the store's TypeScript type.
- **Side Effects**: Async operations (DB reads/writes, starting recordings) happen in store actions, NOT in UI components.
- **Database**: All DB interactions must use the `src/db/index.ts` singleton.
- **Mutation**: Direct state mutation via Zustand `set` (or Immer if nested complexity requires it).

---

## 1. `src/stores/use-recording-store.ts`

Manages the lifecycle of audio recordings and transcriptions.

```typescript
import { create } from 'zustand';

export type RecordingState = {
  status: 'idle' | 'recording' | 'stopping' | 'processing';
  conversationId: string | null;     // ID of in-progress conversation DB row
  durationSeconds: number;           // live counter while recording
  interimTranscript: string;         // streaming text from expo-speech-recognition
  error: string | null;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>; // stops recording, triggers whisper.rn processing
  resetError: () => void;
};

export const useRecordingStore = create<RecordingState>((set, get) => ({
  status: 'idle',
  conversationId: null,
  durationSeconds: 0,
  interimTranscript: '',
  error: null,
  startRecording: async () => { /* ... */ },
  stopRecording: async () => { /* ... */ },
  resetError: () => set({ error: null })
}));
```

### Action Flows:

**`startRecording` flow:**
1. Check microphone permission (via `use-permissions-store`).
2. Create a new `Conversation` row in DB with `status = 'recording'`.
3. Update store: set `conversationId` and `status: 'recording'`.
4. Call `expo-audio`'s `startRecording()`.
5. Start `expo-speech-recognition` to populate `interimTranscript`.
6. Start a `setInterval` timer (every 1 second) to increment `durationSeconds`.

**`stopRecording` flow:**
1. Update store: set `status: 'stopping'`.
2. Stop `expo-speech-recognition`.
3. Stop `expo-audio` recording → retrieve local audio file URI.
4. Update `Conversation` DB row: set `audioUri`, `transcriptRaw` (from interim), `durationSeconds`, and `status = 'processing'`.
5. Clear the duration `setInterval` timer.
6. Update store: set `status: 'processing'`.
7. Trigger `whisper.rn` in a background worker task.
   - On completion: update `Conversation` DB row with `transcriptEnhanced` and `status = 'done'`.
8. Trigger the Smart Link Suggestion Engine (see below).
9. Update store: set `status: 'idle'`, reset vars.

---

## 2. `src/stores/use-share-store.ts`

Manages BLE discovery and NFC HCE sharing states.

```typescript
export type NearbyDevice = {
  deviceId: string;
  deviceName: string | null;
  rssi: number;
  lastSeen: number; // unix ms
};

export type ExchangeStatus = 'idle' | 'advertising' | 'scanning' | 'connecting' | 'reading' | 'confirming' | 'saving' | 'done' | 'error';

export type ShareState = {
  isShareScreenActive: boolean;
  exchangeStatus: ExchangeStatus;
  nearbyDevices: NearbyDevice[];
  pendingContact: BLEExchangePayload | null; // profile received, awaiting user confirmation
  lastExchangeError: string | null;
  nfcHceActive: boolean;

  // Actions
  activateShare: () => Promise<void>;   // start BLE advertising + scanning + NFC HCE
  deactivateShare: () => void;           // stop all radio operations
  initiateExchange: (deviceId: string) => Promise<void>; // user taps exchange button
  confirmExchange: () => Promise<void>;  // user accepts in dialog
  rejectExchange: () => void;            // user rejects in dialog
  dismissError: () => void;
};
```

---

## 3. `src/stores/use-permissions-store.ts`

Manages hardware capabilities and runtime permissions.

```typescript
export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked'; // blocked = permanently denied

export type PermissionsState = {
  microphone: PermissionStatus;
  camera: PermissionStatus;
  bluetoothScan: PermissionStatus;    // Android 12+
  bluetoothConnect: PermissionStatus; // Android 12+
  bluetoothAdvertise: PermissionStatus; // Android 12+
  nfc: PermissionStatus;              // Not a runtime permission on Android, just hardware capability check
  nfcAvailable: boolean;              // hardware check
  bluetoothAvailable: boolean;        // hardware check

  // Actions
  checkAll: () => Promise<void>;          // check current status of all permissions
  requestMicrophone: () => Promise<void>;
  requestCamera: () => Promise<void>;
  requestBluetooth: () => Promise<void>;  // requests all 3 BT permissions together
  openSettings: () => void;               // deep-link to app settings page
};
```

---

## 4. `src/stores/use-persona-store.ts`

Manages the user's own profiles (personas).

```typescript
import { Persona, PersonaInsert } from '@/types/domain';

export type PersonaState = {
  personas: Persona[];               // all personas from DB (hydrated)
  activePersonaId: string | null;
  activePersona: Persona | null;     // derived: personas.find(p => p.id === activePersonaId)
  isLoading: boolean;

  // Actions
  loadPersonas: () => Promise<void>;       // read from DB
  setActivePersona: (id: string) => Promise<void>; // updates DB isActive flag
  createPersona: (data: PersonaInsert) => Promise<string>; // returns new ID
  updatePersona: (id: string, data: Partial<PersonaInsert>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
};
```

---

## 5. `src/stores/use-smart-link-store.ts`

Manages AI-driven suggestions for linking contacts to recorded conversations.

```typescript
export type SmartLinkSuggestion = {
  conversationId: string;
  contactId: string;
  contactName: string;
  confidence: number; // 0.0–1.0
  reasons: string[]; // e.g. ["Recorded 3 minutes after exchange", "Name mentioned in transcript"]
};

export type SmartLinkState = {
  pendingSuggestions: SmartLinkSuggestion[];

  // Actions
  addSuggestion: (suggestion: SmartLinkSuggestion) => void;
  acceptSuggestion: (conversationId: string, contactId: string) => Promise<void>;
  rejectSuggestion: (conversationId: string, contactId: string) => void;
};
```

### Smart Link Suggestion Engine Logic

This algorithm runs in the background immediately after a conversation reaches `status: 'done'`.

1. **Query**: Find all contacts exchanged within `±30 minutes` of `conversation.createdAt`.
2. **Score Candidates**: For each candidate contact:
   - *Time Proximity Score*: 1.0 (within 5 min), 0.7 (within 15 min), 0.4 (within 30 min).
   - *Name Mention Score*: 1.0 if `contact.displayName` appears in `transcriptEnhanced` (case-insensitive), otherwise 0.0.
   - *Event Match Score*: 1.0 if both share the same `eventId` (if not null), otherwise 0.0.
   - *Overall Confidence*: Weighted average → `(time * 0.4) + (name * 0.4) + (event * 0.2)`.
3. **Filter**: If `confidence > 0.5`, add to `pendingSuggestions`.
4. **Sort**: Sort `pendingSuggestions` by confidence descending.
5. **Deduplicate**: Never suggest a pair that already exists in the `contactConversations` table (whether confirmed, manual, or rejected).

---

## Persistence Strategy

- **`use-persona-store`**: Load from SQLite DB on app start (inside `_layout.tsx` `useEffect`).
- **`use-recording-store`**: State is ephemeral. Reset to `idle` on app restart.
- **`use-permissions-store`**: Check on app start AND whenever the app returns to the foreground (`AppState` listener).
- **`use-share-store`**: `isShareScreenActive` is strictly managed by the `Share` screen's mount/unmount lifecycle.
- **MMKV**: Used for ultra-fast synchronous reads (e.g., `onboarding_complete` flag, `active_persona_id`).

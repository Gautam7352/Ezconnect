> Added 2026-08-20 — initial definition

# Navigation & Screen Map

This document defines the complete navigation and screen architecture for the Ezconnect app.
We use **Expo Router** (file-based routing) with typed routes enabled (`experiments.typedRoutes: true`).

## Route Tree

```text
src/app/
├── _layout.tsx                    — Root layout. Wraps ThemeProvider, splash, checks onboarding completion.
│                                    If onboarding not complete: redirect to /onboarding
│                                    If onboarding complete: render (tabs) layout
├── onboarding.tsx                 — Full-screen permission request flow (first-run only).
│                                    Steps: Welcome → Microphone → Camera → Bluetooth → NFC → Done
│                                    On completion: sets MMKV key 'onboarding_complete', navigates to /(tabs)/
├── (tabs)/
│   ├── _layout.tsx                — Tab navigator. 4 tabs: Home, Contacts, Share, Record.
│   │                                Uses NativeTabs from expo-router/unstable-native-tabs (native)
│   │                                Uses Tabs/TabList/TabTrigger/TabSlot from expo-router/ui (web)
│   ├── index.tsx                  — Home tab. Shows: active persona card, recent contacts, recent conversations.
│   ├── contacts.tsx               — Contacts tab. Shows: search bar (FTS5), contacts list grouped by event.
│   ├── share.tsx                  — Share tab. Shows: active persona QR code, BLE discovery, NFC HCE.
│   └── record.tsx                 — Record tab. Shows: record button, active recording timer, recent convos.
├── contact/
│   └── [id].tsx                   — Contact detail.
├── conversation/
│   └── [id].tsx                   — Conversation detail.
├── persona/
│   ├── index.tsx                  — Persona list/manager.
│   └── [id].tsx                   — Persona editor.
├── event/
│   ├── index.tsx                  — Events list.
│   └── [id].tsx                   — Event detail.
└── settings/
    └── index.tsx                  — Settings.
```

## Screen Specifications

### `src/app/_layout.tsx` (Root Layout)
- **Route Path**: `/`
- **Purpose**: App entry point. Configures global providers, handles splash screen hiding, checks initial onboarding state.
- **Data Read**: MMKV (`onboarding_complete`).
- **Components Used**: `<ThemeProvider>`, `<AnimatedSplashOverlay>`.
- **Navigation Triggers**: Redirects to `/onboarding` if first run, otherwise renders `(tabs)`.
- **Platform Notes**: Universal.

### `src/app/onboarding.tsx`
- **Route Path**: `/onboarding`
- **Purpose**: Guides user through granting necessary hardware permissions.
- **Data Read**: `use-permissions-store` (live status of permissions).
- **Components Used**: `<PermissionGate>`, `<ThemedView>`, `<ThemedText>`.
- **Navigation Triggers**: On finish, sets MMKV flag and pushes to `/(tabs)/`.
- **Platform Notes**: Permission requests map to native Android/iOS dialogs. Web skips native requests or uses Web APIs.

### `src/app/(tabs)/_layout.tsx`
- **Route Path**: `/(tabs)`
- **Purpose**: Defines the primary bottom tab navigation structure.
- **Data Read**: None directly.
- **Components Used**: `expo-router/unstable-native-tabs` (Native), `expo-router/ui` (Web).
- **Tab Bar Config**:
  - **Home**: icon `house.fill` (iOS) / `home` (Android)
  - **Contacts**: icon `person.2.fill` (iOS) / `people` (Android)
  - **Share**: icon `antenna.radiowaves.left.and.right` (iOS) / `wifi_tethering` (Android)
  - **Record**: icon `mic.fill` (iOS) / `mic` (Android)
- **Platform Notes**: Uses platform-specific tab components for native feel.

### `src/app/(tabs)/index.tsx` (Home)
- **Route Path**: `/` (inside tabs)
- **Purpose**: Dashboard showing current active identity and recent activity.
- **Data Read**: DB (last 5 contacts, last 3 conversations), `use-persona-store` (active persona).
- **Components Used**: `<PersonaCard>`, `<ContactCard>`, `<ConversationRow>`, `<SmartLinkSuggestion>`.
- **Navigation Triggers**: Tapping contact → `/contact/[id]`, tapping conversation → `/conversation/[id]`.

### `src/app/(tabs)/contacts.tsx`
- **Route Path**: `/contacts`
- **Purpose**: Searchable directory of all collected contacts.
- **Data Read**: DB (Contacts table, Events table, `contacts_fts` virtual table).
- **Components Used**: `<SearchBar>`, `<ContactCard>`, `<EventChip>`.
- **Navigation Triggers**: Tapping contact → `/contact/[id]`.

### `src/app/(tabs)/share.tsx`
- **Route Path**: `/share`
- **Purpose**: Primary hub for sharing contact info (BLE, QR, NFC HCE).
- **Data Read**: `use-share-store` (nearby devices, exchange status), `use-persona-store` (active persona).
- **Components Used**: `<QrDisplay>`, `<BleDeviceCard>`, `<EmptyState>`.
- **Navigation Triggers**: None directly; drives modal dialogs for exchange confirmation.
- **Platform Notes**: HCE is Android-only. BLE relies on `munim-bluetooth` (Native only). Web defaults to QR code only.

### `src/app/(tabs)/record.tsx`
- **Route Path**: `/record`
- **Purpose**: Manual entry point for audio recording.
- **Data Read**: `use-recording-store` (duration, status, interim transcript), DB (recent conversations).
- **Components Used**: `<RecordingIndicator>`, `<ConversationRow>`.
- **Navigation Triggers**: Tapping conversation → `/conversation/[id]`.

### `src/app/contact/[id].tsx`
- **Route Path**: `/contact/[id]`
- **Params**: `id: string`
- **Purpose**: Detailed view of a specific contact.
- **Data Read**: DB (Contact by ID, associated Conversations, associated Events).
- **Components Used**: `<ThemedView>`, `<ThemedText>`, `<ConversationRow>`.
- **Navigation Triggers**: Tapping conversation → `/conversation/[id]`.

### `src/app/conversation/[id].tsx`
- **Route Path**: `/conversation/[id]`
- **Params**: `id: string`
- **Purpose**: View audio transcript, extracted entities, and linked contacts.
- **Data Read**: DB (Conversation by ID, ConversationEntities, linked Contacts).
- **Components Used**: `<TranscriptView>`, `<EntityChip>`, `<ContactCard>`, `<SmartLinkSuggestion>`.
- **Navigation Triggers**: Tapping contact → `/contact/[id]`.

### `src/app/persona/index.tsx`
- **Route Path**: `/persona`
- **Purpose**: List and manage all user personas.
- **Data Read**: `use-persona-store` (all personas).
- **Components Used**: `<PersonaCard>`.
- **Navigation Triggers**: Tapping "+ New" → `/persona/new`, Tapping persona → `/persona/[id]`.

### `src/app/persona/[id].tsx`
- **Route Path**: `/persona/[id]`
- **Params**: `id: string` (use `'new'` for creation)
- **Purpose**: Form to create or edit a persona.
- **Data Read**: DB / `use-persona-store` (Persona by ID, if editing).
- **Components Used**: Standard form inputs, Avatar picker.
- **Navigation Triggers**: On save/delete → back to `/persona`.

### `src/app/event/index.tsx`
- **Route Path**: `/event`
- **Purpose**: Directory of events where connections were made.
- **Data Read**: DB (Events ordered by date).
- **Components Used**: `<EventChip>`.
- **Navigation Triggers**: Tapping event → `/event/[id]`.

### `src/app/event/[id].tsx`
- **Route Path**: `/event/[id]`
- **Params**: `id: string`
- **Purpose**: Detailed view of an event and who was met there.
- **Data Read**: DB (Event by ID, associated Contacts, associated Conversations).
- **Components Used**: `<ContactCard>`, `<ConversationRow>`.

### `src/app/settings/index.tsx`
- **Route Path**: `/settings`
- **Purpose**: App settings, storage management, and global config.
- **Data Read**: MMKV, DB metadata (storage size).
- **Components Used**: Standard list items, text inputs for API keys.
- **Key Features**:
  - Active persona quick-switch.
  - Storage info (audio size, transcript count).
  - Delete all data, battery optimization prompt.
  - **Cloud AI (BYOK)**: Inputs for Gemini/Groq API keys with a link to an in-app guide on how to get them for free.

---

## Component Directory Plan

New domain components to be created in `src/components/`:

```text
src/components/
├── persona-card.tsx              — Displays a persona as a card (name, headline, QR trigger)
├── contact-card.tsx              — Displays a contact row (avatar, name, headline, exchange badge)
├── conversation-row.tsx          — Displays a conversation row (duration, status, snippet)
├── event-chip.tsx                — Small chip showing event name with date
├── recording-indicator.tsx       — Animated microphone + timer for active recording
├── qr-display.tsx                — Renders the persona QR code (wraps react-native-qrcode-svg)
├── ble-device-card.tsx           — Shows a discovered nearby BLE device with exchange button
├── transcript-view.tsx           — Renders transcript with entity highlights
├── entity-chip.tsx               — Small chip for a conversation entity (person/topic/tech/action)
├── permission-gate.tsx           — Wrapper that shows permission request UI if permission not granted
├── smart-link-suggestion.tsx     — Card showing "Link this convo to [Contact]?" accept/reject
└── empty-state.tsx               — Generic empty state with icon, title, description, optional CTA
```

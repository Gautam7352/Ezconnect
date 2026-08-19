# Strict Project Guardrails

These guardrails are **strictly enforced** for all AI coding assistants and human contributors. Any proposed code modification that violates these guardrails will be rejected.

---

## 🚫 1. Absolute Forbidden Patterns

| Forbidden Pattern | Reason | Required Alternative |
| :--- | :--- | :--- |
| **Using raw web HTML tags (`<div>`, `<span>`, `<a>`, `<p>`) in shared or native components** | Causes crashes on iOS and Android. | Use `<ThemedView>`, `<ThemedText>`, `<View>`, `<Text>`, or `<ExternalLink>`. |
| **Installing dependencies via `npm install <pkg>` without Expo verification** | Can install versions incompatible with React 19 / RN 0.86 / Expo SDK 57. | Always use `npx expo install <package>`. |
| **Importing deprecated Expo APIs** (e.g. legacy `expo-app-loading`, `expo-splash-screen` legacy callbacks, legacy `expo-font` hooks) | Incompatible with Expo 57 and React 19. | Use modern Expo 57 APIs. See [`ai/expo-v57-guide.md`](./expo-v57-guide.md). |
| **Bypassing Expo Router file-based routing** (e.g., configuring manual `@react-navigation/native` stacks in screen files) | Breaks deep linking, typed routes, and layout hierarchy. | Use `expo-router` file structure (`src/app/*`) and `_layout.tsx`. |
| **Using `any` in TypeScript types** | Defeats type safety and typed routes benefits. | Provide explicit types, generic parameters, or use `unknown` with type narrowing. |
| **Hardcoding colors or pixel spacing magic numbers** | Breaks dark mode support and responsive design tokens. | Use `Colors` and `Spacing` tokens from `@/constants/theme` or `useTheme()`. |
| **Using `window`, `document`, or `localStorage` without platform checks** | Crashes on native iOS & Android runtimes. | Use `Platform.OS === 'web'` checks or create `.web.tsx` platform-specific files. |
| **Suppressing linter / TypeScript errors** (`// @ts-ignore`, `eslint-disable`) | Masks underlying architecture bugs. | Fix the root typing or architectural issue. |
| **Writing business logic or UI components without accompanying tests** | Causes regression loops and violates the project's strict TDD mandate. | Always practice Test-Driven Development (TDD). Write the Jest tests before writing the implementation. |
| **Committing changes without updating `ai/` documentation** | Causes documentation drift and AI hallucination cascades. | Update corresponding `ai/*.md` files immediately. See [`ai/documentation-maintenance.md`](./documentation-maintenance.md). |

---

## 🏗️ 2. Architecture & File Structure Rules

1. **Routing Directory**:
   - All routable screens and layouts **must** reside exclusively in `src/app/`.
   - Never put business logic, heavy calculations, or reusable UI components directly in `src/app/`. Screens should be thin views composing components from `src/components/` and hooks from `src/hooks/`.
2. **Component Organization**:
   - Reusable components go in `src/components/`.
   - Primitive UI components go in `src/components/ui/` (e.g. `collapsible.tsx`, buttons, dialogs).
   - Themed baseline components (`ThemedText`, `ThemedView`) must be used for text and surfaces to guarantee seamless dark/light theme switching.
3. **Platform-Specific Implementations**:
   - When a component requires significantly different implementations for web and native (e.g. `app-tabs.tsx` vs `app-tabs.web.tsx`, `animated-icon.tsx` vs `animated-icon.web.tsx`), use the standard `.web.tsx` and `.tsx` file extension split.
   - Do not bloat a single file with dozens of `Platform.OS === 'web'` branches if the layout or DOM paradigms diverge substantially.

---

## 🎨 3. Styling & Theming Guardrails

1. **Design Tokens**:
   - All colors must come from `@/constants/theme.ts` via `Colors.light` / `Colors.dark` or through the `useTheme()` hook.
   - All margin, padding, and gap spacing must use `Spacing` constants (`Spacing.one`, `Spacing.two`, `Spacing.three`, `Spacing.four`, `Spacing.five`, `Spacing.six`).
2. **StyleSheet Discipline**:
   - Use `StyleSheet.create()` for all component styles.
   - Inline styles are allowed **only** for dynamic values calculated at runtime (e.g., animated styles or dynamic insets from `useSafeAreaInsets()`).
3. **Safe Area Insets**:
   - Always account for device notches, home indicators, and tab bar heights using `useSafeAreaInsets()` from `react-native-safe-area-context` and `BottomTabInset` from `@/constants/theme`.

---

## ⚡ 4. React 19 & React Compiler Guardrails

1. **React Compiler Compatibility**:
   - The project has `experiments.reactCompiler: true` enabled in `app.json`.
   - Code must follow standard Rules of React (idempotent render functions, no mutating props or state directly, no reading mutable values during render).
   - Avoid manual `useMemo` and `useCallback` unless specifically required by third-party library contracts (e.g. Reanimated worklet dependency arrays).
2. **Worklets and Reanimated 4**:
   - Use `'worklet';` directive inside any callback running on the UI thread.
   - When triggering React state updates from worklets, always schedule them using `scheduleOnRN()` from `react-native-worklets` to avoid UI thread deadlocks.

---

## 🔒 5. Security & Privacy Guardrails

1. **No Hardcoded Secrets**:
   - Never commit API keys, tokens, or private endpoints in source files.
   - Use Expo public environment variables (`EXPO_PUBLIC_*`) for client-safe configuration.
2. **External Link Handling**:
   - Always open external URLs through the `<ExternalLink>` component or `expo-web-browser` with `WebBrowserPresentationStyle.AUTOMATIC` to protect user sessions.
3. **Input Sanitization**:
   - Validate and sanitize any user inputs or deep-link query parameters before processing or rendering.

---

## 📵 6. Confirmed Android Impossibilities — Never Attempt These

> These were researched and confirmed impossible on 2026-08-20. Do NOT suggest, attempt, or prototype these — they are platform hard limits, not implementation gaps.

| Forbidden Attempt | Why It's Impossible | What We Use Instead |
| :--- | :--- | :--- |
| **Intercepting double-press power button** | Android OS reserves it for Google Assistant / Emergency SOS at the kernel level. No third-party API exists at any SDK level. | Quick Settings Tile + Persistent Notification action |
| **NFC bidirectional P2P (Android Beam)** | Fully removed in Android 10 (API 29). No replacement P2P NFC API exists. | BLE (`react-native-ble-plx`) for bidirectional exchange |
| **Completely silent background recording (no user indicator)** | Android 12+ forces a microphone dot in the status bar and a foreground service notification. This is a privacy protection — not overridable. | Use the notification as a UX feature (shows recording status, Stop button) |
| **NFC P2P between two app instances** | HCE (Host Card Emulation) is one-way only — one device emulates a tag, the other reads it. True two-way NFC app communication is not supported. | BLE for two-way, NFC HCE for one-way fallback |

---

## 🏗️ 7. Native Module & Prebuild Rules

> Added 2026-08-20 after decision to use Expo CNG (Continuous Native Generation).

1. **Never Edit the Generated `android/` or `ios/` Directories Directly:**
   - These are generated by `npx expo prebuild` and are gitignored.
   - Any native changes must be made via `app.json` config plugins or Expo Inline Modules (placed in `modules/`).
2. **Inline Modules for New Native Features:**
   - Write Kotlin files in `modules/` for new Android-specific native features (e.g. `TileService`).
   - Declare them in `app.json` under `experiments.inlineModules.watchedDirectories`.
   - Rebuild with `npx expo prebuild && npx expo run:android` after any native change.
3. **Config Plugins for Manifest Changes:**
   - All `AndroidManifest.xml` and `build.gradle` modifications must go through a config plugin, not direct file edits.
4. **NDK Version Compliance:**
   - `whisper.rn` requires `ndkVersion = "24.0.8215888"` or higher in `android/build.gradle`.
   - This is managed via the config plugin — do not change it manually.

---

## 🧠 8. Transcription Pipeline Rules

> Added 2026-08-20 after confirming two-stage transcription architecture.

1. **Never Attempt Real-Time Whisper on the Audio Thread:**
   - `whisper.rn` is a post-recording, file-based processor. Do NOT pipe live audio buffers into it — it will block the UI and drain battery.
   - Real-time feedback uses `expo-speech-recognition` only.
2. **Always Process Whisper Transcription Off the Main Thread:**
   - Run `whisper.rn` transcription inside a background task (e.g. via a headless JS task or a Worker-equivalent). Never block the React JS thread.
3. **Default Model is Whisper `tiny`:**
   - Do NOT bundle larger models (`base`, `small`) in the default build. Offer them as optional user-initiated downloads.
4. **Cloud AI is Always Opt-In:**
   - Never automatically send audio data to a cloud service. Always require an explicit user action ("Re-analyze with AI" button).

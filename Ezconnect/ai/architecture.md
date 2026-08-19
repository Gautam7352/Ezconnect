# Architecture & Codebase Map

This document describes the architectural layout, directory conventions, navigation patterns, and cross-platform handling in the **Ezconnect** codebase.

---

## 🏛️ High-Level Architecture

Ezconnect is built as a **universal multi-platform application** targeting iOS, Android, and Web using a single TypeScript codebase powered by Expo SDK 57, React Native 0.86, and React 19.

```
Ezconnect/
├── ai/                 # AI & LLM documentation, guardrails, standards
├── assets/             # Static binary assets (images, icons, fonts, splash)
├── scripts/            # Build & maintenance scripts
├── src/                # All application source code
│   ├── app/            # Expo Router file-based route hierarchy
│   ├── components/     # Reusable UI & platform-specific components
│   │   └── ui/         # Base UI primitives (Collapsible, etc.)
│   ├── constants/      # App constants, design tokens, color palettes
│   └── hooks/          # Custom React hooks (theme, color scheme, etc.)
├── app.json            # Expo project configuration
├── package.json        # Dependencies and build scripts
├── PRD.md              # Product Requirements Document (MVP specs & roadmap)
└── tsconfig.json       # TypeScript configuration
```

---

## 📁 Detailed Directory Map

### 1. `src/app/` (Routing & Screens)
Implements file-based routing with [Expo Router](https://docs.expo.dev/router/introduction).

- **`_layout.tsx`**: Root layout. Mounts the `ThemeProvider`, handles splash screen prevention/hiding (`expo-splash-screen`), renders `<AnimatedSplashOverlay />`, and renders `<AppTabs />`.
- **`index.tsx`**: The main Home tab (`/`). Displays hero animated branding, quick links, hints, and platform badges.
- **`explore.tsx`**: The Explore tab (`/explore`). Contains interactive collapsibles demonstrating core features, docs links, and tips.

### 2. `src/components/` (Components & Platform Variants)
Contains reusable UI components, layout containers, and platform-specific implementations.

- **`app-tabs.tsx`** & **`app-tabs.web.tsx`**:
  - `app-tabs.tsx`: Native tab navigation leveraging `expo-router/unstable-native-tabs` (`NativeTabs`) with native platform tab bars on iOS & Android.
  - `app-tabs.web.tsx`: Web tab navigation leveraging `expo-router/ui` (`Tabs`, `TabList`, `TabTrigger`, `TabSlot`) with custom responsive header/dock bar.
- **`animated-icon.tsx`** & **`animated-icon.web.tsx`**:
  - `animated-icon.tsx`: Native splash overlay and hero animations using `react-native-reanimated` 4 and `react-native-worklets`.
  - `animated-icon.web.tsx`: Web-optimized animation with CSS module integration (`animated-icon.module.css`).
- **`themed-text.tsx`**: Centralized typography component supporting preset types (`default`, `title`, `subtitle`, `small`, `smallBold`, `link`, `linkPrimary`, `code`) and semantic theme colors.
- **`themed-view.tsx`**: Centralized surface component that automatically applies theme background colors.
- **`external-link.tsx`**: Universal external link handler. Uses standard anchor tags on web and `expo-web-browser` in-app browser on native platforms.
- **`hint-row.tsx`**: Reusable key-value hint display with formatted code snippet tags.
- **`web-badge.tsx`**: Displays current Expo SDK version badge on web platform.
- **`ui/collapsible.tsx`**: Accordion component with animated height/fade transitions and rotating `SymbolView` chevron.

### 3. `src/constants/` (Design Tokens & Theming)
- **`theme.ts`**:
  - `Colors`: Light and dark color palettes (`text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary`).
  - `Fonts`: Cross-platform font families (system-ui, serif, rounded, mono) configured for iOS, Android, and Web CSS variables.
  - `Spacing`: Standard 4px-based spacing scale (`half: 2`, `one: 4`, `two: 8`, `three: 16`, `four: 24`, `five: 32`, `six: 64`).
  - `BottomTabInset`: Platform-specific tab insets (iOS: 50, Android: 80).
  - `MaxContentWidth`: Max desktop/tablet content width (800px).

### 4. `src/hooks/` (Custom Hooks)
- **`use-theme.ts`**: Returns the active `Colors` object corresponding to the current color scheme.
- **`use-color-scheme.ts`**: Native color scheme hook exporting React Native's `useColorScheme`.
- **`use-color-scheme.web.ts`**: Web-specific color scheme hook with hydration tracking to prevent SSR/static rendering mismatch.

### 5. `assets/` (Static Assets)
- **`images/`**: PNG assets for logos, adaptive icons, tab icons, and tutorial graphics.
- **`expo.icon/`**: Dynamic iOS icon bundle.

---

## 🔄 Cross-Platform Execution Model

To maintain universal compatibility without degrading native performance:
1. **Extension-based platform splits**: Use `.web.tsx` for web-specific DOM or CSS-based behavior, and `.tsx` for React Native / mobile-native behavior.
2. **Runtime checks**: For minor platform adjustments within a single file, use `Platform.OS === 'web'` or `Platform.select({ ios: ..., android: ..., web: ..., default: ... })`.
3. **Web hydration protection**: In web hooks interacting with client state or browser media queries, track hydration state before rendering client-specific themes to prevent layout shift or hydration mismatch.

---

## 🧭 Navigation & Routing Principles

- **File-based routes**: Any file in `src/app/` becomes a route.
- **Layout files**: `_layout.tsx` wraps all sibling and child routes within that directory level.
- **Typed routes**: `experiments.typedRoutes` is enabled. Always use type-safe navigation strings (`href="/"`, `href="/explore"`).

---

## 🔨 Build System & CNG Pipeline

> Added 2026-08-20 after confirming Expo CNG (Continuous Native Generation) as the build strategy.

**Key principle:** The `android/` and `ios/` directories are **generated build artifacts**, not source files. They are gitignored and fully regenerated by `npx expo prebuild` from `app.json` + config plugins.

```
Source of Truth:
  app.json            ← Expo config (plugins, permissions, experiments)
  modules/            ← Expo Inline Modules (Kotlin/Swift native code)

Generated (gitignored — do not edit directly):
  android/            ← Generated by expo prebuild
  ios/                ← Generated by expo prebuild

Build Commands:
  npx expo prebuild                    ← Regenerate native projects
  npx expo run:android                 ← Dev build (local)
  eas build --platform android         ← Production build (EAS)
```

---

## 📦 Confirmed Library Stack

> Decided 2026-08-20 after technical feasibility research. See PRD.md § 4.3 Decision Log for full rationale on each choice.

### Hardware Integration

> Updated 2026-08-20 (v1.2.0). Four corrections from v1.1.0 — see `PRD.md` Decision Log § 4.3 decisions 007–010 and [`ai/feasibility-analysis.md`](./feasibility-analysis.md).

| Feature | Library (v1.2.0) | Was in v1.1.0 | Requires Prebuild |
| :--- | :--- | :--- | :--- |
| Background audio recording | `expo-audio` (`enableBackgroundRecording: true`) | Same | ✅ |
| Quick Settings Tile | Expo Inline Module (`modules/RecordingTile.kt`) | Same | ✅ (experimental) |
| Persistent notification + foreground service | `react-native-notify-kit` | ~~`@notifee/react-native`~~ (archived) | ✅ |
| NFC HCE (phone emulates card) | `react-native-hce` | ~~(missing — was not listed)~~ | ✅ |
| NFC tag read/write | `react-native-nfc-manager` v4.x | Same | ✅ |
| BLE bidirectional (Central + Peripheral) | `munim-bluetooth` | ~~`react-native-ble-plx`~~ (Central-only) | ✅ |
| QR code generation | `react-native-qrcode-svg` | Same | ❌ |
| QR code scanning | `expo-camera` (barcode API) | Same | ✅ |
| On-device transcription (post-recording) | `whisper.rn` (Whisper `tiny-q8`, 80MB, NDK) | Same (was `tiny`) | ✅ |
| Real-time streaming STT | `expo-speech-recognition` | Same | ✅ |

### Data & State

> Updated 2026-08-20 (v1.2.0). WatermelonDB and op-sqlite replaced.

| Feature | Library (v1.2.0) | Was in v1.1.0 | Notes |
| :--- | :--- | :--- | :--- |
| Primary ORM (schema, migrations, CRUD) | `expo-sqlite` v14 + Drizzle ORM | ~~WatermelonDB~~ (New Arch issues, slowing maintenance) | Official Expo; first-class New Arch support |
| FTS5 full-text search | `expo-sqlite` raw SQL + triggers | ~~`@op-engineering/op-sqlite`~~ (now redundant) | FTS5 virtual tables via raw `db.execAsync` |
| Global client state | `Zustand` | Same | Lightweight, New Arch compatible |
| Secure config/feature flags | `MMKV` | Same | Synchronous key-value |

### Post-MVP (Not in current build)
| Feature | Library | Notes |
| :--- | :--- | :--- |
| Semantic vector search index | `sqlite-vec` | SQLite extension for vector similarity |
| On-device text embedding generation | `react-native-executorch` | Runs `all-MiniLM-L6-v2` (22MB) locally |

---

## 🗂️ `modules/` Directory (Inline Modules)

> Added 2026-08-20 with Expo Inline Modules SDK 57 feature.

Location for project-local native code. Declared in `app.json`:
```json
{
  "expo": {
    "experiments": {
      "inlineModules": { "watchedDirectories": ["modules"] }
    }
  }
}
```

Current / planned inline modules:
- **`modules/RecordingTile.kt`** — Android `TileService` for Quick Settings recording toggle. Sends a broadcast to React Native JS layer on tile tap.

# Expo SDK 57 & React 19 Modernization Guide

> [!IMPORTANT]
> **Expo HAS CHANGED in SDK 57.**
> Always consult the official versioned documentation: **https://docs.expo.dev/versions/v57.0.0/** before writing code or suggesting APIs.

---

## 🚀 Key Expo SDK 57 Highlights

1. **React 19 & React Native 0.86**:
   - Expo SDK 57 runs React 19.2.3 and React Native 0.86.2.
   - Fully supports React Compiler (`experiments.reactCompiler: true`).
2. **Modern Tab Navigation Architecture**:
   - Native Tabs: `expo-router/unstable-native-tabs` provides true native tab bar components on iOS (UITabBar) and Android (NavigationBar).
   - Web Tabs: `expo-router/ui` provides declarative `<Tabs>`, `<TabList>`, `<TabTrigger>`, `<TabSlot>` for responsive desktop/web layouts.
3. **Expo Symbols**:
   - `expo-symbols` (`SymbolView`) renders native SF Symbols on iOS, Material Symbols on Android, and web icons seamlessly using a single unified descriptor:
   ```typescript
   <SymbolView
     tintColor={theme.text}
     name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
     size={12}
   />
   ```
4. **Modern Splash Screen**:
   - `expo-splash-screen` uses `preventAutoHideAsync()` and `hideAsync()`.
   - Splash transitions are paired with Reanimated 4 splash overlays (`AnimatedSplashOverlay`).
5. **Modern Image Handling**:
   - Always use `expo-image` (`<Image />`) instead of React Native's legacy `<Image />`.
   - Supports caching, blurhash placeholders, responsive density formats (`@2x`, `@3x`), and SVG/vector assets.

---

## 🔄 Deprecated vs Modern APIs Comparison

| Deprecated / Obsolete Pattern | Modern Expo SDK 57 Replacement |
| :--- | :--- |
| `import { Image } from 'react-native'` | `import { Image } from 'expo-image'` |
| `import { AppLoading } from 'expo'` | `import * as SplashScreen from 'expo-splash-screen'` |
| `import { Ionicons } from '@expo/vector-icons'` | `import { SymbolView } from 'expo-symbols'` |
| `TouchableOpacity` / `TouchableHighlight` | `Pressable` from `react-native` |
| `npm install <package>` | `npx expo install <package>` |
| Legacy manual tab bar configuration in screen components | `expo-router/unstable-native-tabs` (native) & `expo-router/ui` (web) |
| Manual linking with `Linking.openURL` | `import { openBrowserAsync } from 'expo-web-browser'` or `<ExternalLink>` |
| Legacy `useColorScheme` from `react-native` on web | Custom `useColorScheme` in `@/hooks/use-color-scheme.web.ts` with hydration check |

---

## ⚠️ Common LLM Pitfalls in Expo SDK 57

1. **Hallucinating old Expo Router APIs**:
   - Do NOT use `useNavigation` from `@react-navigation/native` when Expo Router's `useRouter()` or `<Link>` is available.
   - Do NOT create `NavigationContainer` manually. Expo Router manages the root container automatically.
2. **Missing `'worklet'` directive**:
   - Functions passed to Reanimated callbacks (e.g. `entering.withCallback(...)`) must have `'worklet';` as the first statement.
3. **Incompatible third-party packages**:
   - Many old React Native packages are incompatible with React 19 and React Native New Architecture / 0.86.
   - Always verify package compatibility via `npx expo install`.

---

## 🆕 Ezconnect-Specific SDK 57 Features (Added 2026-08-20)

These features are specifically leveraged by Ezconnect and were confirmed viable during technical feasibility research:

### 6. Background Audio Recording via expo-audio Config Plugin
`expo-audio` in SDK 57 ships a config plugin that handles Android 14+ foreground service manifest requirements automatically:
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
This auto-injects:
- `RECORD_AUDIO`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_MICROPHONE` (Android 14+ required)
- `android:foregroundServiceType="microphone"` on the service declaration

> **Previous assumption:** Use `expo-av` with a custom native module. **Why changed:** `expo-audio` with config plugin eliminates all custom Kotlin boilerplate for manifest entries.

---

### 7. Expo Inline Modules (SDK 57 — New Feature)
Write Kotlin/Swift directly in your project directory. Expo auto-generates JS bindings on `prebuild`. Used in Ezconnect for the Quick Settings `TileService`.

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
Files in `modules/*.kt` are auto-discovered and bridged. No separate local package needed.

---

### 8. expo-speech-recognition (SDK 57 Compatible)
Wraps Android `SpeechRecognizer` and iOS `SFSpeechRecognizer`. Used as Stage 1 of Ezconnect's two-stage transcription pipeline for real-time streaming interim results during recording. Built on New Architecture (TurboModules).

---

## 🔄 Updated Deprecated vs Modern APIs (v1.1.0)

| Deprecated / Obsolete Pattern | Modern Expo SDK 57 Replacement | Reason |
| :--- | :--- | :--- |
| `import { Image } from 'react-native'` | `import { Image } from 'expo-image'` | Caching, density, blurhash |
| `import { AppLoading } from 'expo'` | `import * as SplashScreen from 'expo-splash-screen'` | API removed |
| `import { Ionicons } from '@expo/vector-icons'` | `import { SymbolView } from 'expo-symbols'` | Native symbols |
| `TouchableOpacity` / `TouchableHighlight` | `Pressable` from `react-native` | Modern interaction model |
| `npm install <package>` | `npx expo install <package>` | Version compatibility |
| Legacy tab bar in screen components | `expo-router/unstable-native-tabs` (native) & `expo-router/ui` (web) | SDK 57 routing |
| Manual linking with `Linking.openURL` | `openBrowserAsync` from `expo-web-browser` or `<ExternalLink>` | In-app browser |
| Legacy `useColorScheme` from `react-native` on web | `@/hooks/use-color-scheme.web.ts` with hydration check | SSR/hydration safety |
| **`expo-av` for recording** | **`expo-audio` with `enableBackgroundRecording: true`** | **Auto manifest config; foreground service** |
| **Android Beam / NFC P2P** | **BLE (`react-native-ble-plx`) + NFC HCE (`react-native-nfc-manager`)** | **Android Beam removed in API 29** |
| **Double-press power button trigger** | **Quick Settings Tile + Persistent Notification** | **Blocked by Android OS** |

# Common AI Workflows & Developer Recipes

Step-by-step instructions for performing routine development tasks in the **Ezconnect** codebase.

---

## 📌 Recipe 1: Adding a New Route / Screen

1. **Create the Screen File**:
   - Create a new file in `src/app/`, for example `src/app/settings.tsx`.
   - Use `ThemedView` and `ThemedText` for container and text elements.
   ```typescript
   import { StyleSheet } from 'react-native';
   import { ThemedText } from '@/components/themed-text';
   import { ThemedView } from '@/components/themed-view';
   import { Spacing } from '@/constants/theme';

   export default function SettingsScreen() {
     return (
       <ThemedView style={styles.container}>
         <ThemedText type="title">Settings</ThemedText>
       </ThemedView>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: Spacing.four,
     },
   });
   ```

2. **Register Tab or Navigation Trigger** (if applicable):
   - For native: Update `src/components/app-tabs.tsx` to add a new `<NativeTabs.Trigger>`.
   - For web: Update `src/components/app-tabs.web.tsx` to add a new `<TabTrigger>`.

3. **Update Documentation**:
   - Add the new route to `src/app/` section in [`ai/architecture.md`](./architecture.md).

---

## 📌 Recipe 2: Adding a Cross-Platform Component

When building a component with platform-divergent UI or libraries:

1. **Create the Native Component**:
   - Create `src/components/my-component.tsx` for iOS & Android.
2. **Create the Web Component**:
   - Create `src/components/my-component.web.tsx` for Web (SSR/client hydration safe).
3. **Export Cleanly**:
   - Consumers should import from `@/components/my-component` without specifying `.web` or `.native`.
4. **Update Documentation**:
   - Document both implementations in [`ai/architecture.md`](./architecture.md).

---

## 📌 Recipe 3: Installing New Packages

1. **Install with Expo CLI**:
   - Always run:
     ```bash
     npx expo install <package-name>
     ```
   - This ensures the version resolved is officially compatible with Expo SDK 57 and React 19.
2. **Check Web Compatibility**:
   - If the package is native-only (e.g. utilizes native iOS/Android modules), ensure web fallbacks or `.web.tsx` replacements are created.
3. **Update Documentation**:
   - Update `package.json` notes in [`ai/README.md`](./README.md) and [`ai/expo-v57-guide.md`](./expo-v57-guide.md).

---

## 📌 Recipe 4: Modifying Themes or Design Tokens

1. **Update `src/constants/theme.ts`**:
   - Add or modify colors in `Colors.light` and `Colors.dark`.
   - Add or modify spacing in `Spacing`.
2. **Verify Dark & Light Mode**:
   - Ensure color keys exist symmetrically in both `light` and `dark` palettes.
3. **Update Documentation**:
   - Update [`ai/architecture.md`](./architecture.md) and [`ai/coding-standards.md`](./coding-standards.md).

---

## 📌 Recipe 5: Running Quality Checks & Validation

1. **Run Linter**:
   ```bash
   npm run lint
   ```
   (or `npx expo lint`)
2. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
3. **Verify Build & Bundler**:
   ```bash
   npx expo start --web
   ```

---

## 📌 Recipe 6: Running the CNG Prebuild Cycle (Added 2026-08-20)

Required whenever you change `app.json` plugins, add a new Inline Module, or install a native package.

```bash
# 1. Clean previous generated native project (optional but safe)
npx expo prebuild --clean

# 2. Install all native dependencies
npx expo run:android

# After this, for day-to-day JS-only development:
npx expo start
```

> ⚠️ **Never directly edit `android/` or `ios/`.** They are regenerated on every prebuild run and any manual edits will be lost.

---

## 📌 Recipe 7: Adding a New Expo Inline Module (Kotlin) (Added 2026-08-20)

Used when adding new Android-native functionality (e.g. a new `TileService`, a new `BroadcastReceiver`).

1. **Enable inline modules in `app.json`:**
   ```json
   {
     "expo": {
       "experiments": {
         "inlineModules": { "watchedDirectories": ["modules"] }
       }
     }
   }
   ```
2. **Create `modules/YourModule.kt`:**
   ```kotlin
   class YourModule : Module() {
     override fun definition() = ModuleDefinition {
       Name("YourModule")
       Function("doSomething") { arg: String ->
         // Native Kotlin logic
         return@Function "Done: $arg"
       }
     }
   }
   ```
3. **Rebuild:**
   ```bash
   npx expo prebuild && npx expo run:android
   ```
4. **Use from JS/TS:**
   ```typescript
   import { requireNativeModule } from 'expo-modules-core';
   const YourModule = requireNativeModule('YourModule');
   YourModule.doSomething('hello');
   ```
5. **Update Documentation:** Add the new module to `modules/` section in [`ai/architecture.md`](./architecture.md).

---

## 📌 Recipe 8: Implementing the Three-Layer Contact Sharing (Added 2026-08-20)

Reference for implementing the contact exchange flow correctly per the decisions in PRD.md § 4.3.

**Layer 1 — BLE Bidirectional (both have the app):**
1. On the sharing screen, start `react-native-ble-plx` advertising with a custom Service UUID.
2. Simultaneously scan for the same UUID.
3. Filter discovered devices by RSSI > -60 dBm (ensures physical proximity).
4. When a matching device is discovered, initiate GATT connection.
5. Read the remote profile characteristic. Send your own profile characteristic.
6. Show confirmation dialog: "Exchange with [Name]?" → Accept/Reject.
7. On accept, save the received profile as a new Contact in WatermelonDB.

**Layer 2 — NFC HCE (one-way, other person has no app):**
1. Activate HCE mode via `react-native-nfc-manager`.
2. Write your active persona as an NDEF MIME record (vCard) or a URL record.
3. The other user simply taps their phone to yours → their phone reads your card automatically.
4. No confirmation needed on your side — it's a passive read.

**Layer 3 — QR Code (universal fallback):**
1. Generate QR encoding your active persona vCard or a web URL.
2. Other user scans with `expo-camera` (if they have Ezconnect) or their native camera.
3. If Ezconnect: parse the QR payload and save as Contact.
4. If native camera: open the web card URL in a browser (links to a `.vcf` download endpoint).


# Coding Standards & Best Practices

This document defines the TypeScript, React 19, React Native, and animation standards for the **Ezconnect** project.

---

## 🔷 1. TypeScript Standards

1. **Strict Type Safety**:
   - Explicitly type all component props, custom hook returns, and utility functions.
   - Avoid `any`. Use `unknown` with type guards if a type cannot be known in advance.
   - Use `as const` for fixed lookup objects and theme dictionaries.
2. **Import Aliasing**:
   - Always use the root alias `@/*` when importing from within the `src/` directory or `assets/`.
   ```typescript
   // Correct
   import { ThemedText } from '@/components/themed-text';
   import { Colors, Spacing } from '@/constants/theme';
   import { useTheme } from '@/hooks/use-theme';

   // Incorrect (relative imports across layers)
   import { ThemedText } from '../../components/themed-text';
   ```
3. **Props Definitions**:
   - Prefer `type ComponentProps = ...` or `interface ComponentProps` for exported components.
   - Extend base React Native props when wrapping core elements (e.g., `TextProps`, `ViewProps`, `PressableProps`).

---

## ⚛️ 2. React 19 & Component Architecture

1. **Functional Components**:
   - Use standard function declarations for components:
   ```typescript
   export function MyComponent({ title, onPress }: MyComponentProps) {
     return (...);
   }
   ```
2. **React Compiler Compatibility**:
   - With React Compiler enabled (`experiments.reactCompiler: true`), avoid manual `useMemo` or `useCallback` optimization overhead unless interfacing with external worklet dependencies.
   - Never mutate state variables or props directly. Always treat state as immutable.
   - Do not call hooks conditionally or inside loops.
3. **Themed Primitives by Default**:
   - For all text, use `<ThemedText type="..." themeColor="...">`.
   - For all container backgrounds, use `<ThemedView type="...">`.
   - This ensures dark and light modes work automatically without manual color switching in every component.

---

## 🎬 3. Animations with Reanimated 4 & Worklets

1. **Worklet Directive**:
   - Any function that executes on the UI thread or as an animation callback must start with the `'worklet';` directive.
2. **Scheduling Updates on React Thread**:
   - Reanimated runs on a dedicated UI/worklet thread. To trigger React state setters from inside a worklet callback, use `scheduleOnRN()` from `react-native-worklets`:
   ```typescript
   import { scheduleOnRN } from 'react-native-worklets';

   entering={splashKeyframe.duration(600).withCallback((finished) => {
     'worklet';
     if (finished) {
       scheduleOnRN(setVisible, false);
     }
   })}
   ```
3. **Keyframe & Layout Transitions**:
   - Use `Keyframe` for complex multi-step entry/exit animations.
   - Use `FadeIn`, `FadeOut`, `SlideInUp`, etc. for simple layout transitions.

---

## 🎨 4. Styling & Layout Standards

1. **StyleSheet Encapsulation**:
   - Every component with styles must declare a `const styles = StyleSheet.create({ ... })` at the bottom of the file.
   - Group related styles logically (`container`, `header`, `content`, `footer`).
2. **Design Tokens Only**:
   - Never use arbitrary numeric values for margins, paddings, or font sizes if a token exists.
   ```typescript
   // Correct
   padding: Spacing.four,
   gap: Spacing.two,
   maxWidth: MaxContentWidth,

   // Incorrect
   padding: 23,
   gap: 7,
   ```
3. **Platform-Specific Styling**:
   - Use `Platform.select()` for clean platform-specific style variations:
   ```typescript
   const contentPlatformStyle = Platform.select({
     android: { paddingTop: insets.top },
     web: { paddingTop: Spacing.six },
   });
   ```

---

## ♿ 5. Accessibility (a11y) & Interaction

1. **Touch Targets**:
   - Ensure interactive buttons have a minimum touch target of 44x44 points. Use `hitSlop` on `Pressable` if the visible icon is smaller.
2. **Accessible Labels**:
   - Provide `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` for icon-only buttons or custom controls.
3. **Press Feedback**:
   - Use `Pressable` with visual feedback (e.g. `style={({ pressed }) => pressed && styles.pressed}`) for interactive elements. Avoid obsolete `TouchableOpacity`.

---

## 🧪 6. Testing & Test-Driven Development (TDD)

1. **Strict TDD Enforcement**:
   - Test-Driven Development is **mandatory** for this project.
   - You must write the test file (using Jest and `@testing-library/react-native`) and watch it fail *before* writing the implementation code.
2. **Component Testing**:
   - UI components must be tested for correct rendering, accessibility labels, and user interactions (firing press events).
3. **State & Domain Testing**:
   - Zustand stores and database/domain logic must have isolated unit tests that mock external dependencies (like SQLite or Expo APIs) using `jest.mock()`.
4. **Colocation**:
   - Test files should be colocated in a `__tests__` directory adjacent to the code they are testing (e.g., `src/stores/__tests__/use-persona-store.test.ts`).

# AI Agent Instructions & Operating Rules

This document outlines the core operating instructions and rules for autonomous AI coding agents working on the **Ezconnect** repository.

---

## ⚡ Critical Rule: Expo Version Awareness

# Expo HAS CHANGED

Read the exact versioned docs at **https://docs.expo.dev/versions/v57.0.0/** before writing any code.

- The repository uses **Expo SDK ~57.0.14**, **React 19.2.3**, and **React Native 0.86.2**.
- Do not assume older conventions from Expo SDK 49-51 or React Native 0.72-0.74.
- Always check [`ai/expo-v57-guide.md`](./expo-v57-guide.md) and [`ai/guardrails.md`](./guardrails.md) before producing code.

---

## 🤖 Agent Operating Protocol

1. **Read Before Writing**:
   - Always read the relevant files in `ai/` before planning or executing code changes.
   - Inspect existing components in `src/components/` and hooks in `src/hooks/` to reuse existing patterns.
2. **Execute with Guardrails**:
   - Obey all constraints in [`ai/guardrails.md`](./guardrails.md).
   - Ensure cross-platform support (iOS, Android, Web).
   - Use design tokens from `@/constants/theme`.
3. **Synchronous Documentation Updates**:
   - If any change adds, moves, renames, or deletes code structure, routes, or components, you **MUST** update [`ai/architecture.md`](./architecture.md) and relevant `ai/*.md` files in the same turn.
4. **Strict Test-Driven Development (TDD)**:
   - You **MUST** practice robust Test-Driven Development. Never write business logic or UI components without writing the Jest / RNTL tests first.
5. **Validation**:
   - Check TypeScript integrity and ensure no syntax or typing errors are introduced. Run test suites (`npx jest`) to prove implementations.

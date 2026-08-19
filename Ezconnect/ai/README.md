# Ezconnect - AI & LLM Documentation Hub

Welcome to the AI & LLM development hub for **Ezconnect**. This folder contains strict guardrails, architectural blueprints, coding standards, and operating procedures designed to ensure that any AI coding assistant (Antigravity, Claude Code, Cursor, Copilot, ChatGPT, etc.) writes clean, idiomatic, and bug-free code matching the exact project setup.

---

## 🎯 Quick Project Snapshot

- **Project Name**: Ezconnect
- **Framework**: [Expo SDK ~57.0.14](https://docs.expo.dev/versions/v57.0.0/)
- **Core Runtime**: React 19.2.3, React Native 0.86.2
- **Routing**: Expo Router (~57.0.14) with typed routes enabled (`experiments.typedRoutes: true`) and React Compiler (`experiments.reactCompiler: true`)
- **Animation & UI**: React Native Reanimated 4.5.1, React Native Worklets 0.10.1, Expo Symbols, Expo Glass Effect, @expo/ui
- **Platforms**: iOS, Android, Web (Universal app)

---

## 📚 AI Documentation Map

All AI assistants **MUST** consult these documents before reading or modifying code:

| Document | Purpose |
| :--- | :--- |
| [**`PRD.md`**](../PRD.md) | **Product Requirements Document**: Vision, features, user flows, data model, and roadmap. |
| [**`ai/technical-solutions.md`**](./technical-solutions.md) | Deep-dive solutions to each technical challenge: audio, BLE, NFC, Whisper, search, and Expo prebuild architecture. |
| [**`ai/feasibility-analysis.md`**](./feasibility-analysis.md) | **Authoritative technical feasibility analysis** — every PRD feature assessed against real Android APIs and 2026 library states. Includes master verdict table, risk register, and confirmed impossibilities. Read before implementing any feature. |

### 🏗️ Implementation Specs (required reading before writing any feature code)

| Document | Purpose |
| :--- | :--- |
| [**`ai/data-schema.md`**](./data-schema.md) | **Drizzle ORM schema** — all table definitions, relations, FTS5 virtual tables, triggers, and DB initialization. Single source of truth for the database layer. |
| [**`ai/domain-types.md`**](./domain-types.md) | **TypeScript domain types** — canonical interfaces for Contact, Persona, Conversation, Event, BLE payloads, NFC vCard. All features import from `@/types/domain`. |
| [**`ai/screen-map.md`**](./screen-map.md) | **Full navigation tree** — every route, its purpose, what data it reads, what components it uses, tab config, and new component directory plan. |
| [**`ai/ble-protocol.md`**](./ble-protocol.md) | **BLE + NFC exchange protocol** — Service/Characteristic UUIDs, payload format, full exchange flow, error handling, permission strategy. |
| [**`ai/state-design.md`**](./state-design.md) | **Zustand store design** — all 5 stores (recording, share, permissions, persona, smart-link) with types, actions, and smart link engine algorithm. |
| [**`ai/ux-flows.md`**](./ux-flows.md) | **Complete UX flows** — onboarding, persona creation, BLE exchange, recording (all 3 triggers), smart link suggestion, search, and error recovery patterns. |
| [**`ai/architecture.md`**](./architecture.md) | Codebase directory structure, routing architecture, cross-platform conventions, and theming. |
| [**`ai/coding-standards.md`**](./coding-standards.md) | TypeScript patterns, React 19 / RN standards, Reanimated 4 worklets, and styling rules. |
| [**`ai/expo-v57-guide.md`**](./expo-v57-guide.md) | Expo SDK 57 specific APIs, breaking changes from older versions, and modern replacements. |
| [**`ai/documentation-maintenance.md`**](./documentation-maintenance.md) | **MANDATORY PROTOCOL**: Rules requiring immediate documentation updates whenever code structure changes. |
| [**`ai/workflows.md`**](./workflows.md) | Step-by-step guides for adding routes, building cross-platform components, testing, and linting. |
| [**`ai/agents.md`**](./agents.md) | General AI Agent behavioral rules and prompt instructions. |
| [**`ai/claude.md`**](./claude.md) | Claude-specific instructions and context references. |

---

## ⚡ Prime Directives for AI Assistants

> [!CAUTION]
> **Read Law 0 before anything else. It applies to every single documentation edit you make.**

0. **Law 0 — History Preservation (ABSOLUTE):** When editing any `ai/*.md` or `PRD.md`, you MUST **never silently overwrite or delete** existing content. Always preserve what was there before, annotate what changed and when, and explain WHY the change was made. A future LLM must be able to reconstruct the full decision history from the docs alone. Full rules and approved patterns: [**`ai/documentation-maintenance.md § Law 0`**](./documentation-maintenance.md).
1. **Expo SDK 57 & React 19 Strictness**: Always use Expo SDK 57 and React 19 APIs. Do NOT hallucinate legacy Expo APIs (such as deprecated `expo-status-bar` legacy wrappers, old Expo Router v2/v3 navigation patterns, or outdated splash screen functions). Check [**`ai/expo-v57-guide.md`**](./expo-v57-guide.md).
2. **Cross-Platform Parity**: Ezconnect targets iOS, Android, and Web. Native components and web components must be cleanly separated using `.web.tsx` platform extensions or `Platform.select()` when native modules (e.g. `expo-symbols`, `unstable-native-tabs`) have differing web behavior.
3. **Synchronous Documentation Updates**: You **must** update the relevant `ai/*.md` documentation in the same turn/commit whenever you introduce, rename, move, or delete routes, components, hooks, constants, or dependencies. See [**`ai/documentation-maintenance.md`**](./documentation-maintenance.md).
4. **Dependency Safety**: Never run arbitrary `npm install <package>`. Always use `npx expo install <package>` for Expo SDK compatibility.
5. **Type Safety**: Strictly type all props, state, navigation params, and returns. Never use `any` or suppress TypeScript errors without explicit justification.


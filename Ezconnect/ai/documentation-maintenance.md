# Documentation Maintenance & Synchronization Protocol

> [!CAUTION]
> **PRIME DIRECTIVE — NON-NEGOTIABLE FOR ALL AI AGENTS & DEVELOPERS:**
> Any modification to the codebase structure, routes, components, hooks, design tokens, or dependencies **MUST** be accompanied by immediate, synchronous updates to the documentation in `ai/` in the same turn/commit.

---

## 🔒 Law 0: History Preservation & Decision Clarity (ABSOLUTE — Cannot Be Overridden)

> [!CAUTION]
> This is the single most important rule in this entire documentation system.
> **Violating it is the primary cause of AI hallucination, context drift, and repeated mistakes across sessions.**

### The Rule

**When updating any `ai/*.md` or `PRD.md` file, you MUST NEVER silently overwrite, delete, or replace existing content.**

Instead, you must always:

1. **Preserve the old content** — do not delete what was there before.
2. **Add versioned annotations** — mark what changed, when it changed, and under what version.
3. **Document the decision** — record *what was originally assumed*, *what reality revealed*, and *what was decided instead*.
4. **Explain the why** — a future LLM or developer reading this doc must be able to understand the full reasoning chain without needing to talk to anyone.

---

### The Three Mandatory Elements for Every Documentation Change

Every time content in `ai/` or `PRD.md` changes, the update must contain all three of these elements:

#### ① What Was There Before
Preserve or summarize the previous assumption/design/decision. Use labels like:
- `Previously assumed (PRD v1.0.0):`
- `Original plan:`
- `Note (v1.0.0):`

#### ② What Is There Now
Clearly state the new decision/design. Use labels like:
- `Updated (v1.1.0, 2026-08-20):`
- `Replaced with:`
- `Decision:`

#### ③ Why It Changed
Explain the reasoning, constraint, or discovery that forced the change. Use labels like:
- `Why changed:`
- `Reality discovered:`
- `Rationale:`

---

### Approved Patterns for Preserving History

**Pattern A — Inline version note (for feature/spec changes):**
```markdown
- **BLE P2P Handshake** for bidirectional exchange.

  > **Note (v1.1.0, 2026-08-20):** Originally planned as "NFC / BLE P2P Handshake."
  > NFC P2P (Android Beam) was confirmed removed in Android 10 (API 29) — no workaround exists.
  > Replaced with BLE advertising + GATT for bidirectional exchange, and NFC HCE for one-way tap.
```

**Pattern B — Decision Log entry (for architectural decisions in PRD.md):**
```markdown
#### Decision 00X: [Title] → [Outcome]
- **Originally Assumed:** [what was planned]
- **Reality Discovered ([date]):** [what the research found]
- **Decision:** [what we chose]
- **Why:** [reasoning]
```

**Pattern C — Versioned section header (for new guardrails or architecture entries):**
```markdown
## New Section Title

> Added [date] after [reason/event].

[content]
```

**Pattern D — Deprecated vs. current table row:**
```markdown
| **[Old approach]** | **[New approach]** | **[Why changed — one sentence]** |
```

---

### What NEVER to Do

| ❌ Forbidden Action | ✅ Required Action |
| :--- | :--- |
| Silently rewrite a section without noting what changed | Add a version note or Decision Log entry |
| Delete a previous assumption because it was wrong | Keep it with a "Previously assumed:" label + correction |
| Replace a library name without explaining why | Add a row to the Decision Log or a `> Note (vX.X):` |
| Overwrite the PRD tech stack without versioning | Bump PRD version, update changelog header, add Decision Log entry |
| Update architecture without noting what the old structure was | Add `> Changed from X to Y on [date] because [reason]` |

---

## 🎯 Purpose

AI assistants rely heavily on documentation to understand project context. If code changes without documentation updates, subsequent AI turns and contributors will suffer from context drift, hallucinated APIs, and broken assumptions.

This document defines the strict protocol for keeping all documentation synchronized with the code.

---

## 📋 Synchronization Triggers & Responsibilities

Whenever you perform an action in the left column, you **MUST** update the corresponding document in the right column:

| Code / Project Change | Documentation File to Update | What to Update |
| :--- | :--- | :--- |
| **New Route / Screen Added** (`src/app/*`) | [`ai/architecture.md`](./architecture.md) | Add route path, purpose, layout nesting, and linked components. |
| **Route Renamed or Deleted** | [`ai/architecture.md`](./architecture.md) | Remove or update the route reference in the directory map. |
| **New Component Created** (`src/components/*`) | [`ai/architecture.md`](./architecture.md) & [`ai/coding-standards.md`](./coding-standards.md) | Document the component name, props, platform variants (`.web.tsx`), and usage example. |
| **New Hook Created** (`src/hooks/*`) | [`ai/architecture.md`](./architecture.md) | Document the hook signature, return values, and platform behaviors. |
| **Theme / Design Tokens Modified** (`src/constants/theme.ts`) | [`ai/architecture.md`](./architecture.md) & [`ai/coding-standards.md`](./coding-standards.md) | Update color keys, font tokens, or spacing definitions. |
| **Dependencies Added or Upgraded** (`package.json`) | [`ai/README.md`](./README.md) & [`ai/expo-v57-guide.md`](./expo-v57-guide.md) | Update package versions, configuration notes, and usage guidelines. |
| **New Architectural Pattern Introduced** | [`ai/architecture.md`](./architecture.md) & [`ai/guardrails.md`](./guardrails.md) | Document the pattern, rationale, and any new guardrails. |
| **New Scripts or Tooling Added** (`scripts/*`) | [`ai/workflows.md`](./workflows.md) | Document the script command, arguments, and expected behavior. |

---

## ✅ Pre-Completion Checklist for AI Assistants

Before marking any coding task complete or reporting back to the user, every AI assistant **MUST** execute this full checklist. **Do not skip any item.**

### Part A — History Preservation (Law 0 Compliance)
> These must be checked FIRST before anything else.

1. [ ] **Did I update any existing content in `ai/*.md` or `PRD.md`?**
   - If yes: Did I preserve the old content with a `Previously assumed:` / `Note (vX.X):` label?
   - If yes: Did I explain WHY it changed with a `Reality discovered:` / `Rationale:` label?
   - If yes: Did I use one of the four Approved Patterns (A, B, C, or D) from Law 0?
2. [ ] **Did I reverse, drop, or replace any previously documented decision?**
   - If yes: Is a new Decision Log entry added to `PRD.md § 4.3` with all three mandatory elements (Before / Now / Why)?
3. [ ] **Did I silently overwrite any section without versioning it?**
   - If yes: Go back and add version annotations. Silent overwrites are **not allowed**.

### Part B — Synchronization
4. [ ] **Did I add, delete, or rename any file in `src/`?**
   - If yes: Is `ai/architecture.md` updated to reflect the new structure?
5. [ ] **Did I introduce a new component, hook, or route?**
   - If yes: Is its API and purpose documented in `ai/architecture.md`?
6. [ ] **Did I alter any theme token, color, spacing, or styling convention?**
   - If yes: Are `ai/coding-standards.md` and `ai/architecture.md` up to date?
7. [ ] **Did I add or update any package dependency in `package.json`?**
   - If yes: Are `ai/README.md` and `ai/expo-v57-guide.md` updated?
8. [ ] **Did I discover that something is technically impossible or must be done differently?**
   - If yes: Is it added to `ai/guardrails.md § 6 — Confirmed Android Impossibilities`?
   - If yes: Is a Decision Log entry in `PRD.md § 4.3` explaining the original plan, the finding, and the replacement?
9. [ ] **Are all internal links in `ai/*.md` valid and pointing to existing files?**

---

## 🔍 How to Audit Documentation Freshness

Run through this audit periodically or when starting a major feature:

1. Compare `src/app/` against the Routing section in `ai/architecture.md`.
2. Compare `src/components/` against the Component section in `ai/architecture.md`.
3. Compare `src/hooks/` against the Hooks section in `ai/architecture.md`.
4. Check `package.json` dependencies against the versions listed in `ai/README.md`.
5. Check `PRD.md` version number — if code has changed significantly without a PRD version bump, the PRD is stale.
6. Scan `ai/*.md` for any content that contradicts the actual codebase — if found, do NOT silently fix it; add a versioned correction following Law 0.
7. If any discrepancies exist, resolve them immediately before writing new features.

---

## 📌 Quick Reference — The Four Laws

| Law | Rule | Severity |
| :--- | :--- | :--- |
| **Law 0** | Never delete or silently overwrite. Always version, annotate, and explain WHY. | 🔴 Absolute |
| **Law 1** | Update `ai/` docs in the same turn/commit as any code change. | 🔴 Absolute |
| **Law 2** | Every technical impossibility discovered must be added to `guardrails.md § 6` AND `PRD.md` Decision Log. | 🟠 Required |
| **Law 3** | Every new library, pattern, or architectural decision must be traceable — who decided it, when, and why. | 🟠 Required |


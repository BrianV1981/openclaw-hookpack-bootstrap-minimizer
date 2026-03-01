# Initialization Overhaul — Consolidated History

This document consolidates the legacy notes that previously lived under `initOvrhl/`.

## Background
The original "Initialization Overhaul" effort focused on reducing startup-token footprint and improving context compartmentalization for main vs sub-agents.

Legacy naming:
- Previous working folder: `initOvrhl` (deprecated)
- Preferred naming: `initialization-overhaul` (human-readable)

## Original Goals
- **Token-minimal startup:** load only necessary files at session start.
- **Compartmentalized agents:** builder/professor/ops/etc should receive their own bootstrap context.
- **Safe operation:** changes must be explicit, reversible, and verified.

## Original Observations (2026-02-24)
- Subagents were seeing root project context by default (`SOUL.md`, `USER.md`, `AGENTS.md`, `TOOLS.md`, `IDENTITY.md`).
- Subagents were not automatically seeing per-agent folder files unless explicitly injected.
- Relevant internal hooks were already enabled:
  - `hooks.internal.entries.boot-md`
  - `hooks.internal.entries.bootstrap-extra-files`

## Non-goals
- Do not commit secrets/tokens.
- Do not auto-load full session history.
- Do not break existing chat bindings/workflows.

## Legacy Roadmap Snapshot
### Phase 0 — Safety + Baseline
- Baseline startup context size and injected files.
- Keep rollback-ready config backups.
- Define files that should never be auto-injected.

### Phase 1 — Minimal Global Bootstrap (design)
Target minimal set:
- `SOUL.md`
- `USER.md`
- `IDENTITY.md`
- `memory/YYYY-MM-DD.md` (if present)

Avoid default auto-load of:
- `AGENTS.md`
- `TOOLS.md`
- `MEMORY.md`
- chat/session history
- prior tool outputs

### Phase 2 — Agent-Specific Bootstraps (design)
Per agent, define required files:
- `sub-agents/<agentId>/SOUL.md`
- `sub-agents/<agentId>/IDENTITY.md`
- `sub-agents/<agentId>/TOOLS.md`
- `sub-agents/<agentId>/USER.md`
- optional/minimal `sub-agents/<agentId>/HEARTBEAT.md`

### Phase 2.5 — Configurable wanted lists
- Support per-agent startup file lists through config for non-coder customization.

### Phase 3 — Hook/config implementation (gated)
- Identify hook ordering.
- Implement allowlists.
- Add deterministic routing.

### Phase 4 — Verification
- Measure token reduction.
- Confirm critical system functionality remains intact.
- Verify compartmentalization by agent role.

### Phase 5 — Operational docs
- Document onboarding for new agents.
- Provide safe-change checklist.

## Legacy Debug Papertrail Notes
- Goal: ensure subagents receive agent-folder bootstrap files instead of root defaults.
- Symptom observed: builder reported root bundle visibility and missed agent-folder context.
- Proposed debugging approach:
  - instrument `agent:bootstrap` payload
  - log final injected file list
  - run visibility validation by agent

## Current Status
This history is preserved for reference only. Active docs now live at project root:
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`

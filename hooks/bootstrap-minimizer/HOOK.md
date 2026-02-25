---
name: bootstrap-minimizer
description: "Replace bootstrap file injection list to enforce compartmentalization and reduce startup context."
homepage: https://github.com/d3c12yp7012/openclaw-hookpack-bootstrap-minimizer
metadata:
  {
    "openclaw": {
      "emoji": "🧬",
      "events": ["agent:bootstrap"],
      "requires": { "config": ["workspace.dir"] }
    }
  }
---

# bootstrap-minimizer

A workspace hook that rewrites the injected bootstrap file list during `agent:bootstrap`.

## What it does

### Main agent
For `agentId=main`, it injects only these root workspace bootstrap files:
- `SOUL.md`
- `USER.md`
- `IDENTITY.md`
- `AGENTS.md`
- `TOOLS.md`
- `HEARTBEAT.md`

### Subagents
For any non-main agent, it injects only the agent-folder bootstrap files:
- `workspace/<agentId>/SOUL.md`
- `workspace/<agentId>/TOOLS.md`
- `workspace/<agentId>/IDENTITY.md`
- `workspace/<agentId>/USER.md`
- `workspace/<agentId>/HEARTBEAT.md`

### Exclusions
Always excludes (by default):
- `MEMORY.md`
- `memory.md`

## Quickstart

### 1) Create per-agent bootstrap files

For each agent you want to compartmentalize, create a folder under your workspace named after the agent id.

Example:

```
workspace/
  helper-1/
    SOUL.md
    TOOLS.md
    IDENTITY.md
    USER.md
    HEARTBEAT.md
```

You can keep these files extremely small (even 1–5 lines each).

### 2) Enable the hook

```bash
openclaw hooks enable bootstrap-minimizer
openclaw gateway restart
```

### 3) Verify (optional)
Enable debug logging and inspect what files were injected.

## Customization

This hook is intentionally simple. To customize per-agent behavior, edit `handler.ts` and adjust the allowlists.

Common customizations:
- **Load only SOUL.md for one agent:** set the `wanted` list to `['SOUL.md']` for that `agentId`.
- **Load nothing for one agent:** set `wanted = []` for that `agentId` (the agent will run with no project context files injected).
- **Load root files for a specific agent:** set `wanted` to root files instead of `path.join(agentId, ...)`.

Tip (non-coders): you can think of this hook as a "startup packing list". Every agent can have its own packing list.

## Debug logging
Disabled by default.

If enabled via config, it writes JSONL debug entries to:
- `workspace/initOvrhl/bootstrap-minimizer.log.jsonl`


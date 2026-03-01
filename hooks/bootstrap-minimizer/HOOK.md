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
- `workspace/sub-agents/<agentId>/SOUL.md`
- `workspace/sub-agents/<agentId>/TOOLS.md`
- `workspace/sub-agents/<agentId>/IDENTITY.md`
- `workspace/sub-agents/<agentId>/USER.md`

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
  sub-agents/
    helper-1/
      SOUL.md
      TOOLS.md
      IDENTITY.md
      USER.md
```

You can keep these files extremely small (even 1–5 lines each).

### 2) Enable the hook

```bash
openclaw hooks enable bootstrap-minimizer
openclaw gateway restart
```

### 3) Verify (optional)
Enable debug logging and inspect what files were injected.

## Customization (config-first)

Use `openclaw.json` instead of editing code:

- `agentWanted`: basename mode per agent.
- `agentPaths`: explicit workspace-relative paths per agent (priority over `agentWanted`).
- `excludeNames`: filenames to always exclude.

Example:

```json
{
  "hooks": {
    "internal": {
      "entries": {
        "bootstrap-minimizer": {
          "enabled": true,
          "debug": false,
          "excludeNames": ["MEMORY.md", "memory.md"],
          "agentWanted": {
            "main": ["SOUL.md", "USER.md", "IDENTITY.md", "AGENTS.md", "TOOLS.md", "HEARTBEAT.md"],
            "helper-1": ["SOUL.md"],
            "helper-2": []
          },
          "agentPaths": {
            "helper-3": [
              "sub-agents/helper-3/SOUL.md",
              "sub-agents/helper-3/IDENTITY.md",
              "sub-agents/helper-3/RULES.md"
            ]
          }
        }
      }
    }
  }
}
```

## Debug logging
Disabled by default.

If enabled via config, it writes JSONL debug entries to:
- `workspace/debug/bootstrap-minimizer.log.jsonl`


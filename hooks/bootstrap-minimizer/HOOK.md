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

## Debug logging
Disabled by default.

If enabled via config, it writes JSONL debug entries to:
- `workspace/initOvrhl/bootstrap-minimizer.log.jsonl`


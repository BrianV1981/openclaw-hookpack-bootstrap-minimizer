# openclaw-hookpack-bootstrap-minimizer

OpenClaw hook pack that rewrites bootstrap file injection to:
- reduce startup context overhead
- enforce per-agent compartmentalized bootstraps (each agent loads its own `workspace/<agentId>/*.md` files)

## Install

From a local folder:

```bash
openclaw hooks install ./openclaw-hookpack-bootstrap-minimizer
```

Then enable the hook:

```bash
openclaw hooks enable bootstrap-minimizer
openclaw gateway restart
```

## Quickstart

### 1) Install + enable

```bash
openclaw hooks install ./openclaw-hookpack-bootstrap-minimizer
openclaw hooks enable bootstrap-minimizer
openclaw gateway restart
```

### 2) Create per-agent bootstrap files

For each agent you want compartmentalized, create:

```
workspace/
  <agentId>/
    SOUL.md
    TOOLS.md
    IDENTITY.md
    USER.md
    HEARTBEAT.md
```

Examples:

```
workspace/
  builder/...
  ops/...
  inbox/...
  inbox-youtube/...
  inbox-bookmarks/...
```

Minimal works. Even a 1-line `SOUL.md` is valid.

## Behavior (default)

### Main agent (`agentId=main`)
Injects only root:
- `SOUL.md`, `USER.md`, `IDENTITY.md`, `AGENTS.md`, `TOOLS.md`, `HEARTBEAT.md`

### Subagents
Injects only agent folder equivalents:
- `workspace/<agentId>/{SOUL,TOOLS,IDENTITY,USER,HEARTBEAT}.md`

### Exclusions
Always excluded:
- `MEMORY.md`
- `memory.md`

## Customization

This pack is intentionally small and hackable.

To customize what loads per agent, edit:
- `hooks/bootstrap-minimizer/handler.ts`

Common patterns:

- **Load only SOUL for a specific agent** (example: `reviewer`):
  - set `wanted = ['SOUL.md']`
- **Load nothing** (maximum token savings, but least guardrails):
  - set `wanted = []`
- **Mix root + agent files** (e.g., include root `USER.md` for every agent):
  - add another `mk(workspaceDir, 'USER.md', 'USER.md')` to `chosen`

Tip: keep the behavior deterministic and document your policy in your workspace.

## Configuration

Enable debug JSONL logging:

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "bootstrap-minimizer": {
          "enabled": true,
          "debug": true
        }
      }
    }
  }
}
```

Debug output:
- `workspace/initOvrhl/bootstrap-minimizer.log.jsonl`

## License
MIT

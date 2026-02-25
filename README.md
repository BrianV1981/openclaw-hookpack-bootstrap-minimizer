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

## Behavior

### Main agent (`agentId=main`)
Injects only:
- `SOUL.md`, `USER.md`, `IDENTITY.md`, `AGENTS.md`, `TOOLS.md`, `HEARTBEAT.md`

### Subagents
Injects only:
- `workspace/<agentId>/{SOUL,TOOLS,IDENTITY,USER,HEARTBEAT}.md`

### Exclusions
Always excluded:
- `MEMORY.md`
- `memory.md`

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

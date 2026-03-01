# 🧬 openclaw-hookpack-bootstrap-minimizer

**Make OpenClaw cheaper, cleaner, and smarter in 5 minutes.**

This hook controls what files each agent loads at startup.

That means you can:
- ✅ stop loading giant context files everywhere
- ✅ give each sub-agent its own tiny brain
- ✅ cut token burn on every run
- ✅ keep novice-friendly control via config (no code edits)

---

## The problem (in plain English)

By default, agents often start with too much context.
That costs tokens and causes confusion.

If all agents load the same files, your specialist agents become bloated and noisy.

---

## The fix

This hook rewires bootstrap file injection.

- **Main agent** gets your main files.
- **Sub-agents** get only their own folder files.
- You can configure all of it in `openclaw.json`.

---

## 60-second install

```bash
openclaw hooks install ./openclaw-hookpack-bootstrap-minimizer
openclaw hooks enable bootstrap-minimizer
openclaw gateway restart
```

---

## Folder layout (copy this)

```text
workspace/
  SOUL.md
  USER.md
  IDENTITY.md
  AGENTS.md
  TOOLS.md
  HEARTBEAT.md

  sub-agents/
    writer/
      SOUL.md
      IDENTITY.md
      TOOLS.md
      USER.md

    researcher/
      SOUL.md
      IDENTITY.md
```

---

## Super simple defaults

### Main agent loads:
- `SOUL.md`
- `USER.md`
- `IDENTITY.md`
- `AGENTS.md`
- `TOOLS.md`
- `HEARTBEAT.md`

### Sub-agents load:
- `sub-agents/<agentId>/SOUL.md`
- `sub-agents/<agentId>/TOOLS.md`
- `sub-agents/<agentId>/IDENTITY.md`
- `sub-agents/<agentId>/USER.md`

### Excluded by default:
- `MEMORY.md`
- `memory.md`

---

## No-code “dashboard” config

Put this in `openclaw.json`:

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "bootstrap-minimizer": {
          "enabled": true,
          "debug": false,

          "excludeNames": ["MEMORY.md", "memory.md"],

          "agentWanted": {
            "main": ["SOUL.md", "USER.md", "IDENTITY.md", "AGENTS.md", "TOOLS.md", "HEARTBEAT.md"],
            "writer": ["SOUL.md"],
            "researcher": ["SOUL.md", "IDENTITY.md"],
            "worker": []
          },

          "agentPaths": {
            "ops": [
              "sub-agents/ops/SOUL.md",
              "sub-agents/ops/IDENTITY.md",
              "sub-agents/ops/GUARDRAILS.md"
            ]
          }
        }
      }
    }
  }
}
```

---

## How config priority works

1. `agentPaths[agentId]` (exact paths) ← highest priority  
2. `agentWanted[agentId]` (simple filename list)  
3. built-in defaults

---

## Copy-paste recipes

### 1) “Soul only” agent
```json
"agentWanted": {
  "my-agent": ["SOUL.md"]
}
```

### 2) “No bootstrap files” worker
```json
"agentWanted": {
  "my-worker": []
}
```

### 3) “No tool guidance” agent
```json
"agentWanted": {
  "my-agent": ["SOUL.md", "IDENTITY.md", "USER.md"]
}
```

---

## Debug mode (optional)

Enable:

```json
"debug": true
```

Then inspect:
- `workspace/debug/bootstrap-minimizer.log.jsonl`

You’ll see exactly what files each agent got.

---

## Why people like this hook

- **Novice-friendly:** config-driven, no TypeScript edits required
- **Safer agents:** each sub-agent gets only relevant instructions
- **Cheaper runs:** less junk in startup context
- **Scales fast:** easy to add many specialized agents

---

## Who this is for

- Builders running multi-agent OpenClaw setups
- Teams trying to reduce token spend
- Anyone tired of “all agents load all the things”

If you can edit JSON, you can use this.

---

## License

MIT

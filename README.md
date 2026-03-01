# openclaw-hookpack-bootstrap-minimizer

Run a **team of AI agents** in OpenClaw where each agent can have its own:
- personality (SOUL)
- role/identity
- guardrails
- tool notes

…and crucially: **each agent only loads what it needs**, which can **dramatically reduce token usage** at startup and during long sessions.

This hook pack lets you:
- **stop auto-loading bulky workspace files** (or load only a small allowlist)
- **compartmentalize subagents** (so they don’t inherit your main agent’s entire brain)
- **keep context windows small** while still running many agents

---

## What problem does this solve?

By default, many setups end up injecting a large set of workspace files into every agent run.
That is convenient, but it’s expensive.

This hook rewrites the bootstrap file list during `agent:bootstrap` so you can:
- keep the **main agent** informed
- keep **subagents** narrowly scoped (cheaper + safer)

---

## Quickstart (non-coder friendly)

### Step 1) Install + enable

```bash
openclaw hooks install ./openclaw-hookpack-bootstrap-minimizer
openclaw hooks enable bootstrap-minimizer
openclaw gateway restart
```

### Step 2) Create a folder for each agent (optional but recommended)

Make a folder in your OpenClaw workspace for each agent id.
Use any names you want — the folder name must match the agent id.

Example layout:

```
workspace/
  SOUL.md
  USER.md
  IDENTITY.md
  AGENTS.md
  TOOLS.md
  HEARTBEAT.md

  sub-agents/
    helper-1/
      SOUL.md      (personality + guardrails)
      TOOLS.md     (tool usage notes)
      IDENTITY.md  (role)
      USER.md      (optional)

    helper-2/
      SOUL.md
```

Minimal works. A 1–5 line `SOUL.md` is valid.

### Step 3) Confirm it’s working

If a subagent is compartmentalized correctly, it should *not* know main-agent rules unless you put them in that subagent’s files.

---

## Default behavior (out of the box)

### Main agent (`agentId=main`)
Injects only these root workspace files:
- `SOUL.md`
- `USER.md`
- `IDENTITY.md`
- `AGENTS.md`
- `TOOLS.md`
- `HEARTBEAT.md`

### Subagents (any non-main agent)
Injects only the agent-folder equivalents:
- `workspace/sub-agents/<agentId>/SOUL.md`
- `workspace/sub-agents/<agentId>/TOOLS.md`
- `workspace/sub-agents/<agentId>/IDENTITY.md`
- `workspace/sub-agents/<agentId>/USER.md`

> `HEARTBEAT.md` is intentionally **not** injected for subagents by default.

### Always excluded
- `MEMORY.md`
- `memory.md`

---

## Configuration “dashboard” (no code edits required)

You can now customize per-agent bootstrap behavior directly in `openclaw.json`.

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "bootstrap-minimizer": {
          "enabled": true,
          "debug": true,

          "excludeNames": ["MEMORY.md", "memory.md"],

          "agentWanted": {
            "main": ["SOUL.md", "USER.md", "IDENTITY.md", "AGENTS.md", "TOOLS.md", "HEARTBEAT.md"],
            "helper-1": ["SOUL.md"],
            "helper-2": [],
            "helper-3": ["SOUL.md", "IDENTITY.md", "USER.md"]
          },

          "agentPaths": {
            "helper-4": [
              "sub-agents/helper-4/SOUL.md",
              "sub-agents/helper-4/IDENTITY.md",
              "sub-agents/helper-4/GUARDRAILS.md"
            ]
          }
        }
      }
    }
  }
}
```

### How it works

- `agentPaths[agentId]` (power mode) has highest priority.
  - Uses exact workspace-relative file paths.
- If no `agentPaths[agentId]`, then `agentWanted[agentId]` is used.
  - For `main`: names are resolved from workspace root.
  - For subagents: names are resolved from `workspace/sub-agents/<agentId>/`.
- If neither is set, hook defaults are used.

### Useful patterns

- **Load nothing:** `"helper-2": []`
- **Soul only:** `"helper-1": ["SOUL.md"]`
- **No tools guidance:** omit `TOOLS.md` from `agentWanted`.

### Debug log

If `debug: true`, JSONL logs are written to:
- `workspace/debug/bootstrap-minimizer.log.jsonl`

## License
MIT

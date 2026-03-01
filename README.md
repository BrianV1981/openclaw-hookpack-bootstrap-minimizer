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

## Customization (this is the whole point)

You can customize what loads per agent by editing:
- `hooks/bootstrap-minimizer/handler.ts`

### Examples

#### 1) Agent with **nothing** (maximum token savings)
Use for “dumb worker” agents that should only follow the task you give them.

- For that `agentId`, set:
  - `wanted = []`

#### 2) Agent with **just a SOUL** (guardrails + personality, no tools)
Use when you want strict boundaries but minimal baggage.

- For that `agentId`, set:
  - `wanted = ['SOUL.md']`

#### 3) Agent with the default loadout **minus TOOLS.md** (prevents tool instructions)
Use when you want the agent to have an identity/personality, but you do **not** want it to load tool guidance.

- For that `agentId`, set:
  - `wanted = ['SOUL.md', 'IDENTITY.md', 'USER.md']`

(Keep in mind: this removes tool *instructions* from its context; it doesn’t change platform-level tool permissions.)

---

## Configuration (optional)

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
- `workspace/debug/bootstrap-minimizer.log.jsonl`

## License
MIT

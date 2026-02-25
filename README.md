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
  main/            (your primary agent)
  helper-1/        (a specialist subagent)
  helper-2/        (another specialist)

  helper-1/
    SOUL.md        (personality + guardrails)
    TOOLS.md       (tool usage notes)
    IDENTITY.md    (role)
    USER.md        (optional)
    HEARTBEAT.md   (optional)
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
- `workspace/<agentId>/SOUL.md`
- `workspace/<agentId>/TOOLS.md`
- `workspace/<agentId>/IDENTITY.md`
- `workspace/<agentId>/USER.md`
- `workspace/<agentId>/HEARTBEAT.md`

### Always excluded
- `MEMORY.md`
- `memory.md`

---

## Customization (this is the whole point)

You can customize what loads per agent by editing:
- `hooks/bootstrap-minimizer/handler.ts`

### Examples

#### 1) Load *nothing* for a subagent (maximum token savings)
Good for “dumb worker” agents that only follow the task you give them.

- Set `wanted = []` for that `agentId`.

#### 2) Load only a SOUL for a subagent (personality + guardrails, nothing else)
Good for subagents that need strict boundaries but no extra baggage.

- Set `wanted = ['SOUL.md']` for that `agentId`.

#### 3) Let one subagent inherit main USER rules
If you want a helper agent to know the owner’s preferences, inject root `USER.md` in addition to its own files.

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
- `workspace/initOvrhl/bootstrap-minimizer.log.jsonl`

## License
MIT

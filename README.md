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

## Install (beginner-friendly, step-by-step)

If you're new to OpenClaw, follow this exactly.

### 1) Open a terminal in your OpenClaw workspace
Example path:

```bash
cd ~/.openclaw/workspace
```

### 2) Make sure the repo folder exists
You should have:

```text
~/.openclaw/workspace/openclaw-hookpack-bootstrap-minimizer
```

If not, clone/download the repo into your workspace first.

### 3) Install the hookpack into OpenClaw
Run this from `~/.openclaw/workspace`:

```bash
openclaw hooks install ./openclaw-hookpack-bootstrap-minimizer
```

What this does:
- Reads this repo
- Installs runtime hook files into OpenClaw’s hooks area
- Registers `bootstrap-minimizer`

### 4) Enable the hook

```bash
openclaw hooks enable bootstrap-minimizer
```

### 5) Restart OpenClaw gateway

```bash
openclaw gateway restart
```

### 6) Confirm it is active (recommended)

```bash
openclaw hooks info bootstrap-minimizer
```

You should see the hook listed as enabled with a valid path.

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

## No-code “dashboard” config (detailed multi-agent example)

Put this in `openclaw.json`:

### Scenario in plain English

You run a small multi-agent team:
- `main` = orchestrator (sees full operating context)
- `writer` = copy/content specialist
- `researcher` = fact finder
- `developer` = implementation/debug specialist
- `worker` = ultra-cheap utility subagent (no startup files)

This maps perfectly to a common setup where each specialist has its own direct Discord channel/thread binding.
Each channel can route to one agent identity, so every specialist stays focused with its own:
- persona (`SOUL.md`)
- role (`IDENTITY.md`)
- optional tool guidance (`TOOLS.md`)
- optional user constraints (`USER.md`)
- tool permissions (`openclaw.json` agent tool policy)

Why this setup works:
- You **exclude MEMORY files** from auto-injection to reduce token bloat and avoid stale/global memory spilling into every task.
- You keep specialist agents tight so they don't inherit unnecessary context.
- You use `agentPaths` for critical agents (`developer`) where exact file control matters.

```jsonc
{
  "hooks": {
    "internal": {
      "enabled": true, // internal hook engine on
      "entries": {
        "bootstrap-minimizer": {
          "enabled": true, // turn this hook on
          "debug": false, // true = write bootstrap decisions to debug log JSONL

          // File names to always exclude from injection, even if listed elsewhere.
          // Common choice: keep long-lived memory files out of every startup prompt.
          "excludeNames": ["MEMORY.md", "memory.md"],

          // EASY MODE: per-agent basename lists.
          // - For main: basenames resolve from workspace root.
          // - For sub-agents: basenames resolve from workspace/sub-agents/<agentId>/
          "agentWanted": {
            // Full context for orchestrator/main agent.
            "main": ["SOUL.md", "USER.md", "IDENTITY.md", "AGENTS.md", "TOOLS.md", "HEARTBEAT.md"],

            // Writer: persona only (simple + cheap).
            "writer": ["SOUL.md"],

            // Researcher: persona + role identity.
            "researcher": ["SOUL.md", "IDENTITY.md"],

            // Worker: load nothing at bootstrap (maximum token savings).
            "worker": []
          },

          // POWER MODE: exact relative paths (highest priority).
          // If an agent exists here, this overrides agentWanted for that same agent.
          "agentPaths": {
            "developer": [
              "sub-agents/developer/SOUL.md",       // behavior/personality
              "sub-agents/developer/IDENTITY.md",   // role boundaries
              "sub-agents/developer/GUARDRAILS.md"  // strict operating constraints
            ]
          }
        }
      }
    }
  }
}
```

### Why this multi-agent setup is better than “everyone loads everything”

If every agent loads `SOUL.md + USER.md + AGENTS.md + TOOLS.md + MEMORY.md`, you get:
- bigger startup prompts (higher token cost)
- more cross-contamination (agents acting outside role)
- more confusion (too many instructions for simple jobs)

This example avoids that:

- **`main`** loads the full control stack (`SOUL/USER/IDENTITY/AGENTS/TOOLS/HEARTBEAT`) because it orchestrates everything.
- **`writer`** loads only `SOUL.md` because it needs tone/style, not user policy, ops rules, or tool detail.
- **`researcher`** loads `SOUL.md + IDENTITY.md` so it stays in character and mission, without extra global baggage.
- **`worker`** loads nothing (`[]`) for pure low-cost execution tasks.
- **`developer`** uses `agentPaths` to force exact files (`SOUL`, `IDENTITY`, `GUARDRAILS`) for stricter safety.

So yes — your instinct is exactly right: some agents have **no reason** to load `USER.md`.
Only load what each agent truly needs.

---

## Important: bootstrap files are not tool permissions

This hook controls **startup context** only.
It does **not** hard-disable tools.

If you are spinning up lots of agents, or intentionally creating lower-guardrail agents for exploration, you should pair this hook with tool restrictions in `openclaw.json`.

### Where tool restrictions are configured

- Global: `tools.allow` / `tools.deny`
- Per-agent: `agents.list[].tools.*`
- Subagents: `tools.subagents.tools.*`

### Why this matters at scale

When you spin up many agents, two things can go wrong fast:
1. **Token explosion** from overloading startup files (this hook solves that)
2. **Capability explosion** from giving every agent every tool (OpenClaw config solves that)

Use both together:
- Keep context minimal per role (`agentWanted` / `agentPaths`)
- Keep capabilities minimal per role (`agents.list[].tools.deny`, profiles, allowlists)

### Example: cheap worker with no tools

```jsonc
{
  "agents": {
    "list": [
      {
        "id": "worker",
        "tools": {
          "profile": "minimal", // tiny baseline
          "deny": ["*"]          // hard block all tools
        }
      }
    ]
  }
}
```

### Practical guidance for lower-guardrail agents

If an agent is allowed to be more creative/loose in prompting, lock down tools harder.
That way experimentation stays in text-reasoning space instead of turning into risky actions.

A simple pattern:
- **creative agents**: minimal bootstrap + strict/no tools
- **ops/prod agents**: explicit guardrail files + tightly scoped tools
- **main orchestrator**: broader context + reviewed tool policy

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

## Official OpenClaw docs (highly recommended)

- OpenClaw docs home: https://docs.openclaw.ai
- Gateway configuration reference: https://docs.openclaw.ai/gateway/configuration-reference
- Multi-agent setup concepts: https://docs.openclaw.ai/concepts/multi-agent
- Multi-agent sandbox + tool restrictions: https://docs.openclaw.ai/tools/multi-agent-sandbox-tools
- Tool system overview (`tools.allow` / `tools.deny` / profiles): https://docs.openclaw.ai/tools
- Discord channel docs: https://docs.openclaw.ai/channels/discord
- OpenClaw GitHub repo: https://github.com/openclaw/openclaw

If you are doing per-agent Discord routing, read both:
1) multi-agent concepts, and
2) Discord channel configuration.

That combo is what unlocks the “one specialist per channel/thread” workflow.

---

## License

MIT

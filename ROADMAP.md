# Roadmap

## Next

### 1) Config-driven per-agent bootstraps (no code edits)
Make per-agent startup files configurable via `openclaw.json` so non-coders can:
- reduce token usage at startup
- give each subagent an independent identity (compartmentalized context)

#### Proposed config shape

- `agentWanted`: a simple per-agent list of basenames (easy mode)
- `agentPaths`: optional per-agent list of explicit relative paths (power mode)

```json
{
  "hooks": {
    "internal": {
      "entries": {
        "bootstrap-minimizer": {
          "enabled": true,
          "debug": false,

          "agentWanted": {
            "main": ["SOUL.md", "USER.md", "IDENTITY.md", "AGENTS.md", "TOOLS.md", "HEARTBEAT.md"],

            "helper-1": ["SOUL.md"],
            "helper-2": [],

            "helper-3": ["SOUL.md", "IDENTITY.md", "USER.md", "TOOLS.md"]
          },

          "agentPaths": {
            "helper-1": [
              "helper-1/IDENTITY.md",
              "helper-1/TOOLS.md",
              "helper-1/GUARDRAILS.md"
            ],
            "helper-2": [
              "helper-2/SOUL.md",
              "helper-2/IDENTITY.md",
              "helper-2/RULES.md"
            ]
          }
        }
      }
    }
  }
}
```

Notes:
- This design makes it obvious how to run agents with:
  - **nothing** (helper-2)
  - **just a soul** (helper-1)
  - **fuller identity + tools** (helper-3)
- `agentPaths` is how you can inject additional per-agent files (e.g., GUARDRAILS/RULES) without changing code.

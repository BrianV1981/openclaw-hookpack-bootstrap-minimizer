# Changelog

## 0.1.2
- Project cleanup + consolidation:
  - Removed legacy `initOvrhl/` project folder from repo root.
  - Consolidated legacy overhaul notes into `docs/INITIALIZATION_OVERHAUL_HISTORY.md`.
  - Updated debug log path to `workspace/debug/bootstrap-minimizer.log.jsonl` in code and docs.
  - Aligned docs with actual subagent path behavior: `workspace/sub-agents/<agentId>/...`.
  - Updated `.gitignore` to ignore `debug/` local artifacts.

## 0.1.1
- Subagent default bootstrap no longer injects `HEARTBEAT.md`.
- Docs: clarify “load nothing / soul only / default minus tools” patterns.

## 0.1.0
- Initial release: `bootstrap-minimizer` hook (agent:bootstrap)
  - Main: restricts injected bootstrap files to a fixed allowlist.
  - Subagents: injects `workspace/sub-agents/<agentId>/{SOUL,TOOLS,IDENTITY,USER}`.
  - Excludes `MEMORY.md` and `memory.md` by default.

# Changelog

## 0.1.1
- Subagent default bootstrap no longer injects `HEARTBEAT.md`.
- Docs: clarify “load nothing / soul only / default minus tools” patterns.

## 0.1.0
- Initial release: `bootstrap-minimizer` hook (agent:bootstrap)
  - Main: restricts injected bootstrap files to a fixed allowlist.
  - Subagents: injects `workspace/<agentId>/{SOUL,TOOLS,IDENTITY,USER}`.
  - Excludes `MEMORY.md` and `memory.md` by default.

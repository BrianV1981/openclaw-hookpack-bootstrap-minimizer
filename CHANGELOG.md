# Changelog

## 0.1.0
- Initial release: `bootstrap-minimizer` hook (agent:bootstrap)
  - Main: restricts injected bootstrap files to a fixed allowlist.
  - Subagents: injects `workspace/<agentId>/{SOUL,TOOLS,IDENTITY,USER,HEARTBEAT}`.
  - Excludes `MEMORY.md` and `memory.md` by default.

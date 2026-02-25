import { promises as fs } from 'fs';
import path from 'path';

function agentIdFromSessionKey(sessionKey?: string): string | null {
  // Typical format: agent:<agentId>:<rest>
  if (!sessionKey) return null;
  const parts = sessionKey.split(':');
  if (parts.length >= 2 && parts[0] === 'agent') return parts[1];
  return null;
}

async function readMaybe(filePath: string): Promise<{ content?: string; missing: boolean }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { content, missing: false };
  } catch {
    return { missing: true };
  }
}

async function mk(workspaceDir: string, relPath: string, nameOverride?: string) {
  const abs = path.join(workspaceDir, relPath);
  const { content, missing } = await readMaybe(abs);
  return {
    name: nameOverride ?? path.basename(relPath),
    path: abs,
    content,
    missing,
  };
}

export default async function handler(event: any) {
  // OpenClaw agent bootstrap events are shaped like:
  // { type: 'agent', action: 'bootstrap', context: { workspaceDir, sessionKey, bootstrapFiles, cfg, ... } }
  if (!event || event.type !== 'agent' || event.action !== 'bootstrap') return event;

  const context = event.context || {};
  const workspaceDir = context.workspaceDir || process.cwd();
  const sessionKey: string | undefined = context.sessionKey;
  const agentId = agentIdFromSessionKey(sessionKey) || 'main';

  const EXCLUDE = new Set(['MEMORY.md', 'memory.md']);

  let chosen: any[] = [];

  // Customize per-agent behavior here.
  // Examples:
  // - load only SOUL for one agent: const wanted = ['SOUL.md']
  // - load nothing for one agent: const wanted = []

  if (agentId === 'main') {
    const wanted = ['SOUL.md', 'USER.md', 'IDENTITY.md', 'AGENTS.md', 'TOOLS.md', 'HEARTBEAT.md'];
    const files = await Promise.all(wanted.map((n) => mk(workspaceDir, n, n)));
    chosen = files.filter((f) => !EXCLUDE.has(f.name));
  } else {
    // Subagents: default to a minimal, tool-capable personality/role loadout.
    // Note: HEARTBEAT.md is intentionally NOT loaded for subagents by default.
    const wanted = ['SOUL.md', 'TOOLS.md', 'IDENTITY.md', 'USER.md'];
    const files = await Promise.all(wanted.map((n) => mk(workspaceDir, path.join(agentId, n), n)));
    chosen = files.filter((f) => !EXCLUDE.has(f.name));
  }

  context.bootstrapFiles = chosen;

  // Optional debug logging
  const hookCfg = (context.cfg && context.cfg.hooks && context.cfg.hooks.internal && context.cfg.hooks.internal.entries && context.cfg.hooks.internal.entries['bootstrap-minimizer']) || {};
  const debug = !!hookCfg.debug;

  if (debug) {
    try {
      const logPath = path.join(workspaceDir, 'initOvrhl', 'bootstrap-minimizer.log.jsonl');
      const payload = {
        ts: new Date().toISOString(),
        sessionKey,
        agentId,
        workspaceDir,
        after: chosen.map((f) => ({ name: f.name, missing: !!f.missing, path: f.path })),
      };
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.appendFile(logPath, JSON.stringify(payload) + '\n', 'utf-8');
    } catch {
      // ignore
    }
  }

  return event;
}

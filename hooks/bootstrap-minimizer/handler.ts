import { promises as fs } from 'fs';
import path from 'path';

function agentIdFromSessionKey(sessionKey?: string): string | null {
  // Typical format: agent:<agentId>:<rest>
  if (!sessionKey) return null;
  const parts = sessionKey.split(':');
  if (parts.length >= 2 && parts[0] === 'agent') return parts[1];
  return null;
}

function getHookCfg(context: any): any {
  return (
    (context?.cfg &&
      context.cfg.hooks &&
      context.cfg.hooks.internal &&
      context.cfg.hooks.internal.entries &&
      context.cfg.hooks.internal.entries['bootstrap-minimizer']) ||
    {}
  );
}

async function readMaybe(filePath: string): Promise<{ content?: string; missing: boolean }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { content, missing: false };
  } catch {
    return { missing: true };
  }
}

function sanitizeRelPath(relPath: string): string | null {
  if (!relPath || typeof relPath !== 'string') return null;
  const normalized = path.normalize(relPath).replace(/\\/g, '/');
  if (path.isAbsolute(normalized)) return null;
  if (normalized.startsWith('../') || normalized === '..') return null;
  return normalized;
}

async function mk(workspaceDir: string, relPath: string, nameOverride?: string) {
  const safeRel = sanitizeRelPath(relPath);
  if (!safeRel) {
    return {
      name: nameOverride ?? path.basename(relPath || ''),
      path: path.join(workspaceDir, relPath || ''),
      missing: true,
      invalid: true,
    };
  }

  const abs = path.join(workspaceDir, safeRel);
  const { content, missing } = await readMaybe(abs);
  return {
    name: nameOverride ?? path.basename(safeRel),
    path: abs,
    content,
    missing,
  };
}

function uniqByPath(files: any[]): any[] {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const f of files) {
    if (!f?.path) continue;
    if (seen.has(f.path)) continue;
    seen.add(f.path);
    out.push(f);
  }
  return out;
}

export default async function handler(event: any) {
  // OpenClaw agent bootstrap events are shaped like:
  // { type: 'agent', action: 'bootstrap', context: { workspaceDir, sessionKey, bootstrapFiles, cfg, ... } }
  if (!event || event.type !== 'agent' || event.action !== 'bootstrap') return event;

  const context = event.context || {};
  const workspaceDir = context.workspaceDir || process.cwd();
  const sessionKey: string | undefined = context.sessionKey;
  const agentId = agentIdFromSessionKey(sessionKey) || 'main';

  const hookCfg = getHookCfg(context);

  const defaultMainWanted = ['SOUL.md', 'USER.md', 'IDENTITY.md', 'AGENTS.md', 'TOOLS.md', 'HEARTBEAT.md'];
  const defaultSubWanted = ['SOUL.md', 'TOOLS.md', 'IDENTITY.md', 'USER.md'];

  const configuredExclude = Array.isArray(hookCfg.excludeNames)
    ? hookCfg.excludeNames.filter((x: any) => typeof x === 'string')
    : ['MEMORY.md', 'memory.md'];

  const EXCLUDE = new Set(configuredExclude);

  // No-code dashboard options (openclaw.json):
  // - agentWanted: { [agentId]: string[] }  // basename mode
  // - agentPaths:  { [agentId]: string[] }  // explicit workspace-relative path mode
  const agentWanted = hookCfg.agentWanted && typeof hookCfg.agentWanted === 'object' ? hookCfg.agentWanted : {};
  const agentPaths = hookCfg.agentPaths && typeof hookCfg.agentPaths === 'object' ? hookCfg.agentPaths : {};

  const explicitPaths = Array.isArray(agentPaths[agentId]) ? agentPaths[agentId] : null;

  let chosen: any[] = [];
  let mode: 'agentPaths' | 'agentWanted' | 'defaults' = 'defaults';

  if (explicitPaths) {
    mode = 'agentPaths';
    const cleaned = explicitPaths.filter((x: any) => typeof x === 'string');
    const files = await Promise.all(cleaned.map((rel: string) => mk(workspaceDir, rel, path.basename(rel))));
    chosen = files.filter((f) => !EXCLUDE.has(f.name));
  } else {
    const wanted = Array.isArray(agentWanted[agentId])
      ? agentWanted[agentId].filter((x: any) => typeof x === 'string')
      : agentId === 'main'
      ? defaultMainWanted
      : defaultSubWanted;

    mode = Array.isArray(agentWanted[agentId]) ? 'agentWanted' : 'defaults';

    if (agentId === 'main') {
      const files = await Promise.all(wanted.map((n: string) => mk(workspaceDir, n, n)));
      chosen = files.filter((f) => !EXCLUDE.has(f.name));
    } else {
      const files = await Promise.all(
        wanted.map((n: string) => mk(workspaceDir, path.join('sub-agents', agentId, n), n)),
      );
      chosen = files.filter((f) => !EXCLUDE.has(f.name));
    }
  }

  context.bootstrapFiles = uniqByPath(chosen);

  // Optional debug logging
  const debug = !!hookCfg.debug;

  if (debug) {
    try {
      const logPath = path.join(workspaceDir, 'debug', 'bootstrap-minimizer.log.jsonl');
      const payload = {
        ts: new Date().toISOString(),
        sessionKey,
        agentId,
        mode,
        workspaceDir,
        excludeNames: [...EXCLUDE],
        after: context.bootstrapFiles.map((f: any) => ({
          name: f.name,
          missing: !!f.missing,
          invalid: !!f.invalid,
          path: f.path,
        })),
      };
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.appendFile(logPath, JSON.stringify(payload) + '\n', 'utf-8');
    } catch {
      // ignore
    }
  }

  return event;
}

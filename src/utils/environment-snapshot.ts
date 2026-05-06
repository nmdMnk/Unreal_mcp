import fs from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_SKYLIGHT_INTENSITY, DEFAULT_SUN_INTENSITY, DEFAULT_TIME_OF_DAY } from '../constants.js';
import type { StandardActionResponse } from '../types/tool-interfaces.js';

export function validateSnapshotPath(inputPath: unknown): { isValid: false; error: string } | { isValid: true; safePath: string } {
  if (!inputPath || typeof inputPath !== 'string') {
    return { isValid: false, error: 'Path is required' };
  }

  const trimmed = inputPath.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Path cannot be empty' };
  }

  if (/^[a-zA-Z]:[/\\]/.test(trimmed) || trimmed.includes(':')) {
    return { isValid: false, error: 'SECURITY_VIOLATION: Absolute paths with drive letters are not allowed' };
  }

  const normalized = path.normalize(trimmed);
  if (normalized.includes('..') || trimmed.includes('..')) {
    return { isValid: false, error: 'SECURITY_VIOLATION: Path traversal (..) is not allowed' };
  }

  const cwd = process.cwd();
  if (trimmed.startsWith('/')) {
    const systemPathPrefixes = ['/etc/', '/var/', '/usr/', '/bin/', '/sbin/', '/root/', '/home/', '/opt/', '/proc/', '/sys/', '/dev/', '/tmp/'];
    for (const prefix of systemPathPrefixes) {
      if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
        return { isValid: false, error: `SECURITY_VIOLATION: System directory paths (${prefix}) are not allowed` };
      }
    }

    const exactSystemPaths = ['/etc', '/var', '/usr', '/bin', '/sbin', '/root', '/home', '/opt', '/proc', '/sys', '/dev', '/tmp'];
    if (exactSystemPaths.some(sp => trimmed.toLowerCase() === sp.toLowerCase())) {
      return { isValid: false, error: 'SECURITY_VIOLATION: System directory paths are not allowed' };
    }

    const allowedUePaths = ['/Temp/', '/Saved/', '/Game/'];
    const isAllowedUePath = allowedUePaths.some(uePath =>
      trimmed.toLowerCase().startsWith(uePath.toLowerCase()) ||
      trimmed.toLowerCase() === uePath.slice(0, -1).toLowerCase()
    );

    if (!isAllowedUePath) {
      return { isValid: false, error: 'SECURITY_VIOLATION: Only UE project-relative paths (/Temp, /Saved, /Game) are allowed' };
    }

    let mappedPath: string;
    if (trimmed.toLowerCase().startsWith('/temp')) {
      mappedPath = path.join(cwd, 'temp', trimmed.slice(6));
    } else if (trimmed.toLowerCase().startsWith('/saved')) {
      mappedPath = path.join(cwd, 'Saved', trimmed.slice(7));
    } else if (trimmed.toLowerCase().startsWith('/game')) {
      mappedPath = path.join(cwd, 'Content', trimmed.slice(6));
    } else {
      return { isValid: false, error: 'SECURITY_VIOLATION: Unrecognized UE path' };
    }

    const finalPath = path.normalize(mappedPath);
    const cwdWithSep = cwd.endsWith(path.sep) ? cwd : cwd + path.sep;
    if (finalPath !== cwd && !finalPath.startsWith(cwdWithSep)) {
      return { isValid: false, error: 'SECURITY_VIOLATION: Path must be within the project directory' };
    }

    return { isValid: true, safePath: finalPath };
  }

  const resolvedPath = path.resolve(cwd, trimmed);
  const cwdWithSep = cwd.endsWith(path.sep) ? cwd : cwd + path.sep;
  if (resolvedPath !== cwd && !resolvedPath.startsWith(cwdWithSep)) {
    return { isValid: false, error: 'SECURITY_VIOLATION: Path must be within the project directory' };
  }

  return { isValid: true, safePath: resolvedPath };
}

function envNumber(name: string, fallback: number, allowNegative = true): number {
  const raw = process.env[name];
  if (raw !== undefined) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && (allowNegative || parsed >= 0)) {
      return parsed;
    }
  }
  return fallback;
}

function getSnapshotTarget(params: { path?: unknown; filename?: unknown }): { success: false; error: string } | { success: true; targetPath: string } {
  const rawPath = typeof params?.path === 'string' && params.path.trim().length > 0
    ? params.path.trim()
    : './tmp/unreal-mcp/env_snapshot.json';
  const rawFilename = typeof params?.filename === 'string' && params.filename.trim().length > 0
    ? params.filename.trim()
    : undefined;

  const basePathValidation = validateSnapshotPath(rawPath);
  if (!basePathValidation.isValid) {
    return { success: false, error: basePathValidation.error };
  }

  if (rawFilename) {
    if (rawFilename.includes('..') || rawFilename.includes('/') || rawFilename.includes('\\')) {
      return { success: false, error: 'SECURITY_VIOLATION: Filename cannot contain path separators or traversal' };
    }
    return { success: true, targetPath: path.join(basePathValidation.safePath, rawFilename) };
  }

  const hasExt = /\.[a-z0-9]+$/i.test(rawPath);
  return {
    success: true,
    targetPath: hasExt ? basePathValidation.safePath : path.join(basePathValidation.safePath, 'env_snapshot.json')
  };
}

export async function exportEnvironmentSnapshot(params: { path?: unknown; filename?: unknown }): Promise<StandardActionResponse> {
  try {
    const target = getSnapshotTarget(params);
    if (!target.success) {
      return target;
    }

    await fs.mkdir(path.dirname(target.targetPath), { recursive: true });
    const snapshot = {
      generatedAt: new Date().toISOString(),
      timeOfDay: envNumber('MCP_ENV_DEFAULT_TIME_OF_DAY', DEFAULT_TIME_OF_DAY),
      sunIntensity: envNumber('MCP_ENV_DEFAULT_SUN_INTENSITY', DEFAULT_SUN_INTENSITY, false),
      skylightIntensity: envNumber('MCP_ENV_DEFAULT_SKYLIGHT_INTENSITY', DEFAULT_SKYLIGHT_INTENSITY, false)
    };
    await fs.writeFile(target.targetPath, JSON.stringify(snapshot, null, 2), 'utf8');

    return {
      success: true,
      message: `Environment snapshot exported to ${target.targetPath}`,
      details: { path: target.targetPath }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to export environment snapshot: ${message}` };
  }
}

export async function importEnvironmentSnapshot(params: { path?: unknown; filename?: unknown }): Promise<StandardActionResponse> {
  const target = getSnapshotTarget(params);
  if (!target.success) {
    return target;
  }

  try {
    let parsed: Record<string, unknown> | undefined = undefined;
    try {
      const contents = await fs.readFile(target.targetPath, 'utf8');
      try {
        parsed = JSON.parse(contents) as Record<string, unknown>;
      } catch {
        parsed = undefined;
      }
    } catch (error: unknown) {
      const errObj = error as Record<string, unknown> | null;
      if (errObj && (errObj.code === 'ENOENT' || errObj.code === 'ENOTDIR')) {
        return {
          success: true,
          message: `Environment snapshot file not found at ${target.targetPath}; import treated as no-op`
        };
      }
      throw error;
    }

    return {
      success: true,
      message: `Environment snapshot import handled from ${target.targetPath}`,
      details: parsed && typeof parsed === 'object' ? parsed : undefined
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to import environment snapshot: ${message}` };
  }
}

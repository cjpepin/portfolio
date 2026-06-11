import fs from "node:fs";
import path from "node:path";

const PLACEHOLDER_VALUES = /^(example|changeme|replace|xxx|todo|placeholder)$/i;

export function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

export function projectEnvFilePaths(projectDir, options = {}) {
  const { repoRoot } = options;
  const files = [];

  if (repoRoot) {
    files.push(path.join(repoRoot, "apps/portfolio/.env"));
    files.push(path.join(repoRoot, "apps/portfolio/.env.local"));
  }

  files.push(path.join(projectDir, ".env"));
  files.push(path.join(projectDir, ".env.local"));

  return files;
}

export function loadProjectEnv(projectDir, options = {}) {
  const merged = {};

  for (const filePath of projectEnvFilePaths(projectDir, options)) {
    Object.assign(merged, parseEnvFile(filePath));
  }

  for (const [key, value] of Object.entries(merged)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }

  return merged;
}

export function firstDefined(env, keys) {
  for (const key of keys) {
    const fromProcess = process.env[key]?.trim();
    if (fromProcess) {
      return fromProcess;
    }

    const value = env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function extractProjectRefFromUrl(url) {
  if (!url) {
    return undefined;
  }

  const match = url.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match?.[1];
}

export function isPlaceholderValue(value) {
  if (!value) {
    return true;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  if (PLACEHOLDER_VALUES.test(trimmed)) {
    return true;
  }

  if (/^your[-_]/i.test(trimmed) || /your-(project|anon|service|publishable|demo)/i.test(trimmed)) {
    return true;
  }

  return false;
}

export function normalizeSupabaseUrl(url) {
  return url.replace(/\/+$/, "");
}

export async function validateSupabaseConnection(url, anonKey) {
  const normalizedUrl = normalizeSupabaseUrl(url);
  const healthUrl = `${normalizedUrl}/auth/v1/health`;

  let response;

  try {
    response = await fetch(healthUrl, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`
      }
    });
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not reach ${normalizedUrl} (${cause})`);
  }

  if (!response.ok) {
    throw new Error(
      `Supabase health check failed (${response.status} ${response.statusText}) for ${normalizedUrl}`
    );
  }

  return true;
}

export function assertRequiredEnv(label, env, keys) {
  const missing = keys.filter((key) => isPlaceholderValue(env[key]));

  if (missing.length > 0) {
    throw new Error(
      `${label}: missing or placeholder values for ${missing.join(", ")} in .env / .env.local`
    );
  }
}

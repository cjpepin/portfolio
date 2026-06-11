import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  firstDefined,
  loadProjectEnv,
  normalizeSupabaseUrl,
  projectEnvFilePaths
} from "../supabase-env.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function loadDemoUsers() {
  const filePath = path.join(repoRoot, "fixtures/demo-seed/demo-users.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveSupabaseAdmin(projectName) {
  const projectDir = path.join(repoRoot, "projects", projectName);
  const env = loadProjectEnv(projectDir, { repoRoot });

  const url = normalizeSupabaseUrl(
    firstDefined(env, ["SUPABASE_URL", "VITE_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_URL"])
  );
  const serviceRoleKey = firstDefined(env, ["SUPABASE_SERVICE_ROLE_KEY"]);

  if (!url || !serviceRoleKey) {
    const searched = projectEnvFilePaths(projectDir, { repoRoot }).filter((filePath) =>
      fs.existsSync(filePath)
    );
    const missing = [
      !url ? "SUPABASE_URL (or VITE_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL)" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null
    ].filter(Boolean);

    throw new Error(
      `${projectName}: missing ${missing.join(" and ")} for demo user seeding. ` +
        `Add them to projects/${projectName}/.env or apps/portfolio/.env. ` +
        `Loaded env files: ${searched.length > 0 ? searched.join(", ") : "(none found)"}`
    );
  }

  return { url, serviceRoleKey };
}

async function listUserById(url, serviceRoleKey, userId) {
  const response = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch user ${userId}: ${response.status} ${body}`);
  }

  return response.json();
}

async function createDemoUser(url, serviceRoleKey, user) {
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.user_metadata ?? {}
    })
  });

  if (response.ok) {
    return response.json();
  }

  const body = await response.text();

  if (response.status === 422 && body.includes("already")) {
    return listUserById(url, serviceRoleKey, user.id);
  }

  throw new Error(`Failed to create demo user ${user.email}: ${response.status} ${body}`);
}

/**
 * Ensure canonical demo auth users exist for a project Supabase instance.
 */
export async function ensureDemoUsersForProject(projectName, options = {}) {
  const { dryRun = false } = options;
  const { url, serviceRoleKey } = resolveSupabaseAdmin(projectName);
  const { users } = loadDemoUsers();
  const results = [];

  for (const user of users) {
    if (dryRun) {
      results.push({ id: user.id, email: user.email, action: "would-upsert" });
      continue;
    }

    const existing = await listUserById(url, serviceRoleKey, user.id);
    if (existing) {
      results.push({ id: user.id, email: user.email, action: "exists" });
      continue;
    }

    await createDemoUser(url, serviceRoleKey, user);
    results.push({ id: user.id, email: user.email, action: "created" });
  }

  return results;
}

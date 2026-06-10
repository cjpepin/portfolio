import fs from "node:fs";
import path from "node:path";

export const PROJECT_PROFILES = {
  lingoleaf: {
    label: "LingoLeaf (mobile)",
    supabaseDir: "supabase",
    urlKeys: ["EXPO_PUBLIC_SUPABASE_URL"],
    anonKeyKeys: ["EXPO_PUBLIC_SUPABASE_KEY"],
    serviceRoleKeys: ["SUPABASE_SERVICE_ROLE_KEY"],
    projectRefKeys: ["SUPABASE_PROJECT_REF"],
    dbPasswordKeys: ["SUPABASE_DB_PASSWORD"],
    seedFiles: ["supabase/demo/seed.sql"],
    deployFunctions: true,
    notes: [
      "Enable Auth → Providers → Anonymous sign-ins for the web demo.",
      "Create a private Storage bucket named general-library if you upload EPUBs."
    ]
  },
  "lingoleaf-web": {
    label: "LingoLeaf Web (forum / blog)",
    supabaseDir: "supabase",
    // Shared Supabase project: mobile migrations own schema_migrations history.
    migrationMode: "query",
    urlKeys: ["VITE_SUPABASE_URL", "SUPABASE_URL"],
    anonKeyKeys: ["VITE_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"],
    serviceRoleKeys: ["SUPABASE_SERVICE_ROLE_KEY"],
    projectRefKeys: ["SUPABASE_PROJECT_REF"],
    dbPasswordKeys: ["SUPABASE_DB_PASSWORD"],
    seedFiles: [],
    deployFunctions: false,
    notes: [
      "After migrations, expose the lingoleaf schema in Supabase → Settings → API → Exposed schemas.",
      "Seed a forum admin: insert into lingoleaf.forum_admins (user_id) values ('<auth-user-uuid>');",
      "Edge APIs for Turnstile/admin live in Cloudflare Pages Functions, not Supabase Edge Functions."
    ]
  },
  trellis: {
    label: "Trellis (desktop + web)",
    supabaseDir: "supabase",
    // Shared Supabase project: apply SQL via Management API (no DB password required).
    migrationMode: "query",
    urlKeys: ["SUPABASE_URL", "VITE_SUPABASE_URL"],
    anonKeyKeys: [
      "SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_ANON_KEY"
    ],
    serviceRoleKeys: ["SUPABASE_SERVICE_ROLE_KEY"],
    projectRefKeys: ["SUPABASE_PROJECT_REF"],
    dbPasswordKeys: ["SUPABASE_DB_PASSWORD"],
    seedFiles: [],
    deployFunctions: true,
    delegateScript: "scripts/supabase.mjs",
    notes: [
      "Enable Auth → Providers → Anonymous sign-ins for guest mode.",
      "Set Stripe and provider secrets via supabase secrets set (see projects/trellis/docs/supabase-dx.md)."
    ]
  }
};

export function listProjectNames() {
  return Object.keys(PROJECT_PROFILES);
}

export function resolveProjectProfile(name) {
  const profile = PROJECT_PROFILES[name];

  if (!profile) {
    throw new Error(
      `Unknown project "${name}". Expected one of: ${listProjectNames().join(", ")}`
    );
  }

  return profile;
}

export function listFunctionNames(projectDir, supabaseDirName = "supabase") {
  const functionsDir = path.join(projectDir, supabaseDirName, "functions");

  if (!fs.existsSync(functionsDir)) {
    return [];
  }

  return fs
    .readdirSync(functionsDir, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isDirectory() || entry.name.startsWith("_")) {
        return false;
      }

      const entrypoint = path.join(functionsDir, entry.name, "index.ts");
      return fs.existsSync(entrypoint);
    })
    .map((entry) => entry.name)
    .sort();
}

export function listMigrationNames(projectDir, supabaseDirName = "supabase") {
  const migrationsDir = path.join(projectDir, supabaseDirName, "migrations");

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();
}

/** Supabase records the leading numeric prefix as schema_migrations.version. */
export function extractMigrationVersion(fileName) {
  const match = fileName.match(/^(\d+)/);

  if (!match) {
    return fileName.split("_")[0];
  }

  return match[1];
}

/**
 * Preflight migration files before db push.
 * Catches duplicate version keys and SQL patterns that fail on hosted Supabase.
 */
export function validateMigrationFiles(projectDir, supabaseDirName = "supabase") {
  const migrationsDir = path.join(projectDir, supabaseDirName, "migrations");
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(migrationsDir)) {
    return { errors, warnings };
  }

  const fileNames = listMigrationNames(projectDir, supabaseDirName);
  const versionToFiles = new Map();

  for (const fileName of fileNames) {
    const version = extractMigrationVersion(fileName);

    if (!versionToFiles.has(version)) {
      versionToFiles.set(version, []);
    }

    versionToFiles.get(version).push(fileName);
  }

  for (const [version, files] of versionToFiles.entries()) {
    if (files.length > 1) {
      errors.push(
        `Duplicate migration version "${version}": ${files.join(", ")}. Rename so each file has a unique numeric prefix.`
      );
    }
  }

  const sortedFiles = [...fileNames].sort();
  for (let index = 1; index < sortedFiles.length; index += 1) {
    const previous = sortedFiles[index - 1];
    const current = sortedFiles[index];
    const previousVersion = Number.parseInt(extractMigrationVersion(previous), 10);
    const currentVersion = Number.parseInt(extractMigrationVersion(current), 10);

    if (
      Number.isFinite(previousVersion) &&
      Number.isFinite(currentVersion) &&
      currentVersion < previousVersion
    ) {
      warnings.push(
        `${current} (version ${currentVersion}) sorts after ${previous} (version ${previousVersion}) because migration filenames are ordered lexicographically. This can require db push --include-all on hosted databases.`
      );
    }
  }

  for (const fileName of fileNames) {
    const filePath = path.join(migrationsDir, fileName);
    const sql = fs.readFileSync(filePath, "utf8");

    if (/uuid_generate_v4\s*\(\s*\)/.test(sql)) {
      errors.push(
        `${fileName}: uses uuid_generate_v4() without schema qualification. On hosted Supabase use gen_random_uuid() instead.`
      );
    }

    if (/CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"uuid-ossp"/i.test(sql)) {
      warnings.push(
        `${fileName}: creates uuid-ossp extension; prefer gen_random_uuid() on hosted Supabase.`
      );
    }

    if (/INSERT\s+INTO\s+supabase_migrations\.schema_migrations/i.test(sql)) {
      errors.push(
        `${fileName}: manually inserts into supabase_migrations.schema_migrations. Remove those statements.`
      );
    }
  }

  return { errors, warnings };
}

export function listSeedFiles(projectDir, profile) {
  return (profile.seedFiles ?? [])
    .map((relativePath) => path.join(projectDir, relativePath))
    .filter((filePath) => fs.existsSync(filePath));
}

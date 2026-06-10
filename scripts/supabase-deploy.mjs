#!/usr/bin/env node
/**
 * Push local Supabase config (migrations, seeds, edge functions) from projects/*
 * to linked remote Supabase projects. Validates .env connectivity before deploy.
 *
 * Usage:
 *   node scripts/supabase-deploy.mjs --validate-only
 *   node scripts/supabase-deploy.mjs --project lingoleaf
 *   node scripts/supabase-deploy.mjs --project all
 *   node scripts/supabase-deploy.mjs --project trellis --skip-seed
 *   node scripts/supabase-deploy.mjs --project lingoleaf-web --dry-run
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  assertRequiredEnv,
  extractProjectRefFromUrl,
  firstDefined,
  isPlaceholderValue,
  loadProjectEnv,
  normalizeSupabaseUrl,
  validateSupabaseConnection
} from "./lib/supabase-env.mjs";
import {
  listFunctionNames,
  listMigrationNames,
  listProjectNames,
  listSeedFiles,
  resolveProjectProfile,
  validateMigrationFiles
} from "./lib/supabase-projects.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsRoot = path.join(repoRoot, "projects");

function printUsage() {
  console.log(`Usage: node scripts/supabase-deploy.mjs [options]

Options:
  --project <name|all>   Project to deploy (${listProjectNames().join(", ")}, all)
  --validate-only        Validate .env + remote connectivity only
  --dry-run              Print planned actions without running Supabase CLI
  --skip-migrations      Skip supabase db push
  --skip-seed            Skip seed SQL files
  --skip-functions       Skip edge function deploy
  --skip-link            Skip supabase link (use when already linked)
  --skip-secrets         Skip supabase secrets set
  --help                 Show this help
`);
}

function parseArgs(argv) {
  const options = {
    project: undefined,
    validateOnly: false,
    dryRun: false,
    skipMigrations: false,
    skipSeed: false,
    skipFunctions: false,
    skipLink: false,
    skipSecrets: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      case "--validate-only":
        options.validateOnly = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--skip-migrations":
        options.skipMigrations = true;
        break;
      case "--skip-seed":
        options.skipSeed = true;
        break;
      case "--skip-functions":
        options.skipFunctions = true;
        break;
      case "--skip-link":
        options.skipLink = true;
        break;
      case "--skip-secrets":
        options.skipSecrets = true;
        break;
      case "--project": {
        const value = argv[index + 1];

        if (!value) {
          throw new Error("--project requires a value");
        }

        options.project = value;
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.project) {
    throw new Error("Missing --project. Example: --project all");
  }

  return options;
}

function resolveTargetProjects(projectArg) {
  if (projectArg === "all") {
    return listProjectNames();
  }

  resolveProjectProfile(projectArg);
  return [projectArg];
}

function getSupabaseBinary() {
  return "supabase";
}

function runCommand(command, args, cwd, env = process.env, dryRun = false) {
  const printable = `${command} ${args.join(" ")}`;

  if (dryRun) {
    console.log(`  [dry-run] ${printable}`);
    return Promise.resolve();
  }

  console.log(`  > ${printable}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: "inherit"
    });

    child.on("error", (error) => {
      if (error?.code === "ENOENT") {
        reject(
          new Error(
            "Supabase CLI not found. Install with: brew install supabase/tap/supabase"
          )
        );
        return;
      }

      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} failed with exit code ${code ?? 1}`));
    });
  });
}

function resolveConnection(profile, env) {
  const url = firstDefined(env, profile.urlKeys);
  const anonKey = firstDefined(env, profile.anonKeyKeys);
  const serviceRoleKey = firstDefined(env, profile.serviceRoleKeys);
  const dbPassword = firstDefined(env, profile.dbPasswordKeys);
  const projectRef =
    firstDefined(env, profile.projectRefKeys) ?? extractProjectRefFromUrl(url);

  return {
    url: url ? normalizeSupabaseUrl(url) : undefined,
    anonKey,
    serviceRoleKey,
    dbPassword,
    projectRef
  };
}

async function validateProject(name, profile, options) {
  const projectDir = path.join(projectsRoot, name);
  const supabaseDir = path.join(projectDir, profile.supabaseDir);

  console.log(`\n=== ${profile.label} (${name}) ===`);

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  if (!fs.existsSync(supabaseDir)) {
    throw new Error(`Supabase directory not found: ${supabaseDir}`);
  }

  const env = loadProjectEnv(projectDir);
  assertRequiredEnv(profile.label, env, [
    ...profile.urlKeys.slice(0, 1),
    ...profile.anonKeyKeys.slice(0, 1)
  ]);

  const connection = resolveConnection(profile, env);

  if (!connection.url || isPlaceholderValue(connection.url)) {
    throw new Error(`${profile.label}: Supabase URL is missing or invalid`);
  }

  if (!connection.anonKey || isPlaceholderValue(connection.anonKey)) {
    throw new Error(`${profile.label}: anon/publishable key is missing or invalid`);
  }

  if (!connection.projectRef) {
    throw new Error(
      `${profile.label}: could not determine project ref. Set SUPABASE_PROJECT_REF or use a standard *.supabase.co URL`
    );
  }

  const migrations = listMigrationNames(projectDir, profile.supabaseDir);
  const migrationValidation = validateMigrationFiles(projectDir, profile.supabaseDir);
  const functions = profile.deployFunctions
    ? listFunctionNames(projectDir, profile.supabaseDir)
    : [];
  const seeds = listSeedFiles(projectDir, profile);

  console.log(`  URL: ${connection.url}`);
  console.log(`  Project ref: ${connection.projectRef}`);
  console.log(`  Migrations: ${migrations.length}`);
  console.log(`  Seed files: ${seeds.length}`);
  console.log(`  Edge functions: ${functions.length}`);
  console.log(`  DB password: ${connection.dbPassword ? "set" : "not set (required for db push)"}`);
  if (profile.migrationMode === "query") {
    console.log("  Migration mode: query (db query --linked; DB password not required for migrations)");
  }

  console.log("  Checking remote connectivity...");
  await validateSupabaseConnection(connection.url, connection.anonKey);
  console.log("  Remote connectivity: OK");

  if (migrationValidation.warnings.length > 0) {
    console.warn("  Migration warnings:");

    for (const warning of migrationValidation.warnings) {
      console.warn(`    - ${warning}`);
    }
  }

  if (migrationValidation.errors.length > 0) {
    console.error("  Migration validation failed:");

    for (const error of migrationValidation.errors) {
      console.error(`    - ${error}`);
    }

    throw new Error(`${profile.label}: migration validation failed (${migrationValidation.errors.length} issue(s))`);
  }

  console.log("  Migration files: OK");

  if (!options.validateOnly && !options.skipMigrations && !connection.dbPassword) {
    console.warn(
      "  Warning: SUPABASE_DB_PASSWORD is not set. supabase db push may fail unless the project is already linked with saved credentials."
    );
  }

  return {
    name,
    profile,
    projectDir,
    env,
    connection,
    migrations,
    functions,
    seeds
  };
}

async function ensureLinked(projectState, options) {
  if (options.skipLink) {
    return;
  }

  const args = ["link", "--project-ref", projectState.connection.projectRef];

  if (projectState.connection.dbPassword) {
    args.push("--password", projectState.connection.dbPassword);
  }

  await runCommand(getSupabaseBinary(), args, projectState.projectDir, process.env, options.dryRun);
}

async function pushMigrations(projectState, options) {
  if (options.skipMigrations || projectState.migrations.length === 0) {
    return;
  }

  if (projectState.profile.migrationMode === "query") {
    const migrationsDir = path.join(
      projectState.projectDir,
      projectState.profile.supabaseDir,
      "migrations"
    );

    for (const migrationFile of projectState.migrations) {
      await runCommand(
        getSupabaseBinary(),
        ["db", "query", "--linked", "--file", path.join(migrationsDir, migrationFile)],
        projectState.projectDir,
        process.env,
        options.dryRun
      );
    }

    return;
  }

  const args = ["db", "push", "--include-all"];

  if (projectState.connection.dbPassword) {
    args.push("--password", projectState.connection.dbPassword);
  }

  await runCommand(getSupabaseBinary(), args, projectState.projectDir, process.env, options.dryRun);
}

async function applySeeds(projectState, options) {
  if (options.skipSeed || projectState.seeds.length === 0) {
    return;
  }

  for (const seedFile of projectState.seeds) {
    await runCommand(
      getSupabaseBinary(),
      ["db", "query", "--linked", "--file", seedFile],
      projectState.projectDir,
      process.env,
      options.dryRun
    );
  }
}

async function deployFunctions(projectState, options) {
  if (options.skipFunctions || !projectState.profile.deployFunctions) {
    return;
  }

  if (projectState.functions.length === 0) {
    console.log("  No edge functions to deploy.");
    return;
  }

  for (const functionName of projectState.functions) {
    await runCommand(
      getSupabaseBinary(),
      ["functions", "deploy", functionName, "--project-ref", projectState.connection.projectRef],
      projectState.projectDir,
      process.env,
      options.dryRun
    );
  }
}

function collectLingoleafSecrets(env, connection) {
  const secrets = {};

  if (!isPlaceholderValue(env.GOOGLE_TRANSLATE_API_KEY)) {
    secrets.GOOGLE_TRANSLATE_API_KEY = env.GOOGLE_TRANSLATE_API_KEY;
  }

  if (!isPlaceholderValue(env.OPENAI_API_KEY)) {
    secrets.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  if (!isPlaceholderValue(env.OPENAI_MODEL)) {
    secrets.OPENAI_MODEL = env.OPENAI_MODEL;
  }

  if (!isPlaceholderValue(env.REVENUECAT_SECRET_API_KEY)) {
    secrets.REVENUECAT_SECRET_API_KEY = env.REVENUECAT_SECRET_API_KEY;
  }

  if (!isPlaceholderValue(env.REVENUECAT_WEBHOOK_AUTH_HEADER)) {
    secrets.REVENUECAT_WEBHOOK_AUTH_HEADER = env.REVENUECAT_WEBHOOK_AUTH_HEADER;
  }

  if (connection.url) {
    secrets.SUPABASE_URL = connection.url;
  }

  if (!isPlaceholderValue(connection.serviceRoleKey)) {
    secrets.SUPABASE_SERVICE_ROLE_KEY = connection.serviceRoleKey;
  }

  if (!isPlaceholderValue(connection.anonKey)) {
    secrets.SUPABASE_ANON_KEY = connection.anonKey;
  }

  return secrets;
}

async function setSecrets(projectState, options) {
  if (options.skipSecrets) {
    return;
  }

  const entries = Object.entries(collectLingoleafSecrets(projectState.env, projectState.connection));

  if (entries.length === 0) {
    console.log("  No secrets to set from .env");
    return;
  }

  const args = ["secrets", "set", ...entries.map(([key, value]) => `${key}=${value}`)];

  await runCommand(getSupabaseBinary(), args, projectState.projectDir, process.env, options.dryRun);
}

async function deployViaDelegate(projectState, options) {
  const delegatePath = path.join(projectState.projectDir, projectState.profile.delegateScript);

  if (!fs.existsSync(delegatePath)) {
    throw new Error(`Delegate script not found: ${delegatePath}`);
  }

  const args = [delegatePath, "backend:deploy"];

  if (options.skipMigrations) {
    args.push("--skip-db");
  }

  if (options.skipFunctions) {
    args.push("--skip-functions");
  }

  if (options.dryRun) {
    console.log(`  [dry-run] node ${args.join(" ")}`);
    return;
  }

  const delegateEnv = { ...process.env };

  if (projectState.profile.migrationMode) {
    delegateEnv.SUPABASE_MIGRATION_MODE = projectState.profile.migrationMode;
  }

  console.log(`  > node ${args.join(" ")}`);

  await runCommand(process.execPath, args, projectState.projectDir, delegateEnv, false);
}

async function deployProject(projectState, options) {
  if (options.validateOnly) {
    return;
  }

  console.log("\nDeploy steps:");

  if (projectState.profile.delegateScript) {
    await deployViaDelegate(projectState, options);
    return;
  }

  await ensureLinked(projectState, options);
  await pushMigrations(projectState, options);
  await applySeeds(projectState, options);
  await deployFunctions(projectState, options);

  if (projectState.name === "lingoleaf") {
    await setSecrets(projectState, options);
  }

  if (projectState.profile.notes?.length) {
    console.log("\nManual follow-ups:");
    for (const note of projectState.profile.notes) {
      console.log(`  - ${note}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targets = resolveTargetProjects(options.project);
  const results = [];

  if (!fs.existsSync(projectsRoot)) {
    throw new Error(`Projects directory not found: ${projectsRoot}`);
  }

  console.log("Portfolio Supabase deploy");
  console.log(`Repo root: ${repoRoot}`);
  console.log(`Targets: ${targets.join(", ")}`);

  for (const name of targets) {
    const profile = resolveProjectProfile(name);
    const projectState = await validateProject(name, profile, options);
    results.push(projectState);

    if (!options.validateOnly) {
      await deployProject(projectState, options);
    }
  }

  console.log("\nSummary");
  console.log("-------");

  for (const result of results) {
    console.log(
      `  ${result.name}: ${options.validateOnly ? "validated" : options.dryRun ? "planned" : "deployed"} (${result.connection.projectRef})`
    );
  }

  if (options.validateOnly) {
    console.log("\nValidation complete. Re-run without --validate-only to deploy.");
  }
}

main().catch((error) => {
  console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

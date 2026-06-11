#!/usr/bin/env node
/**
 * Generate and/or apply demo seed data for portfolio subprojects.
 *
 * Usage:
 *   node scripts/seed-demo.mjs --target all
 *   node scripts/seed-demo.mjs --target fixtures
 *   node scripts/seed-demo.mjs --target supabase --project lingoleaf
 *   node scripts/seed-demo.mjs --target supabase --project all --dry-run
 */

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { ensureDemoUsersForProject } from "./lib/demo-seed/ensure-demo-users.mjs";
import { generateAllFixtures } from "./lib/demo-seed/generate-fixtures.mjs";
import { loadProjectEnv } from "./lib/supabase-env.mjs";
import { listProjectNames, listSeedFiles, resolveProjectProfile } from "./lib/supabase-projects.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsRoot = path.join(repoRoot, "projects");

const PROJECTS_WITH_AUTH_USERS = new Set(["lingoleaf", "lingoleaf-web", "trellis"]);

function printUsage() {
  console.log(`Usage: node scripts/seed-demo.mjs [options]

Options:
  --target <fixtures|supabase|all>   What to run (default: all)
  --project <name|all>             Supabase project (${listProjectNames().join(", ")}, all)
  --dry-run                        Print actions without writing/applying
  --skip-users                     Skip demo auth user creation
  --help                           Show this help
`);
}

function parseArgs(argv) {
  const options = {
    target: "all",
    project: "all",
    dryRun: false,
    skipUsers: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      case "--target": {
        const value = argv[index + 1];
        if (!value) throw new Error("--target requires a value");
        options.target = value;
        index += 1;
        break;
      }
      case "--project": {
        const value = argv[index + 1];
        if (!value) throw new Error("--project requires a value");
        options.project = value;
        index += 1;
        break;
      }
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--skip-users":
        options.skipUsers = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
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

function runCommand(command, args, cwd, dryRun = false) {
  const printable = `${command} ${args.join(" ")}`;
  if (dryRun) {
    console.log(`  [dry-run] ${printable}`);
    return Promise.resolve();
  }

  console.log(`  > ${printable}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: process.env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} failed with exit code ${code ?? 1}`));
    });
  });
}

async function runFixtures(options) {
  if (options.dryRun) {
    console.log("[fixtures] Would regenerate client JSON + supabase/demo/seed.sql from fixtures/demo-seed/");
    return;
  }

  const outputs = generateAllFixtures();
  console.log("[fixtures] Regenerated:");
  for (const output of outputs) {
    console.log(`  - ${path.relative(repoRoot, output)}`);
  }
}

async function seedSupabaseProject(projectName, options) {
  const profile = resolveProjectProfile(projectName);
  const projectDir = path.join(projectsRoot, projectName);
  const seeds = listSeedFiles(projectDir, profile);

  console.log(`\n[supabase:${projectName}]`);

  if (seeds.length === 0) {
    console.log("  No seed files configured; skipping.");
    return;
  }

  loadProjectEnv(projectDir, { repoRoot });

  if (!options.skipUsers && PROJECTS_WITH_AUTH_USERS.has(projectName)) {
    const userResults = await ensureDemoUsersForProject(projectName, { dryRun: options.dryRun });
    for (const result of userResults) {
      console.log(`  demo user ${result.email}: ${result.action}`);
    }
  }

  for (const seedFile of seeds) {
    await runCommand(
      "supabase",
      ["db", "query", "--linked", "--file", seedFile],
      projectDir,
      options.dryRun
    );
  }
}

async function runSupabase(options) {
  const projects = resolveTargetProjects(options.project);
  for (const projectName of projects) {
    await seedSupabaseProject(projectName, options);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.target === "fixtures" || options.target === "all") {
    await runFixtures(options);
  }

  if (options.target === "supabase" || options.target === "all") {
    await runSupabase(options);
  }

  console.log("\nDemo seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

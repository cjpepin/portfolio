#!/usr/bin/env node
/**
 * Deploy the portfolio Astro build to Cloudflare Pages.
 * Must run wrangler from apps/portfolio (not the monorepo root).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const portfolioDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps",
  "portfolio"
);

const result = spawnSync(
  "npx",
  ["--yes", "wrangler@4", "pages", "deploy", "dist"],
  {
    cwd: portfolioDir,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32"
  }
);

process.exit(result.status ?? 1);

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

const projectName =
  process.env.CF_PAGES_PROJECT_NAME ??
  process.env.CLOUDFLARE_PAGES_PROJECT_NAME ??
  process.env.PAGES_PROJECT_NAME;

if (!projectName) {
  console.error(
    [
      "Missing Cloudflare Pages project name.",
      "",
      "In Cloudflare Dashboard → Workers & Pages → your project → Settings → Environment variables,",
      "add CF_PAGES_PROJECT_NAME set to the exact project name shown on the project Overview tab",
      "(not the custom domain — the Pages project slug, e.g. portfolio-monorepo).",
      "",
      "Then redeploy."
    ].join("\n")
  );
  process.exit(1);
}

const args = [
  "--yes",
  "wrangler@4",
  "pages",
  "deploy",
  "dist",
  "--project-name",
  projectName
];

const result = spawnSync("npx", args, {
  cwd: portfolioDir,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32"
});

process.exit(result.status ?? 1);

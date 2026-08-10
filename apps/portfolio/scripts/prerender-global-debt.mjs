#!/usr/bin/env node
/**
 * Render Global//Debt index.html from the vinext worker build for static hosting.
 */
import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const portfolioRoot = resolve(scriptDir, "..");
const monorepoRoot = resolve(portfolioRoot, "../..");
const sourceRoot = resolve(monorepoRoot, "projects/global-debt");
const targetRoot = resolve(portfolioRoot, "public/global-debt/app");
const basePath = process.env.GLOBAL_DEBT_BASE_PATH ?? "/global-debt/app";
const appUrl = new URL(`${basePath}/`, "http://localhost");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function renderIndexHtml() {
  const workerPath = new URL(
    join(sourceRoot, "dist/server/index.js"),
    import.meta.url,
  );
  workerPath.searchParams.set("sync", String(Date.now()));
  const { default: worker } = await import(workerPath.href);

  const clientRoot = join(sourceRoot, "dist/client");
  const contentTypes = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".woff2": "font/woff2",
  };

  const response = await worker.fetch(
    new Request(appUrl, { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async (request) => {
          const pathname = new URL(request.url).pathname;
          const relativePath = pathname.startsWith(basePath)
            ? pathname.slice(basePath.length)
            : pathname;
          const filePath = join(clientRoot, relativePath);
          try {
            const data = await readFile(filePath);
            const type = contentTypes[extname(filePath)] ?? "application/octet-stream";
            return new Response(data, { headers: { "content-type": type } });
          } catch {
            return new Response("Not found", { status: 404 });
          }
        },
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to render Global//Debt HTML (${response.status})`);
  }

  const html = await response.text();
  return html.replace(
    /href="\/assets\/_vinext_fonts\//g,
    `href="${basePath}/assets/_vinext_fonts/`,
  );
}

async function copyClientAssets() {
  const clientRoot = join(sourceRoot, "dist/client");
  if (!(await exists(clientRoot))) {
    throw new Error(`Missing client build at ${clientRoot}`);
  }

  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });
  await cp(clientRoot, targetRoot, { recursive: true });
}

async function main() {
  const html = await renderIndexHtml();
  await copyClientAssets();
  await writeFile(join(targetRoot, "index.html"), html, "utf8");

  if (!html.includes(`${basePath}/assets/`)) {
    throw new Error(
      `Rendered HTML is missing ${basePath}/assets/ paths. Check projects/global-debt/next.config.ts basePath.`,
    );
  }

  console.log(`Synced Global//Debt to ${targetRoot}`);
  console.log(`  app: ${basePath}/`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

/**
 * Astro dev does not run Cloudflare Pages Functions. This plugin serves
 * functions/api routes during astro dev (e.g. /api/demo/epub).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadDevVars() {
  const env = { ...process.env };

  for (const filename of [".env", ".dev.vars"]) {
    const path = join(ROOT, filename);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (filename === ".env" && env[key] !== undefined) continue;
      env[key] = value;
    }
  }

  return env;
}

function handlerName(method) {
  if (!method) return null;
  const normalized = method.toUpperCase();
  return `onRequest${normalized.charAt(0)}${normalized.slice(1).toLowerCase()}`;
}

async function nodeRequestToFetch(req, url) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(key, entry);
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method ?? "GET";
  let body = undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }

  return new Request(url, { method, headers, body });
}

async function sendFetchResponse(res, response) {
  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function pagesFunctionsDevPlugin() {
  const env = loadDevVars();

  return {
    name: "portfolio-pages-functions-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? "";
        const pathname = rawUrl.split("?")[0] ?? "";
        if (!pathname.startsWith("/api/")) {
          return next();
        }

        const functionRel = pathname.replace(/^\//, "");
        const modulePath = join(ROOT, "functions", `${functionRel}.ts`);
        if (!existsSync(modulePath)) {
          return next();
        }

        const handlerKey = handlerName(req.method ?? "GET");
        if (!handlerKey) {
          return next();
        }

        try {
          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod[handlerKey];
          if (!handler) {
            return next();
          }

          const host = req.headers.host ?? "localhost:4321";
          const request = await nodeRequestToFetch(req, `http://${host}${rawUrl}`);
          const response = await handler({ request, env });
          await sendFetchResponse(res, response);
        } catch (error) {
          console.error(`[pages-functions-dev] ${pathname}`, error);
          next(error);
        }
      });
    },
  };
}

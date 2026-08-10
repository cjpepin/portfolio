import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { pagesFunctionsDevPlugin } from "./vite/pages-functions-dev.mjs";

/** lingoleaf-web Vite dev server (see projects/lingoleaf-web/vite.config.ts). */
const LINGOLEAF_WEB_DEV = process.env.LINGOLEAF_WEB_DEV_URL ?? "http://localhost:8080";

/**
 * Shells/IDEs sometimes export NODE_ENV=production. That makes Vite pre-bundle
 * production React while @vitejs/plugin-react still emits jsxDEV, which breaks
 * island hydration (jsxDEV is undefined in react-jsx-dev-runtime.production).
 */
function forceReactDevelopmentMode() {
  return {
    name: "portfolio-force-react-development-mode",
    config(_config, { command }) {
      if (command !== "serve") return;
      return {
        define: {
          "process.env.NODE_ENV": JSON.stringify("development"),
        },
        optimizeDeps: {
          esbuildOptions: {
            define: {
              "process.env.NODE_ENV": '"development"',
            },
          },
        },
      };
    },
  };
}

function lingoleafProxyPath(path) {
  const qIndex = path.indexOf("?");
  const pathname = qIndex === -1 ? path : path.slice(0, qIndex);
  const search = qIndex === -1 ? "" : path.slice(qIndex);
  if (pathname === "/lingoleaf") {
    return `/lingoleaf/${search}`;
  }
  return path;
}

/** Cloudflare Pages serves index.html for public/ directory URLs; Vite dev does not by default. */
function servePublicDirectoryIndex() {
  return {
    name: "portfolio-public-directory-index",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url || (req.method !== "GET" && req.method !== "HEAD")) {
          next();
          return;
        }
        const qIndex = req.url.indexOf("?");
        const pathname = qIndex === -1 ? req.url : req.url.slice(0, qIndex);
        const search = qIndex === -1 ? "" : req.url.slice(qIndex);
        if (pathname.endsWith("/") && pathname.length > 1) {
          req.url = `${pathname}index.html${search}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  output: "static",
  site: "https://connorjpepin.com",
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  vite: {
    plugins: [forceReactDevelopmentMode(), servePublicDirectoryIndex(), pagesFunctionsDevPlugin()],
    build: {
      cssMinify: true,
    },
    server: {
      proxy: {
        "/lingoleaf": {
          target: LINGOLEAF_WEB_DEV,
          changeOrigin: true,
          ws: true,
          rewrite: lingoleafProxyPath,
          bypass(req) {
            const pathname = (req.url ?? "").split("?")[0] ?? "";
            if (pathname.startsWith("/lingoleaf/demo")) {
              return req.url;
            }
          },
        },
      },
    },
  },
});

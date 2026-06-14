import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { pagesFunctionsDevPlugin } from "./vite/pages-functions-dev.mjs";

/** lingoleaf-web Vite dev server (see projects/lingoleaf-web/vite.config.ts). */
const LINGOLEAF_WEB_DEV = process.env.LINGOLEAF_WEB_DEV_URL ?? "http://localhost:8080";

function lingoleafProxyPath(path) {
  const qIndex = path.indexOf("?");
  const pathname = qIndex === -1 ? path : path.slice(0, qIndex);
  const search = qIndex === -1 ? "" : path.slice(qIndex);
  if (pathname === "/lingoleaf") {
    return `/lingoleaf/${search}`;
  }
  return path;
}

export default defineConfig({
  output: "static",
  site: "https://connorjpepin.com",
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  vite: {
    plugins: [pagesFunctionsDevPlugin()],
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

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

/** lingoleaf-web Vite dev server (see projects/lingoleaf-web/vite.config.ts). */
const LINGOLEAF_WEB_DEV = process.env.LINGOLEAF_WEB_DEV_URL ?? "http://localhost:8080";

export default defineConfig({
  output: "static",
  site: "https://connorjpepin.com",
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  vite: {
    build: {
      cssMinify: true,
    },
    server: {
      proxy: {
        "/lingoleaf": {
          target: LINGOLEAF_WEB_DEV,
          changeOrigin: true,
          ws: true,
          bypass(req) {
            const url = req.url ?? "";
            // Portfolio owns the Expo mobile demo under /lingoleaf/demo/*
            if (url.startsWith("/lingoleaf/demo")) {
              return url;
            }
          },
        },
      },
    },
  },
});

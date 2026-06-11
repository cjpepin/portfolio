import { onRequestOptions as __api_demo_chat_ts_onRequestOptions } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/api/demo/chat.ts"
import { onRequestPost as __api_demo_chat_ts_onRequestPost } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/api/demo/chat.ts"
import { onRequestOptions as __api_demo_translate_ts_onRequestOptions } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/api/demo/translate.ts"
import { onRequestPost as __api_demo_translate_ts_onRequestPost } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/api/demo/translate.ts"
import { onRequestGet as __lingoleaf_api_admin_analytics_ts_onRequestGet } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/lingoleaf/api/admin-analytics.ts"
import { onRequestPost as __lingoleaf_api_contact_ts_onRequestPost } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/lingoleaf/api/contact.ts"
import { onRequestPost as __lingoleaf_api_turnstile_verify_ts_onRequestPost } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/lingoleaf/api/turnstile-verify.ts"
import { onRequestOptions as __api_contact_ts_onRequestOptions } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/api/contact.ts"
import { onRequestPost as __api_contact_ts_onRequestPost } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/api/contact.ts"
import { onRequest as __lingoleaf___path___ts_onRequest } from "/Users/connorpepin/Cursor/portfolio/apps/portfolio/functions/lingoleaf/[[path]].ts"

export const routes = [
    {
      routePath: "/api/demo/chat",
      mountPath: "/api/demo",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_demo_chat_ts_onRequestOptions],
    },
  {
      routePath: "/api/demo/chat",
      mountPath: "/api/demo",
      method: "POST",
      middlewares: [],
      modules: [__api_demo_chat_ts_onRequestPost],
    },
  {
      routePath: "/api/demo/translate",
      mountPath: "/api/demo",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_demo_translate_ts_onRequestOptions],
    },
  {
      routePath: "/api/demo/translate",
      mountPath: "/api/demo",
      method: "POST",
      middlewares: [],
      modules: [__api_demo_translate_ts_onRequestPost],
    },
  {
      routePath: "/lingoleaf/api/admin-analytics",
      mountPath: "/lingoleaf/api",
      method: "GET",
      middlewares: [],
      modules: [__lingoleaf_api_admin_analytics_ts_onRequestGet],
    },
  {
      routePath: "/lingoleaf/api/contact",
      mountPath: "/lingoleaf/api",
      method: "POST",
      middlewares: [],
      modules: [__lingoleaf_api_contact_ts_onRequestPost],
    },
  {
      routePath: "/lingoleaf/api/turnstile-verify",
      mountPath: "/lingoleaf/api",
      method: "POST",
      middlewares: [],
      modules: [__lingoleaf_api_turnstile_verify_ts_onRequestPost],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_contact_ts_onRequestOptions],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_ts_onRequestPost],
    },
  {
      routePath: "/lingoleaf/:path*",
      mountPath: "/lingoleaf",
      method: "",
      middlewares: [],
      modules: [__lingoleaf___path___ts_onRequest],
    },
  ]
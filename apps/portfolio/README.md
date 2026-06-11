# Portfolio Site

Swagger UI–styled personal portfolio built with **Astro + React islands**, deployed to **Cloudflare Pages**.

## Quick start

```bash
cd apps/portfolio
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

Output: `dist/`

## Cloudflare Pages deployment

Connect the **monorepo** Git repo (not only `apps/portfolio`). Use one of the layouts below.

### Option A — project root `apps/portfolio` (recommended)


| Setting                | Value                                |
| ---------------------- | ------------------------------------ |
| Root directory         | `apps/portfolio`                     |
| Build command          | `npm install && npm run build:pages` |
| Build output directory | `dist`                               |
| **Deploy command**     | *(leave empty)*                      |


### Option B — monorepo root


| Setting                | Value                 |
| ---------------------- | --------------------- |
| Root directory         | *(empty)*             |
| Build command          | `npm run build`       |
| Build output directory | `apps/portfolio/dist` |
| **Deploy command**     | *(leave empty)*       |


Do **not** set the deploy command to `npx wrangler deploy`. That targets Workers from the repo root; Wrangler 4 sees `pnpm-workspace.yaml` and fails with *"run in the root of a workspace instead of targeting a specific project"*. Cloudflare Pages uploads `dist` and `functions/` automatically after the build.

Optional: `npm run deploy` (repo root) or `npm run deploy` from `apps/portfolio` runs `scripts/cloudflare-pages-deploy.mjs` (`wrangler pages deploy` from this directory). Only use that for manual/CI deploys — set `CF_PAGES_PROJECT_NAME` to your Pages project slug first.

### Trigger deploy (webhook)

Redeploy production without pushing to Git:

```bash
curl -d "" "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/16ae0e3f-d085-4ed9-8187-6c2de18d6bab"
```

### Environment variables

Set in Cloudflare Pages → Settings → Environment variables (Production **and** Preview):

**Portfolio contact form**

| Variable             | Required | Encrypted | Description                                               |
| -------------------- | -------- | --------- | --------------------------------------------------------- |
| `RESEND_API_KEY`     | Yes      | Yes       | Resend API key for contact form                           |
| `CONTACT_TO_EMAIL`   | No       | No        | Inbox (default: `cjpepin@wustl.edu`)                      |
| `CONTACT_FROM_EMAIL` | No       | No        | Verified Resend sender (default: `onboarding@resend.dev`) |

**LingoLeaf web client (build-time — baked into `/lingoleaf/*` JS during `sync:lingoleaf-web`)**

| Variable                   | Required | Encrypted | Description                                      |
| -------------------------- | -------- | --------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`        | Yes      | No        | Supabase project URL                             |
| `VITE_SUPABASE_ANON_KEY`   | Yes      | No        | Supabase anon/publishable key (same value as below) |
| `VITE_SUPABASE_DB_SCHEMA`  | No       | No        | `lingoleaf`                                      |
| `VITE_TURNSTILE_SITE_KEY`  | Forum    | No        | Turnstile site key for feature forum             |

**LingoLeaf web server (Pages Functions at `/lingoleaf/api/*`)**

| Variable                     | Required | Encrypted | Description                          |
| ---------------------------- | -------- | --------- | ------------------------------------ |
| `SUPABASE_URL`               | Yes      | Yes       | Same URL as `VITE_SUPABASE_URL`      |
| `SUPABASE_ANON_KEY`          | Yes      | Yes       | Same key as `VITE_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY`  | Forum    | Yes       | Turnstile verification writes only   |
| `TURNSTILE_SECRET_KEY`       | Forum    | Yes       | Turnstile server verify              |

`SUPABASE_ANON_KEY` alone does **not** configure the forum UI — Vite only exposes `VITE_*` vars to the browser bundle. Set both keys to the same anon/publishable value, then redeploy.


Contact API: `POST /api/contact` (Cloudflare Pages Function in `functions/api/contact.ts`).

### Local contact API testing

`astro dev` does not run Cloudflare Functions. After building:

```bash
npm run build
npx wrangler pages dev dist
```

Set `RESEND_API_KEY` in a `.dev.vars` file at the project root for local testing.

## LingoLeaf demo and website

The mobile web demo and companion site (`projects/lingoleaf-web`) both live under `/lingoleaf/*`. The demo is embedded on the landing page at `/lingoleaf#try-demo`.

Build the Expo demo, sync into lingoleaf-web, then build and deploy:

```bash
cd ../../projects/lingoleaf
cp .env.demo.example .env.demo
npm run export:web-demo

cd ../../apps/portfolio
./scripts/sync-lingoleaf-demo.sh   # → projects/lingoleaf-web/public/demo/
npm run sync:lingoleaf-web         # builds lingoleaf-web (includes demo) → public/lingoleaf/
```

The Expo export references `/lingoleaf/demo/_expo/...` — assets land in `public/demo/` inside lingoleaf-web and are copied to `public/lingoleaf/demo/` on sync.

## LingoLeaf companion website (`lingoleaf-web`)

The marketing site, feature forum, app updates, contact form, admin dashboard, and browser demo live in `projects/lingoleaf-web` and mount at `/lingoleaf/*`.

### Local dev (proxy)

Run both dev servers — portfolio proxies all of `/lingoleaf/*` to lingoleaf-web (including demo static assets):

```bash
cd apps/portfolio
./scripts/sync-lingoleaf-demo.sh   # once, if demo iframe is needed locally
npm run dev:all
```

- Portfolio: [http://localhost:4321](http://localhost:4321) — **Projects → LingoLeaf → Live demo** opens `/lingoleaf#try-demo`
- lingoleaf-web direct: [http://localhost:8080/lingoleaf/](http://localhost:8080/lingoleaf/)

Or run separately: `npm run dev` in each project (portfolio still proxies when lingoleaf-web is on port 8080).

Optional: `LINGOLEAF_WEB_DEV_URL` overrides the proxy target (default `http://localhost:8080`).

### Production static sync

For Cloudflare Pages static deploy, build and copy the lingoleaf-web bundle (including demo) into `public/lingoleaf/`:

```bash
cd apps/portfolio
npm run sync:lingoleaf-web
npm run build
```

Forum/admin pages need Supabase env vars in `projects/lingoleaf-web/.env` at build time (or Cloudflare env vars for CI). Cloudflare Functions at `/lingoleaf/api/*` require `wrangler pages dev` or production CF deployment.

On Cloudflare, `projects/` is not in git — `sync-lingoleaf-web.sh` runs `sync-lingoleaf-export.sh` (shallow-clones `lingoleaf`, runs `export:web-demo`) and shallow-clones `lingoleaf-web` into `projects/lingoleaf-web` before building. Override with `LINGOLEAF_REPO` / `LINGOLEAF_REF` and `LINGOLEAF_WEB_REPO` / `LINGOLEAF_WEB_REF` if needed.

For **connorjpepin.com**, trigger the [portfolio deploy webhook](#trigger-deploy-webhook) above — it rebuilds and syncs lingoleaf-web into the portfolio bundle.

## Trellis project page (`/trellis`)

Unlike LingoLeaf, Trellis does **not** sync the full hosted webapp. `/trellis` is a portfolio-branded project page whose main content is the **desktop app preview** (Electron UI in the browser).

Build and sync the demo static assets:

```bash
cd ../../projects/trellis
bash scripts/export-web-demo.sh

cd ../../apps/portfolio
./scripts/sync-trellis-demo.sh
npm run build
```

- Project page: `/trellis` (hero, features, links)
- Desktop preview: `/trellis#try-demo` → iframe at `/trellis/demo/embed/index.html`
- Portfolio Projects → Trellis → **Live demo** links to `/trellis#try-demo`

No Supabase env vars are required for the demo embed. `build:pages` runs `sync:trellis-demo` automatically (skips gracefully if export is missing).

### Trigger deploy (lingoleaf-web Pages project)

Redeploy the standalone **lingoleaf-web** Cloudflare Pages project (e.g. after pushing to `github.com/cjpepin/lingoleaf-web`):

```bash
curl -d "" "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/5aafe321-5f26-49f8-98d0-7a7357fab4be"
```

```text
src/
  data/profile.ts       # Single source of truth for content
  pages/                # Static routes
  components/
    layout/             # Sidebar, top bar
    swagger/            # Doc-style Astro components
    react/              # Interactive islands (contact, accordions)
functions/
  api/contact.ts        # Resend contact handler
```

## Content updates

Edit `src/data/profile.ts` — no layout changes needed for resume updates.
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

| Setting | Value |
|---------|-------|
| Root directory | `apps/portfolio` |
| Build command | `npm install && npm run build:pages` |
| Build output directory | `dist` |
| **Deploy command** | *(leave empty)* |

### Option B — monorepo root

| Setting | Value |
|---------|-------|
| Root directory | *(empty)* |
| Build command | `npm run build` |
| Build output directory | `apps/portfolio/dist` |
| **Deploy command** | *(leave empty)* |

Do **not** set the deploy command to `npx wrangler deploy`. That targets Workers from the repo root; Wrangler 4 sees `pnpm-workspace.yaml` and fails with *"run in the root of a workspace instead of targeting a specific project"*. Cloudflare Pages uploads `dist` and `functions/` automatically after the build.

Optional: `npm run deploy` (repo root) or `npm run deploy` from `apps/portfolio` runs `scripts/cloudflare-pages-deploy.mjs` (`wrangler pages deploy` from this directory). Only use that for manual/CI deploys — set `CF_PAGES_PROJECT_NAME` to your Pages project slug first.

### Environment variables

Set in Cloudflare Pages → Settings → Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key for contact form |
| `CONTACT_TO_EMAIL` | No | Inbox (default: `cjpepin@wustl.edu`) |
| `CONTACT_FROM_EMAIL` | No | Verified Resend sender (default: `onboarding@resend.dev`) |

Contact API: `POST /api/contact` (Cloudflare Pages Function in `functions/api/contact.ts`).

### Local contact API testing

`astro dev` does not run Cloudflare Functions. After building:

```bash
npm run build
npx wrangler pages dev dist
```

Set `RESEND_API_KEY` in a `.dev.vars` file at the project root for local testing.

## LingoLeaf demo embed

Build the web demo from the subproject, then sync with the portfolio script (handles base-path layout):

```bash
cd ../../projects/lingoleaf
cp .env.demo.example .env.demo
# Fill demo Supabase credentials (EXPO_PUBLIC_WEB_BASE_PATH defaults to /lingoleaf/demo)
npm run export:web-demo

cd ../../apps/portfolio
./scripts/sync-lingoleaf-demo.sh
```

The Expo export references `/lingoleaf/demo/_expo/...` — the sync script copies `_expo/` and `assets/` to `public/lingoleaf/demo/` while keeping `index.html` under `embed/` for the Astro iframe wrapper.

SPA routing for the embed uses `public/_redirects`. The page at `/lingoleaf/demo` auto-detects the bundle at build time.

## LingoLeaf companion website (`lingoleaf-web`)

The marketing site, feature forum, app updates, contact form, and admin dashboard live in `projects/lingoleaf-web` and mount at `/lingoleaf/*`.

### Local dev (proxy)

Run both dev servers — portfolio proxies `/lingoleaf` to lingoleaf-web except `/lingoleaf/demo/*` (Expo embed):

```bash
cd apps/portfolio
npm run dev:all
```

- Portfolio: [http://localhost:4321](http://localhost:4321) — open **Projects → LingoLeaf → Live demo** for mobile demo + web page links/previews
- lingoleaf-web direct: [http://localhost:8080/lingoleaf/](http://localhost:8080/lingoleaf/)

Or run separately: `npm run dev` in each project (portfolio still proxies when lingoleaf-web is on port 8080).

Optional: `LINGOLEAF_WEB_DEV_URL` overrides the proxy target (default `http://localhost:8080`).

### Production static sync

For Cloudflare Pages static deploy, build and copy the lingoleaf-web bundle into `public/lingoleaf/` (preserves the Expo demo under `demo/`):

```bash
cd apps/portfolio
npm run sync:lingoleaf-web
npm run build
```

Forum/admin pages need Supabase env vars in `projects/lingoleaf-web/.env` at build time. Cloudflare Functions at `/lingoleaf/api/*` require `wrangler pages dev` or production CF deployment.


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

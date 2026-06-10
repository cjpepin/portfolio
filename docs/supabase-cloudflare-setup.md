# Supabase deploy + Cloudflare setup

This guide covers pushing local Supabase config from `projects/*` to remote Supabase projects, then wiring Cloudflare Pages so the portfolio shell and subprojects work together on one domain.

## Architecture today

| App | Path on domain | Backend | Hosting |
|-----|----------------|---------|---------|
| Portfolio shell | `/` | Resend contact API (CF Function) | Cloudflare Pages (`apps/portfolio`) |
| LingoLeaf web demo | `/lingoleaf/demo` | LingoLeaf mobile Supabase (guest) | Static embed in portfolio |
| LingoLeaf web | `/lingoleaf/*` | Shared Supabase (`lingoleaf` schema) + CF Functions | Synced into portfolio build |
| Trellis web demo | `/trellis/demo` (if synced) | Trellis Supabase | Static embed in portfolio |

Each subproject keeps its own `.env` (never commit it). Use `.env.example` in each project as the checklist.

---

## Part 1 — Prerequisites

### 1. Install the Supabase CLI

```bash
brew install supabase/tap/supabase
supabase --version
```

### 2. Authenticate the CLI

Either log in interactively:

```bash
supabase login
```

Or export a personal access token (CI-friendly):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
```

Create tokens in [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens).

### 3. Create Supabase projects

Recommended layout (matches current repo):

| Project | Supabase project | Schema |
|---------|------------------|--------|
| `projects/lingoleaf` | Dedicated demo/mobile project | `public` |
| `projects/lingoleaf-web` | Shared portfolio project | `lingoleaf` |
| `projects/trellis` | Dedicated Trellis project | `public` |

**Target state** (future): one portfolio Supabase project with schemas `portfolio`, `lingoleaf`, and `trellis`. The deploy script works the same — each app still reads its own `.env` pointing at the correct project ref.

### 4. Fill each project `.env`

Copy from `.env.example` in each project directory:

```bash
cp projects/lingoleaf/.env.example projects/lingoleaf/.env
cp projects/lingoleaf-web/.env.example projects/lingoleaf-web/.env
cp projects/trellis/.env.example projects/trellis/.env
```

Minimum variables per project:

**`projects/lingoleaf/.env`**

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY` (anon key)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD` (Database → Settings → Database password)
- Optional: `SUPABASE_PROJECT_REF` (otherwise parsed from URL)
- Optional secrets: `GOOGLE_TRANSLATE_API_KEY`, `OPENAI_API_KEY`, RevenueCat keys

**`projects/lingoleaf-web/.env`**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_DB_SCHEMA=lingoleaf`
- `SUPABASE_SERVICE_ROLE_KEY` (for local CF Function testing)
- `SUPABASE_DB_PASSWORD`

**`projects/trellis/.env`**

- `SUPABASE_URL` / `VITE_SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- Stripe/provider secrets (see `projects/trellis/docs/supabase-dx.md`)

---

## Part 2 — Deploy Supabase config from the monorepo

The root script validates connectivity, then pushes migrations, seeds, and edge functions.

### Validate only (safe first step)

```bash
npm run supabase:validate
```

Or directly:

```bash
node scripts/supabase-deploy.mjs --validate-only --project all
```

This checks:

- Each project has a real `.env` (not placeholders)
- Supabase URL + anon/publishable key are set
- Remote `/auth/v1/health` responds

### Deploy everything

```bash
npm run supabase:deploy
```

Or directly:

```bash
node scripts/supabase-deploy.mjs --project all
```

Or one project at a time:

```bash
node scripts/supabase-deploy.mjs --project lingoleaf
node scripts/supabase-deploy.mjs --project lingoleaf-web
node scripts/supabase-deploy.mjs --project trellis
```

### Useful flags

| Flag | Purpose |
|------|---------|
| `--dry-run` | Print planned CLI commands without running |
| `--skip-seed` | Skip demo seed SQL (LingoLeaf mobile) |
| `--skip-functions` | Migrations only |
| `--skip-migrations` | Functions/secrets only |
| `--skip-link` | Skip `supabase link` when already linked |
| `--skip-secrets` | Skip `supabase secrets set` |

### What each project deploys

| Project | Migrations | Seeds | Edge functions |
|---------|------------|-------|----------------|
| `lingoleaf` | `supabase/migrations/*` | `supabase/demo/seed.sql` | translate, study-pack-metadata, premium-entitlement-sync, analytics-ingest, migrate-user-data |
| `lingoleaf-web` | `supabase/migrations/202604090001_lingoleaf_schema.sql` | — | — (uses Cloudflare Functions instead) |
| `trellis` | via `pnpm run supabase:backend:deploy` delegate | — | all functions under `supabase/functions/` |

### Post-deploy manual steps

**LingoLeaf mobile (`lingoleaf`)**

1. Supabase → Authentication → Providers → enable **Anonymous sign-ins**
2. Storage → create private bucket `general-library` if serving EPUBs
3. Rotate demo anon key in README if publishing credentials

**LingoLeaf web (`lingoleaf-web`)**

1. Supabase → Settings → API → add `lingoleaf` to **Exposed schemas**
2. Auth → URL configuration → allow `https://connorjpepin.com/lingoleaf/**`
3. Seed admin:

   ```sql
   insert into lingoleaf.forum_admins (user_id) values ('YOUR_AUTH_USER_UUID');
   ```

**Trellis**

1. Enable **Anonymous sign-ins**
2. Set Stripe and LLM secrets:

   ```bash
   cd projects/trellis
   supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... OPENAI_API_KEY=...
   ```

   See `projects/trellis/docs/supabase-dx.md` for the full list.

---

## Part 3 — Cloudflare Pages setup

The portfolio site is a **single Cloudflare Pages project** at `apps/portfolio`. Subprojects are built locally (or in CI) and synced into `public/` before the portfolio build.

### Option A — One Cloudflare Pages project (recommended for connorjpepin.com)

This matches the current monorepo layout.

#### Step 1: Connect the repository

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select the portfolio monorepo
3. Configure build:

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Root directory | `apps/portfolio` |
| Build command | `npm run sync:lingoleaf-web && npm run sync:lingoleaf-demo && npm run build` |
| Build output directory | `dist` |
| Node version | 20+ |

Adjust sync commands if Trellis demo is included (`npm run sync:trellis-demo`).

#### Step 2: Portfolio environment variables

Cloudflare Pages → your project → **Settings → Environment variables** (Production + Preview):

| Variable | Encrypted | Used by |
|----------|-----------|---------|
| `RESEND_API_KEY` | Yes | `POST /api/contact` |
| `CONTACT_TO_EMAIL` | No | Contact form |
| `CONTACT_FROM_EMAIL` | No | Contact form sender |

See `apps/portfolio/.env.example`.

#### Step 3: LingoLeaf web build-time variables

These must be present **when `sync:lingoleaf-web` runs** (build machine env or Cloudflare build env):

| Variable | Encrypted | Notes |
|----------|-----------|-------|
| `VITE_SUPABASE_URL` | No | Baked into client bundle |
| `VITE_SUPABASE_ANON_KEY` | No | Anon key only — never service role |
| `VITE_SUPABASE_DB_SCHEMA` | No | `lingoleaf` |
| `VITE_TURNSTILE_SITE_KEY` | No | Feature forum widget |

#### Step 4: LingoLeaf web server-only variables (Pages Functions)

Set as **encrypted** env vars on the same Pages project:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Server-side Supabase client |
| `SUPABASE_ANON_KEY` | Server-side reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Turnstile verification writes |
| `TURNSTILE_SECRET_KEY` | Turnstile server verify |
| `RESEND_API_KEY` | Contact form on `/lingoleaf/contact` |

Functions live at `projects/lingoleaf-web/functions/lingoleaf/api/*` and are copied during sync. Routes: `/lingoleaf/api/*`.

#### Step 5: Auth redirect URLs in Supabase

In the **lingoleaf-web** Supabase project:

- Site URL: `https://connorjpepin.com/lingoleaf/`
- Redirect URLs:
  - `https://connorjpepin.com/lingoleaf/email-confirmed`
  - `https://connorjpepin.com/lingoleaf/**`

Add preview URLs if you use Cloudflare preview deployments.

#### Step 6: Custom domain

1. Pages project → **Custom domains** → add `connorjpepin.com` and `www.connorjpepin.com`
2. Confirm DNS (Cloudflare-managed zone is simplest)
3. Enable **Always Use HTTPS**

#### Step 7: Turnstile + WAF (optional but recommended)

- Create a Turnstile widget restricted to your domain
- Follow `projects/lingoleaf-web/docs/turnstile-supabase-setup.md`
- Rate limits: `projects/lingoleaf-web/docs/cloudflare-waf-rate-limits.md`

#### Step 8: Local parity test before deploy

```bash
# Terminal 1 — portfolio + proxied lingoleaf-web
cd apps/portfolio && npm run dev:all

# Terminal 2 — contact + lingoleaf APIs via wrangler
cd apps/portfolio
npm run build
npx wrangler pages dev dist
```

Use `.dev.vars` at `apps/portfolio/.dev.vars` for local secrets (same keys as Cloudflare encrypted vars).

---

### Option B — Separate Cloudflare Pages projects per repo

Use this when **portfolio** and **lingoleaf-web** are separate Git repos with separate Cloudflare Pages projects, but visitors should still see one domain (`connorjpepin.com`).

**Compared to Option A:** two builds, two env-var surfaces, and you must route by path at the edge. Option A (monorepo sync) avoids that by copying lingoleaf-web `dist/` and `functions/` into the portfolio build before `astro build`.

#### Why you cannot attach both projects to `connorjpepin.com`

Cloudflare Pages allows **one custom hostname per path on the zone** in the simple case: only one Pages project can own `connorjpepin.com`. A second project (`lingoleaf-web`) must stay on its default hostname (`lingoleaf-web.pages.dev`) and be reached via **path-based routing** in front of the portfolio project.

#### Deploy each repo independently

**Portfolio Pages project** (repo: portfolio)

| Setting | Value |
|---------|-------|
| Root directory | `apps/portfolio` (monorepo) or `/` (portfolio-only repo) |
| Build command | `npm install && npm run build` |
| Build output | `dist` |
| Deploy command | *(empty — do not use `npx wrangler deploy`)* |
| Custom domain | `connorjpepin.com`, `www.connorjpepin.com` |
| Env vars | `RESEND_API_KEY`, contact defaults — see `apps/portfolio/.env.example` |

**LingoLeaf web Pages project** (repo: lingoleaf-web)

| Setting | Value |
|---------|-------|
| Root directory | `/` |
| Build command | `npm ci && npm run build` |
| Build output | `dist` |
| Deploy command | *(empty)* |
| Custom domain | **None** — use only `lingoleaf-web.pages.dev` |
| Env vars | All `VITE_*` build vars + encrypted server vars — see `projects/lingoleaf-web/docs/DEPLOY.md` |

LingoLeaf web is built with `base: "/lingoleaf/"` in `vite.config.ts`, so assets and the router already expect to live under `/lingoleaf/*` on the **public** hostname (`connorjpepin.com`), not on `lingoleaf-web.pages.dev` alone. That is correct as long as the browser URL stays on `connorjpepin.com` (Worker or origin rule below).

Supabase Auth redirect URLs stay on the apex domain, e.g. `https://connorjpepin.com/lingoleaf/**` — no change from Option A.

#### Path routing on one domain (overview)

```text
Browser                    Cloudflare edge                         Origins
───────                    ───────────────                         ───────

connorjpepin.com/     ──►  portfolio Pages (custom domain)   ──►  portfolio-*.pages.dev
connorjpepin.com/contact
connorjpepin.com/lingoleaf/demo*   ──►  portfolio Pages (static embed)

connorjpepin.com/lingoleaf/*  ──►  Worker or Origin Rule        ──►  lingoleaf-web.pages.dev
  (except /demo*)                  (path match + proxy)
```

| Path | Served by | Notes |
|------|-----------|-------|
| `/`, `/contact`, portfolio routes | Portfolio Pages | Custom domain attached here |
| `/lingoleaf/demo`, `/lingoleaf/demo/*` | Portfolio Pages | Expo embed lives in portfolio `public/lingoleaf/demo/` — **not** in lingoleaf-web |
| `/lingoleaf/*` (SPA + APIs) | LingoLeaf web Pages | Includes `/lingoleaf/api/*` Pages Functions |

Route **demo first**, then the broader `/lingoleaf` prefix, so the mobile embed is not sent to the lingoleaf-web project.

---

#### Approach 1 — Worker reverse proxy (recommended)

Works on all Cloudflare plans. Create a Worker in the **same zone** as `connorjpepin.com`.

1. **Workers & Pages → Create → Worker** (e.g. `path-router`)
2. **Workers → path-router → Settings → Domains & Routes → Add route:**
   - `connorjpepin.com/lingoleaf*` (and `www.connorjpepin.com/lingoleaf*` if you use `www`)
3. Leave the **portfolio** Pages custom domain as-is; it continues to serve `/` and paths the Worker does not match.
4. Deploy Worker code similar to:

```js
const LINGOLEAF_HOST = "lingoleaf-web.pages.dev";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Portfolio owns the Expo demo; do not proxy these to lingoleaf-web.
    if (url.pathname.startsWith("/lingoleaf/demo")) {
      return fetch(request);
    }

    if (!url.pathname.startsWith("/lingoleaf")) {
      return fetch(request);
    }

    const upstream = new URL(request.url);
    upstream.hostname = LINGOLEAF_HOST;

    const headers = new Headers(request.headers);
    headers.set("Host", LINGOLEAF_HOST);

    return fetch(
      new Request(upstream, {
        method: request.method,
        headers,
        body: request.body,
        redirect: "manual",
      })
    );
  },
};
```

5. **Smoke-test** after deploy:

| URL | Expected origin |
|-----|-----------------|
| `https://connorjpepin.com/` | Portfolio |
| `https://connorjpepin.com/lingoleaf/` | LingoLeaf web (via Worker) |
| `https://connorjpepin.com/lingoleaf/features` | LingoLeaf SPA deep link |
| `https://connorjpepin.com/lingoleaf/api/turnstile-verify` | LingoLeaf Pages Function |
| `https://connorjpepin.com/lingoleaf/demo` | Portfolio embed |

**Worker caveats**

- **Cookies / auth:** Supabase session cookies are scoped to `connorjpepin.com`; proxying preserves that. Do not redirect users to `lingoleaf-web.pages.dev` in links or OAuth callbacks.
- **Preview deployments:** Worker routes target production hostnames. Preview URLs (`*.pages.dev` deployment branches) do not automatically get the same path split unless you add branch-specific Workers or test lingoleaf-web on its own `*.pages.dev` URL.
- **Caching:** LingoLeaf HTML and hashed assets cache like any proxied origin; purge both Pages projects if you ship a bad bundle.
- **`/lingoleaf` without trailing slash:** Ensure lingoleaf-web or portfolio redirects `/lingoleaf` → `/lingoleaf/` (Vite `base` uses a trailing slash).

---

#### Approach 2 — Origin Rules (zone Rules)

If your zone has **Origin Rules** (Business / Enterprise), you can override the origin hostname for a path prefix without maintaining Worker code:

1. **Rules → Origin Rules → Create rule**
2. **When:** URI Path starts with `/lingoleaf` **and** does not start with `/lingoleaf/demo`
3. **Then:** Override origin host to `lingoleaf-web.pages.dev` (and SNI to the same host if offered)

Portfolio Pages still owns the custom domain; matching requests are fetched from the lingoleaf-web Pages hostname while the browser bar stays on `connorjpepin.com`.

Prefer the Worker if you need redirect rewriting, custom headers, or A/B logic; Origin Rules are enough for a straight reverse proxy.

**Transform Rules alone** (URL rewrite only) do not replace origin selection — you need either an origin override or a Worker `fetch()` to a different Pages project.

---

#### Approach 3 — Cloudflare for SaaS (usually not worth it here)

[Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/) (custom hostnames, SSL for SaaS) targets multi-tenant products that map **many customer domains** to your stack. For one personal domain with two Pages projects, a path Worker is simpler and cheaper.

---

#### Split-repo checklist (lingoleaf-web project)

Set on the **lingoleaf-web** Pages project (not portfolio):

| Variable | Encrypted | Purpose |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | No | Client bundle |
| `VITE_SUPABASE_ANON_KEY` | No | Client bundle |
| `VITE_SUPABASE_DB_SCHEMA` | No | `lingoleaf` |
| `VITE_TURNSTILE_SITE_KEY` | No | Forum widget |
| `SUPABASE_URL` | Yes | Pages Functions |
| `SUPABASE_ANON_KEY` | Yes | Pages Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Turnstile verify writes |
| `TURNSTILE_SECRET_KEY` | Yes | Turnstile server |
| `RESEND_API_KEY` | Yes | `/lingoleaf/contact` |

Deploy `functions/lingoleaf/api/*` with the lingoleaf-web build. SPA fallback: ship `public/_redirects` in the lingoleaf-web repo, e.g.:

```text
/lingoleaf/*  /lingoleaf/index.html  200
```

#### Split-repo checklist (portfolio project)

- Do **not** run `sync:lingoleaf-web` in the portfolio build (that is Option A only).
- Keep `public/lingoleaf/demo/` and demo-related `_redirects` if you serve the Expo embed from portfolio.
- Remove or avoid a portfolio-wide `/lingoleaf/*` SPA fallback in `_redirects` when a Worker serves other `/lingoleaf` paths from lingoleaf-web — only demo rules should remain on portfolio, e.g.:

```text
/lingoleaf/demo/embed/*  /lingoleaf/demo/embed/index.html  200
```

#### When to migrate back to Option A

Consider monorepo sync again if:

- You want one Cloudflare env-var UI and one deploy for `/lingoleaf/api/*` + static SPA
- Preview deployments must mirror production path layout with no Worker
- You are hitting Worker subrequest limits or debugging proxy/cache issues

See Option A Step 1 build command (`npm run sync:lingoleaf-web && …`) and `apps/portfolio/scripts/sync-lingoleaf-web.sh`.

#### Trellis repo

Trellis desktop builds are distributed outside Pages. For a web demo:

```bash
cd projects/trellis
pnpm run build:web:hosted   # or export script
cd ../../apps/portfolio
npm run sync:trellis-demo
npm run build
```

Point `VITE_*` Supabase vars at the Trellis Supabase project during the Trellis web build.

---

## Part 4 — CI checklist

Add to your deploy pipeline (GitHub Actions or Cloudflare build):

```bash
# 1. Validate Supabase env before shipping backend changes
npm run supabase:validate

# 2. Deploy Supabase (manual approval gate recommended for production)
npm run supabase:deploy

# 3. Build portfolio with embedded subprojects
cd apps/portfolio
npm run sync:lingoleaf-web
npm run sync:lingoleaf-demo
npm run build
```

Store these as Cloudflare / GitHub secrets — never in the repo:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD` (per project if automating db push)
- `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Part 5 — Smoke tests after deploy

| URL | Expected |
|-----|----------|
| `https://connorjpepin.com/` | Portfolio loads |
| `https://connorjpepin.com/contact` | Contact form submits |
| `https://connorjpepin.com/lingoleaf/` | LingoLeaf landing |
| `https://connorjpepin.com/lingoleaf/features` | Forum + Turnstile |
| `https://connorjpepin.com/lingoleaf/demo` | Mobile web demo (guest auth) |
| `https://connorjpepin.com/lingoleaf/admin/analytics` | Admin dashboard (admin user) |

Verify client bundles do **not** contain `service_role` strings (browser DevTools → search).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `db push` asks for password | Set `SUPABASE_DB_PASSWORD` in project `.env` |
| `link` fails | Run `supabase login` or set `SUPABASE_ACCESS_TOKEN` |
| LingoLeaf forum 401/RLS errors | Confirm `lingoleaf` schema is exposed in Supabase API settings |
| Turnstile failures | Match site key (client) and secret key (server); redeploy after env change |
| Demo guest sign-in fails | Enable Anonymous sign-ins on the LingoLeaf Supabase project |
| CF Functions 404 on `/lingoleaf/api/*` | Option A: ensure `functions/` is copied during sync. Option B: confirm Worker routes `/lingoleaf/api/*` to lingoleaf-web Pages, not portfolio |
| LingoLeaf assets 404 on `/lingoleaf/assets/*` | Option B: Worker must proxy to `lingoleaf-web.pages.dev` with `Host` set; build must use `base: "/lingoleaf/"` |
| `/lingoleaf/demo` shows lingoleaf-web SPA | Worker route is too broad — exclude `/lingoleaf/demo` before proxying to lingoleaf-web |
| OAuth lands on `lingoleaf-web.pages.dev` | Fix Supabase redirect URLs to `https://connorjpepin.com/lingoleaf/**`; never attach custom domain to lingoleaf-web Pages |
| Portfolio `_redirects` breaks lingoleaf SPA | Remove portfolio catch-all `/lingoleaf/* → index.html` when using Option B; keep only demo rules on portfolio |

---

## Related docs

- `projects/lingoleaf-web/docs/DEPLOY.md` — LingoLeaf web production checklist
- `projects/lingoleaf-web/docs/turnstile-supabase-setup.md` — Turnstile + schema setup
- `projects/trellis/docs/supabase-dx.md` — Trellis Supabase CLI helpers
- `apps/portfolio/README.md` — Portfolio build and sync scripts
- `specifications/REPO_SPEC.md` — Target shared-auth architecture

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

Use this if subprojects stay in **separate GitHub repositories** but should appear on one domain.

#### Portfolio repo (`apps/portfolio`)

| Setting | Value |
|---------|-------|
| Root directory | `apps/portfolio` |
| Build command | `npm run build` |
| Output | `dist` |
| Custom domain | `connorjpepin.com` |

#### LingoLeaf web repo (`projects/lingoleaf-web` as its own repo)

| Setting | Value |
|---------|-------|
| Root directory | `/` (repo root) |
| Build command | `npm ci && npm run build` |
| Output | `dist` |
| Custom domain | Use a **Cloudflare route** or **Workers route** — not a second apex domain |

**Path routing on one domain:**

1. Deploy lingoleaf-web to Pages project `lingoleaf-web` (gets `lingoleaf-web.pages.dev`)
2. In the **portfolio zone** → **Rules** → **Transform Rules** or use a **Worker** in front:

   - `/lingoleaf/*` → origin `lingoleaf-web.pages.dev`
   - `/` and everything else → portfolio Pages project

Alternatively, use **Cloudflare for SaaS** or a single Worker that proxies by path. The monorepo avoids this by syncing static assets into one build (Option A).

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
| CF Functions 404 on `/lingoleaf/api/*` | Ensure lingoleaf-web `functions/` directory is included in the synced build |

---

## Related docs

- `projects/lingoleaf-web/docs/DEPLOY.md` — LingoLeaf web production checklist
- `projects/lingoleaf-web/docs/turnstile-supabase-setup.md` — Turnstile + schema setup
- `projects/trellis/docs/supabase-dx.md` — Trellis Supabase CLI helpers
- `apps/portfolio/README.md` — Portfolio build and sync scripts
- `specifications/REPO_SPEC.md` — Target shared-auth architecture

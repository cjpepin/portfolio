# Demo seed data

Realistic fake data for **Trellis**, **LingoLeaf**, and **lingoleaf-web** lives in two layers:

1. **Browser demos** — JSON fixtures hydrate IndexedDB on first visit (`VITE_DEMO_MODE` / `EXPO_PUBLIC_DEMO_MODE`).
2. **Supabase dev/staging** — SQL under `projects/*/supabase/demo/seed.sql`, applied after migrations.

Canonical source of truth: [`fixtures/demo-seed/`](../fixtures/demo-seed/).

## Quick commands

```bash
# Regenerate all client JSON + SQL from fixtures/demo-seed/
npm run seed:demo -- --target fixtures
# or
node scripts/seed-demo.mjs --target fixtures

# Apply Supabase seeds (creates demo auth users, then runs seed SQL)
node scripts/seed-demo.mjs --target supabase --project all

# Per project
node scripts/seed-demo.mjs --target supabase --project lingoleaf
node scripts/seed-demo.mjs --target supabase --project lingoleaf-web
node scripts/seed-demo.mjs --target supabase --project trellis

# Migrations + seeds via existing deploy script
node scripts/supabase-deploy.mjs --project lingoleaf
```

Requires a **linked** Supabase project per `projects/*` directory and `SUPABASE_SERVICE_ROLE_KEY` for demo auth user creation.

**Env files** (merged in order; project overrides portfolio):

| Project | Supabase instance | Where to set `SUPABASE_SERVICE_ROLE_KEY` |
|---------|-------------------|---------------------------------------------|
| `lingoleaf` | LingoLeaf mobile project | `projects/lingoleaf/.env` |
| `lingoleaf-web` | Shared portfolio project (`lingoleaf` schema) | `apps/portfolio/.env` or `projects/lingoleaf-web/.env` |
| `trellis` | Trellis project | `projects/trellis/.env` |

`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are not enough for seeding — the service role key is server-only. Copy it from Supabase Dashboard → Project Settings → API.

Use `--skip-users` if demo auth users already exist and you only need SQL seeds.

## Portfolio embeds (automatic)

Build/sync demos into the portfolio shell:

```bash
cd apps/portfolio
npm run sync:lingoleaf-demo    # /lingoleaf/demo — LingoLeaf mobile web embed
npm run sync:lingoleaf-web     # /lingoleaf/features, /updates, /admin/analytics
npm run sync:trellis-demo      # /trellis/demo — Trellis web embed
```

Open the URLs in a browser. Data hydrates into IndexedDB on first load.

**Re-seed in the browser:** clear site data for the origin, or bump the `version` field in the relevant seed JSON (then rebuild/sync).

## Per-project triggers

### LingoLeaf (mobile / `/lingoleaf/demo`)

| Data | Demo (IDB) | Supabase |
|------|------------|----------|
| Catalog books (3) | `projects/lingoleaf/src/demo/seed.json` | `projects/lingoleaf/supabase/demo/seed.sql` |
| Library / history | user_books store | same SQL |
| Highlights | user_books.highlights | same SQL |
| Study words + lists | study_words, vocab_lists | same SQL |
| Reading sessions | reading_sessions | same SQL |

Demo user ID: `00000000-0000-4000-8000-000000000001`

Legacy setup script still works:

```bash
cd projects/lingoleaf
./scripts/setup-demo-supabase.sh <project-ref>
```

### lingoleaf-web (`/lingoleaf/features`, `/updates`, `/admin/analytics`)

| Data | Demo (IDB) | Supabase |
|------|------------|----------|
| Feature forum | `src/lib/demo/forum-seed.json` | `supabase/demo/seed.sql` |
| App updates (blog) | `src/lib/demo/blog-seed.json` | same SQL |
| Analytics dashboard | `src/lib/demo/analytics-seed.json` | `analytics_events` rows in SQL |

Portfolio sync sets `VITE_DEMO_MODE=true` so forum, updates, and analytics work without live Supabase.

Demo personas (auth): `fixtures/demo-seed/demo-users.json`

### Trellis

| Surface | How to seed |
|---------|-------------|
| **Electron (richest)** | Launch app → **Explore preview workspace** (or in-app **Reset preview**) |
| **Web / portfolio** | `cd projects/trellis && npm run preview:seed:sync-web` then `bash scripts/export-web-demo.sh` |
| **Supabase cloud** | `node scripts/seed-demo.mjs --target supabase --project trellis` |

Web demo copies `fixtures/preview-seed/` into:

- Chat: `apps/web/src/lib/demo/seed/db.json`
- Notes vault: `apps/web/public/demo-vault/wiki/` + `manifest.json`

Regenerate desktop fixture:

```bash
cd projects/trellis
npm run preview:seed:generate
npm run test:preview-seed
npm run preview:seed:sync-web
```

## Demo auth users

`scripts/seed-demo.mjs` upserts fixed users via the Supabase Admin API before applying SQL:

| Email | UUID | Used for |
|-------|------|----------|
| demo-reader@lingoleaf.local | `...000001` | LingoLeaf user state |
| demo-forum-1@lingoleaf.local | `...000002` | Forum posts/votes |
| demo-forum-2@lingoleaf.local | `...000003` | Forum posts/votes |
| demo-admin@lingoleaf.local | `...000099` | Forum admin, blog posts |
| demo-trellis@trellis.local | `...000201` | Trellis cloud demo workspace |

Passwords are placeholder values for local dev only (`demo-seed-local-only` in `demo-users.json`). Never use these accounts in production.

## Editing seed content

1. Edit JSON under `fixtures/demo-seed/`.
2. Run `node scripts/seed-demo.mjs --target fixtures`.
3. Commit both the canonical fixture and generated project files.
4. For Trellis web notes, also run `npm run preview:seed:sync-web` inside `projects/trellis` after changing `fixtures/preview-seed/`.

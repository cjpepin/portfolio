# Portfolio Monorepo

Personal portfolio site and embedded subprojects.

## Subprojects

| Path | Description |
|------|-------------|
| `apps/portfolio` | **Root portfolio site** — Astro + Swagger UI styling |
| `projects/lingoleaf` | Expo iOS language-learning app |
| `projects/lingoleaf-web` | LingoLeaf marketing/forum site |
| `projects/trellis` | Local-first AI knowledge app (Electron) |

## Portfolio (Pass 1)

**Portfolio only** (no demo rebuilds):

```bash
cd apps/portfolio
npm install
npm run dev
```

**Portfolio + fresh LingoLeaf & Trellis demos** (one command from repo root):

```bash
npm install --prefix apps/portfolio
npm install --prefix packages/demo-local   # first run only; LingoLeaf export needs this
npm run dev:all
```

- Portfolio: [http://localhost:4321](http://localhost:4321)
- LingoLeaf live demo: `/lingoleaf#try-demo`
- Trellis desktop preview: `/trellis#try-demo`

Faster restarts without rebuilding demos: `SKIP_DEMO_BUILD=true npm run dev:all`

See [`apps/portfolio/README.md`](apps/portfolio/README.md) for deployment, LingoLeaf demo embed, and Resend contact setup.

## Specifications

- [`specifications/REPO_SPEC.md`](specifications/REPO_SPEC.md) — repo baseline
- [`specifications/pass-1-portfolio/SPEC.md`](specifications/pass-1-portfolio/SPEC.md) — first pass scope
- [`sdd.md`](sdd.md) — SDD workflow

## Agent workflow

Cursor: `.cursor/skills/` · Codex: `.codex/skills/` · Docs: [`docs/agents/README.md`](docs/agents/README.md)

## Supabase deploy

From the repo root (requires Supabase CLI + per-project `.env` files):

```bash
npm run supabase:validate   # check connectivity only
npm run supabase:deploy     # push migrations, seeds, edge functions
```

See [`docs/supabase-cloudflare-setup.md`](docs/supabase-cloudflare-setup.md) for full setup.

## Demo seed data

Realistic fake data for Trellis, LingoLeaf, and lingoleaf-web: [`docs/demo-seed-data.md`](docs/demo-seed-data.md).

```bash
npm run seed:demo -- --target fixtures
node scripts/seed-demo.mjs --target supabase --project all
```

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

```bash
cd apps/portfolio
npm install
npm run dev
```

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

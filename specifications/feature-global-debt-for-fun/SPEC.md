# Global//Debt — For Fun Portfolio Tier

Branch-scoped spec for listing Global//Debt as a discoverable but low-spotlight project on the portfolio.

Inherits [`REPO_SPEC.md`](../REPO_SPEC.md).

## Goal

Global//Debt is reachable from connorjpepin.com without the showcase treatment given to LingoLeaf and Trellis. Visitors find it under **For fun** and open the app directly in a new tab — no portfolio iframe, no ChatGPT Sites login.

## Scope

### In

- `forFunProjects` data module separate from `profile.projects`
- **For fun** compact cards in Projects section (API and readable modes)
- Direct **Open app** link (`target="_blank"`) to `/global-debt/app/`
- Static sync of vinext build into `public/global-debt/app/` for production and local dev
- Redirects: `/global-debt` → `/global-debt/app/` (308)
- Optional `PUBLIC_GLOBAL_DEBT_URL` build-time override in `.env.example`
- AGENTS.md subproject table entry

### Out

- Hero CTAs, nav rail showcase pins, or API quick links for Global//Debt
- `ApiTryItPanel` / API catalog entries for for-fun projects
- Trellis-style showcase assets, case study, or portfolio landing page wrapper
- ChatGPT Sites hosting URL (`*.chatgpt.site`) as default app target
- Same-domain live Worker (SSR) — static prerender + client bundle only for pass 1

## Acceptance Criteria

- [x] Global//Debt appears in Projects under **For fun**, not in main showcase list
- [x] Not linked from hero, nav rail showcase pins, or API quick links
- [x] **Open app** opens `/global-debt/app/` in a new tab with no login gate
- [x] No portfolio iframe or landing-page chrome around the app
- [x] `/global-debt` redirects to `/global-debt/app/`
- [x] Portfolio `lint`, `test`, and `build` pass

## Key Files

- `apps/portfolio/src/data/forFunProjects.ts`
- `apps/portfolio/src/components/react/ForFunProjectsBlock.tsx`
- `apps/portfolio/scripts/dev.sh`
- `apps/portfolio/scripts/sync-global-debt.sh`
- `apps/portfolio/scripts/prerender-global-debt.mjs`
- `apps/portfolio/public/global-debt/app/` (synced static export)
- `apps/portfolio/public/_redirects`
- `projects/global-debt/next.config.ts` (`basePath: /global-debt/app`)

## App URL

Default: `/global-debt/app/` (same-origin static export, no auth)  
Override via `PUBLIC_GLOBAL_DEBT_URL` at build time.

Dev: `pnpm dev` serves the synced export from `public/global-debt/app/` (runs `sync:global-debt` once if missing). After editing `projects/global-debt`, run `pnpm sync:global-debt` to refresh.

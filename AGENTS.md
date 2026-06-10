# AGENTS.md — Portfolio Monorepo

This repository is the **Portfolio** monorepo: a personal showcase site plus embedded subprojects (`projects/lingoleaf`, `projects/lingoleaf-web`, `projects/trellis`).

## Read First

1. [`specifications/REPO_SPEC.md`](specifications/REPO_SPEC.md) — durable repo baseline (architecture, stack, constraints)
2. [`sdd.md`](sdd.md) — Specification-Driven Development workflow
3. Branch-scoped delta: `specifications/<branch-name>/SPEC.md` when working on a feature branch

## Working Principles

- **Show, don't tell.** The portfolio itself demonstrates engineering quality: performance, UX, and technical depth.
- **Lightweight over heavyweight.** Prefer static/edge delivery, minimal JS, and clear information architecture over framework churn.
- **Monorepo boundaries.** Root owns the portfolio shell, shared auth contracts, and cross-project routing. Subprojects keep their domain logic; they consume shared auth — they do not redefine it.
- **SDD-first.** Read `REPO_SPEC.md` before coding. Update branch `SPEC.md` when requirements change. Promote durable truths to `REPO_SPEC.md` only via iteration branches (see `sdd.md`).
- **TypeScript strict.** No `any`; narrow at boundaries.
- **No secrets in repo.** Never read or commit `.env` files. Use `.env.example` patterns only.

## Agent Workflow

Use repo-local role skills in [`.cursor/skills/`](.cursor/skills/) (Cursor) and [`.codex/skills/`](.codex/skills/) (Codex):

1. `product-plan-agent` — research, scope, acceptance criteria
2. `senior-dev-agent` — implement approved scope
3. `senior-tester-agent` — automated coverage
4. `senior-qa-agent` — acceptance and release readiness
5. `feature-workflow` — route work through the sequence above
6. `repo-refactor-agent` — explicit cleanup/security passes only

Handoff templates: [`docs/agents/handoffs.md`](docs/agents/handoffs.md)

## Subproject Rules

| Project | Role | Auth today |
|---------|------|------------|
| `projects/lingoleaf` | React Native (Expo) iOS app | Own Supabase project |
| `projects/lingoleaf-web` | Vite marketing/forum site at `/lingoleaf` | Shared Supabase, `lingoleaf` schema |
| `projects/trellis` | Electron + web AI knowledge app | Separate Supabase project |

**Target state:** Root portfolio Supabase project owns identity for the portfolio site. Subprojects migrate to shared auth/session contracts under `packages/auth` (or equivalent) without breaking app-specific RLS schemas.

Each subproject retains its own `AGENTS.md` for domain-specific conventions. Root rules apply to cross-cutting work (auth, routing, deployment).

## Portfolio Product Concept

The root app presents Connor Pepin as **living API documentation**:

- **Reference / About** — structured profile (education, skills, experience) like an OpenAPI info block
- **Backend & Systems** — Swagger-like interactive sections for backend work (Mastercard, Crosswalk, APIs, infra)
- **Frontend & Mobile** — visual, demo-forward sections (LingoLeaf embed, Trellis, React/Angular work)
- **Contact** — creative but functional outreach (not a generic form-only page)

## Verification

- Root portfolio app: run its package scripts (`lint`, `test`, `build`) before handoff
- Subproject changes: run that subproject's existing verification commands
- Cross-cutting auth changes: verify session flow on portfolio + at least one consuming subproject

## Definition Of Done (root features)

- Matches branch `SPEC.md` acceptance criteria
- Loading, empty, and error states handled
- No secrets committed; env examples updated if new vars added
- Branch `SPEC.md` updated if scope/requirements changed during implementation

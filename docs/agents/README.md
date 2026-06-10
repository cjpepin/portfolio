# Agent Workflow — Portfolio Monorepo

Multi-agent workflow for portfolio and cross-cutting monorepo work. Subprojects may keep their own agent docs (e.g. `projects/trellis/docs/agents/`).

## Roles

| Skill | When to use |
|-------|-------------|
| `product-plan-agent` | New feature, UX change, auth migration design, scope/acceptance criteria |
| `senior-dev-agent` | Implement an approved handoff |
| `senior-tester-agent` | Add or expand automated tests |
| `senior-qa-agent` | Acceptance, regression, release readiness |
| `repo-refactor-agent` | Explicit cleanup, security, or maintenance |
| `feature-workflow` | Route a request through the full sequence |

## Quick Start

1. **New work:** Start with `product-plan-agent`
2. **Approved plan:** Hand to `senior-dev-agent`
3. **Behavior changed:** Hand to `senior-tester-agent`
4. **Ready to ship:** Hand to `senior-qa-agent`

## Locations

- **Cursor:** `.cursor/skills/<skill-name>/SKILL.md`
- **Codex:** `.codex/skills/<skill-name>/SKILL.md` + `agents/openai.yaml`
- **Handoffs:** [`handoffs.md`](handoffs.md)
- **Repo baseline:** [`specifications/REPO_SPEC.md`](../../specifications/REPO_SPEC.md)
- **SDD workflow:** [`sdd.md`](../../sdd.md)

## Subproject Work

When changing only a subproject, read both root `AGENTS.md` and the subproject's `AGENTS.md`. Auth or routing changes always require root `REPO_SPEC.md` alignment.

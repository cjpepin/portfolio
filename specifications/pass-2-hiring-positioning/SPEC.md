# SPEC — Pass 2: Hiring Positioning

Branch: `feature/pass-2-hiring-positioning` (proposed)

Read first:
- [`specifications/REPO_SPEC.md`](../REPO_SPEC.md)

## Goal

Evolve the portfolio from an API-docs shell into a hiring-focused full-stack showcase for **FTE and contract** audiences — instant human-readable positioning, case-study depth, and Trellis showcase parity with LingoLeaf.

## Scope (In)

### 1. Structured hiring content

- `positioning`, `metrics` in [`apps/portfolio/src/data/profile.ts`](../../apps/portfolio/src/data/profile.ts)
- Case studies in [`apps/portfolio/src/data/caseStudies.ts`](../../apps/portfolio/src/data/caseStudies.ts): Crosswalk, LingoLeaf
- Full-stack copy pass on role summaries and `info.description`

### 2. Hero strip (Overview)

- [`HeroStrip.tsx`](../../apps/portfolio/src/components/react/HeroStrip.tsx): headline, metrics, demo CTAs, featured case-study links
- Rendered above Overview Try-it-out panel (interactive) and in readable Overview

### 3. Readable / Interactive view toggle

- [`ViewModeContext.tsx`](../../apps/portfolio/src/components/react/ViewModeContext.tsx) with `localStorage` persistence
- Readable mode: full-width layout, inline previews for all sections
- Interactive mode: auto-execute Overview on first load

### 4. Case study pages

- `/case-studies/crosswalk`, `/case-studies/lingoleaf`
- Deep-dive links from Contributions (Crosswalk) and Projects (LingoLeaf)

### 5. Trellis showcase parity

- `/trellis#showcase`: video/cards/story tabs
- `/trellis#try-demo`: existing desktop preview
- Asset README at `public/trellis/showcase/`

## Scope (Out)

- Real `/api/v1/*` Cloudflare endpoints + `openapi.json`
- Additional case studies (Repo Magik, Mastercard CD)
- Blog/CMS, auth centralization

## Acceptance Criteria

- [x] Overview shows HeroStrip with metrics and demo CTAs without clicking Execute
- [x] Readable mode shows full experience, contributions, and projects inline; preference persists
- [x] Interactive mode auto-populates preview on first load
- [x] `/case-studies/crosswalk` and `/case-studies/lingoleaf` render complete narratives with architecture section
- [x] `/trellis#showcase` shows video/cards/tabs; portfolio Projects panel links showcase first
- [x] Copy clearly positions full-stack + FTE/contract availability
- [x] `npm run build` in `apps/portfolio` passes; mobile nav and both view modes work

## Verification Plan

```bash
cd apps/portfolio && npm run build
```

Manual:
- Landing hero visible without Execute
- Toggle Readable ↔ Interactive; reload persists mode
- Visit case study URLs; follow deep-dive links from Contributions/Projects
- `/trellis#showcase` and `#try-demo` hash navigation
- Mobile menu + view mode toggle

## Affected Areas

```text
apps/portfolio/src/data/profile.ts
apps/portfolio/src/data/caseStudies.ts
apps/portfolio/src/components/react/HeroStrip.tsx
apps/portfolio/src/components/react/ViewModeContext.tsx
apps/portfolio/src/components/react/ViewModeToggle.tsx
apps/portfolio/src/components/react/PortfolioShell.tsx
apps/portfolio/src/components/react/sections/*
apps/portfolio/src/components/react/CaseStudyPage.tsx
apps/portfolio/src/components/react/TrellisShowcase*.tsx
apps/portfolio/src/pages/case-studies/*
apps/portfolio/public/trellis/showcase/README.md
specifications/pass-2-hiring-positioning/SPEC.md
```

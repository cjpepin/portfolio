# SPEC — Pass 1: Portfolio Shell + Demos

Branch: `feature/portfolio-pass-1` (proposed)

Read first:
- [`specifications/REPO_SPEC.md`](../REPO_SPEC.md)

This file defines the implementation delta for the first portfolio pass.

## Goal

Ship a high-performance, Swagger UI–styled portfolio at connorjpepin.com that presents Connor Pepin as living API documentation — with embedded LingoLeaf demo and visual project showcases. No auth centralization in this pass.

## Current State

- Root repo has agent workflow, SDD, and REPO_SPEC; no `apps/` yet
- Subprojects are self-contained under `projects/`
- LingoLeaf has a web demo export (`projects/lingoleaf` demo mode) intended for portfolio embed
- lingoleaf-web serves `/lingoleaf/*` on Cloudflare Pages independently

## Scope (In)

### 1. Scaffold `apps/portfolio` (Astro + React)

- Astro 5 with React islands for interactive sections only
- Tailwind CSS with Swagger UI–inspired dark theme (monospace, green accent `#49cc90`, dark `#1b1b1b` panels)
- Static content from structured data (`src/content/` or `src/data/profile.ts`)
- Cloudflare Pages adapter (`@astrojs/cloudflare`)

### 2. Information Architecture (Swagger metaphor)

| Section | Route | Metaphor | Content |
|---------|-------|----------|---------|
| Overview | `/` | API Info | Name, tagline, contact links, OpenAPI-style `info` block |
| Reference | `/reference` | Schemas | Skills, education, languages as typed schemas |
| Experience | `/experience` | Paths/Operations | Each role as an "endpoint" with expandable request/response (responsibilities, stack) |
| Backend & Systems | `/systems` | Swagger Try-it-out | Interactive panels for Mastercard, Crosswalk, Repo Magik — expandable operation detail |
| Frontend & Mobile | `/projects` | Visual gallery within doc shell | LingoLeaf, Trellis, Caralyst — cards with screenshots/video, link to live demos |
| LingoLeaf Demo | `/lingoleaf/demo` | Embedded product | iframe or static export from lingoleaf web demo |
| Contact | `/contact` | `POST /contact` | API-style form: request body fields, submit → JSON response UX; Resend or CF Function |

### 3. LingoLeaf Demo Integration

- Embed existing web demo from `projects/lingoleaf` (demo build export)
- Route: `/lingoleaf/demo` (preserve compatibility with lingoleaf-web path conventions)
- Lazy-load demo bundle; loading skeleton in Swagger panel style

### 4. Project Showcases (non-interactive demos OK)

- **LingoLeaf:** embed + App Store link + bullet features
- **Trellis:** screenshots/GIF + link to repo or future web demo; highlight local-first + AI architecture
- **Repo Magik / Crosswalk / Caralyst:** backend-style operation cards with stack tags

### 5. Performance Targets

- Landing: static HTML, minimal JS (< 50KB gzip critical path)
- Interactive islands hydrated on demand (Swagger panels, contact form, demo embed)
- Lighthouse 95+ performance on `/`

### 6. Content Source

- Single structured profile file derived from resume (not hardcoded in components)
- Easy to update without touching layout code

## Scope (Out — Pass 2+)

- Centralized Supabase auth migration
- Merging lingoleaf-web into monorepo deploy (may proxy in pass 1)
- Trellis live web demo
- Admin/analytics dashboard
- Blog or CMS

## Acceptance Criteria

- [x] `apps/portfolio` builds and runs locally (`npm run dev`)
- [x] Deploy config documented in README (Cloudflare Pages)
- [x] All sections navigable with Swagger-like sidebar + top bar
- [x] Profile content driven from structured data file
- [ ] LingoLeaf demo loads at `/lingoleaf/demo` (requires export to `public/lingoleaf/demo/embed/`)
- [x] Contact form with API-style request/response UX (Resend via CF Function)
- [x] Mobile-responsive; sidebar collapses to floating menu
- [x] `prefers-reduced-motion` respected

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Astro + React islands | Static-first, interactive where needed |
| Styling | Tailwind + custom Swagger tokens | Matches aesthetic, no heavy Swagger UI bundle |
| Contact backend | Cloudflare Pages Function + Resend | Matches lingoleaf-web pattern |
| Demo embed | Static export from lingoleaf demo build | Already prepared in subproject |
| Monorepo | npm workspaces at root (optional pass 1) | Can start with standalone `apps/portfolio` package.json |

## Affected Areas

```text
apps/portfolio/           # new
packages/content/           # optional shared profile schema
specifications/REPO_SPEC.md # update after pass 1 merge
README.md                   # root setup instructions
```

## Verification Plan

- `npm run build` in `apps/portfolio`
- Manual: all routes, mobile nav, contact form, demo embed
- Lighthouse on `/` and `/projects`
- Link check for external URLs (GitHub, App Store, LinkedIn)

## Risks

| Risk | Mitigation |
|------|------------|
| LingoLeaf demo bundle size | Lazy load + separate chunk; device frame from existing demo |
| Cloudflare routing for `/lingoleaf/*` vs lingoleaf-web | Path-based routing rules in CF; or subdomain for pass 1 |
| Swagger UI clone feels gimmicky | Focus on functional patterns (try-it-out expand, schema tables) not pixel-perfect clone |

## Suggested Build Order

1. Astro scaffold + Swagger layout shell (sidebar, topbar, panel components)
2. Structured profile data + static sections (Overview, Reference, Experience)
3. Backend `/systems` interactive panels
4. Frontend `/projects` gallery
5. LingoLeaf demo embed
6. POST /contact form + CF Function
7. Cloudflare deploy config + README

## Out of Scope

- Auth centralization (pass 2)
- Trellis auth/schema migration
- Automated E2E (add in pass 1.1 if time)

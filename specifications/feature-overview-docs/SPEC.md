# Overview Docs Reorganization + Interactive Endpoints

Branch-scoped spec for OpenAPI-style Overview reorganization and interactive endpoint polish.

Inherits [`REPO_SPEC.md`](../REPO_SPEC.md).

## Goal

Make the portfolio Overview read as real API documentation (info block, metrics, catalog, try-it panels) while preserving at-a-glance hiring context. Every section endpoint should feel like interactive Swagger docs.

## Scope

### In

- `ApiInfoPanel`, `ApiServerStats`, `ApiQuickLinks`, `ApiEndpointCatalog` replace `HeroStrip` in Overview
- `ApiTryItPanel` enhancements: dynamic status, response schemas, curl/fetch samples, `defaultExpanded`, `autoExecuteOnMount`
- Per-item endpoints for Experience and Contributions (matching Projects pattern)
- Schema explorer endpoints: `GET /components/schemas/{schema}`
- `GET /api/v1/metrics` executable endpoint
- Showcase streamlining: nav rail pins, `ProjectShowcaseStrip`, trimmed `ProjectPreview` CTAs

### Out

- Real `openapi.json` and Cloudflare `/api/v1/*` routes
- Nested sub-endpoint execution for contribution operations
- Separate `/reference` route

## Acceptance Criteria

- [x] Overview opens with OpenAPI info block, not a marketing gradient hero
- [x] Metrics and showcase links visible immediately without clicking Execute
- [x] Endpoint catalog lists all operations grouped by tag with working hash deep-links
- [x] Every `ApiTryItPanel` shows correct HTTP status, response schema, and curl/fetch samples
- [x] Experience and Contributions have per-item endpoint panels
- [x] LingoLeaf/Trellis reachable in ≤2 clicks from Overview
- [x] Readable and Interactive modes both work
- [x] `npm run build` in `apps/portfolio` passes

## Verification

```bash
cd apps/portfolio && npm run build
```

Manual:
- Overview: info → stats → quick links → catalog → developer endpoint (expanded)
- Execute schema endpoint; verify preview tags
- Deep-link `#projects-lingoleaf`; panel auto-expands and executes
- Nav rail showcase pins open `/lingoleaf/#showcase` and `/trellis#showcase`
- Toggle Readable ↔ Interactive; reload persists mode

## Affected Areas

```text
apps/portfolio/src/components/react/ApiInfoPanel.tsx
apps/portfolio/src/components/react/ApiServerStats.tsx
apps/portfolio/src/components/react/ApiQuickLinks.tsx
apps/portfolio/src/components/react/ApiEndpointCatalog.tsx
apps/portfolio/src/components/react/ApiTryItPanel.tsx
apps/portfolio/src/components/react/ProjectShowcaseStrip.tsx
apps/portfolio/src/components/react/ProjectPreview.tsx
apps/portfolio/src/components/react/CompactNavRail.tsx
apps/portfolio/src/components/react/SectionHeader.tsx
apps/portfolio/src/components/react/sections/*
apps/portfolio/src/lib/api/handlers.ts
apps/portfolio/src/lib/api/responseSchemas.ts
specifications/feature-overview-docs/SPEC.md
```

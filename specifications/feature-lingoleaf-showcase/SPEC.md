# LingoLeaf Showcase Mode

Branch-scoped spec for recruiter-first showcase on `/lingoleaf/` plus guided iframe demo.

Inherits [`REPO_SPEC.md`](../REPO_SPEC.md).

## Goal

Recruiters get product value in ~15 seconds (video + engineering story) without opening the app. Engineers can optionally use a guided tour (`mode=showcase`) or full explore demo (`mode=explore`).

## Scope

### In

- `#showcase` section on lingoleaf-web Index: video, engineering cards, tabbed story
- Lazy-loaded demo iframe with `mode=showcase|explore`
- In-app showcase mode: skip onboarding, auto-show ReaderTutorial in embed
- Home tutorial wired on HomeScreen (explore mode)
- Portfolio Projects panel: primary link to `#showcase`

### Out

- Dedicated Astro `/lingoleaf` project page
- Appetize.io native streaming
- Deep-link to live EPUB in showcase mode
- Extended 45s video cut

## Acceptance Criteria

- [x] `/lingoleaf/#showcase` shows video (or fallback), 3 engineering cards, tabbed story
- [x] Demo iframe lazy-loads; does not mount on initial page load
- [x] Guided tour opens embed with `?mode=showcase` and shows ReaderTutorial without onboarding
- [x] Explore opens `?mode=explore` with normal app behavior
- [x] Portfolio Projects panel links to `#showcase` first
- [x] Home tutorial auto-shows after onboarding in explore mode (fresh session)
- [x] `npm run build` in portfolio succeeds after sync

## Asset Paths (user-provided)

`projects/lingoleaf-web/public/showcase/`:

- `lingoleaf-recruiter.mp4`
- `lingoleaf-recruiter-poster.jpg`
- `read_translate.png`, `save.png`, `study.png`

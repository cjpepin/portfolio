# Trellis showcase assets

Place recruiter-facing media here for `/trellis#showcase`.

| File | Purpose |
|------|---------|
| `tab-chat.png` | Story tab: chat workspace |
| `tab-notes.png` | Story tab: markdown notes |
| `tab-graph.png` | Story tab: knowledge graph |

The page renders graceful fallbacks when files are missing.

## Recording story tab screenshots (desktop app)

Use the Trellis Electron app with the seeded preview workspace — the same UI embedded in the portfolio web demo.

```bash
cd projects/trellis
corepack enable
pnpm install
cp .env.example .env   # optional for cloud chat during capture
pnpm run desktop:recording
```

Options:

| Flag | Purpose |
|------|---------|
| `--skip-check` | Faster relaunch between takes |
| `--reset-preview` | Wipe and re-seed preview workspace (quit Trellis first) |
| `--personal` | Open personal workspace instead of demo preview |

The script hides DevTools, opens the **preview workspace** with shipped demo data by default, and prints a capture checklist.

Capture PNGs at the default 1440×960 window, or resize to 960×720 to match the portfolio embed.

After export, copy assets into this folder. Rebuild the static web demo if needed:

```bash
cd projects/trellis && bash scripts/export-web-demo.sh
cd ../../apps/portfolio && ./scripts/sync-trellis-demo.sh
```

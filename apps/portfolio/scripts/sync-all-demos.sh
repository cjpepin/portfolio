#!/usr/bin/env bash
# Export and sync all portfolio demo embeds (LingoLeaf + Trellis) for local dev or static build.
#
# Defaults (dev:all): rebuild exports when sources exist (LINGOLEAF_FORCE_EXPORT / TRELLIS_FORCE_EXPORT true).
# Skip rebuilds: SKIP_DEMO_BUILD=true
# LingoLeaf only:  LINGOLEAF_SKIP_EXPORT=true or TRELLIS_SKIP_EXPORT=true
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
LINGOLEAF_WEB_DEMO="$MONOREPO_ROOT/projects/lingoleaf-web/public/demo"
PORTFOLIO_LINGOLEAF_DEMO="$ROOT/public/lingoleaf/demo"

export LINGOLEAF_FORCE_EXPORT="${LINGOLEAF_FORCE_EXPORT:-true}"
export TRELLIS_FORCE_EXPORT="${TRELLIS_FORCE_EXPORT:-true}"

if [[ "${SKIP_DEMO_BUILD:-}" == "true" ]]; then
  echo "SKIP_DEMO_BUILD=true — syncing existing demo artifacts only." >&2
  export LINGOLEAF_FORCE_EXPORT=false
  export TRELLIS_FORCE_EXPORT=false
fi

echo "=== LingoLeaf web demo ===" >&2
"$SCRIPT_DIR/sync-lingoleaf-export.sh"
"$SCRIPT_DIR/sync-lingoleaf-demo.sh"

if [[ -d "$LINGOLEAF_WEB_DEMO" ]]; then
  echo "Copying LingoLeaf demo into portfolio public/ (Astro dev serves /lingoleaf/demo from here)…" >&2
  mkdir -p "$(dirname "$PORTFOLIO_LINGOLEAF_DEMO")"
  rm -rf "$PORTFOLIO_LINGOLEAF_DEMO"
  cp -R "$LINGOLEAF_WEB_DEMO" "$PORTFOLIO_LINGOLEAF_DEMO"
  echo "  portfolio: /lingoleaf/demo/embed/index.html" >&2
else
  echo "Warning: no LingoLeaf demo at $LINGOLEAF_WEB_DEMO — iframe may be stale or missing." >&2
fi

echo "=== Trellis web demo ===" >&2
"$SCRIPT_DIR/sync-trellis-export.sh"
"$SCRIPT_DIR/sync-trellis-demo.sh"

echo "" >&2
echo "All demo embeds synced." >&2
echo "  LingoLeaf: /lingoleaf#try-demo  → /lingoleaf/demo/embed/index.html" >&2
echo "  Trellis:   /trellis#try-demo    → /trellis/demo/embed/index.html" >&2

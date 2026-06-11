#!/usr/bin/env bash
# Clone LingoLeaf (if needed) and export the Expo web demo for portfolio embed.
#
# On Cloudflare Pages, projects/lingoleaf is not in git — this script shallow-clones
# into projects/lingoleaf so sync-lingoleaf-demo.sh can copy dist/web-demo into
# lingoleaf-web public/demo/ before the Vite build.
#
# Requires packages/demo-local from the portfolio repo (file: dep + Metro resolver).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
LINGOLEAF="$MONOREPO_ROOT/projects/lingoleaf"
DEMO_LOCAL="$MONOREPO_ROOT/packages/demo-local"
EXPORT_OUT="$LINGOLEAF/dist/web-demo"
LINGOLEAF_REPO="${LINGOLEAF_REPO:-https://github.com/cjpepin/lingoleaf.git}"
LINGOLEAF_REF="${LINGOLEAF_REF:-main}"

if [[ "${LINGOLEAF_SKIP_EXPORT:-}" == "true" ]]; then
  echo "Skipping LingoLeaf web demo export (LINGOLEAF_SKIP_EXPORT=true)." >&2
  exit 0
fi

if [[ -f "$EXPORT_OUT/index.html" && "${LINGOLEAF_FORCE_EXPORT:-}" != "true" ]]; then
  echo "Using existing LingoLeaf web demo export at $EXPORT_OUT" >&2
  exit 0
fi

if [[ ! -f "$DEMO_LOCAL/package.json" ]]; then
  echo "Missing @portfolio/demo-local at $DEMO_LOCAL — required for LingoLeaf web demo export." >&2
  exit 1
fi

echo "Installing @portfolio/demo-local dependencies…" >&2
(cd "$DEMO_LOCAL" && npm ci)

if [[ ! -f "$LINGOLEAF/package.json" ]]; then
  echo "LingoLeaf not found at $LINGOLEAF — cloning for export…" >&2
  mkdir -p "$(dirname "$LINGOLEAF")"
  git clone --depth 1 --branch "$LINGOLEAF_REF" "$LINGOLEAF_REPO" "$LINGOLEAF"
fi

if [[ ! -f "$LINGOLEAF/.env.demo" ]]; then
  if [[ -f "$LINGOLEAF/.env.demo.example" ]]; then
    cp "$LINGOLEAF/.env.demo.example" "$LINGOLEAF/.env.demo"
    echo "Created $LINGOLEAF/.env.demo from .env.demo.example" >&2
  else
    cat >"$LINGOLEAF/.env.demo" <<'EOF'
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_WEB_BASE_PATH=/lingoleaf/demo
EOF
    echo "Created minimal $LINGOLEAF/.env.demo" >&2
  fi
fi

echo "Installing LingoLeaf dependencies…" >&2
(cd "$LINGOLEAF" && npm ci)

echo "Exporting LingoLeaf web demo…" >&2
(cd "$LINGOLEAF" && npm run export:web-demo)

if [[ ! -f "$EXPORT_OUT/index.html" ]]; then
  echo "LingoLeaf web demo export failed — no index.html at $EXPORT_OUT" >&2
  exit 1
fi

echo "LingoLeaf web demo export ready at $EXPORT_OUT" >&2

#!/usr/bin/env bash
# Build Global//Debt (vinext) and sync a static export into portfolio public/.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
SOURCE="$MONOREPO_ROOT/projects/global-debt"
TARGET="$ROOT/public/global-debt/app"
BASE_PATH="${GLOBAL_DEBT_BASE_PATH:-/global-debt/app}"

if [[ ! -f "$SOURCE/package.json" ]]; then
  echo "Global//Debt not found at $SOURCE" >&2
  exit 1
fi

echo "Installing Global//Debt dependencies…" >&2
(cd "$SOURCE" && npm ci)

echo "Clearing stale vinext font cache…" >&2
rm -rf "$SOURCE/.vinext"

echo "Building Global//Debt with basePath=$BASE_PATH…" >&2
(
  cd "$SOURCE"
  GLOBAL_DEBT_BASE_PATH="$BASE_PATH" \
  GLOBAL_DEBT_METADATA_BASE="https://connorjpepin.com$BASE_PATH" \
  npm run build
)

if [[ ! -f "$SOURCE/dist/server/index.js" ]]; then
  echo "Build failed — no dist/server/index.js at $SOURCE/dist" >&2
  exit 1
fi

GLOBAL_DEBT_BASE_PATH="$BASE_PATH" node "$SCRIPT_DIR/prerender-global-debt.mjs"

if [[ ! -f "$TARGET/index.html" ]]; then
  echo "Prerender failed — no index.html at $TARGET" >&2
  exit 1
fi

if ! grep -q "${BASE_PATH}/assets/" "$TARGET/index.html"; then
  echo "Prerendered HTML is missing ${BASE_PATH}/assets/ paths." >&2
  echo "Check projects/global-debt/next.config.ts basePath." >&2
  exit 1
fi

echo "  landing: ${BASE_PATH}/"

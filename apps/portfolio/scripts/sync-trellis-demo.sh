#!/usr/bin/env bash
# Sync Trellis web demo export into the portfolio public folder.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${1:-$ROOT/../../projects/trellis/dist/web-demo}"
TARGET="$ROOT/public/trellis/demo"
EMBED="$TARGET/embed"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Missing demo export at $SOURCE" >&2
  echo "Run from trellis: bash scripts/export-web-demo.sh" >&2
  exit 1
fi

mkdir -p "$EMBED"

cp "$SOURCE/index.html" "$EMBED/index.html"
[[ -f "$SOURCE/favicon.png" ]] && cp "$SOURCE/favicon.png" "$TARGET/favicon.png"

rm -rf "$TARGET/assets"
[[ -d "$SOURCE/assets" ]] && cp -R "$SOURCE/assets" "$TARGET/assets"

echo "Synced Trellis demo to $TARGET"
echo "  iframe: /trellis/demo/embed/index.html"

#!/usr/bin/env bash
# Sync Trellis web demo export into the portfolio public folder.
#
# The demo is the same React UI as the Electron desktop app (preview workspace),
# built with VITE_DEMO_MODE=true and served from /trellis/demo/embed/index.html.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
SOURCE="${1:-$MONOREPO_ROOT/projects/trellis/dist/web-demo}"
TARGET="$ROOT/public/trellis/demo"
EMBED="$TARGET/embed"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Skipping Trellis demo sync — no export at $SOURCE" >&2
  echo "Existing public/trellis/demo/ is unchanged." >&2
  echo "To refresh: cd projects/trellis && bash scripts/export-web-demo.sh" >&2
  exit 0
fi

mkdir -p "$EMBED"

# Shell HTML lives under embed/ (iframe target); assets use /trellis/demo/* paths.
cp "$SOURCE/index.html" "$EMBED/index.html"
[[ -f "$SOURCE/favicon.png" ]] && cp "$SOURCE/favicon.png" "$TARGET/favicon.png"

rm -rf "$TARGET/assets" "$TARGET/demo-vault"
[[ -d "$SOURCE/assets" ]] && cp -R "$SOURCE/assets" "$TARGET/assets"
[[ -d "$SOURCE/demo-vault" ]] && cp -R "$SOURCE/demo-vault" "$TARGET/demo-vault"

echo "Synced Trellis demo to $TARGET"
echo "  iframe: /trellis/demo/embed/index.html"
echo "  vault:  /trellis/demo/demo-vault/"

#!/usr/bin/env bash
# Sync LingoLeaf Expo web demo export into lingoleaf-web public/ for Vite build.
#
# Expo export uses EXPO_PUBLIC_WEB_BASE_PATH (default /lingoleaf/demo), so _expo/
# and assets/ must live at public/demo/. index.html is served from embed/ so the
# SPA router does not intercept /lingoleaf/demo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
SOURCE="${1:-$MONOREPO_ROOT/projects/lingoleaf/dist/web-demo}"
TARGET="$MONOREPO_ROOT/projects/lingoleaf-web/public/demo"
EMBED="$TARGET/embed"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Skipping demo sync — no export at $SOURCE" >&2
  echo "Existing projects/lingoleaf-web/public/demo/ is unchanged." >&2
  echo "To refresh: cd projects/lingoleaf && npm run export:web-demo" >&2
  exit 0
fi

mkdir -p "$EMBED"

# Shell HTML lives under embed/ (iframe target)
cp "$SOURCE/index.html" "$EMBED/index.html"
cp "$SOURCE/metadata.json" "$EMBED/metadata.json"
[[ -f "$SOURCE/auth-redirect.html" ]] && cp "$SOURCE/auth-redirect.html" "$EMBED/auth-redirect.html"

# Asset paths in index.html reference /lingoleaf/demo/_expo and /lingoleaf/demo/assets
rm -rf "$TARGET/_expo" "$TARGET/assets"
cp -R "$SOURCE/_expo" "$TARGET/_expo"
[[ -d "$SOURCE/assets" ]] && cp -R "$SOURCE/assets" "$TARGET/assets"
[[ -f "$SOURCE/favicon.ico" ]] && cp "$SOURCE/favicon.ico" "$TARGET/favicon.ico"

echo "Synced LingoLeaf demo to $TARGET"
echo "  iframe: /lingoleaf/demo/embed/index.html"
echo "  assets: /lingoleaf/demo/_expo/ ..."

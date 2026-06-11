#!/usr/bin/env bash
# Build lingoleaf-web and sync into portfolio public/ (preserves Expo demo under demo/).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
SOURCE="$MONOREPO_ROOT/projects/lingoleaf-web"
TARGET="$ROOT/public/lingoleaf"
FUNCTIONS_SOURCE="$SOURCE/functions"
FUNCTIONS_TARGET="$ROOT/functions"
LINGOLEAF_WEB_REPO="${LINGOLEAF_WEB_REPO:-https://github.com/cjpepin/lingoleaf-web.git}"
LINGOLEAF_WEB_REF="${LINGOLEAF_WEB_REF:-main}"

if [[ ! -f "$SOURCE/package.json" ]]; then
  echo "lingoleaf-web not found at $SOURCE — cloning for build…" >&2
  mkdir -p "$(dirname "$SOURCE")"
  git clone --depth 1 --branch "$LINGOLEAF_WEB_REF" "$LINGOLEAF_WEB_REPO" "$SOURCE"
fi

echo "Installing lingoleaf-web dependencies…" >&2
(cd "$SOURCE" && npm ci)

echo "Building lingoleaf-web (demo mode)…" >&2
(cd "$SOURCE" && VITE_DEMO_MODE=true npm run build)

if [[ ! -f "$SOURCE/dist/index.html" ]]; then
  echo "Build failed — no dist/index.html at $SOURCE/dist" >&2
  exit 1
fi

if ! grep -q '/lingoleaf/assets/' "$SOURCE/dist/index.html"; then
  echo "Build output is missing /lingoleaf/assets/ paths in index.html." >&2
  echo "Check projects/lingoleaf-web/vite.config.ts base: \"/lingoleaf/\"" >&2
  exit 1
fi

mkdir -p "$TARGET"

# Copy SPA shell and hashed assets; skip demo/ (Expo mobile embed owned by portfolio).
for item in "$SOURCE/dist"/*; do
  name="$(basename "$item")"
  if [[ "$name" == "demo" ]]; then
    continue
  fi
  if [[ -d "$item" ]]; then
    rm -rf "$TARGET/$name"
    cp -R "$item" "$TARGET/$name"
  else
    cp "$item" "$TARGET/$name"
  fi
done

# Cloudflare Pages Functions for /lingoleaf/api/* (preserve portfolio SPA fallback handler).
if [[ -d "$FUNCTIONS_SOURCE/lingoleaf" ]]; then
  mkdir -p "$FUNCTIONS_TARGET/lingoleaf"
  if [[ -d "$FUNCTIONS_SOURCE/lingoleaf/api" ]]; then
    rm -rf "$FUNCTIONS_TARGET/lingoleaf/api"
    cp -R "$FUNCTIONS_SOURCE/lingoleaf/api" "$FUNCTIONS_TARGET/lingoleaf/api"
  fi
fi
if [[ -d "$FUNCTIONS_SOURCE/lib" ]]; then
  rm -rf "$FUNCTIONS_TARGET/lib"
  cp -R "$FUNCTIONS_SOURCE/lib" "$FUNCTIONS_TARGET/lib"
fi

echo "Synced lingoleaf-web to $TARGET"
echo "  landing: /lingoleaf/"
echo "  forum:   /lingoleaf/features"
echo "  admin:   /lingoleaf/admin/analytics"
echo "  demo:    /lingoleaf/demo (unchanged — Expo embed)"
echo "  api:     /lingoleaf/api/* (Pages Functions)"

#!/usr/bin/env bash
# Build lingoleaf-web and sync into portfolio public/ (preserves Expo demo under demo/).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/../../projects/lingoleaf-web"
TARGET="$ROOT/public/lingoleaf"

if [[ ! -f "$SOURCE/package.json" ]]; then
  echo "Missing lingoleaf-web at $SOURCE" >&2
  exit 1
fi

echo "Building lingoleaf-web (demo mode)…" >&2
(cd "$SOURCE" && VITE_DEMO_MODE=true npm run build)

if [[ ! -f "$SOURCE/dist/index.html" ]]; then
  echo "Build failed — no dist/index.html at $SOURCE/dist" >&2
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

echo "Synced lingoleaf-web to $TARGET"
echo "  landing: /lingoleaf/"
echo "  forum:   /lingoleaf/features"
echo "  admin:   /lingoleaf/admin/analytics"
echo "  demo:    /lingoleaf/demo (unchanged — Expo embed)"

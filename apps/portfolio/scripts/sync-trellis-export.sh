#!/usr/bin/env bash
# Build Trellis web demo export from the local monorepo checkout (or skip if cached).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
TRELLIS="$MONOREPO_ROOT/projects/trellis"
EXPORT_OUT="$TRELLIS/dist/web-demo"
TRELLIS_REPO="${TRELLIS_REPO:-https://github.com/cjpepin/trellis.git}"
TRELLIS_REF="${TRELLIS_REF:-main}"

if [[ "${TRELLIS_SKIP_EXPORT:-}" == "true" ]]; then
  echo "Skipping Trellis web demo export (TRELLIS_SKIP_EXPORT=true)." >&2
  exit 0
fi

if [[ -f "$EXPORT_OUT/index.html" && "${TRELLIS_FORCE_EXPORT:-}" != "true" ]]; then
  echo "Using existing Trellis web demo export at $EXPORT_OUT" >&2
  exit 0
fi

if [[ ! -f "$TRELLIS/package.json" ]]; then
  echo "Trellis not found at $TRELLIS — cloning for export…" >&2
  mkdir -p "$(dirname "$TRELLIS")"
  git clone --depth 1 --branch "$TRELLIS_REF" "$TRELLIS_REPO" "$TRELLIS"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required to export the Trellis web demo. Install: npm install -g pnpm" >&2
  exit 1
fi

EXPORT_SCRIPT="$TRELLIS/scripts/export-web-demo.sh"
if [[ ! -f "$EXPORT_SCRIPT" ]]; then
  echo "Trellis clone is missing scripts/export-web-demo.sh at $EXPORT_SCRIPT" >&2
  exit 1
fi

echo "Installing Trellis dependencies…" >&2
(cd "$TRELLIS" && pnpm install --frozen-lockfile 2>/dev/null || pnpm install)

echo "Exporting Trellis web demo…" >&2
(cd "$TRELLIS" && bash scripts/export-web-demo.sh)

if [[ ! -f "$EXPORT_OUT/index.html" ]]; then
  echo "Trellis web demo export failed — no index.html at $EXPORT_OUT" >&2
  exit 1
fi

echo "Trellis web demo export ready at $EXPORT_OUT" >&2

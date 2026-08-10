#!/usr/bin/env bash
# Portfolio dev server. Global//Debt is served from public/global-debt/app/ (synced static
# export), same as production — no separate vinext process or proxy config.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATIC_APP="$ROOT/public/global-debt/app/index.html"

if [[ ! -f "$STATIC_APP" ]]; then
  echo "Global//Debt static export missing — running sync:global-debt…" >&2
  "$ROOT/scripts/sync-global-debt.sh"
fi

cd "$ROOT"
exec env NODE_ENV=development "$ROOT/node_modules/.bin/astro" dev "$@"

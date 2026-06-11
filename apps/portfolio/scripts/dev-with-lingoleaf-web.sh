#!/usr/bin/env bash
# Run portfolio (Astro) and lingoleaf-web (Vite) dev servers together.
# Portfolio serves /lingoleaf/demo/* from public/; other /lingoleaf/* proxies to lingoleaf-web.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO="$(cd "$ROOT/../.." && pwd)"
PORTFOLIO="$ROOT"
LINGOLEAF_WEB="$MONOREPO/projects/lingoleaf-web"

if [[ ! -d "$LINGOLEAF_WEB/node_modules" ]]; then
  echo "Installing lingoleaf-web dependencies…" >&2
  (cd "$LINGOLEAF_WEB" && npm install)
fi

if [[ ! -d "$PORTFOLIO/node_modules" ]]; then
  echo "Installing portfolio dependencies…" >&2
  (cd "$PORTFOLIO" && npm install)
fi

echo "Syncing LingoLeaf demo bundle (if export exists)…" >&2
"$PORTFOLIO/scripts/sync-lingoleaf-demo.sh" || true

cleanup() {
  trap - EXIT INT TERM
  kill "$LINGOLEAF_PID" "$PORTFOLIO_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting lingoleaf-web on http://127.0.0.1:8080/lingoleaf/" >&2
(cd "$LINGOLEAF_WEB" && npm run dev -- --host 127.0.0.1) &
LINGOLEAF_PID=$!

echo "Waiting for lingoleaf-web…" >&2
ready=false
for _ in $(seq 1 40); do
  if curl -sf "http://127.0.0.1:8080/lingoleaf/" >/dev/null 2>&1; then
    ready=true
    break
  fi
  if ! kill -0 "$LINGOLEAF_PID" 2>/dev/null; then
    echo "lingoleaf-web exited before becoming ready" >&2
    exit 1
  fi
  sleep 0.5
done
if [[ "$ready" != true ]]; then
  echo "Timed out waiting for lingoleaf-web on port 8080" >&2
  exit 1
fi

echo "Starting portfolio on http://localhost:4321 (proxying /lingoleaf → lingoleaf-web; /lingoleaf/demo from public/)" >&2
(cd "$PORTFOLIO" && npm run dev) &
PORTFOLIO_PID=$!

wait "$PORTFOLIO_PID"

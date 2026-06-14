#!/usr/bin/env bash
# One command: rebuild demo embeds, then run portfolio + lingoleaf-web dev servers.
#
# Portfolio:  http://localhost:4321
# LingoLeaf:   http://localhost:4321/lingoleaf/  (proxied to lingoleaf-web :8080)
# Demos:       /lingoleaf#try-demo  /trellis#try-demo
#
# Faster restart (skip Expo/Vite rebuilds): SKIP_DEMO_BUILD=true npm run dev:all
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

"$SCRIPT_DIR/sync-all-demos.sh"

export SKIP_DEMO_SYNC=true
exec "$SCRIPT_DIR/dev-with-lingoleaf-web.sh"

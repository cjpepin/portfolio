#!/usr/bin/env bash
# Monorepo entrypoint: fresh demo embeds + portfolio dev server.
set -euo pipefail

MONOREPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$MONOREPO_ROOT/apps/portfolio/scripts/dev-with-demos.sh"

#!/usr/bin/env bash
# Build lingoleaf-web (including Expo demo from public/demo/) and sync into portfolio public/.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
SOURCE="$MONOREPO_ROOT/projects/lingoleaf-web"
TARGET="$ROOT/public/lingoleaf"
FUNCTIONS_SOURCE="$SOURCE/functions"
FUNCTIONS_TARGET="$ROOT/functions"
LINGOLEAF_WEB_REPO="${LINGOLEAF_WEB_REPO:-https://github.com/cjpepin/lingoleaf-web.git}"
LINGOLEAF_WEB_REF="${LINGOLEAF_WEB_REF:-main}"

read_dotenv_value() {
  local file="$1"
  local key="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi

  local raw
  raw="$(grep -E "^${key}=" "$file" 2>/dev/null | tail -1 || true)"
  if [[ -z "$raw" ]]; then
    return 1
  fi

  local value="${raw#*=}"
  value="${value%$'\r'}"
  if [[ "$value" =~ ^\".*\"$ ]]; then
    value="${value:1:-1}"
  elif [[ "$value" =~ ^\'.*\'$ ]]; then
    value="${value:1:-1}"
  fi

  printf '%s' "$value"
}

set_env_from_dotenv_if_empty() {
  local key="$1"
  local file="$2"
  if [[ -n "${!key:-}" ]]; then
    return 0
  fi

  local value
  value="$(read_dotenv_value "$file" "$key" || true)"
  if [[ -n "$value" ]]; then
    export "$key=$value"
  fi
}

load_lingoleaf_web_env() {
  local file
  local key
  for file in "$ROOT/.env" "$ROOT/.env.local" "$SOURCE/.env" "$SOURCE/.env.local"; do
    for key in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_SUPABASE_DB_SCHEMA SUPABASE_URL SUPABASE_ANON_KEY; do
      set_env_from_dotenv_if_empty "$key" "$file"
    done
  done
}

# Bash does not read .env automatically — parse only the keys we need (avoid sourcing values with <> etc.).
load_lingoleaf_web_env

export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-${SUPABASE_URL:-}}"
export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-${SUPABASE_ANON_KEY:-}}"
export VITE_SUPABASE_DB_SCHEMA="${VITE_SUPABASE_DB_SCHEMA:-lingoleaf}"

if [[ ! -f "$SOURCE/package.json" ]]; then
  echo "lingoleaf-web not found at $SOURCE — cloning for build…" >&2
  mkdir -p "$(dirname "$SOURCE")"
  git clone --depth 1 --branch "$LINGOLEAF_WEB_REF" "$LINGOLEAF_WEB_REPO" "$SOURCE"
fi

echo "Installing lingoleaf-web dependencies…" >&2
(cd "$SOURCE" && npm ci)

missing=()
if [[ -z "${VITE_SUPABASE_URL:-}" ]]; then
  missing+=("VITE_SUPABASE_URL")
fi
if [[ -z "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
  missing+=("VITE_SUPABASE_ANON_KEY")
fi
if (( ${#missing[@]} > 0 )); then
  echo "Missing build-time env vars for lingoleaf-web forum/auth: ${missing[*]}" >&2
  echo "Add to apps/portfolio/.env (or projects/lingoleaf-web/.env):" >&2
  echo "  VITE_SUPABASE_URL=https://<project>.supabase.co" >&2
  echo "  VITE_SUPABASE_ANON_KEY=<anon-key>" >&2
  echo "For CI, set the same vars on the portfolio Cloudflare Pages project (Production + Preview)." >&2
  echo "Note: SUPABASE_ANON_KEY alone is not enough — the Vite client bundle needs VITE_SUPABASE_ANON_KEY." >&2
  exit 1
fi

echo "Syncing LingoLeaf Expo demo into lingoleaf-web public/demo/…" >&2
"$SCRIPT_DIR/sync-lingoleaf-demo.sh"

VITE_HAS_DEMO=false
if [[ -f "$SOURCE/public/demo/embed/index.html" ]]; then
  VITE_HAS_DEMO=true
fi

echo "Building lingoleaf-web (demo mode)…" >&2
(
  cd "$SOURCE"
  VITE_DEMO_MODE=true \
  VITE_HAS_DEMO="$VITE_HAS_DEMO" \
  VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  VITE_SUPABASE_DB_SCHEMA="$VITE_SUPABASE_DB_SCHEMA" \
  npm run build
)

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

# Copy SPA shell, hashed assets, and Expo demo bundle.
for item in "$SOURCE/dist"/*; do
  name="$(basename "$item")"
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
echo "  demo:    /lingoleaf/demo (bundled from lingoleaf-web dist)"
echo "  api:     /lingoleaf/api/* (Pages Functions)"

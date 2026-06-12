#!/usr/bin/env bash
# Sync LingoLeaf Expo web demo export into lingoleaf-web public/ for Vite build.
#
# Expo export uses EXPO_PUBLIC_WEB_BASE_PATH (default /lingoleaf/demo), so _expo/
# and assets/ must live at public/demo/. index.html is served from embed/ so the
# SPA router does not intercept /lingoleaf/demo.
set -euo pipefail

# Cloudflare Pages skips any static path containing "node_modules". Expo exports icon
# fonts under assets/node_modules/... — rename and rewrite bundle URLs before deploy.
DEMO_ASSET_VENDOR_DIR="vendor-packages"

patch_web_demo_import_meta() {
  local root="$1"
  ROOT="$root" node <<'NODE'
const fs = require("fs");
const { execSync } = require("child_process");

const root = process.env.ROOT;
const pattern = /\(import\.meta\.env\?import\.meta\.env\.MODE:void 0\)/g;
const replacement = '"production"';
let patched = 0;

const files = execSync(
  `find ${JSON.stringify(root)} -path '*/_expo/static/js/web/AppEntry-*.js' 2>/dev/null || true`,
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes("import.meta")) continue;
  fs.writeFileSync(file, content.replace(pattern, replacement));
  console.log(`Patched import.meta in ${file}`);
  patched += 1;
}

if (patched === 0) {
  console.log(`No import.meta patches needed under ${root}`);
}
NODE
}

patch_web_demo_asset_paths() {
  local root="$1"
  ROOT="$root" VENDOR_DIR="$DEMO_ASSET_VENDOR_DIR" node <<'NODE'
const fs = require("fs");
const { execSync } = require("child_process");

const root = process.env.ROOT;
const vendorDir = process.env.VENDOR_DIR;
const from = "/lingoleaf/demo/assets/node_modules";
const to = `/lingoleaf/demo/assets/${vendorDir}`;
let patched = 0;

const files = execSync(
  `find ${JSON.stringify(root)} -path '*/_expo/static/js/web/AppEntry-*.js' 2>/dev/null || true`,
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes(from)) continue;
  fs.writeFileSync(file, content.split(from).join(to));
  console.log(`Patched asset paths in ${file}`);
  patched += 1;
}

if (patched === 0) {
  console.log(`No asset path patches needed under ${root}`);
}
NODE
}

relocate_demo_asset_vendor_dir() {
  local assets_root="$1/assets"
  if [[ ! -d "$assets_root/node_modules" ]]; then
    return 0
  fi
  rm -rf "$assets_root/$DEMO_ASSET_VENDOR_DIR"
  mv "$assets_root/node_modules" "$assets_root/$DEMO_ASSET_VENDOR_DIR"
  echo "Renamed demo assets/node_modules → assets/$DEMO_ASSET_VENDOR_DIR (Cloudflare Pages upload)" >&2
}

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT/../.." && pwd)"
SOURCE="${1:-$MONOREPO_ROOT/projects/lingoleaf/dist/web-demo}"
TARGET="$MONOREPO_ROOT/projects/lingoleaf-web/public/demo"
EMBED="$TARGET/embed"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Skipping demo sync — no export at $SOURCE" >&2
  echo "Existing projects/lingoleaf-web/public/demo/ is unchanged." >&2
  echo "To refresh locally: npm run sync:lingoleaf-export (or cd projects/lingoleaf && npm run export:web-demo)" >&2
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

if [[ ! -d "$TARGET/assets" ]]; then
  echo "Demo sync warning: missing $TARGET/assets (icon fonts will 404)." >&2
  echo "Re-run export: cd projects/lingoleaf && bash scripts/export-web-demo.sh" >&2
  exit 1
fi

relocate_demo_asset_vendor_dir "$TARGET"
[[ -f "$SOURCE/favicon.ico" ]] && cp "$SOURCE/favicon.ico" "$TARGET/favicon.ico"

# Expo loads AppEntry as a classic script; zustand ESM can emit import.meta until
# lingoleaf metro.config resolves CJS on web (see projects/lingoleaf/metro.config.js).
patch_web_demo_import_meta "$TARGET"
patch_web_demo_asset_paths "$TARGET"

feather_font="$(find "$TARGET/assets/$DEMO_ASSET_VENDOR_DIR" -name 'Feather*.ttf' 2>/dev/null | head -1 || true)"
if [[ -z "$feather_font" ]]; then
  echo "Demo sync warning: Feather.ttf missing under assets/$DEMO_ASSET_VENDOR_DIR." >&2
  exit 1
fi

echo "Synced LingoLeaf demo to $TARGET"
echo "  iframe: /lingoleaf/demo/embed/index.html"
echo "  assets: /lingoleaf/demo/_expo/ ..."

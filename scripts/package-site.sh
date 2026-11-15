#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# An allowlist keeps Terraform state and configuration out of the public bucket.
mkdir -p site
for file in index.html project.html styles.css content.js main.js; do
  cp "$file" site/
done
mkdir -p site/assets
cp -R assets/. site/assets/
python3 - <<'PY'
from pathlib import Path
allowed = {'.svg', '.webp', '.jpg', '.jpeg', '.png', '.avif', '.gif', '.pdf', '.woff', '.woff2'}
for path in Path('site').rglob('*'):
    if path.is_symlink():
        raise SystemExit(f'Symlinks are not allowed in the deployment: {path}')
    if path.is_file() and path.parent != Path('site') and path.suffix.lower() not in allowed:
        raise SystemExit(f'Unexpected public asset: {path}')
PY

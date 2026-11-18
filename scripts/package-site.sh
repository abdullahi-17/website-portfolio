#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Recreate the generated package so removed files cannot survive from an older run.
python3 - <<'PY'
from pathlib import Path
import shutil

package = Path('site')
if package.is_symlink():
    raise SystemExit('Refusing to package into a symlinked site directory.')
if package.exists():
    shutil.rmtree(package)
package.mkdir()
for name in ['index.html', 'project.html', 'styles.css', 'content.js', 'main.js']:
    source = Path(name)
    if source.is_symlink():
        raise SystemExit(f'Refusing to package a symlinked website file: {name}')
    shutil.copy2(source, package / name)
if Path('assets').is_symlink():
    raise SystemExit('Refusing to package a symlinked assets directory.')
shutil.copytree('assets', package / 'assets', symlinks=True)
PY
python3 scripts/validate-package.py site
npm run build:motion
python3 scripts/validate-package.py site

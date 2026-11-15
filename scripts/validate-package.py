"""Validate a public deployment package without copying or changing its files."""
from pathlib import Path
import sys

package = Path(sys.argv[1] if len(sys.argv) > 1 else 'site')
required = {'index.html', 'project.html', 'styles.css', 'content.js', 'main.js'}
asset_types = {'.svg', '.webp', '.jpg', '.jpeg', '.png', '.avif', '.gif', '.pdf', '.woff', '.woff2'}
if package.is_symlink() or not package.is_dir():
    raise SystemExit(f'Package directory missing or symlinked: {package}. Build or download the checked website artifact first.')
for name in required:
    if not (package / name).is_file():
        raise SystemExit(f'Missing required website file: {name}')
if not (package / 'assets').is_dir():
    raise SystemExit('Package is missing its assets directory.')
for path in package.rglob('*'):
    if path.is_symlink():
        raise SystemExit(f'Symlinks are not allowed in the deployment: {path}')
    relative = path.relative_to(package)
    if relative.parts[0] == 'assets':
        if path.is_file() and (path.name.startswith('.') or path.suffix.lower() not in asset_types):
            raise SystemExit(f'Unexpected public asset: {relative}')
    elif str(relative) not in required:
        raise SystemExit(f'Unexpected file or directory in website package: {relative}')
print('Website package contains only the required public files and permitted assets.')

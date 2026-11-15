"""Record repeatable delivery checks, not a Lighthouse score or an uptime claim."""
import datetime
import json
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlsplit

base = sys.argv[1].rstrip('/')
if urlsplit(base).scheme != 'https':
    raise SystemExit('Use an HTTPS URL.')
results = []
failed = False
for path in ['/', '/project.html?id=cloud-portfolio', '/styles.css', '/main.js', '/content.js']:
    result = subprocess.run([
        'curl', '--fail', '--silent', '--show-error', '--location', '--max-redirs', '3',
        '--proto', '=https', '--proto-redir', '=https', '--max-time', '30',
        '--output', '/dev/null', '--write-out', '%{json}', base + path
    ], capture_output=True, text=True)
    if result.returncode:
        failed = True
    try:
        timing = json.loads(result.stdout)
        results.append({
            'path': path, 'http_status': timing['http_code'],
            'dns_seconds': timing['time_namelookup'],
            'time_to_first_byte_seconds': timing['time_starttransfer'],
            'total_seconds': timing['time_total'],
            'bytes': timing['size_download'], 'error': result.stderr or None
        })
    except (ValueError, KeyError):
        failed = True
        results.append({'path': path, 'error': result.stderr or 'Invalid curl response'})
report = {
    'measured_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'base_url': base, 'method': 'Single curl request per URL from this runner; not Core Web Vitals or uptime.',
    'results': results
}
Path('reports').mkdir(exist_ok=True)
Path('reports/delivery.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
sys.exit(1 if failed else 0)

"""Check local page/asset links before publishing; use only the Python standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate ID in {self.filename}'
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])

pages = {}
for filename in ('index.html', 'project.html'):
    page = Page(filename)
    page.feed((root / filename).read_text())
    pages[filename] = page
for filename, page in pages.items():
    for link in page.links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc:
            continue
        target = parts.path or filename
        assert (root / target).is_file(), f'Missing local file: {link}'
        if parts.fragment and target in pages:
            assert parts.fragment in pages[target].ids, f'Missing section: {link}'
print('Local HTML links, IDs and asset paths passed.')

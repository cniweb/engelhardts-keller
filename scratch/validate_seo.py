import glob
import re
import json
import sys
import xml.etree.ElementTree as ET

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

files = [
    'index.html', 'speisekarte.html', 'oeffnungszeiten.html',
    'zimmer.html', 'chronik.html', 'fotos.html',
    'umgebung.html', 'anfahrt.html', 'impressum.html'
]

print("=== Prüfe JSON-LD in HTML-Dateien ===")
for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    match = re.search(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    if not match:
        print(f"❌ FEHLT: JSON-LD in {f}")
        continue
    try:
        data = json.loads(match.group(1).strip())
        graph = data.get('@graph', [data])
        types = [item.get('@type') for item in graph]
        print(f"✅ {f}: {len(graph)} Entitäten ({types})")
    except Exception as e:
        print(f"❌ FEHLER in {f}: {e}")

print("\n=== Prüfe sitemap.xml ===")
try:
    tree = ET.parse('sitemap.xml')
    root = tree.getroot()
    urls = [loc.text for loc in root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    print(f"✅ sitemap.xml ist valides XML mit {len(urls)} URLs:")
    for u in urls:
        print(f"   - {u}")
        assert "admin" not in u, f"Admin gefunden in Sitemap: {u}"
except Exception as e:
    print(f"❌ FEHLER in sitemap.xml: {e}")

print("\n=== Prüfe robots.txt ===")
try:
    with open('robots.txt', encoding='utf-8') as fh:
        robots = fh.read()
    assert "Disallow: /admin/" in robots
    assert "Disallow: /admin.html" in robots
    assert "Sitemap: https://www.engelhardts-keller.de/sitemap.xml" in robots
    print("✅ robots.txt schließt Admin aus und verweist auf Sitemap.")
except Exception as e:
    print(f"❌ FEHLER in robots.txt: {e}")

print("\n=== Prüfe llms.txt & llms-full.txt ===")
try:
    with open('llms.txt', encoding='utf-8') as fh:
        llms = fh.read()
    assert "Engelhardt's Keller" in llms
    print(f"✅ llms.txt vorhanden ({len(llms)} Zeichen)")

    with open('llms-full.txt', encoding='utf-8') as fh:
        llms_full = fh.read()
    assert "Kellerliebe" in llms_full
    print(f"✅ llms-full.txt vorhanden ({len(llms_full)} Zeichen)")
except Exception as e:
    print(f"❌ FEHLER in llms.txt / llms-full.txt: {e}")

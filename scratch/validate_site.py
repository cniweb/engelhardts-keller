#!/usr/bin/env python3
"""
validate_site.py - Asset- und Link-Validierung für Engelhardt's Keller
Überprüft alle HTML-Seiten, referenzierte Assets (CSS, JS, Bilder, Favicons)
und JSON-Datensätze auf lokale Existenz und Unversehrtheit.
"""

import os
import re
import sys
import json
from pathlib import Path
from html.parser import HTMLParser

WORKSPACE = Path(__file__).resolve().parent.parent

class AssetExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        # Scripts
        if tag == 'script' and 'src' in attr_dict:
            self.assets.append((tag, attr_dict['src']))
        # Stylesheets & Favicons & Links
        elif tag == 'link' and 'href' in attr_dict:
            rel = attr_dict.get('rel', '')
            if 'stylesheet' in rel or 'icon' in rel:
                self.assets.append((tag, attr_dict['href']))
            else:
                self.links.append((tag, attr_dict['href']))
        # Images
        elif tag == 'img' and 'src' in attr_dict:
            self.assets.append((tag, attr_dict['src']))
        # Anchor links
        elif tag == 'a' and 'href' in attr_dict:
            self.links.append((tag, attr_dict['href']))

def is_external(url):
    return (
        url.startswith('http://') or
        url.startswith('https://') or
        url.startswith('//') or
        url.startswith('mailto:') or
        url.startswith('tel:') or
        url.startswith('#') or
        url.startswith('javascript:') or
        url.startswith('data:')
    )

def validate_html_files():
    html_files = list(WORKSPACE.glob('*.html')) + list(WORKSPACE.glob('admin/*.html'))
    errors = []
    checked_assets = 0
    checked_links = 0

    print(f"=== Prüfe {len(html_files)} HTML-Dateien ===")

    for html_path in sorted(html_files):
        rel_html = html_path.relative_to(WORKSPACE)
        try:
            content = html_path.read_text(encoding='utf-8')
        except Exception as e:
            errors.append(f"Fehler beim Lesen von {rel_html}: {e}")
            continue

        parser = AssetExtractor()
        try:
            parser.feed(content)
        except Exception as e:
            errors.append(f"HTML-Syntaxfehler in {rel_html}: {e}")
            continue

        # Check assets (css, js, img)
        for tag, src in parser.assets:
            if is_external(src):
                continue
            checked_assets += 1
            # Strip query params or hash
            clean_src = src.split('?')[0].split('#')[0]
            target = (html_path.parent / clean_src).resolve()
            if not target.exists():
                errors.append(f"[{rel_html}] Asset fehlt: <{tag} src/href='{src}'> -> {target}")

        # Check local anchor links
        for tag, href in parser.links:
            if is_external(href):
                continue
            checked_links += 1
            clean_href = href.split('?')[0].split('#')[0]
            if not clean_href:
                continue
            target = (html_path.parent / clean_href).resolve()
            if not target.exists():
                errors.append(f"[{rel_html}] Link-Ziel fehlt: <a href='{href}'> -> {target}")

    print(f"Geprüfte lokale Assets: {checked_assets}")
    print(f"Geprüfte lokale Links:  {checked_links}")
    return errors

def validate_json_data():
    errors = []
    data_dir = WORKSPACE / 'data'
    json_files = ['settings.json', 'menu.json', 'gallery.json', 'events.json']

    print(f"\n=== Prüfe JSON-Datensätze in data/ ===")

    for jf in json_files:
        path = data_dir / jf
        if not path.exists():
            errors.append(f"Fehlende Datendatei: data/{jf}")
            continue
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
            print(f"  [OK] data/{jf} (valides JSON)")
        except Exception as e:
            errors.append(f"JSON-Fehler in data/{jf}: {e}")
            continue

        # Check image paths in gallery.json
        if jf == 'gallery.json':
            items = data.get('items', [])
            for item in items:
                src = item.get('src', '')
                if src and not is_external(src):
                    target = (WORKSPACE / src).resolve()
                    if not target.exists():
                        errors.append(f"[gallery.json] Bild fehlt: {src}")

        # Check image paths in events.json
        if jf == 'events.json':
            events = data.get('events', [])
            for ev in events:
                src = ev.get('image', '')
                if src and not is_external(src):
                    target = (WORKSPACE / src).resolve()
                    if not target.exists():
                        errors.append(f"[events.json] Event-Bild fehlt: {src}")

    return errors

def main():
    print(f"Starte Site-Validierung im Workspace: {WORKSPACE}\n")
    html_errors = validate_html_files()
    json_errors = validate_json_data()

    all_errors = html_errors + json_errors
    print("\n" + "=" * 50)
    if all_errors:
        print(f"FEHLER: {len(all_errors)} Problem(e) gefunden:")
        for err in all_errors:
            print(f"  ❌ {err}")
        sys.exit(1)
    else:
        print("ERFOLG: Alle HTML-Dateien und JSON-Datensätze sind fehlerfrei!")
        print("        0 fehlende Dateien, alle relativen Pfade und Assets existieren lokal.")
        print("=" * 50)
        sys.exit(0)

if __name__ == '__main__':
    main()

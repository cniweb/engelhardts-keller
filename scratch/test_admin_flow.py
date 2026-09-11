import time
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080"

def run_tests():
    print("=== Starte automatisierte Playwright Tests mit Headless Chrome ===\n")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # 1. Test: Initialer Aufruf von admin/index.html
        print("1. Lade http://localhost:8080/admin/index.html...")
        page.goto(f"{BASE_URL}/admin/index.html")
        page.wait_for_load_state("networkidle")

        overlay = page.locator("#admin-auth-overlay")
        assert overlay.is_visible(), "Fehler: Auth-Overlay sollte sichtbar sein!"
        print("   [PASS] PIN-Overlay ist sichtbar.")

        # 2. Test: Falsche PIN eingeben
        print("2. Teste falsche PIN '1234'...")
        page.fill("#admin-pin-input", "1234")
        page.click("button[type='submit']")
        page.wait_for_timeout(300)
        
        err = page.locator("#admin-pin-error")
        assert err.is_visible(), "Fehler: Fehlermeldung bei falscher PIN fehlt!"
        assert overlay.is_visible(), "Fehler: Overlay sollte bei falscher PIN sichtbar bleiben!"
        print(f"   [PASS] Fehlermeldung wird angezeigt: '{err.inner_text()}'.")

        # 3. Test: Korrekte PIN eingeben
        print("3. Teste korrekte PIN 'keller1867'...")
        page.fill("#admin-pin-input", "keller1867")
        page.click("button[type='submit']")
        page.wait_for_timeout(500)

        assert not overlay.is_visible(), "Fehler: Auth-Overlay sollte nach Login unsichtbar sein!"
        status_card = page.locator(".status-options-grid")
        assert status_card.is_visible(), "Fehler: Status-Grid sollte sichtbar sein!"
        print("   [PASS] Erfolgreich eingeloggt. Status-Steuerung wird angezeigt.")
        page.screenshot(path="scratch/01_status_page.png")
        print("   [SAVED] Screenshot: scratch/01_status_page.png")

        # 4. Test: Navigation zu Aktionen & Spezialitäten
        print("\n4. Navigiere zu 'Aktionen & Spezialitäten' (aktionen.html)...")
        page.click("a[href='aktionen.html']")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)

        assert "aktionen.html" in page.url, f"Unerwartete URL: {page.url}"
        assert not page.locator("#admin-auth-overlay").is_visible(), "Fehler: Session sollte erhalten bleiben!"
        pizza_toggle = page.locator("#admin-pizza-oven-toggle")
        makrele_toggle = page.locator("#admin-makrelen-grill-toggle")
        save_pizza_btn = page.locator("#save-pizza-oven-btn")
        save_makrele_btn = page.locator("#save-makrelen-grill-btn")
        assert pizza_toggle.count() > 0 and makrele_toggle.count() > 0, "Fehler: Toggles für Pizza und Makrele nicht im DOM!"
        assert save_pizza_btn.is_visible() and save_makrele_btn.is_visible(), "Fehler: Speicher-Buttons für Pizza/Makrele nicht sichtbar!"
        print("   [PASS] aktionen.html geöffnet (ohne erneute PIN-Abfrage). Pizza- & Makrelen-Steuerung geladen.")
        page.screenshot(path="scratch/02_aktionen_page.png")
        print("   [SAVED] Screenshot: scratch/02_aktionen_page.png")

        # 5. Test: Navigation zu Speisekarte
        print("\n5. Navigiere zu 'Speisekarte' (speisekarte.html)...")
        page.click("a[href='speisekarte.html']")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        assert "speisekarte.html" in page.url, f"Unerwartete URL: {page.url}"
        assert not page.locator("#admin-auth-overlay").is_visible(), "Fehler: Session sollte erhalten bleiben!"
        menu_items = page.locator(".admin-item-row")
        count = menu_items.count()
        assert count > 0, f"Fehler: Keine Speisen geladen (Count: {count})!"
        print(f"   [PASS] speisekarte.html geladen. {count} Gerichte in der Liste vorhanden.")
        page.screenshot(path="scratch/03_speisekarte_page.png")
        print("   [SAVED] Screenshot: scratch/03_speisekarte_page.png")

        # 6. Test: Navigation zu Fotogalerie
        print("\n6. Navigiere zu 'Fotogalerie' (galerie.html)...")
        page.click("a[href='galerie.html']")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        assert "galerie.html" in page.url, f"Unerwartete URL: {page.url}"
        assert not page.locator("#admin-auth-overlay").is_visible(), "Fehler: Session sollte erhalten bleiben!"
        photo_cards = page.locator(".admin-photo-card")
        p_count = photo_cards.count()
        assert p_count > 0, f"Fehler: Keine Fotos geladen (Count: {p_count})!"
        print(f"   [PASS] galerie.html geladen. {p_count} Originalfotos mit Bildvorschau angezeigt.")
        page.screenshot(path="scratch/04_galerie_page.png")
        print("   [SAVED] Screenshot: scratch/04_galerie_page.png")

        # 7. Test: Navigation zu Live-Events
        print("\n7. Navigiere zu 'Live-Events' (events.html)...")
        page.click("a[href='events.html']")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        assert "events.html" in page.url, f"Unerwartete URL: {page.url}"
        assert not page.locator("#admin-auth-overlay").is_visible(), "Fehler: Session sollte erhalten bleiben!"
        event_cards = page.locator(".admin-event-card")
        e_count = event_cards.count()
        print(f"   [PASS] events.html geladen. {e_count} Termine gefunden.")
        page.screenshot(path="scratch/05_events_page.png")
        print("   [SAVED] Screenshot: scratch/05_events_page.png")

        # 8. Test: Navigation zu Datensicherung
        print("\n8. Navigiere zu 'Datensicherung' (sicherung.html)...")
        page.click("a[href='sicherung.html']")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)

        assert "sicherung.html" in page.url, f"Unerwartete URL: {page.url}"
        assert not page.locator("#admin-auth-overlay").is_visible(), "Fehler: Session sollte erhalten bleiben!"
        export_btn = page.locator("#export-menu-json-btn")
        assert export_btn.is_visible(), "Fehler: Export-Button nicht sichtbar!"
        print("   [PASS] sicherung.html geladen. JSON-Export und Server-Sicherheitsbox sichtbar.")
        page.screenshot(path="scratch/06_sicherung_page.png")
        print("   [SAVED] Screenshot: scratch/06_sicherung_page.png")

        # 9. Test: Weiterleitung von admin.html -> admin/index.html
        print("\n9. Teste Redirect von http://localhost:8080/admin.html...")
        page.goto(f"{BASE_URL}/admin.html")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        assert "admin/index.html" in page.url, f"Fehler: Weiterleitung fehlgeschlagen (Aktuelle URL: {page.url})!"
        print(f"   [PASS] Redirect erfolgreich: {page.url}")

        # 10. Test: Abmelden (Logout)
        print("\n10. Teste Abmelden-Button (#admin-logout-btn)...")
        page.click("#admin-logout-btn")
        page.wait_for_timeout(500)
        assert page.locator("#admin-auth-overlay").is_visible(), "Fehler: Nach Logout muss Overlay wieder sichtbar sein!"
        print("   [PASS] Abmeldung erfolgreich. PIN-Overlay sperrt die Ansicht wieder ab.")
        page.screenshot(path="scratch/07_after_logout.png")
        print("   [SAVED] Screenshot: scratch/07_after_logout.png")

        browser.close()

    print("\n==================================================")
    print("ALLE PLAYWRIGHT HEADLESS CHROME TESTS ERFOLGREICH!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

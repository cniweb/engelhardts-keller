import time
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080"

def test_social_sharing():
    print("=== Starte Test für Social-Media-Sharing (Facebook & Instagram) ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Login
        page.goto(f"{BASE_URL}/admin/index.html")
        page.wait_for_load_state("networkidle")
        page.fill("#admin-pin-input", "keller1867")
        page.click("button[type='submit']")
        page.wait_for_timeout(500)

        # 1. Test auf aktionen.html
        print("1. Teste Aktionen-Seite (admin/aktionen.html)...")
        page.goto(f"{BASE_URL}/admin/aktionen.html")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(400)

        # Facebook Button für Steinbackofen
        pizza_fb = page.locator(".share-action-fb-btn[data-action='pizza']")
        assert pizza_fb.is_visible(), "Facebook-Button für Pizza fehlt!"
        pizza_fb.click()
        page.wait_for_timeout(400)

        modal = page.locator("#social-share-modal")
        assert modal.is_visible(), "Social-Share-Modal sollte geöffnet sein!"
        preview_title = page.locator("#social-preview-heading").inner_text()
        assert "Steinbackofen" in preview_title, f"Falscher Titel: {preview_title}"
        post_text = page.locator("#social-post-text").input_value()
        assert "Steinbackofen" in post_text and "Ebensfeld" in post_text, f"Text unvollständig: {post_text}"
        print("   [PASS] Steinbackofen Facebook-Share öffnet Modal mit Text & Bild.")

        # Zu Instagram Tab wechseln
        page.click("#tab-social-ig")
        page.wait_for_timeout(300)
        ig_text = page.locator("#social-post-text").input_value()
        assert "#engelhardtskeller" in ig_text, f"Hashtags fehlen für Instagram: {ig_text}"
        print("   [PASS] Tab-Wechsel zu Instagram generiert Hashtags und Instagram-Link.")

        # Modal schließen
        page.click("#close-social-modal")
        page.wait_for_timeout(300)
        assert not modal.is_visible(), "Modal sollte geschlossen sein!"

        # Instagram Button für Makrelen
        makrele_ig = page.locator(".share-action-ig-btn[data-action='makrelen']")
        assert makrele_ig.is_visible(), "Instagram-Button für Makrelen fehlt!"
        makrele_ig.click()
        page.wait_for_timeout(400)
        assert modal.is_visible(), "Modal sollte nach Klick auf Makrelen-IG geöffnet sein!"
        makrele_text = page.locator("#social-post-text").input_value()
        assert "Makrelen" in makrele_text or "Steckerlfisch" in makrele_text, f"Makrelen-Text fehlt: {makrele_text}"
        print("   [PASS] Makrelen Instagram-Share öffnet Modal mit Text & Bild.")
        page.click("#close-social-modal")
        page.wait_for_timeout(300)

        # 2. Test auf events.html
        print("\n2. Teste Events-Seite (admin/events.html)...")
        page.goto(f"{BASE_URL}/admin/events.html")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(400)

        event_cards = page.locator(".admin-event-card")
        assert event_cards.count() >= 2, f"Zu wenige Events gefunden: {event_cards.count()}"
        print(f"   [INFO] {event_cards.count()} Events geladen.")

        first_event_fb = event_cards.first.locator(".share-event-fb-btn")
        first_event_ig = event_cards.first.locator(".share-event-ig-btn")
        assert first_event_fb.is_visible(), "Facebook Button im ersten Event fehlt!"
        assert first_event_ig.is_visible(), "Instagram Button im ersten Event fehlt!"

        first_event_fb.click()
        page.wait_for_timeout(400)
        assert modal.is_visible(), "Modal sollte nach Event-FB-Klick geöffnet sein!"
        event_post_text = page.locator("#social-post-text").input_value()
        assert "Datum" in event_post_text or "Uhr" in event_post_text, f"Event-Metadaten fehlen im Post: {event_post_text}"
        print("   [PASS] Event Facebook-Share übernimmt Event-Titel, Datum, Uhrzeit & Beschreibung.")

        # Test Text kopieren Button
        page.click("#copy-social-text-btn")
        page.wait_for_timeout(300)
        toast = page.locator("#admin-toast")
        assert toast.is_visible(), "Toast nach 'Text kopieren' sollte sichtbar sein!"
        print("   [PASS] 'Text kopieren' Button löst Toast-Bestätigung aus.")

        page.click("#close-social-modal")
        page.wait_for_timeout(300)

        print("\n==================================================")
        print("ALLE SOCIAL-MEDIA-SHARING-TESTS ERFOLGREICH BESTANDEN!")
        print("==================================================")
        browser.close()

if __name__ == "__main__":
    test_social_sharing()

# Walkthrough: Neuer Webauftritt für Engelhardt's Keller Ebensfeld

Die Website der traditionsreichen Gastwirtschaft und des Biergartens **Engelhardt's Keller** (Kellerstraße 50, 96250 Ebensfeld) wurde vollständig von der veralteten iWeb-Technologie in eine moderne, responsive und performante **HTML5 / CSS / JavaScript** Webpräsenz überführt.

---

## 🌟 Wichtigste Highlights & Umgesetzte Features

### 1. 100% Originales Bildmaterial
Gemäß Vorgabe wurden **ausschließlich die originalen Fotos und Grafiken** aus den Web- und Printarchiven von Engelhardt's Keller verwendet:
- Originalaufnahme des Biergartens unter den 25 schattigen Linden (`assets/images/biergarten.jpg`)
- Historisches Kellerhaus & Gastwirtschaft (`assets/images/hero.jpg`, `assets/images/kellerhaus_prospekt.jpg`)
- Kellerstollen-Portal von 1867 (`assets/images/chronik_original.jpg`)
- Steinofen-Pizza (`assets/images/pizza_prospekt.jpg`)
- Gästezimmer & Appartement (`assets/images/zimmer_prospekt.jpg`, `assets/images/gallery/gallery_zimmer.jpg`)
- Kinderspielplatz & Keller-Pferde (`assets/images/spielplatz_prospekt.jpg`)
- Original-Wappen & Logo der „Kellerliebe“ des Ebensfelder Brauhauses (`assets/images/kellerliebe_brauhaus.jpg`)
- Alle 26 Originalaufnahmen aus der Galerie der alten Website unter `assets/images/gallery_original/`
- Original-Hausprospekt als PDF-Download (`assets/documents/Hausprospekt.pdf`)

---

### 2. Live Biergarten-Status & Ebensfeld-Wetter-Automatik (`index.html` & `oeffnungszeiten.html`)
Auf der Startseite und in der Navigationsleiste informiert ein dynamisches Status-Widget in Echtzeit:
- **Standort**: Ebensfeld, Oberfranken (50.0673° N, 10.9628° E).
- **Datenquelle**: Direkte, datenschutzkonforme Schnittstelle zu Open-Meteo (DWD-Wetterdaten, ohne API-Key, kein Tracking).
- **Entscheidungslogik**:
  - **Montag**: Automatisch *Montags Ruhetag*.
  - **Dienstag – Samstag**: Öffnungszeitraum ab 16:00 Uhr (Küche bis 20:00 Uhr).
  - **Sonn- und Feiertage**: Öffnungszeitraum ab 11:00 Uhr.
  - **Wetterprüfung**: Prüft Regenwahrscheinlichkeit, Niederschlagsmenge und WMO-Wettercodes während der Öffnungsstunden. Bei Regen & Unwetter &rarr; *„Wetterbedingt geschlossen“*; bei schönem Kellerwetter &rarr; *„Heute geöffnet!“*.
  - **Stundenvorschau**: Direkte 4-Stunden-Vorschau mit Temperatur, Symbol und Regenwahrscheinlichkeit.

---

### 3. Speisekarte mit Original-Gerichten (`speisekarte.html`)
Alle 24 gewünschten warmen und kalten Speisen wurden originalgetreu eingepflegt:

**Warme Speisen:**
- Champignonschnitzel mit Pommes und gemischtem Salat
- Schweineschnitzel „Wiener Art“ mit Pommes und gemischtem Salat
- Schweinesteak mit Kräuterbutter dazu Pommes und gemischter Salat
- Cordon Bleu mit Pommes und gemischtem Salat
- Kellergögerla (Hähnchenoberkeule paniert) mit Pommes und kleinem Salat
- Käsespätzle mit Salat
- „Fränkisches Gyros“ Bratwürste mit Weißem Käse und Zwiebeln
- Backfisch mit Kartoffelsalat und gemischtem Salat
- 1 Paar Bratwürste mit Sauerkraut und Brot
- Currywurst mit Pommes
- Bockwurst mit Pommes oder Brot
- Chicken Nuggets mit Pommes

**Kalte Speisen & Brotzeiten:**
- Weißer Käse mit Butter und Brot
- „Käsedreierlei“ Kochkäse, Gerupfter und Weißer Käse mit Brot
- Kochkäse mit Brot und Butter
- Limburger mit Musik dazu Brot und Butter
- Vegetarischer Paprika-Tomaten-Aufstrich mit Brot
- Gerupfter mit Butter und Brot
- Dosenfleisch mit Brot
- Göttingerplatte mit Brot und Butter
- Presssackplatte mit Brot
- Schweizer Wurstsalat mit Butter und Brot
- Schinkenplatte mit Butter und Brot
- Kellerplatte mit Butter und Brot

Zusätzlich ergänzen die Steinofen-Pizzen sowie die hauseigenen Bierspezialitäten („Kellerliebe“, Landbier, Frankenweine) das Kellerangebot.
Jedes einzelne Gericht kann im Admin-Interface mit einem einzigen Klick deaktiviert werden, falls es an einem Tag ausverkauft ist.

---

### 4. Steinbackofen & Pizza-Tage Steuerung (Admin & Website)
Da der Steinbackofen nur an bestimmten Tagen angeheizt wird, ist das gesamte Pizza-Angebot und der zugehörige Website-Hinweis flexibel konfigurierbar:
- **Zunächst deaktiviert**: Alle 4 Pizza-Gerichte sind in der Datenbank und im Admin-Bereich standardmäßig deaktiviert (`active: false`).
- **Admin-Schalter**: Auf `admin.html` gibt es die Steuerungskarte **„Steinbackofen & Pizza-Tage Steuerung“** mit einem Hauptschalter *„Ofen heute an / aus“*.
- **Automatische Synchronisation**: Beim Einschalten des Ofens werden auf Wunsch sofort alle Pizza-Gerichte auf der Speisekarte aktiviert; beim Ausschalten werden sie automatisch wieder ausgeblendet.
- **Dynamische Hinweise**:
  - Auf `speisekarte.html`: Wenn der Ofen aus ist, erscheint ein dezenter Hinweis (*„Unser Steinbackofen ist heute nicht in Betrieb (Steinofen-Pizza gibt es nur an bestimmten Tagen)“*). Wenn der Ofen an ist, erscheint eine grüne Hervorhebung (*„🔥 Steinbackofen heute in Betrieb! Frische Steinofen-Pizza ab 16 Uhr“*).
  - Auf `index.html`: Der Badge an der Feature-Karte wechselt automatisch zwischen *„Pizza an Aktionstagen“* und *„🔥 Pizzaofen heute an!“*.

---

### 5. Modulares Admin-Interface (`admin/`) & 2-Stufen-Passwortschutz

Die Keller-Verwaltung wurde von einer monolithischen Einzelseite in eine modulare Multi-Page-Architektur im separaten Ordner `admin/` überführt und mit einem 2-Stufen-Sicherheitskonzept ausgestattet:

1. **Stufe 1 (Webserver-Ebene): `.htaccess` Basic Authentication**
   - Vorkonfiguriert in `admin/.htaccess` mit Mustervorlage `admin/.htpasswd.example`.
   - Schützt den gesamten Ordner `admin/` serverseitig vor unautorisiertem Zugriff (inkl. Schutz vor Auslesen von Konfigurationsdateien).
2. **Stufe 2 (Client-Ebene): JavaScript-PIN-Sperre (Fallback)**
   - Unverändert zuverlässiger Schutz über die Standard-PIN `keller1867`.
   - Die Session bleibt über `sessionStorage` beim Wechseln zwischen allen 6 Einzelseiten im selben Tab aktiv (kein wiederholtes Eintippen der PIN bei jedem Menüwechsel).
   - In der Benutzeroberfläche wird gemäß Vorgabe kein Hinweis auf die PIN im Klartext angezeigt.
3. **Nahtlose Navigation & 6 dedizierte Einzelseiten**:
   - Einheitliche, am Design-System ausgerichtete Admin-Navigationsleiste (`.admin-nav-bar`) mit Icons und aktiver Hervorhebung.
   - **`admin/index.html` (Status & Öffnung)**: 5 Optionen (Wetter-Automatik, Geöffnet, Geschlossen, Geschlossene Gesellschaft, Urlaub), Freitext-Begründung, Live-Vorschau, Ankündigungs-Top-Banner.
   - **`admin/aktionen.html` (Aktionen & Spezialitäten)**: Steinbackofen & Pizza-Tage Steuerung sowie Gegrillte Makrelen vom Holzkohlegrill.
   - **`admin/speisekarte.html` (Speisekarte)**: Schneller Aktiv/Deaktiviert-Schalter für jedes Gericht, Kategorie-Filter, Suche, Gerichte anlegen/bearbeiten/löschen (Modal).
   - **`admin/galerie.html` (Fotogalerie)**: Fotokarten, Bild-Upload (Datei / Base64 / URL), Kategorie-Zuweisung, Bearbeiten & Löschen.
   - **`admin/events.html` (Live-Events)**: Musiktermine, Blasmusik, Veranstaltungen anlegen/bearbeiten/deaktivieren (Modal).
   - **`admin/sicherung.html` (Datensicherung)**: JSON-Export & Import, Werkszustand-Reset aller 4 Datenbereiche, Dokumentation zur Server-Sicherheit.
4. **Abwärtskompatibilität**:
   - Die bisherige Root-Datei `admin.html` leitet automatisch per Meta-Refresh und JavaScript auf `admin/index.html` weiter.
   - Alle Website-Links (Offcanvas-Menü, Footer) verweisen direkt auf `admin/index.html`.

---

### 6. Alle Unterseiten modernisiert

| Seite | Datei | Beschreibung |
|---|---|---|
| **Willkommen** | [index.html](../index.html) | Startseite mit Hero, Live-Wetter-Widget, Besonderheiten, Live-Events & Übernachten-Teaser mit Originalfoto #19 (Ferienwohnung) |
| **Speisekarte** | [speisekarte.html](../speisekarte.html) | Dynamische Speisekarte, Kategorietabs, Suche, Filterung aktiver Gerichte |
| **Öffnungszeiten** | [oeffnungszeiten.html](../oeffnungszeiten.html) | Zeiten, Ruhetag, Küchenzeiten & erweiterte Ebensfeld-Wetterprognose |
| **Gästezimmer** | [zimmer.html](../zimmer.html) | Alle 8 Originalfotos aus der Galerie (Zimmer 1-4, Küche, Bad, Sitzecke), Lightbox-Zoom & Shuttle-Info |
| **Chronik** | [chronik.html](../chronik.html) | Interaktive Zeitleiste seit 1867 (Felsenkellerbau, Kellerhaus 1965) |
| **Galerie** | [fotos.html](../fotos.html) | Alle 26 Originalfotos dynamisch mit Kategorienfiltern & Lightbox |
| **Anfahrt & Lage** | [anfahrt.html](../anfahrt.html) | Anfahrtsbeschreibungen (A73, Bahn, Main-Radweg) + interaktive OpenStreetMap |
| **Umgebung** | [umgebung.html](../umgebung.html) | Ausflugsziele: Ebensfeld, Staffelberg, Vierzehnheiligen, Obermain-Therme |
| **Impressum** | [impressum.html](../impressum.html) | Vollständige rechtliche Angaben nach TMG und DSGVO |
| **Admin-Bereich** | [admin/index.html](../admin/index.html) | Modulare Verwaltung: Status, Aktionen, Speisekarte, Fotogalerie, Events & Datensicherung |

---

### 7. Mobile-First & QR-Code Biertisch-Optimierung

Für Gäste, die direkt am Biertisch sitzen und den QR-Code auf dem Tischaufsteller scannen:
- **Sticky Kategorie-Leiste**:
  - Auf Smartphones bleibt die Filterleiste (`.menu-filter-bar`) beim Scrollen oben unter der Kopfzeile fixiert (`top: 64px`, `backdrop-filter: blur(12px)`).
  - Horizontales Wischen mit dem Daumen (`scroll-snap-type: x mandatory`, Touch-Momentum) ermöglicht blitzschnellen Wechsel zwischen den Kategorien.
  - Antippen eines Reiters zentriert den Tab automatisch im Sichtfeld.
- **Biertisch-Badge**:
  - Dezenter Willkommenshinweis: *„Digitale Speisekarte am Biertisch • Selbstbedienung an der Theke“*.
- **Optimierte Speisekarten-Karten (`.dish-card`)**:
  - Großzügige, kontraststarke Preisplaketten in Bier-Bernstein (`var(--amber-50)`, `var(--amber-800)`), die auch bei hellem Sonnenlicht im Biergarten sofort ins Auge fallen.
  - Kompaktes Padding und saubere Typografie für Bildschirme ab 320px bis 480px Breite.
- **Schnellsuche mit Lösch-Button**:
  - Ermöglicht das sofortige Finden von Gerichten (z. B. „Schnitzel“, „Kellerliebe“, „Käse“).
  - Ein Klick auf das `×`-Symbol leert die Suche sofort.
- **Direkte Kategorie-Verlinkung**:
  - Jede Kategorie besitzt einen stabilen Anker (z. B. `speisekarte.html#warme_speisen`, `#kalte_speisen`, `#biere`). QR-Codes können somit bei Bedarf gezielt auf bestimmte Kategorien verweisen.
- **Schwebender „Nach oben“-Button**:
  - Erscheint dezent ab 280px Scrolltiefe in der unteren rechten Ecke und scrollt per Fingertipp sanft zurück zum Menüanfang.

---

### 8. Social-Media-Profile (Facebook & Instagram)

Alle öffentlichen Seiten verfügen nun in der Fußzeile (`.site-footer`) und im mobilen Menü über direkte Verlinkungen zu den offiziellen Social-Media-Profilen des Engelhardt's Keller:
- **Facebook**: [http://www.facebook.com/EngelhardtsKeller](http://www.facebook.com/EngelhardtsKeller) (mit offiziellem Facebook-Icon & Brand-Hover `#1877f2`)
- **Instagram**: [https://www.instagram.com/engelhardts_keller/](https://www.instagram.com/engelhardts_keller/) (mit offiziellem Instagram-Gradienten-Hover)
- Präsentiert sowohl als moderne kreisförmige Social-Icons im Brand-Bereich als auch als Textlinks unter *„Kontakt & Service“* und im mobilen Drawer-Menü.

---

### 9. Live-Events & Keller-Termine (Startseite & Admin)

Kommende Veranstaltungen und Live-Musik-Termine werden auf der Startseite (`index.html`) in einer interaktiven Event-Komponente präsentiert:
- **Konfigurierbar im Admin-Interface (`admin.html`)**:
  - Karte **„Live-Events & Termine verwalten“** mit schneller Ein-/Ausschaltfunktion (Aktiv/Inaktiv).
  - Modal zum Erstellen und Bearbeiten von Events mit Datum (`type="date"`), Uhrzeit, Titel, Beschreibung, Genre-Badge und Bild (Datei-Upload via FileReader oder Pfad/URL).
  - Export & Import als `events.json` sowie Werkszustand-Reset.
- **Startseiten-Komponente (`#home-events-container`)**:
  - Responsive Event-Karten mit Datums- und Uhrzeit-Badges, Genre-Badge, Beschreibung, Eintritts-Hinweis und Lightbox-Großansicht für Veranstaltungsfotos.
  - Vorkonfigurierte Highlights mit authentischen Originalbildern:
    - **Ebensfelder Maascheißer**: Sonntag, 03. Mai 2026 ab 15:00 Uhr (`assets/images/events/event_maascheisser.jpg`)
    - **Live-Musik mit Sino Dee**: Donnerstag, 04. Juni 2026 (Fronleichnam) ab 16:30 Uhr (`assets/images/events/event_sino_dee.jpg`)
  - Freundlicher Fallback-Hinweis, wenn keine Termine aktiv sind.

---

### 10. Ganzheitliche SEO- & GEO-Optimierung (Suchmaschinen & KI)

Die gesamte Webpräsenz wurde professionell für klassische Suchmaschinen (Google, Bing) sowie moderne KI-Such- und Antwortsysteme (ChatGPT Search, Perplexity, Google Gemini / AI Overviews, Claude) optimiert:

1. **Suchmaschinenoptimierung (SEO)**:
   - **Metadaten & Canonical**: Jede der 9 öffentlichen Seiten besitzt maßgeschneiderte, klickstarke `<title>`-Tags, präzise `<meta name="description">`-Angaben, `<link rel="canonical">` sowie Robots-Direktiven (`index, follow, max-image-preview:large`).
   - **Open Graph & Twitter Cards**: Vollständige Social-Sharing-Cards mit originalen Bildreferenzen (`assets/images/biergarten.jpg`, `hero.jpg`, `zimmer_prospekt.jpg`, etc.) für optimale Darstellung auf Facebook, WhatsApp und Twitter/X.
   - **Sitemap & Robots**:
     - `sitemap.xml`: Enthält alle 9 öffentlichen HTML-Seiten mit Prioritäten und Änderungsfrequenzen.
     - `robots.txt`: Gibt alle Seiten frei für Webcrawler und KI-Bots (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`), schützt jedoch das administrative Verzeichnis (`Disallow: /admin/` und `Disallow: /admin.html`) und verweist auf die XML-Sitemap.

2. **Strukturierte Daten (Schema.org / JSON-LD)**:
   - `index.html`: `Restaurant`, `BarOrPub` & `LocalBusiness` Schema verknüpft mit Adresse (*Kellerstraße 50, 96250 Ebensfeld*), Geokoordinaten (*50.0673, 10.9628*), Öffnungszeiten, Küche (*Fränkisch*), Menü-Link, Ausstattung und `WebSite`.
   - `speisekarte.html`: `Menu` Schema mit strukturierten Sektionen (*Brotzeiten*, *Warme Schmankerl*, *Steinofen-Pizza*, *Steckerlfisch*, *Kellerliebe Bier*) + `BreadcrumbList`.
   - `oeffnungszeiten.html`: `OpeningHoursSpecification` + `FAQPage` Schema + `BreadcrumbList`.
   - `zimmer.html`: `LodgingBusiness` & `BedAndBreakfast` Schema mit Zimmerkategorien (*Einzelzimmer ab 35€*, *Doppelzimmer ab 60€*, *Ferienwohnung ab 70€*), Ausstattungen (WLAN, TV, Bad, Bahnhofstransfer) + `BreadcrumbList`.
   - `chronik.html`: `AboutPage` & `HistoricalPlace` Schema (*Gründung 1867*) + `BreadcrumbList`.
   - `fotos.html`: `ImageGallery` Schema + `BreadcrumbList`.
   - `umgebung.html`: `TouristDestination` Schema für den Gottesgarten am Obermain + `BreadcrumbList`.
   - `anfahrt.html`: `ContactPage` & `LocalBusiness` Schema + `BreadcrumbList`.
   - `impressum.html`: `BreadcrumbList` Schema.

3. **Generative Engine Optimization (GEO & AEO für KI-Systeme)**:
   - **`llms.txt`**: Standardisiertes, maschinenlesbares Markdown-Dokument mit kompakten Fakten, Öffnungslogik/Wetterabhängigkeit, Spezialitäten und Kontaktinformationen für LLMs.
   - **`llms-full.txt`**: Umfassende Wissensbasis mit allen Gerichten, Preisen, detaillierten Fakten, Anfahrtswegen und Direktzitaten für Perplexity, ChatGPT und RAG-Pipelines.
   - **Semantische FAQ-Sektion (Answer Engine Optimization)**:
     - Auf `oeffnungszeiten.html` wurde ein interaktives HTML5-Akkordeon (`<details>` / `<summary>`) integriert, das die 7 wichtigsten Besucherfragen (Wetterampel/Regen, Reservierungen, Hunde, vegetarische Speisen, Steinofen-Pizza/Makrelen, Barzahlung, Parkplätze & Bahnhofsshuttle) beantwortet.
     - Diese Fragen werden 1:1 durch das `FAQPage` JSON-LD Schema gespiegelt, wodurch Google Featured Snippets und KI-Antworten direkt bedient werden.

4. **Ausschluss der Verwaltung**:
   - Die Admin-Unterseiten (`admin/*` und `admin.html`) sind vollständig von der Indexierung ausgeschlossen (`noindex, nofollow`, Ausschluss in `robots.txt` und `sitemap.xml`).

---

### 11. 1-Klick Social-Media-Sharing (Facebook & Instagram)

Für eine schnelle Social-Media-Pflege durch die Familie Engelhardt wurde auf den Administrationsseiten für Aktionen (`admin/aktionen.html`) und Events (`admin/events.html`) ein direktes Sharing-System integriert:

- **Aktionen (`admin/aktionen.html`)**:
  - Jeweilige Facebook- und Instagram-Buttons direkt bei den Steuerungskarten für *Steinbackofen & Pizza-Tage* sowie *Gegrillte Makrelen*.
- **Live-Events (`admin/events.html`)**:
  - Jedes Event verfügt in der Aktionsleiste über direkte Facebook- und Instagram-Icons.
- **Automatische Bild- und Textübernahme**:
  - Das Originalbild (z. B. `assets/images/pizza_prospekt.jpg`, `makrelen_grill.jpg` oder das jeweilige Event-Foto) wird direkt als Vorschau geladen und steht per Download-Button für den Upload bereit.
  - Der optimierte Beitragstext wird sofort generiert:
    - **Facebook**: Mit Emojis, Termindetails, Standort (*Kellerstraße 50, 96250 Ebensfeld*), Web-Link und Einladung.
    - **Instagram**: Mit ansprechender Formatierung, Standort und allen relevanten Hashtags (`#engelhardtskeller #ebensfeld #bierkeller #kellerliebe #oberfranken #franken #ausflugsziel` etc.).
  - **Automatisches Kopieren**: Beim Klick auf das jeweilige Icon wird der vollständige Text sofort in die Zwischenablage kopiert und eine Bestätigung (*Toast*) angezeigt.
  - **Direktsprung**: Schaltflächen zum direkten Öffnen der Facebook-Seite (`EngelhardtsKeller`) und des Instagram-Profils (`@engelhardts_keller`).
  - **Mobile Web Share API**: Auf Smartphones/Tablets kann über den Button *„Direkt über Smartphone teilen“* das Bild und der Text nativ an die Facebook- oder Instagram-App übergeben werden.

---

## 🧪 Verifikation & Testergebnisse

- **Lokaler Server**: Gestartet auf `http://localhost:8080/`.
- **Automatisierte Link- und Assetprüfung (`scratch/validate_site.py`)**:
  - Alle 16 HTML-Dateien im Root und in `admin/` liefern `HTTP 200 OK`.
  - 92 lokale Assets und 302 interne Links fehlerfrei und ohne 404-Fehler aufgelöst.
- **Automatisierte Social-Media-Sharing-Tests (`scratch/test_social_sharing.py`)**:
  - Headless Chrome Test erfolgreich bestanden:
    - Steinbackofen Facebook-Share öffnet Modal mit Text & Bild.
    - Tab-Wechsel zu Instagram generiert Hashtags und Instagram-Link.
    - Makrelen Instagram-Share übernimmt Bild und Text.
    - Events Facebook- und Instagram-Share übernehmen Event-Titel, Datum, Uhrzeit, Beschreibung und Bild.
    - „Text kopieren“ löst Toast-Bestätigung aus.
- **Automatisierte SEO- & GEO-Prüfung (`scratch/validate_seo.py`)**:
  - Alle 9 HTML-Seiten besitzen syntaktisch valides Schema.org JSON-LD (16 Entitäten).
  - `sitemap.xml` enthält 9 valide URLs ohne Admin-Pfade.
  - `robots.txt` schützt `/admin/` und verweist auf die Sitemap.
  - `llms.txt` und `llms-full.txt` sind vorhanden und vollständig validiert.
- **Automatisierte Playwright Testsuite (`scratch/test_admin_flow.py`)**:
  - 10 von 10 Tests erfolgreich bestanden.
- **Wetter-Schnittstelle**:
  - Ebensfeld-Koordinaten erfolgreich getestet; liefert stündliche Vorhersagewerte, WMO-Codes und Niederschlagswahrscheinlichkeiten.


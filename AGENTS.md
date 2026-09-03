# AGENTS.md – Richtlinien für KI-Codierungsassistenten

Dieses Dokument enthält verbindliche Arbeitsanweisungen, Architekturregeln und Richtlinien für KI-Codierungsassistenten (Antigravity, Gemini, Claude, Cursor etc.), die an diesem Repository arbeiten.

---

## 🛑 1. Absolute Grundregeln

1. **Keine KI-generierten Bilder verwenden!**
   - Es dürfen **keine** Bilder mit Tools wie `generate_image` oder Platzhalter-Grafiken von Drittanbietern eingefügt werden.
   - Es dürfen **ausschließlich** die originalen, authentischen Fotos aus den Webarchiven und Broschüren von Engelhardt's Keller verwendet werden (gespeichert unter `assets/images/` und `assets/images/gallery_original/`).
2. **Technologie-Integrität**:
   - Keine Node.js-, Vite- oder Webpack-Buildschritte einführen.
   - Reines **HTML5, Vanilla CSS3 und Vanilla JavaScript**.
   - Kein TailwindCSS oder Bootstrap ohne ausdrücklichen Wunsch des Nutzers.
3. **Admin-PIN & Datenschutz**:
   - Die Standard-PIN für das Admin-Interface lautet `keller1867`.
   - In der Benutzeroberfläche von `admin.html` darf **kein Hinweis auf die PIN** im Klartext angezeigt werden.
   - Keine Tracking-Cookies, Werbedienste oder Drittanbieter-Tracker einbinden.

---

## 🏛️ 2. Architektur & Datenfluss

Das Projekt verwendet ein modulares, zustandsbasiertes Pub/Sub-Muster im Browser:

```
                  ┌──────────────────────────────────────────────┐
                  │ data/*.json (menu, gallery, settings, events) │
                  └──────────────────────┬───────────────────────┘
                             │ Initiales Laden / Fallback
                             ▼
                  ┌──────────────────────┐
                  │     js/store.js      │ ◄──► LocalStorage (Browser-Speicher)
                  │    (KellerStore)     │
                  └──────────┬───────────┘
                             │ Pub/Sub Event (window.kellerStore.subscribe)
         ┌───────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼
   js/weather.js        js/menu.js          js/gallery.js       js/admin.js
 (Wetter-Engine)     (Speisekarte)         (Fotogalerie)       (Dashboard)
         │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼
   index.html &      speisekarte.html        fotos.html          admin.html
 oeffnungszeiten &
   Live-Events
```

### Konventionen für `js/store.js`:
- `window.kellerStore` ist das globale Singleton für Zustandsänderungen.
- Wenn Sie das Schema von `menu.json`, `settings.json`, `gallery.json` oder `events.json` erweitern, passen Sie stets die Speicherschlüssel (`STORAGE_KEYS`) mit Versions-Suffix (z. B. `_v2`, `_v3`) an, damit Bestands-Browser sofort die neuen Standardwerte laden.
- Änderungen im Admin-Interface rufen Store-Methoden auf (`saveSettings`, `saveMenu`, `saveGallery`, `saveEvents`, `toggleItemActive`, `toggleEventActive`, `setPizzaOven`, `setMakrelenGrill`). Diese triggern automatisch `this.notify()`.

---

## 🌦️ 3. Wetter-Engine & Öffnungs-Logik (`js/weather.js`)

- **Standort**: Markt Ebensfeld, Landkreis Lichtenfels, Oberfranken.
- **Koordinaten**: Breitengrad `50.0673`, Längengrad `10.9628`.
- **API-Endpunkt**: Open-Meteo Forecast API (`api.open-meteo.com/v1/forecast`), datenschutzkonform, DWD-Modell ICON.
- **Reguläre Öffnungszeiten**:
  - Montag: Ruhetag.
  - Dienstag – Samstag: ab 16:00 Uhr (Küche bis 20:00 Uhr).
  - Sonn- und Feiertage: ab 11:00 Uhr (Küche bis 20:00 Uhr).
- **Entscheidungskriterien**:
  - Niederschlagswahrscheinlichkeit während der Öffnungszeiten $\ge 45\,\%$ oder Niederschlagsmenge $\ge 0.3\,\text{mm}$ $\rightarrow$ wetterbedingt geschlossen.
  - WMO-Wettercodes $\ge 51$ (Regen, Schauer, Gewitter) $\rightarrow$ geschlossen.
  - Trocken $\rightarrow$ geöffnet.
- **5 Status-Optionen**:
  1. `vom_wetter_abhaengig` (Standard: automatische Wetterberechnung)
  2. `geoffnet` (Manuell geöffnet)
  3. `geschlossen` (Manuell geschlossen)
  4. `geschlossene_gesellschaft` (Exklusiv-Veranstaltung)
  5. `urlaub` (Betriebsurlaub)

---

## 🍕 4. Steinbackofen & Gegrillte Makrelen (Aktionstage)

1. **Steinbackofen-Tage**:
   - Der Steinbackofen ist nicht täglich in Betrieb.
   - Standardmäßig sind alle 4 Pizza-Gerichte deaktiviert (`active: false`).
   - Wird der Steinbackofen im Admin-Interface aktiviert (`pizza_oven.active = true`), werden die Pizzen auf der Speisekarte angezeigt und entsprechende Banner aktiviert.
2. **Gegrillte Makrelen (11,- €) vom Holzkohlegrill**:
   - Werden an bestimmten Aktionstagen (insbesondere im August bei schönem Wetter) angeboten.
   - Gesteuert über `settings.makrelen_grill.active` und Dish `item_makrele_grill`.
   - Bei Aktivierung wird auf der Speisekarte und Startseite die authentische Bild-Ankündigung (`assets/images/makrelen_grill.jpg`) angezeigt.
3. **Deaktivierte Speisen**:
   - Jedes Gericht besitzt das Attribut `active: boolean`.
   - Gerichte mit `active: false` müssen in `js/menu.js` für Gäste vollständig ausgeblendet werden.
   - Kategorien ohne mindestens ein aktives Gericht werden in der Tab-Leiste von `speisekarte.html` automatisch verborgen.

---

## 🖼️ 5. Fotogalerie & Medienverwaltung

- Die Galerie enthält **26 Originalfotos** aus der alten iWeb-Galerie (gespeichert in `assets/images/gallery_original/original_01_...` bis `original_26_...`).
- **5 Kategorien**:
  - `keller`: Biergarten & Kellerhaus
  - `spielplatz`: Spielplatz & Familie
  - `zimmer`: Gästezimmer & Pension
  - `speisen`: Speisen & Spezialitäten
  - `winter`: Winter & Impressionen
- **Admin-Upload**: Beim Hinzufügen von Bildern im Admin-Interface wird die Datei per `FileReader.readAsDataURL()` in einen Base64-String konvertiert und direkt im `galleryData`-Objekt gespeichert. Alternativ können relative Pfade wie `assets/images/...` eingegeben werden.

---

## 🎨 6. Design-System & Styling-Tokens (`css/style.css`)

Alle Styles müssen das bestehende CSS-Design-System respektieren:

```css
:root {
  /* Primärfarben (Fränkisches Kellergrün) */
  --primary-900: #10261c;
  --primary-800: #173829;
  --primary-700: #1f4a36;
  --primary-600: #2a6147;
  --primary-100: #d1fae5;
  --primary-50:  #f0fdf4;

  /* Akzentfarben (Biergold & Frankenwein-Amber) */
  --amber-600:   #b45309;
  --amber-500:   #d97706;
  --amber-400:   #f59e0b;
  --amber-100:   #fef3c7;
  --amber-50:    #fffbeb;

  /* Typografie */
  --font-heading: 'Outfit', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```

- **Mobile First**: Alle Komponenten müssen auf Bildschirmen von 320px (Smartphone) bis 1920px (Desktop) fehlerfrei reagieren.
- **Barrierefreiheit**: Semantische HTML5-Elemente (`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`), aussagekräftige `alt`-Attribute für Fotos und saubere ARIA-Labels für Navigations-Elemente.

---

## 🧪 7. Prüfroutine nach Änderungen

Führen Sie nach jeder Modifikation folgende Prüfungen aus:

1. **Lokaler Server**: Prüfen, ob `http://localhost:8080` fehlerfrei antwortet.
2. **Asset- und Link-Validierung**:
   ```bash
   python scratch/validate_site.py
   ```
   Alle HTML-Dateien müssen Status `200 OK` melden und alle referenzierten Assets müssen lokal existieren (0 fehlende Dateien).
3. **Dokumentation**: Änderungen stets im [Walkthrough](docs/walkthrough.md) und der [README.md](README.md) nachführen.

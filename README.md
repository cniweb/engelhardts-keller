# Engelhardt's Keller Ebensfeld – Offizielle Website

Moderne, responsive und datenschutzfreundliche Webpräsenz der traditionsreichen Gastwirtschaft und des Biergartens **Engelhardt's Keller** (Kellerstraße 50, 96250 Ebensfeld in Oberfranken). Seit 1867 im Familienbesitz der Familie Engelhardt.

![Engelhardt's Keller Biergarten](assets/images/biergarten.jpg)

---

## 📋 Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Hauptfunktionen & Besonderheiten](#hauptfunktionen--besonderheiten)
- [Technologie-Stack](#technologie-stack)
- [Seitenübersicht](#seitenübersicht)
- [Admin-Interface & Datenverwaltung](#admin-interface--datenverwaltung)
- [Projektstruktur](#projektstruktur)
- [Lokale Entwicklung & Starten](#lokale-entwicklung--starten)
- [Bereitstellung & Hosting](#bereitstellung--hosting)
- [Dokumentation](#dokumentation)

---

## 🍺 Über das Projekt

Ziel dieses Relaunchs war die vollständige Ablösung der historischen, veralteten iWeb-Website durch eine zukunftssichere, statische Webpräsenz in modernem HTML5, CSS3 und Vanilla JavaScript – ohne schwere Frameworks, ohne Build-Schritte und ohne Tracking-Cookies.

Besonderer Wert wurde auf folgende Anforderungen gelegt:
1. **100% Originales Bildmaterial**: Ausschließlich echte Fotos aus dem Kellerarchiv, den Original-Hausprospekten und der historischen Galerie (keine KI-generierten Bilder!).
2. **Ebensfeld Live-Wetter-Automatik**: Startseite und Navigationsleiste zeigen Besuchern in Echtzeit an, ob der Keller bei aktuellem und prognostiziertem Wetter in Ebensfeld geöffnet hat.
3. **Flexible Speisekarten- und Pizzaofen-Steuerung**: Speisen können per Mausklick aktiviert oder deaktiviert werden. Der Steinbackofen lässt sich tagesaktuell an- oder ausschalten.
4. **Admin-Interface**: Zentrales, PIN-geschütztes Dashboard zur Pflege von Status, Speisen und Fotogalerie im Browser.

---

## ✨ Hauptfunktionen & Besonderheiten

### 1. Live Biergarten-Status & Wetterstation Ebensfeld
- **Standort**: Ebensfeld (Lat: `50.0673`, Lon: `10.9628`).
- **Wetter-Engine (`js/weather.js`)**: Greift stündlich auf die datenschutzkonforme Open-Meteo API (DWD/ICON-Vorhersagemodell) zu.
- **Entscheidungslogik**:
  - Montags grundsätzlich Ruhetag.
  - Di–Sa ab 16 Uhr, So ab 11 Uhr (Küche bis 20 Uhr).
  - Bei Niederschlagswahrscheinlichkeit > 45 % oder Regen > 0.3 mm während der Öffnungszeiten meldet das System automatisch *„Wetterbedingt geschlossen“*.
  - Bei trockenem Wetter meldet das System *„Heute geöffnet!“*.
- **4-Stunden-Wetterprognose**: Zeigt Temperatur, Wettersymbol und Regenrisiko für die kommenden Stunden.

### 2. Speisekarte mit 24 Original-Schmankerln (`speisekarte.html`)
- **12 Warme Speisen**: Champignonschnitzel, Schweineschnitzel „Wiener Art“, Schweinesteak mit Kräuterbutter, Cordon Bleu, Kellergögerla (Hähnchenoberkeule paniert), Käsespätzle, „Fränkisches Gyros“, Backfisch, Bratwürste mit Sauerkraut, Currywurst, Bockwurst, Chicken Nuggets.
- **12 Kalte Speisen & Brotzeiten**: Weißer Käse, „Käsedreierlei“, Kochkäse, Limburger mit Musik, Vegetarischer Paprika-Tomaten-Aufstrich, Gerupfter (Obatzter), Dosenfleisch, Göttingerplatte, Presssackplatte, Schweizer Wurstsalat, Schinkenplatte, Kellerplatte.
- **Steinofen-Pizzen & Getränke**: Pizza „Kellerliebe“, Margherita, Prosciutto e Funghi, Diavolo, eigens gebraute „Kellerliebe“ aus dem Ebensfelder Brauhaus, Landbier, Frankenweine.
- **Filter & Suche**: Kategorietabs mit Anzahl der aktiven Gerichte und Echtzeit-Suche.
- **Ausblend-Logik**: Deaktivierte Gerichte werden für Gäste vollautomatisch verborgen.

### 3. Steinbackofen & Pizza-Tage Steuerung
- Da der Steinofen nur an bestimmten Tagen angeheizt wird, sind Pizza-Gerichte standardmäßig deaktiviert.
- Über das Admin-Interface kann der Pizzaofen mit einem Klick aktiviert werden (inkl. automatischer Aktivierung aller Pizza-Gerichte).
- Dynamischer Hinweistext auf Startseite und Speisekarte passt sich dem Ofenstatus an.

### 4. Gegrillte Makrelen (11,- €) & Fisch-Tage Steuerung
- An bestimmten Tagen im August werden traditionell frische Makrelen (11,- €) über Holzkohle gegrillt.
- Wie beim Steinbackofen kann das Angebot im Admin-Interface mit einem Klick aktiviert oder deaktiviert werden.
- Bei Aktivierung erscheint eine hervorgehobene Bild-Ankündigung (`assets/images/makrelen_grill.jpg`) auf der Speisekarte und die Speise wird für Gäste freigeschaltet.

### 5. Biertisch-QR-Code & Mobile-First Speisekarte
- **Direktzugriff am Tisch**: Speziell optimiert für Gäste, die den QR-Code auf den Biertischen mit dem Smartphone scannen.
- **Sticky Filterleiste**: Die Kategorien-Tabs bleiben beim Scrollen fixiert am oberen Bildschirmrand; Horizontalswipen mit dem Daumen ermöglicht schnelles Umschalten.
- **Sonnenlicht-Optimierung**: Kontraststarke bernsteinfarbene Preis-Badges und klare Typografie für hervorragende Lesbarkeit im Freien.
- **Komfort-Funktionen**: Ein-Klick-Löschung im Suchfeld, direkte Kategorie-Anker (`#warme_speisen`, `#biere`) und schwebender „Nach oben“-Button.

### 5. Fotogalerie mit 26 Originalaufnahmen (`fotos.html`)
- 26 historische Originalfotos in 5 Kategorien:
  - *Biergarten & Kellerhaus* (11 Fotos)
  - *Spielplatz & Familie* (5 Fotos)
  - *Gästezimmer & Pension* (8 Fotos inkl. Ferienwohnung & Bad)
  - *Speisen & Spezialitäten* (1 Foto: Grillmakrelen)
  - *Winter & Impressionen* (1 Foto: Keller im Schnee)
### 6. Social-Media-Integration
- Direkte Verknüpfung zu den Profilen auf Facebook (`http://www.facebook.com/EngelhardtsKeller`) und Instagram (`https://www.instagram.com/engelhardts_keller/`) in der Fußzeile aller Seiten sowie im mobilen Menü.

### 7. Live-Events & Termine (`data/events.json`)
- Eigene Startseiten-Komponente für Live-Musik, Blasmusik und Feste am Keller (z. B. Ebensfelder Maascheißer, Live-Musik mit Sino Dee).
- Vollständig im Admin-Interface konfigurierbar: Datum, Uhrzeit, Titel, Beschreibung, Genre-Badge, Bild (Upload oder URL) und Aktiv/Inaktiv-Schalter.
- Export und Import von `events.json`.

---

## 💻 Technologie-Stack

- **Markup**: Semantisches HTML5 mit strukturierten Meta-Tags (SEO & OpenGraph).
- **Styling**: Modernes Vanilla CSS3 (Custom Properties / Design Tokens, Flexbox, CSS Grid, Media Queries). Keine Abhängigkeit von Tailwind oder Bootstrap.
- **Typografie**: *Outfit* (Überschriften) & *Inter* (Fließtext) via Google Fonts.
- **Icons**: FontAwesome 6.5.1 CDN.
- **Karten**: Leaflet.js / OpenStreetMap (DSGVO-konform, keine Tracking-Cookies, kein API-Key erforderlich).
- **Logik & State**:
  - `js/store.js`: Zentraler reaktiver Datenspeicher (Pub/Sub) mit `localStorage`-Persistenz und JSON-Fallback.
  - `js/weather.js`: Wetter-Engine & Biergarten-Öffnungsberechnung für Ebensfeld.
  - `js/menu.js`: Dynamisches Rendern und Filtern der Speisekarte.
  - `js/gallery.js`: Dynamisches Rendern der Fotogalerie mit Filter-Pills.
  - `js/admin.js`: Administrations-Dashboard mit Status-Overrides, CRUD, Uploads und JSON-Export.
  - `js/main.js`: Globale Navigation, Status-Pill, Live-Widget und Lightbox.

---

## 📄 Seitenübersicht

| Datei | Titel | Zweck |
|---|---|---|
| `index.html` | Willkommen | Startseite mit Hero, Live-Wetter-Öffnungs-Widget, Besonderheiten und Highlights |
| `speisekarte.html` | Speisekarte | Dynamische Speisekarte, Kategorienfilter, Suche, Küchenzeiten & Pizza-Hinweis |
| `oeffnungszeiten.html` | Öffnungszeiten & Wetter | Reguläre Zeiten, Ruhetag, Gruppeninfos & stündliche Ebensfeld-Wetterprognose |
| `zimmer.html` | Gästezimmer | Vorstellung der 4 Zimmer & Ferienwohnung mit allen 8 Originalfotos aus der Galerie, Lightbox & Shuttle-Info |
| `chronik.html` | Chronik seit 1867 | Historische Zeitleiste: Felsenkeller 1867, Kellerhaus 1965, Biergarten 1967 |
| `fotos.html` | Fotogalerie | Alle 26 Originalfotos mit Kategorienfilter und Lightbox-Großansicht |
| `anfahrt.html` | Anfahrt & Kontakt | Wegbeschreibung (A73, Bahn, Main-Radweg), Adressdaten & OpenStreetMap-Karte |
| `umgebung.html` | Umgebung | Ausflugsziele: Ebensfeld, Staffelberg, Vierzehnheiligen, Kloster Banz, Therme |
| `impressum.html` | Impressum & Datenschutz | Vollständige rechtliche Angaben nach § 5 TMG und DSGVO |
| `admin.html` | Admin-Interface | PIN-geschütztes Dashboard für Status, Pizzaofen, Speisekarte und Fotogalerie |

---

## 🔒 Admin-Interface & Datenverwaltung

Das Admin-Interface ist unter `admin.html` erreichbar und per PIN geschützt:
- **Standard-PIN**: `keller1867`

### Enthaltene Verwaltungsfunktionen:
1. **5-Stufen Status-Override**:
   - `Vom Wetter abhängig` (Standard: automatische Wetterberechnung Ebensfeld)
   - `Geöffnet` (Manuell geöffnet)
   - `Geschlossen` (Manuell geschlossen)
   - `Geschlossene Gesellschaft`
   - `Urlaub` (Betriebsurlaub)
   - Optionales Freitextfeld für individuelle Begründungen (*„Heute Live-Musik!“*, *„Urlaub bis 15.09.“*).
2. **Ankündigungsbanner**:
   - Oberen Ankündigungsbalken auf der gesamten Website aktivieren, deaktivieren und betexten.
3. **Steinbackofen & Pizza-Tage**:
   - Hauptschalter *„Ofen heute an / aus“*.
   - Automatische Koppelung: Aktiviert bzw. deaktiviert beim Umschalten alle 4 Pizza-Gerichte.
   - Einstellbare Hinweistexte für aktive und inaktive Tage.
4. **Speisekarten-Pflege**:
   - Schalter *„Aktiv / Deaktiviert“* für jedes einzelne Gericht.
   - Neues Gericht anlegen (Titel, Kategorie, Preis, Beschreibung, Tags).
   - Gerichte bearbeiten und löschen.
5. **Fotogalerie-Pflege**:
   - Übersicht aller 26 Originalfotos mit Vorschaukarten.
   - Schnellauswahl der Kategorie je Foto.
   - **Bild-Upload**: Lokale Bilddatei (JPG, PNG, WebP) vom Computer auswählen (wird per FileReader direkt im Browser gespeichert) oder Bildpfad/URL angeben.
   - Fotos bearbeiten und löschen.
6. **Datensicherung & Export**:
   - Speisekarte als `menu.json` exportieren / importieren.
   - Fotogalerie als `gallery.json` exportieren.
   - Werkszustand für Speisekarte, Fotogalerie und Einstellungen wiederherstellen.

---

## 📁 Projektstruktur

```
engelhardts-keller/
├── admin.html                 # Admin-Dashboard (PIN-geschützt)
├── anfahrt.html               # Anfahrt & Kontakt mit Leaflet OSM-Karte
├── chronik.html               # Historische Zeitleiste ab 1867
├── fotos.html                 # Fotogalerie mit Kategorien & Lightbox
├── impressum.html             # Impressum & Datenschutzerklärung (DSGVO)
├── index.html                 # Startseite mit Live-Wetter-Widget & Highlights
├── oeffnungszeiten.html       # Öffnungszeiten & stündliche Ebensfeld-Wetterprognose
├── speisekarte.html           # Dynamische Speisekarte mit Such- & Filterfunktion
├── umgebung.html              # Ausflugsziele im Gottesgarten am Obermain
├── zimmer.html                # Gästezimmer, Ferienwohnung & Buchungsanfrage
├── assets/
│   ├── documents/             # Original-Hausprospekt (PDF)
│   │   └── Hausprospekt.pdf
│   └── images/                # Alle echten Originalfotos & Grafiken
│       ├── biergarten.jpg
│       ├── hero.jpg
│       ├── pizza_prospekt.jpg
│       ├── zimmer_prospekt.jpg
│       ├── chronik_original.jpg
│       └── gallery_original/  # Alle 26 importierten Originalfotos
│           ├── original_01_DSC_8053.jpg
│           ├── ...
│           └── original_26_PICT4881.jpg
├── css/
│   └── style.css              # Vollständiges Design-System & Responsive Styles
├── data/
│   ├── gallery.json           # Standarddaten der Fotogalerie (26 Originalfotos)
│   ├── menu.json              # Speisekarte mit 24 Gerichten, Pizzen & Getränken
│   └── settings.json          # Systemkonfiguration (Status, Öffnungszeiten, Banner)
├── docs/
│   └── walkthrough.md         # Detaillierter Walkthrough aller Features & Tests
├── js/
│   ├── admin.js               # Administrations-Logik & Event-Handling
│   ├── gallery.js             # Dynamischer Renderer für fotos.html
│   ├── main.js                # Globale Navigation, Status-Pill, Lightbox
│   ├── menu.js                # Dynamischer Speisekarten-Renderer
│   ├── store.js               # Lokaler Datenspeicher (Pub/Sub & LocalStorage)
│   └── weather.js             # Ebensfeld Wetter-API & Öffnungs-Algorithmus
├── AGENTS.md                  # Entwicklungsrichtlinien für KI-Codierungsassistenten
└── README.md                  # Diese Projektdokumentation
```

---

## 🚀 Lokale Entwicklung & Starten

Da es sich um eine statische Webanwendung handelt, wird kein Node.js-Buildschritt benötigt. Zur lokalen Vorschau genügt ein einfacher lokaler Webserver:

### Starten mit Python:
```bash
# Im Projektverzeichnis ausführen:
python -m http.server 8080
```

Anschließend im Webbrowser öffnen:
- **Website**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **Speisekarte**: [http://localhost:8080/speisekarte.html](http://localhost:8080/speisekarte.html)
- **Fotogalerie**: [http://localhost:8080/fotos.html](http://localhost:8080/fotos.html)
- **Admin-Bereich**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html) (PIN: `keller1867`)

---

## 🌐 Bereitstellung & Hosting

Die Website kann ohne Backend-Server auf jedem beliebigen Webspace oder statischen Hosting-Dienst betrieben werden:

1. **Klassisches Webhosting (Apache, Nginx, Strato, 1&1 / IONOS, All-Inkl)**:
   - Alle Dateien des Repositories per SFTP oder Git in das `public_html`- oder `www`-Verzeichnis des Webservers hochladen.
2. **GitHub Pages**:
   - Repository-Einstellungen &rarr; *Pages* &rarr; *Branch: main* / *Root* auswählen.
3. **Netlify / Vercel**:
   - Repository verknüpfen (Build command: *leer lassen*, Publish directory: `.`).

---

## 📖 Dokumentation

Weitere detaillierte Informationen zur Implementierung, Testabläufen und technischen Entscheidungen finden Sie im [Walkthrough-Dokument](docs/walkthrough.md) sowie in den Entwicklungsrichtlinien in [AGENTS.md](AGENTS.md).

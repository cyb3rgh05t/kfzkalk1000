# KFZKalk1000 🚗⚙️

Ein professionelles KFZ-Rechnungsprogramm mit lokaler SQLite Datenbank, entwickelt für Werkstätten, Autohäuser und KFZ-Betriebe.

## 🌟 Features

### 📊 Dashboard

- Übersicht über Gesamtumsatz und Kennzahlen
- Anzeige offener Rechnungen
- Kundenstatistiken
- Letzte Aktivitäten

### 👥 Kundenverwaltung

- Vollständige Kundendaten (Name, Kontakt, Adresse)
- Suchfunktion
- Bearbeiten und Löschen von Kunden
- Kundenhistorie

### 🚗 Fahrzeugverwaltung

- Fahrzeugdaten mit Kundenzuordnung
- VIN, Kennzeichen, Baujahr, Kilometerstand
- Marke und Modell-Verwaltung
- Fahrzeughistorie

### 📄 Rechnungsverwaltung

- Rechnungen erstellen und verwalten
- Status-Tracking (bezahlt/offen)
- Kunden- und Fahrzeugzuordnung
- Rechnungsübersicht

### 📦 Produktverwaltung

- Ersatzteile und Dienstleistungen
- Preise und Lagerbestände
- Kategorien-System
- Produktsuche

## 🛠 Technische Details

- **Backend:** Node.js + Express
- **Datenbank:** SQLite (lokal, keine separate Installation nötig)
- **Frontend:** React mit modernem Dark Mode Design
- **API:** RESTful API für alle CRUD-Operationen

## 📋 Voraussetzungen

- **Node.js** (Version 16 oder höher) - [Download hier](https://nodejs.org)
- **Windows, macOS oder Linux**
- **Moderne Webbrowser** (Chrome, Firefox, Edge, Safari)

## 🚀 Installation

### Automatische Installation (Windows)

1. **Node.js installieren** (falls nicht vorhanden)

   - Gehen Sie zu [nodejs.org](https://nodejs.org)
   - Laden Sie die LTS Version herunter
   - Installieren Sie Node.js

2. **Projekt herunterladen**

   - Entpacken Sie alle Dateien in einen Ordner (z.B. `C:\\KFZKalk1000`)

3. **Installation ausführen**

   ```batch
   # Doppelklick auf install.bat
   install.bat
   ```

4. **Anwendung starten**

   ```batch
   # Doppelklick auf start.bat
   start.bat
   ```

5. **Browser öffnen**
   - Automatisch: Browser öffnet sich automatisch
   - Manuell: Gehen Sie zu `http://localhost:3001`

### Manuelle Installation

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Datenbank einrichten
node setup.js

# 3. Server starten
npm start

# 4. Browser öffnen: http://localhost:3001
```

## 📁 Projektstruktur

```
kfzkalk1000/
├── server.js           # Express Server mit API Routen
├── database.js         # SQLite Datenbank Setup
├── setup.js           # Automatisches Setup Script
├── package.json       # NPM Konfiguration
├── install.bat        # Windows Installation
├── start.bat          # Windows Start Script
├── data/              # SQLite Datenbank Dateien
│   └── kfzkalk1000.db # Hauptdatenbank
├── public/            # Frontend Dateien
│   └── index.html     # React Anwendung
└── README.md          # Diese Dokumentation
```

## 🗄️ Datenbank Schema

### Kunden (customers)

- `id` - Eindeutige ID
- `name` - Kundenname
- `email` - E-Mail Adresse
- `phone` - Telefonnummer
- `address` - Adresse
- `created_at`, `updated_at` - Zeitstempel

### Fahrzeuge (vehicles)

- `id` - Eindeutige ID
- `customer_id` - Verweis auf Kunde
- `brand` - Marke
- `model` - Modell
- `year` - Baujahr
- `license_plate` - Kennzeichen
- `vin` - Fahrgestellnummer
- `mileage` - Kilometerstand

### Produkte (products)

- `id` - Eindeutige ID
- `name` - Produktname
- `price` - Preis
- `stock` - Lagerbestand
- `category` - Kategorie
- `description` - Beschreibung

### Rechnungen (invoices)

- `id` - Eindeutige ID
- `customer_id` - Verweis auf Kunde
- `vehicle_id` - Verweis auf Fahrzeug
- `invoice_number` - Rechnungsnummer
- `date` - Rechnungsdatum
- `amount` - Betrag
- `status` - Status (pending/paid)
- `description` - Beschreibung

## 🔧 API Endpunkte

### Kunden

- `GET /api/customers` - Alle Kunden abrufen
- `POST /api/customers` - Neuen Kunde erstellen
- `PUT /api/customers/:id` - Kunde aktualisieren
- `DELETE /api/customers/:id` - Kunde löschen

### Fahrzeuge

- `GET /api/vehicles` - Alle Fahrzeuge abrufen
- `POST /api/vehicles` - Neues Fahrzeug erstellen
- `PUT /api/vehicles/:id` - Fahrzeug aktualisieren
- `DELETE /api/vehicles/:id` - Fahrzeug löschen

### Produkte

- `GET /api/products` - Alle Produkte abrufen
- `POST /api/products` - Neues Produkt erstellen
- `PUT /api/products/:id` - Produkt aktualisieren
- `DELETE /api/products/:id` - Produkt löschen

### Rechnungen

- `GET /api/invoices` - Alle Rechnungen abrufen
- `POST /api/invoices` - Neue Rechnung erstellen
- `PUT /api/invoices/:id` - Rechnung aktualisieren
- `DELETE /api/invoices/:id` - Rechnung löschen

### Dashboard

- `GET /api/dashboard` - Dashboard Statistiken

## 🎨 Design Features

- **Vollständiger Dark Mode** - Professionelles dunkles Design
- **Responsive Layout** - Funktioniert auf Desktop, Tablet und Handy
- **Moderne Icons** - Intuitive Lucide Icons
- **App-ähnliche Navigation** - Sidebar mit allen Bereichen
- **Modal-Dialoge** - Saubere Eingabeformulare

## 🔄 Entwicklung

```bash
# Entwicklungsmodus mit Auto-Reload
npm run dev

# Nur Datenbank neu einrichten
npm run setup
```

## 📊 Datensicherung

Die SQLite Datenbank befindet sich in `data/kfzkalk1000.db`.

### Backup erstellen

```bash
# Einfach die Datei kopieren
cp data/kfzkalk1000.db backup/kfzkalk1000_backup_$(date +%Y%m%d).db
```

### Backup wiederherstellen

```bash
# Backup-Datei zurückkopieren
cp backup/kfzkalk1000_backup_20250704.db data/kfzkalk1000.db
```

## 🚧 Geplante Erweiterungen

- **PDF-Export** von Rechnungen
- **E-Mail Versand** von Rechnungen
- **Terminverwaltung** (HU/AU Erinnerungen)
- **Kostenvoranschläge** erstellen
- **Lieferantenverwaltung**
- **Erweiterte Berichte** und Statistiken
- **Backup/Import-Funktionen**
- **Multi-User Support**
- **Cloud-Synchronisation**

## 🐛 Problembehebung

### Server startet nicht

- Prüfen Sie ob Node.js installiert ist: `node --version`
- Prüfen Sie ob Port 3001 frei ist
- Löschen Sie `node_modules` und führen Sie `npm install` erneut aus

### Datenbank Fehler

- Löschen Sie die Datei `data/kfzkalk1000.db`
- Führen Sie `node setup.js` erneut aus

### Browser zeigt leere Seite

- Prüfen Sie die Browser-Konsole (F12)
- Stellen Sie sicher, dass der Server läuft
- Versuchen Sie einen anderen Browser

## 📞 Support

Bei Problemen oder Fragen:

1. Prüfen Sie die Browser-Konsole (F12) auf Fehlermeldungen
2. Prüfen Sie die Server-Konsole auf Fehlermeldungen
3. Starten Sie Server und Browser neu
4. Prüfen Sie die Troubleshooting Sektion

## 📄 Lizenz

MIT License - Siehe LICENSE Datei für Details.

## 🤝 Beitragen

Verbesserungen und Erweiterungen sind willkommen!

1. Fork das Repository
2. Erstellen Sie einen Feature Branch
3. Committen Sie Ihre Änderungen
4. Erstellen Sie einen Pull Request

---

**KFZKalk1000** - Professionelle KFZ-Rechnungssoftware für lokale Installation 🚗⚙️

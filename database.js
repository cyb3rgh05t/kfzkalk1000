// database.js - UPDATED VERSION mit Fahrzeugpreisen
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Datenbank Pfad
const dbPath = path.join(__dirname, "data", "kfzkalk1000.db");

// Datenbank initialisieren
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Fehler beim Öffnen der Datenbank:", err.message);
        reject(err);
      } else {
        console.log("✅ Verbindung zur SQLite Datenbank hergestellt");
        resolve(db);
      }
    });
  });
}

async function createSettingsTable(db) {
  return new Promise((resolve, reject) => {
    console.log("🔧 Erstelle Settings Tabelle...");

    const settingsTableQuery = `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        type TEXT DEFAULT 'string',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, key)
      )`;

    db.run(settingsTableQuery, (err) => {
      if (err) {
        console.error("❌ Fehler beim Erstellen der Settings Tabelle:", err);
        reject(err);
        return;
      }
      console.log("✅ Settings Tabelle erstellt");
      resolve();
    });
  });
}

async function insertDefaultSettings(db) {
  return new Promise((resolve, reject) => {
    console.log("📋 Füge Standard-Einstellungen ein...");

    const defaultSettings = [
      // Firmendaten
      ["company", "name", "Mustermann KFZ-Werkstatt", "string", "Firmenname"],
      [
        "company",
        "address_street",
        "Musterstraße 123",
        "string",
        "Straße und Hausnummer",
      ],
      ["company", "address_city", "12345 Musterstadt", "string", "PLZ und Ort"],
      ["company", "phone", "+49 123 456789", "string", "Telefonnummer"],
      ["company", "email", "info@mustermann-kfz.de", "email", "E-Mail-Adresse"],
      ["company", "website", "www.mustermann-kfz.de", "url", "Website"],
      ["company", "tax_number", "DE123456789", "string", "Steuernummer"],
      ["company", "vat_id", "DE123456789", "string", "USt-IdNr."],
      ["company", "iban", "DE89 1234 5678 9012 3456 78", "string", "IBAN"],
      ["company", "bic", "DEUTDEFF", "string", "BIC"],
      ["company", "bank_name", "Deutsche Bank", "string", "Bank"],
      ["company", "logo_url", "/assets/logo.png", "string", "Logo Pfad"],

      // Rechnungseinstellungen
      ["invoice", "number_prefix", "RE", "string", "Rechnungsnummer Präfix"],
      [
        "invoice",
        "payment_terms",
        "14 Tage netto",
        "string",
        "Zahlungsbedingungen",
      ],
      ["invoice", "late_fee", "5.00", "number", "Mahngebühr in EUR"],
      ["invoice", "vat_rate", "19", "number", "Mehrwertsteuersatz in %"],
      ["invoice", "default_currency", "EUR", "string", "Standardwährung"],
      ["invoice", "language", "de", "string", "Sprache (de/en)"],

      // Kostenvoranschlag-Einstellungen
      ["estimate", "number_prefix", "KV", "string", "KV-Nummer Präfix"],
      ["estimate", "validity_days", "30", "number", "Gültigkeit in Tagen"],
      [
        "estimate",
        "auto_convert",
        "false",
        "boolean",
        "Auto-Umwandlung in Rechnung",
      ],
      ["estimate", "include_labor", "true", "boolean", "Arbeitszeit anzeigen"],

      // System-Einstellungen
      ["system", "backup_enabled", "true", "boolean", "Automatische Backups"],
      [
        "system",
        "notification_email",
        "admin@mustermann-kfz.de",
        "email",
        "Benachrichtigungs-E-Mail",
      ],
      ["system", "date_format", "DD.MM.YYYY", "string", "Datumsformat"],
      ["system", "time_format", "24h", "string", "Zeitformat (12h/24h)"],
      ["system", "timezone", "Europe/Berlin", "string", "Zeitzone"],

      // Templates
      [
        "templates",
        "invoice_template",
        JSON.stringify({
          header: {
            showLogo: true,
            showCompanyInfo: true,
            showCustomerInfo: true,
            layout: "standard",
          },
          content: {
            showItemNumbers: true,
            showDescriptions: true,
            showQuantity: true,
            showUnitPrice: true,
            showTotalPrice: true,
            groupByCategory: false,
          },
          footer: {
            showTerms: true,
            showPaymentInfo: true,
            showTaxInfo: true,
            customText: "Vielen Dank für Ihr Vertrauen!",
          },
          styling: {
            colorScheme: "blue",
            fontSize: "normal",
            spacing: "normal",
          },
        }),
        "json",
        "Rechnungs-Template",
      ],

      [
        "templates",
        "estimate_template",
        JSON.stringify({
          header: {
            showLogo: true,
            showCompanyInfo: true,
            showCustomerInfo: true,
            showValidUntil: true,
            layout: "standard",
          },
          content: {
            showItemNumbers: true,
            showDescriptions: true,
            showQuantity: true,
            showUnitPrice: true,
            showTotalPrice: true,
            showLabor: true,
            showParts: true,
            groupByCategory: true,
          },
          footer: {
            showTerms: true,
            showValidityNote: true,
            customText: "Dieses Angebot ist freibleibend und unverbindlich.",
          },
          styling: {
            colorScheme: "green",
            fontSize: "normal",
            spacing: "normal",
          },
        }),
        "json",
        "Kostenvoranschlag-Template",
      ],

      // Print/PDF Einstellungen
      ["print", "page_size", "A4", "string", "Seitengröße"],
      [
        "print",
        "orientation",
        "portrait",
        "string",
        "Ausrichtung (portrait/landscape)",
      ],
      ["print", "margin_top", "20", "number", "Oberer Rand in mm"],
      ["print", "margin_bottom", "20", "number", "Unterer Rand in mm"],
      ["print", "margin_left", "15", "number", "Linker Rand in mm"],
      ["print", "margin_right", "15", "number", "Rechter Rand in mm"],
      ["print", "header_height", "80", "number", "Kopfzeilen-Höhe in mm"],
      ["print", "footer_height", "40", "number", "Fußzeilen-Höhe in mm"],
    ];

    let insertedCount = 0;
    let errors = [];

    const insertSetting = (setting, callback) => {
      db.run(
        "INSERT OR IGNORE INTO settings (category, key, value, type, description) VALUES (?, ?, ?, ?, ?)",
        setting,
        function (err) {
          if (err) {
            errors.push(`${setting[0]}.${setting[1]}: ${err.message}`);
          } else if (this.changes > 0) {
            insertedCount++;
            console.log(
              `✅ Einstellung eingefügt: ${setting[0]}.${setting[1]}`
            );
          }
          callback();
        }
      );
    };

    let processed = 0;
    defaultSettings.forEach((setting) => {
      insertSetting(setting, () => {
        processed++;
        if (processed === defaultSettings.length) {
          if (errors.length > 0) {
            console.error(
              "❌ Einige Einstellungen konnten nicht eingefügt werden:",
              errors
            );
            reject(new Error("Fehler beim Einfügen der Einstellungen"));
          } else {
            console.log(`✅ ${insertedCount} Standard-Einstellungen eingefügt`);
            resolve();
          }
        }
      });
    });
  });
}

// Tabellen erstellen
function createTables(db) {
  return new Promise((resolve, reject) => {
    const tables = [
      // Kunden Tabelle
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Fahrzeuge Tabelle - ERWEITERT um Preise
      `CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER,
        license_plate TEXT,
        vin TEXT,
        mileage INTEGER,
        purchase_price DECIMAL(10,2) DEFAULT 0,
        sale_price DECIMAL(10,2) DEFAULT 0,
        purchase_date DATE,
        sale_date DATE,
        status TEXT DEFAULT 'inventory',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )`,

      // Produkte Tabelle
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        category TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Leistungskatalog Tabelle
      `CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        labor_rate DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Rechnungen Tabelle
      `CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        vehicle_id INTEGER,
        invoice_number TEXT UNIQUE,
        date DATE,
        amount DECIMAL(10,2),
        status TEXT DEFAULT 'pending',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
      )`,

      // Rechnungsposten Tabelle
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        product_id INTEGER,
        service_id INTEGER,
        quantity INTEGER,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        item_type TEXT DEFAULT 'product',
        FOREIGN KEY (invoice_id) REFERENCES invoices (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (service_id) REFERENCES services (id)
      )`,

      // Kostenvoranschläge Tabelle
      `CREATE TABLE IF NOT EXISTS estimates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        vehicle_id INTEGER,
        estimate_number TEXT UNIQUE,
        date DATE,
        valid_until DATE,
        status TEXT DEFAULT 'draft',
        total_amount DECIMAL(10,2),
        description TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
      )`,

      // Kostenvoranschlag-Posten Tabelle
      `CREATE TABLE IF NOT EXISTS estimate_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estimate_id INTEGER,
        product_id INTEGER,
        service_id INTEGER,
        description TEXT,
        quantity INTEGER,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        item_type TEXT DEFAULT 'product',
        FOREIGN KEY (estimate_id) REFERENCES estimates (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (service_id) REFERENCES services (id)
      )`,
    ];

    // Alle Tabellen sequenziell erstellen
    let tableIndex = 0;

    function createNextTable() {
      if (tableIndex >= tables.length) {
        console.log("✅ Alle Tabellen erfolgreich erstellt");
        // Nach Tabellenerstellung: Schema-Updates für bestehende Datenbanken
        updateExistingSchema(db, resolve, reject);
        return;
      }

      db.run(tables[tableIndex], (err) => {
        if (err) {
          console.error(
            `❌ Fehler beim Erstellen von Tabelle ${tableIndex}:`,
            err
          );
          reject(err);
          return;
        }

        tableIndex++;
        createNextTable();
      });
    }

    createNextTable();
  });
}

// Schema-Updates für bestehende Datenbanken
function updateExistingSchema(db, resolve, reject) {
  console.log("🔄 Prüfe Schema-Updates...");

  // Prüfe ob neue Spalten bereits existieren
  db.all("PRAGMA table_info(vehicles)", (err, columns) => {
    if (err) {
      console.error("❌ Fehler beim Prüfen der Tabellen-Info:", err);
      reject(err);
      return;
    }

    const columnNames = columns.map((col) => col.name);
    const newColumns = [
      {
        name: "purchase_price",
        sql: "ALTER TABLE vehicles ADD COLUMN purchase_price DECIMAL(10,2) DEFAULT 0",
      },
      {
        name: "sale_price",
        sql: "ALTER TABLE vehicles ADD COLUMN sale_price DECIMAL(10,2) DEFAULT 0",
      },
      {
        name: "purchase_date",
        sql: "ALTER TABLE vehicles ADD COLUMN purchase_date DATE",
      },
      {
        name: "sale_date",
        sql: "ALTER TABLE vehicles ADD COLUMN sale_date DATE",
      },
      {
        name: "status",
        sql: 'ALTER TABLE vehicles ADD COLUMN status TEXT DEFAULT "inventory"',
      },
      { name: "notes", sql: "ALTER TABLE vehicles ADD COLUMN notes TEXT" },
    ];

    let updatesNeeded = [];
    newColumns.forEach((col) => {
      if (!columnNames.includes(col.name)) {
        updatesNeeded.push(col);
      }
    });

    if (updatesNeeded.length === 0) {
      console.log("✅ Schema ist bereits aktuell");
      resolve();
      return;
    }

    console.log(`🔧 Führe ${updatesNeeded.length} Schema-Updates durch...`);

    // Updates sequenziell ausführen
    let updateIndex = 0;
    function executeNextUpdate() {
      if (updateIndex >= updatesNeeded.length) {
        console.log("✅ Schema-Updates abgeschlossen");
        resolve();
        return;
      }

      const update = updatesNeeded[updateIndex];
      db.run(update.sql, (err) => {
        if (err) {
          console.error(`❌ Fehler beim Update von ${update.name}:`, err);
          reject(err);
          return;
        }

        console.log(`✅ Spalte ${update.name} hinzugefügt`);
        updateIndex++;
        executeNextUpdate();
      });
    }

    executeNextUpdate();
  });
}

// Beispieldaten einfügen
function insertSampleData(db) {
  return new Promise((resolve, reject) => {
    console.log("📝 Füge Beispieldaten ein...");

    // Zuerst alle vorhandenen Daten löschen (für sauberen Start)
    db.serialize(() => {
      db.run("DELETE FROM estimate_items");
      db.run("DELETE FROM invoice_items");
      db.run("DELETE FROM estimates");
      db.run("DELETE FROM invoices");
      db.run("DELETE FROM vehicles");
      db.run("DELETE FROM products");
      db.run("DELETE FROM services");
      db.run("DELETE FROM customers");

      // Beispiel Kunden
      const customers = [
        [
          "Max Mustermann",
          "max@example.com",
          "0123-456789",
          "Musterstraße 1, 12345 Musterstadt",
        ],
        [
          "Maria Schmidt",
          "maria@example.com",
          "0987-654321",
          "Beispielweg 5, 54321 Beispielstadt",
        ],
        [
          "Hans Weber",
          "hans@example.com",
          "0555-123456",
          "Hauptstraße 15, 67890 Hauptstadt",
        ],
      ];

      console.log("📥 Füge Kunden ein...");
      customers.forEach((customer) => {
        db.run(
          "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
          customer,
          function (err) {
            if (err) {
              console.error("❌ Fehler beim Einfügen von Kunde:", err);
            } else {
              console.log("✅ Kunde eingefügt:", customer[0]);
            }
          }
        );
      });

      // Beispiel Produkte
      const products = [
        [
          "Motoröl 5W-30",
          45.0,
          25,
          "Öle",
          "Hochwertiges Motoröl für moderne Motoren",
        ],
        [
          "Bremsbeläge vorne",
          89.0,
          8,
          "Bremsen",
          "Bremsbeläge für Vorderachse",
        ],
        [
          "Luftfilter",
          25.0,
          15,
          "Filter",
          "Luftfilter für bessere Motorleistung",
        ],
        [
          "Zündkerzen (4er Set)",
          35.0,
          20,
          "Zündung",
          "Zündkerzen für 4-Zylinder Motor",
        ],
        ["Scheibenwischer", 18.5, 30, "Zubehör", "Scheibenwischer Set vorne"],
      ];

      console.log("📦 Füge Produkte ein...");
      products.forEach((product) => {
        db.run(
          "INSERT INTO products (name, price, stock, category, description) VALUES (?, ?, ?, ?, ?)",
          product,
          function (err) {
            if (err) {
              console.error("❌ Fehler beim Einfügen von Produkt:", err);
            } else {
              console.log("✅ Produkt eingefügt:", product[0]);
            }
          }
        );
      });

      // Services (Leistungskatalog)
      const services = [
        [
          "Ölwechsel",
          "Kompletter Ölwechsel mit Filter",
          "Wartung",
          89.0,
          45,
          85.0,
          1,
        ],
        [
          "Inspektion klein",
          "Kleine Inspektion nach Herstellervorgabe",
          "Wartung",
          149.0,
          90,
          85.0,
          1,
        ],
        [
          "Inspektion groß",
          "Große Inspektion nach Herstellervorgabe",
          "Wartung",
          299.0,
          180,
          85.0,
          1,
        ],
        [
          "Bremsenservice",
          "Überprüfung und Wartung der Bremsanlage",
          "Bremsen",
          125.0,
          75,
          85.0,
          1,
        ],
        [
          "Reifenwechsel",
          "Reifen wechseln und auswuchten",
          "Reifen",
          45.0,
          30,
          85.0,
          1,
        ],
        [
          "TÜV Vorbereitung",
          "Fahrzeug für TÜV vorbereiten",
          "Prüfungen",
          79.0,
          60,
          85.0,
          1,
        ],
        [
          "Klimaservice",
          "Klimaanlage warten und befüllen",
          "Klima",
          89.0,
          45,
          85.0,
          1,
        ],
        [
          "Motordiagnose",
          "Computergestützte Motordiagnose",
          "Diagnose",
          65.0,
          30,
          85.0,
          1,
        ],
        [
          "Zahnriemenwechsel",
          "Zahnriemen und Spanner erneuern",
          "Motor",
          450.0,
          240,
          85.0,
          1,
        ],
        [
          "Kupplungsreparatur",
          "Kupplung überholen oder erneuern",
          "Antrieb",
          850.0,
          360,
          85.0,
          1,
        ],
      ];

      console.log("🔧 Füge Leistungen ein...");
      services.forEach((service) => {
        db.run(
          "INSERT INTO services (name, description, category, price, duration_minutes, labor_rate, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
          service,
          function (err) {
            if (err) {
              console.error("❌ Fehler beim Einfügen von Leistung:", err);
            } else {
              console.log("✅ Leistung eingefügt:", service[0]);
            }
          }
        );
      });

      // Warten auf Kunden-Inserts, dann Fahrzeuge einfügen
      setTimeout(() => {
        console.log("🚗 Füge Fahrzeuge ein...");
        // ERWEITERT: Fahrzeuge mit Preisen
        const vehicles = [
          [
            1,
            "BMW",
            "320i",
            2020,
            "AB-CD 123",
            "WBAA12345678901234",
            45000,
            28500.0,
            32000.0,
            "2024-01-15",
            null,
            "inventory",
            "Sehr guter Zustand, alle Services gemacht",
          ],
          [
            2,
            "Mercedes",
            "C200",
            2019,
            "XY-Z 789",
            "WDD12345678901234",
            38000,
            22000.0,
            26500.0,
            "2024-02-20",
            null,
            "inventory",
            "1 Vorbesitzer, Scheckheftgepflegt",
          ],
          [
            3,
            "VW",
            "Golf",
            2021,
            "MN-OP 456",
            "WVWZZZ1JZ1W123456",
            25000,
            18500.0,
            22000.0,
            "2024-03-10",
            null,
            "inventory",
            "Neuwagen-Qualität",
          ],
          [
            1,
            "Audi",
            "A4",
            2018,
            "QR-ST 789",
            "WAUZZZF4XJA123456",
            68000,
            19500.0,
            24000.0,
            "2024-01-05",
            "2024-06-15",
            "sold",
            "Verkauft an Stammkunden",
          ],
          [
            2,
            "Ford",
            "Focus",
            2017,
            "UV-WX 123",
            "WF0XXXTTGXHK123456",
            82000,
            12000.0,
            15500.0,
            "2023-12-20",
            null,
            "inventory",
            "Kleinere Gebrauchsspuren",
          ],
        ];

        vehicles.forEach((vehicle) => {
          db.run(
            "INSERT INTO vehicles (customer_id, brand, model, year, license_plate, vin, mileage, purchase_price, sale_price, purchase_date, sale_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            vehicle,
            function (err) {
              if (err) {
                console.error("❌ Fehler beim Einfügen von Fahrzeug:", err);
              } else {
                console.log("✅ Fahrzeug eingefügt:", vehicle[1], vehicle[2]);
              }
            }
          );
        });

        // Kostenvoranschläge einfügen
        setTimeout(() => {
          console.log("🧮 Füge Kostenvoranschläge ein...");
          const estimates = [
            [
              1,
              1,
              "KV-2025-001",
              "2025-01-05",
              "2025-02-05",
              "sent",
              420.0,
              "Bremsbeläge und Ölwechsel",
              "Bremsbeläge vorne und hinten, Motoröl 5W-30",
            ],
            [
              2,
              2,
              "KV-2025-002",
              "2025-01-08",
              "2025-02-08",
              "draft",
              850.0,
              "Inspektion und Reparaturen",
              "Große Inspektion mit Filterwechsel",
            ],
            [
              3,
              3,
              "KV-2025-003",
              "2025-01-10",
              "2025-02-10",
              "accepted",
              280.0,
              "Scheibenwischer und Luftfilter",
              "Wartungsarbeiten",
            ],
          ];

          estimates.forEach((estimate) => {
            db.run(
              "INSERT INTO estimates (customer_id, vehicle_id, estimate_number, date, valid_until, status, total_amount, description, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              estimate,
              function (err) {
                if (err) {
                  console.error(
                    "❌ Fehler beim Einfügen von Kostenvoranschlag:",
                    err
                  );
                } else {
                  console.log("✅ Kostenvoranschlag eingefügt:", estimate[2]);
                }
              }
            );
          });

          // Rechnungen einfügen
          setTimeout(() => {
            console.log("💰 Füge Rechnungen ein...");
            const invoices = [
              [
                1,
                1,
                "RE-2025-001",
                "2025-01-15",
                450.0,
                "paid",
                "Ölwechsel und Inspektion",
              ],
              [
                2,
                2,
                "RE-2025-002",
                "2025-01-10",
                280.0,
                "pending",
                "Bremsbeläge wechseln",
              ],
            ];

            invoices.forEach((invoice) => {
              db.run(
                "INSERT INTO invoices (customer_id, vehicle_id, invoice_number, date, amount, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
                invoice,
                function (err) {
                  if (err) {
                    console.error("❌ Fehler beim Einfügen von Rechnung:", err);
                  } else {
                    console.log("✅ Rechnung eingefügt:", invoice[2]);
                  }
                }
              );
            });

            setTimeout(() => {
              console.log("✅ Alle Beispieldaten erfolgreich eingefügt");
              resolve();
            }, 100);
          }, 100);
        }, 100);
      }, 100);
    });
  });
}

// Hauptfunktion für Datenbank Setup
async function setupDatabase() {
  try {
    // Data Ordner erstellen falls nicht vorhanden
    const fs = require("fs");
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log("📁 Data Ordner erstellt");
    }

    const db = await initDatabase();
    await createTables(db);
    await insertSampleData(db);

    db.close((err) => {
      if (err) {
        console.error("Fehler beim Schließen der Datenbank:", err.message);
      } else {
        console.log("✅ Datenbank Setup abgeschlossen");
      }
    });
  } catch (error) {
    console.error("❌ Fehler beim Datenbank Setup:", error);
  }
}

async function setupSettingsDatabase() {
  const db = getDbConnection();

  try {
    await createSettingsTable(db);
    await insertDefaultSettings(db);
    console.log("✅ Settings-Datenbank Setup abgeschlossen");
  } catch (error) {
    console.error("❌ Fehler beim Settings Setup:", error);
  } finally {
    db.close();
  }
}

// Datenbank-Verbindung für API
function getDbConnection() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Fehler beim Verbinden zur Datenbank:", err.message);
    }
  });
}

module.exports = {
  createSettingsTable,
  insertDefaultSettings,
  setupSettingsDatabase,
  setupDatabase,
  getDbConnection,
  dbPath,
};

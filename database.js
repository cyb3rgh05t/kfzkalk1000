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

      // Fahrzeuge Tabelle
      `CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER,
        license_plate TEXT,
        vin TEXT,
        mileage INTEGER,
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
        quantity INTEGER,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        FOREIGN KEY (invoice_id) REFERENCES invoices (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
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
        description TEXT,
        quantity INTEGER,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        FOREIGN KEY (estimate_id) REFERENCES estimates (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,
    ];

    // Alle Tabellen sequenziell erstellen
    let tableIndex = 0;

    function createNextTable() {
      if (tableIndex >= tables.length) {
        console.log("✅ Alle Tabellen erfolgreich erstellt");
        resolve();
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
      customers.forEach((customer, index) => {
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

      // Warten auf Kunden-Inserts, dann Fahrzeuge einfügen
      setTimeout(() => {
        console.log("🚗 Füge Fahrzeuge ein...");
        const vehicles = [
          [1, "BMW", "320i", 2020, "AB-CD 123", "WBAA12345678901234", 45000],
          [2, "Mercedes", "C200", 2019, "XY-Z 789", "WDD12345678901234", 38000],
          [3, "VW", "Golf", 2021, "MN-OP 456", "WVWZZZ1JZ1W123456", 25000],
        ];

        vehicles.forEach((vehicle) => {
          db.run(
            "INSERT INTO vehicles (customer_id, brand, model, year, license_plate, vin, mileage) VALUES (?, ?, ?, ?, ?, ?, ?)",
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

// Datenbank-Verbindung für API
function getDbConnection() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Fehler beim Verbinden zur Datenbank:", err.message);
    }
  });
}

module.exports = {
  setupDatabase,
  getDbConnection,
  dbPath,
};

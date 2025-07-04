const express = require("express");
const cors = require("cors");
const path = require("path");
const { getDbConnection } = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "KFZKalk1000 API is running" });
});

// ==================== KUNDEN API ====================
// Alle Kunden abrufen
app.get("/api/customers", (req, res) => {
  console.log("📞 API Call: GET /api/customers");
  const db = getDbConnection();
  db.all("SELECT * FROM customers ORDER BY name", (err, rows) => {
    if (err) {
      console.error("❌ Fehler bei Kunden-Abfrage:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`✅ ${rows.length} Kunden zurückgegeben`);
    res.json(rows);
  });
  db.close();
});

// Kunde erstellen
app.post("/api/customers", (req, res) => {
  console.log("📞 API Call: POST /api/customers");
  const { name, email, phone, address } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
    [name, email, phone, address],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Kunde:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Kunde erstellt mit ID:", this.lastID);
      res.json({ id: this.lastID, message: "Kunde erfolgreich erstellt" });
    }
  );
  db.close();
});

// Kunde aktualisieren
app.put("/api/customers/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/customers/" + req.params.id);
  const { name, email, phone, address } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, email, phone, address, req.params.id],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren von Kunde:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Kunde aktualisiert:", req.params.id);
      res.json({ message: "Kunde erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Kunde löschen
app.delete("/api/customers/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/customers/" + req.params.id);
  const db = getDbConnection();

  db.run("DELETE FROM customers WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error("❌ Fehler beim Löschen von Kunde:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("✅ Kunde gelöscht:", req.params.id);
    res.json({ message: "Kunde erfolgreich gelöscht" });
  });
  db.close();
});
app.post("/api/customers", (req, res) => {
  const { name, email, phone, address } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
    [name, email, phone, address],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: "Kunde erfolgreich erstellt" });
    }
  );
  db.close();
});

// Kunde aktualisieren
app.put("/api/customers/:id", (req, res) => {
  const { name, email, phone, address } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, email, phone, address, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Kunde erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Kunde löschen
app.delete("/api/customers/:id", (req, res) => {
  const db = getDbConnection();

  db.run("DELETE FROM customers WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Kunde erfolgreich gelöscht" });
  });
  db.close();
});

// ==================== FAHRZEUGE API ====================
// Alle Fahrzeuge abrufen
app.get("/api/vehicles", (req, res) => {
  console.log("📞 API Call: GET /api/vehicles");
  const db = getDbConnection();
  db.all(
    `
    SELECT v.*, c.name as customer_name 
    FROM vehicles v 
    LEFT JOIN customers c ON v.customer_id = c.id 
    ORDER BY v.brand, v.model
  `,
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Fahrzeug-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`✅ ${rows.length} Fahrzeuge zurückgegeben`);
      res.json(rows);
    }
  );
  db.close();
});

// Fahrzeug erstellen
app.post("/api/vehicles", (req, res) => {
  console.log("📞 API Call: POST /api/vehicles");
  const { customer_id, brand, model, year, license_plate, vin, mileage } =
    req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO vehicles (customer_id, brand, model, year, license_plate, vin, mileage) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [customer_id, brand, model, year, license_plate, vin, mileage],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Fahrzeug:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Fahrzeug erstellt mit ID:", this.lastID);
      res.json({ id: this.lastID, message: "Fahrzeug erfolgreich erstellt" });
    }
  );
  db.close();
});

// Fahrzeug aktualisieren
app.put("/api/vehicles/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/vehicles/" + req.params.id);
  const { customer_id, brand, model, year, license_plate, vin, mileage } =
    req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE vehicles SET customer_id = ?, brand = ?, model = ?, year = ?, license_plate = ?, vin = ?, mileage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      customer_id,
      brand,
      model,
      year,
      license_plate,
      vin,
      mileage,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren von Fahrzeug:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Fahrzeug aktualisiert:", req.params.id);
      res.json({ message: "Fahrzeug erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Fahrzeug löschen
app.delete("/api/vehicles/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/vehicles/" + req.params.id);
  const db = getDbConnection();

  db.run("DELETE FROM vehicles WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error("❌ Fehler beim Löschen von Fahrzeug:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("✅ Fahrzeug gelöscht:", req.params.id);
    res.json({ message: "Fahrzeug erfolgreich gelöscht" });
  });
  db.close();
});

// ==================== PRODUKTE API ====================
// Alle Produkte abrufen
app.get("/api/products", (req, res) => {
  console.log("📞 API Call: GET /api/products");
  const db = getDbConnection();
  db.all("SELECT * FROM products ORDER BY category, name", (err, rows) => {
    if (err) {
      console.error("❌ Fehler bei Produkt-Abfrage:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`✅ ${rows.length} Produkte zurückgegeben`);
    res.json(rows);
  });
  db.close();
});

// Produkt erstellen
app.post("/api/products", (req, res) => {
  console.log("📞 API Call: POST /api/products");
  const { name, price, stock, category, description } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO products (name, price, stock, category, description) VALUES (?, ?, ?, ?, ?)",
    [name, price, stock, category, description],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Produkt:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Produkt erstellt mit ID:", this.lastID);
      res.json({ id: this.lastID, message: "Produkt erfolgreich erstellt" });
    }
  );
  db.close();
});

// Produkt aktualisieren
app.put("/api/products/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/products/" + req.params.id);
  const { name, price, stock, category, description } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, price, stock, category, description, req.params.id],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren von Produkt:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Produkt aktualisiert:", req.params.id);
      res.json({ message: "Produkt erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Produkt löschen
app.delete("/api/products/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/products/" + req.params.id);
  const db = getDbConnection();

  db.run("DELETE FROM products WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error("❌ Fehler beim Löschen von Produkt:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("✅ Produkt gelöscht:", req.params.id);
    res.json({ message: "Produkt erfolgreich gelöscht" });
  });
  db.close();
});

// ==================== RECHNUNGEN API ====================
// Alle Rechnungen abrufen
app.get("/api/invoices", (req, res) => {
  console.log("📞 API Call: GET /api/invoices");
  const db = getDbConnection();
  db.all(
    `
    SELECT i.*, c.name as customer_name, 
           v.brand || ' ' || v.model || ' (' || v.license_plate || ')' as vehicle_info
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    LEFT JOIN vehicles v ON i.vehicle_id = v.id 
    ORDER BY i.date DESC
  `,
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Rechnungs-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`✅ ${rows.length} Rechnungen zurückgegeben`);
      res.json(rows);
    }
  );
  db.close();
});

// Rechnung erstellen
app.post("/api/invoices", (req, res) => {
  console.log("📞 API Call: POST /api/invoices");
  const {
    customer_id,
    vehicle_id,
    invoice_number,
    date,
    amount,
    status,
    description,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO invoices (customer_id, vehicle_id, invoice_number, date, amount, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      customer_id,
      vehicle_id,
      invoice_number,
      date,
      amount,
      status,
      description,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Rechnung:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Rechnung erstellt mit ID:", this.lastID);
      res.json({ id: this.lastID, message: "Rechnung erfolgreich erstellt" });
    }
  );
  db.close();
});

// Rechnung aktualisieren
app.put("/api/invoices/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/invoices/" + req.params.id);
  const {
    customer_id,
    vehicle_id,
    invoice_number,
    date,
    amount,
    status,
    description,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE invoices SET customer_id = ?, vehicle_id = ?, invoice_number = ?, date = ?, amount = ?, status = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      customer_id,
      vehicle_id,
      invoice_number,
      date,
      amount,
      status,
      description,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren von Rechnung:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Rechnung aktualisiert:", req.params.id);
      res.json({ message: "Rechnung erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Rechnung löschen
app.delete("/api/invoices/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/invoices/" + req.params.id);
  const db = getDbConnection();

  db.run("DELETE FROM invoices WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error("❌ Fehler beim Löschen von Rechnung:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("✅ Rechnung gelöscht:", req.params.id);
    res.json({ message: "Rechnung erfolgreich gelöscht" });
  });
  db.close();
});
// Alle Fahrzeuge abrufen
app.get("/api/vehicles", (req, res) => {
  const db = getDbConnection();
  db.all(
    `
    SELECT v.*, c.name as customer_name 
    FROM vehicles v 
    LEFT JOIN customers c ON v.customer_id = c.id 
    ORDER BY v.brand, v.model
  `,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
  db.close();
});

// Fahrzeug erstellen
app.post("/api/vehicles", (req, res) => {
  const { customer_id, brand, model, year, license_plate, vin, mileage } =
    req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO vehicles (customer_id, brand, model, year, license_plate, vin, mileage) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [customer_id, brand, model, year, license_plate, vin, mileage],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: "Fahrzeug erfolgreich erstellt" });
    }
  );
  db.close();
});

// Fahrzeug aktualisieren
app.put("/api/vehicles/:id", (req, res) => {
  const { customer_id, brand, model, year, license_plate, vin, mileage } =
    req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE vehicles SET customer_id = ?, brand = ?, model = ?, year = ?, license_plate = ?, vin = ?, mileage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      customer_id,
      brand,
      model,
      year,
      license_plate,
      vin,
      mileage,
      req.params.id,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Fahrzeug erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Fahrzeug löschen
app.delete("/api/vehicles/:id", (req, res) => {
  const db = getDbConnection();

  db.run("DELETE FROM vehicles WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Fahrzeug erfolgreich gelöscht" });
  });
  db.close();
});

// ==================== PRODUKTE API ====================
// Alle Produkte abrufen
app.get("/api/products", (req, res) => {
  const db = getDbConnection();
  db.all("SELECT * FROM products ORDER BY category, name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
  db.close();
});

// Produkt erstellen
app.post("/api/products", (req, res) => {
  const { name, price, stock, category, description } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO products (name, price, stock, category, description) VALUES (?, ?, ?, ?, ?)",
    [name, price, stock, category, description],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: "Produkt erfolgreich erstellt" });
    }
  );
  db.close();
});

// Produkt aktualisieren
app.put("/api/products/:id", (req, res) => {
  const { name, price, stock, category, description } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, price, stock, category, description, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Produkt erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Produkt löschen
app.delete("/api/products/:id", (req, res) => {
  const db = getDbConnection();

  db.run("DELETE FROM products WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Produkt erfolgreich gelöscht" });
  });
  db.close();
});

// ==================== RECHNUNGEN API ====================
// Alle Rechnungen abrufen
app.get("/api/invoices", (req, res) => {
  const db = getDbConnection();
  db.all(
    `
    SELECT i.*, c.name as customer_name, 
           v.brand || ' ' || v.model || ' (' || v.license_plate || ')' as vehicle_info
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    LEFT JOIN vehicles v ON i.vehicle_id = v.id 
    ORDER BY i.date DESC
  `,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
  db.close();
});

// Rechnung erstellen
app.post("/api/invoices", (req, res) => {
  const {
    customer_id,
    vehicle_id,
    invoice_number,
    date,
    amount,
    status,
    description,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO invoices (customer_id, vehicle_id, invoice_number, date, amount, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      customer_id,
      vehicle_id,
      invoice_number,
      date,
      amount,
      status,
      description,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: "Rechnung erfolgreich erstellt" });
    }
  );
  db.close();
});

// Rechnung aktualisieren
app.put("/api/invoices/:id", (req, res) => {
  const {
    customer_id,
    vehicle_id,
    invoice_number,
    date,
    amount,
    status,
    description,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE invoices SET customer_id = ?, vehicle_id = ?, invoice_number = ?, date = ?, amount = ?, status = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      customer_id,
      vehicle_id,
      invoice_number,
      date,
      amount,
      status,
      description,
      req.params.id,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Rechnung erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Rechnung löschen
app.delete("/api/invoices/:id", (req, res) => {
  const db = getDbConnection();

  db.run("DELETE FROM invoices WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Rechnung erfolgreich gelöscht" });
  });
  db.close();
});

// ==================== DASHBOARD API ====================
// Dashboard Statistiken
app.get("/api/dashboard", (req, res) => {
  console.log("📞 API Call: GET /api/dashboard");
  const db = getDbConnection();

  Promise.all([
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT SUM(amount) as total FROM invoices", (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM invoices WHERE status = 'pending'",
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM estimates", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM estimates WHERE status = 'sent'",
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    }),
  ])
    .then(
      ([
        customerCount,
        vehicleCount,
        totalRevenue,
        pendingInvoices,
        totalEstimates,
        pendingEstimates,
      ]) => {
        const dashboardData = {
          customerCount,
          vehicleCount,
          totalRevenue,
          pendingInvoices,
          totalEstimates,
          pendingEstimates,
        };
        console.log("✅ Dashboard-Daten:", dashboardData);
        res.json(dashboardData);
      }
    )
    .catch((err) => {
      console.error("❌ Fehler bei Dashboard-Abfrage:", err);
      res.status(500).json({ error: err.message });
    });

  db.close();
});

// ==================== KOSTENVORANSCHLÄGE API ====================
// Alle Kostenvoranschläge abrufen
app.get("/api/estimates", (req, res) => {
  console.log("📞 API Call: GET /api/estimates");
  const db = getDbConnection();
  db.all(
    `
    SELECT e.*, c.name as customer_name, 
           v.brand || ' ' || v.model || ' (' || v.license_plate || ')' as vehicle_info
    FROM estimates e 
    LEFT JOIN customers c ON e.customer_id = c.id 
    LEFT JOIN vehicles v ON e.vehicle_id = v.id 
    ORDER BY e.date DESC
  `,
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Kostenvoranschlag-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`✅ ${rows.length} Kostenvoranschläge zurückgegeben`);
      res.json(rows);
    }
  );
  db.close();
});

// Kostenvoranschlag erstellen
app.post("/api/estimates", (req, res) => {
  console.log("📞 API Call: POST /api/estimates");
  const {
    customer_id,
    vehicle_id,
    estimate_number,
    date,
    valid_until,
    status,
    total_amount,
    description,
    notes,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO estimates (customer_id, vehicle_id, estimate_number, date, valid_until, status, total_amount, description, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      customer_id,
      vehicle_id,
      estimate_number,
      date,
      valid_until,
      status,
      total_amount,
      description,
      notes,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Kostenvoranschlag:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Kostenvoranschlag erstellt mit ID:", this.lastID);
      res.json({
        id: this.lastID,
        message: "Kostenvoranschlag erfolgreich erstellt",
      });
    }
  );
  db.close();
});

// Kostenvoranschlag aktualisieren
app.put("/api/estimates/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/estimates/" + req.params.id);
  const {
    customer_id,
    vehicle_id,
    estimate_number,
    date,
    valid_until,
    status,
    total_amount,
    description,
    notes,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE estimates SET customer_id = ?, vehicle_id = ?, estimate_number = ?, date = ?, valid_until = ?, status = ?, total_amount = ?, description = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      customer_id,
      vehicle_id,
      estimate_number,
      date,
      valid_until,
      status,
      total_amount,
      description,
      notes,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error(
          "❌ Fehler beim Aktualisieren von Kostenvoranschlag:",
          err
        );
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Kostenvoranschlag aktualisiert:", req.params.id);
      res.json({ message: "Kostenvoranschlag erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Kostenvoranschlag löschen
app.delete("/api/estimates/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/estimates/" + req.params.id);
  const db = getDbConnection();

  db.run("DELETE FROM estimates WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error("❌ Fehler beim Löschen von Kostenvoranschlag:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("✅ Kostenvoranschlag gelöscht:", req.params.id);
    res.json({ message: "Kostenvoranschlag erfolgreich gelöscht" });
  });
  db.close();
});

// Kostenvoranschlag in Rechnung umwandeln
app.post("/api/estimates/:id/convert", (req, res) => {
  console.log("📞 API Call: POST /api/estimates/" + req.params.id + "/convert");
  const db = getDbConnection();

  // Kostenvoranschlag abrufen
  db.get(
    "SELECT * FROM estimates WHERE id = ?",
    req.params.id,
    (err, estimate) => {
      if (err) {
        console.error("❌ Fehler beim Abrufen von Kostenvoranschlag:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      if (!estimate) {
        console.error("❌ Kostenvoranschlag nicht gefunden:", req.params.id);
        res.status(404).json({ error: "Kostenvoranschlag nicht gefunden" });
        return;
      }

      // Neue Rechnungsnummer generieren
      const invoiceNumber =
        "RE-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);

      // Rechnung erstellen
      db.run(
        "INSERT INTO invoices (customer_id, vehicle_id, invoice_number, date, amount, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          estimate.customer_id,
          estimate.vehicle_id,
          invoiceNumber,
          new Date().toISOString().split("T")[0],
          estimate.total_amount,
          "pending",
          estimate.description,
        ],
        function (err) {
          if (err) {
            console.error("❌ Fehler beim Erstellen von Rechnung:", err);
            res.status(500).json({ error: err.message });
            return;
          }

          // Kostenvoranschlag-Status auf "converted" setzen
          db.run(
            "UPDATE estimates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            ["converted", req.params.id],
            function (updateErr) {
              if (updateErr) {
                console.error(
                  "❌ Fehler beim Aktualisieren von Kostenvoranschlag-Status:",
                  updateErr
                );
                res.status(500).json({ error: updateErr.message });
                return;
              }

              console.log(
                "✅ Kostenvoranschlag in Rechnung umgewandelt:",
                invoiceNumber
              );
              res.json({
                message:
                  "Kostenvoranschlag erfolgreich in Rechnung umgewandelt",
                invoiceId: this.lastID,
                invoiceNumber: invoiceNumber,
              });
            }
          );
        }
      );
    }
  );

  db.close();
});
// Alle Kostenvoranschläge abrufen
app.get("/api/estimates", (req, res) => {
  const db = getDbConnection();
  db.all(
    `
    SELECT e.*, c.name as customer_name, 
           v.brand || ' ' || v.model || ' (' || v.license_plate || ')' as vehicle_info
    FROM estimates e 
    LEFT JOIN customers c ON e.customer_id = c.id 
    LEFT JOIN vehicles v ON e.vehicle_id = v.id 
    ORDER BY e.date DESC
  `,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
  db.close();
});

// Kostenvoranschlag erstellen
app.post("/api/estimates", (req, res) => {
  const {
    customer_id,
    vehicle_id,
    estimate_number,
    date,
    valid_until,
    status,
    total_amount,
    description,
    notes,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "INSERT INTO estimates (customer_id, vehicle_id, estimate_number, date, valid_until, status, total_amount, description, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      customer_id,
      vehicle_id,
      estimate_number,
      date,
      valid_until,
      status,
      total_amount,
      description,
      notes,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: "Kostenvoranschlag erfolgreich erstellt",
      });
    }
  );
  db.close();
});

// Kostenvoranschlag aktualisieren
app.put("/api/estimates/:id", (req, res) => {
  const {
    customer_id,
    vehicle_id,
    estimate_number,
    date,
    valid_until,
    status,
    total_amount,
    description,
    notes,
  } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE estimates SET customer_id = ?, vehicle_id = ?, estimate_number = ?, date = ?, valid_until = ?, status = ?, total_amount = ?, description = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      customer_id,
      vehicle_id,
      estimate_number,
      date,
      valid_until,
      status,
      total_amount,
      description,
      notes,
      req.params.id,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Kostenvoranschlag erfolgreich aktualisiert" });
    }
  );
  db.close();
});

// Kostenvoranschlag löschen
app.delete("/api/estimates/:id", (req, res) => {
  const db = getDbConnection();

  db.run("DELETE FROM estimates WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Kostenvoranschlag erfolgreich gelöscht" });
  });
  db.close();
});

// Kostenvoranschlag in Rechnung umwandeln
app.post("/api/estimates/:id/convert", (req, res) => {
  const db = getDbConnection();

  // Kostenvoranschlag abrufen
  db.get(
    "SELECT * FROM estimates WHERE id = ?",
    req.params.id,
    (err, estimate) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!estimate) {
        res.status(404).json({ error: "Kostenvoranschlag nicht gefunden" });
        return;
      }

      // Neue Rechnungsnummer generieren
      const invoiceNumber =
        "RE-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);

      // Rechnung erstellen
      db.run(
        "INSERT INTO invoices (customer_id, vehicle_id, invoice_number, date, amount, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          estimate.customer_id,
          estimate.vehicle_id,
          invoiceNumber,
          new Date().toISOString().split("T")[0],
          estimate.total_amount,
          "pending",
          estimate.description,
        ],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Kostenvoranschlag-Status auf "converted" setzen
          db.run(
            "UPDATE estimates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            ["converted", req.params.id],
            function (updateErr) {
              if (updateErr) {
                res.status(500).json({ error: updateErr.message });
                return;
              }

              res.json({
                message:
                  "Kostenvoranschlag erfolgreich in Rechnung umgewandelt",
                invoiceId: this.lastID,
                invoiceNumber: invoiceNumber,
              });
            }
          );
        }
      );
    }
  );

  db.close();
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 KFZKalk1000 Server läuft auf http://localhost:${PORT}`);
  console.log(`📊 API verfügbar unter http://localhost:${PORT}/api/`);
  console.log(`🌐 Frontend verfügbar unter http://localhost:${PORT}`);
  console.log("");
  console.log("📋 Verfügbare API-Endpunkte:");
  console.log("   GET /api/health");
  console.log("   GET /api/dashboard");
  console.log("   GET /api/customers");
  console.log("   GET /api/vehicles");
  console.log("   GET /api/products");
  console.log("   GET /api/invoices");
  console.log("   GET /api/estimates");
});

// WICHTIG: Frontend Route MUSS als LETZTES kommen!
// Alle anderen Requests (die nicht API sind) → Frontend
app.get("*", (req, res) => {
  console.log(`🌐 Frontend Request: ${req.path}`);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

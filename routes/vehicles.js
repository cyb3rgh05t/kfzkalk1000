// routes/vehicles.js - ERWEITERT um Fahrzeugpreise
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Fahrzeuge abrufen
router.get("/", (req, res) => {
  console.log("📞 API Call: GET /api/vehicles");
  const db = getDbConnection();

  db.all(
    `SELECT v.*, c.name as customer_name 
     FROM vehicles v 
     LEFT JOIN customers c ON v.customer_id = c.id 
     ORDER BY v.brand, v.model`,
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

// Fahrzeug nach ID abrufen
router.get("/:id", (req, res) => {
  console.log("📞 API Call: GET /api/vehicles/" + req.params.id);
  const db = getDbConnection();

  db.get(
    `SELECT v.*, c.name as customer_name 
     FROM vehicles v 
     LEFT JOIN customers c ON v.customer_id = c.id 
     WHERE v.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error("❌ Fehler bei Fahrzeug-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ error: "Fahrzeug nicht gefunden" });
        return;
      }

      console.log("✅ Fahrzeug zurückgegeben:", row.brand, row.model);
      res.json(row);
    }
  );

  db.close();
});

// Fahrzeug erstellen
router.post("/", (req, res) => {
  console.log("📞 API Call: POST /api/vehicles");
  const {
    customer_id,
    brand,
    model,
    year,
    license_plate,
    vin,
    mileage,
    purchase_price,
    sale_price,
    purchase_date,
    sale_date,
    status,
    notes,
  } = req.body;

  const db = getDbConnection();

  // Validierung
  if (!brand || !model) {
    res.status(400).json({ error: "Marke und Modell sind erforderlich" });
    db.close();
    return;
  }

  db.run(
    `INSERT INTO vehicles (
      customer_id, brand, model, year, license_plate, vin, mileage,
      purchase_price, sale_price, purchase_date, sale_date, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer_id || null,
      brand,
      model,
      year || null,
      license_plate || null,
      vin || null,
      mileage || null,
      purchase_price || 0,
      sale_price || 0,
      purchase_date || null,
      sale_date || null,
      status || "inventory",
      notes || null,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Fahrzeug:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Fahrzeug erstellt mit ID:", this.lastID);
      res.json({
        id: this.lastID,
        message: "Fahrzeug erfolgreich erstellt",
        profit: sale_price
          ? parseFloat(sale_price) - parseFloat(purchase_price || 0)
          : null,
      });
    }
  );

  db.close();
});

// Fahrzeug aktualisieren
router.put("/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/vehicles/" + req.params.id);
  const {
    customer_id,
    brand,
    model,
    year,
    license_plate,
    vin,
    mileage,
    purchase_price,
    sale_price,
    purchase_date,
    sale_date,
    status,
    notes,
  } = req.body;

  const db = getDbConnection();

  // Validierung
  if (!brand || !model) {
    res.status(400).json({ error: "Marke und Modell sind erforderlich" });
    db.close();
    return;
  }

  db.run(
    `UPDATE vehicles SET 
      customer_id = ?, brand = ?, model = ?, year = ?, license_plate = ?, 
      vin = ?, mileage = ?, purchase_price = ?, sale_price = ?, 
      purchase_date = ?, sale_date = ?, status = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [
      customer_id || null,
      brand,
      model,
      year || null,
      license_plate || null,
      vin || null,
      mileage || null,
      purchase_price || 0,
      sale_price || 0,
      purchase_date || null,
      sale_date || null,
      status || "inventory",
      notes || null,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren von Fahrzeug:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      const profit = sale_price
        ? parseFloat(sale_price) - parseFloat(purchase_price || 0)
        : null;

      console.log("✅ Fahrzeug aktualisiert:", req.params.id);
      res.json({
        message: "Fahrzeug erfolgreich aktualisiert",
        profit: profit,
        profit_formatted: profit
          ? `${profit >= 0 ? "+" : ""}€${profit.toFixed(2)}`
          : null,
      });
    }
  );

  db.close();
});

// Fahrzeug löschen
router.delete("/:id", (req, res) => {
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

// Fahrzeug verkaufen (Status ändern)
router.patch("/:id/sell", (req, res) => {
  console.log("📞 API Call: PATCH /api/vehicles/" + req.params.id + "/sell");
  const { sale_date, sale_price, customer_id, notes } = req.body;
  const db = getDbConnection();

  db.run(
    `UPDATE vehicles SET 
      status = 'sold', 
      sale_date = ?, 
      sale_price = ?, 
      customer_id = ?,
      notes = ?,
      updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [
      sale_date || new Date().toISOString().split("T")[0],
      sale_price,
      customer_id,
      notes,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Verkauf von Fahrzeug:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log("✅ Fahrzeug als verkauft markiert:", req.params.id);
      res.json({
        message: "Fahrzeug erfolgreich verkauft",
        sale_date: sale_date,
        sale_price: sale_price,
      });
    }
  );

  db.close();
});

// Fahrzeugstatistiken abrufen
router.get("/stats/overview", (req, res) => {
  console.log("📞 API Call: GET /api/vehicles/stats/overview");
  const db = getDbConnection();

  // Komplexere Statistik-Abfrage
  const statsQuery = `
    SELECT 
      COUNT(*) as total_vehicles,
      COUNT(CASE WHEN status = 'inventory' THEN 1 END) as inventory_count,
      COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count,
      COALESCE(SUM(CASE WHEN status = 'inventory' THEN purchase_price END), 0) as inventory_value,
      COALESCE(SUM(CASE WHEN status = 'sold' THEN (sale_price - purchase_price) END), 0) as total_profit,
      COALESCE(AVG(CASE WHEN status = 'sold' THEN (sale_price - purchase_price) END), 0) as avg_profit,
      COALESCE(SUM(CASE WHEN status = 'sold' THEN sale_price END), 0) as total_sales,
      COALESCE(SUM(purchase_price), 0) as total_invested
    FROM vehicles
  `;

  db.get(statsQuery, (err, stats) => {
    if (err) {
      console.error("❌ Fehler bei Statistik-Abfrage:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log("✅ Fahrzeugstatistiken zurückgegeben");
    res.json({
      ...stats,
      profit_margin:
        stats.total_sales > 0
          ? (stats.total_profit / stats.total_sales) * 100
          : 0,
    });
  });

  db.close();
});

// Top profitable vehicles
router.get("/stats/profitable", (req, res) => {
  console.log("📞 API Call: GET /api/vehicles/stats/profitable");
  const db = getDbConnection();

  db.all(
    `SELECT 
      id, brand, model, year, license_plate,
      purchase_price, sale_price, 
      (sale_price - purchase_price) as profit,
      ROUND(((sale_price - purchase_price) / purchase_price * 100), 2) as profit_percentage,
      purchase_date, sale_date
     FROM vehicles 
     WHERE status = 'sold' AND sale_price > 0 
     ORDER BY profit DESC 
     LIMIT 10`,
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei profitable Fahrzeuge-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log(`✅ ${rows.length} profitable Fahrzeuge zurückgegeben`);
      res.json(rows);
    }
  );

  db.close();
});

module.exports = router;

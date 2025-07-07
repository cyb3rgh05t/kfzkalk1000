// routes/vehicles.js - Fahrzeug API Routes
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

// Fahrzeug erstellen
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
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

module.exports = router;

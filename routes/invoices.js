// routes/invoices.js - Rechnungen API Routes
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Rechnungen abrufen
router.get("/", (req, res) => {
  console.log("📞 API Call: GET /api/invoices");
  const db = getDbConnection();

  db.all(
    `SELECT i.*, c.name as customer_name, 
            v.brand || ' ' || v.model || ' (' || v.license_plate || ')' as vehicle_info
     FROM invoices i 
     LEFT JOIN customers c ON i.customer_id = c.id 
     LEFT JOIN vehicles v ON i.vehicle_id = v.id 
     ORDER BY i.date DESC`,
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
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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

module.exports = router;

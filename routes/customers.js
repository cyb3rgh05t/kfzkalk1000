// routes/customers.js - Kunden API Routes
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Kunden abrufen
router.get("/", (req, res) => {
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
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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

module.exports = router;

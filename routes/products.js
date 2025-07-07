// routes/products.js - Produkte API Routes
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Produkte abrufen
router.get("/", (req, res) => {
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
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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

module.exports = router;

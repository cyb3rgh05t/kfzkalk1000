// routes/services.js - Leistungskatalog API Routes
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Leistungen abrufen
router.get("/", (req, res) => {
  console.log("📞 API Call: GET /api/services");
  const db = getDbConnection();

  db.all(
    "SELECT * FROM services WHERE is_active = 1 ORDER BY category, name",
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Services-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`✅ ${rows.length} Services zurückgegeben`);
      res.json(rows);
    }
  );

  db.close();
});

// Leistung erstellen
router.post("/", (req, res) => {
  console.log("📞 API Call: POST /api/services");
  const {
    name,
    description,
    category,
    price,
    duration_minutes,
    labor_rate,
    is_active = 1,
  } = req.body;
  const db = getDbConnection();

  // Validierung
  if (!name || !category || !price) {
    res.status(400).json({
      error: "Name, Kategorie und Preis sind erforderlich",
    });
    db.close();
    return;
  }

  db.run(
    "INSERT INTO services (name, description, category, price, duration_minutes, labor_rate, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      description,
      category,
      parseFloat(price),
      parseInt(duration_minutes) || 60,
      parseFloat(labor_rate) || 0,
      is_active ? 1 : 0,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Erstellen von Service:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Service erstellt mit ID:", this.lastID);
      res.json({
        id: this.lastID,
        message: "Leistung erfolgreich erstellt",
      });
    }
  );

  db.close();
});

// Leistung aktualisieren
router.put("/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/services/" + req.params.id);
  const {
    name,
    description,
    category,
    price,
    duration_minutes,
    labor_rate,
    is_active,
  } = req.body;
  const db = getDbConnection();

  // Validierung
  if (!name || !category || !price) {
    res.status(400).json({
      error: "Name, Kategorie und Preis sind erforderlich",
    });
    db.close();
    return;
  }

  db.run(
    "UPDATE services SET name = ?, description = ?, category = ?, price = ?, duration_minutes = ?, labor_rate = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [
      name,
      description,
      category,
      parseFloat(price),
      parseInt(duration_minutes) || 60,
      parseFloat(labor_rate) || 0,
      is_active ? 1 : 0,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren von Service:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Service aktualisiert:", req.params.id);
      res.json({ message: "Leistung erfolgreich aktualisiert" });
    }
  );

  db.close();
});

// Leistung löschen (deaktivieren)
router.delete("/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/services/" + req.params.id);
  const db = getDbConnection();

  // Soft Delete - nur deaktivieren statt löschen
  db.run(
    "UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    req.params.id,
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Deaktivieren von Service:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Service deaktiviert:", req.params.id);
      res.json({ message: "Leistung erfolgreich deaktiviert" });
    }
  );

  db.close();
});

// Leistung reaktivieren
router.patch("/:id/activate", (req, res) => {
  console.log(
    "📞 API Call: PATCH /api/services/" + req.params.id + "/activate"
  );
  const db = getDbConnection();

  db.run(
    "UPDATE services SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    req.params.id,
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktivieren von Service:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("✅ Service aktiviert:", req.params.id);
      res.json({ message: "Leistung erfolgreich aktiviert" });
    }
  );

  db.close();
});

// Alle Kategorien abrufen
router.get("/categories", (req, res) => {
  console.log("📞 API Call: GET /api/services/categories");
  const db = getDbConnection();

  db.all(
    "SELECT DISTINCT category FROM services WHERE is_active = 1 ORDER BY category",
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Kategorien-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      const categories = rows.map((row) => row.category);
      console.log(`✅ ${categories.length} Kategorien zurückgegeben`);
      res.json(categories);
    }
  );

  db.close();
});

// Services nach Kategorie filtern
router.get("/category/:category", (req, res) => {
  console.log("📞 API Call: GET /api/services/category/" + req.params.category);
  const db = getDbConnection();

  db.all(
    "SELECT * FROM services WHERE category = ? AND is_active = 1 ORDER BY name",
    [req.params.category],
    (err, rows) => {
      if (err) {
        console.error(
          "❌ Fehler bei kategorie-spezifischer Services-Abfrage:",
          err
        );
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `✅ ${rows.length} Services für Kategorie '${req.params.category}' zurückgegeben`
      );
      res.json(rows);
    }
  );

  db.close();
});

module.exports = router;

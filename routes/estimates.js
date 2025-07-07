// routes/estimates.js - Kostenvoranschläge API Routes
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Kostenvoranschläge abrufen
router.get("/", (req, res) => {
  console.log("📞 API Call: GET /api/estimates");
  const db = getDbConnection();

  db.all(
    `SELECT e.*, c.name as customer_name, 
            v.brand || ' ' || v.model || ' (' || v.license_plate || ')' as vehicle_info
     FROM estimates e 
     LEFT JOIN customers c ON e.customer_id = c.id 
     LEFT JOIN vehicles v ON e.vehicle_id = v.id 
     ORDER BY e.date DESC`,
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
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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
router.post("/:id/convert", (req, res) => {
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

module.exports = router;

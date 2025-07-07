// routes/settings.js - Einstellungen API
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Alle Einstellungen abrufen
router.get("/", (req, res) => {
  console.log("📞 API Call: GET /api/settings");
  const db = getDbConnection();

  db.all("SELECT * FROM settings ORDER BY category, key", (err, rows) => {
    if (err) {
      console.error("❌ Fehler bei Einstellungs-Abfrage:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Einstellungen nach Kategorien gruppieren
    const settings = {};
    rows.forEach((row) => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      settings[row.category][row.key] = {
        value: row.value,
        type: row.type,
        description: row.description,
      };
    });

    console.log(
      `✅ Einstellungen zurückgegeben für ${
        Object.keys(settings).length
      } Kategorien`
    );
    res.json(settings);
  });

  db.close();
});

// Einstellungen nach Kategorie abrufen
router.get("/:category", (req, res) => {
  console.log("📞 API Call: GET /api/settings/" + req.params.category);
  const db = getDbConnection();

  db.all(
    "SELECT * FROM settings WHERE category = ? ORDER BY key",
    req.params.category,
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Kategorie-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      const settings = {};
      rows.forEach((row) => {
        settings[row.key] = {
          value: row.value,
          type: row.type,
          description: row.description,
        };
      });

      res.json(settings);
    }
  );

  db.close();
});

// Einzelne Einstellung aktualisieren
router.put("/:category/:key", (req, res) => {
  console.log(
    `📞 API Call: PUT /api/settings/${req.params.category}/${req.params.key}`
  );
  const { value } = req.body;
  const db = getDbConnection();

  db.run(
    "UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE category = ? AND key = ?",
    [value, req.params.category, req.params.key],
    function (err) {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren der Einstellung:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: "Einstellung nicht gefunden" });
        return;
      }

      console.log(
        `✅ Einstellung aktualisiert: ${req.params.category}.${req.params.key} = ${value}`
      );
      res.json({
        message: "Einstellung erfolgreich aktualisiert",
        category: req.params.category,
        key: req.params.key,
        value: value,
      });
    }
  );

  db.close();
});

// Mehrere Einstellungen auf einmal aktualisieren
router.put("/:category", (req, res) => {
  console.log("📞 API Call: PUT /api/settings/" + req.params.category);
  const settings = req.body;
  const db = getDbConnection();

  // Transaktion für mehrere Updates
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    let updateCount = 0;
    let errors = [];

    Object.entries(settings).forEach(([key, value]) => {
      db.run(
        "UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE category = ? AND key = ?",
        [value, req.params.category, key],
        function (err) {
          if (err) {
            errors.push(`${key}: ${err.message}`);
          } else {
            updateCount += this.changes;
          }
        }
      );
    });

    db.run("COMMIT", (err) => {
      if (err || errors.length > 0) {
        db.run("ROLLBACK");
        console.error("❌ Fehler beim Batch-Update:", errors);
        res.status(500).json({
          error: "Fehler beim Aktualisieren der Einstellungen",
          details: errors,
        });
      } else {
        console.log(
          `✅ ${updateCount} Einstellungen in Kategorie ${req.params.category} aktualisiert`
        );
        res.json({
          message: `${updateCount} Einstellungen erfolgreich aktualisiert`,
          category: req.params.category,
          updatedCount: updateCount,
        });
      }
      db.close();
    });
  });
});

// Template-spezifische Endpunkte

// Invoice Template abrufen
router.get("/templates/invoice", (req, res) => {
  console.log("📞 API Call: GET /api/settings/templates/invoice");
  const db = getDbConnection();

  db.get(
    "SELECT value FROM settings WHERE category = 'templates' AND key = 'invoice_template'",
    (err, row) => {
      if (err) {
        console.error("❌ Fehler beim Abrufen des Invoice-Templates:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      const template = row
        ? JSON.parse(row.value)
        : getDefaultInvoiceTemplate();
      res.json(template);
    }
  );

  db.close();
});

// Estimate Template abrufen
router.get("/templates/estimate", (req, res) => {
  console.log("📞 API Call: GET /api/settings/templates/estimate");
  const db = getDbConnection();

  db.get(
    "SELECT value FROM settings WHERE category = 'templates' AND key = 'estimate_template'",
    (err, row) => {
      if (err) {
        console.error("❌ Fehler beim Abrufen des Estimate-Templates:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      const template = row
        ? JSON.parse(row.value)
        : getDefaultEstimateTemplate();
      res.json(template);
    }
  );

  db.close();
});

// Default Templates
function getDefaultInvoiceTemplate() {
  return {
    header: {
      showLogo: true,
      showCompanyInfo: true,
      showCustomerInfo: true,
      layout: "standard", // standard, minimal, detailed
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
      customText: "",
    },
    styling: {
      colorScheme: "blue", // blue, green, red, purple
      fontSize: "normal", // small, normal, large
      spacing: "normal", // compact, normal, spacious
    },
  };
}

function getDefaultEstimateTemplate() {
  return {
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
  };
}

module.exports = router;

// routes/products.js - IMPROVED VERSION mit besserer Validierung
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Validierungsfunktionen
const validateProduct = (productData) => {
  const errors = [];

  if (!productData.name || productData.name.trim().length === 0) {
    errors.push("Name ist erforderlich");
  }

  if (!productData.price || parseFloat(productData.price) <= 0) {
    errors.push("Preis muss größer als 0 sein");
  }

  if (productData.stock === undefined || parseInt(productData.stock) < 0) {
    errors.push("Lagerbestand muss 0 oder größer sein");
  }

  if (!productData.category || productData.category.trim().length === 0) {
    errors.push("Kategorie ist erforderlich");
  }

  return errors;
};

// Alle Produkte abrufen
router.get("/", (req, res) => {
  console.log("📞 API Call: GET /api/products");
  const db = getDbConnection();

  // Optional: Filter und Sortierung
  const { category, search, sortBy = "name", order = "ASC" } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (search) {
    query += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  // Sortierung validieren
  const validSortColumns = ["name", "price", "stock", "category", "created_at"];
  const validOrders = ["ASC", "DESC"];

  if (
    validSortColumns.includes(sortBy) &&
    validOrders.includes(order.toUpperCase())
  ) {
    query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`;
  } else {
    query += " ORDER BY name ASC";
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("❌ Fehler bei Produkt-Abfrage:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log(`✅ ${rows.length} Produkte zurückgegeben`);

    // Zusätzliche Statistiken berechnen
    const stats = {
      total: rows.length,
      totalValue: rows.reduce(
        (sum, product) => sum + product.price * product.stock,
        0
      ),
      lowStock: rows.filter((product) => product.stock <= 5).length,
      categories: [...new Set(rows.map((product) => product.category))].length,
    };

    res.json({
      data: rows,
      stats: stats,
      filters: {
        category: category || null,
        search: search || null,
        sortBy,
        order,
      },
    });
  });

  db.close();
});

// Einzelnes Produkt abrufen
router.get("/:id", (req, res) => {
  console.log("📞 API Call: GET /api/products/" + req.params.id);
  const db = getDbConnection();

  db.get("SELECT * FROM products WHERE id = ?", req.params.id, (err, row) => {
    if (err) {
      console.error("❌ Fehler bei Produkt-Abfrage:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: "Produkt nicht gefunden" });
      return;
    }

    console.log("✅ Produkt gefunden:", row.name);
    res.json(row);
  });

  db.close();
});

// Produkt erstellen
router.post("/", (req, res) => {
  console.log("📞 API Call: POST /api/products");
  const { name, price, stock, category, description } = req.body;

  // Validierung
  const validationErrors = validateProduct(req.body);
  if (validationErrors.length > 0) {
    res.status(400).json({
      error: "Validierungsfehler",
      details: validationErrors,
    });
    return;
  }

  const db = getDbConnection();

  // Prüfen ob Produkt mit gleichem Namen bereits existiert
  db.get(
    "SELECT id FROM products WHERE name = ?",
    [name.trim()],
    (err, existing) => {
      if (err) {
        console.error("❌ Fehler bei Duplikat-Prüfung:", err);
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }

      if (existing) {
        res
          .status(409)
          .json({ error: "Ein Produkt mit diesem Namen existiert bereits" });
        db.close();
        return;
      }

      // Produkt erstellen
      db.run(
        "INSERT INTO products (name, price, stock, category, description) VALUES (?, ?, ?, ?, ?)",
        [
          name.trim(),
          parseFloat(price),
          parseInt(stock),
          category.trim(),
          description ? description.trim() : null,
        ],
        function (err) {
          if (err) {
            console.error("❌ Fehler beim Erstellen von Produkt:", err);
            res.status(500).json({ error: err.message });
            return;
          }

          console.log("✅ Produkt erstellt mit ID:", this.lastID);
          res.status(201).json({
            id: this.lastID,
            message: "Produkt erfolgreich erstellt",
            product: {
              id: this.lastID,
              name: name.trim(),
              price: parseFloat(price),
              stock: parseInt(stock),
              category: category.trim(),
              description: description ? description.trim() : null,
            },
          });
        }
      );

      db.close();
    }
  );
});

// Produkt aktualisieren
router.put("/:id", (req, res) => {
  console.log("📞 API Call: PUT /api/products/" + req.params.id);
  const { name, price, stock, category, description } = req.body;

  // Validierung
  const validationErrors = validateProduct(req.body);
  if (validationErrors.length > 0) {
    res.status(400).json({
      error: "Validierungsfehler",
      details: validationErrors,
    });
    return;
  }

  const db = getDbConnection();

  // Prüfen ob Produkt existiert
  db.get(
    "SELECT id FROM products WHERE id = ?",
    req.params.id,
    (err, existing) => {
      if (err) {
        console.error("❌ Fehler bei Existenz-Prüfung:", err);
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }

      if (!existing) {
        res.status(404).json({ error: "Produkt nicht gefunden" });
        db.close();
        return;
      }

      // Prüfen ob Name bereits von anderem Produkt verwendet wird
      db.get(
        "SELECT id FROM products WHERE name = ? AND id != ?",
        [name.trim(), req.params.id],
        (err, duplicate) => {
          if (err) {
            console.error("❌ Fehler bei Duplikat-Prüfung:", err);
            res.status(500).json({ error: err.message });
            db.close();
            return;
          }

          if (duplicate) {
            res
              .status(409)
              .json({
                error: "Ein anderes Produkt mit diesem Namen existiert bereits",
              });
            db.close();
            return;
          }

          // Produkt aktualisieren
          db.run(
            "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [
              name.trim(),
              parseFloat(price),
              parseInt(stock),
              category.trim(),
              description ? description.trim() : null,
              req.params.id,
            ],
            function (err) {
              if (err) {
                console.error("❌ Fehler beim Aktualisieren von Produkt:", err);
                res.status(500).json({ error: err.message });
                return;
              }

              if (this.changes === 0) {
                res.status(404).json({ error: "Produkt nicht gefunden" });
                return;
              }

              console.log("✅ Produkt aktualisiert:", req.params.id);
              res.json({
                message: "Produkt erfolgreich aktualisiert",
                changes: this.changes,
              });
            }
          );

          db.close();
        }
      );
    }
  );
});

// Produkt löschen
router.delete("/:id", (req, res) => {
  console.log("📞 API Call: DELETE /api/products/" + req.params.id);
  const db = getDbConnection();

  // Prüfen ob Produkt in Rechnungen oder Kostenvoranschlägen verwendet wird
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM invoice_items WHERE product_id = ?) as invoice_count,
      (SELECT COUNT(*) FROM estimate_items WHERE product_id = ?) as estimate_count`,
    [req.params.id, req.params.id],
    (err, usage) => {
      if (err) {
        console.error("❌ Fehler bei Verwendung-Prüfung:", err);
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }

      if (usage.invoice_count > 0 || usage.estimate_count > 0) {
        res.status(409).json({
          error: "Produkt kann nicht gelöscht werden",
          details: `Das Produkt wird in ${usage.invoice_count} Rechnung(en) und ${usage.estimate_count} Kostenvoranschlag/-schlägen verwendet`,
        });
        db.close();
        return;
      }

      // Produkt löschen
      db.run(
        "DELETE FROM products WHERE id = ?",
        req.params.id,
        function (err) {
          if (err) {
            console.error("❌ Fehler beim Löschen von Produkt:", err);
            res.status(500).json({ error: err.message });
            return;
          }

          if (this.changes === 0) {
            res.status(404).json({ error: "Produkt nicht gefunden" });
            return;
          }

          console.log("✅ Produkt gelöscht:", req.params.id);
          res.json({
            message: "Produkt erfolgreich gelöscht",
            deletedId: req.params.id,
          });
        }
      );

      db.close();
    }
  );
});

// Lagerbestand aktualisieren
router.patch("/:id/stock", (req, res) => {
  console.log("📞 API Call: PATCH /api/products/" + req.params.id + "/stock");
  const { stock, operation = "set" } = req.body;

  if (stock === undefined || stock === null) {
    res.status(400).json({ error: "Lagerbestand ist erforderlich" });
    return;
  }

  const stockValue = parseInt(stock);
  if (isNaN(stockValue) || stockValue < 0) {
    res
      .status(400)
      .json({ error: "Lagerbestand muss eine positive Zahl sein" });
    return;
  }

  const db = getDbConnection();

  let query;
  let params;

  switch (operation) {
    case "add":
      query =
        "UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      params = [stockValue, req.params.id];
      break;
    case "subtract":
      query =
        "UPDATE products SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      params = [stockValue, req.params.id];
      break;
    case "set":
    default:
      query =
        "UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      params = [stockValue, req.params.id];
      break;
  }

  db.run(query, params, function (err) {
    if (err) {
      console.error("❌ Fehler beim Aktualisieren des Lagerbestands:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Produkt nicht gefunden" });
      return;
    }

    console.log("✅ Lagerbestand aktualisiert:", req.params.id);
    res.json({
      message: "Lagerbestand erfolgreich aktualisiert",
      operation,
      value: stockValue,
    });
  });

  db.close();
});

// Alle Kategorien abrufen
router.get("/categories/all", (req, res) => {
  console.log("📞 API Call: GET /api/products/categories/all");
  const db = getDbConnection();

  db.all(
    "SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category",
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Kategorien-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log(`✅ ${rows.length} Kategorien zurückgegeben`);
      res.json(rows);
    }
  );

  db.close();
});

// Produkte mit niedrigem Lagerbestand
router.get("/lowstock/:threshold?", (req, res) => {
  console.log("📞 API Call: GET /api/products/lowstock");
  const threshold = parseInt(req.params.threshold) || 5;

  const db = getDbConnection();

  db.all(
    "SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC, name ASC",
    [threshold],
    (err, rows) => {
      if (err) {
        console.error("❌ Fehler bei Niedrigbestand-Abfrage:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log(`✅ ${rows.length} Produkte mit niedrigem Bestand gefunden`);
      res.json({
        data: rows,
        threshold,
        count: rows.length,
      });
    }
  );

  db.close();
});

module.exports = router;

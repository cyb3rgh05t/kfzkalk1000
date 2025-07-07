// routes/dashboard.js - Dashboard API Routes
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// Dashboard Statistiken
router.get("/", (req, res) => {
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

module.exports = router;

// server.js - Hauptserver (stark vereinfacht)
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "KFZKalk1000 API is running" });
});

// API Routes
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

// Frontend Route (MUSS als LETZTES kommen!)
app.get("*", (req, res) => {
  console.log(`🌐 Frontend Request: ${req.path}`);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 KFZKalk1000 Server läuft auf http://localhost:${PORT}`);
  console.log(`📊 API verfügbar unter http://localhost:${PORT}/api/`);
  console.log(`🌐 Frontend verfügbar unter http://localhost:${PORT}`);
  console.log("");
  console.log("📋 Verfügbare API-Endpunkte:");
  console.log("   GET /api/health");
  console.log("   GET /api/dashboard");
  console.log("   GET /api/customers");
  console.log("   GET /api/vehicles");
  console.log("   GET /api/products");
  console.log("   GET /api/invoices");
  console.log("   GET /api/estimates");
});

module.exports = app;

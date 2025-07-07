// routes/index.js - Hauptrouten-Setup
const express = require("express");
const router = express.Router();

// Route Modules importieren
const customersRoutes = require("./customers");
const vehiclesRoutes = require("./vehicles");
const productsRoutes = require("./products");
const invoicesRoutes = require("./invoices");
const estimatesRoutes = require("./estimates");
const dashboardRoutes = require("./dashboard");

// Routes einbinden
router.use("/customers", customersRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/products", productsRoutes);
router.use("/invoices", invoicesRoutes);
router.use("/estimates", estimatesRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;

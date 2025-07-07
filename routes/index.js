// routes/index.js - UPDATED: Services hinzugefügt
const express = require("express");
const router = express.Router();

// Route Modules importieren
const customersRoutes = require("./customers");
const vehiclesRoutes = require("./vehicles");
const productsRoutes = require("./products");
const servicesRoutes = require("./services");
const invoicesRoutes = require("./invoices");
const estimatesRoutes = require("./estimates");
const dashboardRoutes = require("./dashboard");
const settingsRouter = require("./settings");
const pdfRouter = require("./pdf");

// Routes einbinden
router.use("/customers", customersRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/products", productsRoutes);
router.use("/services", servicesRoutes);
router.use("/invoices", invoicesRoutes);
router.use("/estimates", estimatesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingsRouter);
router.use("/pdf", pdfRouter);

module.exports = router;

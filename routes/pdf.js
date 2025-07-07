// routes/pdf.js - PDF Generation für Rechnungen und Kostenvoranschläge
const express = require("express");
const router = express.Router();
const { getDbConnection } = require("../database");

// PDF für Rechnung generieren
router.get("/invoice/:id", async (req, res) => {
  console.log(`📞 API Call: GET /api/pdf/invoice/${req.params.id}`);

  try {
    const invoiceData = await getInvoiceData(req.params.id);
    const companySettings = await getCompanySettings();
    const template = await getInvoiceTemplate();

    const htmlContent = generateInvoiceHTML(
      invoiceData,
      companySettings,
      template
    );

    // Für Entwicklung: HTML zurückgeben (später PDF)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(htmlContent);
  } catch (error) {
    console.error("❌ Fehler bei PDF-Generierung:", error);
    res.status(500).json({ error: error.message });
  }
});

// PDF für Kostenvoranschlag generieren
router.get("/estimate/:id", async (req, res) => {
  console.log(`📞 API Call: GET /api/pdf/estimate/${req.params.id}`);

  try {
    const estimateData = await getEstimateData(req.params.id);
    const companySettings = await getCompanySettings();
    const template = await getEstimateTemplate();

    const htmlContent = generateEstimateHTML(
      estimateData,
      companySettings,
      template
    );

    // Für Entwicklung: HTML zurückgeben (später PDF)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(htmlContent);
  } catch (error) {
    console.error("❌ Fehler bei PDF-Generierung:", error);
    res.status(500).json({ error: error.message });
  }
});

// Hilfsfunktionen

async function getInvoiceData(invoiceId) {
  return new Promise((resolve, reject) => {
    const db = getDbConnection();

    // Rechnung mit Kunde und Fahrzeug laden
    db.get(
      `
      SELECT i.*, 
             c.name as customer_name, c.email as customer_email, 
             c.phone as customer_phone, c.address as customer_address,
             v.brand, v.model, v.year, v.license_plate, v.vin
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      WHERE i.id = ?
    `,
      [invoiceId],
      (err, invoice) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (!invoice) {
          db.close();
          reject(new Error("Rechnung nicht gefunden"));
          return;
        }

        // Rechnungsposten laden
        db.all(
          `
        SELECT ii.*, 
               COALESCE(p.name, s.name) as item_name,
               COALESCE(p.description, s.description) as item_description,
               COALESCE(p.category, s.category) as item_category
        FROM invoice_items ii
        LEFT JOIN products p ON ii.product_id = p.id
        LEFT JOIN services s ON ii.service_id = s.id
        WHERE ii.invoice_id = ?
        ORDER BY ii.id
      `,
          [invoiceId],
          (err, items) => {
            db.close();

            if (err) {
              reject(err);
              return;
            }

            invoice.items = items || [];
            resolve(invoice);
          }
        );
      }
    );
  });
}

async function getEstimateData(estimateId) {
  return new Promise((resolve, reject) => {
    const db = getDbConnection();

    // Kostenvoranschlag mit Kunde und Fahrzeug laden
    db.get(
      `
      SELECT e.*, 
             c.name as customer_name, c.email as customer_email, 
             c.phone as customer_phone, c.address as customer_address,
             v.brand, v.model, v.year, v.license_plate, v.vin
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      WHERE e.id = ?
    `,
      [estimateId],
      (err, estimate) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (!estimate) {
          db.close();
          reject(new Error("Kostenvoranschlag nicht gefunden"));
          return;
        }

        // Kostenvoranschlag-Posten laden
        db.all(
          `
        SELECT ei.*, 
               COALESCE(p.name, s.name) as item_name,
               COALESCE(p.description, s.description) as item_description,
               COALESCE(p.category, s.category) as item_category
        FROM estimate_items ei
        LEFT JOIN products p ON ei.product_id = p.id
        LEFT JOIN services s ON ei.service_id = s.id
        WHERE ei.estimate_id = ?
        ORDER BY ei.id
      `,
          [estimateId],
          (err, items) => {
            db.close();

            if (err) {
              reject(err);
              return;
            }

            estimate.items = items || [];
            resolve(estimate);
          }
        );
      }
    );
  });
}

async function getCompanySettings() {
  return new Promise((resolve, reject) => {
    const db = getDbConnection();

    db.all(
      "SELECT key, value FROM settings WHERE category = 'company'",
      (err, rows) => {
        db.close();

        if (err) {
          reject(err);
          return;
        }

        const settings = {};
        rows.forEach((row) => {
          settings[row.key] = row.value;
        });

        resolve(settings);
      }
    );
  });
}

async function getInvoiceTemplate() {
  return new Promise((resolve, reject) => {
    const db = getDbConnection();

    db.get(
      "SELECT value FROM settings WHERE category = 'templates' AND key = 'invoice_template'",
      (err, row) => {
        db.close();

        if (err) {
          reject(err);
          return;
        }

        try {
          const template = row
            ? JSON.parse(row.value)
            : getDefaultInvoiceTemplate();
          resolve(template);
        } catch (parseError) {
          resolve(getDefaultInvoiceTemplate());
        }
      }
    );
  });
}

async function getEstimateTemplate() {
  return new Promise((resolve, reject) => {
    const db = getDbConnection();

    db.get(
      "SELECT value FROM settings WHERE category = 'templates' AND key = 'estimate_template'",
      (err, row) => {
        db.close();

        if (err) {
          reject(err);
          return;
        }

        try {
          const template = row
            ? JSON.parse(row.value)
            : getDefaultEstimateTemplate();
          resolve(template);
        } catch (parseError) {
          resolve(getDefaultEstimateTemplate());
        }
      }
    );
  });
}

function generateInvoiceHTML(invoice, company, template) {
  const colorSchemes = {
    blue: { primary: "#3B82F6", secondary: "#1E40AF", accent: "#EFF6FF" },
    green: { primary: "#10B981", secondary: "#047857", accent: "#ECFDF5" },
    red: { primary: "#EF4444", secondary: "#DC2626", accent: "#FEF2F2" },
    purple: { primary: "#8B5CF6", secondary: "#7C3AED", accent: "#F5F3FF" },
  };

  const colors =
    colorSchemes[template.styling.colorScheme] || colorSchemes.blue;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  // Gesamtbetrag berechnen
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );
  const vatAmount = subtotal * 0.19; // 19% MwSt
  const total = subtotal + vatAmount;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rechnung ${invoice.invoice_number}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            font-size: ${
              template.styling.fontSize === "small"
                ? "12px"
                : template.styling.fontSize === "large"
                ? "16px"
                : "14px"
            };
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: ${
              template.styling.spacing === "compact"
                ? "20px"
                : template.styling.spacing === "spacious"
                ? "40px"
                : "30px"
            };
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 40px;
            border-bottom: 3px solid ${colors.primary};
            padding-bottom: 20px;
        }
        .company-info h1 {
            color: ${colors.primary};
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .company-info p {
            margin: 2px 0;
            color: #666;
        }
        .invoice-details {
            text-align: right;
        }
        .invoice-number {
            font-size: 20px;
            font-weight: bold;
            color: ${colors.secondary};
            margin-bottom: 10px;
        }
        .customer-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .customer-info, .vehicle-info {
            flex: 1;
            margin-right: 20px;
        }
        .customer-info h3, .vehicle-info h3 {
            color: ${colors.primary};
            border-bottom: 1px solid ${colors.primary};
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: ${colors.primary};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .items-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
        }
        .items-table tr:nth-child(even) {
            background-color: ${colors.accent};
        }
        .totals-section {
            float: right;
            width: 300px;
            margin-bottom: 40px;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #ddd;
        }
        .totals-table .total-row {
            font-weight: bold;
            font-size: 16px;
            background-color: ${colors.primary};
            color: white;
        }
        .footer {
            clear: both;
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .payment-info {
            background-color: ${colors.accent};
            padding: 15px;
            border-left: 4px solid ${colors.primary};
            margin-bottom: 20px;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        ${
          template.header.showCompanyInfo
            ? `
        <div class="header">
            <div class="company-info">
                <h1>${company.name || "Mustermann KFZ-Werkstatt"}</h1>
                <p>${company.address_street || ""}</p>
                <p>${company.address_city || ""}</p>
                <p>Tel: ${company.phone || ""}</p>
                <p>E-Mail: ${company.email || ""}</p>
                ${company.website ? `<p>Web: ${company.website}</p>` : ""}
            </div>
            <div class="invoice-details">
                <div class="invoice-number">Rechnung ${
                  invoice.invoice_number
                }</div>
                <p><strong>Datum:</strong> ${formatDate(invoice.date)}</p>
                <p><strong>Kunden-Nr:</strong> ${invoice.customer_id}</p>
                ${
                  invoice.vehicle_id
                    ? `<p><strong>Fahrzeug-ID:</strong> ${invoice.vehicle_id}</p>`
                    : ""
                }
            </div>
        </div>
        `
            : ""
        }

        ${
          template.header.showCustomerInfo
            ? `
        <div class="customer-section">
            <div class="customer-info">
                <h3>Rechnungsadresse</h3>
                <p><strong>${
                  invoice.customer_name || "Kunde nicht gefunden"
                }</strong></p>
                ${
                  invoice.customer_address
                    ? `<p>${invoice.customer_address}</p>`
                    : ""
                }
                ${
                  invoice.customer_phone
                    ? `<p>Tel: ${invoice.customer_phone}</p>`
                    : ""
                }
                ${
                  invoice.customer_email
                    ? `<p>E-Mail: ${invoice.customer_email}</p>`
                    : ""
                }
            </div>
            
            ${
              invoice.brand
                ? `
            <div class="vehicle-info">
                <h3>Fahrzeug</h3>
                <p><strong>${invoice.brand} ${invoice.model}</strong></p>
                ${invoice.year ? `<p>Baujahr: ${invoice.year}</p>` : ""}
                ${
                  invoice.license_plate
                    ? `<p>Kennzeichen: ${invoice.license_plate}</p>`
                    : ""
                }
                ${invoice.vin ? `<p>FIN: ${invoice.vin}</p>` : ""}
            </div>
            `
                : ""
            }
        </div>
        `
            : ""
        }

        ${
          invoice.description
            ? `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${colors.primary};">Beschreibung</h3>
            <p>${invoice.description}</p>
        </div>
        `
            : ""
        }

        <table class="items-table">
            <thead>
                <tr>
                    ${template.content.showItemNumbers ? "<th>Pos.</th>" : ""}
                    <th>Beschreibung</th>
                    ${
                      template.content.showQuantity
                        ? '<th style="text-align: center;">Menge</th>'
                        : ""
                    }
                    ${
                      template.content.showUnitPrice
                        ? '<th style="text-align: right;">Einzelpreis</th>'
                        : ""
                    }
                    ${
                      template.content.showTotalPrice
                        ? '<th style="text-align: right;">Gesamtpreis</th>'
                        : ""
                    }
                </tr>
            </thead>
            <tbody>
                ${invoice.items
                  .map(
                    (item, index) => `
                <tr>
                    ${
                      template.content.showItemNumbers
                        ? `<td>${index + 1}</td>`
                        : ""
                    }
                    <td>
                        <strong>${item.item_name || "Artikel"}</strong>
                        ${
                          item.item_description &&
                          template.content.showDescriptions
                            ? `<br><small style="color: #666;">${item.item_description}</small>`
                            : ""
                        }
                    </td>
                    ${
                      template.content.showQuantity
                        ? `<td style="text-align: center;">${
                            item.quantity || 1
                          }</td>`
                        : ""
                    }
                    ${
                      template.content.showUnitPrice
                        ? `<td style="text-align: right;">${formatPrice(
                            item.unit_price
                          )}</td>`
                        : ""
                    }
                    ${
                      template.content.showTotalPrice
                        ? `<td style="text-align: right;">${formatPrice(
                            item.total_price
                          )}</td>`
                        : ""
                    }
                </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Zwischensumme (netto):</td>
                    <td style="text-align: right;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                    <td>Mehrwertsteuer (19%):</td>
                    <td style="text-align: right;">${formatPrice(
                      vatAmount
                    )}</td>
                </tr>
                <tr class="total-row">
                    <td>Gesamtbetrag:</td>
                    <td style="text-align: right;">${formatPrice(total)}</td>
                </tr>
            </table>
        </div>

        ${
          template.footer.showPaymentInfo
            ? `
        <div class="payment-info">
            <h4 style="margin-top: 0; color: ${
              colors.primary
            };">Zahlungsinformationen</h4>
            <p><strong>Zahlungsbedingungen:</strong> 14 Tage netto</p>
            ${
              company.iban
                ? `<p><strong>IBAN:</strong> ${company.iban}</p>`
                : ""
            }
            ${company.bic ? `<p><strong>BIC:</strong> ${company.bic}</p>` : ""}
            ${
              company.bank_name
                ? `<p><strong>Bank:</strong> ${company.bank_name}</p>`
                : ""
            }
        </div>
        `
            : ""
        }

        <div class="footer">
            ${
              template.footer.showTerms
                ? `
            <p><strong>Allgemeine Geschäftsbedingungen:</strong> Es gelten unsere allgemeinen Geschäftsbedingungen.</p>
            `
                : ""
            }
            
            ${
              template.footer.customText
                ? `<p>${template.footer.customText}</p>`
                : ""
            }
            
            ${
              template.footer.showTaxInfo
                ? `
            <p>
                ${
                  company.tax_number
                    ? `Steuernummer: ${company.tax_number} | `
                    : ""
                }
                ${company.vat_id ? `USt-IdNr.: ${company.vat_id}` : ""}
            </p>
            `
                : ""
            }
        </div>
    </div>
</body>
</html>
  `;
}

function generateEstimateHTML(estimate, company, template) {
  // Ähnlich wie generateInvoiceHTML, aber für Kostenvoranschläge angepasst
  const colorSchemes = {
    blue: { primary: "#3B82F6", secondary: "#1E40AF", accent: "#EFF6FF" },
    green: { primary: "#10B981", secondary: "#047857", accent: "#ECFDF5" },
    red: { primary: "#EF4444", secondary: "#DC2626", accent: "#FEF2F2" },
    purple: { primary: "#8B5CF6", secondary: "#7C3AED", accent: "#F5F3FF" },
  };

  const colors =
    colorSchemes[template.styling.colorScheme] || colorSchemes.green;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  // Kostenvoranschlag-spezifische Anpassungen
  return (
    generateInvoiceHTML(estimate, company, template)
      .replace(/Rechnung/g, "Kostenvoranschlag")
      .replace(/invoice_number/g, "estimate_number")
      .replace("Rechnungsadresse", "Kundenadresse")
      .replace("Gesamtbetrag:", "Geschätzter Gesamtbetrag:") +
    `
    ${
      template.header.showValidUntil
        ? `
    <div style="background-color: ${
      colors.accent
    }; padding: 15px; margin: 20px 0; border-left: 4px solid ${
            colors.primary
          };">
        <p><strong>Gültigkeit:</strong> Dieses Angebot ist gültig bis ${formatDate(
          estimate.valid_until
        )}</p>
    </div>
    `
        : ""
    }
    `
  );
}

function getDefaultInvoiceTemplate() {
  return {
    header: {
      showLogo: true,
      showCompanyInfo: true,
      showCustomerInfo: true,
      layout: "standard",
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
    styling: { colorScheme: "blue", fontSize: "normal", spacing: "normal" },
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
    styling: { colorScheme: "green", fontSize: "normal", spacing: "normal" },
  };
}

module.exports = router;

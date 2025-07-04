const { getDbConnection } = require("./database");

console.log("🔍 KFZKalk1000 Datenbank Debug\n");

function checkDatabase() {
  const db = getDbConnection();

  console.log("📊 Prüfe Tabellen und Daten...\n");

  // Kunden prüfen
  db.all("SELECT * FROM customers", (err, customers) => {
    if (err) {
      console.error("❌ Fehler bei Kunden:", err);
    } else {
      console.log(`👥 Kunden gefunden: ${customers.length}`);
      customers.forEach((customer) => {
        console.log(`   - ${customer.name} (${customer.email})`);
      });
      console.log("");
    }
  });

  // Fahrzeuge prüfen
  db.all("SELECT * FROM vehicles", (err, vehicles) => {
    if (err) {
      console.error("❌ Fehler bei Fahrzeugen:", err);
    } else {
      console.log(`🚗 Fahrzeuge gefunden: ${vehicles.length}`);
      vehicles.forEach((vehicle) => {
        console.log(
          `   - ${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`
        );
      });
      console.log("");
    }
  });

  // Produkte prüfen
  db.all("SELECT * FROM products", (err, products) => {
    if (err) {
      console.error("❌ Fehler bei Produkten:", err);
    } else {
      console.log(`📦 Produkte gefunden: ${products.length}`);
      products.forEach((product) => {
        console.log(
          `   - ${product.name} (${product.price}€, ${product.stock} Stk.)`
        );
      });
      console.log("");
    }
  });

  // Kostenvoranschläge prüfen
  db.all("SELECT * FROM estimates", (err, estimates) => {
    if (err) {
      console.error("❌ Fehler bei Kostenvoranschlägen:", err);
    } else {
      console.log(`🧮 Kostenvoranschläge gefunden: ${estimates.length}`);
      estimates.forEach((estimate) => {
        console.log(
          `   - ${estimate.estimate_number} (${estimate.status}, ${estimate.total_amount}€)`
        );
      });
      console.log("");
    }
  });

  // Rechnungen prüfen
  db.all("SELECT * FROM invoices", (err, invoices) => {
    if (err) {
      console.error("❌ Fehler bei Rechnungen:", err);
    } else {
      console.log(`💰 Rechnungen gefunden: ${invoices.length}`);
      invoices.forEach((invoice) => {
        console.log(
          `   - ${invoice.invoice_number} (${invoice.status}, ${invoice.amount}€)`
        );
      });
      console.log("");
    }
  });

  // Dashboard-Statistiken prüfen
  setTimeout(() => {
    console.log("📈 Dashboard-Statistiken:");

    Promise.all([
      new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
          resolve(row ? row.count : 0);
        });
      }),
      new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
          resolve(row ? row.count : 0);
        });
      }),
      new Promise((resolve) => {
        db.get("SELECT SUM(amount) as total FROM invoices", (err, row) => {
          resolve(row ? row.total || 0 : 0);
        });
      }),
      new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM estimates", (err, row) => {
          resolve(row ? row.count : 0);
        });
      }),
    ]).then(([customerCount, vehicleCount, totalRevenue, estimateCount]) => {
      console.log(`   - Kunden: ${customerCount}`);
      console.log(`   - Fahrzeuge: ${vehicleCount}`);
      console.log(`   - Gesamtumsatz: ${totalRevenue.toFixed(2)}€`);
      console.log(`   - Kostenvoranschläge: ${estimateCount}`);
      console.log("");

      if (customerCount > 0 && vehicleCount > 0 && estimateCount > 0) {
        console.log("✅ Datenbank ist korrekt eingerichtet!");
        console.log('🚀 Sie können nun "npm start" ausführen.');
      } else {
        console.log("❌ Datenbank scheint leer zu sein.");
        console.log('🔧 Führen Sie "node setup.js" erneut aus.');
      }

      db.close();
    });
  }, 500);
}

checkDatabase();

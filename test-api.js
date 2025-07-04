const http = require("http");

console.log("🧪 KFZKalk1000 API Test\n");

function testAPI(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: path,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ ${description}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Data:`, JSON.stringify(jsonData, null, 2));
          console.log("");
          resolve(jsonData);
        } catch (error) {
          console.log(`❌ ${description}:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Raw Data: ${data}`);
          console.log("");
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      console.log(`❌ ${description}: Verbindungsfehler`);
      console.log(`   Error: ${error.message}`);
      console.log("");
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log("🚀 Teste API-Endpunkte...\n");

  try {
    // Health Check
    await testAPI("/api/health", "Health Check");

    // Dashboard
    await testAPI("/api/dashboard", "Dashboard Statistiken");

    // Kunden
    await testAPI("/api/customers", "Kunden Liste");

    // Fahrzeuge
    await testAPI("/api/vehicles", "Fahrzeug Liste");

    // Kostenvoranschläge
    await testAPI("/api/estimates", "Kostenvoranschlag Liste");

    // Produkte
    await testAPI("/api/products", "Produkt Liste");

    // Rechnungen
    await testAPI("/api/invoices", "Rechnungs Liste");

    console.log("🎉 Alle API-Tests abgeschlossen!");
    console.log("");
    console.log("Wenn alle Tests ✅ sind, liegt das Problem im Frontend.");
    console.log("Wenn Tests ❌ sind, liegt das Problem im Backend.");
  } catch (error) {
    console.log("💥 API-Test fehlgeschlagen!");
    console.log("");
    console.log("Mögliche Ursachen:");
    console.log("1. Server läuft nicht (starten Sie: npm start)");
    console.log("2. Falscher Port (sollte 3001 sein)");
    console.log("3. Datenbank-Problem (prüfen Sie: node debug.js)");
  }
}

runTests();

// setup.js - Repariert und funktionsfähig
const fs = require("fs");
const path = require("path");

console.log("🔧 KFZKalk1000 Setup wird gestartet...\n");

// Prüfen ob database.js existiert
const databasePath = path.join(__dirname, "database.js");
if (!fs.existsSync(databasePath)) {
  console.log("❌ database.js nicht gefunden!");
  console.log("💡 Verwende vereinfachten Setup ohne Datenbank-Import");
}

// HTML-Generator Funktion (direkt hier, falls utils-Datei nicht existiert)
const createFrontendHTML = () => {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KFZKalk1000 - KFZ Rechnungsprogramm</title>
  
  <!-- External Dependencies -->
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
      background-color: #111827;
      color: white;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-400">KFZKalk1000 wird geladen...</p>
      </div>
    </div>
  </div>
  
  <script type="text/babel">
    const { useState, useEffect } = React;
    
    // API Helper
    const api = {
      get: async (endpoint) => {
        const response = await fetch('/api' + endpoint);
        return response.json();
      },
      post: async (endpoint, data) => {
        const response = await fetch('/api' + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      put: async (endpoint, data) => {
        const response = await fetch('/api' + endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      delete: async (endpoint) => {
        const response = await fetch('/api' + endpoint, {
          method: 'DELETE'
        });
        return response.json();
      }
    };

    // Simple Icon Component
    const Icon = ({ name, size = 18, className = "" }) => {
      const iconSize = \`\${size}px\`;
      
      const icons = {
        home: React.createElement('svg', {
          width: iconSize, height: iconSize, viewBox: "0 0 24 24", 
          fill: "none", stroke: "currentColor", strokeWidth: "2", 
          strokeLinecap: "round", strokeLinejoin: "round", className
        }, [
          React.createElement('path', { key: 1, d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
          React.createElement('polyline', { key: 2, points: "9,22 9,12 15,12 15,22" })
        ]),
        users: React.createElement('svg', {
          width: iconSize, height: iconSize, viewBox: "0 0 24 24", 
          fill: "none", stroke: "currentColor", strokeWidth: "2", 
          strokeLinecap: "round", strokeLinejoin: "round", className
        }, [
          React.createElement('path', { key: 1, d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
          React.createElement('circle', { key: 2, cx: "9", cy: "7", r: "4" }),
          React.createElement('path', { key: 3, d: "m22 21-6-6" })
        ]),
        settings: React.createElement('svg', {
          width: iconSize, height: iconSize, viewBox: "0 0 24 24", 
          fill: "none", stroke: "currentColor", strokeWidth: "2", 
          strokeLinecap: "round", strokeLinejoin: "round", className
        }, [
          React.createElement('circle', { key: 1, cx: "12", cy: "12", r: "3" }),
          React.createElement('path', { key: 2, d: "M12 1v6m0 6v6" })
        ])
      };
      
      return icons[name] || icons.home;
    };

    // Main App Component
    const KFZKalk1000 = () => {
      const [status, setStatus] = useState('loading');
      const [serverInfo, setServerInfo] = useState(null);
      
      useEffect(() => {
        // Server Health Check
        api.get('/health')
          .then(data => {
            setServerInfo(data);
            setStatus('ready');
          })
          .catch(err => {
            console.error('Server Error:', err);
            setStatus('error');
          });
      }, []);
      
      if (status === 'loading') {
        return React.createElement('div', { 
          className: "min-h-screen bg-gray-900 text-white flex items-center justify-center" 
        }, [
          React.createElement('div', { className: "text-center", key: "loading" }, [
            React.createElement('div', { 
              className: "animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6" 
            }),
            React.createElement('h1', { className: "text-2xl font-bold mb-2" }, "KFZKalk1000"),
            React.createElement('p', { className: "text-gray-400" }, "Verbinde mit Server...")
          ])
        ]);
      }
      
      if (status === 'error') {
        return React.createElement('div', { 
          className: "min-h-screen bg-gray-900 text-white flex items-center justify-center" 
        }, [
          React.createElement('div', { className: "text-center max-w-md", key: "error" }, [
            React.createElement('div', { className: "text-red-500 text-6xl mb-4" }, "⚠️"),
            React.createElement('h1', { className: "text-3xl font-bold mb-4" }, "Setup erforderlich"),
            React.createElement('div', { className: "text-left bg-gray-800 p-4 rounded mb-4" }, [
              React.createElement('p', { className: "text-yellow-400 mb-2" }, "Server nicht erreichbar. Bitte führen Sie aus:"),
              React.createElement('code', { className: "block bg-black p-2 rounded text-green-400 text-sm" }, [
                "1. npm install", React.createElement('br'),
                "2. npm start"
              ])
            ]),
            React.createElement('button', {
              onClick: () => window.location.reload(),
              className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium"
            }, "Neu laden")
          ])
        ]);
      }
      
      return React.createElement('div', { 
        className: "min-h-screen bg-gray-900 text-white" 
      }, [
        // Header
        React.createElement('header', { 
          className: "bg-gray-800 border-b border-gray-700 p-6",
          key: "header"
        }, [
          React.createElement('div', { className: "flex items-center justify-between" }, [
            React.createElement('div', { className: "flex items-center space-x-3" }, [
              React.createElement('div', { className: "bg-blue-600 p-3 rounded-lg" }, 
                React.createElement(Icon, { name: "settings", size: 24, className: "text-white" })
              ),
              React.createElement('div', {}, [
                React.createElement('h1', { className: "text-3xl font-bold text-white" }, "KFZKalk1000"),
                React.createElement('p', { className: "text-gray-400" }, "Setup erfolgreich!")
              ])
            ]),
            React.createElement('div', { className: "text-right" }, [
              React.createElement('p', { className: "text-sm text-white" }, "Status: " + (serverInfo?.status || 'OK')),
              React.createElement('p', { className: "text-xs text-gray-400" }, "Ready für Entwicklung")
            ])
          ])
        ]),
        
        // Main Content
        React.createElement('main', { className: "p-8", key: "main" }, [
          React.createElement('div', { className: "max-w-4xl mx-auto" }, [
            React.createElement('div', { className: "bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-lg text-white mb-8" }, [
              React.createElement('h2', { className: "text-2xl font-bold mb-4" }, "🎉 Setup Abgeschlossen!"),
              React.createElement('p', { className: "text-lg mb-4" }, "KFZKalk1000 ist bereit für die Entwicklung."),
              React.createElement('div', { className: "bg-white/10 p-4 rounded" }, [
                React.createElement('p', { className: "font-medium mb-2" }, "Nächste Schritte:"),
                React.createElement('ol', { className: "list-decimal list-inside space-y-1 text-sm" }, [
                  React.createElement('li', {}, "Server mit 'npm start' starten"),
                  React.createElement('li', {}, "Browser zu http://localhost:3001 öffnen"),
                  React.createElement('li', {}, "Modulare Struktur implementieren")
                ])
              ])
            ]),
            
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
              React.createElement('div', { className: "bg-gray-800 p-6 rounded-lg border border-gray-700" }, [
                React.createElement('h3', { className: "text-xl font-bold mb-4 flex items-center gap-2" }, [
                  React.createElement(Icon, { name: "users", size: 20, className: "text-blue-400" }),
                  "Server Status"
                ]),
                React.createElement('div', { className: "space-y-2 text-sm" }, [
                  React.createElement('p', {}, "✅ React geladen"),
                  React.createElement('p', {}, "✅ API verbunden"),
                  React.createElement('p', {}, "✅ Frontend bereit"),
                  React.createElement('p', { className: "text-green-400 font-medium" }, "🚀 Alles funktioniert!")
                ])
              ]),
              
              React.createElement('div', { className: "bg-gray-800 p-6 rounded-lg border border-gray-700" }, [
                React.createElement('h3', { className: "text-xl font-bold mb-4 flex items-center gap-2" }, [
                  React.createElement(Icon, { name: "settings", size: 20, className: "text-purple-400" }),
                  "Projektstruktur"
                ]),
                React.createElement('div', { className: "space-y-2 text-sm text-gray-300" }, [
                  React.createElement('p', {}, "📁 routes/ - API Module"),
                  React.createElement('p', {}, "📁 public/ - Frontend"),
                  React.createElement('p', {}, "📁 utils/ - Hilfsfunktionen"),
                  React.createElement('p', { className: "text-blue-400 font-medium" }, "📚 Modulare Architektur")
                ])
              ])
            ])
          ])
        ])
      ]);
    };

    ReactDOM.render(React.createElement(KFZKalk1000), document.getElementById('root'));
  </script>
</body>
</html>`;
};

async function setup() {
  try {
    console.log("📁 Erstelle Ordnerstruktur...");

    // 1. Ordnerstruktur erstellen
    const directories = [
      "public",
      "public/js",
      "public/js/components",
      "public/js/utils",
      "public/css",
      "routes",
      "utils",
      "scripts",
    ];

    directories.forEach((dir) => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Ordner erstellt: ${dir}`);
      }
    });

    // 2. HTML-Datei erstellen
    console.log("🎨 Erstelle Frontend-Dateien...");
    const htmlPath = path.join(__dirname, "public", "index.html");
    fs.writeFileSync(htmlPath, createFrontendHTML());
    console.log("✅ Frontend HTML erstellt");

    // 3. CSS-Datei erstellen
    const cssContent = `
/* public/css/app.css - Hauptstyles */
body { 
  margin: 0; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
  background-color: #111827;
  color: white;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media print {
  body { margin: 0; background: white; color: black; }
  .no-print { display: none !important; }
}
    `;

    const cssPath = path.join(__dirname, "public", "css", "app.css");
    fs.writeFileSync(cssPath, cssContent);
    console.log("✅ CSS-Datei erstellt");

    // 4. Route-Platzhalter erstellen (falls nicht vorhanden)
    const routeFiles = [
      "routes/index.js",
      "routes/customers.js",
      "routes/vehicles.js",
      "routes/products.js",
      "routes/invoices.js",
      "routes/estimates.js",
      "routes/dashboard.js",
    ];

    routeFiles.forEach((routeFile) => {
      const routePath = path.join(__dirname, routeFile);
      if (!fs.existsSync(routePath)) {
        const routeName = path.basename(routeFile, ".js");
        const routeContent = `// ${routeFile} - Platzhalter
const express = require("express");
const router = express.Router();

// TODO: ${routeName} Routes implementieren
router.get("/", (req, res) => {
  res.json({ message: "${routeName} API - coming soon" });
});

module.exports = router;`;

        fs.writeFileSync(routePath, routeContent);
        console.log(`✅ Route-Platzhalter erstellt: ${routeFile}`);
      }
    });

    // 5. Scripts erstellen
    const scripts = [
      {
        name: "scripts/install.bat",
        content: `@echo off
echo ========================================
echo    KFZKalk1000 Installation
echo ========================================
echo.
echo Installiere NPM Pakete...
call npm install
echo.
echo Setup ausfuehren...
call node setup.js
echo.
echo Installation abgeschlossen!
pause`,
      },
      {
        name: "scripts/start.bat",
        content: `@echo off
echo ========================================
echo      KFZKalk1000 wird gestartet...
echo ========================================
echo.
echo Server startet auf: http://localhost:3001
echo.
start http://localhost:3001
call npm start`,
      },
    ];

    scripts.forEach((script) => {
      const scriptPath = path.join(__dirname, script.name);
      const scriptDir = path.dirname(scriptPath);
      if (!fs.existsSync(scriptDir)) {
        fs.mkdirSync(scriptDir, { recursive: true });
      }
      fs.writeFileSync(scriptPath, script.content);
      console.log(`✅ Script erstellt: ${script.name}`);
    });

    // 6. Datenbank Setup (falls database.js existiert)
    if (fs.existsSync(databasePath)) {
      console.log("📊 Datenbank wird eingerichtet...");
      try {
        const { setupDatabase } = require("./database");
        await setupDatabase();
        console.log("✅ Datenbank erfolgreich eingerichtet");
      } catch (error) {
        console.log("⚠️ Datenbank-Setup übersprungen:", error.message);
      }
    } else {
      console.log("ℹ️ database.js nicht gefunden - Setup ohne Datenbank");
    }

    // 7. Erfolg
    console.log("\n🎉 Setup erfolgreich abgeschlossen!");
    console.log("\n📁 Projektstruktur erstellt:");
    console.log("   ├── routes/           - API-Routen (Platzhalter)");
    console.log("   ├── public/js/        - Frontend JavaScript");
    console.log("   ├── public/css/       - Stylesheets");
    console.log("   ├── utils/            - Server Utilities");
    console.log("   └── scripts/          - Batch-Skripte");
    console.log("\n📋 Nächste Schritte:");
    console.log("   1. npm install        - Abhängigkeiten installieren");
    console.log("   2. npm start          - Server starten");
    console.log("   3. http://localhost:3001 im Browser öffnen");
    console.log("\n💡 Tipp: Das Frontend zeigt jetzt eine Setup-Bestätigung!");
  } catch (error) {
    console.error("❌ Fehler beim Setup:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Prüfen Sie ob Node.js installiert ist");
    console.log("   - Führen Sie 'npm install' aus");
    console.log("   - Stellen Sie sicher, dass der Ordner beschreibbar ist");
  }
}

// Setup ausführen
setup();

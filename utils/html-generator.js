// utils/html-generator.js - HTML-Code ausgelagert
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
  
  <!-- Local Styles -->
  <link rel="stylesheet" href="/css/app.css">
  
  <style>
    /* Tailwind Custom Config */
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
  
  <!-- Core JavaScript Modules -->
  <script type="text/babel" src="/js/utils/icons.js"></script>
  <script type="text/babel" src="/js/utils/api.js"></script>
  <script type="text/babel" src="/js/components/Dashboard.js"></script>
  <script type="text/babel" src="/js/components/Customers.js"></script>
  <script type="text/babel" src="/js/components/Vehicles.js"></script>
  <script type="text/babel" src="/js/components/Products.js"></script>
  <script type="text/babel" src="/js/components/Estimates.js"></script>
  <script type="text/babel" src="/js/components/Invoices.js"></script>
  <script type="text/babel" src="/js/components/Modal.js"></script>
  <script type="text/babel" src="/js/app.js"></script>
  
  <!-- Inline Fallback (falls Module nicht geladen werden) -->
  <script type="text/babel">
    // Fallback für Icons wenn utils/icons.js nicht lädt
    if (typeof Icon === 'undefined') {
      window.Icon = ({ name, size = 18, className = "" }) => {
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
          // Weitere Icons können hier hinzugefügt werden...
        };
        
        return icons[name] || icons.home;
      };
    }

    // Fallback für API wenn utils/api.js nicht lädt
    if (typeof api === 'undefined') {
      window.api = {
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
    }

    // Fallback Haupt-App wenn app.js nicht lädt
    if (typeof KFZKalk1000 === 'undefined') {
      const SimpleApp = () => {
        const [status, setStatus] = React.useState('loading');
        
        React.useEffect(() => {
          api.get('/health')
            .then(() => setStatus('ready'))
            .catch(() => setStatus('error'));
        }, []);
        
        if (status === 'loading') {
          return React.createElement('div', { 
            className: "min-h-screen bg-gray-900 text-white flex items-center justify-center" 
          }, [
            React.createElement('div', { className: "text-center", key: "loading" }, [
              React.createElement('div', { 
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" 
              }),
              React.createElement('p', { className: "text-gray-400" }, "Verbinde mit Server...")
            ])
          ]);
        }
        
        if (status === 'error') {
          return React.createElement('div', { 
            className: "min-h-screen bg-gray-900 text-white flex items-center justify-center" 
          }, [
            React.createElement('div', { className: "text-center", key: "error" }, [
              React.createElement('div', { className: "text-red-500 text-6xl mb-4" }, "⚠️"),
              React.createElement('h1', { className: "text-2xl font-bold mb-2" }, "Server nicht erreichbar"),
              React.createElement('p', { className: "text-gray-400 mb-4" }, "Bitte starten Sie den Server mit 'npm start'"),
              React.createElement('button', {
                onClick: () => window.location.reload(),
                className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              }, "Neu laden")
            ])
          ]);
        }
        
        return React.createElement('div', { 
          className: "min-h-screen bg-gray-900 text-white flex items-center justify-center" 
        }, [
          React.createElement('div', { className: "text-center", key: "ready" }, [
            React.createElement('div', { className: "text-green-500 text-6xl mb-4" }, "✅"),
            React.createElement('h1', { className: "text-2xl font-bold mb-2" }, "KFZKalk1000 ist bereit!"),
            React.createElement('p', { className: "text-gray-400 mb-4" }, "Die Anwendung wird geladen..."),
            React.createElement('p', { className: "text-xs text-gray-500" }, "Falls die App nicht lädt, prüfen Sie die Browser-Konsole (F12)")
          ])
        ]);
      };
      
      ReactDOM.render(React.createElement(SimpleApp), document.getElementById('root'));
    } else {
      // Normale App laden
      ReactDOM.render(React.createElement(KFZKalk1000), document.getElementById('root'));
    }
  </script>
</body>
</html>`;
};

module.exports = { createFrontendHTML };

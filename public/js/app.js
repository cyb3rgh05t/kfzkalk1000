// public/js/app.js - FIXED VERSION
const { useState, useEffect } = React;

// Main KFZKalk1000 Application
window.KFZKalk1000 = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Initialize start time for uptime calculation
  if (!window.startTime) {
    window.startTime = Date.now();
  }

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    setRefreshing(true);
    try {
      const result = await api.health.check();
      if (result.error) {
        setApiConnected(false);
        console.log("API nicht verfügbar, Demo-Modus aktiv");
      } else {
        setApiConnected(true);
        loadDashboardData();
      }
    } catch (error) {
      setApiConnected(false);
      console.log("API-Verbindung fehlgeschlagen, Demo-Modus aktiv");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500); // Visual feedback delay
    }
  };

  const loadDashboardData = async () => {
    try {
      const result = await api.dashboard.getStats();
      if (!result.error) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.log("Dashboard-Daten konnten nicht geladen werden");
    }
  };

  // Navigation items - UPDATED: Services hinzugefügt
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "home", color: "blue" },
    { id: "customers", label: "Kunden", icon: "users", color: "green" },
    { id: "vehicles", label: "Fahrzeuge", icon: "car", color: "purple" },
    {
      id: "services",
      label: "Leistungskatalog",
      icon: "wrench",
      color: "orange",
    }, // NEU
    {
      id: "estimates",
      label: "Kostenvoranschläge",
      icon: "calculator",
      color: "yellow",
    },
    { id: "invoices", label: "Rechnungen", icon: "fileText", color: "red" },
    { id: "products", label: "Produkte", icon: "package", color: "indigo" },
  ];

  // Render content based on active tab - FIXED: Echte Components
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardComponent data={dashboardData} onNavigate={setActiveTab} />
        );
      case "customers":
        return <CustomersComponent />;
      case "vehicles":
        return <VehiclesComponent />; // FIXED: Echte Component statt Placeholder
      case "services":
        return <ServicesComponent />; // NEU: Leistungskatalog
      case "estimates":
        return <EstimatesComponent />;
      case "invoices":
        return <InvoicesComponent />;
      case "products":
        return <ProductsComponent />;
      default:
        return (
          <div className="text-center py-12">
            <Icon
              name="settings"
              size={48}
              className="text-gray-600 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              Bereich in Entwicklung
            </h3>
            <p className="text-gray-500">
              Dieser Bereich wird bald verfügbar sein.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">KFZKalk1000</h1>
          <p className="text-gray-400">Anwendung wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header - SIMPLIFIED: System Status moved to Sidebar */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Icon name="wrench" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">KFZKalkPRO</h1>
                <p className="text-gray-400 text-sm">
                  Professionelle KFZ-Rechnungssoftware
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* User Info */}
              <div className="text-right">
                <p className="text-sm text-white font-medium">
                  Werkstatt Mustermann
                </p>
                <p className="text-xs text-gray-400">Eingeloggt als Admin</p>
              </div>

              {/* Quick Status Indicator */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    apiConnected ? "bg-green-400" : "bg-orange-400"
                  } animate-pulse`}
                />
                <span className="text-xs text-gray-400">
                  {apiConnected ? "Live" : "Demo"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - UPDATED: System Status hinzugefügt */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen sticky top-16">
          <nav className="p-4">
            {/* Navigation Menu */}
            <ul className="space-y-2 mb-6">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                const colorClasses = {
                  blue: isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-blue-600/20 hover:text-blue-300",
                  green: isActive
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-green-600/20 hover:text-green-300",
                  purple: isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-purple-600/20 hover:text-purple-300",
                  orange: isActive
                    ? "bg-orange-600 text-white"
                    : "text-gray-300 hover:bg-orange-600/20 hover:text-orange-300",
                  yellow: isActive
                    ? "bg-yellow-600 text-white"
                    : "text-gray-300 hover:bg-yellow-600/20 hover:text-yellow-300",
                  red: isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:bg-red-600/20 hover:text-red-300",
                  indigo: isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-indigo-600/20 hover:text-indigo-300",
                };

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                        colorClasses[item.color]
                      }`}
                    >
                      <Icon name={item.icon} size={18} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* System Status Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                System Status
              </h3>

              {/* API Connection Status */}
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">API Verbindung</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      apiConnected ? "bg-green-400" : "bg-orange-400"
                    }`}
                  />
                </div>
                <div
                  className={`text-sm font-medium ${
                    apiConnected ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  {apiConnected ? "Verbunden" : "Demo Modus"}
                </div>
                {!apiConnected && (
                  <div className="text-xs text-gray-500 mt-1">
                    Läuft mit Beispieldaten
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <div className="text-xs text-gray-400 mb-2">System Info</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version:</span>
                    <span className="text-gray-300">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uptime:</span>
                    <span className="text-gray-300">
                      {(() => {
                        const uptime =
                          Date.now() - (window.startTime || Date.now());
                        const minutes = Math.floor(uptime / 60000);
                        return minutes < 60
                          ? `${minutes}m`
                          : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Modus:</span>
                    <span
                      className={`font-medium ${
                        apiConnected ? "text-blue-400" : "text-orange-400"
                      }`}
                    >
                      {apiConnected ? "Production" : "Demo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Health Check */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">Health Check</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-300">Frontend OK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        apiConnected ? "bg-green-400" : "bg-orange-400"
                      }`}
                    />
                    <span className="text-xs text-gray-300">
                      Backend {apiConnected ? "OK" : "Demo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        apiConnected ? "bg-green-400" : "bg-orange-400"
                      }`}
                    />
                    <span className="text-xs text-gray-300">
                      Database {apiConnected ? "OK" : "Mock"}
                    </span>
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={checkApiConnection}
                  disabled={refreshing}
                  className="w-full mt-2 text-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-gray-300 py-1 px-2 rounded transition-colors flex items-center justify-center gap-1"
                  title="System Status aktualisieren"
                >
                  {refreshing ? (
                    <>
                      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Prüfe...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="refresh" size={12} />
                      <span>Aktualisieren</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 max-w-full overflow-x-auto">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

// Placeholder components entfernen - nur die echten Components bleiben
window.EstimatesComponent = () => (
  <div className="text-center py-12">
    <Icon name="calculator" size={48} className="text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-400 mb-2">
      Kostenvoranschläge
    </h3>
    <p className="text-gray-500">Wird in der nächsten Version implementiert.</p>
  </div>
);

window.InvoicesComponent = () => (
  <div className="text-center py-12">
    <Icon name="fileText" size={48} className="text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-400 mb-2">
      Rechnungsverwaltung
    </h3>
    <p className="text-gray-500">Wird in der nächsten Version implementiert.</p>
  </div>
);

window.ProductsComponent = () => (
  <div className="text-center py-12">
    <Icon name="package" size={48} className="text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-400 mb-2">
      Produktverwaltung
    </h3>
    <p className="text-gray-500">Wird in der nächsten Version implementiert.</p>
  </div>
);

// Initialize the application
ReactDOM.render(
  React.createElement(KFZKalk1000),
  document.getElementById("root")
);

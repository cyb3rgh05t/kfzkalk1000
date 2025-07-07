// public/js/app.js - Main Application (Enhanced)
const { useState, useEffect } = React;

// Main KFZKalk1000 Application
window.KFZKalk1000 = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
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

  // Navigation items
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "home", color: "blue" },
    { id: "customers", label: "Kunden", icon: "users", color: "green" },
    { id: "vehicles", label: "Fahrzeuge", icon: "car", color: "purple" },
    {
      id: "estimates",
      label: "Kostenvoranschläge",
      icon: "calculator",
      color: "yellow",
    },
    { id: "invoices", label: "Rechnungen", icon: "fileText", color: "red" },
    { id: "products", label: "Produkte", icon: "package", color: "indigo" },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardComponent data={dashboardData} onNavigate={setActiveTab} />
        );
      case "customers":
        return <CustomersComponent />;
      case "vehicles":
        return <VehiclesComponent />;
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
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Icon name="wrench" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">KFZKalk1000</h1>
                <p className="text-gray-400 text-sm">
                  Professionelle KFZ-Rechnungssoftware
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <div
                className={`flex items-center space-x-2 text-sm ${
                  apiConnected ? "text-green-400" : "text-orange-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiConnected ? "bg-green-400" : "bg-orange-400"
                  }`}
                />
                <span>{apiConnected ? "API Verbunden" : "Demo Modus"}</span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Seite neu laden"
              >
                <Icon name="refresh" size={16} />
              </button>

              {/* User Info */}
              <div className="text-right">
                <p className="text-sm text-white font-medium">
                  Werkstatt Mustermann
                </p>
                <p className="text-xs text-gray-400">Eingeloggt als Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen sticky top-16">
          <nav className="p-4">
            <ul className="space-y-2">
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

            {/* Connection Status in Sidebar */}
            <div className="mt-8 p-3 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">
                System Status
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">API:</span>
                  <span
                    className={
                      apiConnected ? "text-green-400" : "text-orange-400"
                    }
                  >
                    {apiConnected ? "Verbunden" : "Demo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DB:</span>
                  <span
                    className={
                      apiConnected ? "text-green-400" : "text-orange-400"
                    }
                  >
                    {apiConnected ? "SQLite" : "Demo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-blue-400">v1.0.0</span>
                </div>
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

// Enhanced Dashboard Component
window.DashboardComponent = ({ data, onNavigate }) => {
  const stats = data || {
    customerCount: 0,
    vehicleCount: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalEstimates: 0,
    pendingEstimates: 0,
  };

  const quickActions = [
    {
      label: "Neuer Kunde",
      icon: "users",
      action: () => onNavigate("customers"),
      color: "green",
      description: "Kundenstamm erweitern",
    },
    {
      label: "Fahrzeug hinzufügen",
      icon: "car",
      action: () => onNavigate("vehicles"),
      color: "purple",
      description: "Fahrzeugpark verwalten",
    },
    {
      label: "Neue Rechnung",
      icon: "fileText",
      action: () => onNavigate("invoices"),
      color: "red",
      description: "Rechnung erstellen",
    },
    {
      label: "Kostenvoranschlag",
      icon: "calculator",
      action: () => onNavigate("estimates"),
      color: "yellow",
      description: "Angebot kalkulieren",
    },
    {
      label: "Produkt hinzufügen",
      icon: "package",
      action: () => onNavigate("products"),
      color: "indigo",
      description: "Lager verwalten",
    },
    {
      label: "Wartung planen",
      icon: "wrench",
      action: () => alert("Wartungsplaner - in Entwicklung"),
      color: "blue",
      description: "Service organisieren",
    },
  ];

  const recentActivities = [
    {
      icon: "users",
      text: "Neuer Kunde: Max Mustermann hinzugefügt",
      time: "vor 2 Stunden",
      color: "green",
    },
    {
      icon: "car",
      text: "Fahrzeug: BMW 320i (AB-CD 123) bearbeitet",
      time: "vor 4 Stunden",
      color: "purple",
    },
    {
      icon: "fileText",
      text: "Rechnung RE-2025-001 erstellt",
      time: "vor 6 Stunden",
      color: "red",
    },
    {
      icon: "calculator",
      text: "Kostenvoranschlag KV-2025-003 gesendet",
      time: "gestern",
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Icon name="home" size={32} className="text-blue-400" />
          Dashboard
        </h2>
        <p className="text-gray-400">
          Willkommen zurück! Hier ist ein Überblick über Ihre Werkstatt.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Gesamtumsatz</p>
              <p className="text-2xl font-bold">
                {apiUtils.formatPrice(stats.totalRevenue)}
              </p>
              <p className="text-blue-200 text-xs mt-1">+12.5% diesen Monat</p>
            </div>
            <Icon name="dollar" size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Kunden</p>
              <p className="text-2xl font-bold">{stats.customerCount}</p>
              <p className="text-green-200 text-xs mt-1">+3 diese Woche</p>
            </div>
            <Icon name="users" size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Fahrzeuge</p>
              <p className="text-2xl font-bold">{stats.vehicleCount}</p>
              <p className="text-purple-200 text-xs mt-1">
                {stats.vehicleCount} registriert
              </p>
            </div>
            <Icon name="car" size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Offene Rechnungen</p>
              <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
              <p className="text-red-200 text-xs mt-1">
                Benötigen Aufmerksamkeit
              </p>
            </div>
            <Icon name="fileText" size={32} className="text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Kostenvoranschläge</p>
              <p className="text-2xl font-bold">{stats.totalEstimates}</p>
              <p className="text-yellow-200 text-xs mt-1">
                {stats.pendingEstimates} ausstehend
              </p>
            </div>
            <Icon name="calculator" size={32} className="text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Lagerbestand</p>
              <p className="text-2xl font-bold">156</p>
              <p className="text-indigo-200 text-xs mt-1">Produkte verfügbar</p>
            </div>
            <Icon name="package" size={32} className="text-indigo-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="star" size={20} className="text-yellow-400" />
            Schnellzugriff
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-4 rounded-lg bg-${action.color}-600 hover:bg-${action.color}-700 text-white transition-colors text-left group`}
              >
                <div className="flex items-start gap-3">
                  <Icon name={action.icon} size={20} className="mt-0.5" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="clock" size={20} className="text-blue-400" />
            Letzte Aktivitäten
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full bg-${activity.color}-600 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon name={activity.icon} size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{activity.text}</p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Alle Aktivitäten anzeigen →
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon name="shield" size={20} className="text-green-400" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="check" size={20} className="text-white" />
            </div>
            <p className="text-white font-medium">Datenbank</p>
            <p className="text-green-400 text-sm">Online</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="check" size={20} className="text-white" />
            </div>
            <p className="text-white font-medium">API Server</p>
            <p className="text-green-400 text-sm">Läuft</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="check" size={20} className="text-white" />
            </div>
            <p className="text-white font-medium">Backup</p>
            <p className="text-green-400 text-sm">Aktuell</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="info" size={20} className="text-white" />
            </div>
            <p className="text-white font-medium">Version</p>
            <p className="text-blue-400 text-sm">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components für andere Bereiche (werden später implementiert)
window.EstimatesComponent = () => (
  <div className="text-center py-12">
    <Icon name="calculator" size={48} className="text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-400 mb-2">
      Kostenvoranschläge
    </h3>
    <p className="text-gray-500">Wird in der nächsten Version implementiert.</p>
    <button
      onClick={() => alert("Feature in Entwicklung")}
      className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
    >
      Interessiert? Feedback geben
    </button>
  </div>
);

window.InvoicesComponent = () => (
  <div className="text-center py-12">
    <Icon name="fileText" size={48} className="text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-400 mb-2">
      Rechnungsverwaltung
    </h3>
    <p className="text-gray-500">Wird in der nächsten Version implementiert.</p>
    <button
      onClick={() => alert("Feature in Entwicklung")}
      className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
    >
      Interessiert? Feedback geben
    </button>
  </div>
);

// Initialize the application
ReactDOM.render(
  React.createElement(KFZKalk1000),
  document.getElementById("root")
);

// public/js/app.js - Main Application
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

// Simple Dashboard Component (placeholder)
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
      label: "Kunden verwalten",
      icon: "users",
      action: () => onNavigate("customers"),
      color: "blue",
    },
    {
      label: "Fahrzeuge verwalten",
      icon: "car",
      action: () => onNavigate("vehicles"),
      color: "purple",
    },
    {
      label: "Neue Rechnung",
      icon: "fileText",
      action: () => onNavigate("invoices"),
      color: "green",
    },
    {
      label: "Kostenvoranschlag",
      icon: "calculator",
      action: () => onNavigate("estimates"),
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">📊 Dashboard</h2>
        <p className="text-gray-400">Überblick über Ihre KFZ-Werkstatt</p>
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
            </div>
            <Icon name="dollar" size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Kunden</p>
              <p className="text-2xl font-bold">{stats.customerCount}</p>
            </div>
            <Icon name="users" size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Fahrzeuge</p>
              <p className="text-2xl font-bold">{stats.vehicleCount}</p>
            </div>
            <Icon name="car" size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Offene Rechnungen</p>
              <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
            </div>
            <Icon name="fileText" size={32} className="text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Kostenvoranschläge</p>
              <p className="text-2xl font-bold">{stats.totalEstimates}</p>
            </div>
            <Icon name="calculator" size={32} className="text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Wartende Angebote</p>
              <p className="text-2xl font-bold">{stats.pendingEstimates}</p>
            </div>
            <Icon name="package" size={32} className="text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Schnellzugriff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-lg bg-${action.color}-600 hover:bg-${action.color}-700 text-white transition-colors flex items-center gap-3`}
            >
              <Icon name={action.icon} size={20} />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other sections
window.VehiclesComponent = () => (
  <div className="text-center py-12">
    <Icon name="car" size={48} className="text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-400 mb-2">
      Fahrzeugverwaltung
    </h3>
    <p className="text-gray-500">Wird in der nächsten Version implementiert.</p>
  </div>
);

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

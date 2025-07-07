// public/js/components/Dashboard.js - UPDATED: Produktstatistiken hinzugefügt
const { useState, useEffect } = React;

window.DashboardComponent = ({ data, onNavigate }) => {
  const [stats, setStats] = useState({
    customerCount: 0,
    vehicleCount: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalEstimates: 0,
    pendingEstimates: 0,
    productCount: 0,
    lowStockProducts: 0,
    totalProductValue: 0,
    serviceCount: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    setLoading(true);
    try {
      // Dashboard-Basis-Statistiken laden
      const dashboardResult = await api.dashboard.getStats();
      if (!dashboardResult.error) {
        setStats((prev) => ({ ...prev, ...dashboardResult.data }));
      }

      // Produktstatistiken laden
      const productsResult = await api.products.getAll();
      if (!productsResult.error) {
        // Neues API-Format berücksichtigen
        const productsData = productsResult.data;
        if (productsData && productsData.data) {
          // Neue API mit Statistiken
          const products = productsData.data || [];
          const stats = productsData.stats || {};

          setStats((prev) => ({
            ...prev,
            productCount: stats.total || products.length,
            lowStockProducts:
              stats.lowStock || products.filter((p) => p.stock <= 5).length,
            totalProductValue:
              stats.totalValue ||
              products.reduce((sum, p) => sum + p.price * p.stock, 0),
          }));
        } else if (Array.isArray(productsData)) {
          // Fallback für altes API-Format
          const products = productsData;
          const lowStock = products.filter((p) => p.stock <= 5).length;
          const totalValue = products.reduce(
            (sum, p) => sum + p.price * p.stock,
            0
          );

          setStats((prev) => ({
            ...prev,
            productCount: products.length,
            lowStockProducts: lowStock,
            totalProductValue: totalValue,
          }));
        }
      }

      // Service-Statistiken laden
      const servicesResult = await api.services.getAll();
      if (!servicesResult.error) {
        // Services können auch Array oder Objekt sein
        const servicesData = servicesResult.data;
        const services = Array.isArray(servicesData)
          ? servicesData
          : servicesData?.data || [];

        setStats((prev) => ({
          ...prev,
          serviceCount: services.length,
        }));
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Kunden verwalten",
      icon: "users",
      action: () => onNavigate("customers"),
      color: "blue",
      description: "Kundendaten bearbeiten",
    },
    {
      label: "Fahrzeuge verwalten",
      icon: "car",
      action: () => onNavigate("vehicles"),
      color: "purple",
      description: "Fahrzeugdatenbank",
    },
    {
      label: "Produktkatalog",
      icon: "package",
      action: () => onNavigate("products"),
      color: "indigo",
      description: "Lager & Preise",
    },
    {
      label: "Leistungskatalog",
      icon: "wrench",
      action: () => onNavigate("services"),
      color: "orange",
      description: "Services & Arbeitszeiten",
    },
    {
      label: "Neue Rechnung",
      icon: "fileText",
      action: () => onNavigate("invoices"),
      color: "green",
      description: "Rechnung erstellen",
    },
    {
      label: "Kostenvoranschlag",
      icon: "calculator",
      action: () => onNavigate("estimates"),
      color: "yellow",
      description: "Angebot erstellen",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Überblick über Ihre KFZ-Werkstatt</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Aktualisiere...</span>
          </div>
        )}
      </div>

      {/* Stats Grid - ERWEITERT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Umsatz */}
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

        {/* Kunden */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Kunden</p>
              <p className="text-2xl font-bold">{stats.customerCount}</p>
            </div>
            <Icon name="users" size={32} className="text-green-200" />
          </div>
        </div>

        {/* Fahrzeuge */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Fahrzeuge</p>
              <p className="text-2xl font-bold">{stats.vehicleCount}</p>
            </div>
            <Icon name="car" size={32} className="text-purple-200" />
          </div>
        </div>

        {/* NEU: Produkte */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Produkte im Lager</p>
              <p className="text-2xl font-bold">{stats.productCount}</p>
              {stats.lowStockProducts > 0 && (
                <p className="text-orange-300 text-xs mt-1">
                  {stats.lowStockProducts} niedrig
                </p>
              )}
            </div>
            <Icon name="package" size={32} className="text-indigo-200" />
          </div>
        </div>

        {/* NEU: Lagerwert */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Lagerwert</p>
              <p className="text-xl font-bold">
                {apiUtils.formatPrice(stats.totalProductValue)}
              </p>
            </div>
            <Icon name="shield" size={32} className="text-teal-200" />
          </div>
        </div>

        {/* Services */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Leistungen</p>
              <p className="text-2xl font-bold">{stats.serviceCount}</p>
            </div>
            <Icon name="wrench" size={32} className="text-orange-200" />
          </div>
        </div>

        {/* Offene Rechnungen */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Offene Rechnungen</p>
              <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
            </div>
            <Icon name="fileText" size={32} className="text-red-200" />
          </div>
        </div>

        {/* Kostenvoranschläge */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Wartende Angebote</p>
              <p className="text-2xl font-bold">{stats.pendingEstimates}</p>
            </div>
            <Icon name="calculator" size={32} className="text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Warnungen */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="alertTriangle" size={20} className="text-orange-400" />
            <div>
              <h3 className="text-orange-400 font-medium">
                Niedriger Lagerbestand
              </h3>
              <p className="text-gray-300 text-sm">
                {stats.lowStockProducts} Produkt
                {stats.lowStockProducts !== 1 ? "e" : ""}
                {stats.lowStockProducts === 1 ? " hat" : " haben"} einen
                niedrigen Lagerbestand (≤5 Stück)
              </p>
            </div>
            <button
              onClick={() => onNavigate("products")}
              className="ml-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Prüfen
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Schnellzugriff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-lg bg-${action.color}-600 hover:bg-${action.color}-700 text-white transition-colors text-left group`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon name={action.icon} size={20} />
                <span className="font-medium">{action.label}</span>
              </div>
              <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="info" size={20} className="text-blue-400" />
            Systemüberblick
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Datenbankgröße</span>
              <span className="text-white font-medium">
                {stats.customerCount +
                  stats.vehicleCount +
                  stats.productCount +
                  stats.serviceCount}{" "}
                Einträge
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Lagerposition</span>
              <span className="text-white font-medium">
                {stats.productCount} Artikel
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Service-Katalog</span>
              <span className="text-white font-medium">
                {stats.serviceCount} Leistungen
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400 font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Betriebsbereit
              </span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="star" size={20} className="text-yellow-400" />
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Durchschnittl. Umsatz</span>
              <span className="text-white font-medium">
                {apiUtils.formatPrice(
                  stats.totalRevenue / Math.max(stats.customerCount, 1)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fahrzeuge/Kunde</span>
              <span className="text-white font-medium">
                {(
                  stats.vehicleCount / Math.max(stats.customerCount, 1)
                ).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Lagerumschlag</span>
              <span className="text-blue-400 font-medium">Gut</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Effizienz</span>
              <span className="text-green-400 font-medium">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

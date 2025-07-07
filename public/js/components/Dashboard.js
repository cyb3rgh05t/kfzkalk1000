const { useState, useEffect } = React;

// Dashboard Component - UPDATED: Services hinzugefügt
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
      label: "Leistungskatalog",
      icon: "wrench",
      action: () => onNavigate("services"),
      color: "orange",
    }, // NEU
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
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
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

      {/* Quick Actions - UPDATED */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Schnellzugriff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

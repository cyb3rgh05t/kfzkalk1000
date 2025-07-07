// public/js/utils/api.js - UPDATED VERSION mit erweiterten Vehicle APIs
window.api = {
  // Base API request function
  request: async (endpoint, options = {}) => {
    try {
      const url = `/api${endpoint}`;
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error("API Error:", error);
      return { data: null, error: error.message };
    }
  },

  // GET request
  get: async (endpoint) => {
    return api.request(endpoint, { method: "GET" });
  },

  // POST request
  post: async (endpoint, data) => {
    return api.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put: async (endpoint, data) => {
    return api.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // PATCH request
  patch: async (endpoint, data = {}) => {
    return api.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete: async (endpoint) => {
    return api.request(endpoint, { method: "DELETE" });
  },

  // Specific API endpoints
  customers: {
    getAll: () => api.get("/customers"),
    create: (data) => api.post("/customers", data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
  },

  // ERWEITERT: Vehicle APIs mit Preisen
  vehicles: {
    getAll: () => api.get("/vehicles"),
    getById: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post("/vehicles", data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
    sell: (id, data) => api.patch(`/vehicles/${id}/sell`, data),
    getStats: () => api.get("/vehicles/stats/overview"),
    getProfitable: () => api.get("/vehicles/stats/profitable"),
  },

  products: {
    getAll: () => api.get("/products"),
    create: (data) => api.post("/products", data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
  },

  // Services API
  services: {
    getAll: () => api.get("/services"),
    getCategories: () => api.get("/services/categories"),
    getByCategory: (category) =>
      api.get(`/services/category/${encodeURIComponent(category)}`),
    create: (data) => api.post("/services", data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`),
    activate: (id) => api.patch(`/services/${id}/activate`),
  },

  invoices: {
    getAll: () => api.get("/invoices"),
    create: (data) => api.post("/invoices", data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    generatePDF: (id) => {
      window.open(`/api/invoices/${id}/pdf`, "_blank");
    },
  },

  estimates: {
    getAll: () => api.get("/estimates"),
    create: (data) => api.post("/estimates", data),
    update: (id, data) => api.put(`/estimates/${id}`, data),
    delete: (id) => api.delete(`/estimates/${id}`),
    convertToInvoice: (id) => api.post(`/estimates/${id}/convert`),
    generatePDF: (id) => {
      window.open(`/api/estimates/${id}/pdf`, "_blank");
    },
  },

  // NEU: Settings API
  settings: {
    getAll: () => api.get("/settings"),
    getCategory: (category) => api.get(`/settings/${category}`),
    updateSetting: (category, key, value) =>
      api.put(`/settings/${category}/${key}`, { value }),
    updateCategory: (category, settings) =>
      api.put(`/settings/${category}`, settings),
    getTemplate: (type) => api.get(`/settings/templates/${type}`), // invoice oder estimate
  },

  // NEU: PDF API
  pdf: {
    generateInvoice: (id) => `/api/pdf/invoice/${id}`,
    generateEstimate: (id) => `/api/pdf/estimate/${id}`,
    previewInvoice: (id) => window.open(`/api/pdf/invoice/${id}`, "_blank"),
    previewEstimate: (id) => window.open(`/api/pdf/estimate/${id}`, "_blank"),
  },

  dashboard: {
    getStats: () => api.get("/dashboard"),
  },

  health: {
    check: () => api.get("/health"),
  },
};

// Utility functions für das API
window.apiUtils = {
  // Zeigt eine Erfolgs-Nachricht
  showSuccess: (message) => {
    if (window.showNotification) {
      window.showNotification(message, "success");
    } else {
      alert("✅ " + message);
    }
  },

  // Zeigt eine Fehler-Nachricht
  showError: (message) => {
    if (window.showNotification) {
      window.showNotification(message, "error");
    } else {
      alert("❌ " + message);
    }
  },

  // Bestätigung für Lösch-Aktionen
  confirmDelete: (itemName) => {
    return confirm(
      `Sind Sie sicher, dass Sie "${itemName}" löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
    );
  },

  // Formatiert Preise
  formatPrice: (price) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price || 0);
  },

  // Formatiert Datumsangaben
  formatDate: (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("de-DE");
  },

  // Formatiert Zeitangaben
  formatDuration: (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} Min.`;
    } else if (mins === 0) {
      return `${hours} Std.`;
    } else {
      return `${hours} Std. ${mins} Min.`;
    }
  },

  // Validiert Email-Adressen
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Generiert Rechnungsnummern
  generateInvoiceNumber: () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `RE-${year}-${timestamp}`;
  },

  // Generiert Kostenvoranschlag-Nummern
  generateEstimateNumber: () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `KV-${year}-${timestamp}`;
  },

  // Berechnet Gesamtpreis für Services
  calculateServiceTotal: (services) => {
    return services.reduce((total, service) => {
      return (
        total +
        (parseFloat(service.price) || 0) * (parseInt(service.quantity) || 1)
      );
    }, 0);
  },

  // Formatiert Servicepreis mit Arbeitszeit
  formatServicePrice: (service) => {
    const price = apiUtils.formatPrice(service.price);
    const duration = apiUtils.formatDuration(service.duration_minutes);
    return `${price} (${duration})`;
  },

  // NEU: Fahrzeug-spezifische Utilities

  // Berechnet Profit für ein Fahrzeug
  calculateVehicleProfit: (purchasePrice, salePrice) => {
    const purchase = parseFloat(purchasePrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    if (sale > 0) {
      return sale - purchase;
    }
    return null;
  },

  // Berechnet Profit-Prozentsatz
  calculateProfitPercentage: (purchasePrice, salePrice) => {
    const purchase = parseFloat(purchasePrice) || 0;
    const sale = parseFloat(salePrice) || 0;

    if (purchase > 0 && sale > 0) {
      return ((sale - purchase) / purchase) * 100;
    }
    return 0;
  },

  // Formatiert Fahrzeugstatus
  formatVehicleStatus: (status) => {
    const statusMap = {
      inventory: "Lager",
      sold: "Verkauft",
      reserved: "Reserviert",
      repair: "In Reparatur",
    };
    return statusMap[status] || status;
  },

  // Formatiert Profit mit Farbe
  formatProfitWithColor: (profit) => {
    if (profit === null || profit === undefined) {
      return { text: "N/A", color: "text-gray-400" };
    }

    const formatted = apiUtils.formatPrice(profit);
    const color = profit >= 0 ? "text-green-400" : "text-red-400";
    const prefix = profit >= 0 ? "+" : "";

    return {
      text: `${prefix}${formatted}`,
      color: color,
    };
  },

  // Validiert Fahrzeugdaten
  validateVehicleData: (data) => {
    const errors = {};

    if (!data.brand?.trim()) {
      errors.brand = "Marke ist erforderlich";
    }

    if (!data.model?.trim()) {
      errors.model = "Modell ist erforderlich";
    }

    if (!data.license_plate?.trim()) {
      errors.license_plate = "Kennzeichen ist erforderlich";
    }

    if (
      data.year &&
      (data.year < 1900 || data.year > new Date().getFullYear() + 1)
    ) {
      errors.year = "Ungültiges Baujahr";
    }

    if (data.mileage && data.mileage < 0) {
      errors.mileage = "Kilometerstand muss positiv sein";
    }

    if (data.purchase_price && data.purchase_price < 0) {
      errors.purchase_price = "Einkaufspreis muss positiv sein";
    }

    if (data.sale_price && data.sale_price < 0) {
      errors.sale_price = "Verkaufspreis muss positiv sein";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors,
    };
  },

  // Formatiert Fahrzeug-Bezeichnung
  formatVehicleTitle: (vehicle) => {
    if (!vehicle) return "";
    return `${vehicle.brand} ${vehicle.model}${
      vehicle.license_plate ? ` (${vehicle.license_plate})` : ""
    }`;
  },

  // Berechnet Fahrzeugalter
  calculateVehicleAge: (year) => {
    if (!year) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  },

  // Generiert Fahrzeug-Report
  generateVehicleReport: (vehicles) => {
    const totalVehicles = vehicles.length;
    const inventoryVehicles = vehicles.filter((v) => v.status === "inventory");
    const soldVehicles = vehicles.filter((v) => v.status === "sold");

    const totalInvested = vehicles.reduce(
      (sum, v) => sum + (v.purchase_price || 0),
      0
    );
    const inventoryValue = inventoryVehicles.reduce(
      (sum, v) => sum + (v.purchase_price || 0),
      0
    );
    const totalSales = soldVehicles.reduce(
      (sum, v) => sum + (v.sale_price || 0),
      0
    );
    const totalProfit = soldVehicles.reduce(
      (sum, v) =>
        sum + apiUtils.calculateVehicleProfit(v.purchase_price, v.sale_price),
      0
    );

    return {
      totalVehicles,
      inventoryCount: inventoryVehicles.length,
      soldCount: soldVehicles.length,
      totalInvested,
      inventoryValue,
      totalSales,
      totalProfit,
      profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0,
      avgProfitPerVehicle:
        soldVehicles.length > 0 ? totalProfit / soldVehicles.length : 0,
    };
  },
};

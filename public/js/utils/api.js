// public/js/utils/api.js - UPDATED VERSION mit Services
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

  vehicles: {
    getAll: () => api.get("/vehicles"),
    create: (data) => api.post("/vehicles", data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
  },

  products: {
    getAll: () => api.get("/products"),
    create: (data) => api.post("/products", data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
  },

  // NEU: Services API
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
      // PDF generation - öffnet neues Fenster
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
};

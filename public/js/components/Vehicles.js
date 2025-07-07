// public/js/components/Vehicles.js - ERWEITERT um Fahrzeugpreise
const { useState, useEffect } = React;

// Vehicle Modal Component - ERWEITERT
window.VehicleModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    brand: "",
    model: "",
    year: "",
    license_plate: "",
    vin: "",
    mileage: "",
    purchase_price: "",
    sale_price: "",
    purchase_date: "",
    sale_date: "",
    status: "inventory",
    notes: "",
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        customer_id: vehicle.customer_id || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || "",
        license_plate: vehicle.license_plate || "",
        vin: vehicle.vin || "",
        mileage: vehicle.mileage || "",
        purchase_price: vehicle.purchase_price || "",
        sale_price: vehicle.sale_price || "",
        purchase_date: vehicle.purchase_date || "",
        sale_date: vehicle.sale_date || "",
        status: vehicle.status || "inventory",
        notes: vehicle.notes || "",
      });
    } else {
      setFormData({
        customer_id: "",
        brand: "",
        model: "",
        year: "",
        license_plate: "",
        vin: "",
        mileage: "",
        purchase_price: "",
        sale_price: "",
        purchase_date: "",
        sale_date: "",
        status: "inventory",
        notes: "",
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const loadCustomers = async () => {
    const result = await api.customers.getAll();
    if (!result.error) {
      setCustomers(result.data || []);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
      newErrors.brand = "Marke ist erforderlich";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Modell ist erforderlich";
    }
    if (!formData.license_plate.trim()) {
      newErrors.license_plate = "Kennzeichen ist erforderlich";
    }
    if (
      formData.year &&
      (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)
    ) {
      newErrors.year = "Ungültiges Baujahr";
    }
    if (formData.mileage && formData.mileage < 0) {
      newErrors.mileage = "Kilometerstand muss positiv sein";
    }
    if (formData.purchase_price && formData.purchase_price < 0) {
      newErrors.purchase_price = "Einkaufspreis muss positiv sein";
    }
    if (formData.sale_price && formData.sale_price < 0) {
      newErrors.sale_price = "Verkaufspreis muss positiv sein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        purchase_price: formData.purchase_price
          ? parseFloat(formData.purchase_price)
          : 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : 0,
      };

      let result;
      if (vehicle) {
        result = await api.vehicles.update(vehicle.id, data);
      } else {
        result = await api.vehicles.create(data);
      }

      if (result.error) {
        apiUtils.showError(result.error);
      } else {
        const profit = result.data?.profit;
        let message = vehicle
          ? "Fahrzeug erfolgreich aktualisiert"
          : "Fahrzeug erfolgreich erstellt";

        if (profit !== null && profit !== undefined) {
          const profitText =
            profit >= 0
              ? `Gewinn: +${apiUtils.formatPrice(profit)}`
              : `Verlust: ${apiUtils.formatPrice(profit)}`;
          message += ` (${profitText})`;
        }

        apiUtils.showSuccess(message);
        onSave();
        onClose();
      }
    } catch (error) {
      apiUtils.showError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const statusOptions = [
    { value: "inventory", label: "Lager" },
    { value: "sold", label: "Verkauft" },
    { value: "reserved", label: "Reserviert" },
    { value: "repair", label: "In Reparatur" },
  ];

  // Berechne Gewinn/Verlust
  const calculateProfit = () => {
    const purchase = parseFloat(formData.purchase_price) || 0;
    const sale = parseFloat(formData.sale_price) || 0;
    if (sale > 0) {
      return sale - purchase;
    }
    return null;
  };

  const profit = calculateProfit();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? "Fahrzeug bearbeiten" : "Neues Fahrzeug"}
      size="xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="space-y-6">
          {/* Grunddaten */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Icon name="car" size={20} className="text-purple-400" />
              Fahrzeugdaten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Besitzer/Kunde"
                value={formData.customer_id}
                onChange={(value) =>
                  setFormData({ ...formData, customer_id: value })
                }
                options={customerOptions}
                placeholder="Kunde auswählen (optional)"
              />

              <FormSelect
                label="Status"
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                options={statusOptions}
                required
              />

              <FormInput
                label="Marke"
                value={formData.brand}
                onChange={(value) => setFormData({ ...formData, brand: value })}
                placeholder="z.B. BMW, Mercedes, VW"
                required
                error={errors.brand}
              />

              <FormInput
                label="Modell"
                value={formData.model}
                onChange={(value) => setFormData({ ...formData, model: value })}
                placeholder="z.B. 320i, C200, Golf"
                required
                error={errors.model}
              />

              <FormInput
                label="Baujahr"
                type="number"
                value={formData.year}
                onChange={(value) => setFormData({ ...formData, year: value })}
                placeholder="z.B. 2020"
                error={errors.year}
              />

              <FormInput
                label="Kennzeichen"
                value={formData.license_plate}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    license_plate: value.toUpperCase(),
                  })
                }
                placeholder="z.B. AB-CD 123"
                required
                error={errors.license_plate}
              />

              <FormInput
                label="Fahrgestellnummer (VIN)"
                value={formData.vin}
                onChange={(value) =>
                  setFormData({ ...formData, vin: value.toUpperCase() })
                }
                placeholder="17-stellige Fahrgestellnummer"
              />

              <FormInput
                label="Kilometerstand"
                type="number"
                value={formData.mileage}
                onChange={(value) =>
                  setFormData({ ...formData, mileage: value })
                }
                placeholder="z.B. 45000"
                error={errors.mileage}
              />
            </div>
          </div>

          {/* Preisangaben - NEU */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Icon name="dollar" size={20} className="text-green-400" />
              Preisangaben
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Einkaufspreis (€)"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(value) =>
                  setFormData({ ...formData, purchase_price: value })
                }
                placeholder="z.B. 25000.00"
                error={errors.purchase_price}
              />

              <FormInput
                label="Verkaufspreis (€)"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(value) =>
                  setFormData({ ...formData, sale_price: value })
                }
                placeholder="z.B. 28500.00"
                error={errors.sale_price}
              />

              <FormInput
                label="Einkaufsdatum"
                type="date"
                value={formData.purchase_date}
                onChange={(value) =>
                  setFormData({ ...formData, purchase_date: value })
                }
              />

              <FormInput
                label="Verkaufsdatum"
                type="date"
                value={formData.sale_date}
                onChange={(value) =>
                  setFormData({ ...formData, sale_date: value })
                }
              />
            </div>

            {/* Gewinn/Verlust Anzeige */}
            {profit !== null && (
              <div className="mt-4 p-4 rounded-lg bg-gray-700 border border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Gewinn/Verlust:</span>
                  <span
                    className={`text-lg font-bold ${
                      profit >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {profit >= 0 ? "+" : ""}
                    {apiUtils.formatPrice(profit)}
                  </span>
                </div>
                {formData.purchase_price > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400 text-sm">Gewinnspanne:</span>
                    <span
                      className={`text-sm font-medium ${
                        profit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {(
                        (profit / parseFloat(formData.purchase_price)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notizen */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Icon name="info" size={20} className="text-blue-400" />
              Zusätzliche Informationen
            </h3>
            <FormTextarea
              label="Notizen"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Zustand, Besonderheiten, Service-Historie..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <Icon name="save" size={16} />
            {vehicle ? "Aktualisieren" : "Erstellen"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Sell Vehicle Modal - NEU
window.SellVehicleModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const [formData, setFormData] = useState({
    sale_price: "",
    sale_date: new Date().toISOString().split("T")[0],
    customer_id: "",
    notes: "",
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      if (vehicle) {
        setFormData({
          sale_price: vehicle.sale_price || "",
          sale_date: new Date().toISOString().split("T")[0],
          customer_id: vehicle.customer_id || "",
          notes: vehicle.notes || "",
        });
      }
    }
  }, [isOpen, vehicle]);

  const loadCustomers = async () => {
    const result = await api.customers.getAll();
    if (!result.error) {
      setCustomers(result.data || []);
    }
  };

  const handleSell = async () => {
    if (!formData.sale_price || formData.sale_price <= 0) {
      apiUtils.showError("Verkaufspreis muss größer als 0 sein");
      return;
    }

    setLoading(true);
    try {
      const result = await api.vehicles.sell(vehicle.id, formData);

      if (result.error) {
        apiUtils.showError(result.error);
      } else {
        const profit =
          parseFloat(formData.sale_price) - (vehicle.purchase_price || 0);
        const profitText =
          profit >= 0
            ? `Gewinn: +${apiUtils.formatPrice(profit)}`
            : `Verlust: ${apiUtils.formatPrice(profit)}`;

        apiUtils.showSuccess(`Fahrzeug erfolgreich verkauft! ${profitText}`);
        onSave();
        onClose();
      }
    } catch (error) {
      apiUtils.showError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  const profit = formData.sale_price
    ? parseFloat(formData.sale_price) - (vehicle.purchase_price || 0)
    : 0;

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fahrzeug verkaufen"
      size="lg"
    >
      <div className="space-y-6">
        {/* Fahrzeuginfo */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">
            {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Einkaufspreis:</span>
              <span className="text-white ml-2">
                {apiUtils.formatPrice(vehicle.purchase_price || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Aktueller Wert:</span>
              <span className="text-white ml-2">
                {apiUtils.formatPrice(vehicle.sale_price || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Verkaufsdaten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Verkaufspreis (€)"
            type="number"
            step="0.01"
            value={formData.sale_price}
            onChange={(value) =>
              setFormData({ ...formData, sale_price: value })
            }
            placeholder="Endgültiger Verkaufspreis"
            required
          />

          <FormInput
            label="Verkaufsdatum"
            type="date"
            value={formData.sale_date}
            onChange={(value) => setFormData({ ...formData, sale_date: value })}
            required
          />

          <div className="md:col-span-2">
            <FormSelect
              label="Käufer"
              value={formData.customer_id}
              onChange={(value) =>
                setFormData({ ...formData, customer_id: value })
              }
              options={customerOptions}
              placeholder="Käufer auswählen"
            />
          </div>

          <div className="md:col-span-2">
            <FormTextarea
              label="Verkaufsnotizen"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Verkaufsbedingungen, Garantie, etc..."
              rows={3}
            />
          </div>
        </div>

        {/* Gewinn-Anzeige */}
        {formData.sale_price && (
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Erwarteter Gewinn/Verlust:</span>
              <span
                className={`text-xl font-bold ${
                  profit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {profit >= 0 ? "+" : ""}
                {apiUtils.formatPrice(profit)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSell}
            disabled={loading || !formData.sale_price}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <Icon name="dollar" size={16} />
            Verkaufen
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Main Vehicles Component - ERWEITERT
window.VehiclesComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [sellingVehicle, setSellingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadVehicles();
    loadStats();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await api.vehicles.getAll();
      if (result.error) {
        apiUtils.showError("Fehler beim Laden der Fahrzeuge: " + result.error);
        setVehicles([]);
      } else {
        setVehicles(result.data || []);
      }
    } catch (error) {
      apiUtils.showError("Fehler beim Laden der Fahrzeuge");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await api.vehicles.getStats();
      if (!result.error) {
        setStats(result.data || {});
      }
    } catch (error) {
      console.log("Statistiken konnten nicht geladen werden");
    }
  };

  const handleCreate = () => {
    setEditingVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = (vehicle) => {
    setDeletingVehicle(vehicle);
    setShowDeleteModal(true);
  };

  const handleSell = (vehicle) => {
    setSellingVehicle(vehicle);
    setShowSellModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingVehicle) return;

    const result = await api.vehicles.delete(deletingVehicle.id);
    if (result.error) {
      apiUtils.showError("Fehler beim Löschen: " + result.error);
    } else {
      apiUtils.showSuccess("Fahrzeug erfolgreich gelöscht");
      loadVehicles();
      loadStats();
    }
    setDeletingVehicle(null);
  };

  const handleSave = () => {
    loadVehicles();
    loadStats();
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Berechne Gesamt-Statistiken
  const inventoryValue = vehicles
    .filter((v) => v.status === "inventory")
    .reduce((sum, v) => sum + (v.purchase_price || 0), 0);

  const totalProfit = vehicles
    .filter((v) => v.status === "sold")
    .reduce(
      (sum, v) => sum + ((v.sale_price || 0) - (v.purchase_price || 0)),
      0
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Lade Fahrzeuge...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon name="car" size={32} className="text-purple-400" />
            Fahrzeugverwaltung
          </h2>
          <p className="text-gray-400 mt-1">
            {vehicles.length} Fahrzeug{vehicles.length !== 1 ? "e" : ""} •
            Lagerwert: {apiUtils.formatPrice(inventoryValue)}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Icon name="plus" size={16} />
          Neues Fahrzeug
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Gesamtfahrzeuge</p>
              <p className="text-2xl font-bold">{vehicles.length}</p>
            </div>
            <Icon name="car" size={24} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Im Lager</p>
              <p className="text-2xl font-bold">
                {vehicles.filter((v) => v.status === "inventory").length}
              </p>
            </div>
            <Icon name="package" size={24} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Verkauft</p>
              <p className="text-2xl font-bold">
                {vehicles.filter((v) => v.status === "sold").length}
              </p>
            </div>
            <Icon name="check" size={24} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Gesamtgewinn</p>
              <p className="text-xl font-bold">
                {apiUtils.formatPrice(totalProfit)}
              </p>
            </div>
            <Icon name="dollar" size={24} className="text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Fahrzeuge suchen (Marke, Modell, Kennzeichen, Kunde)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" size={18} className="text-gray-400" />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Alle Status</option>
            <option value="inventory">Lager</option>
            <option value="sold">Verkauft</option>
            <option value="reserved">Reserviert</option>
            <option value="repair">In Reparatur</option>
          </select>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="car" size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm || statusFilter
                ? "Keine Fahrzeuge gefunden"
                : "Noch keine Fahrzeuge"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? "Versuchen Sie andere Suchkriterien"
                : "Erstellen Sie Ihr erstes Fahrzeug um loszulegen"}
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={handleCreate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                Erstes Fahrzeug erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredVehicles.map((vehicle) => {
              const profit =
                vehicle.status === "sold" && vehicle.sale_price
                  ? vehicle.sale_price - (vehicle.purchase_price || 0)
                  : null;

              return (
                <div
                  key={vehicle.id}
                  className="p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                          <Icon name="car" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-mono">
                              {vehicle.license_plate}
                            </span>
                            {vehicle.year && (
                              <span>Baujahr {vehicle.year}</span>
                            )}
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                vehicle.status === "inventory"
                                  ? "bg-blue-600 text-white"
                                  : vehicle.status === "sold"
                                  ? "bg-green-600 text-white"
                                  : vehicle.status === "reserved"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {vehicle.status === "inventory"
                                ? "Lager"
                                : vehicle.status === "sold"
                                ? "Verkauft"
                                : vehicle.status === "reserved"
                                ? "Reserviert"
                                : vehicle.status === "repair"
                                ? "Reparatur"
                                : vehicle.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Besitzer</p>
                          <p className="text-gray-300 font-medium">
                            {vehicle.customer_name || "Nicht zugeordnet"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Einkaufspreis</p>
                          <p className="text-red-300 font-medium">
                            {apiUtils.formatPrice(vehicle.purchase_price || 0)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Verkaufspreis</p>
                          <p className="text-green-300 font-medium">
                            {apiUtils.formatPrice(vehicle.sale_price || 0)}
                          </p>
                        </div>

                        {profit !== null && (
                          <div>
                            <p className="text-gray-500 mb-1">Gewinn/Verlust</p>
                            <p
                              className={`font-bold ${
                                profit >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {profit >= 0 ? "+" : ""}
                              {apiUtils.formatPrice(profit)}
                            </p>
                          </div>
                        )}

                        {vehicle.mileage && (
                          <div>
                            <p className="text-gray-500 mb-1">Kilometerstand</p>
                            <p className="text-gray-300">
                              {vehicle.mileage.toLocaleString("de-DE")} km
                            </p>
                          </div>
                        )}
                      </div>

                      {vehicle.notes && (
                        <div className="mt-3 text-sm text-gray-400">
                          <strong>Notizen:</strong> {vehicle.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Bearbeiten"
                      >
                        <Icon name="edit" size={16} />
                      </button>

                      {vehicle.status === "inventory" && (
                        <button
                          onClick={() => handleSell(vehicle)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Verkaufen"
                        >
                          <Icon name="dollar" size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(vehicle)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Löschen"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Results Info */}
      {(searchTerm || statusFilter) && (
        <div className="text-center text-gray-400">
          {filteredVehicles.length} von {vehicles.length} Fahrzeugen gefunden
        </div>
      )}

      {/* Modals */}
      <VehicleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        vehicle={editingVehicle}
        onSave={handleSave}
      />

      <SellVehicleModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        vehicle={sellingVehicle}
        onSave={handleSave}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={
          deletingVehicle
            ? `${deletingVehicle.brand} ${deletingVehicle.model} (${deletingVehicle.license_plate})`
            : ""
        }
        itemType="Fahrzeug"
      />
    </div>
  );
};

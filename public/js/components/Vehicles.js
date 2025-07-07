// public/js/components/Vehicles.js - Vehicles Management Component
const { useState, useEffect } = React;

// Vehicle Modal Component
window.VehicleModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    brand: "",
    model: "",
    year: "",
    license_plate: "",
    vin: "",
    mileage: "",
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

    if (!formData.customer_id) {
      newErrors.customer_id = "Kunde ist erforderlich";
    }
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
        apiUtils.showSuccess(
          vehicle
            ? "Fahrzeug erfolgreich aktualisiert"
            : "Fahrzeug erfolgreich erstellt"
        );
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? "Fahrzeug bearbeiten" : "Neues Fahrzeug"}
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormSelect
              label="Kunde"
              value={formData.customer_id}
              onChange={(value) =>
                setFormData({ ...formData, customer_id: value })
              }
              options={customerOptions}
              placeholder="Kunde auswählen"
              required
              error={errors.customer_id}
            />
          </div>

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
              setFormData({ ...formData, license_plate: value.toUpperCase() })
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
            onChange={(value) => setFormData({ ...formData, mileage: value })}
            placeholder="z.B. 45000"
            error={errors.mileage}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
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

// Main Vehicles Component
window.VehiclesComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await api.vehicles.getAll();
      if (result.error) {
        apiUtils.showError("Fehler beim Laden der Fahrzeuge: " + result.error);
        // Fallback Demo-Daten
        setVehicles([
          {
            id: 1,
            customer_id: 1,
            customer_name: "Max Mustermann",
            brand: "BMW",
            model: "320i",
            year: 2020,
            license_plate: "AB-CD 123",
            vin: "WBAA12345678901234",
            mileage: 45000,
          },
          {
            id: 2,
            customer_id: 2,
            customer_name: "Maria Schmidt",
            brand: "Mercedes",
            model: "C200",
            year: 2019,
            license_plate: "XY-Z 789",
            vin: "WDD12345678901234",
            mileage: 38000,
          },
        ]);
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

  const confirmDelete = async () => {
    if (!deletingVehicle) return;

    const result = await api.vehicles.delete(deletingVehicle.id);
    if (result.error) {
      apiUtils.showError("Fehler beim Löschen: " + result.error);
    } else {
      apiUtils.showSuccess("Fahrzeug erfolgreich gelöscht");
      loadVehicles();
    }
    setDeletingVehicle(null);
  };

  const handleSave = () => {
    loadVehicles();
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Lade Fahrzeuge...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon name="car" size={32} className="text-purple-400" />
            Fahrzeugverwaltung
          </h2>
          <p className="text-gray-400 mt-1">
            {vehicles.length} Fahrzeug{vehicles.length !== 1 ? "e" : ""}{" "}
            verwalten
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

      {/* Search */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Fahrzeuge suchen (Marke, Modell, Kennzeichen, Kunde)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="car" size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm ? "Keine Fahrzeuge gefunden" : "Noch keine Fahrzeuge"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Versuchen Sie andere Suchbegriffe"
                : "Erstellen Sie Ihr erstes Fahrzeug um loszulegen"}
            </p>
            {!searchTerm && (
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
            {filteredVehicles.map((vehicle) => (
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
                          {vehicle.year && <span>Baujahr {vehicle.year}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Besitzer</p>
                        <p className="text-gray-300 font-medium">
                          {vehicle.customer_name || "Unbekannt"}
                        </p>
                      </div>

                      {vehicle.mileage && (
                        <div>
                          <p className="text-gray-500 mb-1">Kilometerstand</p>
                          <p className="text-gray-300">
                            {vehicle.mileage.toLocaleString("de-DE")} km
                          </p>
                        </div>
                      )}

                      {vehicle.vin && (
                        <div>
                          <p className="text-gray-500 mb-1">
                            Fahrgestellnummer
                          </p>
                          <p className="text-gray-300 font-mono text-xs">
                            {vehicle.vin}
                          </p>
                        </div>
                      )}
                    </div>
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

                    <button
                      onClick={() =>
                        alert("Wartungshistorie - wird implementiert")
                      }
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Wartungshistorie"
                    >
                      <Icon name="wrench" size={16} />
                    </button>

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
            ))}
          </div>
        )}
      </div>

      {/* Search Results Info */}
      {searchTerm && (
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

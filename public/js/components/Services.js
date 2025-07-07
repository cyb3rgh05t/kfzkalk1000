// public/js/components/Services.js - Leistungskatalog Management Component
const { useState, useEffect } = React;

// Service Modal Component
window.ServiceModal = ({ isOpen, onClose, service, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    duration_minutes: "60",
    labor_rate: "85.00",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  const predefinedCategories = [
    "Wartung",
    "Reparatur",
    "Motor",
    "Bremsen",
    "Reifen",
    "Elektrik",
    "Klimaanlage",
    "Karosserie",
    "Diagnose",
    "Prüfungen",
    "Sonstige",
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "",
        price: service.price?.toString() || "",
        duration_minutes: service.duration_minutes?.toString() || "60",
        labor_rate: service.labor_rate?.toString() || "85.00",
        is_active: service.is_active !== 0,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        duration_minutes: "60",
        labor_rate: "85.00",
        is_active: true,
      });
    }
    setErrors({});
  }, [service, isOpen]);

  const loadCategories = async () => {
    const result = await api.services.getCategories();
    if (!result.error) {
      setCategories([
        ...new Set([...predefinedCategories, ...(result.data || [])]),
      ]);
    } else {
      setCategories(predefinedCategories);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Kategorie ist erforderlich";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Preis muss größer als 0 sein";
    }
    if (
      !formData.duration_minutes ||
      parseInt(formData.duration_minutes) <= 0
    ) {
      newErrors.duration_minutes = "Dauer muss größer als 0 sein";
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
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        labor_rate: parseFloat(formData.labor_rate),
      };

      let result;
      if (service) {
        result = await api.services.update(service.id, data);
      } else {
        result = await api.services.create(data);
      }

      if (result.error) {
        apiUtils.showError(result.error);
      } else {
        apiUtils.showSuccess(
          service
            ? "Leistung erfolgreich aktualisiert"
            : "Leistung erfolgreich erstellt"
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

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? "Leistung bearbeiten" : "Neue Leistung"}
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Leistungsname"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="z.B. Ölwechsel, Inspektion"
            required
            error={errors.name}
          />

          <FormSelect
            label="Kategorie"
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            options={categoryOptions}
            placeholder="Kategorie auswählen"
            required
            error={errors.category}
          />

          <FormInput
            label="Preis (€)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(value) => setFormData({ ...formData, price: value })}
            placeholder="z.B. 89.00"
            required
            error={errors.price}
          />

          <FormInput
            label="Arbeitszeit (Minuten)"
            type="number"
            value={formData.duration_minutes}
            onChange={(value) =>
              setFormData({ ...formData, duration_minutes: value })
            }
            placeholder="z.B. 60"
            required
            error={errors.duration_minutes}
          />

          <FormInput
            label="Stundensatz (€)"
            type="number"
            step="0.01"
            value={formData.labor_rate}
            onChange={(value) =>
              setFormData({ ...formData, labor_rate: value })
            }
            placeholder="z.B. 85.00"
          />

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Leistung aktiv</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <FormTextarea
              label="Beschreibung"
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Detaillierte Beschreibung der Leistung..."
              rows={3}
            />
          </div>
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
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <Icon name="save" size={16} />
            {service ? "Aktualisieren" : "Erstellen"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Main Services Component
window.ServicesComponent = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const result = await api.services.getAll();
      if (result.error) {
        apiUtils.showError("Fehler beim Laden der Leistungen: " + result.error);
        // Fallback Demo-Daten
        setServices([
          {
            id: 1,
            name: "Ölwechsel",
            description: "Kompletter Ölwechsel mit Filter",
            category: "Wartung",
            price: 89.0,
            duration_minutes: 45,
            labor_rate: 85.0,
            is_active: 1,
          },
          {
            id: 2,
            name: "Inspektion klein",
            description: "Kleine Inspektion nach Herstellervorgabe",
            category: "Wartung",
            price: 149.0,
            duration_minutes: 90,
            labor_rate: 85.0,
            is_active: 1,
          },
        ]);
      } else {
        setServices(result.data || []);
      }
    } catch (error) {
      apiUtils.showError("Fehler beim Laden der Leistungen");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const result = await api.services.getCategories();
    if (!result.error) {
      setCategories(result.data || []);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = (service) => {
    setDeletingService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingService) return;

    const result = await api.services.delete(deletingService.id);
    if (result.error) {
      apiUtils.showError("Fehler beim Deaktivieren: " + result.error);
    } else {
      apiUtils.showSuccess("Leistung erfolgreich deaktiviert");
      loadServices();
    }
    setDeletingService(null);
  };

  const handleSave = () => {
    loadServices();
    loadCategories();
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group services by category
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    const category = service.category || "Sonstige";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-400">Lade Leistungskatalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon name="wrench" size={32} className="text-orange-400" />
            Leistungskatalog
          </h2>
          <p className="text-gray-400 mt-1">
            {services.length} Leistung{services.length !== 1 ? "en" : ""}{" "}
            verwalten
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Icon name="plus" size={16} />
          Neue Leistung
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Leistungen suchen (Name, Beschreibung)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
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

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        {Object.keys(servicesByCategory).length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 text-center py-12">
            <Icon
              name="wrench"
              size={48}
              className="text-gray-600 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm || selectedCategory
                ? "Keine Leistungen gefunden"
                : "Noch keine Leistungen"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Versuchen Sie andere Suchbegriffe oder Filter"
                : "Erstellen Sie Ihre erste Leistung um loszulegen"}
            </p>
            {!searchTerm && !selectedCategory && (
              <button
                onClick={handleCreate}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                Erste Leistung erstellen
              </button>
            )}
          </div>
        ) : (
          Object.entries(servicesByCategory).map(
            ([category, categoryServices]) => (
              <div
                key={category}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                <div className="bg-orange-600 px-6 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Icon name="wrench" size={20} />
                    {category} ({categoryServices.length})
                  </h3>
                </div>

                <div className="divide-y divide-gray-700">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-6 hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                              <Icon name="wrench" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                                  {apiUtils.formatPrice(service.price)}
                                </span>
                                <span>{service.duration_minutes} Min.</span>
                                {service.labor_rate && (
                                  <span>
                                    Stundensatz:{" "}
                                    {apiUtils.formatPrice(service.labor_rate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {service.description && (
                            <div className="text-gray-300 text-sm mb-2">
                              {service.description}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            ID: {service.id} • Erstellt:{" "}
                            {apiUtils.formatDate(service.created_at)} • Status:{" "}
                            {service.is_active ? "Aktiv" : "Inaktiv"}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Bearbeiten"
                          >
                            <Icon name="edit" size={16} />
                          </button>

                          <button
                            onClick={() =>
                              alert(
                                "Zu Kostenvoranschlag hinzufügen - wird implementiert"
                              )
                            }
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Zu Angebot hinzufügen"
                          >
                            <Icon name="plus" size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(service)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Deaktivieren"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Search Results Info */}
      {(searchTerm || selectedCategory) && (
        <div className="text-center text-gray-400">
          {filteredServices.length} von {services.length} Leistungen gefunden
          {selectedCategory && ` in Kategorie "${selectedCategory}"`}
        </div>
      )}

      {/* Modals */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        service={editingService}
        onSave={handleSave}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingService?.name}
        itemType="Leistung"
      />
    </div>
  );
};

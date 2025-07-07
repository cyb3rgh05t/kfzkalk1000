// public/js/components/Customers.js - Customer Management Component
const { useState, useEffect } = React;

window.CustomersComponent = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await api.customers.getAll();
      if (result.error) {
        apiUtils.showError("Fehler beim Laden der Kunden: " + result.error);
        // Fallback zu Demo-Daten
        setCustomers([
          {
            id: 1,
            name: "Max Mustermann",
            email: "max@example.com",
            phone: "0123-456789",
            address: "Musterstraße 1, 12345 Musterstadt",
          },
          {
            id: 2,
            name: "Maria Schmidt",
            email: "maria@example.com",
            phone: "0987-654321",
            address: "Beispielweg 5, 54321 Beispielstadt",
          },
        ]);
      } else {
        setCustomers(result.data || []);
      }
    } catch (error) {
      apiUtils.showError("Fehler beim Laden der Kunden");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;

    const result = await api.customers.delete(deletingCustomer.id);
    if (result.error) {
      apiUtils.showError("Fehler beim Löschen: " + result.error);
    } else {
      apiUtils.showSuccess("Kunde erfolgreich gelöscht");
      loadCustomers();
    }
    setDeletingCustomer(null);
  };

  const handleSave = () => {
    loadCustomers();
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Lade Kunden...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon name="users" size={32} className="text-blue-400" />
            Kundenverwaltung
          </h2>
          <p className="text-gray-400 mt-1">
            {customers.length} Kunde{customers.length !== 1 ? "n" : ""}{" "}
            verwalten
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Icon name="plus" size={16} />
          Neuer Kunde
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Kunden suchen (Name, E-Mail, Telefon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Customer List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              name="users"
              size={48}
              className="text-gray-600 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm ? "Keine Kunden gefunden" : "Noch keine Kunden"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Versuchen Sie andere Suchbegriffe"
                : "Erstellen Sie Ihren ersten Kunden um loszulegen"}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                Ersten Kunden erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Kunde #{customer.id}</span>
                          <span>•</span>
                          <span>
                            Erstellt: {apiUtils.formatDate(customer.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Icon
                              name="mail"
                              size={16}
                              className="text-gray-500"
                            />
                            <a
                              href={`mailto:${customer.email}`}
                              className="hover:text-blue-400 transition-colors"
                            >
                              {customer.email}
                            </a>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Icon
                              name="phone"
                              size={16}
                              className="text-gray-500"
                            />
                            <a
                              href={`tel:${customer.phone}`}
                              className="hover:text-blue-400 transition-colors"
                            >
                              {customer.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {customer.address && (
                        <div className="flex items-start gap-2 text-gray-300">
                          <Icon
                            name="mapPin"
                            size={16}
                            className="text-gray-500 mt-0.5"
                          />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Icon name="edit" size={16} />
                    </button>

                    <button
                      onClick={() =>
                        onCustomerSelect && onCustomerSelect(customer)
                      }
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Auswählen"
                    >
                      <Icon name="check" size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(customer)}
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
          {filteredCustomers.length} von {customers.length} Kunden gefunden
        </div>
      )}

      {/* Modals */}
      <CustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        customer={editingCustomer}
        onSave={handleSave}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingCustomer?.name}
        itemType="Kunde"
      />
    </div>
  );
};

// public/js/components/Products.js - Products Management Component
const { useState, useEffect } = React;

// Product Modal Component
window.ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    "Öle",
    "Filter",
    "Bremsen",
    "Zündung",
    "Beleuchtung",
    "Reifen",
    "Batterie",
    "Kühlung",
    "Auspuff",
    "Karosserie",
    "Innenraum",
    "Elektronik",
    "Werkzeug",
    "Zubehör",
    "Sonstiges",
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category || "",
        description: product.description || "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Produktname ist erforderlich";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Preis muss größer als 0 sein";
    }
    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "Lagerbestand muss 0 oder größer sein";
    }
    if (!formData.category) {
      newErrors.category = "Kategorie ist erforderlich";
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
        stock: parseInt(formData.stock),
      };

      let result;
      if (product) {
        result = await api.products.update(product.id, data);
      } else {
        result = await api.products.create(data);
      }

      if (result.error) {
        apiUtils.showError(result.error);
      } else {
        apiUtils.showSuccess(
          product
            ? "Produkt erfolgreich aktualisiert"
            : "Produkt erfolgreich erstellt"
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
      title={product ? "Produkt bearbeiten" : "Neues Produkt"}
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
            <FormInput
              label="Produktname"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="z.B. Motoröl 5W-30"
              required
              error={errors.name}
            />
          </div>

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
            placeholder="z.B. 45.99"
            required
            error={errors.price}
          />

          <FormInput
            label="Lagerbestand"
            type="number"
            value={formData.stock}
            onChange={(value) => setFormData({ ...formData, stock: value })}
            placeholder="z.B. 25"
            required
            error={errors.stock}
          />

          <div className="md:col-span-2">
            <FormTextarea
              label="Beschreibung"
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Produktbeschreibung..."
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <Icon name="save" size={16} />
            {product ? "Aktualisieren" : "Erstellen"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Main Products Component
window.ProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await api.products.getAll();
      if (result.error) {
        apiUtils.showError("Fehler beim Laden der Produkte: " + result.error);
        // Fallback Demo-Daten
        setProducts([
          {
            id: 1,
            name: "Motoröl 5W-30",
            price: 45.0,
            stock: 25,
            category: "Öle",
            description: "Hochwertiges Motoröl für moderne Motoren",
          },
          {
            id: 2,
            name: "Bremsbeläge vorne",
            price: 89.0,
            stock: 8,
            category: "Bremsen",
            description: "Bremsbeläge für Vorderachse",
          },
          {
            id: 3,
            name: "Luftfilter",
            price: 25.0,
            stock: 15,
            category: "Filter",
            description: "Luftfilter für bessere Motorleistung",
          },
          {
            id: 4,
            name: "Zündkerzen (4er Set)",
            price: 35.0,
            stock: 20,
            category: "Zündung",
            description: "Zündkerzen für 4-Zylinder Motor",
          },
          {
            id: 5,
            name: "Scheibenwischer",
            price: 18.5,
            stock: 30,
            category: "Zubehör",
            description: "Scheibenwischer Set vorne",
          },
        ]);
      } else {
        setProducts(result.data || []);
      }
    } catch (error) {
      apiUtils.showError("Fehler beim Laden der Produkte");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    const result = await api.products.delete(deletingProduct.id);
    if (result.error) {
      apiUtils.showError("Fehler beim Löschen: " + result.error);
    } else {
      apiUtils.showSuccess("Produkt erfolgreich gelöscht");
      loadProducts();
    }
    setDeletingProduct(null);
  };

  const handleSave = () => {
    loadProducts();
  };

  // Get unique categories
  const categories = [...new Set(products.map((p) => p.category))].sort();

  // Filter and sort products
  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort products
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "stock":
        return a.stock - b.stock;
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  // Calculate inventory stats
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Lade Produkte...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon name="package" size={32} className="text-indigo-400" />
            Produktverwaltung
          </h2>
          <p className="text-gray-400 mt-1">
            {products.length} Produkt{products.length !== 1 ? "e" : ""} •{" "}
            Gesamtwert: {apiUtils.formatPrice(totalValue)}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Icon name="plus" size={16} />
          Neues Produkt
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Gesamtprodukte</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <Icon name="package" size={24} className="text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Niedriger Bestand</p>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
            </div>
            <Icon name="alertTriangle" size={24} className="text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Lagerwert</p>
              <p className="text-xl font-bold">
                {apiUtils.formatPrice(totalValue)}
              </p>
            </div>
            <Icon name="dollar" size={24} className="text-green-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Produkte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name">Name</option>
            <option value="price">Preis</option>
            <option value="stock">Bestand</option>
            <option value="category">Kategorie</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Icon
              name="package"
              size={48}
              className="text-gray-600 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm || selectedCategory
                ? "Keine Produkte gefunden"
                : "Noch keine Produkte"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Versuchen Sie andere Suchkriterien"
                : "Erstellen Sie Ihr erstes Produkt um loszulegen"}
            </p>
            {!searchTerm && !selectedCategory && (
              <button
                onClick={handleCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                Erstes Produkt erstellen
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">
                      {product.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        product.stock <= 5
                          ? "bg-red-600 text-white"
                          : product.stock <= 10
                          ? "bg-yellow-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {product.stock} auf Lager
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                    title="Löschen"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Preis</span>
                  <span className="text-xl font-bold text-green-400">
                    {apiUtils.formatPrice(product.price)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Lagerwert</span>
                  <span className="text-white font-medium">
                    {apiUtils.formatPrice(product.price * product.stock)}
                  </span>
                </div>

                {product.description && (
                  <div>
                    <span className="text-gray-400 text-sm">Beschreibung</span>
                    <p className="text-gray-300 text-sm mt-1">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Search Results Info */}
      {(searchTerm || selectedCategory) && (
        <div className="text-center text-gray-400">
          {filteredProducts.length} von {products.length} Produkten gefunden
        </div>
      )}

      {/* Low Stock Warning */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="alertTriangle" size={20} className="text-orange-400" />
            <h3 className="text-lg font-medium text-orange-400">
              Niedriger Lagerbestand
            </h3>
          </div>
          <p className="text-gray-300 mb-3">
            Die folgenden Produkte haben einen niedrigen Lagerbestand (≤5
            Stück):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded"
              >
                <span className="text-white">{product.name}</span>
                <span className="text-orange-400 font-bold">
                  {product.stock} Stück
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
        onSave={handleSave}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingProduct?.name}
        itemType="Produkt"
      />
    </div>
  );
};

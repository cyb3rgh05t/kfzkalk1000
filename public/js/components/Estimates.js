window.EstimatesComponent = () => {
  const [estimates, setEstimates] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingEstimate, setEditingEstimate] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [estimatesData, customersData, vehiclesData] = await Promise.all([
        api.estimates.getAll(),
        api.customers.getAll(),
        api.vehicles.getAll(),
      ]);
      setEstimates(estimatesData);
      setCustomers(customersData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      apiUtils.showError("Fehler beim Laden der Daten");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (estimateData) => {
    try {
      if (editingEstimate) {
        await api.estimates.update(editingEstimate.id, estimateData);
        apiUtils.showSuccess("Kostenvoranschlag aktualisiert");
      } else {
        await api.estimates.create(estimateData);
        apiUtils.showSuccess("Kostenvoranschlag erstellt");
      }
      setShowModal(false);
      setEditingEstimate(null);
      loadData();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      apiUtils.showError("Fehler beim Speichern");
    }
  };

  const handleDelete = async (estimate) => {
    if (
      !apiUtils.confirmDelete(`Kostenvoranschlag ${estimate.estimate_number}`)
    ) {
      return;
    }

    try {
      await api.estimates.delete(estimate.id);
      apiUtils.showSuccess("Kostenvoranschlag gelöscht");
      loadData();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      apiUtils.showError("Fehler beim Löschen");
    }
  };

  const handleConvertToInvoice = async (estimate) => {
    if (
      !confirm(
        `Kostenvoranschlag ${estimate.estimate_number} in Rechnung umwandeln?`
      )
    ) {
      return;
    }

    try {
      await api.estimates.convertToInvoice(estimate.id);
      apiUtils.showSuccess("Kostenvoranschlag in Rechnung umgewandelt");
      loadData();
    } catch (error) {
      console.error("Fehler beim Umwandeln:", error);
      apiUtils.showError("Fehler beim Umwandeln");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-500",
      sent: "bg-blue-500",
      accepted: "bg-green-500",
      rejected: "bg-red-500",
      converted: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusText = (status) => {
    const texts = {
      draft: "Entwurf",
      sent: "Versendet",
      accepted: "Angenommen",
      rejected: "Abgelehnt",
      converted: "Umgewandelt",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400">
          Lade Kostenvoranschläge...
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon name="calculator" size={32} className="text-green-400" />
            Kostenvoranschläge
          </h1>
          <p className="text-gray-400 mt-1">
            {estimates.length} Kostenvoranschläge verwalten
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEstimate(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Icon name="plus" size={16} />
          Neuer Kostenvoranschlag
        </button>
      </div>

      {/* Estimates Liste */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fahrzeug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Gültig bis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {estimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-white">
                      {estimate.estimate_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">
                      {estimate.customer_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">
                      {estimate.vehicle_info}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">
                      {apiUtils.formatDate(estimate.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">
                      {apiUtils.formatDate(estimate.valid_until)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-green-400">
                      {apiUtils.formatPrice(estimate.total_amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(
                        estimate.status
                      )}`}
                    >
                      {getStatusText(estimate.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => api.pdf.previewEstimate(estimate.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="PDF anzeigen"
                      >
                        <Icon name="eye" size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEstimate(estimate);
                          setShowModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Bearbeiten"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      {estimate.status === "accepted" && (
                        <button
                          onClick={() => handleConvertToInvoice(estimate)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title="In Rechnung umwandeln"
                        >
                          <Icon name="refresh" size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(estimate)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Löschen"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <EstimateModal
          estimate={editingEstimate}
          customers={customers}
          vehicles={vehicles}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingEstimate(null);
          }}
        />
      )}
    </div>
  );
};

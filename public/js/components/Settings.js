// public/js/components/Settings.js - Einstellungen Component
window.SettingsComponent = () => {
  const [activeTab, setActiveTab] = React.useState("company");
  const [settings, setSettings] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [changes, setChanges] = React.useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Settings laden
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings");
      setSettings(response);
      setChanges({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      apiUtils.showError("Fehler beim Laden der Einstellungen");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category, key, value) => {
    const newChanges = {
      ...changes,
      [category]: {
        ...changes[category],
        [key]: value,
      },
    };
    setChanges(newChanges);
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Alle geänderten Kategorien durchgehen
      for (const [category, categoryChanges] of Object.entries(changes)) {
        await api.put(`/settings/${category}`, categoryChanges);
      }

      apiUtils.showSuccess("Einstellungen erfolgreich gespeichert");
      await loadSettings(); // Neu laden
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      apiUtils.showError("Fehler beim Speichern der Einstellungen");
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setChanges({});
    setHasUnsavedChanges(false);
  };

  const getValue = (category, key) => {
    if (changes[category] && changes[category][key] !== undefined) {
      return changes[category][key];
    }
    return settings[category]?.[key]?.value || "";
  };

  const tabs = [
    { id: "company", name: "Firmendaten", icon: "building" },
    { id: "invoice", name: "Rechnungen", icon: "fileText" },
    { id: "estimate", name: "Kostenvoranschläge", icon: "calculator" },
    { id: "templates", name: "Templates", icon: "layout" },
    { id: "print", name: "Druck/PDF", icon: "printer" },
    { id: "system", name: "System", icon: "settings" },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          Lade Einstellungen...
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
            <Icon name="settings" size={32} className="text-blue-400" />
            Einstellungen
          </h1>
          <p className="text-gray-400 mt-1">
            System- und Unternehmenseinstellungen verwalten
          </p>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-sm">
              Ungespeicherte Änderungen
            </span>
            <button
              onClick={resetChanges}
              className="px-3 py-1 text-gray-300 bg-gray-600 rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Zurücksetzen
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <Icon name="save" size={16} />
              Speichern
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.name}
              {changes[tab.id] && Object.keys(changes[tab.id]).length > 0 && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        {activeTab === "company" && (
          <CompanySettings
            settings={settings.company || {}}
            onChange={(key, value) => updateSetting("company", key, value)}
            getValue={(key) => getValue("company", key)}
          />
        )}

        {activeTab === "invoice" && (
          <InvoiceSettings
            settings={settings.invoice || {}}
            onChange={(key, value) => updateSetting("invoice", key, value)}
            getValue={(key) => getValue("invoice", key)}
          />
        )}

        {activeTab === "estimate" && (
          <EstimateSettings
            settings={settings.estimate || {}}
            onChange={(key, value) => updateSetting("estimate", key, value)}
            getValue={(key) => getValue("estimate", key)}
          />
        )}

        {activeTab === "templates" && (
          <TemplateSettings
            settings={settings.templates || {}}
            onChange={(key, value) => updateSetting("templates", key, value)}
            getValue={(key) => getValue("templates", key)}
          />
        )}

        {activeTab === "print" && (
          <PrintSettings
            settings={settings.print || {}}
            onChange={(key, value) => updateSetting("print", key, value)}
            getValue={(key) => getValue("print", key)}
          />
        )}

        {activeTab === "system" && (
          <SystemSettings
            settings={settings.system || {}}
            onChange={(key, value) => updateSetting("system", key, value)}
            getValue={(key) => getValue("system", key)}
          />
        )}
      </div>
    </div>
  );
};

// Firmendaten Settings
const CompanySettings = ({ settings, onChange, getValue }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
      <Icon name="building" size={20} className="text-blue-400" />
      Firmendaten
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormInput
        label="Firmenname"
        value={getValue("name")}
        onChange={(value) => onChange("name", value)}
        placeholder="Mustermann KFZ-Werkstatt"
        required
      />

      <FormInput
        label="Telefon"
        value={getValue("phone")}
        onChange={(value) => onChange("phone", value)}
        placeholder="+49 123 456789"
        type="tel"
      />

      <FormInput
        label="Straße & Hausnummer"
        value={getValue("address_street")}
        onChange={(value) => onChange("address_street", value)}
        placeholder="Musterstraße 123"
      />

      <FormInput
        label="E-Mail"
        value={getValue("email")}
        onChange={(value) => onChange("email", value)}
        placeholder="info@mustermann-kfz.de"
        type="email"
      />

      <FormInput
        label="PLZ & Ort"
        value={getValue("address_city")}
        onChange={(value) => onChange("address_city", value)}
        placeholder="12345 Musterstadt"
      />

      <FormInput
        label="Website"
        value={getValue("website")}
        onChange={(value) => onChange("website", value)}
        placeholder="www.mustermann-kfz.de"
        type="url"
      />

      <FormInput
        label="Steuernummer"
        value={getValue("tax_number")}
        onChange={(value) => onChange("tax_number", value)}
        placeholder="DE123456789"
      />

      <FormInput
        label="USt-IdNr."
        value={getValue("vat_id")}
        onChange={(value) => onChange("vat_id", value)}
        placeholder="DE123456789"
      />

      <FormInput
        label="IBAN"
        value={getValue("iban")}
        onChange={(value) => onChange("iban", value)}
        placeholder="DE89 1234 5678 9012 3456 78"
      />

      <FormInput
        label="BIC"
        value={getValue("bic")}
        onChange={(value) => onChange("bic", value)}
        placeholder="DEUTDEFF"
      />

      <div className="md:col-span-2">
        <FormInput
          label="Bank"
          value={getValue("bank_name")}
          onChange={(value) => onChange("bank_name", value)}
          placeholder="Deutsche Bank"
        />
      </div>
    </div>
  </div>
);

// Rechnungseinstellungen
const InvoiceSettings = ({ settings, onChange, getValue }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
      <Icon name="fileText" size={20} className="text-blue-400" />
      Rechnungseinstellungen
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormInput
        label="Rechnungsnummer Präfix"
        value={getValue("number_prefix")}
        onChange={(value) => onChange("number_prefix", value)}
        placeholder="RE"
      />

      <FormInput
        label="Mehrwertsteuersatz (%)"
        value={getValue("vat_rate")}
        onChange={(value) => onChange("vat_rate", value)}
        type="number"
        min="0"
        max="100"
        step="0.1"
        placeholder="19"
      />

      <FormInput
        label="Zahlungsbedingungen"
        value={getValue("payment_terms")}
        onChange={(value) => onChange("payment_terms", value)}
        placeholder="14 Tage netto"
      />

      <FormInput
        label="Mahngebühr (EUR)"
        value={getValue("late_fee")}
        onChange={(value) => onChange("late_fee", value)}
        type="number"
        min="0"
        step="0.01"
        placeholder="5.00"
      />

      <FormSelect
        label="Währung"
        value={getValue("default_currency")}
        onChange={(value) => onChange("default_currency", value)}
        options={[
          { value: "EUR", label: "Euro (EUR)" },
          { value: "USD", label: "US Dollar (USD)" },
          { value: "CHF", label: "Schweizer Franken (CHF)" },
        ]}
      />

      <FormSelect
        label="Sprache"
        value={getValue("language")}
        onChange={(value) => onChange("language", value)}
        options={[
          { value: "de", label: "Deutsch" },
          { value: "en", label: "English" },
        ]}
      />
    </div>
  </div>
);

// Weitere Settings Components...
const EstimateSettings = ({ settings, onChange, getValue }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
      <Icon name="calculator" size={20} className="text-blue-400" />
      Kostenvoranschlag-Einstellungen
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormInput
        label="KV-Nummer Präfix"
        value={getValue("number_prefix")}
        onChange={(value) => onChange("number_prefix", value)}
        placeholder="KV"
      />

      <FormInput
        label="Gültigkeit (Tage)"
        value={getValue("validity_days")}
        onChange={(value) => onChange("validity_days", value)}
        type="number"
        min="1"
        placeholder="30"
      />

      <FormCheckbox
        label="Arbeitszeit anzeigen"
        checked={getValue("include_labor") === "true"}
        onChange={(checked) =>
          onChange("include_labor", checked ? "true" : "false")
        }
      />

      <FormCheckbox
        label="Auto-Umwandlung in Rechnung"
        checked={getValue("auto_convert") === "true"}
        onChange={(checked) =>
          onChange("auto_convert", checked ? "true" : "false")
        }
      />
    </div>
  </div>
);

// Template Settings Placeholder
const TemplateSettings = ({ settings, onChange, getValue }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
      <Icon name="layout" size={20} className="text-blue-400" />
      Template-Einstellungen
    </h3>

    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Icon name="info" size={20} className="text-yellow-400" />
        <div>
          <h4 className="text-yellow-400 font-medium">Template-Editor</h4>
          <p className="text-yellow-300 text-sm mt-1">
            Erweiterte Template-Anpassung wird in der nächsten Version verfügbar
            sein.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Print/PDF Settings
const PrintSettings = ({ settings, onChange, getValue }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
      <Icon name="printer" size={20} className="text-blue-400" />
      Druck- und PDF-Einstellungen
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormSelect
        label="Seitengröße"
        value={getValue("page_size")}
        onChange={(value) => onChange("page_size", value)}
        options={[
          { value: "A4", label: "A4" },
          { value: "A3", label: "A3" },
          { value: "Letter", label: "Letter" },
        ]}
      />

      <FormSelect
        label="Ausrichtung"
        value={getValue("orientation")}
        onChange={(value) => onChange("orientation", value)}
        options={[
          { value: "portrait", label: "Hochformat" },
          { value: "landscape", label: "Querformat" },
        ]}
      />

      <FormInput
        label="Oberer Rand (mm)"
        value={getValue("margin_top")}
        onChange={(value) => onChange("margin_top", value)}
        type="number"
        min="0"
        placeholder="20"
      />

      <FormInput
        label="Unterer Rand (mm)"
        value={getValue("margin_bottom")}
        onChange={(value) => onChange("margin_bottom", value)}
        type="number"
        min="0"
        placeholder="20"
      />

      <FormInput
        label="Linker Rand (mm)"
        value={getValue("margin_left")}
        onChange={(value) => onChange("margin_left", value)}
        type="number"
        min="0"
        placeholder="15"
      />

      <FormInput
        label="Rechter Rand (mm)"
        value={getValue("margin_right")}
        onChange={(value) => onChange("margin_right", value)}
        type="number"
        min="0"
        placeholder="15"
      />
    </div>
  </div>
);

// System Settings
const SystemSettings = ({ settings, onChange, getValue }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
      <Icon name="settings" size={20} className="text-blue-400" />
      System-Einstellungen
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormSelect
        label="Datumsformat"
        value={getValue("date_format")}
        onChange={(value) => onChange("date_format", value)}
        options={[
          { value: "DD.MM.YYYY", label: "31.12.2025 (DD.MM.YYYY)" },
          { value: "MM/DD/YYYY", label: "12/31/2025 (MM/DD/YYYY)" },
          { value: "YYYY-MM-DD", label: "2025-12-31 (YYYY-MM-DD)" },
        ]}
      />

      <FormSelect
        label="Zeitformat"
        value={getValue("time_format")}
        onChange={(value) => onChange("time_format", value)}
        options={[
          { value: "24h", label: "24-Stunden (15:30)" },
          { value: "12h", label: "12-Stunden (3:30 PM)" },
        ]}
      />

      <FormInput
        label="Benachrichtigungs-E-Mail"
        value={getValue("notification_email")}
        onChange={(value) => onChange("notification_email", value)}
        type="email"
        placeholder="admin@mustermann-kfz.de"
      />

      <FormSelect
        label="Zeitzone"
        value={getValue("timezone")}
        onChange={(value) => onChange("timezone", value)}
        options={[
          { value: "Europe/Berlin", label: "Europa/Berlin (MEZ)" },
          { value: "Europe/London", label: "Europa/London (GMT)" },
          { value: "America/New_York", label: "Amerika/New York (EST)" },
        ]}
      />

      <div className="md:col-span-2">
        <FormCheckbox
          label="Automatische Backups aktivieren"
          checked={getValue("backup_enabled") === "true"}
          onChange={(checked) =>
            onChange("backup_enabled", checked ? "true" : "false")
          }
        />
      </div>
    </div>
  </div>
);

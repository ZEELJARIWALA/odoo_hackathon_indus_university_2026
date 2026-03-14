import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Building2,
  MapPin,
  Code,
  Home,
  RefreshCw,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("warehouse");
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Warehouse form state
  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    short_code: "",
    address: ""
  });

  // Location form state
  const [locationForm, setLocationForm] = useState({
    name: "",
    short_code: "",
    warehouse_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch warehouses
      const warehousesRes = await axios.get("http://localhost:5000/api/warehouses");
      setWarehouses(warehousesRes.data || []);

      // Fetch locations
      const locationsRes = await axios.get("http://localhost:5000/api/locations");
      setLocations(locationsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Warehouse handlers
  const handleAddWarehouse = () => {
    setEditingId(null);
    setWarehouseForm({ name: "", short_code: "", address: "" });
    setShowForm(true);
  };

  const handleEditWarehouse = (warehouse) => {
    setEditingId(warehouse.id);
    setWarehouseForm({
      name: warehouse.name,
      short_code: warehouse.short_code,
      address: warehouse.address
    });
    setShowForm(true);
  };

  const handleSaveWarehouse = async () => {
    // Backend operation will be implemented here
    console.log("Saving warehouse:", warehouseForm, editingId);
    setShowForm(false);
    setWarehouseForm({ name: "", short_code: "", address: "" });
  };

  const handleDeleteWarehouse = (id) => {
    // Backend operation will be implemented here
    console.log("Deleting warehouse:", id);
  };

  // Location handlers
  const handleAddLocation = () => {
    setEditingId(null);
    setLocationForm({ name: "", short_code: "", warehouse_id: "" });
    setShowForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingId(location.id);
    setLocationForm({
      name: location.name,
      short_code: location.short_code,
      warehouse_id: location.warehouse_id
    });
    setShowForm(true);
  };

  const handleSaveLocation = async () => {
    // Backend operation will be implemented here
    console.log("Saving location:", locationForm, editingId);
    setShowForm(false);
    setLocationForm({ name: "", short_code: "", warehouse_id: "" });
  };

  const handleDeleteLocation = (id) => {
    // Backend operation will be implemented here
    console.log("Deleting location:", id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setWarehouseForm({ name: "", short_code: "", address: "" });
    setLocationForm({ name: "", short_code: "", warehouse_id: "" });
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : "N/A";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <Settings size={28} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Settings
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
            Warehouse & location management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab("warehouse"); setShowForm(false); }}
          className={`px-6 py-3 rounded-md font-bold text-sm transition-all ${
            activeTab === "warehouse"
              ? "bg-white text-indigo-600 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="inline mr-2" size={18} />
          Warehouse
        </button>
        <button
          onClick={() => { setActiveTab("location"); setShowForm(false); }}
          className={`px-6 py-3 rounded-md font-bold text-sm transition-all ${
            activeTab === "location"
              ? "bg-white text-indigo-600 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="inline mr-2" size={18} />
          Location
        </button>
      </div>

      {/* WAREHOUSE TAB */}
      {activeTab === "warehouse" && (
        <div className="space-y-6">
          {/* Add Warehouse Button */}
          {!showForm && (
            <button
              onClick={handleAddWarehouse}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-md"
            >
              <Plus size={20} />
              Add New Warehouse
            </button>
          )}

          {/* Warehouse Form */}
          {showForm && activeTab === "warehouse" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
              <h3 className="text-xl font-black text-slate-900 uppercase italic mb-6">
                {editingId ? "Edit Warehouse" : "New Warehouse"}
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Main Warehouse"
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g., WH-001"
                    value={warehouseForm.short_code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, short_code: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                  <textarea
                    placeholder="Enter warehouse address..."
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveWarehouse}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold"
                  >
                    <Save size={18} />
                    Save Warehouse
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-bold"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Warehouses List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Warehouses</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                Total: {warehouses.length}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Code</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Address</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center">
                        <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-2" size={32} />
                      </td>
                    </tr>
                  ) : warehouses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <Building2 className="mx-auto mb-2 text-slate-300" size={40} />
                        <p className="font-bold">No warehouses yet</p>
                      </td>
                    </tr>
                  ) : (
                    warehouses.map(warehouse => (
                      <tr key={warehouse.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-900">{warehouse.name}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            {warehouse.short_code}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm text-slate-600">{warehouse.address}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditWarehouse(warehouse)}
                              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteWarehouse(warehouse.id)}
                              className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION TAB */}
      {activeTab === "location" && (
        <div className="space-y-6">
          {/* Add Location Button */}
          {!showForm && (
            <button
              onClick={handleAddLocation}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-md"
            >
              <Plus size={20} />
              Add New Location
            </button>
          )}

          {/* Location Form */}
          {showForm && activeTab === "location" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
              <h3 className="text-xl font-black text-slate-900 uppercase italic mb-6">
                {editingId ? "Edit Location" : "New Location"}
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Storage Room A"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g., LOC-001"
                    value={locationForm.short_code}
                    onChange={(e) => setLocationForm({ ...locationForm, short_code: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Warehouse</label>
                  <select
                    value={locationForm.warehouse_id}
                    onChange={(e) => setLocationForm({ ...locationForm, warehouse_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select a warehouse...</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveLocation}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold"
                  >
                    <Save size={18} />
                    Save Location
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-bold"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Locations List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Locations</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                Total: {locations.length}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Code</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Warehouse</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center">
                        <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-2" size={32} />
                      </td>
                    </tr>
                  ) : locations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <MapPin className="mx-auto mb-2 text-slate-300" size={40} />
                        <p className="font-bold">No locations yet</p>
                      </td>
                    </tr>
                  ) : (
                    locations.map(location => (
                      <tr key={location.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-900">{location.name}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            {location.short_code}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-indigo-600" />
                            <p className="font-medium text-slate-700">{getWarehouseName(location.warehouse_id)}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditLocation(location)}
                              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(location.id)}
                              className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

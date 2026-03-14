import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  Edit2,
  Save,
  X
} from "lucide-react";

const StockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "" });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || "").toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditValues({
      on_hand: product.current_stock || 0,
      free_to_use: product.available_stock || product.current_stock || 0
    });
  };

  const handleSave = (product) => {
    // UPDATE STOCK - Backend operation will be done here
    console.log("Updating product:", product.id, editValues);
    setEditingId(null);
    setEditValues({});
    // In future, call backend API to save changes
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleInputChange = (field, value) => {
    setEditValues({
      ...editValues,
      [field]: value
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <Package size={28} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Stock
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
            Warehouse details & inventory levels
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
        <div className="flex items-center gap-3 mb-6">
          <Filter size={20} className="text-indigo-600" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Search</h3>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Stock Inventory</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
              Displaying {filteredProducts.length} products
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-md"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Per Unit Cost</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">On Hand</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Free to Use</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <RefreshCw className="animate-spin text-indigo-600" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-400 font-bold text-sm">No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      editingId === product.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Package size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.sku || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <p className="font-semibold text-slate-800">₹{product.cost_per_unit || 0}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editValues.on_hand}
                          onChange={(e) => handleInputChange("on_hand", e.target.value)}
                          className="w-16 px-2 py-2 border border-indigo-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                          {product.current_stock || 0}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editValues.free_to_use}
                          onChange={(e) => handleInputChange("free_to_use", e.target.value)}
                          className="w-16 px-2 py-2 border border-indigo-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">
                          {product.available_stock || product.current_stock || 0}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {editingId === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSave(product)}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockPage;

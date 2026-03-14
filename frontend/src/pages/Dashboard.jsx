import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Package, 
  RefreshCw, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertTriangle,
  Clock,
  Filter,
  Search,
  MapPin,
  Tag,
  Layers,
  Activity,
  ArrowRightLeft,
  Settings2,
  TrendingUp,
  Box
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    location: "all",
    category: "all",
    search: ""
  });

  // Dynamic Data Lists
  const docTypes = [
    { id: "receipt", label: "Receipts", icon: <ArrowDownCircle size={14} /> },
    { id: "delivery", label: "Deliveries", icon: <ArrowUpCircle size={14} /> },
    { id: "internal", label: "Internal", icon: <ArrowRightLeft size={14} /> },
    { id: "adjustment", label: "Adjustments", icon: <Settings2 size={14} /> }
  ];

  const statuses = ["Draft", "Waiting", "Ready", "Done", "Canceled"];
  
  // Extracting unique values from real data + fallbacks
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const locations = [...new Set(operations.map(op => op.warehouse).filter(Boolean))];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, moveRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/stock-moves")
      ]);
      setProducts(prodRes.data || []);
      setOperations(moveRes.data || []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOperations = operations.filter(op => {
    const matchesSearch = (op.product_name || "").toLowerCase().includes(filters.search.toLowerCase()) || 
                          (op.tracking_number || "").toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === "all" || op.type === filters.type;
    const matchesStatus = filters.status === "all" || op.status.toLowerCase() === filters.status.toLowerCase();
    const matchesLocation = filters.location === "all" || op.warehouse === filters.location;
    
    const product = products.find(p => p.name === op.product_name);
    const matchesCategory = filters.category === "all" || (product && product.category === filters.category);
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Stock", value: products.length, icon: <Box />, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
          { label: "Pending Ops", value: operations.filter(o => o.status?.toLowerCase() !== "done" && o.status?.toLowerCase() !== "ready").length, icon: <Clock />, color: "bg-gradient-to-br from-amber-500 to-amber-600" },
          { label: "Low Inventory", value: products.filter(p => p.current_stock < 10).length, icon: <AlertTriangle />, color: "bg-gradient-to-br from-rose-500 to-rose-600" },
          { label: "Completion Rate", value: "94%", icon: <TrendingUp />, color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-200 hover:scale-105">
            <div className={`w-12 h-12 ${card.color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-2">{card.label}</p>
            <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 1.5 Receipt & Delivery Operations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receipt Summary */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <ArrowDownCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Receipts</h3>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Incoming Stock</p>
              </div>
            </div>
            <button onClick={() => navigate("/operations/receipt")} className="text-indigo-600 hover:text-indigo-700 font-black text-sm hover:underline">View →</button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">To Receive</p>
              <p className="text-4xl font-black text-green-700">{operations.filter(o => o.type === "receipt" && o.status?.toLowerCase() === "draft").length}</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Late</p>
              <p className="text-4xl font-black text-rose-700">{operations.filter(o => o.type === "receipt" && new Date(o.schedule_date) < new Date()).length}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Total Ops</p>
              <p className="text-4xl font-black text-slate-700">{operations.filter(o => o.type === "receipt").length}</p>
            </div>
          </div>
        </div>

        {/* Delivery Summary */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <ArrowUpCircle size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Delivery</h3>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Outgoing Stock</p>
              </div>
            </div>
            <button onClick={() => navigate("/operations/delivery")} className="text-indigo-600 hover:text-indigo-700 font-black text-sm hover:underline">View →</button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">To Deliver</p>
              <p className="text-4xl font-black text-blue-700">{operations.filter(o => o.type === "delivery" && o.status?.toLowerCase() === "draft").length}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Waiting</p>
              <p className="text-4xl font-black text-amber-700">{operations.filter(o => o.type === "delivery" && o.status?.toLowerCase() === "waiting").length}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Total Ops</p>
              <p className="text-4xl font-black text-slate-700">{operations.filter(o => o.type === "delivery").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Advanced Dynamic Filter Hub */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Filter size={18} />
            </div>
            <h3 className="text-sm font-black uppercase italic tracking-wider text-slate-800">Precision Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search Reference..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
            </div>

            {/* Document Type */}
            <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                    <option value="all">Document Type</option>
                    {docTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
            </div>

            {/* Status */}
            <div className="relative">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="all">Any Status</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Warehouse */}
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                >
                    <option value="all">Warehouse</option>
                    {locations.length > 0 ? locations.map(l => <option key={l} value={l}>{l}</option>) : <option disabled>No locations</option>}
                </select>
            </div>

            {/* Category */}
            <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                    <option value="all">Category</option>
                    {categories.length > 0 ? categories.map(c => <option key={c} value={c}>{c}</option>) : <option disabled>No categories</option>}
                </select>
            </div>
        </div>
      </div>

      {/* 3. Operational Data Flux */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Inventory Flux</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cross-referencing {filteredOperations.length} operational units</p>
              </div>
            </div>
            <button onClick={fetchData} className="p-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-100/50">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
        
        <div className="overflow-x-auto pb-8">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Operation ID</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Resource Name</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location Node</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredOperations.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="py-20 text-center">
                                <AlertTriangle className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No matching operational data found</p>
                            </td>
                        </tr>
                    ) : (
                        filteredOperations.map((op) => {
                            const prod = products.find(p => p.name === op.product_name);
                            return (
                                <tr key={op.id} className="hover:bg-slate-50 transition-all cursor-pointer group">
                                    <td className="px-10 py-8">
                                        <p className="text-xs font-black text-slate-900 tracking-tighter uppercase mb-1">{op.tracking_number}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase italic">{op.date}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs font-bold text-slate-800 mb-1">{op.product_name}</p>
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-500 rounded text-[9px] font-black uppercase italic">
                                            {prod?.category || "Industrial"}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-slate-500 italic text-[10px] font-black uppercase">
                                            <MapPin size={10} className="text-indigo-400" />
                                            {op.warehouse || "Global Hub"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border ${
                                            op.status?.toLowerCase() === "done" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                            op.status?.toLowerCase() === "ready" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                            op.status?.toLowerCase() === "canceled" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            "bg-amber-50 text-amber-600 border-amber-100"
                                        }`}>
                                            {op.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

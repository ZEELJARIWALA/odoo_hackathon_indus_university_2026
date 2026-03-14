import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  History,
  RefreshCw,
  AlertTriangle,
  MapPin,
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat2,
  Search,
  Calendar,
  Clock,
  List,
  LayoutGrid,
  Plus
} from "lucide-react";

const MoveHistoryPage = () => {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // list, kanban
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/stock-moves");
      setMoves(response.data || []);
    } catch (err) {
      console.error("Error fetching stock moves:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMoves = moves.filter(move => {
    const matchesSearch = 
      (move.reference || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (move.contact || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (move.tracking_number || "").toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "all" || move.status?.toLowerCase() === filters.status.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getMoveType = (type) => {
    const lowerType = type?.toLowerCase();
    if (lowerType === "receipt" || lowerType === "in") {
      return { label: "In", icon: ArrowDownCircle, color: "bg-green-50 text-green-700 border-green-200" };
    } else if (lowerType === "delivery" || lowerType === "out") {
      return { label: "Out", icon: ArrowUpCircle, color: "bg-red-50 text-red-700 border-red-200" };
    } else if (lowerType === "adjustment") {
      return { label: "Adjustment", icon: Repeat2, color: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    return { label: "Move", icon: History, color: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  const groupByReference = () => {
    const grouped = {};
    filteredMoves.forEach(move => {
      const ref = move.reference || "N/A";
      if (!grouped[ref]) {
        grouped[ref] = [];
      }
      grouped[ref].push(move);
    });
    return grouped;
  };

  const statuses = ["Draft", "Waiting", "Ready", "Done"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <History size={28} className="text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                Move History
              </h1>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black rounded-lg">NEW</span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
              Track all stock movements & transfers
            </p>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="List View"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "kanban"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Kanban View"
          >
            <LayoutGrid size={20} />
          </button>
          <button className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all ml-2">
            <Plus size={20} />
          </button>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search reference, contact, or tracking..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
              Move History - List View
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
              Showing {filteredMoves.length} movements
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Reference</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">From</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">To</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Quantity</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-2" size={32} />
                      <p className="text-slate-500 font-bold">Loading movements...</p>
                    </td>
                  </tr>
                ) : filteredMoves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
                      <p className="text-slate-400 font-bold text-sm">No stock movements found</p>
                    </td>
                  </tr>
                ) : (
                  filteredMoves.map((move) => {
                    const moveInfo = getMoveType(move.type);
                    const MoveIcon = moveInfo.icon;
                    return (
                      <tr key={move.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-900">{move.reference || move.tracking_number}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm text-slate-700 font-medium">{move.date || "N/A"}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-semibold text-indigo-600">{move.contact || "N/A"}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{move.warehouse_from || move.warehouse || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{move.warehouse_to || move.warehouse || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                            {move.quantity || 0}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center justify-center gap-1 mx-auto w-fit ${moveInfo.color}`}>
                            {move.status}
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
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="space-y-6">
          {statuses.map(status => {
            const statusMoves = filteredMoves.filter(m => m.status?.toLowerCase() === status.toLowerCase());
            return (
              <div key={status} className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{status}</h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                      {statusMoves.length}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {statusMoves.length === 0 ? (
                    <p className="text-slate-500 text-sm italic text-center py-8">No movements in this status</p>
                  ) : (
                    statusMoves.map(move => {
                      const moveInfo = getMoveType(move.type);
                      const MoveIcon = moveInfo.icon;
                      return (
                        <div
                          key={move.id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-slate-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-slate-900">{move.reference || move.tracking_number}</p>
                              <p className="text-xs text-slate-500 font-medium">{move.contact}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-black border ${moveInfo.color}`}>
                              {moveInfo.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-slate-400" />
                              <span className="text-slate-700 font-medium">{move.warehouse_from || move.warehouse || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-slate-700 font-medium">{move.warehouse_to || move.warehouse || "N/A"}</span>
                              <MapPin size={12} className="text-slate-400" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <span className="text-xs text-slate-500">{move.date || "N/A"}</span>
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">
                              {move.quantity || 0} units
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoveHistoryPage;

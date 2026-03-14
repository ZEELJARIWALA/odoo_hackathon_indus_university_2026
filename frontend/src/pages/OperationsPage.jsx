import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    Search, 
    Plus, 
    ArrowDownCircle, 
    ArrowUpCircle, 
    List,
    Grid3x3,
    Calendar,
    Package,
    AlertCircle,
    User
} from "lucide-react";

const OperationsPage = ({ type = "receipt" }) => {
    const navigate = useNavigate();
    const [operations, setOperations] = useState([]);
    const [viewType, setViewType] = useState("list");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOperations();
    }, [type]);

    const fetchOperations = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/stock-moves");
            let data = res.data || [];
            
            // Filter by type (receipt or delivery)
            if (type === "receipt") {
                data = data.filter(op => op.type === "receipt");
            } else if (type === "delivery") {
                data = data.filter(op => op.type === "delivery");
            }
            
            setOperations(data);
        } catch (err) {
            console.error("Error fetching operations:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOps = operations.filter(op => {
        const matchRef = (op.reference || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchContact = (op.contact || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchRef || matchContact;
    });

    const getTypeColor = () => {
        return type === "receipt" ? "text-green-600" : "text-blue-600";
    };

    const getStatusColor = (status) => {
        const lower = status?.toLowerCase();
        switch(lower) {
            case "ready": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "waiting": return "bg-amber-50 text-amber-600 border-amber-100";
            case "draft": return "bg-slate-50 text-slate-600 border-slate-100";
            case "done": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    const groupByStatus = () => {
        const grouped = {};
        filteredOps.forEach(op => {
            const status = op.status || "Draft";
            if (!grouped[status]) grouped[status] = [];
            grouped[status].push(op);
        });
        return grouped;
    };

    const Title = type === "receipt" ? "Receipts" : "Delivery";
    const Icon = type === "receipt" ? ArrowDownCircle : ArrowUpCircle;
    const iconColor = type === "receipt" ? "text-green-600" : "text-blue-600";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Title, NEW button and Search */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${type === "receipt" ? "bg-green-100" : "bg-blue-100"} rounded-2xl flex items-center justify-center`}>
                            <Icon size={32} className={iconColor} />
                        </div>
                        <div>
                            <h1 className={`text-4xl font-black uppercase italic tracking-tighter ${getTypeColor()}`}>{Title}</h1>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">
                                {type === "receipt" ? "Manage incoming stock operations" : "Manage outgoing stock operations"}
                            </p>
                        </div>
                    </div>
                    <button className={`px-6 py-3 ${type === "receipt" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-xl font-black uppercase text-sm flex items-center gap-2 transition-all shadow-lg`}>
                        <Plus size={18} /> NEW
                    </button>
                </div>

                {/* Search and View Toggle */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by reference & contacts..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewType("list")}
                            className={`p-3 rounded-lg transition-all ${viewType === "list" ? "bg-white shadow-md text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewType("kanban")}
                            className={`p-3 rounded-lg transition-all ${viewType === "kanban" ? "bg-white shadow-md text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <Grid3x3 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* LIST VIEW */}
            {viewType === "list" && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest">Reference</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                    {type === "receipt" ? "From" : "From"}
                                </th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                    {type === "receipt" ? "To" : "To"}
                                </th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest">Schedule Date</th>
                                <th className="px-8 py-5 text-center text-[11px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredOps.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">No operations found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOps.map(op => (
                                    <tr 
                                        key={op.id} 
                                        onClick={() => navigate(`/operations/${type}/${op.id}`)}
                                        className="hover:bg-slate-50 transition-all cursor-pointer group border-b border-slate-50 last:border-b-0"
                                    >
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-slate-900">{op.reference}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-700">{op.from_location}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-700">{op.to_location}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <p className="text-sm text-slate-700">{op.contact}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                <p className="text-sm text-slate-700">{new Date(op.schedule_date).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide border ${getStatusColor(op.status)}`}>
                                                {op.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* KANBAN VIEW */}
            {viewType === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(groupByStatus()).map(([status, ops]) => (
                        <div key={status} className="space-y-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-10">
                                <h3 className="font-black text-slate-900 uppercase text-sm">{status}</h3>
                                <p className="text-slate-400 text-xs font-bold">{ops.length} items</p>
                            </div>
                            <div className="space-y-3">
                                {ops.map(op => (
                                    <div
                                        key={op.id}
                                        onClick={() => navigate(`/operations/${type}/${op.id}`)}
                                        className={`p-4 rounded-2xl border ${
                                            type === "receipt"
                                                ? "bg-green-50 border-green-100 hover:border-green-300"
                                                : "bg-blue-50 border-blue-100 hover:border-blue-300"
                                        } cursor-pointer transition-all hover:shadow-md`}
                                    >
                                        <p className="font-black text-slate-900 text-sm mb-2">{op.reference}</p>
                                        <p className="text-xs text-slate-600 mb-3">{op.contact}</p>
                                        <div className="flex items-center justify-between gap-2 text-xs">
                                            <span className="text-slate-500 font-bold">{op.quantity} units</span>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${getStatusColor(op.status)}`}>
                                                {op.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OperationsPage;

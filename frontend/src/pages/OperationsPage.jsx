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
    User,
    X,
    Trash2
} from "lucide-react";

const OperationsPage = ({ type = "receipt" }) => {
    const navigate = useNavigate();
    const [operations, setOperations] = useState([]);
    const [viewType, setViewType] = useState("list");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [receiptItems, setReceiptItems] = useState([{ product_id: '', quantity: '' }]);
    const [receiptData, setReceiptData] = useState({
        reference: '',
        supplier: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchOperations();
        fetchProducts();
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

    const fetchProducts = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/products");
            setProducts(res.data || []);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const handleCreateReceipt = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!receiptData.reference.trim()) {
            setError('Receipt reference is required');
            return;
        }
        if (receiptItems.some(item => !item.product_id || !item.quantity)) {
            setError('All items must have product and quantity');
            return;
        }

        try {
            // Create stock moves for each item
            for (const item of receiptItems) {
                await axios.post('http://localhost:5000/api/stock-moves', {
                    product_id: parseInt(item.product_id),
                    from_location_id: 1, // Supplier location
                    to_location_id: 1, // Warehouse location
                    quantity: parseInt(item.quantity),
                    type: 'receipt',
                    reference: receiptData.reference,
                    supplier: receiptData.supplier,
                    notes: receiptData.notes
                });
            }

            setSuccess('✅ Receipt created successfully! Stock updated.');
            setTimeout(() => {
                setShowCreateModal(false);
                setSuccess('');
                setReceiptData({
                    reference: '',
                    supplier: '',
                    scheduled_date: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                setReceiptItems([{ product_id: '', quantity: '' }]);
                fetchOperations();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create receipt');
        }
    };

    const addReceiptItem = () => {
        setReceiptItems([...receiptItems, { product_id: '', quantity: '' }]);
    };

    const removeReceiptItem = (index) => {
        setReceiptItems(receiptItems.filter((_, i) => i !== index));
    };

    const updateReceiptItem = (index, field, value) => {
        const updated = [...receiptItems];
        updated[index][field] = value;
        setReceiptItems(updated);
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
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className={`px-6 py-3 ${type === "receipt" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-xl font-black uppercase text-sm flex items-center gap-2 transition-all shadow-lg`}>
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

            {/* Create Receipt Modal */}
            {showCreateModal && type === "receipt" && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-800">Create New Receipt</h2>
                            <button 
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReceipt} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Receipt Reference *</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g., RCP-001"
                                        value={receiptData.reference}
                                        onChange={(e) => setReceiptData({...receiptData, reference: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Supplier</label>
                                    <input 
                                        type="text"
                                        placeholder="Supplier name"
                                        value={receiptData.supplier}
                                        onChange={(e) => setReceiptData({...receiptData, supplier: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Scheduled Date</label>
                                <input 
                                    type="date"
                                    value={receiptData.scheduled_date}
                                    onChange={(e) => setReceiptData({...receiptData, scheduled_date: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                                <textarea 
                                    placeholder="Optional notes..."
                                    value={receiptData.notes}
                                    onChange={(e) => setReceiptData({...receiptData, notes: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                    rows="2"
                                />
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold text-slate-700">Receipt Items *</label>
                                    <button 
                                        type="button"
                                        onClick={addReceiptItem}
                                        className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1">
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {receiptItems.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-end p-3 border border-slate-200 rounded-lg bg-slate-50">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Product</label>
                                                <select 
                                                    value={item.product_id}
                                                    onChange={(e) => updateReceiptItem(index, 'product_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm">
                                                    <option value="">Select product...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-24">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                                                <input 
                                                    type="number"
                                                    placeholder="0"
                                                    value={item.quantity}
                                                    onChange={(e) => updateReceiptItem(index, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                                    min="1"
                                                />
                                            </div>

                                            {receiptItems.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => removeReceiptItem(index)}
                                                    className="text-red-500 hover:text-red-700 p-2">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium">
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium">
                                    Create Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationsPage;

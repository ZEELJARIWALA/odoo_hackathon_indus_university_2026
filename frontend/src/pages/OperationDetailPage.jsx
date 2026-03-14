import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    ArrowDownCircle,
    ArrowUpCircle,
    Plus,
    Trash2,
    CheckCircle,
    Printer,
    X,
    Calendar,
    User,
    AlertCircle
} from "lucide-react";

const OperationDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract type from pathname (e.g., /operations/receipt/:id -> receipt)
    const type = location.pathname.split("/")[2];
    
    const [operation, setOperation] = useState(null);
    const [products, setProducts] = useState([]);
    const [userName, setUserName] = useState("");
    const [newProduct, setNewProduct] = useState({ name: "", quantity: "" });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get logged-in user
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserName(userData.name || "Admin User");
            } catch (e) {
                setUserName("Admin User");
            }
        }

        fetchOperation();
    }, [id]);

    const fetchOperation = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/stock-moves");
            const data = res.data || [];
            const op = data.find(o => o.id === parseInt(id));

            if (op) {
                setOperation(op);
                setStatus(op.status);
                // Extract products from operation
                const prod = [
                    {
                        id: op.product_id,
                        name: op.product_name,
                        quantity: op.quantity,
                    }
                ];
                setProducts(prod);
            }
        } catch (err) {
            console.error("Error fetching operation:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        if (newProduct.name && newProduct.quantity) {
            setProducts([
                ...products,
                {
                    id: Math.random(),
                    name: newProduct.name,
                    quantity: parseInt(newProduct.quantity)
                }
            ]);
            setNewProduct({ name: "", quantity: "" });
        }
    };

    const handleRemoveProduct = (productId) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    const handleStatusFlow = () => {
        const statusFlow = ["Draft", "Ready", "Done"];
        const currentIndex = statusFlow.indexOf(status);
        if (currentIndex < statusFlow.length - 1) {
            setStatus(statusFlow[currentIndex + 1]);
        }
    };

    const Icon = type === "receipt" ? ArrowDownCircle : ArrowUpCircle;
    const iconColor = type === "receipt" ? "text-green-600" : "text-blue-600";
    const bgColor = type === "receipt" ? "bg-green-100" : "bg-blue-100";
    const Title = type === "receipt" ? "Receipt" : "Delivery";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Icon size={48} className={`${iconColor} mx-auto mb-4 animate-bounce`} />
                    <p className="text-slate-600 font-black uppercase tracking-widest">Loading...</p>
                </div>
            </div>
        );
    }

    if (!operation) {
        return (
            <div className="text-center py-20">
                <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">Operation not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(`/operations/${type}`)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center`}>
                    <Icon size={32} className={iconColor} />
                </div>
                <div>
                    <h1 className={`text-3xl font-black uppercase italic tracking-tighter ${iconColor}`}>
                        {Title}
                    </h1>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                        {operation.reference}
                    </p>
                </div>
            </div>

            {/* Main Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Operation Details */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">
                            {operation.reference}
                        </h2>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* From Location */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                    {type === "receipt" ? "Receive From" : "From"}
                                </label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800">
                                    {operation.from_location}
                                </div>
                            </div>

                            {/* To Location */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                    To
                                </label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800">
                                    {operation.to_location}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Responsible */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                    Responsible
                                </label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800">
                                    {userName}
                                </div>
                            </div>

                            {/* Schedule Date */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                    Schedule Date
                                </label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    {new Date(operation.schedule_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">
                            Products
                        </h2>

                        {/* Products Table */}
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-center text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-center text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map(prod => (
                                        <tr key={prod.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-4 font-semibold text-slate-800">
                                                {prod.name}
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-700">
                                                {prod.quantity}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleRemoveProduct(prod.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add New Product */}
                        <div className="border-t border-slate-200 pt-6">
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">
                                Add New Product
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={newProduct.quantity}
                                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Actions */}
                <div className="space-y-4">
                    {/* Status Cards */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">
                            Status Flow
                        </p>
                        <div className="flex items-center gap-2 text-center text-[10px] font-black uppercase tracking-widest mb-6">
                            <div className={`flex-1 px-3 py-2 rounded-lg ${status === "Draft" ? "bg-slate-100 text-slate-900" : "bg-slate-50 text-slate-500"}`}>
                                Draft
                            </div>
                            <span className="text-slate-300">›</span>
                            <div className={`flex-1 px-3 py-2 rounded-lg ${status === "Ready" || status === "Done" ? "bg-indigo-100 text-indigo-900" : "bg-slate-50 text-slate-500"}`}>
                                Ready
                            </div>
                            <span className="text-slate-300">›</span>
                            <div className={`flex-1 px-3 py-2 rounded-lg ${status === "Done" ? "bg-emerald-100 text-emerald-900" : "bg-slate-50 text-slate-500"}`}>
                                Done
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-2xl border border-indigo-200 mb-6">
                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2">
                                Current Status
                            </p>
                            <p className="text-2xl font-black text-indigo-900 uppercase italic">
                                {status}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleStatusFlow}
                            disabled={status === "Done"}
                            className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} /> Validate
                        </button>

                        <button className="w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                            <Printer size={18} /> Print
                        </button>

                        <button
                            onClick={() => navigate(`/operations/${type}`)}
                            className="w-full px-6 py-4 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationDetailPage;

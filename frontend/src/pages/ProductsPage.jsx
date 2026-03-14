import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, PlusCircle, AlertTriangle, MoreVertical, X } from 'lucide-react';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Raw Materials',
        uom: 'Unit',
        initial_stock: '0',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch products", err);
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.name.trim()) {
            setError('Product name is required');
            return;
        }
        if (!formData.sku.trim()) {
            setError('SKU is required');
            return;
        }
        if (parseInt(formData.initial_stock) < 0) {
            setError('Initial stock cannot be negative');
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/products', {
                name: formData.name,
                sku: formData.sku,
                category: formData.category,
                uom: formData.uom,
                current_stock: parseInt(formData.initial_stock),
                min_stock_level: 10,
                description: formData.description
            });

            setSuccess('✅ Product created successfully!');
            setFormData({
                name: '',
                sku: '',
                category: 'Raw Materials',
                uom: 'Unit',
                initial_stock: '0',
                description: ''
            });

            // Refresh products list
            fetchProducts();

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowCreateModal(false);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create product');
        }
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        
        let matchesStock = true;
        if (stockFilter === 'Low Stock') matchesStock = (p.current_stock || 0) < (p.min_stock_level || 10);
        if (stockFilter === 'Out of Stock') matchesStock = (p.current_stock || 0) <= 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products Inventories</h1>
                        <p className="text-slate-500 text-sm italic">Manage and track all inventory items.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 bg-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md">
                    <PlusCircle size={20} />
                    <span>Create Product</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Type to Search (e.g., SKU, Name)..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:italic text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-3">
                        <select 
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Category</option>
                            <option value="Raw Materials">Raw Materials</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Consumer Goods">Consumer Goods</option>
                        </select>
                        <select 
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                        >
                            <option value="All">Stock Filter: All</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 italic">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">UoM</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{product.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.sku}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">{product.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{product.uom}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-bold ${(product.current_stock || 0) < (product.min_stock_level || 10) ? 'text-red-500' : 'text-slate-800'}`}>
                                                {product.current_stock || 0}
                                            </span>
                                            {(product.current_stock || 0) < (product.min_stock_level || 10) && (
                                                <AlertTriangle size={14} className="text-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No products found. Start by creating one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500 italic">
                  Showing {filteredProducts.length} products total
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded cursor-not-allowed">Previous</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded cursor-not-allowed">Next</button>
                  </div>
                </div>
            </div>

            {/* Create Product Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Create New Product</h2>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
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

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name *</label>
                                <input 
                                    type="text"
                                    placeholder="e.g., Steel Rods"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">SKU / Code *</label>
                                <input 
                                    type="text"
                                    placeholder="e.g., SR-001"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                        <option value="Raw Materials">Raw Materials</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Consumer Goods">Consumer Goods</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">UoM</label>
                                    <select 
                                        value={formData.uom}
                                        onChange={(e) => setFormData({...formData, uom: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                        <option value="Unit">Unit</option>
                                        <option value="kg">kg</option>
                                        <option value="liter">Liter</option>
                                        <option value="box">Box</option>
                                        <option value="meter">Meter</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Stock</label>
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={formData.initial_stock}
                                    onChange={(e) => setFormData({...formData, initial_stock: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea 
                                    placeholder="Optional description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    rows="3"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium">
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                                    Create Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;

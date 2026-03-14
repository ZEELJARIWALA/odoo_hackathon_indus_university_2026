import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, PlusCircle, AlertTriangle, MoreVertical } from 'lucide-react';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');

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
                <button className="flex items-center space-x-2 bg-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md">
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
        </div>
    );
};

export default ProductsPage;

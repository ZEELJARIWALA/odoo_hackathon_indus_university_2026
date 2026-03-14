import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Filter, TrendingUp, TrendingDown, ArrowRightLeft, Wrench, AlertCircle } from 'lucide-react';

const MoveHistoryPage = () => {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/stock-ledger');
            setLedger(res.data || []);
        } catch (err) {
            console.error('Error fetching ledger:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMovementIcon = (type) => {
        switch(type) {
            case 'receipt': return <TrendingUp size={16} className="text-green-500" />;
            case 'delivery': return <TrendingDown size={16} className="text-red-500" />;
            case 'transfer': return <ArrowRightLeft size={16} className="text-blue-500" />;
            case 'adjustment': return <Wrench size={16} className="text-amber-500" />;
            default: return <AlertCircle size={16} className="text-slate-500" />;
        }
    };

    const getMovementColor = (type) => {
        switch(type) {
            case 'receipt': return 'bg-green-50 border-green-200';
            case 'delivery': return 'bg-red-50 border-red-200';
            case 'transfer': return 'bg-blue-50 border-blue-200';
            case 'adjustment': return 'bg-amber-50 border-amber-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    const getMovementLabel = (type) => {
        switch(type) {
            case 'receipt': return 'Receipt (Incoming)';
            case 'delivery': return 'Delivery (Outgoing)';
            case 'transfer': return 'Transfer (Internal)';
            case 'adjustment': return 'Adjustment (Count)';
            default: return 'Unknown';
        }
    };

    const formatQuantity = (qty) => {
        if (qty > 0) return `+${qty}`;
        return String(qty);
    };

    const getQuantityColor = (qty) => {
        if (qty > 0) return 'text-green-600';
        if (qty < 0) return 'text-red-600';
        return 'text-slate-600';
    };

    // Filter ledger
    const filteredLedger = ledger.filter(entry => {
        const matchesSearch = 
            (entry.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === 'all' || entry.movement_type === typeFilter;
        
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Stock Ledger</h1>
                        <p className="text-slate-500 text-sm italic">Complete audit trail of all inventory movements</p>
                    </div>
                </div>
                <button 
                    onClick={fetchLedger}
                    className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold transition-all">
                    <Filter size={18} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product, reference, or reason..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select 
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="receipt">Receipts (Incoming)</option>
                        <option value="delivery">Deliveries (Outgoing)</option>
                        <option value="transfer">Transfers (Internal)</option>
                        <option value="adjustment">Adjustments (Count)</option>
                    </select>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty Change</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">From → To</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                                        Loading ledger...
                                    </td>
                                </tr>
                            ) : filteredLedger.length > 0 ? filteredLedger.map((entry) => (
                                <tr key={entry.id} className={`border border-slate-200 hover:bg-slate-50 transition-colors ${getMovementColor(entry.movement_type)}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {getMovementIcon(entry.movement_type)}
                                            <span className="font-semibold text-slate-800 text-xs">{getMovementLabel(entry.movement_type)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm">{entry.product_name}</div>
                                            <div className="text-xs text-slate-500">{entry.sku}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded inline-block">
                                            {entry.reference}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-bold text-lg ${getQuantityColor(entry.quantity_change)}`}>
                                            {formatQuantity(entry.quantity_change)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            {entry.from_location && (
                                                <>
                                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs">{entry.from_location}</span>
                                                    <ArrowRightLeft size={14} className="text-slate-400" />
                                                </>
                                            )}
                                            {entry.to_location && (
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs">{entry.to_location}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={entry.reason}>
                                        {entry.reason || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="text-slate-700 font-medium">
                                            {entry.created_by_user || 'System'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                                        {new Date(entry.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                                        No stock movements found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Stats */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 text-sm text-slate-600 italic">
                    <span>Total Movements: {filteredLedger.length}</span>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Receipts: {filteredLedger.filter(e => e.movement_type === 'receipt').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Deliveries: {filteredLedger.filter(e => e.movement_type === 'delivery').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>Transfers: {filteredLedger.filter(e => e.movement_type === 'transfer').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span>Adjustments: {filteredLedger.filter(e => e.movement_type === 'adjustment').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} /> Movement Types Explained
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="flex items-center gap-2 font-semibold text-green-700 mb-1">
                            <TrendingUp size={14} /> Receipt
                        </div>
                        <p className="text-slate-600">Incoming goods from supplier. Stock +X</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 font-semibold text-red-700 mb-1">
                            <TrendingDown size={14} /> Delivery
                        </div>
                        <p className="text-slate-600">Outgoing goods to customer. Stock -X</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 font-semibold text-blue-700 mb-1">
                            <ArrowRightLeft size={14} /> Transfer
                        </div>
                        <p className="text-slate-600">Move between locations. Total stock unchanged</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 font-semibold text-amber-700 mb-1">
                            <Wrench size={14} /> Adjustment
                        </div>
                        <p className="text-slate-600">Fix physical count vs system</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoveHistoryPage;

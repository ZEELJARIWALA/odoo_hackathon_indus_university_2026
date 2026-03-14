import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const headers = { Authorization: `Bearer ${token}` };

      const [kpisRes, productsRes, transactionsRes, lowStockRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/kpis`, { headers }),
        axios.get(`${API_URL}/api/products`, { headers }),
        axios.get(`${API_URL}/api/dashboard/transactions`, { headers }),
        axios.get(`${API_URL}/api/dashboard/low-stock`, { headers })
      ]);

      setKpis(kpisRes.data);
      setProducts(productsRes.data);
      setTransactions(transactionsRes.data);
      setLowStockProducts(lowStockRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (!kpis) {
    return <div className="dashboard-loading">Could not load dashboard data</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📦 CoreInventory Dashboard</h1>
          <p>Welcome, {user?.name || 'User'}!</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      {/* KPI Cards */}
      <section className="kpi-section">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">📊</div>
            <div className="kpi-info">
              <p className="kpi-label">Total Stock Value</p>
              <p className="kpi-value">${(kpis.totalStockValue / 1000).toFixed(1)}K</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-info">
              <p className="kpi-label">Total Items</p>
              <p className="kpi-value">{kpis.totalItems.toLocaleString()}</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-info">
              <p className="kpi-label">Low Stock Products</p>
              <p className="kpi-value alert">{kpis.lowStockProducts}</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🚫</div>
            <div className="kpi-info">
              <p className="kpi-label">Out of Stock</p>
              <p className="kpi-value critical">{kpis.outOfStockProducts}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <section className="alert-section">
          <h2>🔴 Smart Advisor - Stock Alerts</h2>
          <div className="low-stock-list">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className={`alert-item ${product.risk}`}>
                <div className="alert-product">
                  <h3>{product.name}</h3>
                  <p>SKU: {product.sku}</p>
                </div>
                <div className="alert-details">
                  <span className="current-stock">Current: {product.quantity} units</span>
                  <span className="risk-level">{product.risk}</span>
                </div>
                <div className="recommendation">
                  <strong>Recommendation:</strong> Order {product.recommendedOrder} units now!
                  <br />
                  <small>Will stockout in ~{product.daysUntilStockout} days</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products Table */}
      <section className="products-section">
        <h2>📋 All Products ({products.length})</h2>
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Current Qty</th>
                <th>Reorder Point</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={product.quantity === 0 ? 'out-of-stock' : product.quantity < product.reorder_point ? 'low-stock' : ''}>
                  <td className="product-name">{product.name}</td>
                  <td>{product.sku}</td>
                  <td className="text-right">{product.quantity}</td>
                  <td className="text-right">{product.reorder_point}</td>
                  <td>
                    {product.quantity === 0 ? (
                      <span className="badge critical">Out of Stock</span>
                    ) : product.quantity < product.reorder_point ? (
                      <span className="badge alert">Low Stock</span>
                    ) : (
                      <span className="badge success">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="transactions-section">
        <h2>📈 Recent Transactions</h2>
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className={`transaction-item ${tx.type}`}>
              <div className="tx-icon">
                {tx.type === 'receipt' ? '📥' : tx.type === 'delivery' ? '📤' : '⚙️'}
              </div>
              <div className="tx-details">
                <p className="tx-product">{tx.product}</p>
                <p className="tx-type">{tx.type.toUpperCase()}</p>
              </div>
              <div className="tx-quantity">
                {tx.type === 'delivery' && tx.quantity < 0 ? (
                  <span className="negative">-{Math.abs(tx.quantity)}</span>
                ) : (
                  <span className={tx.quantity > 0 ? 'positive' : ''}>{tx.quantity > 0 ? '+' : ''}{tx.quantity}</span>
                )}
              </div>
              <div className="tx-date">{tx.date}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

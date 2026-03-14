const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(cors());
app.use(express.json());

// ============ MOCK DATABASE ============
// In-memory users for this sprint (will use real DB later)
let users = [
  {
    id: 1,
    email: 'admin@coreinventory.com',
    name: 'Admin User',
    password: bcrypt.hashSync('admin123', 10)
  }
];

let products = [
  { id: 1, name: 'Widget A', sku: 'SKU-001', quantity: 500, reorder_point: 100 },
  { id: 2, name: 'Widget B', sku: 'SKU-002', quantity: 150, reorder_point: 50 },
  { id: 3, name: 'Gadget C', sku: 'SKU-003', quantity: 30, reorder_point: 75 },
  { id: 4, name: 'Device D', sku: 'SKU-004', quantity: 0, reorder_point: 100 }
];

let transactions = [
  { id: 1, type: 'receipt', product: 'Widget A', quantity: 100, date: '2026-03-14' },
  { id: 2, type: 'delivery', product: 'Widget B', quantity: 50, date: '2026-03-13' },
  { id: 3, type: 'adjustment', product: 'Gadget C', quantity: -10, date: '2026-03-12' }
];

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '✅ CoreInventory API is running' });
});

// ============ AUTH ENDPOINTS ============

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      name,
      password: bcrypt.hashSync(password, 10)
    };

    users.push(newUser);

    res.status(201).json({
      message: '✅ User registered successfully',
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your_secret_key_change_in_production',
      { expiresIn: '24h' }
    );

    res.json({
      message: '✅ Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DASHBOARD ENDPOINTS ============

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get dashboard KPIs
app.get('/api/dashboard/kpis', verifyToken, (req, res) => {
  try {
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockProducts = products.filter(p => p.quantity < p.reorder_point);
    const outOfStock = products.filter(p => p.quantity === 0);

    res.json({
      totalStockValue: totalQuantity * 50, // Assume $50 per unit
      totalItems: totalQuantity,
      productsInStock: products.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStock.length,
      pendingReceipts: 3,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
app.get('/api/products', verifyToken, (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent transactions
app.get('/api/dashboard/transactions', verifyToken, (req, res) => {
  try {
    res.json(transactions.slice(-10).reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products (Smart Advisor preview)
app.get('/api/dashboard/low-stock', verifyToken, (req, res) => {
  try {
    const lowStockProducts = products
      .filter(p => p.quantity < p.reorder_point)
      .map(p => ({
        ...p,
        daysUntilStockout: Math.ceil(p.quantity / (Math.random() * 5 + 1)),
        recommendedOrder: p.reorder_point * 2 - p.quantity,
        risk: p.quantity === 0 ? 'CRITICAL' : 'HIGH'
      }));

    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════');
  console.log('✅ CoreInventory API is running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔌 Health Check: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════\n');
  console.log('📝 Test Account:');
  console.log('   Email: admin@coreinventory.com');
  console.log('   Password: admin123\n');
});

module.exports = app;

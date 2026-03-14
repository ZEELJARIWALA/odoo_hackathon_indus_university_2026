# 🏭 CoreInventory - Inventory Management System

**Hackathon:** Odoo Hackathon - Indus University 2026  
**Team:** ZEEL JARIWALA  
**Duration:** 4 Weeks (March 10 - April 7, 2026)  
**Current Status:** MVP Development Phase

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution & Unique Features](#solution--unique-features)
4. [MVP Architecture](#mvp-architecture)
5. [Development Timeline](#development-timeline)
6. [Tech Stack](#tech-stack)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Contributing](#contributing)

---

## 🎯 Project Overview

**CoreInventory** is a modular, scalable Inventory Management System (IMS) that digitizes and streamlines all stock-related operations within a business. It replaces manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time, easy-to-use application.

### **Key Statistics**
- **Target Users:** Inventory Managers, Warehouse Staff
- **Scalability:** 1 → 100+ warehouses, 10k+ products
- **Response Time:** < 500ms
- **Data Accuracy:** 100% ledger-based audit trail

---

## 📍 Problem Statement

### **Business Pain Points**
- ❌ Fragmented inventory tracking across multiple systems
- ❌ Manual registers and spreadsheets prone to errors
- ❌ No real-time visibility into stock levels
- ❌ Stockouts surprise the business
- ❌ Overstocking wastes capital
- ❌ Poor decision-making due to incomplete data

### **Current State**
```
Traditional Methods (BROKEN):
├── Manual Excel sheets → Outdated data
├── Scattered tracking → No visibility
├── Error-prone → Costly mistakes
├── Reactive management → Missed opportunities
└── No audit trail → Compliance issues
```

---

## ✨ Solution & Unique Features

### **Core Features (Standard)**
1. ✅ **Authentication** - Sign up, login, OTP reset
2. ✅ **Dashboard** - Real-time KPIs and snapshots
3. ✅ **Product Management** - Create/update products with SKU, category, UOM
4. ✅ **Receipt Operations** - Incoming stock management
5. ✅ **Delivery Operations** - Outgoing stock management
6. ✅ **Stock Adjustments** - Physical count reconciliation
7. ✅ **Multi-Warehouse Support** - Multiple locations
8. ✅ **Stock Ledger** - Complete audit trail
9. ✅ **Move History** - In/out tracking
10. ✅ **Role-Based Access** - Manager/Staff permissions

### **🌟 UNIQUE FEATURE: Smart Inventory Advisor**

**What Makes Us Different:**

| Competitor | CoreInventory |
|---|---|
| ❌ "Your stock is low" | ✅ "Order 300 units NOW - Will stockout in 12 days" |
| ❌ Manual reorder decisions | ✅ AI suggests optimal order quantity |
| ❌ Reactive alerts | ✅ Predictive insights |
| ❌ No waste detection | ✅ Identifies slow-moving inventory |
| ❌ Reactive management | ✅ Proactive optimization |

### **Smart Advisor Capabilities**

#### 1️⃣ **Predictive Stockout Alerts**
```
⚠️ CRITICAL: Steel Rods
├─ Current Stock: 180 units
├─ Daily Consumption: 15 units
├─ Stockout Prediction: 12 days (March 26)
├─ Lead Time: 5 days
└─ Recommended Order: 300 units (TODAY)
```

#### 2️⃣ **Consumption Analytics**
```
For each product:
├─ Daily/Weekly/Monthly consumption rate
├─ Trend analysis (↑ increasing, ↓ decreasing, → stable)
├─ Reorder frequency
├─ Seasonal patterns
└─ Optimal safety stock level
```

#### 3️⃣ **Waste Detection**
```
💡 Optimization Alerts:
├─ Metal Brackets: Zero movement for 45 days
├─ Current Stock: 500 units
├─ Cost Impact: $2,500 idle inventory
└─ Action: Liquidate or return to vendor
```

#### 4️⃣ **Inventory Health Score**
```
Dashboard Metric:
├─ Inventory Turnover Rate
├─ Carrying Cost Analysis
├─ Stock-out Risk Score
└─ Overall Health: 87/100 (Excellent)
```

---

## 🏗️ MVP Architecture

### **System Design**

```
┌─────────────────────────────────────────────┐
│             Frontend (React/Vue)             │
├─────────────────┬──────────────┬────────────┤
│   Auth Screen   │  Dashboard   │ Operations │
│                 │     KPIs     │  Receipt   │
│   Products      │  Analytics   │  Delivery  │
│   Stock Mgmt    │  Smart      │ Adjustment│
│                 │  Advisor ⭐  │ Ledger    │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│        Backend API (Node.js/Express)        │
├──────────────┬──────────────┬──────────────┤
│   Auth API   │ Operations   │  Analytics   │
│   User Mgmt  │   Receipts   │  Forecasting│
│   Permission │   Deliveries │  Trends ⭐  │
│              │  Adjustments │ Predictions │
└──────────────────┬──────────────┬──────────┘
                   │              │
       ┌───────────┘              └──────────┐
       │                                     │
┌──────▼──────────┐              ┌──────────▼─┐
│  PostgreSQL DB  │              │ Cache Layer│
│  ├─ Users       │              │(Redis/RAM) │
│  ├─ Products    │              │ Analytics  │
│  ├─ Ledger      │              │ results    │
│  ├─ Warehouse   │              └────────────┘
│  └─ Analytics   │
└─────────────────┘
```

### **Database Schema**

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  login_id VARCHAR(12) UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role ENUM('manager', 'staff'),
  warehouse_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  category VARCHAR,
  unit_of_measure VARCHAR,
  current_stock INT DEFAULT 0,
  reorder_level INT,
  warehouse_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX(sku, warehouse_id)
);

-- Stock Ledger (Immutable Audit Trail)
CREATE TABLE stock_ledger (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  transaction_type ENUM('receipt', 'delivery', 'adjustment', 'transfer'),
  quantity INT NOT NULL,
  from_location VARCHAR,
  to_location VARCHAR,
  reference_no VARCHAR,
  timestamp TIMESTAMP NOT NULL,
  created_by UUID,
  reason TEXT,
  warehouse_id UUID,
  INDEX(product_id, timestamp)
);

-- Warehouse/Locations
CREATE TABLE warehouses (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  location VARCHAR,
  capacity INT,
  created_at TIMESTAMP
);

-- Analytics Cache (Smart Advisor)
CREATE TABLE product_analytics (
  id UUID PRIMARY KEY,
  product_id UUID UNIQUE NOT NULL,
  daily_consumption FLOAT,
  weekly_trend FLOAT,
  stockout_date DATE,
  suggested_reorder_qty INT,
  safety_stock INT,
  waste_flag BOOLEAN,
  last_updated TIMESTAMP
);
```

---

## 📅 Development Timeline (4 Weeks)

### **Week 1: Foundation**
- [ ] Day 1: Setup, DB design, project structure
- [ ] Day 2: Authentication API (Login/SignUp/OTP)
- [ ] Day 3: Dashboard KPI endpoints
- [ ] Day 4: Product CRUD operations
- [ ] Day 5: Frontend Auth + Dashboard UI

### **Week 2: Core Operations**
- [ ] Day 6-7: Receipt operations (API + UI)
- [ ] Day 8-9: Delivery operations (API + UI)
- [ ] Day 10: Stock management endpoints

### **Week 3: Advanced Features**
- [ ] Day 11: Stock ledger & history
- [ ] Day 12: Analytics engine (Smart Advisor)
- [ ] Day 13: Predictive algorithms
- [ ] Day 14: Multi-location support

### **Week 4: Polish & Launch**
- [ ] Day 15-16: Performance optimization
- [ ] Day 17: Security audit
- [ ] Day 18: Load testing (10k+ products)
- [ ] Day 19: UI/UX refinement
- [ ] Day 20: Full system test + deployment

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 / Vue 3
- **State Management:** Redux / Vuex
- **UI Components:** Material-UI / Tailwind CSS
- **Charts:** Chart.js / D3.js
- **HTTP Client:** Axios

### **Backend**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Cache:** Redis (for analytics)
- **Authentication:** JWT + bcrypt
- **Validation:** Joi / Yup

### **DevOps & Deployment**
- **Version Control:** Git + GitHub
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Cloud:** AWS / GCP / Azure
- **Monitoring:** Winston (logging)

### **Testing**
- **Unit Tests:** Jest
- **API Tests:** Postman / Insomnia
- **Load Testing:** Apache JMeter

---

## 📁 Project Structure

```
CoreInventory/
├── 📂 backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── receipts.js
│   │   │   ├── deliveries.js
│   │   │   ├── stock.js
│   │   │   └── analytics.js
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── utils/
│   │   │   └── analytics.js (Smart Advisor Engine)
│   │   └── app.js
│   ├── config/
│   │   └── database.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── 📂 frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Operations/
│   │   │   ├── Products/
│   │   │   └── Analytics/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   └── App.jsx
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── 📂 database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── 📂 docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── USER_MANUAL.md
│
├── 📂 .github/
│   ├── workflows/
│   │   └── ci-cd.yml
│   └── ISSUE_TEMPLATE.md
│
├── .gitignore
├── docker-compose.yml
├── README.md (this file)
└── WORKFLOW.md (detailed dev workflow)
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js v18+
- PostgreSQL 14+
- Git
- npm or yarn

### **Setup Instructions**

#### **1. Clone Repository**
```bash
git clone https://github.com/ZEELJARIWALA/odoo_hackathon_indus_university_2026.git
cd CoreInventory
```

#### **2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

#### **3. Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

#### **4. Initialize Database**
```bash
# Run migrations
psql -U postgres -d coreinventory -f database/schema.sql
psql -U postgres -d coreinventory -f database/seed.sql
```

#### **5. Access Application**
```
Frontend: http://localhost:3000
Backend API: http://localhost:5000
API Docs: http://localhost:5000/api-docs
```

---

## 📊 MVP Scope

### **In Scope ✅**
- Authentication (Login/SignUp/OTP)
- Dashboard with KPIs
- Product management (CRUD)
- Receipt operations
- Delivery operations
- Stock adjustments
- Stock ledger & history
- Single warehouse (expandable)
- Smart Inventory Advisor ⭐
- Role-based access (2 roles)

### **Out of Scope ❌ (Future Releases)**
- Multi-currency support
- Advanced reporting (PDF exports)
- Barcode scanning integration
- API for 3PL providers
- Mobile app
- Advanced predictive ML models
- Blockchain audit trail

---

## 🎯 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 500ms | - |
| Product load time | < 2s | - |
| Dashboard refresh | Real-time | - |
| Data accuracy | 100% | - |
| Load capacity | 10k+ products | - |
| User satisfaction | 4.5/5 | - |

---

## 🔐 Security Considerations

- ✅ Password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ SQL injection prevention
- ✅ Role-based access control (RBAC)
- ✅ Immutable audit trail (ledger)
- ✅ Environment variables for secrets
- ✅ HTTPS only in production
- ✅ Input validation on all endpoints

---

## 📝 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/otp-request
POST /api/auth/otp-verify
POST /api/auth/reset-password
```

### **Product Endpoints**
```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### **Operations Endpoints**
```
POST   /api/receipts
GET    /api/receipts
PUT    /api/receipts/:id/validate

POST   /api/deliveries
GET    /api/deliveries
PUT    /api/deliveries/:id/validate

POST   /api/adjustments
GET    /api/stock
```

### **Analytics Endpoints (Smart Advisor) ⭐**
```
GET    /api/analytics/low-stock
GET    /api/analytics/forecast
GET    /api/analytics/waste-detection
GET    /api/analytics/consumption-trends
GET    /api/analytics/health-score
```

---

## 🤝 Contributing

### **Workflow**
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/feature-name`
5. Create Pull Request

### **Commit Convention**
```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style change
refactor: Code refactoring
test: Test additions
chore: Dev dependency update
```

---

## 📞 Contact & Support

- **GitHub:** https://github.com/ZEELJARIWALA/odoo_hackathon_indus_university_2026
- **Issues:** Use GitHub Issues for bug reports
- **Discussions:** Use GitHub Discussions for feature requests

---

## 📄 License

This project is created for Odoo Hackathon 2026.

---

## 🎯 Next Steps

1. ✅ Initialize git repository
2. ✅ Create project structure
3. ⏳ Setup backend server
4. ⏳ Create database schema
5. ⏳ Build API endpoints
6. ⏳ Develop frontend UI
7. ⏳ Implement Smart Advisor
8. ⏳ Integration testing
9. ⏳ Deployment

---

**Last Updated:** March 14, 2026  
**Status:** 🚀 MVP Development in Progress

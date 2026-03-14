# CoreInventory - Inventory Management System

**Hackathon:** Odoo Hackathon - Indus University 2026  
**Team:** ZEEL JARIWALA  
**Duration:** 4 Weeks (March 10 - April 7, 2026)  
**Current Status:** MVP Development Phase  
**Technology Stack:** Python (Flask) + React + MySQL (XAMPP)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution & Unique Features](#solution--unique-features)
4. [Technology Stack](#technology-stack)
5. [Project Architecture](#project-architecture)
6. [Development Timeline](#development-timeline)
7. [Project Structure](#project-structure)
8. [Setup Instructions](#setup-instructions)
9. [API Documentation](#api-documentation)
10. [Contributing](#contributing)

---

## Project Overview

CoreInventory is a modular, scalable Inventory Management System (IMS) that digitizes and streamlines all stock-related operations within a business. It replaces manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time application.

### Key Statistics

- **Target Users:** Inventory Managers, Warehouse Staff, Business Owners
- **Scalability:** 1 to 100+ warehouses, 10,000+ products capacity
- **Response Time Target:** < 500ms per API call
- **Data Accuracy:** 100% audit trail with immutable ledger

---

## Problem Statement

### Business Pain Points

1. **Fragmented Inventory Tracking**
   - Multiple systems and spreadsheets
   - No single source of truth
   - Data inconsistency across teams

2. **Manual and Error-Prone Processes**
   - Paper-based registers
   - Excel sheet chaos
   - High mistake rates leading to financial loss

3. **Lack of Real-Time Visibility**
   - Management cannot see current stock levels instantly
   - No ability to respond to supply chain issues
   - Poor forecasting and planning

4. **Unplanned Stockouts**
   - Customer orders cannot be fulfilled
   - Lost revenue and customer trust
   - No predictive warning system

5. **Overstocking Problems**
   - Excess inventory ties up capital
   - Waste and spoilage of products
   - Poor inventory-to-sales ratio

6. **Inefficient Decision Making**
   - Lack of data-driven insights
   - No historical analysis or trends
   - Manual calculations prevent strategic planning

### Current State vs Desired State

**Current (Manual):**
```
Paper Registers -> Spreadsheets -> Phone Calls -> Guesswork -> Errors
```

**Desired (CoreInventory):**
```
Real-Time Dashboard -> Data Analytics -> Smart Predictions -> Automated Alerts -> Accuracy
```

---

## Solution & Unique Features

### Core Solution

CoreInventory provides:

- Central dashboard with real-time inventory metrics
- Automated receipt, delivery, and stock adjustment workflows
- Complete audit trail of all inventory movements
- Role-based access control (Admin, Manager, Staff)
- Mobile-responsive interface for warehouse operations

### Unique Differentiator: Smart Inventory Advisor

**What Competitors Do:** Show "Stock is low"  
**What CoreInventory Does:** Predict and recommend

The Smart Advisor uses historical consumption data to:

**1. Predict Stockout Dates**
- Analyzes daily consumption rate
- Factors in lead time from suppliers
- Warns 14 days before stockout
- Example: "Widget A will run out on March 26, 2026"

**2. Recommend Optimal Order Quantities**
- Calculates based on consumption trends
- Considers reorder point and lead time
- Minimizes overstocking
- Example: "Order 150 units now to maintain 30-day buffer"

**3. Detect Waste and Dead Stock**
- Identifies products with zero movement for 30+ days
- Calculates potential capital loss
- Suggests write-off candidates
- Example: "Device X hasn't moved in 45 days - $5,000 waste potential"

**4. Consumption Trend Analysis**
- Identifies increasing or decreasing consumption patterns
- Helps seasonal planning
- Enables data-driven forecasting
- Example: "Gadget B consumption increasing 5% weekly"

### MVP Scope

**Phase 1 (Week 1-2):**
- User authentication (Register, Login, Password reset)
- Dashboard with real-time KPIs
- Product management (List, Add, Edit, Delete)
- Receipt and Delivery operations
- Stock adjustment for physical counts

**Phase 2 (Week 3):**
- Smart Advisor analytics engine
- Stockout prediction algorithm
- Waste detection system
- Consumption trend analysis
- Advanced reporting

**Phase 3 (Week 4):**
- Performance optimization
- Load testing (10k+ products)
- Mobile responsiveness refinement
- Deployment and final testing

---

## Technology Stack

### Backend
- **Framework:** Python Flask 2.3.2
- **Language:** Python 3.8+
- **Database:** MySQL 5.7+ (via XAMPP)
- **ORM:** SQLAlchemy (for database operations)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** Werkzeug
- **Database Client:** PyMySQL / MySQL-Connector

### Frontend
- **Framework:** React.js 18.2.0
- **Styling:** CSS3 + Bootstrap 5
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Build Tool:** Create React App
- **Routing:** React Router v6

### Development Tools
- **Version Control:** Git/GitHub
- **Package Management:** pip (Python), npm (Node.js)
- **Database GUI:** phpMyAdmin (via XAMPP)
- **API Testing:** Postman
- **IDE:** Visual Studio Code

### Infrastructure
- **Local Dev:** XAMPP (Apache + MySQL + PHP)
- **Backend Server:** Flask development server (port 5000)
- **Frontend Server:** React dev server (port 3000)
- **Database:** MySQL running via XAMPP

---

## Project Architecture

### System Architecture Diagram

```
Frontend (React - Port 3000)
    |
    | HTTP/REST API (JSON)
    |
Backend (Python Flask - Port 5000)
    |
    | SQL Queries
    |
Database (MySQL - XAMPP)
```

### Core Modules

**Backend Structure:**
```
api/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── routes.py              # API endpoints
├── auth.py                # Authentication & JWT logic
├── smart_advisor.py       # Analytics engine
├── database.py            # Database connection utilities
└── requirements.txt       # Python dependencies
```

**Frontend Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx       # Login page component
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── ProductList.jsx     # Products table
│   │   ├── ReceiptForm.jsx     # Receipt operations
│   │   ├── DeliveryForm.jsx    # Delivery operations
│   │   └── SmartAdvisor.jsx    # Advisor alerts
│   ├── services/
│   │   └── api.js              # API call functions
│   ├── styles/
│   │   └── App.css             # Global styles
│   ├── App.jsx                 # Main app component
│   └── index.js                # React entry point
├── package.json                # npm dependencies
└── public/
    └── index.html              # HTML template
```

**Database Structure:**
```
MySQL Database: coreinventory
├── users                  # User accounts and authentication
├── products               # Product catalog
├── stock_ledger          # Immutable transaction log
├── stock_levels          # Current inventory by warehouse
├── receipts              # Incoming goods records
├── deliveries            # Outgoing goods records
├── stock_adjustments     # Physical count reconciliation
├── transfers             # Inter-warehouse movements
└── product_analytics     # Smart Advisor metrics
```

---

## Development Timeline

### Week 1: Foundation (March 15 - March 21)

**Day 1-2: Project Setup**
- Finalize development environment
- Setup XAMPP with MySQL
- Initialize Flask and React projects
- Configure database connection

**Day 2-3: Authentication**
- Create User model in database
- Implement register endpoint
- Implement login endpoint with JWT
- Create login/register React components

**Day 4-5: Dashboard and Products**
- Create Product model in database
- Build dashboard with KPIs
- List all products with status
- Add product creation form

**Friday: Integration Testing**
- Test authentication flow end-to-end
- Test product CRUD operations
- Verify database persistence

### Week 2: Core Operations (March 22 - March 28)

**Receipt Operations**
- Create Receipt model
- Build receipt creation endpoint
- Implement stock level updates
- Create receipt form in frontend

**Delivery Operations**
- Create Delivery model
- Build delivery endpoint with stock validation
- Prevent over-delivery
- Create delivery form

**Stock Adjustments**
- Handle physical count reconciliation
- Record variance explanations
- Update stock levels

**Transfers**
- Inter-warehouse movement tracking
- Update source and destination warehouses

### Week 3: Smart Advisor (March 29 - April 4)

**Consumption Analytics**
- Calculate daily consumption rate per product
- Identify consumption trends
- Store historical data

**Stockout Prediction**
- Build prediction algorithm
- Calculate days until stockout
- Create warnings for 14-day threshold

**Waste Detection**
- Identify dead stock (zero movement 30+ days)
- Calculate waste potential
- Generate recommendations

**Analytics Dashboard**
- Display Smart Advisor insights
- Show risk heat map
- Display recommendations

### Week 4: Testing and Deployment (April 5 - April 7)

**Testing**
- Unit tests for prediction algorithms
- Integration tests for all workflows
- Load testing with 10k+ products
- Security audit

**Optimization**
- Database query optimization
- API response time optimization
- Frontend performance tuning

**Final Deployment**
- Prepare production database
- Create user documentation
- Final bug fixes

---

## Project Structure

```
d:\odoo\
├── README.md                    # This file
├── SETUP.md                     # Setup instructions
├── DATABASE.md                  # Database schema documentation
├── WORKFLOW.md                  # Development workflow
│
├── api/                         # Python Flask Backend
│   ├── app.py                   # Main Flask application
│   ├── models.py                # Database models
│   ├── routes.py                # API routes
│   ├── auth.py                  # Authentication logic
│   ├── smart_advisor.py         # Analytics engine
│   ├── database.py              # DB connection
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variables template
│
├── frontend/                    # React.js Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ReceiptForm.jsx
│   │   │   ├── DeliveryForm.jsx
│   │   │   └── SmartAdvisor.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── public/index.html
│
├── database/                    # Database files
│   ├── schema.sql               # MySQL schema
│   ├── seed_data.sql            # Sample data
│   └── migrations/              # Database migrations
│
└── docs/                        # Documentation
    ├── API_DOCS.md              # API endpoint documentation
    ├── DATABASE_SCHEMA.md        # Database design
    └── DEPLOYMENT.md             # Deployment guide
```

---

## Setup Instructions

### Prerequisites

1. **Python 3.8+**
   - Download from: https://www.python.org/downloads/
   - Verify: python --version

2. **Node.js and npm**
   - Download from: https://nodejs.org/ (LTS version)
   - Verify: node --version and npm --version

3. **XAMPP** (MySQL)
   - Download from: https://www.apachefriends.org/
   - Install: Apache, MySQL, PhpMyAdmin

4. **Git**
   - Download from: https://git-scm.com/
   - Verify: git --version

### Backend Setup

```bash
# 1. Navigate to API folder
cd d:\odoo\api

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment (Windows)
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file
copy .env.example .env

# 6. Update database credentials in .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=coreinventory

# 7. Run Flask server
python app.py

# Expected output:
# Running on http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd d:\odoo\frontend

# 2. Install dependencies
npm install

# 3. Create .env file (if needed)
# REACT_APP_API_URL=http://localhost:5000

# 4. Start React development server
npm start

# Expected output:
# Compiled successfully!
# You can now view the app in the browser
```

### Database Setup

```bash
# 1. Start XAMPP
# - Open XAMPP Control Panel
# - Click "Start" for Apache and MySQL

# 2. Access phpMyAdmin
# - Open browser: http://localhost/phpmyadmin
# - Default login: root (username, no password)

# 3. Create database
# - Click "New" in left panel
# - Database name: coreinventory
# - Collation: utf8mb4_unicode_ci
# - Click "Create"

# 4. Import schema
# - Select coreinventory database
# - Click "Import" tab
# - Select database/schema.sql
# - Click "Go"

# 5. Verify tables
# - Check for tables: users, products, stock_ledger, etc.
```

---

## API Documentation

### Authentication Endpoints

**POST /api/auth/register**
- Register new user
- Body: {email: string, password: string, name: string}
- Response: {message: string, user: {id, email, name}}

**POST /api/auth/login**
- Login and get JWT token
- Body: {email: string, password: string}
- Response: {token: string, user: {id, email, name}}

**POST /api/auth/logout**
- Logout user
- Headers: Authorization: Bearer <token>
- Response: {message: string}

### Dashboard Endpoints

**GET /api/dashboard/kpis**
- Get dashboard key performance indicators
- Headers: Authorization: Bearer <token>
- Response: {totalStockValue, totalItems, lowStockProducts, outOfStockProducts}

**GET /api/products**
- Get all products
- Headers: Authorization: Bearer <token>
- Response: [{id, name, sku, quantity, reorder_point, category}]

**GET /api/dashboard/low-stock**
- Get low stock products with predictions
- Headers: Authorization: Bearer <token>
- Response: [{id, name, sku, quantity, daysUntilStockout, recommendedOrder, risk}]

**GET /api/dashboard/transactions**
- Get recent transactions
- Headers: Authorization: Bearer <token>
- Response: [{id, type, product, quantity, date}]

### Product Endpoints

**POST /api/products**
- Create new product
- Headers: Authorization: Bearer <token>
- Body: {name, sku, category, reorder_point}
- Response: {id, name, sku, ...}

**PUT /api/products/:id**
- Update product
- Headers: Authorization: Bearer <token>
- Body: {name, category, reorder_point}
- Response: {id, name, sku, ...}

**DELETE /api/products/:id**
- Delete product
- Headers: Authorization: Bearer <token>
- Response: {message: string}

---

## Testing Credentials

**Test User Account:**
```
Email: admin@coreinventory.com
Password: admin123
```

---

## Performance Targets

- API Response Time: < 500ms
- Page Load Time: < 2 seconds
- Database Query Time: < 100ms
- Support 10,000+ products without performance degradation

---

## Success Metrics

1. **Functionality:** All MVP features working
2. **Performance:** Response time < 500ms
3. **Usability:** User satisfaction score > 4.5/5
4. **Data Accuracy:** 100% audit trail
5. **Scalability:** Support 100+ warehouses, 10k+ products

---

## Team

- **Developer:** ZEEL JARIWALA
- **Duration:** March 10 - April 7, 2026
- **Hackathon:** Odoo Hackathon - Indus University 2026

---

## License

This project is proprietary to ZEEL JARIWALA for Indus University Hackathon 2026.

---

## Support

For issues or questions, contact the development team through GitHub Issues.

---

Last Updated: March 14, 2026  
Status: MVP Development in Progress


README.md

COREINVENTORY - Enterprise Resource Planning System

1. PROJECT OVERVIEW

CoreInventory is a comprehensive Enterprise Resource Planning (ERP) system focused on inventory management. The application provides complete stock tracking, product management, receipt handling, and audit trail capabilities. Built with modern web technologies including React for frontend, Flask for backend, and MySQL for database management.

The system is designed for businesses that need to manage inventory across multiple products with real-time stock tracking, receipt processing, and complete audit trails of all inventory movements.

Current Version: 1.0.0
Last Updated: March 14, 2026
Status: Production Ready with Core Features

2. FEATURES

2.1 Core Features Implemented

Product Management
- Create and manage products with detailed information
- Track product SKU, category, unit of measure (UoM)
- Set minimum stock levels for automatic alerts
- Maintain product descriptions and specifications
- View complete product catalog with search and filter capabilities

Stock Tracking
- Real-time stock level monitoring for all products
- Accurate stock calculations based on all movements
- View current stock levels across all products
- Track stock by location and warehouse

Receipt Management (Inventory Incoming)
- Create receipts for incoming goods from suppliers
- Add multiple items per receipt
- Track supplier information and scheduled dates
- Automatic stock increase on receipt creation
- Reference tracking for traceability

Stock Ledger and Audit Trail
- Complete audit trail of all inventory movements
- Track movement type: Receipt, Delivery, Transfer, Adjustment
- Record user who created each movement
- Timestamp for all operations
- View movement details including quantity changes
- Search and filter ledger entries by product, type, date range

Low Stock Alerts
- Automatic detection of products below minimum stock level
- Configurable minimum stock thresholds per product
- Dashboard display of low stock items
- API endpoint for programmatic access to alerts

Dashboard and Statistics
- Overview of total products in system
- Total stock units calculation
- Count of low stock alerts
- Recent movement history
- Quick statistics for inventory health monitoring

Search and Filter
- Search products by name, SKU, or description
- Filter by category
- Filter by stock status (in stock, low stock, out of stock)
- Full-text search across product catalog

2.2 Additional Features (Backend Implemented, Frontend UI Development Pending)

Delivery Orders
- Create delivery orders for outgoing goods
- Automatic stock decrease on delivery
- Customer tracking and order reference
- Status management for deliveries

Internal Transfers
- Move stock between locations within warehouse
- Track transfer sources and destinations
- Maintain total stock invariant (no quantity change)
- Location-based inventory tracking

Stock Adjustments
- Physical count reconciliation
- Adjust system stock to match actual physical count
- Record variance reasons
- Automatic ledger entry for adjustments

3. TECHNOLOGY STACK

3.1 Frontend

Framework: React 18.2.0
Build Tool: Create React App
Styling: TailwindCSS 4.0 with PostCSS
Icons: Lucide React
HTTP Client: Axios
Routing: React Router v6
State Management: React Hooks (useState, useEffect)
Authentication: JWT tokens stored in localStorage

Browser Support: Chrome, Firefox, Safari, Edge (latest versions)
Development Port: http://localhost:3000

3.2 Backend

Framework: Flask 2.3.3
Server: Flask Development Server (Werkzeug)
Database: MySQL via mysql-connector-python
Authentication: Flask-JWT-Extended
Password Security: bcrypt for password hashing
Email: Flask-Mail for OTP delivery
Language: Python 3.8+
Development Port: http://localhost:5000

3.3 Database

Database System: MySQL (MariaDB 10.4.32)
Database Name: coreinventory
Port: 3306
Connection Pool: mysql-connector-python

Database Tables:
- users: User accounts and authentication
- products: Product master data
- stock_moves: Individual stock movements
- stock_ledger: Complete audit trail
- warehouses: Warehouse definitions
- locations: Storage locations within warehouses
- otp_logs: One-time password history
- audit_logs: System audit trail
- categories: Product categories
- units_of_measure: Unit definitions

4. SYSTEM ARCHITECTURE

4.1 Architecture Overview

The system follows a three-tier architecture:

Presentation Layer (Frontend)
- React components for all user interfaces
- TailwindCSS for responsive styling
- JWT token management for authentication
- Axios interceptor for API communication

Application Layer (Backend)
- Flask REST API endpoints
- JWT-protected routes
- Business logic for inventory operations
- Database transaction management

Data Layer (Database)
- MySQL database with normalized schema
- Foreign key relationships
- Indexes for performance optimization
- Audit trail tables for compliance

4.2 Data Flow

User Login Flow
1. User submits credentials (username/email and password)
2. Backend validates against users table
3. System returns JWT token (24-hour expiration)
4. Token stored in client localStorage
5. All subsequent requests include token in Authorization header

Product Creation Flow
1. User navigates to Products page
2. Clicks Create Product button
3. Submits form with product details
4. Backend validates required fields
5. Inserts into products table with initial stock
6. Frontend receives new product, displays in list

Receipt Creation Flow
1. User navigates to Operations > Receipt
2. Fills receipt details (reference, supplier, date)
3. Adds items (product + quantity) dynamically
4. Submits receipt creation
5. Backend processes each item:
   - Validates sufficient database consistency
   - Updates products table: current_stock += quantity
   - Creates stock_moves entry
   - Creates stock_ledger entry for audit trail
6. Frontend refreshes product list with new stock

Stock Ledger Query Flow
1. User navigates to Move History
2. Axios sends GET request to /api/stock-ledger
3. Backend queries stock_ledger table
4. Joins with products and users tables
5. Returns array of movement entries
6. Frontend displays in formatted table with filters

5. PROJECT STRUCTURE

d:\odoo\
├── frontend/
│   ├── src/
│   │   ├── App.js                    Main app component with routing
│   │   ├── App.css                   Global styles
│   │   ├── index.js                  React entry point
│   │   ├── index.css                 Global styles
│   │   ├── setupTests.js             Test configuration
│   │   ├── reportWebVitals.js        Performance monitoring
│   │   │
│   │   ├── components/
│   │   │   └── Navbar.jsx            Navigation bar (all pages)
│   │   │
│   │   └── pages/
│   │       ├── AuthPage.jsx          Login/signup
│   │       ├── Dashboard.jsx         Dashboard overview
│   │       ├── ProductsPage.jsx      Product management
│   │       ├── OperationsPage.jsx    Receipt creation and menu
│   │       ├── StockPage.jsx         Stock levels display
│   │       ├── MoveHistoryPage.jsx   Audit trail/stock ledger
│   │       ├── ProfilePage.jsx       User profile
│   │       ├── SettingsPage.jsx      Settings
│   │       └── OperationDetailPage.jsx  Individual operation details
│   │
│   ├── public/
│   │   ├── index.html                HTML template
│   │   ├── manifest.json             PWA manifest
│   │   └── robots.txt                SEO robots file
│   │
│   ├── package.json                  NPM dependencies
│   ├── postcss.config.js             PostCSS configuration
│   ├── tailwind.config.js            TailwindCSS configuration
│   └── README.md                     Frontend documentation
│
├── backend/
│   ├── app.py                        Flask main application (1100+ lines)
│   ├── migrate_db.py                 Database migration script
│   ├── add_dummy_data.py             Sample data generator
│   ├── requirements.txt              Python dependencies
│   ├── .env.example                  Environment variables template
│   │
│   ├── Documentation/
│   │   ├── BACKEND_SETUP.md          Backend installation guide
│   │   ├── QUICK_START.md            Quick start guide
│   │   ├── README_OTP_SYSTEM.md      OTP authentication details
│   │   ├── SYSTEM_OVERVIEW.md        System architecture
│   │   ├── PROGRESS_REPORT.md        Development progress
│   │   └── CoreInventory_API.postman_collection.json  API testing
│   │
│   └── Testing/
│       ├── test_backend.py           Backend API tests
│       ├── test_signup.py            Authentication tests
│       └── test_otp_flow.py          OTP system tests
│
├── Root Documentation/
│   ├── README.md                     This file
│   ├── QUICK_START_TESTING.md        Step-by-step testing guide
│   ├── TESTING_AND_DUMMY_DATA.md     Detailed test procedures
│   ├── INVENTORY_TESTING_GUIDE.md    Comprehensive testing documentation
│   └── package.json                  Root configuration
│
└── .git/                             Git repository

6. API ENDPOINTS

6.1 Authentication Endpoints

POST /api/signup
- Create new user account
- Body: username, email, password
- Returns: User ID, message

POST /api/login
- Authenticate user
- Body: email/username, password
- Returns: JWT token, user details

POST /api/forgot-password
- Initiate password reset
- Body: email
- Returns: OTP sent message

POST /api/verify-otp
- Verify OTP for password reset
- Body: email, otp
- Returns: Success/failure

POST /api/reset-password
- Reset password with OTP
- Body: email, otp, new_password
- Returns: Success message

6.2 Product Endpoints

GET /api/products
- Retrieve all products
- Returns: Array of product objects
- Protected: JWT required

POST /api/products
- Create new product
- Body: name, sku, category, uom, initial_stock, description
- Returns: Product ID and details
- Protected: JWT required

6.3 Stock Movement Endpoints

POST /api/stock-moves
- Create a stock movement (receipt/delivery/adjustment)
- Body: product_id, quantity, type, reference, notes
- Returns: Movement ID and details
- Protected: JWT required

GET /api/stock-moves
- Retrieve stock movements
- Returns: Array of movements
- Protected: JWT required

6.4 Stock Ledger Endpoints

GET /api/stock-ledger
- Retrieve complete audit trail
- Returns: Array of ledger entries with product and user info
- Protected: JWT required

6.5 Inventory Operation Endpoints

GET/POST /api/deliveries
- Manage delivery orders
- POST decreases stock
- Protected: JWT required

GET/POST /api/transfers
- Manage internal transfers
- POST moves between locations (no qty change)
- Protected: JWT required

GET/POST /api/adjustments
- Manage stock adjustments
- POST for physical count reconciliation
- Protected: JWT required

GET /api/alerts/low-stock
- Get products below minimum stock level
- Returns: Array of low stock items with shortage amounts
- Protected: JWT required

GET /api/stock-summary
- Get inventory statistics
- Returns: Totals for products, stock units, alerts, movements
- Protected: JWT required

6.6 Warehouse and Location Endpoints

GET/POST /api/warehouses
- Manage warehouse definitions
- Protected: JWT required

GET/POST /api/locations
- Manage storage locations
- Protected: JWT required

7. DATABASE SCHEMA

7.1 Users Table

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Bcrypt hashed
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

7.2 Products Table

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    unit_of_measure VARCHAR(20),
    current_stock INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

7.3 Stock Moves Table

CREATE TABLE stock_moves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) UNIQUE NOT NULL,
    move_type ENUM('in','out','internal','adjustment'),
    type ENUM('receipt','delivery','internal','adjustment'),
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    warehouse_id INT,
    contact VARCHAR(100),
    responsible_user_id INT,
    schedule_date DATE,
    status ENUM('Draft','Waiting','Ready','Done') DEFAULT 'Draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (responsible_user_id) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_date (created_at)
);

7.4 Stock Ledger Table

CREATE TABLE stock_ledger (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    reference_number VARCHAR(50),
    movement_type ENUM('receipt','delivery','transfer','adjustment','return'),
    quantity_change INT NOT NULL,
    old_balance INT,
    new_balance INT,
    notes TEXT,
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_date (created_at)
);

8. INSTALLATION AND SETUP

8.1 Prerequisites

Required Software:
- Node.js 14+ and npm 6+
- Python 3.8+
- MySQL 5.7+ (or MariaDB 10.4+)
- Git
- Visual Studio Code (recommended)

System Requirements:
- Windows, macOS, or Linux
- 4GB RAM minimum
- 2GB disk space
- Internet connection for npm/pip packages

8.2 Frontend Setup

Install Node dependencies:
npm install

Start development server:
npm start

The application will open at http://localhost:3000

Build for production:
npm run build

Run tests:
npm test

8.3 Backend Setup

Install Python dependencies:
pip install -r requirements.txt

Configure environment variables:
Copy .env.example to .env file
Update database credentials
Update email credentials for OTP

Run database migration:
python migrate_db.py

Start Flask server:
python app.py

Server will start at http://localhost:5000

8.4 Database Setup

Create MySQL database:
CREATE DATABASE coreinventory;

Run migration script:
python backend/migrate_db.py

Script will:
- Create all required tables
- Add missing columns to existing tables
- Create indexes for performance
- Setup foreign key relationships

Optional: Add sample data:
python backend/add_dummy_data.py

9. AUTHENTICATION

9.1 JWT Token System

Token Creation:
- Issued on successful login/signup
- Token expires in 24 hours
- Stored in browser localStorage
- Encoded with secret key

Token Usage:
- Included in Authorization header
- Format: Bearer <token>
- Automatically attached by axios interceptor
- Validated on every protected request

9.2 Login Process

User submits credentials:
- Email or username
- Password

Backend validates:
- User exists in database
- Password hash matches (bcrypt comparison)
- User is active

System returns:
- JWT token
- User ID
- Username
- Email

Frontend stores:
- Token in localStorage
- User data in localStorage
- Redirects to dashboard

9.3 Logout Process

User clicks logout button
Frontend clears:
- localStorage token
- User data
- Redirects to login page

No server-side logout needed (stateless JWT)

10. DEVELOPMENT WORKFLOW

10.1 Creating a New Feature

Step 1: Create backend endpoint
- Add route in app.py
- Add database queries
- Add JWT protection if needed
- Add error handling
- Test with Postman

Step 2: Create frontend component
- Create React component
- Add form/UI for feature
- Add axios API calls
- Handle loading/error states
- Add to navigation if needed

Step 3: Test feature
- Manual testing in browser
- Test API directly with Postman
- Verify database changes
- Check error handling

Step 4: Commit changes
- Stage changes: git add .
- Commit: git commit -m "Feature description"
- Push: git push origin main

10.2 Code Style Guidelines

Python Backend:
- Function names: snake_case
- Variable names: snake_case
- Class names: PascalCase
- Comments: Descriptive, above code block
- Line length: Maximum 100 characters

React Frontend:
- Component names: PascalCase
- File names: PascalCase for components
- Variable names: camelCase
- Function names: camelCase
- Comments: JSDoc for functions
- Use arrow functions

CSS/Tailwind:
- Use utility classes for styling
- Avoid custom CSS if possible
- Use Tailwind breakpoints for responsive design
- Consistent spacing with Tailwind units

11. TESTING

11.1 Manual Testing

Using Website UI:
1. Login with credentials
2. Navigate to each page
3. Create test data
4. Verify calculations
5. Check audit trail

Test Cases Available:
- Product creation and listing
- Receipt creation with stock increase
- Stock ledger viewing and filtering
- Stock accuracy verification
- Low stock alerts

11.2 API Testing

Using Postman:
- Import CoreInventory_API.postman_collection.json
- Set base URL to http://localhost:5000
- Use test credentials for authentication
- Test all endpoints
- Verify responses

Using Command Line (curl):
- Test authentication
- Test product endpoints
- Test stock operations
- Verify error handling

11.3 Test Procedures

Complete testing documentation available in:
- QUICK_START_TESTING.md: Step-by-step testing flow
- TESTING_AND_DUMMY_DATA.md: Detailed test scenarios
- INVENTORY_TESTING_GUIDE.md: Comprehensive procedures

12. DEPLOYMENT

12.1 Frontend Deployment

Build production version:
npm run build

Deploy to hosting:
- Upload build/ folder contents
- Or use CI/CD pipeline (GitHub Actions)
- Ensure environment variables configured

12.2 Backend Deployment

Prepare production:
- Update .env with production database
- Configure email service
- Set JWT secret key
- Configure CORS for frontend domain

Deploy on server:
- Use production WSGI server (Gunicorn, uWSGI)
- Configure reverse proxy (Nginx)
- Setup SSL/TLS certificates
- Monitor application logs

12.3 Database Deployment

Backup strategy:
- Regular database backups
- Backup to external storage
- Document recovery procedure

Migration strategy:
- Test migrations on backup first
- Schedule maintenance window
- Have rollback plan ready

13. PROJECT STATUS

13.1 Completed Features

Core Functionality:
- User authentication with JWT
- Product management system
- Stock tracking and calculations
- Receipt creation and processing
- Stock ledger with complete audit trail
- Low stock alert detection
- Dashboard with statistics
- Search and filter capabilities
- Responsive UI design

Backend API:
- All inventory endpoints implemented
- All validation in place
- Error handling complete
- Database transactions working
- JWT protection on all operations

Frontend UI:
- Login/signup page
- Dashboard page
- Products page with create form
- Operations page with receipt tab
- Stock page
- Move history with ledger viewer
- Navigation menu
- Search and filter

13.2 Features Ready for Testing

Working but need verification:
- Receipt processing with stock updates
- Stock accuracy calculations
- Ledger entry creation
- User attribution in audit trail
- Date/time tracking

13.3 Features Implemented (Backend Ready, UI Pending)

Delivery Orders:
- API endpoint created
- Stock decrease logic implemented
- Database integration complete
- Needs: Frontend page and form

Internal Transfers:
- API endpoint created
- Transfer logic (no qty change)
- Location tracking implemented
- Needs: Frontend page and form

Stock Adjustments:
- API endpoint created
- Variance calculation logic
- Physical count reconciliation
- Needs: Frontend page and form

Low Stock Alerts:
- API endpoint created
- Alert calculation working
- Needs: Frontend display page

13.4 Remaining Work

Frontend Development:
- Create Delivery Orders page
- Create Internal Transfers page
- Create Stock Adjustments page
- Create Low Stock Alerts page
- Add advanced reporting

Advanced Features:
- Multi-user concurrent operations
- Transaction locking mechanism
- PDF report generation
- Email notifications
- Barcode scanning support
- Import/export functionality
- Advanced analytics

Performance:
- Database query optimization
- Caching mechanism
- Pagination for large datasets
- Search indexing

14. TROUBLESHOOTING

14.1 Common Issues

Frontend Not Loading
Solution: npm start from frontend directory, ensure port 3000 available

Backend API Errors
Solution: Check backend console, verify database connection, check .env file

Database Connection Failed
Solution: Ensure MySQL running, verify credentials, check coreinventory database exists

Stock Not Updating After Receipt
Solution: Refresh page, check browser console for errors, verify database transaction

Authentication Token Expired
Solution: Login again, token refresh mechanism can be added

14.2 Getting Help

Check documentation:
- Backend: backend/documentation/
- Frontend: frontend/README.md
- Testing: TESTING_AND_DUMMY_DATA.md

Check logs:
- Backend console output
- Browser developer console (F12)
- Network tab in DevTools

Debug database:
- Direct MySQL query
- Check table contents
- Verify data types

15. FUTURE ENHANCEMENTS

Phase 2 Features:
- Multi-warehouse support with transfers
- Barcode/QR code scanning
- Mobile application
- Advanced reporting and analytics
- Predictive inventory management
- Supplier management module
- Customer orders integration
- Financial integration

Phase 3 Features:
- Machine learning for demand forecasting
- Batch operations (CSV import/export)
- Real-time notifications
- Advanced audit and compliance features
- Integration with accounting software
- API for third-party integrations
- Multi-language support

16. SUPPORT AND CONTRIBUTION

16.1 Getting Support

For issues or questions:
- Check existing documentation
- Review test procedures
- Check GitHub issues
- Contact development team

16.2 Contributing

To contribute:
1. Create feature branch
2. Make changes following code style
3. Test thoroughly
4. Commit with descriptive messages
5. Create pull request with documentation
6. Wait for review and approval

16.3 License

Project License: MIT License
Third-party Licenses: See individual package documentation

17. GLOSSARY

SKU: Stock Keeping Unit, unique product identifier
UoM: Unit of Measure, standard unit for quantity
JWT: JSON Web Token, authentication mechanism
REST: Representational State Transfer, API architecture style
OAUTH: Open Authorization, authentication framework
OTP: One-Time Password, security verification
Ledger: Complete record of transactions/movements
Audit Trail: Record of all system actions for compliance
Transaction: Database operation unit
Cursor: Database connection object for queries

18. CONTACT AND DOCUMENTATION

Project Repository: https://github.com/ZEELJARIWALA/odoo_hackathon_indus_university_2026
Email: zeeljariwala@example.com
Organization: Indus University Hackathon 2026

Additional Resources:
- API Documentation: CoreInventory_API.postman_collection.json
- System Architecture: backend/documentation/SYSTEM_OVERVIEW.md
- Setup Guide: backend/documentation/BACKEND_SETUP.md
- Testing Guide: TESTING_AND_DUMMY_DATA.md

End of README

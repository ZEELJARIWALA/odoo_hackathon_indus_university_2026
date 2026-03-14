# Table Structure Plan - Based on Frontend First Approach

## Phase 1: Frontend Testing (NOW) ✅
**Status:** Using Mock Data - No Backend Needed

All pages working with sample/mock data:
- ✅ Products (3 samples)
- ✅ Warehouses (1 sample)
- ✅ Locations (3 samples)
- ✅ Stock Levels (3 samples)
- ✅ Stock Movements (3 samples)
- ✅ Users (1 admin user)

**Goal:** Test UI/UX and understand data flow

---

## Phase 2: Backend Database Design (LATER)
**Status:** Not started - waiting for frontend validation

### Tables Required (From Frontend Analysis)

#### 1. **USERS TABLE**
Stores user accounts & authentication

```sql
users {
  id (Primary Key)
  username (Unique) - "admin"
  email (Unique) - "admin@coreinventory.com"
  password_hash - bcrypt encrypted
  role - Enum: 'staff', 'manager', 'admin'
  is_active - Boolean (default: true)
  created_at - Timestamp
  updated_at - Timestamp
}
```

**Frontend Usage:**
- Login page: email + password
- Signup: username, email, password, role selection
- Profile menu: shows username
- Role-based access control

---

#### 2. **PRODUCTS TABLE**
Inventory items

```sql
products {
  id (Primary Key)
  name - "Widget A", "Widget B"
  sku (Unique) - "SKU-001", "SKU-002"
  category - "Electronics", "Parts"
  uom - "Units" (unit of measure)
  min_stock_level - 10, 15, 20
  created_at
  updated_at
}
```

**Frontend Usage:**
- Dashboard: product list & stats
- Stock page: product names in table
- Dropdown: select product in stock moves
- Search: filter by product name/SKU

**Data Volume:** 3+ products minimum

---

#### 3. **WAREHOUSES TABLE**
Physical warehouse locations

```sql
warehouses {
  id (Primary Key)
  name - "Main Warehouse"
  short_code (Unique) - "WH-001"
  address - "123 Business Street"
  created_at
  updated_at
}
```

**Frontend Usage:**
- Settings page: warehouse list & form
- Location creation: select warehouse
- Dashboard display: warehouse name
- Stock moves: warehouse reference

**Data Volume:** 1-10 warehouses typical

---

#### 4. **LOCATIONS TABLE**
Storage areas within warehouses

```sql
locations {
  id (Primary Key)
  name - "Storage Room A"
  short_code - "LOC-001"
  warehouse_id (Foreign Key to warehouses)
  created_at
  updated_at
}
```

**Frontend Usage:**
- Settings page: location list & form
- Stock page: location reference
- Move history: from/to location display
- Stock levels: location filter

**Data Volume:** 3+ per warehouse

---

#### 5. **STOCK_LEVELS TABLE**
Current inventory per product per location

```sql
stock_levels {
  id (Primary Key)
  product_id (Foreign Key to products)
  location_id (Foreign Key to locations)
  on_hand - 50, 75, 100 (editable in stock page)
  free_to_use - 48, 70, 95 (calculated)
  per_unit_cost - 99.99, 149.99 (editable in stock page)
  created_at
  updated_at
  Unique(product_id, location_id)
}
```

**Frontend Usage:**
- Stock page: main table data
  - Product name
  - Per unit cost (editable)
  - On hand (editable)
  - Free to use (display)
- Dashboard stats: total inventory
- Edit functionality: save new quantities

**Important:** User must edit on_hand here!

---

#### 6. **STOCK_MOVES TABLE**
All inventory transactions

```sql
stock_moves {
  id (Primary Key)
  product_id (Foreign Key to products)
  from_location_id (Foreign Key to locations, nullable)
  to_location_id (Foreign Key to locations)
  quantity - 10, 5, 20
  reference - "IN-001", "OUT-001", "ADJ-001"
  status - Enum: 'draft', 'waiting', 'ready', 'done'
  move_type - Enum: 'in', 'out', 'adjustment'
  created_by (Foreign Key to users, nullable)
  created_at
  updated_at
}
```

**Frontend Usage:**
- Move History page:
  - List view: Reference, Date, Contact, From, To, Quantity, Status
  - Kanban view: grouped by status
  - Search: by reference/contact
  - Status filter: draft/waiting/ready/done
  - Colors: green=in, red=out, purple=adjustment
- Dashboard: recent moves
- Operations page: filtered by type

**Data Relationships:**
- Reference shows multiple products if multiple items per move
- Status determines workflow: draft → waiting → ready → done

---

#### 7. **OTP_LOGS TABLE**
Password reset tracking

```sql
otp_logs {
  id (Primary Key)
  email - user@example.com
  otp_code - "123456" (6 digits)
  is_used - Boolean (one-time use)
  expires_at - Timestamp (10 minutes)
  created_at
}
```

**Frontend Usage:**
- Auth page: Forgot password flow
- OTP validation: checking codes
- Security: preventing OTP reuse

---

#### 8. **AUDIT_LOGS TABLE** (Optional but recommended)
Track all changes

```sql
audit_logs {
  id (Primary Key)
  user_id (Foreign Key to users)
  action - "created", "updated", "deleted"
  entity_type - "product", "stock_move"
  entity_id - the record ID
  details - JSON with old/new values
  ip_address
  created_at
}
```

**Frontend Usage:**
- Currently: none (backend feature)
- Future: admin viewing change history

---

## Data Relationships Map

```
users
├─ creates: stock_moves (created_by)
└─ multiple roles

products
├─ has: stock_levels (multiple per product)
├─ has: stock_moves (multiple).
└─ displayed in: Dashboard, Stock, Operations

warehouses
├─ contains: locations (1:many)
└─ displayed in: Settings, Move History

locations
├─ parent: warehouse
├─ holds: stock_levels
├─ source: stock_moves (from_location)
└─ destination: stock_moves (to_location)

stock_levels
├─ per: product + location
├─ edited in: Stock page
└─ viewed in: Dashboard

stock_moves
├─ one: product
├─ from: location (nullable for receipts)
├─ to: location
├─ by: user
├─ type: in/out/adjustment
└─ displayed in: Move History, Dashboard, Operations

otp_logs
└─ for: password reset

audit_logs
└─ tracks: all changes
```

---

## Sample Data Needed at Launch

### When you create backend, start with this minimum data:

**1 Warehouse:**
- ID: 1
- Name: "Main Warehouse"
- Code: "WH-001"

**3 Locations:**
- LOC-001: Storage Room A → Warehouse 1
- LOC-002: Storage Room B → Warehouse 1
- LOC-003: Loading Dock → Warehouse 1

**3 Products:**
- SKU-001: Widget A, Electronics, $99.99
- SKU-002: Widget B, Electronics, $149.99
- SKU-003: Component X, Parts, $49.99

**3 Stock Levels:**
- Widget A @ Storage Room A: 50 on-hand, 48 free
- Widget B @ Storage Room A: 75 on-hand, 70 free
- Component X @ Storage Room B: 100 on-hand, 95 free

**1 Admin User:**
- admin@coreinventory.com
- Password: Admin@123
- Role: manager

**3 Stock Moves:**
- IN-001: Receipt of 10 Widget A
- OUT-001: Delivery of 5 Widget B (ready)
- ADJ-001: Adjustment of 20 Component X (waiting)

---

## Migration Strategy (When Ready for Real Backend)

### Step 1: Look at current mock data
- Understanding data flow
- See relationships
- Plan database schema

### Step 2: Create actual MySQL database
```bash
# Run database_migration_safe.sql
# Creates all 8 tables
# No conflicts with existing data
```

### Step 3: Populate sample data
```sql
-- Insert the sample data above
INSERT INTO warehouses ...
INSERT INTO locations ...
INSERT INTO products ...
-- etc
```

### Step 4: Update frontend config
```javascript
// In App.js, comment out:
// setupMockAPI(axios);  // Disable mock

// Backend now provides real data
// No other frontend changes needed!
```

### Step 5: Start backend
```bash
cd d:\odoo\backend
python app.py
```

**Result:** Frontend still works perfectly, now talking to real database!

---

## Timeline Suggestion

```
TODAY:
├─ ✅ Test frontend with mock data
├─ ✅ Verify all pages work
├─ ✅ Understand data flow
└─ ✅ Document user workflows

LATER (After Frontend Validation):
├─ Create MySQL database (8 tables)
├─ Add sample data
├─ Update frontend config (1 line change!)
├─ Start backend
└─ Verify everything connects

FINAL:
└─ ✅ Full system working end-to-end!
```

---

## What You NOW Know About Required Tables

✅ **User Management**
- Signup/login data needed
- Roles: staff vs manager
- Authentication tokens

✅ **Inventory**
- Products with SKUs
- Warehouses with multiple locations
- Stock tracking per location

✅ **Operations**
- Receipt (in), Delivery (out), Adjustment (internal)
- Status workflow: draft → waiting → ready → done
- Reference numbers for tracking
- From/to location per movement

✅ **Support**
- OTP for password reset
- Audit logs for tracking

---

## Ready for Backend?

When you finish testing frontend and want to build backend:

1. **Database:** Use `database_migration_safe.sql`
2. **Schema:** Matches this plan exactly
3. **Sample Data:** Insert example products/warehouses/locations
4. **APIs:** All endpoints match frontend calls
5. **Connection:** One line change in frontend config!

**No rework needed - just connect the dots!**

---

**Current Status:** ✅ Frontend First - Mock Data Active
**Backend Status:** ⏸️ Ready to build when you finish frontend testing

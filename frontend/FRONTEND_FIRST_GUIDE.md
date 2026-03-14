# 🚀 Frontend First - Development Mode

## Fast Start (No Backend!)

### Option 1: Double-Click to Run
```
Windows:
1. Navigate to: d:\odoo\frontend
2. Double-click: start_frontend.bat
3. Browser opens: http://localhost:3000
4. DONE! 🎉

You're now in development mode with MOCK DATA - no backend needed!
```

### Option 2: Manual Console
```bash
cd d:\odoo\frontend
npm start
```

Browser automatically opens on: http://localhost:3000

---

## 🎯 What Works WITHOUT Backend

✅ **All Pages Load**
  - Login/Signup
  - Dashboard with stats
  - Stock management
  - Move history
  - Settings (warehouse/location)
  - Operations

✅ **Mock Data Returns**
  - Products list (3 sample products)
  - Warehouses (1 main warehouse)
  - Locations (3 storage areas)
  - Stock movements (3 sample moves)
  - Stock levels

✅ **Authentication**
  - Signup with any credentials
  - Login with any email/password
  - Token saved to localStorage
  - Logout works

✅ **No Backend Calls**
  - All API calls intercepted
  - Mock data returned instantly
  - Perfect for UI testing
  - No dependency on backend

---

## 🔑 Demo Credentials (Any password works!)

```
Email: admin@coreinventory.com
Password: anything

OR

Email: demo@example.com
Password: anything
```

Just use any email and password - login works for everything!

---

## 📋 Mock Data Included

### Products (3 samples)
```
1. Widget A (SKU-001) - $99.99
2. Widget B (SKU-002) - $149.99
3. Component X (SKU-003) - $49.99
```

### Warehouses (1 main)
```
Main Warehouse (WH-001)
123 Business Street, Industrial Area
```

### Locations (3 areas)
```
Storage Room A (LOC-001)
Storage Room B (LOC-002)
Loading Dock (LOC-003)
```

### Stock Levels
```
Widget A: 50 units on hand
Widget B: 75 units on hand
Component X: 100 units on hand
```

### Stock Movements (3 samples)
```
IN-001: 10 units received
OUT-001: 5 units shipped (ready)
ADJ-001: 20 units adjustment (waiting)
```

---

## 🎨 Frontend Testing Tips

### Test Workflows

**1. Login Flow**
- Click Signup (any credentials work)
- Click Login (any credentials work)
- See token saved to localStorage

**2. Dashboard**
- View stats cards
- See mock products
- Filter by status/type
- Search functionality

**3. Stock Management**
- Edit stock quantities
- Click Save/Cancel
- See mock storage

**4. Move History**
- Toggle List/Kanban views
- See status colors
- Search movements

**5. Settings**
- Create warehouses (mock)
- Create locations (mock)
- Edit/delete operations

### Developer Console

Open Chrome DevTools (F12):
- Check Network → see mock intercepted calls
- Check Application → see localStorage token
- Check Console → no error messages
- Check React DevTools → component tree

---

## 📊 Data Structure Understanding

While testing frontend, you'll understand:

```
PRODUCTS
├─ Widget A, B (Electronics)
├─ Component X (Parts)
└─ Each has: SKU, cost, stock level

WAREHOUSES
├─ Main Warehouse
└─ Has multiple locations

LOCATIONS
├─ Storage areas within warehouse
├─ Storage Room A, B
├─ Loading Dock
└─ Each can hold products

STOCK LEVELS
├─ Product inventory per location
├─ On-hand + Free-to-use
├─ Per-unit cost
└─ Quantity tracking

STOCK MOVES
├─ Receipt (product in)
├─ Delivery (product out)
├─ Adjustment (internal move)
└─ Status: draft → waiting → ready → done
```

---

## 🔄 Switch to Real Backend Later

When you're ready to add backend:

1. **Stop frontend** (Ctrl+C)
2. **In `src/App.js`**, comment out mock API:
   ```javascript
   // setupMockAPI(axios);  // Disable mock
   ```
3. **Start real backend:**
   ```bash
   cd d:\odoo\backend
   python app.py
   ```
4. **Start frontend again:**
   ```bash
   npm start
   ```
5. ✅ Real backend now active!

---

## 📝 Understand Tables Needed

Based on frontend, you'll need these tables:

```sql
users
├─ Login/Signup data
├─ Roles (staff/manager)
└─ Authentication

products
├─ Widget A, B, Component X
├─ SKU + Category
└─ Min stock level

warehouses
├─ Main Warehouse
└─ Multiple locations

locations
├─ Storage areas
└─ Within warehouses

stock_levels
├─ Per product per location
├─ On-hand quantity
├─ Free-to-use quantity
└─ Unit cost

stock_moves
├─ Receipt/Delivery/Adjustment
├─ From/To locations
├─ Quantity + Status
└─ Reference tracking
```

---

## ✅ Checklist

- [x] Frontend code ready
- [x] Mock API configured
- [x] Sample data included
- [x] No backend needed
- [x] Login flow works
- [x] All pages functional
- [x] Data structures clear

---

## 🚀 Ready to Start?

### Quick Commands

```bash
# Navigate to frontend
cd d:\odoo\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start

# Browser opens automatically:
# http://localhost:3000
```

---

## 🎯 Next Steps After Testing Frontend

1. ✅ Test all pages with mock data
2. ✅ Understand data flow
3. ✅ Document required tables
4. ✅ **Then:** Build backend with real database
5. ✅ Finally: Connect frontend to backend

---

## 💡 Pro Tips

1. **Edit mock data in `mockAPI.js`** to test different scenarios
2. **Check browser console (F12)** for no errors
3. **Test responsive design** - resize browser window
4. **Test all buttons** - they all work in mock mode
5. **Play with filters** - they work on mock data

---

**Status:** ✅ Frontend ready for testing - NO BACKEND NEEDED
**Running on:** http://localhost:3000
**Mode:** Development with Mock API

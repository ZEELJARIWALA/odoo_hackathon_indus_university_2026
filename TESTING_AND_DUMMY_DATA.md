# CoreInventory - Testing Flow & Adding Dummy Data

## 🎯 Website Testing Flow (Step-by-Step)

### **Phase 1: Authentication**
```
1. Go to http://localhost:3000
2. You'll be redirected to /auth (Login page)
3. Login with:
   - Username: admin
   - Password: admin123
   OR
   - Email: admin@example.com
   - Password: admin123
4. After login, you'll see Dashboard
```

### **Phase 2: Navigation & Main Features**

#### **2.1 Go to Products Page**
```
1. Click "Products" button in navbar (top)
2. You should see empty or existing products list
3. Click "Create Product" button (blue, top-right)
4. Fill form:
   - Product Name: "Laptop"
   - SKU: "LAP-001"
   - Category: "Electronics"
   - UoM: "Unit"
   - Initial Stock: 50
   - Description: "Dell Laptop 15 inch"
5. Click "Create Product"
6. Product should appear in list immediately
```

#### **2.2 Go to Operations - Receipt (Add Stock)**
```
1. Click "Operations" in navbar
2. Select "Receipt" submenu
3. Click "Create Receipt" button
4. Fill form:
   - Reference: RCP-001
   - Supplier: "Tech Suppliers Inc"
   - Scheduled Date: (any date)
   - Notes: "Initial purchase"
5. In items section:
   - Select product: "Laptop"
   - Quantity: 20
6. Click "Create Receipt"
7. Stock increases: 50 + 20 = 70 units
```

#### **2.3 View Stock Ledger (Audit Trail)**
```
1. Click "Move History" in navbar
2. You'll see all movements:
   - Receipt entries (green, +20)
3. Filter by type or search by product name
4. Each row shows: Type, Product, Reference, Qty Change, User, Date
```

#### **2.4 Check Stock**
```
1. Click "Stock" in navbar
2. You should see:
   - Laptop: 70 units (50 initial + 20 receipt)
   - All products with current stock
```

#### **2.5 View Dashboard**
```
1. Click "Dashboard" in navbar
2. See summary statistics:
   - Total Products
   - Total Stock Units
   - Low Stock Alerts count
   - Recent movements
```

---

## 📊 Adding Dummy Data

### **Option 1: Via Website UI (Recommended for Testing)**

#### **Step 1: Create 5 Products**
```
Product 1:
- Name: Laptop
- SKU: LAP-001
- Category: Electronics
- UoM: Unit
- Initial Stock: 50

Product 2:
- Name: Monitor
- SKU: MON-001
- Category: Electronics
- UoM: Unit
- Initial Stock: 100

Product 3:
- Name: Keyboard
- SKU: KEY-001
- Category: Accessories
- UoM: Unit
- Initial Stock: 200

Product 4:
- Name: Mouse
- SKU: MUS-001
- Category: Accessories
- UoM: Unit
- Initial Stock: 300

Product 5:
- Name: USB Cable
- SKU: USB-001
- Category: Accessories
- UoM: Meter
- Initial Stock: 500
```

#### **Step 2: Create Receipts (Increase Stock)**
```
Receipt 1:
- Reference: RCP-2026-001
- Supplier: Tech World Inc
- Items: Laptop 30 units
- Result: Laptop stock = 50 + 30 = 80

Receipt 2:
- Reference: RCP-2026-002
- Supplier: Screen Masters
- Items: Monitor 25 units
- Result: Monitor stock = 100 + 25 = 125

Receipt 3:
- Reference: RCP-2026-003
- Supplier: Accessories Hub
- Items: 
  - Keyboard 50 units
  - Mouse 75 units
  - USB Cable 200 units
- Results:
  - Keyboard: 200 + 50 = 250
  - Mouse: 300 + 75 = 375
  - USB Cable: 500 + 200 = 700
```

#### **Step 3: Create Another Receipt**
```
Receipt 4:
- Reference: RCP-2026-004
- Supplier: Tech World Inc
- Items: 
  - Laptop 15 units
  - Monitor 10 units
- Results:
  - Laptop: 80 + 15 = 95
  - Monitor: 125 + 10 = 135
```

---

### **Option 2: Direct Database Insert (Fast)**

```sql
-- Login to MySQL
mysql -u root -p coreinventory

-- Insert Products
INSERT INTO products (name, sku, category, unit_of_measure, current_stock, min_stock_level, description) VALUES
('Laptop', 'LAP-001', 'Electronics', 'Unit', 100, 10, 'High-performance laptop'),
('Monitor', 'MON-001', 'Electronics', 'Unit', 150, 10, '27 inch 4K Monitor'),
('Keyboard', 'KEY-001', 'Accessories', 'Unit', 300, 20, 'Mechanical Keyboard RGB'),
('Mouse', 'MUS-001', 'Accessories', 'Unit', 400, 20, 'Wireless Mouse'),
('USB Cable', 'USB-001', 'Accessories', 'Meter', 800, 50, 'Type-C USB Cable'),
('RAM 16GB', 'RAM-001', 'Components', 'Unit', 50, 5, 'DDR4 RAM 16GB'),
('SSD 1TB', 'SSD-001', 'Components', 'Unit', 75, 5, 'NVMe SSD 1TB'),
('Power Supply 750W', 'PSU-001', 'Components', 'Unit', 30, 3, 'Certified Power Supply');

-- Insert Stock Movements (Receipts)
INSERT INTO stock_moves (product_id, quantity, warehouse_from, warehouse_to, status, date, reference, type) VALUES
(1, 50, 'Supplier', 'Main Warehouse', 'Done', NOW(), 'RCP-001', 'receipt'),
(2, 75, 'Supplier', 'Main Warehouse', 'Done', NOW(), 'RCP-001', 'receipt'),
(3, 100, 'Supplier', 'Main Warehouse', 'Done', NOW(), 'RCP-002', 'receipt'),
(4, 150, 'Supplier', 'Main Warehouse', 'Done', NOW(), 'RCP-002', 'receipt'),
(5, 300, 'Supplier', 'Main Warehouse', 'Done', NOW(), 'RCP-003', 'receipt');

-- Insert Stock Ledger Entries
INSERT INTO stock_ledger (product_id, quantity_change, movement_type, reference, from_location, to_location, reason, created_by) VALUES
(1, 50, 'receipt', 'RCP-001', 'Supplier', 'Main Warehouse', 'Initial purchase from Tech World', 1),
(2, 75, 'receipt', 'RCP-001', 'Supplier', 'Main Warehouse', 'Monitor bulk order', 1),
(3, 100, 'receipt', 'RCP-002', 'Supplier', 'Main Warehouse', 'Keyboard stock replenish', 1),
(4, 150, 'receipt', 'RCP-002', 'Supplier', 'Main Warehouse', 'Mouse bulk order', 1),
(5, 300, 'receipt', 'RCP-003', 'Supplier', 'Main Warehouse', 'Cable purchase', 1);
```

---

## 🧪 Complete Testing Scenario

### **Test Case 1: Create Product & Receipt**
```
1. Create Product "Tablet" with 30 initial stock
2. Create Receipt RCP-005 with Tablet 20 units
3. Verify: Tablet stock = 30 + 20 = 50
4. Go to Move History, see receipt entry
✅ Expected: Green receipt entry with +20 qty
```

### **Test Case 2: Create Delivery**
⚠️ (Delivery page needs UI, but endpoint exists)
```
API Call:
POST http://localhost:5000/api/deliveries
Body: {
  "product_id": 1,
  "quantity": 10,
  "reference": "DEL-001",
  "customer": "Customer ABC",
  "notes": "Delivery to client"
}

Expected: Laptop stock decreases from 100 to 90
✅ See red delivery entry in Move History with -10 qty
```

### **Test Case 3: Stock Adjustment**
⚠️ (Adjustment page needs UI, but endpoint exists)
```
API Call:
POST http://localhost:5000/api/adjustments
Body: {
  "product_id": 1,
  "physical_count": 85,
  "reason": "Physical count variance"
}

If system shows 90 but physical is 85:
✅ Creates adjustment entry with -5 qty
```

### **Test Case 4: View Low Stock Alerts**
```
API Call:
GET http://localhost:5000/api/alerts/low-stock

Expected: Returns products where current_stock < min_stock_level
If you set min_stock_level = 100 and current = 50:
✅ Shows shortage = 50 units
```

### **Test Case 5: Stock Summary**
```
Go to Dashboard or API:
GET http://localhost:5000/api/stock-summary

Expected Response:
{
  "total_products": 8,
  "total_stock_units": 2500,
  "low_stock_alerts": 2,
  "movements_last_24h": 5
}
```

---

## 📱 Full User Journey

```
┌─────────────────────────────────────────────┐
│ 1. LOGIN                                    │
│    Username: admin, Password: admin123      │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 2. DASHBOARD                                │
│    - See total products, stock, alerts      │
│    - View quick stats                       │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 3. PRODUCTS                                 │
│    - Create 5-8 different products          │
│    - Set initial stock for each             │
│    - Add categories & descriptions          │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 4. OPERATIONS → RECEIPT                     │
│    - Create multiple receipts               │
│    - Add items from products                │
│    - Verify stock increases                 │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 5. MOVE HISTORY                             │
│    - See all receipts (green)               │
│    - Filter by type or product              │
│    - Check qty changes (+50, +20, etc)      │
│    - View user who created each             │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 6. STOCK PAGE                               │
│    - See current stock for all products     │
│    - Verify numbers match movements         │
│    - Identify low stock items               │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 7. DASHBOARD AGAIN                          │
│    - Updated stats after all operations     │
│    - Total products increased               │
│    - Total stock units increased            │
└─────────────────────────────────────────────┘
```

---

## ⚡ Quick Commands for Dummy Data

**Copy-paste into Python terminal:**

```python
import mysql.connector
conn = mysql.connector.connect(host='localhost', user='root', password='', database='coreinventory')
cursor = conn.cursor()

# Insert 10 products quickly
products = [
    ('Laptop', 'LAP-001', 'Electronics', 'Unit', 100, 10),
    ('Monitor', 'MON-001', 'Electronics', 'Unit', 150, 10),
    ('Keyboard', 'KEY-001', 'Accessories', 'Unit', 300, 20),
    ('Mouse', 'MUS-001', 'Accessories', 'Unit', 400, 20),
    ('USB Cable', 'USB-001', 'Accessories', 'Meter', 800, 50),
    ('RAM 16GB', 'RAM-001', 'Components', 'Unit', 50, 5),
    ('SSD 1TB', 'SSD-001', 'Components', 'Unit', 75, 5),
    ('Power Supply', 'PSU-001', 'Components', 'Unit', 30, 3),
    ('Monitor 32"', 'MON-002', 'Electronics', 'Unit', 80, 8),
    ('Headphones', 'HEAD-001', 'Accessories', 'Unit', 200, 15),
]

sql = "INSERT INTO products (name, sku, category, unit_of_measure, current_stock, min_stock_level) VALUES (%s, %s, %s, %s, %s, %s)"
cursor.executemany(sql, products)
conn.commit()
cursor.close()
conn.close()

print("✅ 10 products inserted successfully!")
```

---

## 🎬 Recommended Testing Order

1. **Create Products** (5-10 products) ← Do this first
2. **Create Receipts** (Add stock) ← 2-3 receipts with different items
3. **View Move History** ← Verify all receipts appear
4. **Check Stock Page** ← Confirm stock numbers
5. **Check Dashboard** ← See updated statistics
6. **Test API endpoints** (if you have Postman)

---

## ✅ Verification Checklist

- [ ] Products page loads and shows products
- [ ] Can create new products with form
- [ ] Products button visible in navbar
- [ ] Can create receipts with multiple items
- [ ] Stock increases after receipt
- [ ] Move History shows all movements
- [ ] Can filter by movement type
- [ ] Stock page shows accurate current stock
- [ ] Dashboard statistics are correct
- [ ] All UI is responsive (test mobile view too)

---

## 🆘 Troubleshooting

If you see errors:
1. **400 Bad Request** → Check if all required fields are filled
2. **500 Server Error** → Restart backend: Run `python app.py`
3. **Empty Lists** → Data might not have synced, refresh page
4. **Stock not updating** → Check browser console for errors
5. **Database disconnection** → Ensure MySQL is running

---

**Now go test! Start with creating products, then receipts, then enjoy the full flow! 🚀**

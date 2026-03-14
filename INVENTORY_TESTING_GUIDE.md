# CoreInventory ERP - Complete Testing Guide

## System Overview
This document provides **step-by-step procedures** to test each inventory feature and verify stock consistency.

---

## 🧪 TEST 1: Product Management

### Objective
Create products with proper stock initialization.

### Steps
1. Go to **Products** page (http://localhost:3000/products)
2. Click **"Create Product"** button
3. Fill form:
   - **Product Name**: Steel Rods
   - **SKU**: SR-001
   - **Category**: Raw Materials
   - **UoM**: kg
   - **Initial Stock**: 0 (will add via receipt)
   - Click **Create Product**
4. ✅ **Verify**: Product appears in table with 0 stock

### Expected Result
- Database entry created in `products` table
- `current_stock` = 0
- `min_stock_level` = 10 (default)

---

## 🧪 TEST 2: Receipts (Incoming Goods)

### Objective
Receive goods from supplier and verify stock increases.

### Process: Receive 100 kg Steel from ABC Supply
1. Go to **Operations → Receipts** (http://localhost:3000/operations/receipt)
2. Click **"NEW"** button
3. Fill receipt form:
   - **Reference**: RCP-001
   - **Supplier**: ABC Supply Co.
   - **Scheduled Date**: Today
   - **Items**:
     - Product: Steel Rods (SR-001)
     - Quantity: 100
   - Click **Create Receipt**
4. ✅ **Verify**: 
   - Receipt appears in table
   - Status shows "done" (validated)

### Check Stock Updated
1. Go back to **Products** page
2. Search for "Steel Rods"
3. ✅ **Verify**: Stock now shows **100 units** ✅

### Stock Ledger Entry
- Look in **Stock Ledger** viewer (new page, coming soon)
- Entry: `Receipt - Steel Rods +100 units - ref: RCP-001`

**IMPORTANT**: Total system stock = 100 ✅

---

## 🧪 TEST 3: Internal Transfers (Location Movement)

### Objective
Move stock between locations WITHOUT changing total stock.

### Process: Move 60 kg from Main Warehouse → Production Rack
1. Go to **Operations → Transfers** (coming soon)
2. Click **"NEW"** button
3. Fill transfer form:
   - **Product**: Steel Rods (SR-001)
   - **From Location**: Main Warehouse
   - **To Location**: Production Rack
   - **Quantity**: 60
   - **Reference**: TRF-001
   - Click **Create Transfer**
4. ✅ **Verify**: Transfer logged

### Check Stock NOT Changed (Total Remains Same)
1. Go back to **Products** page
2. Steel Rods should STILL show **100 units** ✅
3. Why? Internal transfers don't reduce total stock, they just change location

### Stock Ledger Entry
- Entry: `Transfer - Steel Rods 60 units: Main Warehouse → Production Rack`
- Quantity change: **0** (internal only) ✅

**IMPORTANT**: Total system stock = 100 (unchanged) ✅

---

## 🧪 TEST 4: Deliveries (Outgoing Goods)

### Objective
Create delivery order and verify stock decreases.

### Process: Deliver 20 kg Steel to Customer ABC
1. Go to **Operations → Deliveries** (coming soon)
2. Click **"NEW"** button
3. Fill delivery form:
   - **Product**: Steel Rods (SR-001)
   - **Quantity**: 20
   - **Customer**: ABC Manufacturing Ltd.
   - **Reference**: DEL-001
   - Click **Create Delivery**
4. ✅ **Verify**: Delivery logged with status "done"

### Check Stock DECREASED
1. Go back to **Products** page
2. Steel Rods should now show **80 units** (100 - 20) ✅
3. Why? System auto-decreased stock by 20

### Stock Ledger Entry
- Entry: `Delivery - Steel Rods -20 units - to: ABC Manufacturing Ltd. - ref: DEL-001`
- Quantity change: **-20** ✅

**IMPORTANT**: Total system stock = 80 ✅

---

## 🧪 TEST 5: Stock Adjustments (Physical Count)

### Objective
Fix discrepancies between recorded and actual stock.

### Scenario: Physical Count Found 5 Damaged Units
1. Warehouse team counts: **75 units** instead of 80
2. Go to **Operations → Adjustments** (coming soon)
3. Click **"NEW"** button
4. Fill adjustment form:
   - **Product**: Steel Rods (SR-001)
   - **Physical Count**: 75 (what we actually have)
   - **Reason**: Damaged in storage - 5 units removed
   - **Reference**: ADJ-001
   - Click **Create Adjustment**
5. ✅ **Verify**: Adjustment logged

### Check Stock ADJUSTED
1. Go back to **Products** page
2. Steel Rods should now show **75 units** (80 - 5) ✅
3. System automatically corrected the discrepancy

### Stock Ledger Entry
- Entry: `Adjustment - Steel Rods -5 units - Reason: Damaged in storage (System: 80 → Physical: 75)`
- Quantity change: **-5** ✅

**IMPORTANT**: Total system stock = 75 ✅

---

## 🧪 TEST 6: Low Stock Alerts

### Objective
Identify products below minimum threshold.

### Process
1. Go to **Settings → Low Stock Alerts** (coming soon)
2. System shows:
   - **Product**: Steel Rods
   - **Current**: 75 units
   - **Minimum**: 10 units
   - **Status**: ✅ OK (above minimum)
3. If current stock < min_stock_level:
   - Alert shows **Shortage: X units**
   - Example: If stock was 8, shortage = 2 units

### Low Stock Alert Example
- Create a product with `min_stock_level` = 50
- Current stock = 30
- Alert: ⚠️ **Low Stock - Shortage: 20 units**

---

## 📊 TEST 7: Complete Inventory Flow Example

### Full Cycle: Raw Material to Finished Goods

```
STEP 1: RECEIVE RAW MATERIAL
┌─────────────────────────────────────────┐
│ Receive 100 kg Steel from Vendor        │
│ Stock: 0 → 100                          │
│ Type: RECEIPT                           │
│ Reference: RCP-001                      │
└─────────────────────────────────────────┘

STEP 2: INTERNAL TRANSFER
┌─────────────────────────────────────────┐
│ Move 60 kg to Production Floor           │
│ From: Main Warehouse                    │
│ To: Production Rack                     │
│ Total Stock: 100 (unchanged)            │
│ Type: TRANSFER                          │
│ Reference: TRF-001                      │
└─────────────────────────────────────────┘

STEP 3: ANOTHER TRANSFER (Production Usage)
┌─────────────────────────────────────────┐
│ Use 50 kg from Production (to finished) │
│ From: Production Rack                   │
│ To: Quality Check                       │
│ Total Stock: 100 (unchanged)            │
│ Type: TRANSFER                          │
│ Reference: TRF-002                      │
└─────────────────────────────────────────┘

STEP 4: DELIVER FINISHED GOODS
┌─────────────────────────────────────────┐
│ Ship 25 kg to Customer XYZ              │
│ Stock: 100 → 75                         │
│ Type: DELIVERY                          │
│ Reference: DEL-001                      │
└─────────────────────────────────────────┘

STEP 5: PHYSICAL COUNT & ADJUSTMENT
┌─────────────────────────────────────────┐
│ Actual count: 74 kg (1 kg damage)       │
│ System had: 75 kg                       │
│ Adjustment: 75 → 74 (-1 kg)             │
│ Type: ADJUSTMENT                        │
│ Reference: ADJ-001                      │
└─────────────────────────────────────────┘

FINAL STATE
┌─────────────────────────────────────────┐
│ Steel Rods: 74 kg                       │
│ Status: OK (above minimum of 10)        │
│ All movements logged in ledger          │
│ Full audit trail maintained             │
└─────────────────────────────────────────┘
```

### Verification Checklist
- ✅ Final stock: 74 units
- ✅ Low stock alert: NO (74 > 10)
- ✅ Stock ledger shows: 5 movements
- ✅ All transactions have reference codes
- ✅ Timestamp for each movement
- ✅ User who made each movement (audit trail)

---

## 🔍 Stock Consistency Rules

### MUST ALWAYS BE TRUE
1. **Total System Stock = Sum of All Product Current Stock**
2. **Receipts ALWAYS increase stock** ✅
3. **Deliveries ALWAYS decrease stock** ✅
4. **Transfers NEVER change total stock** ✅
5. **Adjustments match physical count** ✅
6. **Every movement has audit trail** ✅

### Testing Consistency
```sql
-- Run this query to verify stock is correct
SELECT 
    SUM(current_stock) as total_system_stock,
    COUNT(*) as total_products
FROM products;

-- Should match physical inventory count
```

---

## 📋 Stock Ledger Columns

Every entry in stock ledger should have:
| Column | Example |
|--------|---------|
| Product ID | 1 |
| Quantity Change | +100, -20, 0, -5 |
| Movement Type | receipt, delivery, transfer, adjustment |
| Reference | RCP-001, DEL-001, TRF-001, ADJ-001 |
| From Location | Main Warehouse, Production Rack |
| To Location | Production Rack, ABC Manufacturing |
| Reason | Vendor supply, Customer order, Damaged items |
| Created By | User ID (username) |
| Created At | 2026-03-14 14:30:45 |

---

## ⚠️ Important Consequences & Edge Cases

### Consequence 1: Stock Insufficiency
- **Action**: Try delivery of 200 units when only 100 in stock
- **Result**: ❌ System rejects - "Insufficient stock available"
- **Why**: Prevents impossible operations

### Consequence 2: Cascading Adjustments
- **Scenario**: Adjust 50 units up, then 30 units down
- **Result**: Stock goes 100 → 150 → 120 ✅
- **Ledger**: 2 separate adjustment entries

### Consequence 3: Multi-Day Inventory
- **Day 1**: Receipt +100
- **Day 2**: Transfer (internal only)
- **Day 3**: Delivery -30
- **Result**: Final stock reflects all movements chronologically ✅

### Consequence 4: Low Stock Alerts
- **If stock < min**: Alert triggers automatically ✅
- **Persist**: Alert stays until stock replenished ✅
- **Action**: Receive new shipment → Alert clears ✅

---

## 🧩 Mini Stress Test

Run this to verify system integrity:

```
1. Create 5 products
2. Receipt: +1000 each
3. Random transfers between all
4. Delivery: -300 each
5. Random adjustments: ±10
6. Verify final total matches formula
7. Check all ledger entries exist
8. Verify no duplicates or orphaned records
```

---

## 📞 Debugging Checklist

If something goes wrong:

- [ ] Check database has `stock_ledger` table
- [ ] Verify `current_stock` column exists in products
- [ ] Confirm JWT token is valid
- [ ] Check backend logs for error messages
- [ ] Verify all location IDs exist
- [ ] Confirm product IDs are correct
- [ ] Review CORS headers if frontend errors
- [ ] Check database connection is alive

---

## ✅ Success Criteria

System is working correctly when:
1. ✅ All products can be created
2. ✅ Receipts increase stock correctly
3. ✅ Deliveries decrease stock correctly
4. ✅ Transfers don't change total stock
5. ✅ Adjustments match physical counts
6. ✅ Low stock alerts appear automatically
7. ✅ Stock ledger logs every movement
8. ✅ No orphaned records in database
9. ✅ Full audit trail for compliance
10. ✅ System prevents invalid operations

---

**Last Updated**: 2026-03-14
**System**: CoreInventory ERP v1.0
**Status**: 🟢 Ready for Testing

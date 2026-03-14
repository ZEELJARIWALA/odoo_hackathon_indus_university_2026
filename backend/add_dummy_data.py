#!/usr/bin/env python3
"""
Quick Script to Add Dummy Data to CoreInventory Database
Run this once to populate database with sample products and movements
"""

import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import random

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'coreinventory'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'autocommit': False
}

def get_db_connection():
    try:
        return mysql.connector.connect(**db_config)
    except Error as e:
        print(f"❌ Connection error: {e}")
        return None

def add_dummy_data():
    """Add 10 products and sample movements"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Sample products data
        products_data = [
            ('Laptop Dell XPS 13', 'LAP-001', 'Electronics', 'Unit', 100, 10, 'High performance ultrabook'),
            ('Monitor 27" 4K', 'MON-001', 'Electronics', 'Unit', 150, 10, 'Ultra HD display'),
            ('Mechanical Keyboard', 'KEY-001', 'Accessories', 'Unit', 300, 20, 'RGB backlit mechanical keyboard'),
            ('Wireless Mouse', 'MUS-001', 'Accessories', 'Unit', 400, 20, 'Ergonomic wireless mouse'),
            ('USB-C Cable 2m', 'USB-001', 'Accessories', 'Meter', 800, 50, 'High speed USB-C cable'),
            ('RAM DDR4 16GB', 'RAM-001', 'Components', 'Unit', 50, 5, 'Kingston DDR4 16GB RAM'),
            ('NVMe SSD 1TB', 'SSD-001', 'Components', 'Unit', 75, 5, '1TB NVMe solid state drive'),
            ('Power Supply 750W', 'PSU-001', 'Components', 'Unit', 30, 3, 'Certified 750W power supply'),
            ('Monitor 32" Curved', 'MON-002', 'Electronics', 'Unit', 80, 8, 'Curved gaming monitor 32 inch'),
            ('Wireless Headphones', 'HEAD-001', 'Accessories', 'Unit', 200, 15, 'Noise-cancelling wireless headphones'),
        ]
        
        # Insert products
        print("📦 Adding products...")
        sql = """INSERT INTO products 
                 (name, sku, category, unit_of_measure, current_stock, min_stock_level, description) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        
        skus_added = 0
        for product in products_data:
            try:
                cursor.execute(sql, product)
                skus_added += 1
            except Error as e:
                if "Duplicate entry" in str(e):
                    print(f"⚠️  {product[1]} already exists, skipping...")
                else:
                    raise
        
        conn.commit()
        print(f"✅ {skus_added} products added successfully!")
        
        # Get product IDs for movements
        cursor.execute("SELECT id FROM products ORDER BY id")
        product_ids = [row[0] for row in cursor.fetchall()]
        
        # Create sample receipts
        print("📥 Adding receipt movements...")
        movements_data = []
        
        for i, product_id in enumerate(product_ids):
            qty = random.randint(20, 100)
            movements_data.append((
                f'RCP-{str(i+1).zfill(3)}',
                'receipt',
                'receipt',
                product_id,
                qty,
                'Supplier',
                'Main Warehouse',
                1,  # responsible_user_id
                (datetime.now() - timedelta(days=random.randint(0, 10))).strftime('%Y-%m-%d'),
                'Done',
                'Initial receipt'
            ))
        
        sql_moves = """INSERT INTO stock_moves 
                       (reference, move_type, type, product_id, quantity, from_location, to_location, responsible_user_id, schedule_date, status, notes) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        
        cursor.executemany(sql_moves, movements_data)
        conn.commit()
        print(f"✅ {len(movements_data)} receipt movements added!")
        
        # Add stock ledger entries
        print("📊 Adding stock ledger entries...")
        ledger_data = []
        
        for i, product_id in enumerate(product_ids):
            qty_change = random.randint(20, 100)
            ledger_data.append((
                product_id,
                'receipt',
                qty_change,
                qty_change,  # new_balance (simplified)
                f'RCP-{str(i+1).zfill(3)}',
                'Initial stock purchase',
                1,  # created_by_user_id (admin)
            ))
        
        sql_ledger = """INSERT INTO stock_ledger 
                        (product_id, movement_type, quantity_change, new_balance, reference_number, notes, created_by_user_id) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        
        cursor.executemany(sql_ledger, ledger_data)
        conn.commit()
        print(f"✅ {len(ledger_data)} ledger entries added!")
        
        # Show summary
        cursor.execute("SELECT COUNT(*) as total FROM products")
        product_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(current_stock) as total FROM products")
        total_stock = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) as total FROM stock_ledger")
        ledger_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ DUMMY DATA ADDED SUCCESSFULLY!")
        print("="*60)
        print(f"📦 Total Products: {product_count}")
        print(f"📊 Total Stock Units: {total_stock}")
        print(f"📝 Ledger Entries: {ledger_count}")
        print("="*60)
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        try:
            conn.rollback()
        except:
            pass
        return False

if __name__ == '__main__':
    print("🚀 CoreInventory - Dummy Data Generator")
    print("="*60)
    if add_dummy_data():
        print("\n✅ Ready to test! Go to http://localhost:3000")
        print("   - Check Products page (should show 10 products)")
        print("   - Check Stock page (should show stock levels)")
        print("   - Check Move History (should show receipts)")
    else:
        print("\n❌ Failed to add dummy data")

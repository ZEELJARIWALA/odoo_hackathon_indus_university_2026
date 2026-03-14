#!/usr/bin/env python3
"""
Database Migration Script - Add missing columns to products table
This ensures the schema matches what the application expects
"""

import mysql.connector
from mysql.connector import Error
import os

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

def migrate_products_table():
    """Add current_stock and description columns if they don't exist"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Check if current_stock column exists
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'current_stock'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding current_stock column to products table...")
            cursor.execute("""
                ALTER TABLE products 
                ADD COLUMN current_stock INT DEFAULT 0 AFTER sku
            """)
            print("✅ current_stock column added")
        
        # Check if description column exists
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'description'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding description column to products table...")
            cursor.execute("""
                ALTER TABLE products 
                ADD COLUMN description TEXT AFTER category
            """)
            print("✅ description column added")
        
        # Check if min_stock_level column exists
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'min_stock_level'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding min_stock_level column to products table...")
            cursor.execute("""
                ALTER TABLE products 
                ADD COLUMN min_stock_level INT DEFAULT 10 AFTER current_stock
            """)
            print("✅ min_stock_level column added")
        
        # Check if uom column exists
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'uom'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding uom column to products table...")
            cursor.execute("""
                ALTER TABLE products 
                ADD COLUMN uom VARCHAR(50) DEFAULT 'Unit' AFTER category
            """)
            print("✅ uom column added")
        
        # Check if type column exists in stock_moves
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'stock_moves' AND COLUMN_NAME = 'type'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding type column to stock_moves table...")
            cursor.execute("""
                ALTER TABLE stock_moves 
                ADD COLUMN type VARCHAR(50) DEFAULT 'internal' AFTER reference
            """)
            print("✅ type column added to stock_moves")
        
        # Create stock_ledger table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stock_ledger (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                quantity_change INT NOT NULL,
                movement_type VARCHAR(50) NOT NULL,
                reference VARCHAR(100),
                from_location VARCHAR(100),
                to_location VARCHAR(100),
                reason TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                INDEX idx_product (product_id),
                INDEX idx_date (created_at)
            )
        """)
        print("✅ stock_ledger table ensured")
        
        # Check if created_by column exists in stock_ledger
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'stock_ledger' AND COLUMN_NAME = 'created_by'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding created_by column to stock_ledger table...")
            cursor.execute("""
                ALTER TABLE stock_ledger 
                ADD COLUMN created_by INT
            """)
            print("✅ created_by column added to stock_ledger")
        
        # Check if created_at column exists in stock_ledger
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'stock_ledger' AND COLUMN_NAME = 'created_at'
        """)
        result = cursor.fetchall()
        if not result:
            print("Adding created_at column to stock_ledger table...")
            cursor.execute("""
                ALTER TABLE stock_ledger 
                ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """)
            print("✅ created_at column added to stock_ledger")
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database migration completed successfully!")
        return True
    except Error as e:
        print(f"❌ Migration error: {e}")
        try:
            conn.rollback()
        except:
            pass
        return False

if __name__ == '__main__':
    print("🔄 Starting database migration...")
    if migrate_products_table():
        print("✅ All migrations completed")
    else:
        print("❌ Migration failed")

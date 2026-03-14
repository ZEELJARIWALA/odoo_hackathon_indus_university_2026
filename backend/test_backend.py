#!/usr/bin/env python3
"""
Quick test script to verify backend setup
"""
import sys
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, test_db_connection

def test_backend():
    print("\n" + "="*50)
    print("🧪 CoreInventory Backend Test")
    print("="*50)
    
    # Test 1: Database Connection
    print("\n[1] Testing Database Connection...")
    status, message = test_db_connection()
    if status:
        print(f"    ✅ {message}")
    else:
        print(f"    ❌ {message}")
        print("\n⚠️  Make sure XAMPP MySQL is running!")
        print("   - Open XAMPP Control Panel")
        print("   - Click 'Start' for MySQL")
        return False
    
    # Test 2: Flask App
    print("\n[2] Testing Flask App...")
    try:
        with app.app_context():
            print("    ✅ Flask app initialized")
    except Exception as e:
        print(f"    ❌ Flask error: {e}")
        return False
    
    # Test 3: Check Required Tables
    print("\n[3] Checking Database Tables...")
    try:
        import mysql.connector
        conn = mysql.connector.connect(
            host='localhost', user='root', password='', database='coreinventory'
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TABLE_NAME FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'coreinventory'
        """)
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        
        required_tables = ['users', 'products', 'stock_moves', 'stock_levels']
        missing = [t for t in required_tables if t not in tables]
        
        if missing:
            print(f"    ⚠️  Missing tables: {missing}")
            print(f"    Found tables: {', '.join(tables)}")
        else:
            print(f"    ✅ All required tables exist: {', '.join(required_tables)}")
    except Exception as e:
        print(f"    ⚠️  Could not check tables: {e}")
    
    print("\n" + "="*50)
    print("✅ Backend is ready to run!")
    print("="*50)
    print("\nStart the backend with:")
    print("   python app.py")
    print("\nTest endpoints:")
    print("   GET  http://localhost:5000/health")
    print("   POST http://localhost:5000/api/auth/send-otp")
    print("\n")
    return True

if __name__ == '__main__':
    success = test_backend()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Test signup endpoint
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

def test_signup():
    print("\n" + "="*60)
    print("🧪 Testing Signup Endpoint")
    print("="*60 + "\n")
    
    # Test data
    test_user = {
        "username": "testuser123",
        "email": "testuser@example.com",
        "password": "TestPass@123",
        "role": "staff"
    }
    
    print(f"📤 Sending signup request...")
    print(f"   Username: {test_user['username']}")
    print(f"   Email: {test_user['email']}")
    print(f"   Role: {test_user['role']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json=test_user,
            timeout=5
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print(f"\n✅ Signup successful!")
            print(f"   User should be in database now")
            return True
        else:
            print(f"\n❌ Signup failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to backend!")
        print(f"   Make sure: python app.py is running")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def verify_user_in_db():
    """Verify the user was created in database"""
    print("\n" + "="*60)
    print("🔍 Verifying User in Database")
    print("="*60 + "\n")
    
    try:
        import mysql.connector
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='coreinventory'
        )
        cursor = conn.cursor(dictionary=True)
        
        # Check if testuser was created
        cursor.execute("SELECT id, username, email, role FROM users WHERE username = %s", ("testuser123",))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user:
            print(f"✅ User found in database!")
            print(f"   ID: {user['id']}")
            print(f"   Username: {user['username']}")
            print(f"   Email: {user['email']}")
            print(f"   Role: {user['role']}")
            return True
        else:
            print(f"❌ User NOT found in database!")
            print(f"   Username searched: testuser123")
            print(f"   Check if signup actually committed to DB")
            return False
            
    except Exception as e:
        print(f"❌ Database check error: {e}")
        return False

if __name__ == '__main__':
    print("\n🚀 Signup Test Script\n")
    
    if test_signup():
        verify_user_in_db()
    
    print("\n" + "="*60)

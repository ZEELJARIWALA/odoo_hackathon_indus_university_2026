from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
import datetime
import random
import os

app = Flask(__name__)
CORS(app)

# ============ CONFIGURATION ============
# SMTP Email Configuration (Gmail)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', True)
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'zeeljariwala.co23d2@scet.ac.in')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'lkek ymvv zyiq nknr')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'zeeljariwala.co23d2@scet.ac.in')

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'core-inventory-secret-key-2026')
jwt = JWTManager(app)

# Mail service initialization
try:
    mail = Mail(app)
except Exception as e:
    print(f"⚠️ Mail configuration error: {e}")
    mail = None

# OTP Storage (Email -> {otp, expire_time, attempts})
otp_storage = {}

# ============ DATABASE CONFIGURATION ============
# MySQL Connection Configuration - XAMPP Setup
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'coreinventory'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'autocommit': False
}

def get_db_connection():
    """
    Establish connection to MySQL database
    Returns: connection object or None
    """
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"❌ MySQL Connection Error: {e}")
        print(f"   Config: host={db_config['host']}, user={db_config['user']}, db={db_config['database']}")
        return None

def test_db_connection():
    """Test database connection and show status"""
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        return True, f"Connected to MySQL {version[0]}"
    return False, "Failed to connect to MySQL"

# ============ HEALTH CHECK ============
@app.route('/health', methods=['GET'])
def health_check():
    db_status, db_message = test_db_connection()
    return jsonify({
        "status": "✅ Backend running" if db_status else "⚠️ Backend running (DB offline)",
        "database": db_message,
        "api_version": "1.0"
    }), 200 if db_status else 503

# AUTH: Signup
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({"error": "Missing required fields (username, email, password)"}), 400
    
    conn = get_db_connection()
    if not conn: 
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        
        # Hash password
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        hashed_str = hashed.decode('utf-8')
        
        # Insert user
        query = "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s)"
        values = (data['username'], data['email'], hashed_str, data.get('role', 'staff'))
        
        cursor.execute(query, values)
        conn.commit()
        
        print(f"✅ User created: {data['username']} ({data['email']})")
        
        cursor.close()
        conn.close()
        return jsonify({"message": "User created successfully", "username": data['username']}), 201
        
    except mysql.connector.Error as e:
        conn.rollback()
        error_msg = str(e)
        print(f"❌ Database error during signup: {error_msg}")
        
        if 'Duplicate entry' in error_msg or 'duplicate' in error_msg.lower():
            return jsonify({"error": "Username or Email already exists"}), 400
        else:
            return jsonify({"error": f"Database error: {error_msg}"}), 400
            
    except Exception as e:
        conn.rollback()
        error_msg = str(e)
        print(f"❌ Signup error: {error_msg}")
        return jsonify({"error": f"Signup failed: {error_msg}"}), 500
    
    finally:
        try:
            cursor.close()
        except:
            pass
        try:
            conn.close()
        except:
            pass

# AUTH: Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'password' not in data:
        return jsonify({"error": "Missing password"}), 400
    
    if not data.get('email') and not data.get('username'):
        return jsonify({"error": "Missing email or username"}), 400
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    # Try login with email OR username
    login_input = data.get('email') or data.get('username')
    cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", (login_input, login_input))
    user = cursor.fetchone()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
        access_token = create_access_token(
            identity=str(user['id']), 
            expires_delta=datetime.timedelta(days=1)
        )
        cursor.close()
        conn.close()
        return jsonify({
            "token": access_token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "role": user['role']
            }
        }), 200
    
    cursor.close()
    conn.close()
    return jsonify({"error": "Invalid credentials"}), 401

# ============ OTP-BASED LOGIN (Step 1-3) ============

# STEP 1: Request OTP Login
@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    """
    Step 1: User enters email, backend sends OTP to email
    Request: {"email": "user@example.com"}
    """
    data = request.json
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400
    
    email = data['email'].lower().strip()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            # Don't reveal if email exists (security)
            return jsonify({"message": "If email exists, OTP will be sent", "email": email}), 200
        
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP with expiration (10 minutes) and attempts counter
        otp_storage[email] = {
            "otp": otp,
            "expire": datetime.datetime.now() + datetime.timedelta(minutes=10),
            "attempts": 0,
            "user_id": user['id'],
            "username": user['username']
        }
        
        # Send OTP via email
        if mail:
            try:
                msg = Message(
                    "🔐 CoreInventory Login OTP",
                    recipients=[email]
                )
                msg.body = f"""
Hello {user['username']},

Your CoreInventory Login OTP is: {otp}

This code will expire in 10 minutes.

⚠️ Never share this code with anyone.

---
CoreInventory ERP System 2026
                """
                mail.send(msg)
                print(f"✅ OTP sent to {email}: {otp}")
            except Exception as e:
                print(f"⚠️ Email sending failed: {e}")
                # For development: still return OTP in response
                return jsonify({
                    "message": "OTP sent (check email)",
                    "email": email,
                    "debug_otp": otp  # Remove in production
                }), 200
        
        return jsonify({
            "message": "OTP sent to your email",
            "email": email,
            "expires_in": "10 minutes"
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# STEP 2: Verify OTP and Login
@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    """
    Step 2: User enters OTP, backend verifies and returns JWT token
    Request: {"email": "user@example.com", "otp": "123456"}
    """
    data = request.json
    if not data or not all(k in data for k in ('email', 'otp')):
        return jsonify({"error": "Email and OTP are required"}), 400
    
    email = data['email'].lower().strip()
    otp_code = str(data['otp']).strip()
    
    # Check if OTP exists
    if email not in otp_storage:
        return jsonify({"error": "OTP not found. Request a new OTP"}), 400
    
    otp_data = otp_storage[email]
    
    # Check OTP attempts (max 5)
    if otp_data['attempts'] >= 5:
        del otp_storage[email]
        return jsonify({"error": "Too many failed attempts. Request new OTP"}), 429
    
    # Check OTP expiration
    if datetime.datetime.now() > otp_data['expire']:
        del otp_storage[email]
        return jsonify({"error": "OTP has expired. Request a new OTP"}), 400
    
    # Verify OTP
    if otp_data['otp'] != otp_code:
        otp_data['attempts'] += 1
        return jsonify({
            "error": "Invalid OTP",
            "attempts_left": 5 - otp_data['attempts']
        }), 400
    
    # OTP verified - Create JWT token
    try:
        user_id = otp_data['user_id']
        username = otp_data['username']
        
        # Create access token
        access_token = create_access_token(
            identity=str(user_id),
            expires_delta=datetime.timedelta(hours=24)
        )
        
        # Clear used OTP
        del otp_storage[email]
        
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

# STEP 3: Reset Password with OTP
@app.route('/api/auth/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    """
    Reset password using OTP verification
    Request: {"email": "user@example.com", "otp": "123456", "new_password": "NewPass@123"}
    """
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json
    if not data or not all(k in data for k in ('email', 'otp', 'new_password')):
        return jsonify({"error": "Email, OTP, and new password are required"}), 400
    
    email = data['email'].lower().strip()
    otp_code = str(data['otp']).strip()
    new_password = data['new_password']
    
    # Validate password
    if len(new_password) < 6 or len(new_password) > 20:
        return jsonify({"error": "Password must be 6-20 characters"}), 400
    
    # Check if OTP exists
    if email not in otp_storage:
        return jsonify({"error": "OTP not found. Request a new OTP"}), 400
    
    otp_data = otp_storage[email]
    
    # Check OTP attempts (max 5)
    if otp_data['attempts'] >= 5:
        del otp_storage[email]
        return jsonify({"error": "Too many failed attempts. Request new OTP"}), 429
    
    # Check OTP expiration
    if datetime.datetime.now() > otp_data['expire']:
        del otp_storage[email]
        return jsonify({"error": "OTP has expired. Request a new OTP"}), 400
    
    # Verify OTP
    if otp_data['otp'] != otp_code:
        otp_data['attempts'] += 1
        return jsonify({
            "error": "Invalid OTP",
            "attempts_left": 5 - otp_data['attempts']
        }), 400
    
    # OTP verified - Update password
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        
        # Hash new password
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password
        query = "UPDATE users SET password_hash = %s WHERE email = %s"
        cursor.execute(query, (password_hash, email))
        conn.commit()
        
        print(f"✅ Password reset successful for: {email}")
        
        # Clear used OTP
        del otp_storage[email]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "message": "Password reset successful. Please login with new password"
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Password reset failed: {str(e)}"}), 500

# STEP 3: Verify JWT Token (Protected Routes)
@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Protected route: Get current logged-in user info
    Requires: Authorization: Bearer <token>
    """
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, username, email, role, location_id, warehouse_id, created_at
            FROM users WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Logout
@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout endpoint - Client should discard token
    """
    return jsonify({"message": "Logout successful"}), 200

# API Route: Get all products
@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return jsonify(products), 200

# API Route: Create a new product
@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    data = request.json
    if not data or 'name' not in data or 'sku' not in data:
        return jsonify({"error": "Name and SKU are required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        query = """INSERT INTO products 
                   (name, sku, category, unit_of_measure, current_stock, min_stock_level, description) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        values = (
            data['name'], 
            data['sku'], 
            data.get('category', ''), 
            data.get('uom', 'Unit'), 
            int(data.get('current_stock', 0)),
            int(data.get('min_stock_level', 10)),
            data.get('description', '')
        )
        cursor.execute(query, values)
        conn.commit()
        new_id = cursor.lastrowid
        
        print(f"✅ Product created: {data['name']} (ID: {new_id})")
        
        cursor.close()
        conn.close()
        return jsonify({
            "message": "Product created successfully", 
            "id": new_id,
            "product": {
                "id": new_id,
                "name": data['name'],
                "sku": data['sku'],
                "category": data.get('category', ''),
                "uom": data.get('uom', 'Unit'),
                "current_stock": int(data.get('current_stock', 0))
            }
        }), 201
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 400

# API Route: Create a Stock Move (Receipt / Delivery / Internal)
@app.route('/api/stock-moves', methods=['GET', 'POST'])
@jwt_required()
def stock_moves():
    if request.method == 'GET':
        """Get all stock moves"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT sm.*, p.name as product_name, fl.name as from_location, tl.name as to_location
                FROM stock_moves sm
                LEFT JOIN products p ON sm.product_id = p.id
                LEFT JOIN locations fl ON sm.from_location_id = fl.id
                LEFT JOIN locations tl ON sm.to_location_id = tl.id
                ORDER BY sm.id DESC
            """)
            moves = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(moves), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        """Create stock move and update inventory"""
        data = request.json
        required_fields = ['product_id', 'to_location_id', 'from_location_id', 'quantity']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields: product_id, locations, or quantity"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor()
            
            # Create stock move record
            reference = data.get('reference', 'Stock Move')
            move_type = data.get('type', 'internal')
            
            query = """INSERT INTO stock_moves 
                       (product_id, from_location_id, to_location_id, quantity, status, reference, type) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            values = (
                data['product_id'], 
                data['from_location_id'], 
                data['to_location_id'], 
                data['quantity'], 
                'done',
                reference,
                move_type
            )
            cursor.execute(query, values)
            new_id = cursor.lastrowid
            
            # If it's a receipt, update product stock
            if move_type == 'receipt':
                update_query = "UPDATE products SET current_stock = current_stock + %s WHERE id = %s"
                cursor.execute(update_query, (int(data['quantity']), int(data['product_id'])))
                print(f"✅ Receipt: Product {data['product_id']} stock +{data['quantity']} units")
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({
                "message": "Stock move created successfully", 
                "id": new_id,
                "stock_updated": move_type == 'receipt'
            }), 201
        except Exception as e:
            conn.rollback()
            print(f"❌ Stock move error: {str(e)}")
            return jsonify({"error": str(e)}), 400

# ============ WAREHOUSES & LOCATIONS ENDPOINTS ============

@app.route('/api/warehouses', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def warehouses():
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        """Get all warehouses"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM warehouses")
            result = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(result or []), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        """Create warehouse"""
        data = request.json
        if not data or 'name' not in data:
            return jsonify({"error": "Warehouse name is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor()
            query = "INSERT INTO warehouses (name, location, contact_person, phone) VALUES (%s, %s, %s, %s)"
            values = (
                data['name'],
                data.get('location', ''),
                data.get('contact_person', ''),
                data.get('phone', '')
            )
            cursor.execute(query, values)
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({"message": "Warehouse created", "id": new_id}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

@app.route('/api/locations', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def locations():
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        """Get all locations"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM locations")
            result = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(result or []), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        """Create location"""
        data = request.json
        if not data or 'name' not in data:
            return jsonify({"error": "Location name is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor()
            query = "INSERT INTO locations (name, warehouse_id, location_type) VALUES (%s, %s, %s)"
            values = (
                data['name'],
                data.get('warehouse_id', 1),
                data.get('location_type', 'Rack')
            )
            cursor.execute(query, values)
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({"message": "Location created", "id": new_id}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

# ============ STOCK LEDGER (Audit Trail) ============

@app.route('/api/stock-ledger', methods=['GET'])
@jwt_required()
def get_stock_ledger():
    """Get stock ledger history - all movements logged"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT sl.*, p.name as product_name, p.sku, u.username as created_by_user
            FROM stock_ledger sl
            LEFT JOIN products p ON sl.product_id = p.id
            LEFT JOIN users u ON sl.created_by = u.id
            ORDER BY sl.created_at DESC
            LIMIT 500
        """)
        ledger = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(ledger or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def log_stock_movement(conn, product_id, quantity_change, movement_type, reference, from_location, to_location, reason=''):
    """
    Log stock movement in ledger
    Types: receipt, delivery, transfer, adjustment
    """
    try:
        cursor = conn.cursor()
        user_id = get_jwt_identity()
        
        query = """
            INSERT INTO stock_ledger 
            (product_id, quantity_change, movement_type, reference, from_location, to_location, reason, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (product_id, quantity_change, movement_type, reference, from_location, to_location, reason, user_id)
        cursor.execute(query, values)
        conn.commit()
        
        print(f"✅ Ledger: {movement_type} - Product {product_id}, Qty: {quantity_change}, Ref: {reference}")
        return True
    except Exception as e:
        print(f"❌ Ledger error: {str(e)}")
        return False

# ============ DELIVERY ORDERS (Outgoing Goods) ============

@app.route('/api/deliveries', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def deliveries():
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        """Get all delivery orders"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT sm.*, p.name as product_name, p.sku, l.name as to_location_name
                FROM stock_moves sm
                LEFT JOIN products p ON sm.product_id = p.id
                LEFT JOIN locations l ON sm.to_location_id = l.id
                WHERE sm.type = 'delivery'
                ORDER BY sm.id DESC
            """)
            moves = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(moves or []), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        """Create delivery order"""
        data = request.json
        required = ['product_id', 'quantity', 'customer']
        if not all(field in data for field in required):
            return jsonify({"error": f"Missing required fields: {', '.join(required)}"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Check stock availability
            cursor.execute("SELECT current_stock FROM products WHERE id = %s", (data['product_id'],))
            product = cursor.fetchone()
            
            if not product or product['current_stock'] < int(data['quantity']):
                cursor.close()
                conn.close()
                return jsonify({"error": "Insufficient stock available"}), 400
            
            # Create delivery order
            query = """
                INSERT INTO stock_moves 
                (product_id, from_location_id, to_location_id, quantity, status, reference, type)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                data['product_id'],
                1,  # From main warehouse
                data.get('to_location_id', 1),
                -int(data['quantity']),  # Negative for outgoing
                'done',
                data.get('reference', f"DEL-{data['product_id']}"),
                'delivery'
            )
            cursor.execute(query, values)
            
            # Decrease stock
            cursor.execute(
                "UPDATE products SET current_stock = current_stock - %s WHERE id = %s",
                (int(data['quantity']), data['product_id'])
            )
            
            conn.commit()
            new_id = cursor.lastrowid
            
            # Log in ledger
            log_stock_movement(conn, data['product_id'], -int(data['quantity']), 
                             'delivery', data.get('reference', f"DEL-{data['product_id']}"),
                             'Main Warehouse', data.get('customer', 'Customer'), 
                             f"Delivery to {data.get('customer', 'Customer')}")
            
            cursor.close()
            conn.close()
            
            print(f"✅ Delivery: Product {data['product_id']}, Qty: -{data['quantity']}")
            return jsonify({"message": "Delivery order created", "id": new_id, "stock_decreased": True}), 201
        except Exception as e:
            conn.rollback()
            print(f"❌ Delivery error: {str(e)}")
            return jsonify({"error": str(e)}), 400

# ============ INTERNAL TRANSFERS ============

@app.route('/api/transfers', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def transfers():
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        """Get all internal transfers"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT sm.*, p.name as product_name, p.sku, 
                       fl.name as from_location_name, tl.name as to_location_name
                FROM stock_moves sm
                LEFT JOIN products p ON sm.product_id = p.id
                LEFT JOIN locations fl ON sm.from_location_id = fl.id
                LEFT JOIN locations tl ON sm.to_location_id = tl.id
                WHERE sm.type = 'transfer'
                ORDER BY sm.id DESC
            """)
            transfers = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(transfers or []), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        """Create internal transfer - moves stock between locations"""
        data = request.json
        required = ['product_id', 'from_location_id', 'to_location_id', 'quantity']
        if not all(field in data for field in required):
            return jsonify({"error": f"Missing required fields"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Check stock availability
            cursor.execute("SELECT current_stock FROM products WHERE id = %s", (data['product_id'],))
            product = cursor.fetchone()
            
            if not product or product['current_stock'] < int(data['quantity']):
                cursor.close()
                conn.close()
                return jsonify({"error": "Insufficient stock for transfer"}), 400
            
            # Create transfer record (doesn't change total stock, just records movement)
            query = """
                INSERT INTO stock_moves 
                (product_id, from_location_id, to_location_id, quantity, status, reference, type)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                data['product_id'],
                data['from_location_id'],
                data['to_location_id'],
                data['quantity'],
                'done',
                data.get('reference', f"TRF-{data['product_id']}"),
                'transfer'
            )
            cursor.execute(query, values)
            
            conn.commit()
            new_id = cursor.lastrowid
            
            # Log in ledger (0 quantity change - internal only)
            cursor.execute("SELECT name FROM locations WHERE id = %s", (data['from_location_id'],))
            from_loc = cursor.fetchone()['name'] if cursor.fetchone() else 'Unknown'
            
            cursor.execute("SELECT name FROM locations WHERE id = %s", (data['to_location_id'],))
            to_loc = cursor.fetchone()['name'] if cursor.fetchone() else 'Unknown'
            
            log_stock_movement(conn, data['product_id'], 0, 'transfer',
                             data.get('reference', f"TRF-{data['product_id']}"),
                             from_loc, to_loc, 'Internal transfer')
            
            cursor.close()
            conn.close()
            
            print(f"✅ Transfer: Product {data['product_id']}, Qty: {data['quantity']}, From: {data['from_location_id']} → {data['to_location_id']}")
            return jsonify({"message": "Internal transfer created", "id": new_id, "total_stock_unchanged": True}), 201
        except Exception as e:
            conn.rollback()
            print(f"❌ Transfer error: {str(e)}")
            return jsonify({"error": str(e)}), 400

# ============ STOCK ADJUSTMENTS (Physical Count) ============

@app.route('/api/adjustments', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def adjustments():
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        """Get all stock adjustments"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT sm.*, p.name as product_name, p.sku, p.current_stock
                FROM stock_moves sm
                LEFT JOIN products p ON sm.product_id = p.id
                WHERE sm.type = 'adjustment'
                ORDER BY sm.id DESC
            """)
            adjustments = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(adjustments or []), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        """Create stock adjustment"""
        data = request.json
        required = ['product_id', 'physical_count', 'reason']
        if not all(field in data for field in required):
            return jsonify({"error": f"Missing required fields"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Get current system stock
            cursor.execute("SELECT current_stock FROM products WHERE id = %s", (data['product_id'],))
            product = cursor.fetchone()
            
            if not product:
                cursor.close()
                conn.close()
                return jsonify({"error": "Product not found"}), 404
            
            system_stock = product['current_stock']
            physical_count = int(data['physical_count'])
            difference = physical_count - system_stock
            
            # Update stock to physical count
            cursor.execute(
                "UPDATE products SET current_stock = %s WHERE id = %s",
                (physical_count, data['product_id'])
            )
            
            # Create adjustment record
            query = """
                INSERT INTO stock_moves 
                (product_id, from_location_id, to_location_id, quantity, status, reference, type)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                data['product_id'],
                1,
                1,
                difference,
                'done',
                data.get('reference', f"ADJ-{data['product_id']}"),
                'adjustment'
            )
            cursor.execute(query, values)
            
            conn.commit()
            new_id = cursor.lastrowid
            
            # Log in ledger
            log_stock_movement(conn, data['product_id'], difference, 'adjustment',
                             data.get('reference', f"ADJ-{data['product_id']}"),
                             'Physical Count', 'System Adjustment',
                             f"{data['reason']} (System: {system_stock} → Physical: {physical_count})")
            
            cursor.close()
            conn.close()
            
            print(f"✅ Adjustment: Product {data['product_id']}, System: {system_stock} → Physical: {physical_count} (Diff: {difference})")
            return jsonify({
                "message": "Stock adjustment completed",
                "id": new_id,
                "system_stock_before": system_stock,
                "physical_count": physical_count,
                "difference": difference
            }), 201
        except Exception as e:
            conn.rollback()
            print(f"❌ Adjustment error: {str(e)}")
            return jsonify({"error": str(e)}), 400

# ============ LOW STOCK ALERTS ============

@app.route('/api/alerts/low-stock', methods=['GET'])
@jwt_required()
def low_stock_alerts():
    """Get products with stock below minimum level"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, name, sku, current_stock, min_stock_level, 
                   (min_stock_level - current_stock) as shortage
            FROM products
            WHERE current_stock < min_stock_level
            ORDER BY shortage DESC
        """)
        low_stock = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            "low_stock_items": low_stock or [],
            "total_alerts": len(low_stock or [])
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ STOCK SUMMARY (Dashboard Stats) ============

@app.route('/api/stock-summary', methods=['GET'])
@jwt_required()
def stock_summary():
    """Get inventory overview"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Total products
        cursor.execute("SELECT COUNT(*) as total FROM products")
        total_products = cursor.fetchone()['total']
        
        # Total stock value
        cursor.execute("SELECT SUM(current_stock) as total FROM products")
        total_stock = cursor.fetchone()['total'] or 0
        
        # Low stock count
        cursor.execute("SELECT COUNT(*) as total FROM products WHERE current_stock < min_stock_level")
        low_stock_count = cursor.fetchone()['total']
        
        # Recent movements (last 24h)
        cursor.execute("""
            SELECT COUNT(*) as total FROM stock_moves 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        """)
        recent_moves = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "total_products": total_products,
            "total_stock_units": total_stock,
            "low_stock_alerts": low_stock_count,
            "movements_last_24h": recent_moves
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)

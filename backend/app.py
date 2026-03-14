from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
import datetime
import random

app = Flask(__name__)
CORS(app)

# SMTP Email Configuration (Using Gmail as example)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'zeeljariwala.co23d2@scet.ac.in' # REPLACE THIS
app.config['MAIL_PASSWORD'] = 'lkek ymvv zyiq nknr'    # REPLACE THIS
app.config['MAIL_DEFAULT_SENDER'] = 'zeeljariwala.co23d2@scet.ac.in'

mail = Mail(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'core-inventory-secret-key-123' # Change in production
jwt = JWTManager(app)

# Mock storage for OTPs (In real app, use a DB table or Redis)
otp_storage = {}

# MySQL Connection Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'core_inventory'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Health Check Route
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Backend is running and connected to MySQL"}), 200

# AUTH: Signup
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({"error": "Missing required fields"}), 400
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    try:
        cursor = conn.cursor()
        # Hash password
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        query = "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (data['username'], data['email'], hashed.decode('utf-8'), data.get('role', 'staff')))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User created successfully"}), 201
    except mysql.connector.Error as e:
        return jsonify({"error": "Username or Email already exists"}), 400

# AUTH: Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({"error": "Missing email or password"}), 400
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
    user = cursor.fetchone()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
        access_token = create_access_token(
            identity=str(user['id']), 
            expires_delta=datetime.timedelta(days=1)
        )
        return jsonify({
            "token": access_token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "role": user['role']
            }
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# AUTH: Step 1 - Request OTP
@app.route('/api/auth/request-otp', methods=['POST'])
def request_otp():
    data = request.json
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({"error": "User with this email not found"}), 404
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_storage[data['email']] = {
        "otp": otp, 
        "expire": datetime.datetime.now() + datetime.timedelta(minutes=10)
    }
    
    # Send actual email
    try:
        msg = Message("CoreInventory - Password Reset OTP",
                      recipients=[data['email']])
        msg.body = f"Your CoreInventory Password Reset OTP is: {otp}\n\nThis code will expire in 10 minutes.\n\nCoreInventory ERP System @ 2026"
        mail.send(msg)
    except Exception as e:
        print(f"FAILED TO SEND EMAIL: {e}")
        # Still return success for MVP debug purposes
        return jsonify({"message": f"OTP generated: {otp} (Email failed, check terminal)"}), 200

    return jsonify({"message": f"OTP successfully sent to {data['email']}"}), 200

# AUTH: Step 2 - Reset Password with OTP
@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    if not data or not all(k in data for k in ('email', 'otp', 'new_password')):
        return jsonify({"error": "Missing required fields (email, otp, new_password)"}), 400
    
    email = data['email']
    # Verify OTP
    if email not in otp_storage or otp_storage[email]['otp'] != data['otp']:
        return jsonify({"error": "Invalid or expired OTP"}), 400
    
    if datetime.datetime.now() > otp_storage[email]['expire']:
        del otp_storage[email]
        return jsonify({"error": "OTP has expired"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    try:
        cursor = conn.cursor()
        hashed = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
        cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s", (hashed.decode('utf-8'), email))
        conn.commit()
        
        # Clear used OTP
        del otp_storage[email]
        
        cursor.close()
        conn.close()
        return jsonify({"message": "Password updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 400

# API Route: Get all products
@app.route('/api/products', methods=['GET'])
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
def create_product():
    data = request.json
    if not data or 'name' not in data or 'sku' not in data:
        return jsonify({"error": "Name and SKU are required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        query = "INSERT INTO products (name, sku, category, uom, min_stock_level) VALUES (%s, %s, %s, %s, %s)"
        values = (
            data['name'], 
            data['sku'], 
            data.get('category', ''), 
            data.get('uom', 'Units'), 
            data.get('min_stock_level', 10)
        )
        cursor.execute(query, values)
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message": "Product created", "id": new_id}), 201
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 400

# API Route: Create a Stock Move (Receipt / Delivery / Internal)
@app.route('/api/stock-moves', methods=['POST'])
def create_stock_move():
    data = request.json
    required_fields = ['product_id', 'to_location_id', 'from_location_id', 'quantity']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing product_id, locations, or quantity"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        # Reference is something like 'Receipt-101' or 'Delivery-202'
        reference = data.get('reference', 'Stock Move')
        
        query = "INSERT INTO stock_moves (product_id, from_location_id, to_location_id, quantity, status, reference) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (
            data['product_id'], 
            data['from_location_id'], 
            data['to_location_id'], 
            data['quantity'], 
            'done', 
            reference
        )
        cursor.execute(query, values)
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message": "Stock processed successfully", "id": new_id}), 201
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)

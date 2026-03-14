from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

USERS_DB = [
    {
        'id': 1,
        'email': 'admin@coreinventory.com',
        'name': 'Admin User',
        'password': generate_password_hash('admin123')
    }
]

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(
                token,
                os.getenv('JWT_SECRET', 'your_secret_key_change_in_production'),
                algorithms=['HS256']
            )
            current_user = data['user_id']
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    if any(u['email'] == data['email'] for u in USERS_DB):
        return jsonify({'error': 'User already exists'}), 400
    
    new_user = {
        'id': len(USERS_DB) + 1,
        'email': data['email'],
        'name': data.get('name', data['email'].split('@')[0]),
        'password': generate_password_hash(data['password'])
    }
    
    USERS_DB.append(new_user)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {'id': new_user['id'], 'email': new_user['email'], 'name': new_user['name']}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = next((u for u in USERS_DB if u['email'] == data['email']), None)
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    token = jwt.encode({
        'user_id': user['id'],
        'email': user['email'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, os.getenv('JWT_SECRET', 'your_secret_key_change_in_production'), algorithm='HS256')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {'id': user['id'], 'email': user['email'], 'name': user['name']}
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({'message': 'Logout successful'}), 200

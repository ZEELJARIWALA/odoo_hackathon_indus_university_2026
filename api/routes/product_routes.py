from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import os

product_bp = Blueprint('products', __name__, url_prefix='/api/products')

PRODUCTS_DB = [
    {'id': 1, 'name': 'Widget A', 'sku': 'SKU-001', 'quantity': 500, 'reorder_point': 100, 'category': 'Widgets', 'unit_price': 25.50},
    {'id': 2, 'name': 'Widget B', 'sku': 'SKU-002', 'quantity': 150, 'reorder_point': 50, 'category': 'Widgets', 'unit_price': 35.00},
    {'id': 3, 'name': 'Gadget C', 'sku': 'SKU-003', 'quantity': 30, 'reorder_point': 75, 'category': 'Gadgets', 'unit_price': 85.50},
    {'id': 4, 'name': 'Device D', 'sku': 'SKU-004', 'quantity': 0, 'reorder_point': 100, 'category': 'Devices', 'unit_price': 150.00}
]

next_id = 5

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

@product_bp.route('', methods=['GET'])
@token_required
def get_products(current_user):
    category = request.args.get('category')
    if category:
        products = [p for p in PRODUCTS_DB if p['category'] == category]
    else:
        products = PRODUCTS_DB
    return jsonify(products), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
@token_required
def get_product(current_user, product_id):
    product = next((p for p in PRODUCTS_DB if p['id'] == product_id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product), 200

@product_bp.route('', methods=['POST'])
@token_required
def create_product(current_user):
    global next_id
    data = request.json
    
    if not data.get('name') or not data.get('sku'):
        return jsonify({'error': 'Name and SKU are required'}), 400
    
    new_product = {
        'id': next_id,
        'name': data['name'],
        'sku': data['sku'],
        'quantity': data.get('quantity', 0),
        'reorder_point': data.get('reorder_point', 50),
        'category': data.get('category', 'Uncategorized'),
        'unit_price': data.get('unit_price', 0.0)
    }
    
    PRODUCTS_DB.append(new_product)
    next_id += 1
    
    return jsonify({'message': 'Product created', 'product': new_product}), 201

@product_bp.route('/<int:product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    product = next((p for p in PRODUCTS_DB if p['id'] == product_id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.json
    product.update({k: v for k, v in data.items() if k != 'id'})
    
    return jsonify({'message': 'Product updated', 'product': product}), 200

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    global PRODUCTS_DB
    product = next((p for p in PRODUCTS_DB if p['id'] == product_id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    PRODUCTS_DB = [p for p in PRODUCTS_DB if p['id'] != product_id]
    
    return jsonify({'message': 'Product deleted'}), 200

@product_bp.route('/<int:product_id>/quantity', methods=['PUT'])
@token_required
def update_quantity(current_user, product_id):
    product = next((p for p in PRODUCTS_DB if p['id'] == product_id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.json
    if 'quantity' not in data:
        return jsonify({'error': 'Quantity is required'}), 400
    
    product['quantity'] = data['quantity']
    return jsonify({'message': 'Quantity updated', 'product': product}), 200

from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import os

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

PRODUCTS_DB = [
    {'id': 1, 'name': 'Widget A', 'sku': 'SKU-001', 'quantity': 500, 'reorder_point': 100, 'category': 'Widgets'},
    {'id': 2, 'name': 'Widget B', 'sku': 'SKU-002', 'quantity': 150, 'reorder_point': 50, 'category': 'Widgets'},
    {'id': 3, 'name': 'Gadget C', 'sku': 'SKU-003', 'quantity': 30, 'reorder_point': 75, 'category': 'Gadgets'},
    {'id': 4, 'name': 'Device D', 'sku': 'SKU-004', 'quantity': 0, 'reorder_point': 100, 'category': 'Devices'}
]

TRANSACTIONS_DB = [
    {'id': 1, 'type': 'receipt', 'product': 'Widget A', 'quantity': 100, 'date': '2026-03-14'},
    {'id': 2, 'type': 'delivery', 'product': 'Widget B', 'quantity': 50, 'date': '2026-03-13'},
    {'id': 3, 'type': 'adjustment', 'product': 'Gadget C', 'quantity': -10, 'date': '2026-03-12'}
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

@dashboard_bp.route('/kpis', methods=['GET'])
@token_required
def get_kpis(current_user):
    total_quantity = sum(p['quantity'] for p in PRODUCTS_DB)
    low_stock = [p for p in PRODUCTS_DB if p['quantity'] < p['reorder_point']]
    out_of_stock = [p for p in PRODUCTS_DB if p['quantity'] == 0]
    
    return jsonify({
        'totalStockValue': total_quantity * 50,
        'totalItems': total_quantity,
        'productsInStock': len(PRODUCTS_DB),
        'lowStockProducts': len(low_stock),
        'outOfStockProducts': len(out_of_stock),
        'pendingReceipts': 3,
        'lastUpdated': __import__('datetime').datetime.now().isoformat()
    }), 200

@dashboard_bp.route('/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    return jsonify(TRANSACTIONS_DB[::-1][-10:]), 200

@dashboard_bp.route('/low-stock', methods=['GET'])
@token_required
def get_low_stock(current_user):
    low_stock = [
        {
            **p,
            'daysUntilStockout': max(1, int(p['quantity'] / (5 + (p['id'] % 3)))),
            'recommendedOrder': p['reorder_point'] * 2 - p['quantity'],
            'risk': 'CRITICAL' if p['quantity'] == 0 else 'HIGH'
        }
        for p in PRODUCTS_DB if p['quantity'] < p['reorder_point']
    ]
    return jsonify(low_stock), 200

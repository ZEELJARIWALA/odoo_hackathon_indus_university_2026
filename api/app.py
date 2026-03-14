import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'your_secret_key_change_in_production')
app.config['DEBUG'] = os.getenv('DEBUG', 'False') == 'True'

from routes import auth_routes, dashboard_routes, product_routes

app.register_blueprint(auth_routes.auth_bp)
app.register_blueprint(dashboard_routes.dashboard_bp)
app.register_blueprint(product_routes.product_bp)

@app.route('/health', methods=['GET'])
def health():
    from datetime import datetime
    return {
        'status': 'ok',
        'message': 'CoreInventory API running',
        'timestamp': datetime.now().isoformat()
    }, 200

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Resource not found'}, 404

@app.errorhandler(500)
def server_error(error):
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    print('\n' + '='*60)
    print('CoreInventory API (Python Flask)')
    print('='*60)
    print('Server: http://localhost:5000')
    print('Health: http://localhost:5000/health')
    print('='*60)
    print('\nTest Account:')
    print('  Email: admin@coreinventory.com')
    print('  Password: admin123\n')
    
    app.run(debug=True, host='0.0.0.0', port=5000)

"""
AquaHub Development Server
Simple Flask server to run the website locally
"""

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Configure static files
app.static_folder = 'assets'

@app.route('/')
def index():
    """Serve the main index.html page"""
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login():
    """Serve the login page"""
    return send_from_directory('.', 'login.html')

@app.route('/buyer-dashboard')
def buyer_dashboard():
    """Serve the buyer dashboard"""
    return send_from_directory('.', 'buyer-dashboard.html')

@app.route('/vendor-dashboard')
def vendor_dashboard():
    """Serve the vendor dashboard"""
    return send_from_directory('.', 'vendor-dashboard.html')

@app.route('/coming-soon')
def coming_soon():
    """Serve the coming soon page"""
    return send_from_directory('.', 'coming-soon.html')

@app.route('/stp-coming-soon')
def stp_coming_soon():
    """Serve the STP coming soon page"""
    return send_from_directory('.', 'stp-coming-soon.html')

# Serve CSS files
@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, images, etc.)"""
    if filename.endswith('.css'):
        return send_from_directory('.', filename, mimetype='text/css')
    elif filename.endswith('.js'):
        return send_from_directory('.', filename, mimetype='application/javascript')
    elif filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif')):
        return send_from_directory('.', filename)
    else:
        return send_from_directory('.', filename)

# Serve assets
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve asset files"""
    return send_from_directory('assets', filename)

# API endpoints for future database integration
@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AquaHub server is running',
        'version': '1.0.0'
    })

@app.route('/api/demo-login', methods=['POST'])
def demo_login():
    """Demo login endpoint"""
    data = request.get_json()
    user_type = data.get('userType', 'customer')
    
    if user_type == 'customer':
        return jsonify({
            'success': True,
            'user': {
                'id': 'demo_customer_001',
                'name': 'Demo Customer',
                'email': 'customer@demo.com',
                'userType': 'customer',
                'isDemo': True
            },
            'redirect': '/buyer-dashboard'
        })
    elif user_type == 'vendor':
        return jsonify({
            'success': True,
            'user': {
                'id': 'demo_vendor_001',
                'name': 'Demo Vendor',
                'email': 'vendor@demo.com',
                'userType': 'vendor',
                'isDemo': True
            },
            'redirect': '/vendor-dashboard'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid user type'
        }), 400

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    print("🚀 Starting AquaHub Development Server...")
    print("🌐 Your website will be available at:")
    print("   📱 Main Site: http://localhost:5000")
    print("   🔐 Login: http://localhost:5000/login")
    print("   👤 Customer Dashboard: http://localhost:5000/buyer-dashboard")
    print("   🚚 Vendor Dashboard: http://localhost:5000/vendor-dashboard")
    print("\n💡 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)

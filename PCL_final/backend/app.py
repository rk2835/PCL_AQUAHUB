"""
AquaHub Registration Backend
Flask application to handle customer and vendor registration
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'aquahub_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'port': os.getenv('DB_PORT', '5432')
}

def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        return None

def hash_password(password):
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/register/customer', methods=['POST'])
def register_customer():
    """Handle customer registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'postalCode']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cur.fetchone():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password
        password_hash = hash_password(data['password'])
        
        # Insert user
        user_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO users (id, email, password_hash, user_type)
            VALUES (%s, %s, %s, 'customer')
        """, (user_id, data['email'], password_hash))
        
        # Insert customer profile
        cur.execute("""
            INSERT INTO customer_profiles 
            (user_id, first_name, last_name, phone, date_of_birth, gender,
             address_line1, address_line2, city, state, postal_code, country,
             emergency_contact_name, emergency_contact_phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, data['firstName'], data['lastName'], data['phone'],
            data.get('dateOfBirth'), data.get('gender'),
            data['address'], data.get('address2', ''), data['city'], 
            data['state'], data['postalCode'], data.get('country', 'India'),
            data.get('emergencyContactName', ''), data.get('emergencyContactPhone', '')
        ))
        
        # Insert water requirements if provided
        if 'waterRequirements' in data:
            reqs = data['waterRequirements']
            cur.execute("""
                INSERT INTO customer_water_requirements
                (customer_id, required_quantity, frequency, preferred_delivery_days,
                 preferred_time_slots, water_type, storage_capacity, special_instructions)
                VALUES (
                    (SELECT id FROM customer_profiles WHERE user_id = %s),
                    %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                user_id, reqs.get('quantity', 5000), reqs.get('frequency', 'weekly'),
                reqs.get('preferredDays', []), reqs.get('preferredTimeSlots', []),
                reqs.get('waterType', 'potable'), reqs.get('storageCapacity'),
                reqs.get('specialInstructions', '')
            ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Customer registered successfully',
            'userId': user_id
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/register/vendor', methods=['POST'])
def register_vendor():
    """Handle vendor registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'businessName', 'contactPersonName', 'phone', 'businessAddress', 'city', 'state', 'postalCode']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cur.fetchone():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password
        password_hash = hash_password(data['password'])
        
        # Insert user
        user_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO users (id, email, password_hash, user_type)
            VALUES (%s, %s, %s, 'vendor')
        """, (user_id, data['email'], password_hash))
        
        # Insert vendor profile
        cur.execute("""
            INSERT INTO vendor_profiles 
            (user_id, business_name, contact_person_name, phone, alternate_phone,
             business_address_line1, business_address_line2, city, state, postal_code, country,
             business_type, years_in_business, license_number, tax_id,
             service_areas, tanker_capacity, delivery_radius_km)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, data['businessName'], data['contactPersonName'], data['phone'],
            data.get('alternatePhone', ''), data['businessAddress'], data.get('businessAddress2', ''),
            data['city'], data['state'], data['postalCode'], data.get('country', 'India'),
            data.get('businessType', ''), data.get('yearsInBusiness'), data.get('licenseNumber', ''),
            data.get('taxId', ''), data.get('serviceAreas', []), data.get('tankerCapacity', []),
            data.get('deliveryRadius', 50)
        ))
        
        # Insert vendor services if provided
        if 'services' in data and data['services']:
            for service in data['services']:
                cur.execute("""
                    INSERT INTO vendor_services
                    (vendor_id, service_name, water_type, tanker_capacity, price_per_liter,
                     minimum_order_quantity, available_days, available_time_slots, coverage_areas)
                    VALUES (
                        (SELECT id FROM vendor_profiles WHERE user_id = %s),
                        %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    user_id, service.get('serviceName', ''), service.get('waterType', 'potable'),
                    service.get('tankerCapacity', 5000), service.get('pricePerLiter', 1.50),
                    service.get('minimumOrder', 1000), service.get('availableDays', []),
                    service.get('availableTimeSlots', []), service.get('coverageAreas', [])
                ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Vendor registered successfully',
            'userId': user_id
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users (for testing)"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT u.id, u.email, u.user_type, u.created_at,
                   CASE 
                       WHEN u.user_type = 'customer' THEN cp.first_name || ' ' || cp.last_name
                       WHEN u.user_type = 'vendor' THEN vp.business_name
                   END as name
            FROM users u
            LEFT JOIN customer_profiles cp ON u.id = cp.user_id
            LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
            ORDER BY u.created_at DESC
        """)
        
        users = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({'users': users}), 200
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({'error': 'Failed to fetch users'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

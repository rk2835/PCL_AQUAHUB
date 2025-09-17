import sys
import os

print("Python version:", sys.version)
print("Current directory:", os.getcwd())

# Test basic imports
try:
    import psycopg2
    print("✅ psycopg2 installed successfully")
except ImportError as e:
    print("❌ psycopg2 not installed:", e)

try:
    import flask
    print("✅ Flask installed successfully")
except ImportError as e:
    print("❌ Flask not installed:", e)

try:
    import bcrypt
    print("✅ bcrypt installed successfully")
except ImportError as e:
    print("❌ bcrypt not installed:", e)

# Test database connection (if PostgreSQL is running)
try:
    from dotenv import load_dotenv
    load_dotenv()
    
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'aquahub'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'your_password_here')
    }
    
    print("\nTesting database connection...")
    print(f"Trying to connect to: {db_config['user']}@{db_config['host']}:{db_config['port']}/{db_config['database']}")
    
    if db_config['password'] == 'your_password_here':
        print("❌ Please update the DB_PASSWORD in backend/.env file")
    else:
        import psycopg2
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Database connection successful! PostgreSQL version: {version[0]}")
        
        # Check if aquahub database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'aquahub';")
        if cursor.fetchone():
            print("✅ AquaHub database exists")
            
            # Check if tables exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'customer_profiles', 'vendor_profiles');
            """)
            tables = cursor.fetchall()
            if tables:
                print(f"✅ Tables found: {[t[0] for t in tables]}")
            else:
                print("❌ Database tables not created yet. Run the SQL scripts first.")
        else:
            print("❌ AquaHub database doesn't exist. Run create_database.sql first.")
        
        conn.close()
        
except Exception as e:
    print(f"❌ Database connection failed: {e}")

print("\n" + "="*50)
print("SETUP STATUS:")
print("="*50)

if 'psycopg2' in locals() and 'flask' in locals() and 'bcrypt' in locals():
    print("✅ All Python dependencies installed")
else:
    print("❌ Some Python dependencies missing")

print("\nNext steps:")
print("1. Update the password in backend/.env")
print("2. Run the PostgreSQL setup scripts")
print("3. Start the Flask backend: python backend/app.py")

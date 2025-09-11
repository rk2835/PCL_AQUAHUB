"""
Database Connection Test Script for AquaHub
Tests PostgreSQL database connectivity and basic operations
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'aquahub'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '8431341723'),
    'port': os.getenv('DB_PORT', '5432')
}

def test_database_connection():
    """Test basic database connection"""
    print("🔧 Testing AquaHub Database Connection...")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"User: {DB_CONFIG['user']}")
    print(f"Port: {DB_CONFIG['port']}")
    print("-" * 50)
    
    try:
        # Test connection
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Database connection successful!")
        
        # Test basic query
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ PostgreSQL Version: {version['version']}")
        
        # Check if database exists and get current timestamp
        cursor.execute("SELECT current_timestamp;")
        timestamp = cursor.fetchone()
        print(f"✅ Current Database Time: {timestamp['current_timestamp']}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        print("\n💡 Possible solutions:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check if the database 'aquahub' exists")
        print("3. Verify username and password")
        print("4. Check if PostgreSQL is listening on port 5432")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_database_schema():
    """Test if required tables exist"""
    print("\n🗄️ Testing Database Schema...")
    print("-" * 50)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check for required tables
        required_tables = [
            'users',
            'customer_profiles', 
            'vendor_profiles',
            'orders',
            'tanker_types'
        ]
        
        for table in required_tables:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, (table,))
            
            exists = cursor.fetchone()['exists']
            status = "✅" if exists else "❌"
            print(f"{status} Table '{table}': {'EXISTS' if exists else 'NOT FOUND'}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Schema check failed: {e}")
        return False

def test_database_operations():
    """Test basic CRUD operations"""
    print("\n🔬 Testing Database Operations...")
    print("-" * 50)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Test if users table exists and try a simple query
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        """)
        
        if cursor.fetchone()['exists']:
            print("✅ Users table exists")
            
            # Count existing users
            cursor.execute("SELECT COUNT(*) as count FROM users;")
            user_count = cursor.fetchone()['count']
            print(f"✅ Current users in database: {user_count}")
            
            # Try to get user types
            cursor.execute("SELECT DISTINCT user_type FROM users;")
            user_types = cursor.fetchall()
            if user_types:
                types = [row['user_type'] for row in user_types]
                print(f"✅ User types found: {', '.join(types)}")
            else:
                print("ℹ️ No users found in database (empty table)")
        else:
            print("❌ Users table does not exist")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Database operations test failed: {e}")
        return False

def check_flask_app():
    """Check if Flask app can connect to database"""
    print("\n🌐 Testing Flask App Database Integration...")
    print("-" * 50)
    
    try:
        # Import the Flask app
        import sys
        import os
        
        # Add backend directory to path
        backend_path = os.path.join(os.path.dirname(__file__), 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        # Try to import and test the app
        from app import get_db_connection
        
        conn = get_db_connection()
        if conn:
            print("✅ Flask app can connect to database")
            conn.close()
            return True
        else:
            print("❌ Flask app cannot connect to database")
            return False
            
    except ImportError as e:
        print(f"❌ Cannot import Flask app: {e}")
        return False
    except Exception as e:
        print(f"❌ Flask app test failed: {e}")
        return False

def main():
    """Run all database tests"""
    print("🚀 AquaHub Database Test Suite")
    print("=" * 50)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Database Schema", test_database_schema),
        ("Database Operations", test_database_operations),
        ("Flask App Integration", check_flask_app)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n📋 Test Results Summary")
    print("=" * 50)
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your database is working perfectly!")
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
        print("\n💡 Quick fixes:")
        print("1. Make sure PostgreSQL is running")
        print("2. Run the database setup scripts")
        print("3. Check your .env configuration")

if __name__ == "__main__":
    main()

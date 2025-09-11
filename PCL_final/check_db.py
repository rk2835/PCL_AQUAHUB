import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

try:
    # Test connection to PostgreSQL
    conn = psycopg2.connect(
        host='localhost',
        port='5432',
        database='postgres',
        user='postgres',
        password='8431341723'
    )
    print("✅ PostgreSQL connection successful!")
    
    cursor = conn.cursor()
    
    # Check if aquahub database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'aquahub';")
    db_exists = cursor.fetchone()
    
    if db_exists:
        print("✅ AquaHub database exists")
        conn.close()
        
        # Connect to aquahub database
        conn = psycopg2.connect(
            host='localhost',
            port='5432',
            database='aquahub',
            user='postgres',
            password='8431341723'
        )
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        if tables:
            print(f"✅ Tables found: {tables}")
            
            # Check if there's any customer data
            if 'users' in tables:
                cursor.execute("SELECT COUNT(*) FROM users;")
                user_count = cursor.fetchone()[0]
                print(f"👥 Users in database: {user_count}")
                
            if 'customer_profiles' in tables:
                cursor.execute("SELECT COUNT(*) FROM customer_profiles;")
                customer_count = cursor.fetchone()[0]
                print(f"🏠 Customer profiles: {customer_count}")
                
        else:
            print("❌ No tables found. Database schema not created.")
    else:
        print("❌ AquaHub database doesn't exist")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Database error: {e}")

print("\n" + "="*40)
print("CURRENT STATUS:")
print("="*40)

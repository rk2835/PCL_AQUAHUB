import psycopg2

print("Checking AquaHub Database...")
print("-" * 30)

try:
    # Try to connect to aquahub database
    conn = psycopg2.connect(
        host='localhost',
        port='5432',
        database='aquahub',
        user='postgres',
        password='8431341723'
    )
    
    cursor = conn.cursor()
    print("✅ Connected to AquaHub database")
    
    # List all tables
    cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
    tables = cursor.fetchall()
    
    if tables:
        print(f"📋 Tables: {[t[0] for t in tables]}")
        
        # Count users
        cursor.execute("SELECT COUNT(*) FROM users;")
        users = cursor.fetchone()[0]
        print(f"👥 Total Users: {users}")
        
        # Count customers
        cursor.execute("SELECT COUNT(*) FROM customer_profiles;")
        customers = cursor.fetchone()[0]
        print(f"🏠 Total Customers: {customers}")
        
        # Show recent registrations
        cursor.execute("SELECT username, email, user_type FROM users ORDER BY created_at DESC LIMIT 3;")
        recent = cursor.fetchall()
        print("📝 Recent registrations:")
        for user in recent:
            print(f"   - {user[0]} ({user[1]}) as {user[2]}")
            
    else:
        print("❌ No tables found")
        
except psycopg2.OperationalError:
    print("❌ AquaHub database not found. Need to create it first.")
except Exception as e:
    print(f"❌ Error: {e}")

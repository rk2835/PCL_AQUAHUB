import psycopg2

try:
    conn = psycopg2.connect(host='localhost', port='5432', database='aquahub', user='postgres', password='8431341723')
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users;")
    users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM customer_profiles;")
    customers = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM vendor_profiles;")
    vendors = cursor.fetchone()[0]
    
    print(f"✅ Database Connected!")
    print(f"📊 Total Users: {users}")
    print(f"🏠 Customers: {customers}")
    print(f"🏢 Vendors: {vendors}")
    
    if users > 0:
        cursor.execute("SELECT username, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 3;")
        recent = cursor.fetchall()
        print(f"📝 Recent registrations:")
        for user in recent:
            print(f"   • {user[0]} ({user[1]}) - {user[2]}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("💡 Make sure PostgreSQL is running first!")

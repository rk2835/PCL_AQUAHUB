import psycopg2
import json
from datetime import datetime

def check_database():
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host='localhost',
            port='5432',
            database='aquahub',
            user='postgres',
            password='8431341723'
        )
        cursor = conn.cursor()
        
        print("🔍 AQUAHUB DATABASE INSPECTOR")
        print("=" * 50)
        
        # Check if tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        if not tables:
            print("❌ No tables found. Database schema not created yet.")
            print("\nTo create tables, run these SQL scripts:")
            print("1. database/create_database.sql")
            print("2. database/schema.sql")
            print("3. database/sample_data.sql")
            return
        
        print(f"✅ Tables found: {', '.join(tables)}")
        print()
        
        # Check users table
        if 'users' in tables:
            cursor.execute("SELECT COUNT(*) FROM users;")
            user_count = cursor.fetchone()[0]
            print(f"👥 USERS TABLE: {user_count} users")
            
            if user_count > 0:
                cursor.execute("""
                    SELECT id, username, email, user_type, created_at 
                    FROM users 
                    ORDER BY created_at DESC 
                    LIMIT 10;
                """)
                users = cursor.fetchall()
                print("   Recent Users:")
                for user in users:
                    print(f"   • {user[1]} ({user[2]}) - Type: {user[3]} - Created: {user[4]}")
            print()
        
        # Check customer profiles
        if 'customer_profiles' in tables:
            cursor.execute("SELECT COUNT(*) FROM customer_profiles;")
            customer_count = cursor.fetchone()[0]
            print(f"🏠 CUSTOMER PROFILES: {customer_count} customers")
            
            if customer_count > 0:
                cursor.execute("""
                    SELECT cp.user_id, u.username, cp.phone, cp.address, cp.created_at
                    FROM customer_profiles cp
                    JOIN users u ON cp.user_id = u.id
                    ORDER BY cp.created_at DESC 
                    LIMIT 5;
                """)
                customers = cursor.fetchall()
                print("   Recent Customers:")
                for customer in customers:
                    print(f"   • {customer[1]} - Phone: {customer[2]} - Address: {customer[3]}")
            print()
        
        # Check vendor profiles
        if 'vendor_profiles' in tables:
            cursor.execute("SELECT COUNT(*) FROM vendor_profiles;")
            vendor_count = cursor.fetchone()[0]
            print(f"🏢 VENDOR PROFILES: {vendor_count} vendors")
            
            if vendor_count > 0:
                cursor.execute("""
                    SELECT vp.user_id, u.username, vp.company_name, vp.business_type, vp.created_at
                    FROM vendor_profiles vp
                    JOIN users u ON vp.user_id = u.id
                    ORDER BY vp.created_at DESC 
                    LIMIT 5;
                """)
                vendors = cursor.fetchall()
                print("   Recent Vendors:")
                for vendor in vendors:
                    print(f"   • {vendor[1]} - Company: {vendor[2]} - Type: {vendor[3]}")
            print()
        
        # Check water requirements
        if 'customer_water_requirements' in tables:
            cursor.execute("SELECT COUNT(*) FROM customer_water_requirements;")
            req_count = cursor.fetchone()[0]
            print(f"💧 WATER REQUIREMENTS: {req_count} requirements")
            print()
        
        # Check vendor services
        if 'vendor_services' in tables:
            cursor.execute("SELECT COUNT(*) FROM vendor_services;")
            service_count = cursor.fetchone()[0]
            print(f"🚚 VENDOR SERVICES: {service_count} services")
            print()
        
        conn.close()
        
        print("=" * 50)
        print("✅ Database inspection complete!")
        
    except psycopg2.OperationalError as e:
        if "does not exist" in str(e):
            print("❌ AquaHub database doesn't exist yet.")
            print("Create it by running: database/create_database.sql")
        else:
            print(f"❌ Connection error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_database()

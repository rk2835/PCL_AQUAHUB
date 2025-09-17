import psycopg2
import json
from datetime import datetime

def view_database_data():
    """
    Complete database viewer to check all stored customer and vendor data
    """
    print("🔍 AQUAHUB DATABASE VIEWER")
    print("=" * 60)
    
    try:
        # Connect to database
        conn = psycopg2.connect(
            host='localhost',
            port='5432',
            database='aquahub',
            user='postgres',
            password='8431341723'
        )
        cursor = conn.cursor()
        print("✅ Connected to AquaHub database successfully!")
        print()
        
        # 1. Check all tables
        cursor.execute("""
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns 
                    WHERE table_name = t.table_name AND table_schema = 'public') as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print("📋 DATABASE TABLES:")
        for table, col_count in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            row_count = cursor.fetchone()[0]
            print(f"   • {table}: {row_count} records, {col_count} columns")
        print()
        
        # 2. Show all users
        print("👥 ALL USERS:")
        print("-" * 40)
        cursor.execute("""
            SELECT id, username, email, user_type, created_at 
            FROM users 
            ORDER BY created_at DESC;
        """)
        users = cursor.fetchall()
        
        if users:
            for user in users:
                print(f"ID: {user[0]}")
                print(f"Username: {user[1]}")
                print(f"Email: {user[2]}")
                print(f"Type: {user[3]}")
                print(f"Created: {user[4]}")
                print("-" * 20)
        else:
            print("   No users found")
        print()
        
        # 3. Show customer profiles with details
        print("🏠 CUSTOMER PROFILES:")
        print("-" * 40)
        cursor.execute("""
            SELECT u.username, u.email, cp.phone, cp.address, cp.city, 
                   cp.state, cp.preferred_delivery_time, cp.created_at
            FROM customer_profiles cp
            JOIN users u ON cp.user_id = u.id
            ORDER BY cp.created_at DESC;
        """)
        customers = cursor.fetchall()
        
        if customers:
            for customer in customers:
                print(f"Customer: {customer[0]} ({customer[1]})")
                print(f"Phone: {customer[2]}")
                print(f"Address: {customer[3]}, {customer[4]}, {customer[5]}")
                print(f"Preferred Delivery: {customer[6]}")
                print(f"Registered: {customer[7]}")
                print("-" * 20)
        else:
            print("   No customer profiles found")
        print()
        
        # 4. Show vendor profiles
        print("🏢 VENDOR PROFILES:")
        print("-" * 40)
        cursor.execute("""
            SELECT u.username, u.email, vp.company_name, vp.business_type,
                   vp.phone, vp.address, vp.license_number, vp.service_areas, vp.created_at
            FROM vendor_profiles vp
            JOIN users u ON vp.user_id = u.id
            ORDER BY vp.created_at DESC;
        """)
        vendors = cursor.fetchall()
        
        if vendors:
            for vendor in vendors:
                print(f"Vendor: {vendor[0]} ({vendor[1]})")
                print(f"Company: {vendor[2]}")
                print(f"Business Type: {vendor[3]}")
                print(f"Phone: {vendor[4]}")
                print(f"Address: {vendor[5]}")
                print(f"License: {vendor[6]}")
                print(f"Service Areas: {vendor[7]}")
                print(f"Registered: {vendor[8]}")
                print("-" * 20)
        else:
            print("   No vendor profiles found")
        print()
        
        # 5. Show customer water requirements
        print("💧 CUSTOMER WATER REQUIREMENTS:")
        print("-" * 40)
        cursor.execute("""
            SELECT u.username, cwr.water_type, cwr.quantity_needed, 
                   cwr.delivery_frequency, cwr.special_requirements
            FROM customer_water_requirements cwr
            JOIN users u ON cwr.customer_id = u.id
            ORDER BY cwr.created_at DESC;
        """)
        requirements = cursor.fetchall()
        
        if requirements:
            for req in requirements:
                print(f"Customer: {req[0]}")
                print(f"Water Type: {req[1]}")
                print(f"Quantity: {req[2]}")
                print(f"Frequency: {req[3]}")
                print(f"Special Requirements: {req[4]}")
                print("-" * 20)
        else:
            print("   No water requirements found")
        print()
        
        # 6. Show vendor services
        print("🚚 VENDOR SERVICES:")
        print("-" * 40)
        cursor.execute("""
            SELECT u.username, vs.service_type, vs.water_type, 
                   vs.price_per_unit, vs.delivery_areas, vs.availability
            FROM vendor_services vs
            JOIN users u ON vs.vendor_id = u.id
            ORDER BY vs.created_at DESC;
        """)
        services = cursor.fetchall()
        
        if services:
            for service in services:
                print(f"Vendor: {service[0]}")
                print(f"Service: {service[1]}")
                print(f"Water Type: {service[2]}")
                print(f"Price: ${service[3]} per unit")
                print(f"Delivery Areas: {service[4]}")
                print(f"Availability: {service[5]}")
                print("-" * 20)
        else:
            print("   No vendor services found")
        print()
        
        # 7. Summary statistics
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'customer';")
        customer_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'vendor';")
        vendor_count = cursor.fetchone()[0]
        
        print("📊 SUMMARY STATISTICS:")
        print("-" * 40)
        print(f"Total Customers: {customer_count}")
        print(f"Total Vendors: {vendor_count}")
        print(f"Total Users: {customer_count + vendor_count}")
        
        # Recent registrations (last 24 hours)
        cursor.execute("""
            SELECT COUNT(*) FROM users 
            WHERE created_at > NOW() - INTERVAL '24 hours';
        """)
        recent_registrations = cursor.fetchone()[0]
        print(f"Registrations (last 24h): {recent_registrations}")
        
        conn.close()
        print("\n" + "=" * 60)
        print("✅ Database inspection completed successfully!")
        
    except psycopg2.OperationalError as e:
        print("❌ PostgreSQL Connection Error:")
        print("   • PostgreSQL server is not running")
        print("   • Start PostgreSQL service first:")
        print("     - Open services.msc")
        print("     - Find PostgreSQL service")
        print("     - Right-click → Start")
        print(f"   • Error details: {e}")
        
    except psycopg2.Error as e:
        if "does not exist" in str(e):
            print("❌ Database/Tables Not Found:")
            print("   • AquaHub database or tables don't exist")
            print("   • Run the SQL setup scripts first:")
            print("     1. database/create_database.sql")
            print("     2. database/schema.sql")
            print("     3. database/sample_data.sql")
        else:
            print(f"❌ Database Error: {e}")
            
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    view_database_data()

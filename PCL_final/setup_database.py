"""
Database Setup Script for AquaHub
Creates database and tables if they don't exist
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '8431341723'),
    'port': os.getenv('DB_PORT', '5432')
}

DATABASE_NAME = os.getenv('DB_NAME', 'aquahub')

def create_database():
    """Create the AquaHub database if it doesn't exist"""
    print("🔧 Setting up AquaHub Database...")
    
    try:
        # Connect to PostgreSQL server (not to specific database)
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DATABASE_NAME,))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"📦 Creating database '{DATABASE_NAME}'...")
            cursor.execute(f'CREATE DATABASE "{DATABASE_NAME}"')
            print(f"✅ Database '{DATABASE_NAME}' created successfully!")
        else:
            print(f"ℹ️ Database '{DATABASE_NAME}' already exists")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to create database: {e}")
        return False

def setup_schema():
    """Create tables using schema.sql"""
    print("\n🗄️ Setting up database schema...")
    
    try:
        # Connect to the AquaHub database
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DATABASE_NAME,
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        cursor = conn.cursor()
        
        # Enable UUID extension
        print("🔧 Enabling UUID extension...")
        cursor.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        
        # Read and execute schema.sql
        schema_file = os.path.join('database', 'schema.sql')
        if os.path.exists(schema_file):
            print("📄 Reading schema.sql...")
            with open(schema_file, 'r') as f:
                schema_sql = f.read()
            
            print("🔨 Creating tables...")
            cursor.execute(schema_sql)
            conn.commit()
            print("✅ Database schema created successfully!")
        else:
            print("❌ schema.sql file not found in database folder")
            return False
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to setup schema: {e}")
        return False

def insert_sample_data():
    """Insert sample data if available"""
    print("\n📊 Adding sample data...")
    
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DATABASE_NAME,
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        cursor = conn.cursor()
        
        # Check if sample_data.sql exists
        sample_file = os.path.join('database', 'sample_data.sql')
        if os.path.exists(sample_file):
            print("📄 Reading sample_data.sql...")
            with open(sample_file, 'r') as f:
                sample_sql = f.read()
            
            print("📥 Inserting sample data...")
            cursor.execute(sample_sql)
            conn.commit()
            print("✅ Sample data inserted successfully!")
        else:
            print("ℹ️ No sample_data.sql found, skipping sample data")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to insert sample data: {e}")
        return False

def main():
    """Run database setup"""
    print("🚀 AquaHub Database Setup")
    print("=" * 50)
    
    # Step 1: Create database
    if not create_database():
        print("❌ Database creation failed, aborting setup")
        return
    
    # Step 2: Setup schema
    if not setup_schema():
        print("❌ Schema setup failed, aborting setup")
        return
    
    # Step 3: Insert sample data
    insert_sample_data()
    
    print("\n🎉 Database setup completed!")
    print("You can now run 'python test_database.py' to test the connection")

if __name__ == "__main__":
    main()

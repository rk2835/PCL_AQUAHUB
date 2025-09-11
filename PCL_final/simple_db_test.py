"""
Simple Database Connection Test for AquaHub
Checks if PostgreSQL is installed and running
"""

import subprocess
import socket
import os

def check_postgresql_installed():
    """Check if PostgreSQL is installed"""
    print("🔍 Checking if PostgreSQL is installed...")
    print("-" * 50)
    
    try:
        # Try to find psql command
        result = subprocess.run(['psql', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ PostgreSQL is installed: {result.stdout.strip()}")
            return True
        else:
            print("❌ PostgreSQL is not installed or not in PATH")
            return False
    except subprocess.TimeoutExpired:
        print("❌ PostgreSQL command timed out")
        return False
    except FileNotFoundError:
        print("❌ PostgreSQL is not installed (psql command not found)")
        return False
    except Exception as e:
        print(f"❌ Error checking PostgreSQL: {e}")
        return False

def check_postgresql_running():
    """Check if PostgreSQL is running on the default port"""
    print("\n🔍 Checking if PostgreSQL service is running...")
    print("-" * 50)
    
    try:
        # Check if port 5432 is open
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('localhost', 5432))
        sock.close()
        
        if result == 0:
            print("✅ PostgreSQL is running on port 5432")
            return True
        else:
            print("❌ PostgreSQL is not running on port 5432")
            return False
    except Exception as e:
        print(f"❌ Error checking PostgreSQL service: {e}")
        return False

def check_env_configuration():
    """Check environment configuration"""
    print("\n🔍 Checking database configuration...")
    print("-" * 50)
    
    env_file = os.path.join('backend', '.env')
    if os.path.exists(env_file):
        print("✅ .env file found")
        
        # Read env file
        with open(env_file, 'r') as f:
            env_content = f.read()
        
        required_vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
        missing_vars = []
        
        for var in required_vars:
            if f"{var}=" in env_content:
                # Extract value
                for line in env_content.split('\n'):
                    if line.startswith(f"{var}="):
                        value = line.split('=', 1)[1].strip()
                        if value:
                            print(f"✅ {var}: {value}")
                        else:
                            print(f"⚠️ {var}: (empty)")
                            missing_vars.append(var)
                        break
            else:
                print(f"❌ {var}: not found")
                missing_vars.append(var)
        
        if not missing_vars:
            print("✅ All required environment variables are configured")
            return True
        else:
            print(f"❌ Missing or empty variables: {', '.join(missing_vars)}")
            return False
    else:
        print("❌ .env file not found in backend folder")
        return False

def check_python_packages():
    """Check if required Python packages can be imported"""
    print("\n🔍 Checking Python packages...")
    print("-" * 50)
    
    required_packages = {
        'flask': 'Flask web framework',
        'psycopg2': 'PostgreSQL adapter (requires PostgreSQL)',
        'bcrypt': 'Password hashing',
        'dotenv': 'Environment variables'
    }
    
    available_packages = []
    missing_packages = []
    
    for package, description in required_packages.items():
        try:
            if package == 'dotenv':
                import dotenv
            elif package == 'psycopg2':
                import psycopg2
            elif package == 'flask':
                import flask
            elif package == 'bcrypt':
                import bcrypt
            
            print(f"✅ {package}: {description}")
            available_packages.append(package)
        except ImportError:
            print(f"❌ {package}: {description} (not installed)")
            missing_packages.append(package)
    
    if not missing_packages:
        print("✅ All required packages are available")
        return True
    else:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        return False

def provide_solutions():
    """Provide solutions for common issues"""
    print("\n💡 Setup Instructions for AquaHub Database")
    print("=" * 50)
    
    print("\n1. 📦 Install PostgreSQL:")
    print("   - Download from: https://www.postgresql.org/download/windows/")
    print("   - Or use chocolatey: choco install postgresql")
    print("   - Make sure to remember the password you set for 'postgres' user")
    
    print("\n2. 🔧 Install Python packages:")
    print("   - cd PCL_final")
    print("   - pip install flask flask-cors python-dotenv bcrypt")
    print("   - For psycopg2: pip install psycopg2-binary")
    
    print("\n3. ⚙️ Configure database:")
    print("   - Start PostgreSQL service")
    print("   - Update backend/.env with correct password")
    print("   - Run: python setup_database.py")
    
    print("\n4. 🧪 Test the setup:")
    print("   - Run: python simple_db_test.py")
    print("   - Then: python test_database.py")

def main():
    """Run simple database checks"""
    print("🚀 AquaHub Database Quick Check")
    print("=" * 50)
    
    tests = [
        ("PostgreSQL Installation", check_postgresql_installed),
        ("PostgreSQL Service", check_postgresql_running),
        ("Environment Configuration", check_env_configuration),
        ("Python Packages", check_python_packages)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n📋 Quick Check Results")
    print("=" * 50)
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ READY" if result else "❌ NEEDS SETUP"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall Status: {passed}/{total} components ready")
    
    if passed == total:
        print("🎉 Your database setup is ready!")
        print("You can now run: python test_database.py")
    else:
        provide_solutions()

if __name__ == "__main__":
    main()

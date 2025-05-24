def generate_test_data():
    """Generate test data"""
    print("\n===== Generating Test Data =====")
    return run_command("python3 scripts/generate_test_data.py")#!/usr/bin/env python
"""
Complete setup script for Class Whisper application.
This script handles:
1. PostgreSQL database setup
2. Migrations
3. Creating a superuser
4. Generating test data (optional)

Run this script from the project root directory.
"""

import os
import sys
import subprocess
import getpass
import platform

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'class_whisper.settings')

def run_command(command, ignore_errors=False, env=None):
    """Run a shell command and handle errors"""
    print(f"Running: {command}")
    try:
        subprocess.run(command, shell=True, check=True, env=env)
        return True
    except subprocess.CalledProcessError as e:
        if not ignore_errors:
            print(f"Error executing command: {e}")
        return False

def setup_postgresql():
    """Setup PostgreSQL database"""
    print("\n===== PostgreSQL Setup =====")
    
    # Check if running on macOS
    if platform.system() == "Darwin":
        print("Detected macOS system. Using macOS PostgreSQL setup...")
        use_macos_setup = input("Would you like to use the macOS-specific PostgreSQL setup? (y/n): ")
        if use_macos_setup.lower() == 'y':
            # Run the macOS-specific setup script
            script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'setup_postgresql_mac.py')
            subprocess.run([sys.executable, script_path], check=True)
            return True
    
    # Default values
    DB_NAME = "class_whisper"
    
    # On macOS, the default user is often the current system user
    if platform.system() == "Darwin":
        default_user = os.environ.get("USER")
        DB_USER = input(f"Enter PostgreSQL username (default: {default_user}): ") or default_user
    else:
        # On other systems, postgres is common
        DB_USER = input("Enter PostgreSQL username (default: postgres): ") or "postgres"
    
    print(f"Database: {DB_NAME}")
    print(f"User: {DB_USER}")
    
    # Get password
    DB_PASSWORD = getpass.getpass("Enter password for database user (leave empty if no password): ")
    
    # Test connection to PostgreSQL
    print("Testing PostgreSQL connection...")
    
    # Construct psql command with or without password
    if DB_PASSWORD:
        # Set PGPASSWORD environment variable for the subprocess
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        connection_test = run_command(f'psql -U {DB_USER} -c "SELECT 1" postgres', ignore_errors=True, env=env)
    else:
        connection_test = run_command(f'psql -U {DB_USER} -c "SELECT 1" postgres', ignore_errors=True)
    
    if not connection_test:
        print("""
Error: Could not connect to PostgreSQL.
Please make sure:
1. PostgreSQL is installed and running
2. The user exists and has correct permissions
3. Password authentication is correctly configured
        """)
        create_anyway = input("Continue with setup anyway? (y/n): ")
        if create_anyway.lower() != 'y':
            return False
    
    # Create database
    print(f"Creating database '{DB_NAME}'...")
    if DB_PASSWORD:
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        run_command(f'psql -U {DB_USER} -c "CREATE DATABASE {DB_NAME};" postgres', ignore_errors=True, env=env)
    else:
        run_command(f'psql -U {DB_USER} -c "CREATE DATABASE {DB_NAME};" postgres', ignore_errors=True)
    
    # Update settings.py with the correct credentials
    password_str = f"'{DB_PASSWORD}'" if DB_PASSWORD else "''"
    DB_SETTINGS = f"""
DATABASES = {{
    'default': {{
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '{DB_NAME}',
        'USER': '{DB_USER}',
        'PASSWORD': {password_str},
        'HOST': 'localhost',
        'PORT': '5432',
    }}
}}
"""
    
    settings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'class_whisper', 'settings.py')
    
    update_settings = input("\nWould you like to update settings.py with your PostgreSQL configuration? (y/n): ")
    if update_settings.lower() == 'y':
        try:
            with open(settings_path, 'r') as f:
                settings_content = f.read()
            
            # Simple replacement of the database configuration
            import re
            new_settings = re.sub(
                r"DATABASES = \{.*?'default'.*?\}.*?\}",
                DB_SETTINGS.strip(),
                settings_content,
                flags=re.DOTALL
            )
            
            with open(settings_path, 'w') as f:
                f.write(new_settings)
            
            print("Updated settings.py successfully!")
        except Exception as e:
            print(f"Error updating settings.py: {e}")
            print("Please update your database settings manually.")
    
    print("\nDatabase setup complete!")
    print("Your PostgreSQL configuration for settings.py should be:")
    print(DB_SETTINGS)
    
    return True

def run_migrations():
    """Generate and apply migrations"""
    print("\n===== Running Migrations =====")
    
    # List of all apps to generate migrations for
    apps = [
        'accounts',
        'departments',
        'feedback',
        'moderation',
        'analytics'
    ]
    
    # Generate migrations for each app
    print("\n1. Generating migrations for all apps")
    for app in apps:
        print(f"\n-- Generating migrations for {app} app --")
        run_command(f"python3 manage.py makemigrations {app}", ignore_errors=True)
    
    # Generate migrations for any remaining models
    print("\n-- Checking for any additional migrations --")
    run_command("python3 manage.py makemigrations", ignore_errors=True)
    
    # Apply all migrations
    print("\n2. Applying migrations to the database")
    if not run_command("python3 manage.py migrate"):
        print("\nError applying migrations. Please check your database connection settings.")
        print("Make sure PostgreSQL is running and the database exists.")
        return False
    
    print("\nMigrations completed successfully!")
    return True

def create_superuser():
    """Create a superuser account"""
    print("\n===== Create Superuser =====")
    return run_command("python3 manage.py createsuperuser")

def create_initial_data():
    """Create initial data like departments"""
    print("\n===== Creating Initial Data =====")
    
    # Create departments
    create_departments = input("Would you like to create default departments? (y/n): ")
    if create_departments.lower() == 'y':
        return run_command("python3 scripts/create_departments.py")
    
    return True

def main():
    """Main setup function"""
    print("Class Whisper - Complete Setup Script")
    print("====================================")
    
    # Step 1: PostgreSQL Setup
    db_setup = setup_postgresql()
    
    # Step 2: Run Migrations
    migrations_success = run_migrations()
    if not migrations_success:
        print("Migration failed. Cannot continue with setup.")
        return
    
    # Step 3: Create superuser
    create_su = input("\nWould you like to create a superuser account? (y/n): ")
    if create_su.lower() == 'y':
        create_superuser()
    
    # Step 4: Create initial data
    create_initial_data()
    
    # Step 5: Generate test data
    gen_data = input("\nWould you like to generate test data? (y/n): ")
    if gen_data.lower() == 'y':
        generate_test_data()
    
    print("\n=== Setup Complete! ===")
    print("You can now run the development server:")
    print("python3 manage.py runserver")

if __name__ == "__main__":
    main()
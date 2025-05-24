#!/usr/bin/env python
"""
Script to reset migrations in the Class Whisper application.
This script will delete all existing migrations and create fresh ones.
"""

import os
import sys
import subprocess
import shutil

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'class_whisper.settings')

def run_command(command):
    """Run a shell command and return output"""
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(e.stderr)
        return None

def confirm_action():
    """Ask for confirmation before proceeding"""
    response = input("Are you sure you want to reset all migrations? This will remove all existing migrations. (y/n): ")
    return response.lower() == 'y'

def delete_migrations():
    """Delete all migration files and folders"""
    print("\nDeleting migration files...")
    
    # Directories containing migrations
    app_dirs = [
        'accounts',
        'departments',
        'feedback',
        'moderation',
        'analytics'
    ]
    
    for app in app_dirs:
        migrations_dir = os.path.join(app, 'migrations')
        if os.path.exists(migrations_dir):
            # Delete all migration files except __init__.py
            for filename in os.listdir(migrations_dir):
                if filename != '__init__.py' and filename.endswith('.py'):
                    file_path = os.path.join(migrations_dir, filename)
                    print(f"Deleting {file_path}")
                    os.remove(file_path)
    
    print("Migration files deleted.")

def reset_database():
    """Reset the database"""
    print("\nResetting the database...")
    
    # Get database settings
    import django
    django.setup()
    
    from django.conf import settings
    db_settings = settings.DATABASES['default']
    
    if db_settings['ENGINE'] == 'django.db.backends.postgresql':
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        
        # Drop and recreate the database
        drop_db = run_command(f'dropdb --if-exists {db_name}')
        create_db = run_command(f'createdb {db_name} -U {db_user}')
        
        if create_db is not None:
            print(f"Database '{db_name}' reset successfully.")
        else:
            print("Failed to reset database.")
            return False
    else:
        print("Warning: Not using PostgreSQL. Manual database reset might be required.")
    
    return True

def create_migrations():
    """Create new migrations"""
    print("\nCreating new migrations...")
    
    # Order is important to avoid circular dependencies
    # First create initial migrations for the core apps
    run_command("python3 manage.py makemigrations accounts")
    run_command("python3 manage.py makemigrations departments")
    
    # Then create migrations for other apps
    run_command("python3 manage.py makemigrations feedback")
    run_command("python3 manage.py makemigrations moderation")
    run_command("python3 manage.py makemigrations analytics")
    
    # Check for any remaining models
    run_command("python3 manage.py makemigrations")
    
    print("New migrations created.")

def apply_migrations():
    """Apply migrations"""
    print("\nApplying migrations...")
    
    result = run_command("python3 manage.py migrate")
    
    if "No migrations to apply" in result:
        print("No migrations to apply.")
    else:
        print("Migrations applied successfully.")

def main():
    """Main function to reset migrations"""
    print("Class Whisper - Migration Reset Tool")
    print("==================================")
    
    if not confirm_action():
        print("Migration reset cancelled.")
        return
    
    # Delete migrations
    delete_migrations()
    
    # Reset database
    if not reset_database():
        print("Database reset failed. Aborting.")
        return
    
    # Create new migrations
    create_migrations()
    
    # Apply migrations
    apply_migrations()
    
    print("\nMigration reset complete!")
    print("You should now create departments and a superuser:")
    print("python3 scripts/create_departments.py")
    print("python3 manage.py createsuperuser")

if __name__ == "__main__":
    main()
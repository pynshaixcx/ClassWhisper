#!/usr/bin/env python
"""
Script to generate and apply migrations for all apps in the Class Whisper project.
Run this script from the project root directory.
"""

import os
import sys
import subprocess

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'class_whisper.settings')

def run_command(command):
    """Run a shell command and handle errors"""
    print(f"Running: {command}")
    try:
        subprocess.run(command, shell=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")
        return False

def main():
    """Main function to run migrations"""
    print("Class Whisper - Database Migration Script")
    print("=======================================")
    
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
        if not run_command(f"python manage.py makemigrations {app}"):
            print(f"Failed to generate migrations for {app}. Check if the app is correctly installed.")
    
    # Generate migrations for any remaining models
    print("\n-- Checking for any additional migrations --")
    run_command("python manage.py makemigrations")
    
    # Apply all migrations
    print("\n2. Applying migrations to the database")
    if not run_command("python manage.py migrate"):
        print("\nError applying migrations. Please check your database connection settings.")
        print("Make sure PostgreSQL is running and the database exists.")
        sys.exit(1)
    
    print("\nMigrations completed successfully!")
    print("The database tables have been created.")
    
    # Check if we should create a superuser
    print("\n3. Create superuser account")
    create_superuser = input("Would you like to create a superuser account? (y/n): ")
    if create_superuser.lower() == 'y':
        run_command("python manage.py createsuperuser")
    
    print("\nSetup complete! You can now run the development server:")
    print("python manage.py runserver")

if __name__ == "__main__":
    main()
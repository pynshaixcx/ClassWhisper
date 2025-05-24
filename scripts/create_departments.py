#!/usr/bin/env python
"""
Script to create initial departments for the Class Whisper application.
This script can be run independently to add departments when needed.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'class_whisper.settings')

# Set up Django
django.setup()

# Import models after Django setup
from departments.models import Department
from django.contrib.auth import get_user_model

User = get_user_model()

def create_default_departments():
    """Create default departments"""
    
    # Default department names
    department_names = [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "History",
        "Psychology",
        "Business",
        "Engineering"
    ]
    
    # Check if there are any admin users
    admins = User.objects.filter(is_admin=True)
    if not admins.exists():
        print("No admin users found. Creating a default admin user...")
        admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123",
            is_admin=True,
            is_staff=True
        )
        print(f"Created admin user: admin@example.com (password: admin123)")
    else:
        admin = admins.first()
        print(f"Using existing admin user: {admin.email}")
    
    # Create departments
    departments_created = 0
    for name in department_names:
        dept, created = Department.objects.get_or_create(
            name=name,
            defaults={
                'description': f"Department of {name}",
                'admin': admin
            }
        )
        
        if created:
            departments_created += 1
            print(f"Created department: {name}")
        else:
            print(f"Department already exists: {name}")
    
    print(f"\nCreated {departments_created} new departments.")
    print(f"Total departments: {Department.objects.count()}")

if __name__ == "__main__":
    print("Creating default departments for Class Whisper")
    print("=============================================")
    
    create_default_departments()
    
    print("\nDepartment creation complete!")
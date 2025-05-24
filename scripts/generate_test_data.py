#!/usr/bin/env python
"""
Script to generate test data for the Class Whisper application.
This script should be run from the project root using:
python scripts/generate_test_data.py
"""

import os
import sys
import random
import datetime
from django.utils import timezone
from faker import Faker

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'class_whisper.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from departments.models import Department
from feedback.models import Feedback, Tag, Reply
from moderation.models import FilterRule, ModerationLog

User = get_user_model()
fake = Faker()

def create_users(num_students=30, num_faculty=10, num_admins=3):
    """Create test users with different roles."""
    print(f"Creating {num_students} students, {num_faculty} faculty, and {num_admins} admins...")
    
    # Create admin users
    admin_users = []
    for i in range(num_admins):
        username = f"admin{i+1}"
        email = f"admin{i+1}@example.com"
        user = User.objects.create_user(
            username=username,
            email=email,
            password="password123",
            is_admin=True,
            first_name=fake.first_name(),
            last_name=fake.last_name()
        )
        admin_users.append(user)
        print(f"  Created admin: {email}")
    
    # Create faculty users
    faculty_users = []
    for i in range(num_faculty):
        username = f"faculty{i+1}"
        email = f"faculty{i+1}@example.com"
        user = User.objects.create_user(
            username=username,
            email=email,
            password="password123",
            is_faculty=True,
            first_name=fake.first_name(),
            last_name=fake.last_name()
        )
        faculty_users.append(user)
        print(f"  Created faculty: {email}")
    
    # Create student users
    student_users = []
    for i in range(num_students):
        username = f"student{i+1}"
        email = f"student{i+1}@example.com"
        user = User.objects.create_user(
            username=username,
            email=email,
            password="password123",
            is_student=True,
            first_name=fake.first_name(),
            last_name=fake.last_name()
        )
        student_users.append(user)
        print(f"  Created student: {email}")
    
    return {
        'admins': admin_users,
        'faculty': faculty_users,
        'students': student_users
    }

def create_departments(faculty_users, admin_users):
    """Create test departments."""
    print("Creating departments...")
    
    departments = []
    dept_names = [
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
    
    for i, name in enumerate(dept_names):
        # Select an admin or faculty member as department admin
        if i < len(admin_users):
            admin = admin_users[i]
        else:
            admin = random.choice(faculty_users)
        
        department = Department.objects.create(
            name=name,
            description=fake.paragraph(),
            admin=admin
        )
        departments.append(department)
        print(f"  Created department: {name}")
    
    return departments

def create_tags(departments):
    """Create test tags for each department."""
    print("Creating tags...")
    
    common_tags = [
        "Course Content",
        "Teaching Style",
        "Facilities",
        "Technology",
        "Scheduling",
        "Support Services",
        "Assessment",
        "Communication",
        "Resources",
        "Suggestions"
    ]
    
    tags = []
    for department in departments:
        # Create common tags for each department
        for tag_name in common_tags:
            tag = Tag.objects.create(
                name=tag_name,
                description=fake.sentence(),
                department=department
            )
            tags.append(tag)
        
        # Create some department-specific tags
        for i in range(3):
            specific_tag = Tag.objects.create(
                name=f"{department.name} Specific {i+1}",
                description=fake.sentence(),
                department=department
            )
            tags.append(specific_tag)
        
        print(f"  Created tags for department: {department.name}")
    
    return tags

def create_feedback(users, departments, tags, num_feedback=100):
    """Create test feedback submissions."""
    print(f"Creating {num_feedback} feedback submissions...")
    
    feedbacks = []
    status_choices = ['pending', 'approved', 'rejected', 'addressed']
    
    for i in range(num_feedback):
        # Select a random user (or None for anonymous)
        if random.random() < 0.3:  # 30% anonymous
            user = None
            is_anonymous = True
        else:
            user = random.choice(users['students'])
            is_anonymous = False
        
        # Select a random department
        department = random.choice(departments)
        
        # Select random tags from this department
        dept_tags = Tag.objects.filter(department=department)
        selected_tags = random.sample(list(dept_tags), random.randint(0, min(3, dept_tags.count())))
        
        # Create the feedback
        feedback = Feedback.objects.create(
            title=fake.sentence(),
            content=fake.paragraphs(random.randint(1, 5), True),
            user=user,
            department=department,
            is_anonymous=is_anonymous,
            status=random.choices(
                status_choices, 
                weights=[0.3, 0.2, 0.1, 0.4],  # Weighted probabilities
                k=1
            )[0],
            submission_date=timezone.now() - datetime.timedelta(days=random.randint(0, 90))
        )
        
        # Add tags
        feedback.tags.set(selected_tags)
        
        # Add replies for some feedback (especially addressed ones)
        if feedback.status == 'addressed' or random.random() < 0.3:
            num_replies = random.randint(1, 3)
            for j in range(num_replies):
                # Select a random admin or faculty
                if random.random() < 0.5:
                    admin = random.choice(users['admins'])
                else:
                    admin = random.choice(users['faculty'])
                
                # Create reply with a random time after the feedback submission
                reply_time = feedback.submission_date + datetime.timedelta(hours=random.randint(1, 72))
                if reply_time > timezone.now():
                    reply_time = timezone.now()
                
                Reply.objects.create(
                    feedback=feedback,
                    admin=admin,
                    content=fake.paragraphs(random.randint(1, 3), True),
                    created_at=reply_time
                )
        
        feedbacks.append(feedback)
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1} feedback submissions...")
    
    return feedbacks

def create_filter_rules(admin_users):
    """Create test filter rules."""
    print("Creating filter rules...")
    
    rules = [
        {
            'name': 'Profanity Filter',
            'description': 'Automatically flag feedback containing profanity',
            'rule_type': 'keyword',
            'pattern': 'profanity',
            'action': 'flag'
        },
        {
            'name': 'Urgent Issues',
            'description': 'Flag feedback marked as urgent',
            'rule_type': 'keyword',
            'pattern': 'urgent',
            'action': 'flag'
        },
        {
            'name': 'Email Pattern',
            'description': 'Flag feedback containing email addresses',
            'rule_type': 'regex',
            'pattern': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            'action': 'flag'
        },
        {
            'name': 'Phone Number Pattern',
            'description': 'Flag feedback containing phone numbers',
            'rule_type': 'regex',
            'pattern': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'action': 'flag'
        }
    ]
    
    filter_rules = []
    for rule_data in rules:
        rule = FilterRule.objects.create(
            name=rule_data['name'],
            description=rule_data['description'],
            rule_type=rule_data['rule_type'],
            pattern=rule_data['pattern'],
            action=rule_data['action'],
            is_active=True,
            created_by=random.choice(admin_users)
        )
        filter_rules.append(rule)
        print(f"  Created filter rule: {rule.name}")
    
    return filter_rules

def create_moderation_logs(feedback_items, admin_users):
    """Create test moderation logs."""
    print("Creating moderation logs...")
    
    logs = []
    for feedback in feedback_items:
        if feedback.status != 'pending':
            action = feedback.status
            if action == 'addressed':
                action = 'approved'  # No 'addressed' action in moderation logs
            
            log = ModerationLog.objects.create(
                feedback=feedback,
                moderator=random.choice(admin_users),
                action=action,
                reason=fake.sentence() if random.random() < 0.5 else '',
                timestamp=feedback.submission_date + datetime.timedelta(hours=random.randint(1, 24))
            )
            logs.append(log)
    
    print(f"  Created {len(logs)} moderation logs")
    return logs

def assign_departments_to_users(users, departments):
    """Assign departments to users."""
    print("Assigning departments to users...")
    
    # Assign admins and faculty to departments
    for admin in users['admins']:
        admin.profile.department = random.choice(departments)
        admin.profile.save()
    
    for faculty in users['faculty']:
        faculty.profile.department = random.choice(departments)
        faculty.profile.save()
    
    # Assign some students to departments
    for student in users['students']:
        if random.random() < 0.7:  # 70% of students have a department
            student.profile.department = random.choice(departments)
            student.profile.save()
    
    print("  Departments assigned to users")

def main():
    """Main function to generate test data."""
    print("Starting test data generation...\n")
    
    # Check if data already exists
    if User.objects.count() > 1:
        print("Data already exists. Please run this script on a fresh database.")
        return
    
    # Create users
    users = create_users()
    
    # Create departments
    departments = create_departments(users['faculty'], users['admins'])
    
    # Assign departments to users
    assign_departments_to_users(users, departments)
    
    # Create tags
    tags = create_tags(departments)
    
    # Create filter rules
    filter_rules = create_filter_rules(users['admins'])
    
    # Create feedback
    all_users = users['students'] + users['faculty'] + users['admins']
    feedback_items = create_feedback(users, departments, tags)
    
    # Create moderation logs
    logs = create_moderation_logs(feedback_items, users['admins'])
    
    print("\nTest data generation complete!")
    print(f"Created {len(users['students'])} students, {len(users['faculty'])} faculty, {len(users['admins'])} admins")
    print(f"Created {len(departments)} departments")
    print(f"Created {len(tags)} tags")
    print(f"Created {len(feedback_items)} feedback items")
    print(f"Created {len(filter_rules)} filter rules")
    print(f"Created {len(logs)} moderation logs")
    
    print("\nYou can now login with the following accounts:")
    print("Admin: admin1@example.com / password123")
    print("Faculty: faculty1@example.com / password123")
    print("Student: student1@example.com / password123")

if __name__ == "__main__":
    main()
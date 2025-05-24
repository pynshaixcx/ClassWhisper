Class Whisper is a web application for anonymous academic feedback, built with Django. It provides a secure platform for students to submit feedback to faculty and administrators while maintaining anonymity.

## Features

- **Anonymous Feedback**: Users can choose to submit feedback anonymously
- **Department Channels**: Organize feedback by academic departments
- **Tagging System**: Categorize feedback with customizable tags
- **Moderation System**: Review and manage feedback submissions
- **Analytics Dashboard**: Track feedback statistics and trends
- **Faculty Responses**: Faculty can respond to feedback while maintaining student anonymity

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- virtualenv (recommended)
- PostgreSQL 12 or higher

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/pynshaixcx/ClassWhisper.git
   cd ClassWhisper
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Complete setup (recommended method):
   ```
   python scripts/setup.py
   ```
   This script will guide you through:
   - Setting up the PostgreSQL database
   - Generating and applying all migrations
   - Creating a superuser account
   - Generating test data (optional)

5. Alternative: Individual setup steps:
   - Install PostgreSQL if not already installed
   - Option 1: Use the setup script:
     ```
     # On Linux/Mac
     chmod +x scripts/setup_postgresql.sh
     ./scripts/setup_postgresql.sh
     
     # On Windows
     python scripts/setup_postgresql.py
     ```
   - Option 2: Manual setup:
     ```
     sudo -u postgres psql
     CREATE DATABASE class_whisper;
     ALTER USER postgres WITH PASSWORD 'postgres';  # Change to a secure password
     \q
     ```
   - Update the database settings in `class_whisper/settings.py` with your PostgreSQL credentials if needed

5. Generate and apply database migrations:
   ```
   # Recommended method: Use the migration script
   python scripts/run_migrations.py
   
   # Alternative method: Manual migration commands
   python manage.py makemigrations accounts
   python manage.py makemigrations departments
   python manage.py makemigrations feedback
   python manage.py makemigrations moderation
   python manage.py makemigrations analytics
   python manage.py migrate
   ```

5. Create a superuser account:
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

7. Access the application at http://127.0.0.1:8000/

### Generate Test Data

To populate the application with test data:

```
python scripts/generate_test_data.py
```

This will create test users, departments, tags, and feedback submissions for development and testing purposes.

## User Roles

### Student
- Submit feedback to departments
- Track feedback status
- View responses from faculty/administrators

### Faculty
- View feedback for their department
- Respond to feedback
- Access basic analytics

### Administrator
- Manage departments and tags
- Moderate feedback submissions
- Access comprehensive analytics
- Configure system settings

## Project Structure

```
class_whisper/
├── accounts/                 # User authentication app
├── feedback/                 # Core feedback functionality
├── departments/              # Department management
├── moderation/               # Feedback moderation
├── analytics/                # Feedback analysis
├── static/                   # Static files
└── templates/                # HTML templates
```

## Technology Stack

- **Backend**: Django (Python)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Database**: PostgreSQL
- **Charts**: Chart.js
- **Icons**: Font Awesome

## Production Deployment

For production deployment, update the following settings in `class_whisper/settings.py`:

1. Set `DEBUG = False`
2. Update `ALLOWED_HOSTS` with your domain
3. Configure PostgreSQL with a secure password and proper user permissions
4. Set up a proper email backend
5. Configure static files serving
6. Set a secure `SECRET_KEY`

## License

This project is licensed under the MIT License - see the LICENSE file for details.


## Acknowledgements

- Django Framework
- Bootstrap 5
- Chart.js
- Font Awesome

# Class Whisper: Anonymous Academic Feedback Platform

Class Whisper is a comprehensive web application for anonymous academic feedback, built with Django and React. It provides a secure platform for students to submit feedback to faculty and administrators while maintaining anonymity.

## Features

- **Anonymous Feedback**: Users can choose to submit feedback anonymously
- **Department Channels**: Organize feedback by academic departments
- **Tagging System**: Categorize feedback with customizable tags
- **Moderation System**: Review and manage feedback submissions
- **Analytics Dashboard**: Track feedback statistics and trends
- **Faculty Responses**: Faculty can respond to feedback while maintaining student anonymity
- **Modern UI**: Responsive, glass-morphism design with both light and dark themes

## Technology Stack

### Backend
- **Framework**: Django 4.2
- **API**: Django REST Framework
- **Authentication**: JWT with Simple JWT
- **Database**: PostgreSQL

### Frontend
- **Framework**: React 19
- **Routing**: React Router
- **State Management**: Context API
- **Styling**: SCSS with custom theme system
- **Animations**: Framer Motion
- **3D Effects**: Three.js

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- PostgreSQL 12 or higher

### Backend Setup

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

4. Alternative: Individual setup steps:
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

6. Create a superuser account:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

8. Access the Django admin at http://127.0.0.1:8000/admin/

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd class-whisper-frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

4. Access the React application at http://localhost:3000/

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
- Moderate feedback submissions

### Administrator
- Manage departments and tags
- Moderate feedback submissions
- Manage user accounts
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
├── templates/                # Django HTML templates
└── class-whisper-frontend/   # React frontend application
    ├── public/               # Public assets
    ├── src/                  # Source code
    │   ├── api/              # API services
    │   ├── components/       # Reusable components
    │   ├── context/          # React contexts
    │   ├── pages/            # Page components
    │   └── styles/           # SCSS styles
    └── package.json          # Frontend dependencies
```

## Production Deployment

For production deployment, update the following settings in `class_whisper/settings.py`:

1. Set `DEBUG = False`
2. Update `ALLOWED_HOSTS` with your domain
3. Configure PostgreSQL with a secure password and proper user permissions
4. Set up a proper email backend
5. Configure static files serving
6. Set a secure `SECRET_KEY`

For frontend deployment:

1. Build the React application:
   ```
   cd class-whisper-frontend
   npm run build
   # or
   yarn build
   ```

2. Configure Django to serve the React build files or set up a separate web server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Django Framework
- React
- Bootstrap 5
- Chart.js
- Three.js
- Font Awesome
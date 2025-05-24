#!/bin/bash
# Script to set up PostgreSQL for Class Whisper application

# Exit on error
set -e

# Default values
DB_NAME="class_whisper"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Print information
echo "Setting up PostgreSQL for Class Whisper"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo -n "Enter password for database user (default: postgres): "
read -s input_password
echo ""

if [ -n "$input_password" ]; then
    DB_PASSWORD=$input_password
fi

# Create database and set password
echo "Creating database and setting password..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
EOF

echo "Database setup complete!"
echo "Please update the database settings in class_whisper/settings.py if needed."
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_HOST: localhost"
echo "DB_PORT: 5432"
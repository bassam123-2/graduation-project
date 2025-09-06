# Clinic Management System

A Django-based web application for managing clinic appointments and patient records.

## Quick Start

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```
   python manage.py migrate
   ```

3. Start the server:
   ```
   python manage.py runserver
   ```

4. Open your browser and go to: http://127.0.0.1:8080/

## Project Structure

- `clinic/` - Main Django application
- `core/` - Django project settings
- `front-end(bassasm)/` - Frontend templates and static files
- `manage.py` - Django management script

## Features

- Patient appointment booking
- User authentication and profiles
- Admin dashboard
- Email notifications

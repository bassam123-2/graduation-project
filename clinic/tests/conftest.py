import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from clinic.models import CustomUser, Appointment, TreatmentPlan
from factory import Faker
from factory.django import DjangoModelFactory
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

# Factory Classes
class CustomUserFactory(DjangoModelFactory):
    class Meta:
        model = CustomUser
    
    username = Faker('user_name')
    email = Faker('email')
    first_name = Faker('first_name')
    last_name = Faker('last_name')
    password = Faker('password', length=12)
    role = Faker('random_element', elements=['patient', 'therapist', 'admin'])
    phone_number = Faker('phone_number')
    date_of_birth = Faker('date_of_birth', minimum_age=18, maximum_age=90)
    is_active = True

class AppointmentFactory(DjangoModelFactory):
    class Meta:
        model = Appointment
    
    user = None  # Will be set in tests
    date = Faker('future_datetime', end_date='+30d')
    note = Faker('text', max_nb_chars=200)
    status = Faker('random_element', elements=['scheduled', 'confirmed', 'completed', 'cancelled'])
    duration = Faker('random_int', min=15, max=120)

class TreatmentPlanFactory(DjangoModelFactory):
    class Meta:
        model = TreatmentPlan
    
    appointment = None  # Will be set in tests
    plan_details = Faker('text', max_nb_chars=500)
    exercises = [
        {
            "name": "Exercise 1",
            "sets": 3,
            "reps": 10,
            "duration": "5 minutes"
        }
    ]
    duration_weeks = Faker('random_int', min=1, max=12)

# Fixtures
@pytest.fixture
def api_client():
    """API client for testing"""
    return APIClient()

@pytest.fixture
def patient_user():
    """Create a patient user"""
    user = CustomUserFactory(role='patient')
    user.set_password('testpass123')
    user.save()
    return user

@pytest.fixture
def therapist_user():
    """Create a therapist user"""
    user = CustomUserFactory(role='therapist')
    user.set_password('testpass123')
    user.save()
    return user

@pytest.fixture
def admin_user():
    """Create an admin user"""
    user = CustomUserFactory(role='admin')
    user.set_password('testpass123')
    user.save()
    return user

@pytest.fixture
def authenticated_patient_client(api_client, patient_user):
    """API client authenticated as patient"""
    api_client.force_authenticate(user=patient_user)
    return api_client

@pytest.fixture
def authenticated_therapist_client(api_client, therapist_user):
    """API client authenticated as therapist"""
    api_client.force_authenticate(user=therapist_user)
    return api_client

@pytest.fixture
def authenticated_admin_client(api_client, admin_user):
    """API client authenticated as admin"""
    api_client.force_authenticate(user=admin_user)
    return api_client

@pytest.fixture
def patient_appointment(patient_user):
    """Create an appointment for a patient"""
    return AppointmentFactory(user=patient_user)

@pytest.fixture
def therapist_appointment(therapist_user):
    """Create an appointment for a therapist"""
    return AppointmentFactory(user=therapist_user)

@pytest.fixture
def treatment_plan(patient_appointment):
    """Create a treatment plan for an appointment"""
    return TreatmentPlanFactory(appointment=patient_appointment)

@pytest.fixture
def multiple_patients():
    """Create multiple patient users"""
    patients = []
    for i in range(5):
        user = CustomUserFactory(role='patient')
        user.set_password('testpass123')
        user.save()
        patients.append(user)
    return patients

@pytest.fixture
def multiple_appointments(patient_user):
    """Create multiple appointments for a patient"""
    appointments = []
    for i in range(3):
        appointment = AppointmentFactory(
            user=patient_user,
            date=timezone.now() + timedelta(days=i+1)
        )
        appointments.append(appointment)
    return appointments

@pytest.fixture
def past_appointment(patient_user):
    """Create a past appointment"""
    return AppointmentFactory(
        user=patient_user,
        date=timezone.now() - timedelta(days=1)
    )

@pytest.fixture
def future_appointment(patient_user):
    """Create a future appointment"""
    return AppointmentFactory(
        user=patient_user,
        date=timezone.now() + timedelta(days=7)
    )

@pytest.fixture
def today_appointment(patient_user):
    """Create an appointment for today"""
    return AppointmentFactory(
        user=patient_user,
        date=timezone.now().replace(hour=10, minute=0, second=0, microsecond=0)
    )

# Test data helpers
@pytest.fixture
def valid_user_data():
    """Valid user data for testing"""
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User',
        'role': 'patient',
        'phone_number': '+1234567890',
        'date_of_birth': '1990-01-01'
    }

@pytest.fixture
def valid_appointment_data():
    """Valid appointment data for testing"""
    return {
        'date': (timezone.now() + timedelta(days=1)).isoformat(),
        'note': 'Test appointment',
        'status': 'scheduled',
        'duration': 60
    }

@pytest.fixture
def valid_treatment_plan_data():
    """Valid treatment plan data for testing"""
    return {
        'plan_details': 'Test treatment plan',
        'exercises': [
            {
                'name': 'Test Exercise',
                'sets': 3,
                'reps': 10,
                'duration': '5 minutes'
            }
        ],
        'duration_weeks': 4
    }

# Database fixtures
@pytest.fixture(scope='function')
def db_access_without_rollback_and_truncate(django_db_setup, django_db_blocker):
    django_db_blocker.unblock()
    yield
    django_db_blocker.restore()

@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker):
    django_db_blocker.unblock()
    yield
    django_db_blocker.restore() 
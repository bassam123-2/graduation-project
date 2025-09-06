import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from clinic.serializers import (
    CustomUserSerializer, CustomUserReadSerializer, AppointmentSerializer,
    TreatmentPlanSerializer, LoginResponseSerializer, LogoutResponseSerializer,
    ErrorResponseSerializer, PaginatedResponseSerializer
)
from clinic.models import CustomUser, Appointment, TreatmentPlan


@pytest.mark.django_db
class TestCustomUserSerializer:
    """Test cases for CustomUserSerializer"""

    def test_valid_user_creation(self, valid_user_data):
        """Test creating a user with valid data"""
        serializer = CustomUserSerializer(data=valid_user_data)
        assert serializer.is_valid()
        
        user = serializer.save()
        assert user.username == valid_user_data['username']
        assert user.email == valid_user_data['email']
        assert user.first_name == valid_user_data['first_name']
        assert user.last_name == valid_user_data['last_name']
        assert user.role == valid_user_data['role']
        assert user.check_password(valid_user_data['password'])

    def test_password_mismatch(self, valid_user_data):
        """Test password confirmation mismatch"""
        valid_user_data['password2'] = 'different_password'
        serializer = CustomUserSerializer(data=valid_user_data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_missing_required_fields(self):
        """Test missing required fields"""
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = CustomUserSerializer(data=data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        assert 'first_name' in serializer.errors
        assert 'last_name' in serializer.errors

    def test_weak_password(self, valid_user_data):
        """Test weak password validation"""
        valid_user_data['password'] = '123'
        valid_user_data['password2'] = '123'
        serializer = CustomUserSerializer(data=valid_user_data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_invalid_email(self, valid_user_data):
        """Test invalid email format"""
        valid_user_data['email'] = 'invalid-email'
        serializer = CustomUserSerializer(data=valid_user_data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors

    def test_duplicate_username(self, valid_user_data):
        """Test duplicate username"""
        # Create first user
        serializer1 = CustomUserSerializer(data=valid_user_data)
        serializer1.is_valid()
        serializer1.save()

        # Try to create second user with same username
        valid_user_data['email'] = 'different@example.com'
        serializer2 = CustomUserSerializer(data=valid_user_data)
        assert not serializer2.is_valid()
        assert 'username' in serializer2.errors

    def test_duplicate_email(self, valid_user_data):
        """Test duplicate email"""
        # Create first user
        serializer1 = CustomUserSerializer(data=valid_user_data)
        serializer1.is_valid()
        serializer1.save()

        # Try to create second user with same email
        valid_user_data['username'] = 'different_user'
        serializer2 = CustomUserSerializer(data=valid_user_data)
        assert not serializer2.is_valid()
        assert 'email' in serializer2.errors


@pytest.mark.django_db
class TestCustomUserReadSerializer:
    """Test cases for CustomUserReadSerializer"""

    def test_user_serialization(self, patient_user):
        """Test serializing a user for read operations"""
        serializer = CustomUserReadSerializer(patient_user)
        data = serializer.data
        
        assert data['id'] == patient_user.id
        assert data['username'] == patient_user.username
        assert data['email'] == patient_user.email
        assert data['first_name'] == patient_user.first_name
        assert data['last_name'] == patient_user.last_name
        assert data['role'] == patient_user.role
        assert 'password' not in data  # Password should not be included

    def test_multiple_users_serialization(self, multiple_patients):
        """Test serializing multiple users"""
        serializer = CustomUserReadSerializer(multiple_patients, many=True)
        data = serializer.data
        
        assert len(data) == len(multiple_patients)
        for i, user_data in enumerate(data):
            assert user_data['username'] == multiple_patients[i].username
            assert user_data['email'] == multiple_patients[i].email


@pytest.mark.django_db
class TestAppointmentSerializer:
    """Test cases for AppointmentSerializer"""

    def test_appointment_serialization(self, patient_appointment):
        """Test serializing an appointment"""
        serializer = AppointmentSerializer(patient_appointment)
        data = serializer.data
        
        assert data['id'] == patient_appointment.id
        assert data['date'] == patient_appointment.date.isoformat()
        assert data['note'] == patient_appointment.note
        assert data['status'] == patient_appointment.status
        assert data['duration'] == patient_appointment.duration
        assert 'user' in data
        assert data['user']['username'] == patient_appointment.user.username

    def test_appointment_creation(self, patient_user, valid_appointment_data):
        """Test creating an appointment"""
        valid_appointment_data['user'] = patient_user.id
        serializer = AppointmentSerializer(data=valid_appointment_data)
        assert serializer.is_valid()
        
        appointment = serializer.save(user=patient_user)
        assert appointment.user == patient_user
        assert appointment.note == valid_appointment_data['note']
        assert appointment.status == valid_appointment_data['status']
        assert appointment.duration == valid_appointment_data['duration']

    def test_past_date_validation(self, patient_user, valid_appointment_data):
        """Test validation of past appointment dates"""
        valid_appointment_data['date'] = (timezone.now() - timedelta(days=1)).isoformat()
        serializer = AppointmentSerializer(data=valid_appointment_data)
        assert not serializer.is_valid()
        assert 'date' in serializer.errors

    def test_days_until_calculation(self, patient_user):
        """Test days_until field calculation"""
        # Future appointment
        future_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=5)
        )
        serializer = AppointmentSerializer(future_appointment)
        assert '5 days' in serializer.data['days_until']

        # Past appointment
        past_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() - timedelta(days=3)
        )
        serializer = AppointmentSerializer(past_appointment)
        assert '3 days ago' in serializer.data['days_until']

        # Today's appointment
        today_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now().replace(hour=10, minute=0, second=0, microsecond=0)
        )
        serializer = AppointmentSerializer(today_appointment)
        assert serializer.data['days_until'] == 'Today'

    def test_multiple_appointments_serialization(self, multiple_appointments):
        """Test serializing multiple appointments"""
        serializer = AppointmentSerializer(multiple_appointments, many=True)
        data = serializer.data
        
        assert len(data) == len(multiple_appointments)
        for i, appointment_data in enumerate(data):
            assert appointment_data['id'] == multiple_appointments[i].id


@pytest.mark.django_db
class TestTreatmentPlanSerializer:
    """Test cases for TreatmentPlanSerializer"""

    def test_treatment_plan_serialization(self, treatment_plan):
        """Test serializing a treatment plan"""
        serializer = TreatmentPlanSerializer(treatment_plan)
        data = serializer.data
        
        assert data['id'] == treatment_plan.id
        assert data['plan_details'] == treatment_plan.plan_details
        assert data['duration_weeks'] == treatment_plan.duration_weeks
        assert data['exercises'] == treatment_plan.exercises
        assert 'appointment' in data
        assert data['appointment']['id'] == treatment_plan.appointment.id

    def test_treatment_plan_creation(self, patient_appointment, valid_treatment_plan_data):
        """Test creating a treatment plan"""
        valid_treatment_plan_data['appointment'] = patient_appointment.id
        serializer = TreatmentPlanSerializer(data=valid_treatment_plan_data)
        assert serializer.is_valid()
        
        plan = serializer.save(appointment=patient_appointment)
        assert plan.appointment == patient_appointment
        assert plan.plan_details == valid_treatment_plan_data['plan_details']
        assert plan.duration_weeks == valid_treatment_plan_data['duration_weeks']
        assert plan.exercises == valid_treatment_plan_data['exercises']

    def test_exercises_count_calculation(self, patient_appointment):
        """Test exercises_count field calculation"""
        # Plan with exercises
        plan_with_exercises = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan',
            exercises=[
                {'name': 'Exercise 1', 'sets': 3, 'reps': 10},
                {'name': 'Exercise 2', 'sets': 2, 'reps': 15}
            ]
        )
        serializer = TreatmentPlanSerializer(plan_with_exercises)
        assert serializer.data['exercises_count'] == 2

        # Plan without exercises
        plan_without_exercises = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan',
            exercises=[]
        )
        serializer = TreatmentPlanSerializer(plan_without_exercises)
        assert serializer.data['exercises_count'] == 0

    def test_invalid_duration_weeks(self, patient_appointment, valid_treatment_plan_data):
        """Test validation of duration_weeks"""
        valid_treatment_plan_data['duration_weeks'] = 0
        serializer = TreatmentPlanSerializer(data=valid_treatment_plan_data)
        assert not serializer.is_valid()
        assert 'duration_weeks' in serializer.errors

    def test_multiple_treatment_plans_serialization(self, patient_appointment):
        """Test serializing multiple treatment plans"""
        plans = []
        for i in range(3):
            plan = TreatmentPlan.objects.create(
                appointment=patient_appointment,
                plan_details=f'Plan {i+1}'
            )
            plans.append(plan)
        
        serializer = TreatmentPlanSerializer(plans, many=True)
        data = serializer.data
        
        assert len(data) == len(plans)
        for i, plan_data in enumerate(data):
            assert plan_data['id'] == plans[i].id


@pytest.mark.django_db
class TestResponseSerializers:
    """Test cases for response serializers"""

    def test_login_response_serializer(self, patient_user):
        """Test LoginResponseSerializer"""
        data = {
            'id': patient_user.id,
            'username': patient_user.username,
            'email': patient_user.email,
            'first_name': patient_user.first_name,
            'last_name': patient_user.last_name,
            'role': patient_user.role
        }
        serializer = LoginResponseSerializer(data=data)
        assert serializer.is_valid()

    def test_logout_response_serializer(self):
        """Test LogoutResponseSerializer"""
        data = {'message': 'Logged out successfully'}
        serializer = LogoutResponseSerializer(data=data)
        assert serializer.is_valid()

    def test_error_response_serializer(self):
        """Test ErrorResponseSerializer"""
        data = {
            'error': 'Invalid credentials',
            'detail': 'Username or password is incorrect'
        }
        serializer = ErrorResponseSerializer(data=data)
        assert serializer.is_valid()

    def test_paginated_response_serializer(self):
        """Test PaginatedResponseSerializer"""
        data = {
            'count': 10,
            'next': 'http://localhost:8080/api/users/?page=2',
            'previous': None,
            'results': []
        }
        serializer = PaginatedResponseSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestSerializerValidation:
    """Test cases for serializer validation"""

    def test_user_serializer_validation_errors(self):
        """Test CustomUserSerializer validation errors"""
        # Test empty data
        serializer = CustomUserSerializer(data={})
        assert not serializer.is_valid()
        assert 'username' in serializer.errors
        assert 'email' in serializer.errors
        assert 'password' in serializer.errors

        # Test invalid role
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'invalid_role'
        }
        serializer = CustomUserSerializer(data=data)
        assert not serializer.is_valid()
        assert 'role' in serializer.errors

    def test_appointment_serializer_validation_errors(self, patient_user):
        """Test AppointmentSerializer validation errors"""
        # Test invalid duration
        data = {
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'duration': 5  # Less than minimum
        }
        serializer = AppointmentSerializer(data=data)
        assert not serializer.is_valid()
        assert 'duration' in serializer.errors

        # Test invalid status
        data = {
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'status': 'invalid_status'
        }
        serializer = AppointmentSerializer(data=data)
        assert not serializer.is_valid()
        assert 'status' in serializer.errors

    def test_treatment_plan_serializer_validation_errors(self, patient_appointment):
        """Test TreatmentPlanSerializer validation errors"""
        # Test invalid duration_weeks
        data = {
            'plan_details': 'Test plan',
            'duration_weeks': -1
        }
        serializer = TreatmentPlanSerializer(data=data)
        assert not serializer.is_valid()
        assert 'duration_weeks' in serializer.errors 
import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from clinic.models import CustomUser, Appointment, TreatmentPlan


@pytest.mark.django_db
class TestCustomUserModel:
    """Test cases for CustomUser model"""

    def test_create_user(self):
        """Test creating a user with valid data"""
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='patient'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.first_name == 'Test'
        assert user.last_name == 'User'
        assert user.role == 'patient'
        assert user.is_active is True
        assert user.check_password('testpass123')

    def test_create_superuser(self):
        """Test creating a superuser"""
        user = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        assert user.is_superuser is True
        assert user.is_staff is True
        assert user.role == 'patient'  # Default role

    def test_user_str_representation(self):
        """Test string representation of user"""
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='therapist'
        )
        assert str(user) == 'testuser (therapist)'

    def test_user_role_choices(self):
        """Test user role choices"""
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        choices = [choice[0] for choice in CustomUser.ROLE_CHOICES]
        assert user.role in choices

    def test_user_phone_number_optional(self):
        """Test that phone number is optional"""
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert user.phone_number is None

    def test_user_date_of_birth_optional(self):
        """Test that date of birth is optional"""
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert user.date_of_birth is None


@pytest.mark.django_db
class TestAppointmentModel:
    """Test cases for Appointment model"""

    def test_create_appointment(self, patient_user):
        """Test creating an appointment with valid data"""
        appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1),
            note='Test appointment',
            status='scheduled',
            duration=60
        )
        assert appointment.user == patient_user
        assert appointment.status == 'scheduled'
        assert appointment.duration == 60
        assert appointment.note == 'Test appointment'

    def test_appointment_str_representation(self, patient_user):
        """Test string representation of appointment"""
        appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1)
        )
        expected = f"{patient_user.username} - {appointment.date}"
        assert str(appointment) == expected

    def test_appointment_status_choices(self, patient_user):
        """Test appointment status choices"""
        appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1)
        )
        choices = [choice[0] for choice in Appointment.STATUS_CHOICES]
        assert appointment.status in choices

    def test_appointment_duration_validation(self, patient_user):
        """Test appointment duration validation"""
        # Test minimum duration
        appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1),
            duration=15
        )
        assert appointment.duration == 15

        # Test invalid duration (less than minimum)
        with pytest.raises(ValidationError):
            appointment = Appointment(
                user=patient_user,
                date=timezone.now() + timedelta(days=1),
                duration=10
            )
            appointment.full_clean()

    def test_appointment_date_validation(self, patient_user):
        """Test appointment date validation"""
        # Test past date validation
        with pytest.raises(ValidationError):
            appointment = Appointment(
                user=patient_user,
                date=timezone.now() - timedelta(days=1)
            )
            appointment.full_clean()

    def test_appointment_ordering(self, patient_user):
        """Test appointment ordering by date"""
        # Create appointments with different dates
        appointment1 = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=3)
        )
        appointment2 = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1)
        )
        appointment3 = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=2)
        )

        appointments = Appointment.objects.all()
        assert appointments[0] == appointment2  # Earliest date first
        assert appointments[1] == appointment3
        assert appointments[2] == appointment1

    def test_appointment_user_relationship(self, patient_user):
        """Test appointment user relationship"""
        appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1)
        )
        assert appointment.user == patient_user
        assert appointment in patient_user.appointments.all()


@pytest.mark.django_db
class TestTreatmentPlanModel:
    """Test cases for TreatmentPlan model"""

    def test_create_treatment_plan(self, patient_appointment):
        """Test creating a treatment plan with valid data"""
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test treatment plan',
            exercises=[{'name': 'Exercise 1', 'sets': 3, 'reps': 10}],
            duration_weeks=4
        )
        assert plan.appointment == patient_appointment
        assert plan.plan_details == 'Test treatment plan'
        assert len(plan.exercises) == 1
        assert plan.duration_weeks == 4

    def test_treatment_plan_str_representation(self, patient_appointment):
        """Test string representation of treatment plan"""
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan'
        )
        expected = f"Plan for {patient_appointment.user.username}"
        assert str(plan) == expected

    def test_treatment_plan_duration_validation(self, patient_appointment):
        """Test treatment plan duration validation"""
        # Test minimum duration
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan',
            duration_weeks=1
        )
        assert plan.duration_weeks == 1

        # Test invalid duration (less than minimum)
        with pytest.raises(ValidationError):
            plan = TreatmentPlan(
                appointment=patient_appointment,
                plan_details='Test plan',
                duration_weeks=0
            )
            plan.full_clean()

    def test_treatment_plan_ordering(self, patient_appointment):
        """Test treatment plan ordering by creation date"""
        # Create plans with different creation dates
        plan1 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 1'
        )
        plan2 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 2'
        )

        plans = TreatmentPlan.objects.all()
        assert plans[0] == plan2  # Most recent first
        assert plans[1] == plan1

    def test_treatment_plan_appointment_relationship(self, patient_appointment):
        """Test treatment plan appointment relationship"""
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan'
        )
        assert plan.appointment == patient_appointment
        assert plan in patient_appointment.treatment_plans.all()

    def test_treatment_plan_exercises_default(self, patient_appointment):
        """Test treatment plan exercises default value"""
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan'
        )
        assert plan.exercises == []

    def test_treatment_plan_exercises_json(self, patient_appointment):
        """Test treatment plan exercises JSON field"""
        exercises = [
            {'name': 'Exercise 1', 'sets': 3, 'reps': 10},
            {'name': 'Exercise 2', 'sets': 2, 'reps': 15}
        ]
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan',
            exercises=exercises
        )
        assert len(plan.exercises) == 2
        assert plan.exercises[0]['name'] == 'Exercise 1'
        assert plan.exercises[1]['name'] == 'Exercise 2'


@pytest.mark.django_db
class TestModelRelationships:
    """Test cases for model relationships"""

    def test_user_appointments_relationship(self, patient_user):
        """Test user-appointments relationship"""
        appointment1 = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1)
        )
        appointment2 = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=2)
        )

        assert patient_user.appointments.count() == 2
        assert appointment1 in patient_user.appointments.all()
        assert appointment2 in patient_user.appointments.all()

    def test_appointment_treatment_plans_relationship(self, patient_appointment):
        """Test appointment-treatment plans relationship"""
        plan1 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 1'
        )
        plan2 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 2'
        )

        assert patient_appointment.treatment_plans.count() == 2
        assert plan1 in patient_appointment.treatment_plans.all()
        assert plan2 in patient_appointment.treatment_plans.all()

    def test_cascade_delete_user(self, patient_user):
        """Test cascade delete when user is deleted"""
        appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1)
        )
        plan = TreatmentPlan.objects.create(
            appointment=appointment,
            plan_details='Test plan'
        )

        # Delete user
        patient_user.delete()

        # Check that related objects are deleted
        assert Appointment.objects.count() == 0
        assert TreatmentPlan.objects.count() == 0

    def test_cascade_delete_appointment(self, patient_appointment):
        """Test cascade delete when appointment is deleted"""
        plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Test plan'
        )

        # Delete appointment
        patient_appointment.delete()

        # Check that treatment plan is deleted
        assert TreatmentPlan.objects.count() == 0 
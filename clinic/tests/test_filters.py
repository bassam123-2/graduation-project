import pytest
from django.utils import timezone
from datetime import timedelta
from clinic.filters import AppointmentFilter, TreatmentPlanFilter, CustomUserFilter
from clinic.models import CustomUser, Appointment, TreatmentPlan


@pytest.mark.django_db
@pytest.mark.unit
class TestAppointmentFilter:
    """Test cases for AppointmentFilter"""

    def test_filter_by_status(self, patient_user):
        """Test filtering appointments by status"""
        # Create appointments with different statuses
        scheduled_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1),
            status='scheduled'
        )
        completed_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=2),
            status='completed'
        )
        
        # Test filtering by scheduled status
        filter_set = AppointmentFilter({'status': 'scheduled'}, queryset=Appointment.objects.all())
        filtered_qs = filter_set.qs
        assert filtered_qs.count() == 1
        assert scheduled_appointment in filtered_qs
        assert completed_appointment not in filtered_qs

    def test_filter_by_date_range(self, patient_user):
        """Test filtering appointments by date range"""
        # Create appointments with different dates
        today = timezone.now().date()
        appointment1 = Appointment.objects.create(
            user=patient_user,
            date=today + timedelta(days=1),
            status='scheduled'
        )
        appointment2 = Appointment.objects.create(
            user=patient_user,
            date=today + timedelta(days=5),
            status='scheduled'
        )
        appointment3 = Appointment.objects.create(
            user=patient_user,
            date=today + timedelta(days=10),
            status='scheduled'
        )
        
        # Test filtering by date range
        date_from = (today + timedelta(days=2)).isoformat()
        date_to = (today + timedelta(days=7)).isoformat()
        filter_set = AppointmentFilter({
            'date_from': date_from,
            'date_to': date_to
        }, queryset=Appointment.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert appointment2 in filtered_qs
        assert appointment1 not in filtered_qs
        assert appointment3 not in filtered_qs

    def test_filter_today(self, patient_user):
        """Test filtering appointments for today"""
        today = timezone.now().date()
        today_appointment = Appointment.objects.create(
            user=patient_user,
            date=today.replace(hour=10, minute=0, second=0, microsecond=0),
            status='scheduled'
        )
        tomorrow_appointment = Appointment.objects.create(
            user=patient_user,
            date=today + timedelta(days=1),
            status='scheduled'
        )
        
        # Test today filter
        filter_set = AppointmentFilter({'today': True}, queryset=Appointment.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert today_appointment in filtered_qs
        assert tomorrow_appointment not in filtered_qs

    def test_filter_upcoming(self, patient_user):
        """Test filtering upcoming appointments"""
        past_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() - timedelta(days=1),
            status='completed'
        )
        future_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1),
            status='scheduled'
        )
        
        # Test upcoming filter
        filter_set = AppointmentFilter({'upcoming': True}, queryset=Appointment.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert future_appointment in filtered_qs
        assert past_appointment not in filtered_qs

    def test_filter_past(self, patient_user):
        """Test filtering past appointments"""
        past_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() - timedelta(days=1),
            status='completed'
        )
        future_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1),
            status='scheduled'
        )
        
        # Test past filter
        filter_set = AppointmentFilter({'past': True}, queryset=Appointment.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert past_appointment in filtered_qs
        assert future_appointment not in filtered_qs

    def test_filter_by_duration(self, patient_user):
        """Test filtering appointments by duration"""
        short_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=1),
            duration=30
        )
        long_appointment = Appointment.objects.create(
            user=patient_user,
            date=timezone.now() + timedelta(days=2),
            duration=90
        )
        
        # Test filtering by minimum duration
        filter_set = AppointmentFilter({'duration__gte': 60}, queryset=Appointment.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert long_appointment in filtered_qs
        assert short_appointment not in filtered_qs


@pytest.mark.django_db
@pytest.mark.unit
class TestTreatmentPlanFilter:
    """Test cases for TreatmentPlanFilter"""

    def test_filter_by_duration_weeks(self, patient_appointment):
        """Test filtering treatment plans by duration weeks"""
        short_plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Short plan',
            duration_weeks=2
        )
        long_plan = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Long plan',
            duration_weeks=8
        )
        
        # Test filtering by minimum duration
        filter_set = TreatmentPlanFilter({'duration_weeks__gte': 4}, queryset=TreatmentPlan.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert long_plan in filtered_qs
        assert short_plan not in filtered_qs

    def test_filter_by_duration_range(self, patient_appointment):
        """Test filtering treatment plans by duration range"""
        plan1 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 1',
            duration_weeks=2
        )
        plan2 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 2',
            duration_weeks=6
        )
        plan3 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 3',
            duration_weeks=10
        )
        
        # Test filtering by duration range
        filter_set = TreatmentPlanFilter({
            'duration_weeks_min': 4,
            'duration_weeks_max': 8
        }, queryset=TreatmentPlan.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert plan2 in filtered_qs
        assert plan1 not in filtered_qs
        assert plan3 not in filtered_qs

    def test_filter_by_creation_date(self, patient_appointment):
        """Test filtering treatment plans by creation date"""
        today = timezone.now().date()
        plan1 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 1'
        )
        plan2 = TreatmentPlan.objects.create(
            appointment=patient_appointment,
            plan_details='Plan 2'
        )
        
        # Test filtering by creation date
        created_after = (today - timedelta(days=1)).isoformat()
        filter_set = TreatmentPlanFilter({
            'created_after': created_after
        }, queryset=TreatmentPlan.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 2
        assert plan1 in filtered_qs
        assert plan2 in filtered_qs


@pytest.mark.django_db
@pytest.mark.unit
class TestCustomUserFilter:
    """Test cases for CustomUserFilter"""

    def test_filter_by_role(self):
        """Test filtering users by role"""
        patient = CustomUser.objects.create_user(
            username='patient1',
            email='patient1@example.com',
            password='testpass123',
            role='patient'
        )
        therapist = CustomUser.objects.create_user(
            username='therapist1',
            email='therapist1@example.com',
            password='testpass123',
            role='therapist'
        )
        
        # Test filtering by patient role
        filter_set = CustomUserFilter({'role': 'patient'}, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert patient in filtered_qs
        assert therapist not in filtered_qs

    def test_filter_by_active_status(self):
        """Test filtering users by active status"""
        active_user = CustomUser.objects.create_user(
            username='active_user',
            email='active@example.com',
            password='testpass123',
            is_active=True
        )
        inactive_user = CustomUser.objects.create_user(
            username='inactive_user',
            email='inactive@example.com',
            password='testpass123',
            is_active=False
        )
        
        # Test filtering by active status
        filter_set = CustomUserFilter({'is_active': True}, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert active_user in filtered_qs
        assert inactive_user not in filtered_qs

    def test_search_filter(self):
        """Test searching users across multiple fields"""
        john_doe = CustomUser.objects.create_user(
            username='john_doe',
            email='john@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        jane_smith = CustomUser.objects.create_user(
            username='jane_smith',
            email='jane@example.com',
            password='testpass123',
            first_name='Jane',
            last_name='Smith'
        )
        
        # Test searching by first name
        filter_set = CustomUserFilter({'search': 'John'}, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert john_doe in filtered_qs
        assert jane_smith not in filtered_qs
        
        # Test searching by last name
        filter_set = CustomUserFilter({'search': 'Smith'}, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert jane_smith in filtered_qs
        assert john_doe not in filtered_qs
        
        # Test searching by email
        filter_set = CustomUserFilter({'search': 'john@example.com'}, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert john_doe in filtered_qs
        assert jane_smith not in filtered_qs

    def test_filter_by_creation_date(self):
        """Test filtering users by creation date"""
        today = timezone.now().date()
        user1 = CustomUser.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        user2 = CustomUser.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        
        # Test filtering by creation date
        created_after = (today - timedelta(days=1)).isoformat()
        filter_set = CustomUserFilter({
            'created_after': created_after
        }, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 2
        assert user1 in filtered_qs
        assert user2 in filtered_qs

    def test_combined_filters(self):
        """Test combining multiple filters"""
        active_patient = CustomUser.objects.create_user(
            username='active_patient',
            email='active_patient@example.com',
            password='testpass123',
            role='patient',
            is_active=True
        )
        inactive_patient = CustomUser.objects.create_user(
            username='inactive_patient',
            email='inactive_patient@example.com',
            password='testpass123',
            role='patient',
            is_active=False
        )
        active_therapist = CustomUser.objects.create_user(
            username='active_therapist',
            email='active_therapist@example.com',
            password='testpass123',
            role='therapist',
            is_active=True
        )
        
        # Test combining role and active status filters
        filter_set = CustomUserFilter({
            'role': 'patient',
            'is_active': True
        }, queryset=CustomUser.objects.all())
        filtered_qs = filter_set.qs
        
        assert filtered_qs.count() == 1
        assert active_patient in filtered_qs
        assert inactive_patient not in filtered_qs
        assert active_therapist not in filtered_qs 
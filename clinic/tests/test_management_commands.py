import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from io import StringIO
from clinic.models import CustomUser, Appointment, TreatmentPlan


@pytest.mark.django_db
@pytest.mark.unit
class TestOptimizeDbCommand:
    """Test cases for optimize_db management command"""

    def test_cleanup_old_data(self):
        """Test cleanup of old data"""
        # Create old completed appointments
        old_user = CustomUser.objects.create_user(
            username='olduser',
            email='old@example.com',
            password='testpass123'
        )
        
        old_appointment = Appointment.objects.create(
            user=old_user,
            date=timezone.now() - timedelta(days=400),  # More than 1 year old
            status='completed'
        )
        
        old_treatment_plan = TreatmentPlan.objects.create(
            appointment=old_appointment,
            plan_details='Old plan'
        )
        
        # Create recent appointments (should not be deleted)
        recent_user = CustomUser.objects.create_user(
            username='recentuser',
            email='recent@example.com',
            password='testpass123'
        )
        
        recent_appointment = Appointment.objects.create(
            user=recent_user,
            date=timezone.now() - timedelta(days=30),
            status='completed'
        )
        
        recent_treatment_plan = TreatmentPlan.objects.create(
            appointment=recent_appointment,
            plan_details='Recent plan'
        )
        
        # Run cleanup command
        out = StringIO()
        call_command('optimize_db', '--cleanup', stdout=out)
        
        # Check that old data was deleted
        assert not Appointment.objects.filter(id=old_appointment.id).exists()
        assert not TreatmentPlan.objects.filter(id=old_treatment_plan.id).exists()
        
        # Check that recent data was preserved
        assert Appointment.objects.filter(id=recent_appointment.id).exists()
        assert TreatmentPlan.objects.filter(id=recent_treatment_plan.id).exists()

    def test_analyze_performance(self):
        """Test performance analysis"""
        # Create some test data
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        appointment = Appointment.objects.create(
            user=user,
            date=timezone.now() + timedelta(days=1)
        )
        
        treatment_plan = TreatmentPlan.objects.create(
            appointment=appointment,
            plan_details='Test plan'
        )
        
        # Run analyze command
        out = StringIO()
        call_command('optimize_db', '--analyze', stdout=out)
        output = out.getvalue()
        
        # Check that analysis output contains expected information
        assert 'Model counts:' in output
        assert 'Users:' in output
        assert 'Appointments:' in output
        assert 'Treatment Plans:' in output

    def test_vacuum_database(self):
        """Test database vacuum command"""
        out = StringIO()
        call_command('optimize_db', '--vacuum', stdout=out)
        output = out.getvalue()
        
        # Check that vacuum command was executed
        assert 'Vacuuming database' in output

    def test_all_optimizations(self):
        """Test running all optimizations"""
        out = StringIO()
        call_command('optimize_db', stdout=out)
        output = out.getvalue()
        
        # Check that all optimizations were run
        assert 'Running all optimizations' in output
        assert 'Cleaning up old data' in output
        assert 'Analyzing database performance' in output
        assert 'Vacuuming database' in output

    def test_invalid_option(self):
        """Test invalid command option"""
        with pytest.raises(CommandError):
            call_command('optimize_db', '--invalid-option')

    def test_cleanup_with_no_old_data(self):
        """Test cleanup when no old data exists"""
        # Create only recent data
        user = CustomUser.objects.create_user(
            username='recentuser',
            email='recent@example.com',
            password='testpass123'
        )
        
        recent_appointment = Appointment.objects.create(
            user=user,
            date=timezone.now() - timedelta(days=30),
            status='completed'
        )
        
        TreatmentPlan.objects.create(
            appointment=recent_appointment,
            plan_details='Recent plan'
        )
        
        # Run cleanup command
        out = StringIO()
        call_command('optimize_db', '--cleanup', stdout=out)
        output = out.getvalue()
        
        # Check that no data was deleted
        assert Appointment.objects.count() == 1
        assert TreatmentPlan.objects.count() == 1
        assert 'Deleted 0 old completed appointments' in output
        assert 'Deleted 0 old treatment plans' in output

    def test_cleanup_with_mixed_data(self):
        """Test cleanup with mixed old and recent data"""
        # Create old completed appointment
        old_user = CustomUser.objects.create_user(
            username='olduser',
            email='old@example.com',
            password='testpass123'
        )
        
        old_appointment = Appointment.objects.create(
            user=old_user,
            date=timezone.now() - timedelta(days=400),
            status='completed'
        )
        
        old_treatment_plan = TreatmentPlan.objects.create(
            appointment=old_appointment,
            plan_details='Old plan'
        )
        
        # Create recent scheduled appointment (should not be deleted)
        recent_user = CustomUser.objects.create_user(
            username='recentuser',
            email='recent@example.com',
            password='testpass123'
        )
        
        recent_appointment = Appointment.objects.create(
            user=recent_user,
            date=timezone.now() - timedelta(days=30),
            status='scheduled'  # Not completed, so should not be deleted
        )
        
        recent_treatment_plan = TreatmentPlan.objects.create(
            appointment=recent_appointment,
            plan_details='Recent plan'
        )
        
        # Run cleanup command
        out = StringIO()
        call_command('optimize_db', '--cleanup', stdout=out)
        output = out.getvalue()
        
        # Check that only old completed data was deleted
        assert not Appointment.objects.filter(id=old_appointment.id).exists()
        assert not TreatmentPlan.objects.filter(id=old_treatment_plan.id).exists()
        assert Appointment.objects.filter(id=recent_appointment.id).exists()
        assert TreatmentPlan.objects.filter(id=recent_treatment_plan.id).exists()

    def test_analyze_with_empty_database(self):
        """Test analysis with empty database"""
        out = StringIO()
        call_command('optimize_db', '--analyze', stdout=out)
        output = out.getvalue()
        
        # Check that analysis runs without errors
        assert 'Model counts:' in output
        assert 'Users: 0' in output
        assert 'Appointments: 0' in output
        assert 'Treatment Plans: 0' in output

    def test_command_output_format(self):
        """Test command output format"""
        out = StringIO()
        call_command('optimize_db', '--cleanup', stdout=out)
        output = out.getvalue()
        
        # Check that output is properly formatted
        assert 'Cleaning up old data...' in output
        assert 'Deleted' in output or 'Deleted 0' in output
        assert 'Cleared all cache' in output

    def test_command_with_verbose_output(self):
        """Test command with verbose output"""
        out = StringIO()
        call_command('optimize_db', '--cleanup', verbosity=2, stdout=out)
        output = out.getvalue()
        
        # Check that verbose output contains more details
        assert 'Cleaning up old data...' in output
        assert 'Cleared all cache' in output 
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from django.conf import settings
from clinic.models import Appointment
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send appointment reminder emails to patients and guests one day before their appointments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending emails',
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Send test reminder to a specific email address',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email address for test reminder',
        )

    def handle(self, *args, **options):
        if options['test']:
            self.send_test_reminder(options['email'])
            return

        if options['dry_run']:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No emails will be sent'))
        
        # Get appointments scheduled for tomorrow
        tomorrow = timezone.now().date() + timedelta(days=1)
        appointments = Appointment.objects.filter(
            date__date=tomorrow,
            status='scheduled'
        ).select_related('user')
        
        self.stdout.write(f"Found {appointments.count()} appointments for {tomorrow}")
        
        sent_count = 0
        failed_count = 0
        
        for appointment in appointments:
            try:
                if self.send_reminder_email(appointment, dry_run=options['dry_run']):
                    sent_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Reminder sent for appointment #{appointment.id} - "
                            f"{appointment.date.strftime('%Y-%m-%d %H:%M')}"
                        )
                    )
                else:
                    failed_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f"✗ Failed to send reminder for appointment #{appointment.id}"
                        )
                    )
            except Exception as e:
                failed_count += 1
                logger.error(f"Error sending reminder for appointment {appointment.id}: {e}")
                self.stdout.write(
                    self.style.ERROR(
                        f"✗ Error sending reminder for appointment #{appointment.id}: {e}"
                    )
                )
        
        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING(
                    f"\nDRY RUN SUMMARY:\n"
                    f"Would send reminders: {sent_count}\n"
                    f"Would fail: {failed_count}\n"
                    f"Total appointments: {appointments.count()}"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\nREMINDER SUMMARY:\n"
                    f"Reminders sent: {sent_count}\n"
                    f"Failed: {failed_count}\n"
                    f"Total appointments: {appointments.count()}"
                )
            )

    def send_reminder_email(self, appointment, dry_run=False):
        """Send reminder email for a specific appointment"""
        try:
            # Determine recipient email and name
            if appointment.is_guest:
                recipient_email = appointment.guest_email
                recipient_name = f"{appointment.guest_first_name} {appointment.guest_last_name}"
                user = None
            else:
                recipient_email = appointment.user.email
                recipient_name = f"{appointment.user.first_name} {appointment.user.last_name}"
                user = appointment.user
            
            # Prepare email context
            context = {
                'appointment': appointment,
                'user': user,
                'recipient_name': recipient_name,
            }
            
            # Render email templates
            subject = f"Appointment Reminder - Tomorrow at {appointment.date.strftime('%I:%M %p')}"
            
            html_message = render_to_string('emails/appointment_reminder.html', context)
            plain_message = strip_tags(html_message)
            
            if dry_run:
                self.stdout.write(f"Would send reminder to {recipient_email}")
                self.stdout.write(f"Subject: {subject}")
                return True
            
            # Send email
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=html_message,
                fail_silently=False
            )
            
            # Log successful email
            logger.info(f"Appointment reminder sent to {recipient_email} for appointment {appointment.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send reminder email for appointment {appointment.id}: {e}")
            return False

    def send_test_reminder(self, test_email):
        """Send a test reminder email for testing purposes"""
        if not test_email:
            self.stdout.write(self.style.ERROR('Please provide an email address with --email for test mode'))
            return
        
        # Create a mock appointment for testing
        from datetime import datetime, time
        tomorrow = timezone.now().date() + timedelta(days=1)
        test_time = time(10, 0)  # 10:00 AM
        test_datetime = timezone.make_aware(datetime.combine(tomorrow, test_time))
        
        # Create a mock appointment object
        class MockAppointment:
            def __init__(self):
                self.id = 999
                self.date = test_datetime
                self.is_guest = True
                self.guest_first_name = "Test"
                self.guest_last_name = "Patient"
                self.guest_email = test_email
                self.guest_id = "TEST-123"
                self.service_type = "manual-therapy"
                self.duration = 60
                self.status = "scheduled"
            
            def get_service_type_display(self):
                return "Manual Therapy"
            
            def get_status_display(self):
                return "Scheduled"
        
        mock_appointment = MockAppointment()
        
        self.stdout.write(f"Sending test reminder to {test_email}")
        
        if self.send_reminder_email(mock_appointment, dry_run=False):
            self.stdout.write(
                self.style.SUCCESS(f"✓ Test reminder sent successfully to {test_email}")
            )
        else:
            self.stdout.write(
                self.style.ERROR(f"✗ Failed to send test reminder to {test_email}")
            )

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import uuid
import secrets
import string

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('therapist', 'Therapist'),
        ('admin', 'Admin'),
    )
    
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer-not-to-say', 'Prefer not to say'),
    )
    
    BLOOD_TYPE_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )
    
    # Basic Information (inherited: username, email, first_name, last_name, password)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    
    # Extended Patient Information (consolidated from Patient model)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    
    # Medical Information
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True, help_text="Emergency contact name and phone")
    medical_history = models.TextField(blank=True, null=True, help_text="Medical history, allergies, current medications")
    
    # Treatment Information
    treatment_reason = models.TextField(blank=True, null=True, help_text="Primary reason for seeking treatment")
    condition_description = models.TextField(blank=True, null=True, help_text="Description of current condition")
    condition_type = models.CharField(max_length=100, blank=True, null=True, help_text="Type of condition")
    referring_doctor = models.CharField(max_length=100, blank=True, null=True, help_text="Referring doctor name")
    referral_source = models.CharField(max_length=255, blank=True, null=True, help_text="How did you hear about us")
    
    # System fields
    is_active = models.BooleanField(default=False)  # Changed to False - requires email verification
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
        # Add unique constraint for email
        constraints = [
            models.UniqueConstraint(fields=['email'], name='unique_user_email')
        ]

    def __str__(self):
        return f"{self.username} ({self.role})"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    SERVICE_TYPE_CHOICES = (
        ('manual-therapy', 'Manual Therapy'),
        ('physical-therapy', 'Physical Therapy'),
        ('rehabilitation', 'Rehabilitation Body Engineering'),
        ('consultation', 'General Consultation'),
        ('follow-up', 'Follow-up Session'),
        ('assessment', 'Initial Assessment'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    
    # Guest-specific fields
    is_guest = models.BooleanField(default=False, help_text="True if this is a guest appointment")
    guest_id = models.CharField(max_length=20, unique=True, null=True, blank=True, help_text="Unique identifier for guest appointments")
    guest_first_name = models.CharField(max_length=100, null=True, blank=True)
    guest_last_name = models.CharField(max_length=100, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)
    guest_age = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(120)])
    guest_gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], null=True, blank=True)
    
    date = models.DateTimeField()
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES, default='consultation')
    note = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    duration = models.IntegerField(default=60, validators=[MinValueValidator(15)])  # minutes
    therapist = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_appointments', limit_choices_to={'role': 'therapist'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
            models.Index(fields=['is_guest']),
            models.Index(fields=['guest_id']),
        ]

    def __str__(self):
        if self.is_guest and self.guest_id:
            return f"{self.guest_id} - {self.guest_first_name} {self.guest_last_name} - {self.date}"
        elif self.user:
            return f"{self.user.username} - {self.date}"
        else:
            return f"Anonymous - {self.date}"

    def save(self, *args, **kwargs):
        # Generate guest ID if this is a guest appointment and doesn't have one
        if self.is_guest and not self.guest_id:
            self.guest_id = self.generate_guest_id()
        super().save(*args, **kwargs)

    def generate_guest_id(self):
        """Generate a unique guest ID in format GUEST-YYYYMMDD-XXX"""
        from datetime import datetime
        today = datetime.now().strftime('%Y%m%d')
        
        # Find the next available number for today
        existing_today = Appointment.objects.filter(
            guest_id__startswith=f'GUEST-{today}-',
            is_guest=True
        ).count()
        
        next_number = existing_today + 1
        return f'GUEST-{today}-{next_number:03d}'

    @property
    def patient_name(self):
        """Get patient name regardless of user type"""
        if self.is_guest:
            return f"{self.guest_first_name} {self.guest_last_name}"
        elif self.user:
            return self.user.get_full_name()
        return "Anonymous"

    @property
    def patient_email(self):
        """Get patient email regardless of user type"""
        if self.is_guest:
            return self.guest_email
        elif self.user:
            return self.user.email
        return None

    @property
    def patient_phone(self):
        """Get patient phone regardless of user type"""
        if self.is_guest:
            return self.guest_phone
        elif self.user:
            return self.user.phone_number
        return None

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.date < timezone.now():
            raise ValidationError("Appointment date cannot be in the past.")

class TreatmentPlan(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='treatment_plans')
    plan_details = models.TextField()
    exercises = models.JSONField(default=list, blank=True)
    duration_weeks = models.IntegerField(default=4, validators=[MinValueValidator(1)])
    total_sessions = models.IntegerField(default=10, validators=[MinValueValidator(1)])
    completed_sessions = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    progress_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['appointment']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        if self.appointment.is_guest and self.appointment.guest_id:
            return f"Plan for {self.appointment.guest_id} - {self.appointment.guest_first_name} {self.appointment.guest_last_name}"
        elif self.appointment.user:
            return f"Plan for {self.appointment.user.username}"
        else:
            return f"Plan for Anonymous Patient"

    def calculate_progress(self):
        if self.total_sessions > 0:
            self.progress_percentage = int((self.completed_sessions / self.total_sessions) * 100)
            self.save()
        return self.progress_percentage

class Testimonial(models.Model):
    TREATMENT_TYPE_CHOICES = (
        ('manual-therapy', 'Manual Therapy'),
        ('physical-therapy', 'Physical Therapy'),
        ('body-engineering', 'Rehabilitation Body Engineering'),
        ('multiple', 'Multiple Treatments'),
        ('other', 'Other'),
    )
    
    TREATMENT_DURATION_CHOICES = (
        ('1-2-weeks', '1-2 weeks'),
        ('3-4-weeks', '3-4 weeks'),
        ('1-2-months', '1-2 months'),
        ('3-6-months', '3-6 months'),
        ('6-months-plus', '6+ months'),
    )
    
    RATING_CHOICES = (
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    )
    
    RECOMMEND_CHOICES = (
        ('definitely-yes', 'Definitely Yes'),
        ('probably-yes', 'Probably Yes'),
        ('maybe', 'Maybe'),
        ('probably-not', 'Probably Not'),
        ('definitely-not', 'Definitely Not'),
    )

    # User Information
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='testimonials', null=True, blank=True)
    full_name = models.CharField(max_length=200)
    age = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(1)])
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Treatment Information
    condition = models.CharField(max_length=200, help_text="Condition treated")
    treatment_type = models.CharField(max_length=50, choices=TREATMENT_TYPE_CHOICES)
    treatment_duration = models.CharField(max_length=50, choices=TREATMENT_DURATION_CHOICES, blank=True)
    specialist = models.CharField(max_length=100, blank=True, help_text="Name of specialist (optional)")
    
    # Testimonial Content
    before_condition = models.TextField(help_text="Describe your condition before treatment")
    treatment_experience = models.TextField(help_text="Describe your treatment experience")
    results = models.TextField(help_text="Describe the results you achieved")
    testimonial_text = models.TextField(help_text="Your complete testimonial story")
    additional_comments = models.TextField(blank=True, help_text="Any additional comments")
    
    # Ratings and Recommendations
    rating = models.IntegerField(choices=RATING_CHOICES, help_text="Overall rating (1-5 stars)")
    recommend = models.CharField(max_length=50, choices=RECOMMEND_CHOICES, help_text="Would you recommend us?")
    
    # Permissions and Privacy
    consent = models.BooleanField(default=False, help_text="Consent to use testimonial publicly")
    anonymous = models.BooleanField(default=False, help_text="Prefer to remain anonymous")
    contact_permission = models.BooleanField(default=False, help_text="Permission to contact for follow-up")
    
    # Media
    media_file = models.FileField(upload_to='testimonials/media/', blank=True, null=True, help_text="Optional photo or video")
    
    # Status and Moderation
    is_approved = models.BooleanField(default=False, help_text="Approved for public display")
    is_featured = models.BooleanField(default=False, help_text="Featured testimonial")
    approved_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_testimonials')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_approved', 'created_at']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['treatment_type']),
            models.Index(fields=['rating']),
        ]

    def __str__(self):
        name = "Anonymous" if self.anonymous else self.full_name
        return f"Testimonial by {name} - {self.rating} stars"

    def get_display_name(self):
        if self.anonymous:
            # Return initials only
            names = self.full_name.split()
            if len(names) >= 2:
                return f"{names[0][0]}.{names[-1][0]}."
            else:
                return f"{names[0][0]}."
        return self.full_name

    def save(self, *args, **kwargs):
        # Auto-approve if user is staff/admin
        if self.user and self.user.is_staff and not self.is_approved:
            self.is_approved = True
            self.approved_by = self.user
            self.approved_at = timezone.now()
        super().save(*args, **kwargs)

class EmailVerification(models.Model):
    """Model to handle email verification tokens"""
    
    VERIFICATION_TYPES = (
        ('registration', 'Registration Verification'),
        ('password_reset', 'Password Reset'),
        ('email_change', 'Email Change Verification'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='email_verifications')
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPES)
    token = models.CharField(max_length=100, unique=True)
    verification_code = models.CharField(max_length=6)  # 6-digit numeric code
    email = models.EmailField()  # Email to verify (might be different from user.email for email changes)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['verification_code']),
            models.Index(fields=['user', 'verification_type']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.verification_type} - {self.verification_code}"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = str(uuid.uuid4())
        if not self.verification_code:
            self.verification_code = self.generate_verification_code()
        if not self.expires_at:
            from django.conf import settings
            if self.verification_type == 'password_reset':
                hours = getattr(settings, 'PASSWORD_RESET_EXPIRY_HOURS', 2)
            else:
                hours = getattr(settings, 'EMAIL_VERIFICATION_EXPIRY_HOURS', 24)
            self.expires_at = timezone.now() + timezone.timedelta(hours=hours)
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_verification_code():
        """Generate a 6-digit numeric verification code"""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    def is_expired(self):
        """Check if the verification token is expired"""
        if self.expires_at is None:
            return True  # If no expiration date is set, consider it expired
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if the verification token is valid (not used and not expired)"""
        return not self.is_used and not self.is_expired()
    
    def mark_as_used(self):
        """Mark the verification token as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()
    
    def send_verification_email(self):
        """Send verification email based on verification type"""
        try:
            if self.verification_type == 'registration':
                self._send_registration_verification()
            elif self.verification_type == 'password_reset':
                self._send_password_reset()
            elif self.verification_type == 'email_change':
                self._send_email_change_verification()
            return True
        except Exception as e:
            print(f"Error sending verification email: {e}")
            return False
    
    def _send_registration_verification(self):
        """Send registration verification email"""
        try:
            print(f"📧 Attempting to send registration verification email to: {self.email}")
            
            subject = 'Welcome to AL-BOQAI Center - Verify Your Email'
            
            # Create context for email template
            context = {
                'user': self.user,
                'verification_code': self.verification_code,
                'token': self.token,
                'expires_at': self.expires_at,
                'center_name': 'AL-BOQAI Center',
                'verification_url': f'http://localhost:8080/verify-email/{self.token}/',
            }
            
            # Render HTML and text versions
            html_message = render_to_string('emails/registration_verification.html', context)
            text_message = strip_tags(html_message)
            
            print(f"📧 Email template rendered successfully. HTML length: {len(html_message)}")
            
            # Send email
            result = send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            print(f"✅ Registration verification email sent successfully to {self.email}. Result: {result}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send registration verification email: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return False
    
    def _send_password_reset(self):
        """Send password reset verification email"""
        try:
            print(f"📧 Attempting to send password reset email to: {self.email}")
            
            subject = 'AL-BOQAI Center - Password Reset Verification'
            
            context = {
                'user': self.user,
                'verification_code': self.verification_code,
                'token': self.token,
                'expires_at': self.expires_at,
                'center_name': 'AL-BOQAI Center',
                'reset_url': f'http://localhost:8080/reset-password/{self.token}/',
            }
            
            html_message = render_to_string('emails/password_reset_verification.html', context)
            text_message = strip_tags(html_message)
            
            print(f"📧 Email template rendered successfully. HTML length: {len(html_message)}")
            
            result = send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            print(f"✅ Password reset email sent successfully to {self.email}. Result: {result}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send password reset email: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return False
    
    def _send_email_change_verification(self):
        """Send email change verification email"""
        try:
            print(f"📧 Attempting to send email change verification to: {self.email}")
            
            subject = 'AL-BOQAI Center - Verify Your New Email Address'
            
            context = {
                'user': self.user,
                'verification_code': self.verification_code,
                'token': self.token,
                'new_email': self.email,
                'expires_at': self.expires_at,
                'center_name': 'AL-BOQAI Center',
                'verification_url': f'http://localhost:8080/verify-email-change/{self.token}/',
            }
            
            html_message = render_to_string('emails/email_change_verification.html', context)
            text_message = strip_tags(html_message)
            
            print(f"📧 Email template rendered successfully. HTML length: {len(html_message)}")
            
            result = send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            print(f"✅ Email change verification sent successfully to {self.email}. Result: {result}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email change verification: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return False
    
    @classmethod
    def create_verification(cls, user, verification_type, email=None):
        """Create a new email verification token"""
        if email is None:
            email = user.email
        
        # Invalidate any existing unused verifications of the same type
        cls.objects.filter(
            user=user,
            verification_type=verification_type,
            is_used=False
        ).update(is_used=True, used_at=timezone.now())
        
        # Create new verification
        verification = cls.objects.create(
            user=user,
            verification_type=verification_type,
            email=email
        )
        
        return verification

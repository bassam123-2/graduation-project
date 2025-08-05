from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('therapist', 'Therapist'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
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

    def __str__(self):
        return f"{self.username} ({self.role})"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateTimeField()
    note = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    duration = models.IntegerField(default=60, validators=[MinValueValidator(15)])  # minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.date}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.date < timezone.now():
            raise ValidationError("Appointment date cannot be in the past.")

class TreatmentPlan(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='treatment_plans')
    plan_details = models.TextField()
    exercises = models.JSONField(default=list, blank=True)
    duration_weeks = models.IntegerField(default=4, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['appointment']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Plan for {self.appointment.user.username}"

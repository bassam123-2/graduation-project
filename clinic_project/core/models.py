from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)


    first_name = models.CharField(max_length=100, default='unknown')
    last_name = models.CharField(max_length=100, default='unknown')
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, default='unknown')
    gender = models.CharField(max_length=10, default='unknown')
    birth_date = models.DateField(default=timezone.now)
    address = models.TextField(default='unknown')
    city = models.CharField(max_length=100, default='unknown')
    postal_code = models.CharField(max_length=20, default='unknown')
    referral = models.CharField(max_length=255, blank=True, null=True)
    condition_description = models.TextField(blank=True, null=True)
    doctor_name = models.CharField(max_length=100, blank=True, null=True)
    condition_type = models.CharField(max_length=100, blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    blood_type = models.CharField(max_length=3, blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    treatment_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username  # بدلًا من self.username



class Appointment(models.Model):
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE)

    appointment_date = models.DateField(default=timezone.now)  # يعطي التاريخ الحالي
    appointment_time = models.TimeField(default='12:00:00')     # وقت افتراضي

    doctor_name = models.CharField(max_length=100, default='unknown')

    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )

    notes = models.TextField(blank=True, null=True)  # يمكن تركه فارغاً

    def __str__(self):
        return f"{self.patient.username} - {self.appointment_date} {self.appointment_time}"

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from drf_yasg.utils import swagger_serializer_method
from .models import CustomUser, Appointment, TreatmentPlan

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        help_text="Password must be at least 8 characters long"
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        help_text="Confirm password"
    )
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'date_of_birth', 'password', 'password2', 'created_at', 'updated_at')
        extra_kwargs = {
            'first_name': {'required': True, 'help_text': 'User first name'},
            'last_name': {'required': True, 'help_text': 'User last name'},
            'email': {'required': True, 'help_text': 'User email address'},
            'role': {'help_text': 'User role: patient, therapist, or admin'},
            'phone_number': {'help_text': 'User phone number'},
            'date_of_birth': {'help_text': 'User date of birth (YYYY-MM-DD)'},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class CustomUserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'date_of_birth', 'created_at', 'updated_at')
        read_only_fields = fields

class AppointmentSerializer(serializers.ModelSerializer):
    user = CustomUserReadSerializer(read_only=True)
    days_until = serializers.SerializerMethodField(help_text="Days until appointment")
    
    class Meta:
        model = Appointment
        fields = ('id', 'user', 'date', 'note', 'status', 'duration', 'created_at', 'updated_at', 'days_until')
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'date': {'help_text': 'Appointment date and time (YYYY-MM-DD HH:MM:SS)'},
            'note': {'help_text': 'Additional notes for the appointment'},
            'status': {'help_text': 'Appointment status: scheduled, confirmed, completed, cancelled'},
            'duration': {'help_text': 'Appointment duration in minutes (minimum 15)'},
        }
    
    @swagger_serializer_method(serializer_or_field=serializers.CharField())
    def get_days_until(self, obj):
        from django.utils import timezone
        if obj.date > timezone.now():
            days = (obj.date - timezone.now()).days
            return f"{days} days"
        elif obj.date < timezone.now():
            days = (timezone.now() - obj.date).days
            return f"{days} days ago"
        else:
            return "Today"
    
    def validate_date(self, value):
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value

class TreatmentPlanSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)
    exercises_count = serializers.SerializerMethodField(help_text="Number of exercises in the plan")
    
    class Meta:
        model = TreatmentPlan
        fields = ('id', 'appointment', 'plan_details', 'exercises', 'duration_weeks', 'created_at', 'updated_at', 'exercises_count')
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'plan_details': {'help_text': 'Detailed description of the treatment plan'},
            'exercises': {'help_text': 'List of exercises in JSON format'},
            'duration_weeks': {'help_text': 'Duration of the treatment plan in weeks (minimum 1)'},
        }
    
    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_exercises_count(self, obj):
        return len(obj.exercises) if obj.exercises else 0

# Response Serializers for Documentation
class LoginResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField(help_text="User ID")
    username = serializers.CharField(help_text="Username")
    email = serializers.CharField(help_text="User email")
    first_name = serializers.CharField(help_text="First name")
    last_name = serializers.CharField(help_text="Last name")
    role = serializers.CharField(help_text="User role")

class LogoutResponseSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="Logout confirmation message")

class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Error message")
    detail = serializers.CharField(help_text="Detailed error information", required=False)

class PaginatedResponseSerializer(serializers.Serializer):
    count = serializers.IntegerField(help_text="Total number of items")
    next = serializers.CharField(help_text="URL for next page", allow_null=True)
    previous = serializers.CharField(help_text="URL for previous page", allow_null=True)
    results = serializers.ListField(help_text="List of items")

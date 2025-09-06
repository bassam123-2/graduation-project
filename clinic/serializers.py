from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from drf_yasg.utils import swagger_serializer_method
from .models import CustomUser, Appointment, TreatmentPlan, Testimonial, EmailVerification

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
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'phone_number', 'date_of_birth', 'gender', 'nationality', 
                 'address', 'city', 'postal_code', 'blood_type', 'emergency_contact',
                 'medical_history', 'treatment_reason', 'condition_description', 
                 'condition_type', 'referring_doctor', 'referral_source',
                 'password', 'password2', 'created_at', 'updated_at')
        extra_kwargs = {
            'first_name': {'required': True, 'help_text': 'User first name'},
            'last_name': {'required': True, 'help_text': 'User last name'},
            'email': {'required': True, 'help_text': 'User email address'},
            'role': {'help_text': 'User role: patient, therapist, or admin'},
            'phone_number': {'help_text': 'User phone number'},
            'date_of_birth': {'help_text': 'User date of birth (YYYY-MM-DD)'},
            'gender': {'help_text': 'User gender'},
            'nationality': {'help_text': 'User nationality'},
            'address': {'help_text': 'User complete address'},
            'city': {'help_text': 'User city'},
            'postal_code': {'help_text': 'User postal code'},
            'blood_type': {'help_text': 'User blood type'},
            'emergency_contact': {'help_text': 'Emergency contact information'},
            'medical_history': {'help_text': 'Medical history and allergies'},
            'treatment_reason': {'help_text': 'Reason for seeking treatment'},
            'condition_description': {'help_text': 'Description of condition'},
            'condition_type': {'help_text': 'Type of condition'},
            'referring_doctor': {'help_text': 'Referring doctor name'},
            'referral_source': {'help_text': 'How patient heard about us'},
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
        
        try:
            # Create and send email verification
            verification = EmailVerification.create_verification(
                user=user,
                verification_type='registration'
            )
            verification.send_verification_email()
            
            # User starts as inactive until email is verified
            user.is_active = False
            user.is_email_verified = False
        except Exception as e:
            # If email verification fails, still create the user but log the error
            print(f"Email verification failed for user {user.username}: {e}")
            # For now, make user active so they can test
            user.is_active = True
            user.is_email_verified = True
        
        user.save()
        return user

class CustomUserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'phone_number', 'date_of_birth', 'gender', 'nationality', 
                 'address', 'city', 'postal_code', 'blood_type', 'emergency_contact',
                 'medical_history', 'treatment_reason', 'condition_description', 
                 'condition_type', 'referring_doctor', 'referral_source',
                 'created_at', 'updated_at')
        read_only_fields = fields

class AppointmentSerializer(serializers.ModelSerializer):
    user = CustomUserReadSerializer(read_only=True)
    therapist = CustomUserReadSerializer(read_only=True)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    therapist_name = serializers.CharField(source='therapist.get_full_name', read_only=True)
    
    # Guest-specific fields
    is_guest = serializers.BooleanField(required=False, default=False)
    guest_id = serializers.CharField(read_only=True)
    guest_first_name = serializers.CharField(required=False, allow_blank=True)
    guest_last_name = serializers.CharField(required=False, allow_blank=True)
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_phone = serializers.CharField(required=False, allow_blank=True)
    guest_age = serializers.IntegerField(required=False, min_value=1, max_value=120)
    guest_gender = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], required=False)
    
    # Additional fields for comprehensive appointment booking
    patient_first_name = serializers.CharField(write_only=True, required=False)
    patient_last_name = serializers.CharField(write_only=True, required=False)
    patient_email = serializers.EmailField(write_only=True, required=False)
    patient_phone = serializers.CharField(write_only=True, required=False)
    patient_dob = serializers.DateField(write_only=True, required=False)
    condition = serializers.CharField(write_only=True, required=False)
    symptoms = serializers.CharField(write_only=True, required=False)
    previous_treatment = serializers.CharField(write_only=True, required=False)
    current_medications = serializers.CharField(write_only=True, required=False)
    urgency = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Appointment
        fields = ('id', 'user', 'therapist', 'therapist_name', 'date', 'service_type', 'service_type_display', 
                 'note', 'status', 'status_display', 'duration', 'created_at', 'updated_at',
                 'is_guest', 'guest_id', 'guest_first_name', 'guest_last_name', 'guest_email', 
                 'guest_phone', 'guest_age', 'guest_gender',
                 'patient_first_name', 'patient_last_name', 'patient_email', 'patient_phone', 
                 'patient_dob', 'condition', 'symptoms', 'previous_treatment', 'current_medications', 'urgency')
        extra_kwargs = {
            'user': {'required': False},  # Allow appointments without user for non-logged in patients
            'date': {'required': True, 'help_text': 'Appointment date and time'},
            'service_type': {'help_text': 'Type of service requested'},
            'note': {'help_text': 'Additional notes for the appointment'},
            'status': {'help_text': 'Current status of the appointment'},
            'duration': {'help_text': 'Duration in minutes'},
        }
    
    def create(self, validated_data):
        # Extract additional fields that don't belong to the Appointment model
        patient_info = {}
        additional_fields = [
            'patient_first_name', 'patient_last_name', 'patient_email', 
            'patient_phone', 'patient_dob', 'condition', 'symptoms', 
            'previous_treatment', 'current_medications', 'urgency'
        ]
        
        for field in additional_fields:
            if field in validated_data:
                patient_info[field] = validated_data.pop(field)
        
        # Handle guest appointment creation
        if validated_data.get('is_guest', False):
            # For guest appointments, ensure user is None
            validated_data['user'] = None
            
            # Validate guest-specific required fields
            guest_required = ['guest_first_name', 'guest_last_name', 'guest_email', 'guest_phone']
            for field in guest_required:
                if not validated_data.get(field):
                    raise serializers.ValidationError(f"Guest appointments require {field}")
        
        # Create the appointment
        appointment = super().create(validated_data)
        
        # Store additional patient information in the note field if no user is associated
        if not appointment.user and patient_info:
            additional_notes = []
            if patient_info.get('condition'):
                additional_notes.append(f"Condition: {patient_info['condition']}")
            if patient_info.get('symptoms'):
                additional_notes.append(f"Symptoms: {patient_info['symptoms']}")
            if patient_info.get('previous_treatment'):
                additional_notes.append(f"Previous Treatment: {patient_info['previous_treatment']}")
            if patient_info.get('current_medications'):
                additional_notes.append(f"Current Medications: {patient_info['current_medications']}")
            if patient_info.get('urgency'):
                additional_notes.append(f"Urgency: {patient_info['urgency']}")
            if patient_info.get('patient_first_name') and patient_info.get('patient_last_name'):
                additional_notes.append(f"Patient: {patient_info['patient_first_name']} {patient_info['patient_last_name']}")
            if patient_info.get('patient_email'):
                additional_notes.append(f"Email: {patient_info['patient_email']}")
            if patient_info.get('patient_phone'):
                additional_notes.append(f"Phone: {patient_info['patient_phone']}")
            
            if additional_notes:
                existing_note = appointment.note or ''
                appointment.note = existing_note + '\n\n' + '\n'.join(additional_notes) if existing_note else '\n'.join(additional_notes)
                appointment.save()
        
        return appointment

class TreatmentPlanSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TreatmentPlan
        fields = ('id', 'appointment', 'plan_details', 'exercises', 'duration_weeks', 
                 'total_sessions', 'completed_sessions', 'progress_percentage', 
                 'created_at', 'updated_at')
        extra_kwargs = {
            'plan_details': {'required': True, 'help_text': 'Detailed treatment plan'},
            'exercises': {'help_text': 'List of exercises in JSON format'},
            'duration_weeks': {'help_text': 'Expected duration in weeks'},
            'total_sessions': {'help_text': 'Total number of sessions planned'},
            'completed_sessions': {'help_text': 'Number of sessions completed'},
        }

class TestimonialSerializer(serializers.ModelSerializer):
    user = CustomUserReadSerializer(read_only=True)
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    treatment_type_display = serializers.CharField(source='get_treatment_type_display', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    recommend_display = serializers.CharField(source='get_recommend_display', read_only=True)

    class Meta:
        model = Testimonial
        fields = ('id', 'user', 'full_name', 'display_name', 'age', 'email', 'phone',
                 'condition', 'treatment_type', 'treatment_type_display', 'treatment_duration',
                 'specialist', 'before_condition', 'treatment_experience', 'results',
                 'testimonial_text', 'additional_comments', 'rating', 'rating_display',
                 'recommend', 'recommend_display', 'consent', 'anonymous', 'contact_permission',
                 'media_file', 'is_approved', 'is_featured', 'created_at', 'updated_at')
        extra_kwargs = {
            'full_name': {'required': True, 'help_text': 'Full name of the patient'},
            'email': {'required': True, 'help_text': 'Email address'},
            'condition': {'required': True, 'help_text': 'Condition that was treated'},
            'treatment_type': {'required': True, 'help_text': 'Type of treatment received'},
            'before_condition': {'required': True, 'help_text': 'Condition before treatment'},
            'treatment_experience': {'required': True, 'help_text': 'Experience during treatment'},
            'results': {'required': True, 'help_text': 'Results achieved'},
            'testimonial_text': {'required': True, 'help_text': 'Complete testimonial text'},
            'rating': {'required': True, 'help_text': 'Rating from 1 to 5 stars'},
            'recommend': {'required': True, 'help_text': 'Recommendation level'},
            'consent': {'required': True, 'help_text': 'Consent to use testimonial'},
        }

# Response Serializers for API Documentation
class LoginResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    user_id = serializers.IntegerField()
    message = serializers.CharField(required=False)

class LogoutResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()

class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()
    details = serializers.DictField(required=False)

# Email Verification Serializers
class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = ('id', 'verification_type', 'verification_code', 'email', 'created_at', 'expires_at', 'is_used')
        read_only_fields = ('id', 'verification_code', 'created_at', 'expires_at', 'is_used')

class VerifyEmailSerializer(serializers.Serializer):
    verification_code = serializers.CharField(max_length=6, min_length=6, help_text="6-digit verification code")
    token = serializers.CharField(required=False, help_text="Verification token (optional)")
    email = serializers.EmailField(required=False, help_text="Email address (optional, used for verification)")

class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="Email address associated with your account")

class PasswordResetSerializer(serializers.Serializer):
    verification_code = serializers.CharField(max_length=6, min_length=6, help_text="6-digit verification code")
    token = serializers.CharField(required=False, help_text="Verification token (optional)")
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        help_text="New password"
    )
    confirm_password = serializers.CharField(
        write_only=True,
        help_text="Confirm new password"
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match."})
        return attrs

class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="Email address to resend verification to")
    verification_type = serializers.ChoiceField(
        choices=['registration', 'password_reset'],
        default='registration',
        help_text="Type of verification to resend"
    )
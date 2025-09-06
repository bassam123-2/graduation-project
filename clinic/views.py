from rest_framework import viewsets, permissions, status, serializers, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import send_mail
from django.db import connection
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from clinic.models import CustomUser, Appointment, TreatmentPlan, EmailVerification, Testimonial
from clinic.serializers import (
    CustomUserSerializer, AppointmentSerializer, TreatmentPlanSerializer, TestimonialSerializer,
    LoginResponseSerializer, LogoutResponseSerializer, ErrorResponseSerializer,
    EmailVerificationSerializer, VerifyEmailSerializer, RequestPasswordResetSerializer,
    PasswordResetSerializer, ResendVerificationSerializer
)
from clinic.filters import AppointmentFilter, TreatmentPlanFilter, CustomUserFilter
import time
import redis
import os
import re
from datetime import datetime

# Public Appointment Booking Endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def public_appointment_booking(request):
    """Public endpoint for booking appointments without authentication"""
    try:
        # Extract data from request
        data = request.data
        
        # Enhanced validation with better error messages
        validation_errors = []
        
        # Required fields validation
        required_fields = {
            'firstname': 'First Name',
            'lastname': 'Last Name', 
            'email': 'Email Address',
            'phone': 'Phone Number',
            'age': 'Age',
            'gender': 'Gender',
            'service_type': 'Service Type',
            'appointment_date': 'Appointment Date',
            'appointment_time': 'Appointment Time',
            'symptoms': 'Symptoms Description'
        }
        
        for field, display_name in required_fields.items():
            value = data.get(field)
            if not value:
                validation_errors.append(f'{display_name} is required')
            elif isinstance(value, str) and value.strip() == '':
                validation_errors.append(f'{display_name} cannot be empty')
        
        # Email format validation
        email = data.get('email', '').strip()
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            validation_errors.append('Please enter a valid email address')
        
        # Phone number validation (basic)
        phone = data.get('phone', '').strip()
        if phone and not re.match(r'^[\d\s\-\+\(\)]{10,}$', phone):
            validation_errors.append('Please enter a valid phone number (minimum 10 digits)')
        
        # Age validation
        try:
            age = int(data.get('age', 0))
            if age < 1 or age > 120:
                validation_errors.append('Age must be between 1 and 120 years')
        except (ValueError, TypeError):
            validation_errors.append('Age must be a valid number')
        
        # Gender validation
        valid_genders = ['male', 'female', 'other']
        gender = data.get('gender', '').lower().strip()
        if gender and gender not in valid_genders:
            validation_errors.append('Gender must be Male, Female, or Other')
        
        # Service type validation and mapping
        service_mapping = {
            'manual therapy': 'manual-therapy',
            'physical therapy': 'physical-therapy',
            'rehabilitation': 'rehabilitation',
            'consultation': 'consultation',
            'follow-up': 'follow-up',
            'assessment': 'assessment'
        }
        
        service_type_input = data.get('service_type', '').strip()
        if not service_type_input:
            validation_errors.append('Service type is required')
        else:
            # Map human-readable service names to model values
            service_type = service_mapping.get(service_type_input.lower(), service_type_input.lower())
            if service_type not in service_mapping.values():
                validation_errors.append('Please select a valid service type. Available options: Manual Therapy, Physical Therapy, Rehabilitation, Consultation, Follow-up, Assessment')
            else:
                # Update the data with the correct service type format
                data['service_type'] = service_type
        
        # Return validation errors if any
        if validation_errors:
            
            return Response({
                'success': False,
                'error': 'Please correct the following errors:',
                'validation_errors': validation_errors,
                'error_count': len(validation_errors),
                'received_data': data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Enhanced date and time validation
        try:
            date_str = data['appointment_date'].strip()
            time_str = data['appointment_time'].strip()
            
            # Validate date format
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
                validation_errors.append('Appointment date must be in YYYY-MM-DD format')
            
            # Validate time format
            if not re.match(r'^\d{2}:\d{2}$', time_str):
                validation_errors.append('Appointment time must be in HH:MM format (24-hour)')
            
            # Check if validation errors exist before proceeding
            if validation_errors:
                return Response({
                    'success': False,
                    'error': 'Please correct the following errors:',
                    'validation_errors': validation_errors,
                    'error_count': len(validation_errors)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse date and time
            datetime_str = f"{date_str} {time_str}:00"
            appointment_datetime = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
            
            # Make the datetime timezone-aware for comparison
            appointment_datetime = timezone.make_aware(appointment_datetime)
            
            # Check if appointment is in the future
            if appointment_datetime <= timezone.now():
                validation_errors.append('Appointment date and time must be in the future')
            
            # Check if appointment is within reasonable range (not more than 6 months in future)
            max_future_date = timezone.now() + timezone.timedelta(days=180)
            if appointment_datetime > max_future_date:
                validation_errors.append('Appointment cannot be scheduled more than 6 months in advance')
            
            # Check if appointment is during business hours (8 AM to 8 PM)
            hour = appointment_datetime.hour
            if hour < 8 or hour >= 20:
                validation_errors.append('Appointments are only available between 8:00 AM and 8:00 PM')
            
            # Return validation errors if any
            if validation_errors:
                return Response({
                    'success': False,
                    'error': 'Please correct the following errors:',
                    'validation_errors': validation_errors,
                    'error_count': len(validation_errors)
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError as e:
            return Response({
                'success': False,
                'error': 'Invalid date/time format. Please use YYYY-MM-DD for date and HH:MM for time (24-hour format)',
                'example': 'Date: 2024-12-25, Time: 14:30'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if this should be a guest appointment
        is_guest = data.get('is_guest', False)

        
        if is_guest:
            # Create guest appointment without user account
            appointment = Appointment.objects.create(
                user=None,  # No user for guest appointments
                is_guest=True,
                guest_first_name=data['firstname'],
                guest_last_name=data['lastname'],
                guest_email=data['email'],
                guest_phone=data['phone'],
                guest_age=data['age'],
                guest_gender=data['gender'],
                date=appointment_datetime,
                service_type=data['service_type'],
                note=f"Symptoms: {data.get('symptoms', '')}\n"
                     f"Medical History: {data.get('medical_history', '')}\n"
                     f"Previous Treatment: {data.get('previous_treatment', '')}\n"
                     f"Special Requirements: {data.get('special_requirements', '')}\n"
                     f"Insurance: {data.get('insurance', '')}\n"
                     f"Urgency: {data.get('urgency', 'routine')}",
                status='scheduled',
                duration=60  # Default 60 minutes
            )
            
            # Send confirmation email to guest
            try:
                subject = 'Guest Appointment Confirmation - AL-BOQAI Center'
                html_message = render_to_string('emails/guest_appointment_confirmation.html', {
                    'appointment': appointment
                })
                plain_message = strip_tags(html_message)
                
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[appointment.guest_email],
                    html_message=html_message,
                    fail_silently=False
                )
            except Exception as e:
                # Log error silently for production
                pass
            
            return Response({
                'success': True,
                'message': '🎉 Guest appointment booked successfully!',
                'appointment_id': appointment.id,
                'guest_id': appointment.guest_id,
                'appointment_date': appointment.date.strftime('%Y-%m-%d %H:%M'),
                'is_guest': True,
                'next_steps': [
                    'Check your email for confirmation details',
                    'Save your Guest ID for future reference',
                    'Arrive 10 minutes before your appointment',
                    'Bring any relevant medical documents'
                ],
                'contact_info': {
                    'phone': '+966-XX-XXX-XXXX',
                    'email': 'info@alboqai-center.com',
                    'address': 'AL-BOQAI Center, Saudi Arabia'
                }
            }, status=status.HTTP_201_CREATED)
        else:
            # Create regular user account and appointment
            user, created = CustomUser.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['email'],
                    'first_name': data['firstname'],
                    'last_name': data['lastname'],
                    'phone_number': data['phone'],
                    'gender': data['gender'],
                    'role': 'patient',
                    'is_active': True,  # Allow immediate access for booking
                    'is_email_verified': True,  # Skip email verification for now
                    'medical_history': data.get('medical_history', ''),
                    'treatment_reason': data.get('symptoms', ''),
                    'condition_description': data.get('symptoms', ''),
                    'referral_source': data.get('referral', ''),
                }
            )
            
            # Update user if they already exist
            if not created:
                user.first_name = data['firstname']
                user.last_name = data['lastname']
                user.phone_number = data['phone']
                user.medical_history = data.get('medical_history', user.medical_history or '')
                user.treatment_reason = data.get('symptoms', user.treatment_reason or '')
                user.condition_description = data.get('symptoms', user.condition_description or '')
                user.save()
            
            # Create appointment
            appointment = Appointment.objects.create(
                user=user,
                is_guest=False,
                date=appointment_datetime,
                service_type=data['service_type'],
                note=f"Symptoms: {data.get('symptoms', '')}\n"
                     f"Medical History: {data.get('medical_history', '')}\n"
                     f"Previous Treatment: {data.get('previous_treatment', '')}\n"
                     f"Special Requirements: {data.get('special_requirements', '')}\n"
                     f"Insurance: {data.get('insurance', '')}\n"
                     f"Urgency: {data.get('urgency', 'routine')}",
                status='scheduled',
                duration=60  # Default 60 minutes
            )
            
            # Send confirmation email
            try:
                subject = 'Appointment Confirmation - AL-BOQAI Center'
                html_message = render_to_string('emails/appointment_confirmation.html', {
                    'appointment': appointment,
                    'user': user
                })
                plain_message = strip_tags(html_message)
                
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=html_message,
                    fail_silently=False
                )
            except Exception as e:
                # Log error silently for production
                pass
            
            return Response({
                'success': True,
                'message': '🎉 Appointment booked successfully!',
                'appointment_id': appointment.id,
                'appointment_date': appointment.date.strftime('%Y-%m-%d %H:%M'),
                'user_id': user.id,
                'is_guest': False,
                'next_steps': [
                    'Check your email for confirmation details',
                    'Log in to your account to manage appointments',
                    'Arrive 10 minutes before your appointment',
                    'Bring any relevant medical documents'
                ],
                'contact_info': {
                    'phone': '+966-XX-XXX-XXXX',
                    'email': 'info@alboqai-center.com',
                    'address': 'AL-BOQAI Center, Saudi Arabia'
                }
            }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Log error silently for production
        pass
        
        return Response({
            'success': False,
            'error': 'We encountered an unexpected error while booking your appointment',
            'error_details': 'Please try again or contact our support team if the problem persists',
            'support_contact': {
                'phone': '+966-XX-XXX-XXXX',
                'email': 'support@alboqai-center.com'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# Guest Appointment Lookup Endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def guest_appointment_lookup(request):
    """Lookup guest appointments using guest ID and email"""
    try:
        data = request.data
        guest_id = data.get('guest_id')
        email = data.get('email')
        
        if not guest_id or not email:
            return Response({
                'success': False,
                'error': 'Both guest_id and email are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the guest appointment
        try:
            appointment = Appointment.objects.get(
                guest_id=guest_id,
                guest_email=email,
                is_guest=True
            )
        except Appointment.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No guest appointment found with the provided ID and email'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Return appointment details
        return Response({
            'success': True,
            'appointment': {
                'id': appointment.id,
                'guest_id': appointment.guest_id,
                'guest_first_name': appointment.guest_first_name,
                'guest_last_name': appointment.guest_last_name,
                'guest_email': appointment.guest_email,
                'guest_phone': appointment.guest_phone,
                'guest_age': appointment.guest_age,
                'guest_gender': appointment.guest_gender,
                'date': appointment.date.strftime('%Y-%m-%d %H:%M'),
                'service_type': appointment.service_type,
                'status': appointment.status,
                'note': appointment.note,
                'created_at': appointment.created_at.strftime('%Y-%m-%d %H:%M')
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to lookup appointment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Guest Appointment Update Endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def guest_appointment_update(request):
    """Update guest appointment details"""
    try:
        data = request.data
        guest_id = data.get('guest_id')
        email = data.get('email')
        
        if not guest_id or not email:
            return Response({
                'success': False,
                'error': 'Both guest_id and email are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the guest appointment
        try:
            appointment = Appointment.objects.get(
                guest_id=guest_id,
                guest_email=email,
                is_guest=True
            )
        except Appointment.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No guest appointment found with the provided ID and email'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Update allowed fields
        allowed_updates = ['guest_phone', 'note']
        for field in allowed_updates:
            if field in data:
                setattr(appointment, field, data[field])
        
        appointment.save()
        
        return Response({
            'success': True,
            'message': 'Appointment updated successfully',
            'appointment_id': appointment.id,
            'guest_id': appointment.guest_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to update appointment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Health Check Endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring application status
    """
    health_status = {
        'status': 'healthy',
        'timestamp': None,
        'database': 'unknown',
        'cache': 'unknown',
        'email': 'unknown',
        'version': '1.0.0'
    }
    
    try:
        from django.utils import timezone
        health_status['timestamp'] = timezone.now().isoformat()
    except Exception as e:
        health_status['timestamp'] = str(e)
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['database'] = 'healthy'
    except Exception as e:
        health_status['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Check cache (Redis)
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            health_status['cache'] = 'healthy'
        else:
            health_status['cache'] = 'unhealthy'
            health_status['status'] = 'unhealthy'
    except Exception as e:
        health_status['cache'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Check email configuration
    try:
        if hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
            health_status['email'] = 'configured'
        else:
            health_status['email'] = 'not configured'
    except Exception as e:
        health_status['email'] = f'error: {str(e)}'
    
    # Return appropriate HTTP status
    if health_status['status'] == 'healthy':
        return Response(health_status, status=status.HTTP_200_OK)
    else:
        return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    """Standalone function for resending verification emails"""
    serializer = ResendVerificationSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        verification_type = serializer.validated_data['verification_type']
        
        try:
            user = CustomUser.objects.get(email=email)
            
            # Create new verification
            verification = EmailVerification.create_verification(
                user=user,
                verification_type=verification_type
            )
            verification.send_verification_email()
            
            return Response({
                'success': True,
                'message': f'New {verification_type} verification code sent to your email.'
            })
            
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'No account found with this email address.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow access for testing
    filterset_class = CustomUserFilter
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'created_at']
    ordering = ['username']

    def get_permissions(self):
        """Override permissions for specific actions - ALLOW ALL FOR TESTING"""
        return [permissions.AllowAny()]  # Allow everything without authentication

    def create(self, request, *args, **kwargs):
        """Override create method to provide better error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # For development/testing, auto-verify users upon creation
            user.is_email_verified = True
            user.is_active = True
            user.save()
            print(f"Auto-verified new user {user.username} for development")
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            return Response({
                'success': False,
                'error': 'Validation error',
                'details': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Registration failed',
                'message': 'An error occurred during registration. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.role == 'patient':
                return CustomUser.objects.filter(id=self.request.user.id)
            elif self.request.user.role == 'therapist':
                return CustomUser.objects.filter(role='patient')
            elif self.request.user.role == 'admin':
                return CustomUser.objects.all()
        # For development/testing, allow access to all users
        return CustomUser.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to handle non-existent users gracefully"""
        try:
            return super().retrieve(request, *args, **kwargs)
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found',
                'message': 'The requested user does not exist'
            }, status=404)

    def list(self, request, *args, **kwargs):
        """List users with proper permissions"""
        queryset = self.get_queryset()
        
        if not queryset.exists():
            return Response({'message': 'No users found or access denied'}, status=200)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['username', 'password']
        ),
        responses={
            200: LoginResponseSerializer,
            401: ErrorResponseSerializer,
            400: ErrorResponseSerializer,
        },
        operation_description="Authenticate user and return user data with token"
    )
    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        
        # First, check if user exists and get their status
        try:
            user = CustomUser.objects.get(username=username)
            
            # For development/testing, auto-verify users if they're not verified
            if not user.is_email_verified:
                user.is_email_verified = True
                user.is_active = True
                user.save()
                print(f"Auto-verified user {username} for development")
            
            # Check if account is active
            if not user.is_active:
                return Response({
                    'error': 'Account is not active. Please verify your email first.',
                    'needs_verification': True,
                    'email': user.email
                }, status=401)
            
            # Now try to authenticate
            authenticated_user = authenticate(request, username=username, password=password)
            if authenticated_user is not None:
                login(request, authenticated_user)
                
                # Return full user data for profile display
                user_data = {
                    'id': authenticated_user.id,
                    'username': authenticated_user.username,
                    'email': authenticated_user.email,
                    'first_name': authenticated_user.first_name,
                    'last_name': authenticated_user.last_name,
                    'phone_number': authenticated_user.phone_number,
                    'gender': authenticated_user.gender,
                    'date_of_birth': authenticated_user.date_of_birth.isoformat() if authenticated_user.date_of_birth else None,
                    'address': authenticated_user.address,
                    'city': authenticated_user.city,
                    'blood_type': authenticated_user.blood_type,
                    'emergency_contact': authenticated_user.emergency_contact,
                    'medical_history': authenticated_user.medical_history,
                    'treatment_reason': authenticated_user.treatment_reason,
                    'condition_description': authenticated_user.condition_description,
                    'role': authenticated_user.role,
                    'created_at': authenticated_user.created_at.isoformat() if authenticated_user.created_at else None
                }
                
                return Response({
                    'success': True, 
                    'user_id': authenticated_user.id,
                    'username': authenticated_user.username,
                    'email': authenticated_user.email,
                    'role': authenticated_user.role,
                    'user': user_data  # Include full user data
                })
            else:
                return Response({'error': 'Invalid password. Please check your password and try again.'}, status=401)
                
        except CustomUser.DoesNotExist:
            # Don't reveal if username exists or not for security
            return Response({'error': 'Invalid credentials. Please check your username and password.'}, status=401)

    @swagger_auto_schema(
        responses={
            200: LogoutResponseSerializer,
            401: ErrorResponseSerializer,
        },
        operation_description="Logout user and clear session"
    )
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'success': True})

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user's profile data"""
        if request.user.is_authenticated:
            user = request.user
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'gender': user.gender,
                'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
                'address': user.address,
                'city': user.city,
                'blood_type': user.blood_type,
                'emergency_contact': user.emergency_contact,
                'medical_history': user.medical_history,
                'treatment_reason': user.treatment_reason,
                'condition_description': user.condition_description,
                'role': user.role,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
            return Response({
                'success': True,
                'user': user_data
            })
        else:
            return Response({
                'success': False,
                'error': 'User not authenticated'
            }, status=401)

    @swagger_auto_schema(
        request_body=VerifyEmailSerializer,
        responses={
            200: openapi.Response('Email verified successfully', LoginResponseSerializer),
            400: ErrorResponseSerializer,
            404: ErrorResponseSerializer,
        },
        operation_description="Verify email address with verification code"
    )
    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            verification_code = serializer.validated_data['verification_code']
            token = serializer.validated_data.get('token')
            
            # Clean and normalize the verification code
            verification_code = str(verification_code).strip()
            

            
            # Find verification by code or token
            try:
                if token:
                    # Try to find by token first
                    verification = EmailVerification.objects.get(
                        token=token,
                        is_used=False
                    )

                else:
                    # Try to find by verification code and email (if provided) or just code
                    email = serializer.validated_data.get('email')
                    if email:
                        verification = EmailVerification.objects.get(
                            verification_code=verification_code,
                            email=email,
                            verification_type='registration',
                            is_used=False
                        )

                    else:
                        # Try to find by verification code only (for registration verifications)
                        verification = EmailVerification.objects.get(
                            verification_code=verification_code,
                            verification_type='registration',
                            is_used=False
                        )

                

                
                if verification.is_expired():
                    return Response(
                        {'error': 'Verification code has expired. Please request a new one.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Mark verification as used
                verification.mark_as_used()
                
                # Activate user account
                user = verification.user
                user.is_active = True
                user.is_email_verified = True
                user.save()
                
                # Log user in
                login(request, user)
                
                return Response({
                    'success': True,
                    'message': 'Email verified successfully. Your account is now active.',
                    'user_id': user.id,
                    'user': CustomUserSerializer(user).data
                })
                
            except EmailVerification.DoesNotExist:
                # Try to find any verification for debugging
                all_verifications = EmailVerification.objects.filter(
                    verification_type='registration',
                    is_used=False
                ).order_by('-created_at')
                

                
                return Response(
                    {'error': 'Invalid verification code. Please check the code and try again.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                return Response(
                    {'error': 'Verification error occurred. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=RequestPasswordResetSerializer,
        responses={
            200: openapi.Response('Password reset email sent'),
            404: ErrorResponseSerializer,
        },
        operation_description="Request password reset via email"
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_password_reset(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = CustomUser.objects.get(email=email, is_active=True)
                
                # Create password reset verification
                verification = EmailVerification.create_verification(
                    user=user,
                    verification_type='password_reset'
                )
                verification.send_verification_email()
                
                return Response({
                    'success': True,
                    'message': 'Password reset verification code sent to your email.'
                })
                
            except CustomUser.DoesNotExist:
                # Don't reveal if email exists or not for security
                return Response({
                    'success': True,
                    'message': 'If an account with this email exists, a password reset code has been sent.'
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=PasswordResetSerializer,
        responses={
            200: openapi.Response('Password reset successfully'),
            400: ErrorResponseSerializer,
            404: ErrorResponseSerializer,
        },
        operation_description="Reset password with verification code"
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            verification_code = serializer.validated_data['verification_code']
            token = serializer.validated_data.get('token')
            new_password = serializer.validated_data['new_password']
            
            # Find password reset verification
            verification_query = Q(
                verification_code=verification_code,
                verification_type='password_reset',
                is_used=False
            )
            if token:
                verification_query |= Q(
                    token=token,
                    verification_type='password_reset',
                    is_used=False
                )
            
            try:
                verification = EmailVerification.objects.get(verification_query)
                
                if verification.is_expired():
                    return Response(
                        {'error': 'Verification code has expired. Please request a new password reset.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Mark verification as used
                verification.mark_as_used()
                
                # Reset user password
                user = verification.user
                user.set_password(new_password)
                user.save()
                
                return Response({
                    'success': True,
                    'message': 'Password reset successfully. You can now login with your new password.'
                })
                
            except EmailVerification.DoesNotExist:
                return Response(
                    {'error': 'Invalid verification code.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=ResendVerificationSerializer,
        responses={
            200: openapi.Response('Verification email resent'),
            404: ErrorResponseSerializer,
        },
        operation_description="Resend verification email"
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def resend_verification(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            verification_type = serializer.validated_data['verification_type']
            
            try:
                user = CustomUser.objects.get(email=email)
                
                # Create new verification
                verification = EmailVerification.create_verification(
                    user=user,
                    verification_type=verification_type
                )
                verification.send_verification_email()
                
                return Response({
                    'success': True,
                    'message': f'New {verification_type} verification code sent to your email.'
                })
                
            except CustomUser.DoesNotExist:
                return Response(
                    {'error': 'No account found with this email address.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses={
            200: CustomUserSerializer,
            401: ErrorResponseSerializer,
        },
        operation_description="Validate user session and return user data"
    )
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def validate_session(self, request):
        """Validate current user session and return user data"""
        try:
            user = request.user
            if user.is_authenticated:
                return Response({
                    'success': True,
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                    'is_email_verified': user.is_email_verified
                })
            else:
                return Response({'error': 'User not authenticated'}, status=401)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing appointments"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = AppointmentFilter
    search_fields = ['user__username', 'user__email', 'service_type', 'status']
    ordering_fields = ['date', 'created_at', 'updated_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'new_date': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', description='New appointment date and time'),
                'reschedule_reason': openapi.Schema(type=openapi.TYPE_STRING, description='Reason for rescheduling'),
                'new_service_type': openapi.Schema(type=openapi.TYPE_STRING, description='New service type (optional)'),
                'new_duration': openapi.Schema(type=openapi.TYPE_INTEGER, description='New duration in minutes (optional)'),
                'new_note': openapi.Schema(type=openapi.TYPE_STRING, description='Additional notes (optional)'),
            },
            required=['new_date', 'reschedule_reason']
        ),
        responses={
            200: AppointmentSerializer,
            400: ErrorResponseSerializer,
            404: ErrorResponseSerializer,
            403: ErrorResponseSerializer,
        },
        operation_description="Reschedule an existing appointment"
    )
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reschedule(self, request, pk=None):
        """Reschedule an appointment"""
        try:
            appointment = self.get_object()
            
            # Check if user has permission to reschedule this appointment
            user = request.user
            if user.role not in ['admin', 'therapist'] and appointment.user != user:
                return Response({
                    'success': False,
                    'error': 'You do not have permission to reschedule this appointment'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Validate new date
            new_date_str = request.data.get('new_date')
            if not new_date_str:
                return Response({
                    'success': False,
                    'error': 'New appointment date is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                from datetime import datetime
                new_date = datetime.fromisoformat(new_date_str.replace('Z', '+00:00'))
                new_date = timezone.make_aware(new_date)
                
                # Check if new date is in the future
                if new_date <= timezone.now():
                    return Response({
                        'success': False,
                        'error': 'New appointment date must be in the future'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check for conflicts with other appointments
            conflicting_appointments = Appointment.objects.filter(
                user=appointment.user,
                date=new_date,
                status__in=['scheduled', 'confirmed']
            ).exclude(id=appointment.id)
            
            if conflicting_appointments.exists():
                return Response({
                    'success': False,
                    'error': 'There is already an appointment scheduled at this time'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update appointment
            old_date = appointment.date
            appointment.date = new_date
            appointment.status = 'scheduled'  # Reset status to scheduled
            
            # Update optional fields if provided
            if 'new_service_type' in request.data:
                appointment.service_type = request.data['new_service_type']
            if 'new_duration' in request.data:
                appointment.duration = request.data['new_duration']
            if 'new_note' in request.data:
                appointment.note = request.data['new_note']
            
            # Add reschedule information to notes
            reschedule_reason = request.data.get('reschedule_reason', 'No reason provided')
            reschedule_note = f"Rescheduled from {old_date.strftime('%Y-%m-%d %H:%M')} to {new_date.strftime('%Y-%m-%d %H:%M')}. Reason: {reschedule_reason}"
            
            if appointment.note:
                appointment.note += f"\n\n{reschedule_note}"
            else:
                appointment.note = reschedule_note
            
            appointment.save()
            
            # Serialize and return updated appointment
            serializer = self.get_serializer(appointment)
            return Response({
                'success': True,
                'message': 'Appointment rescheduled successfully',
                'appointment': serializer.data
            })
            
        except Appointment.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Appointment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to reschedule appointment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TreatmentPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing treatment plans"""
    queryset = TreatmentPlan.objects.all()
    serializer_class = TreatmentPlanSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = TreatmentPlanFilter
    search_fields = ['plan_details', 'appointment__user__username']
    ordering_fields = ['created_at', 'duration_weeks']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(appointment__user_id=user_id)
        return queryset


class TestimonialViewSet(viewsets.ModelViewSet):
    """ViewSet for managing testimonials"""
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ['user__username', 'content', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at', '-rating']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Only show approved testimonials for public access
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_approved=True)
        return queryset


class HomeView(viewsets.ViewSet):
    """Simple home view for the root URL"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Return a simple welcome message"""
        return Response({
            'message': 'Welcome to AL-BOQAI Center API',
            'version': '1.0',
            'status': 'active'
        })

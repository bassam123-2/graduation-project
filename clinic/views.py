from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from clinic.models import CustomUser, Appointment, TreatmentPlan
from clinic.serializers import (
    CustomUserSerializer, AppointmentSerializer, TreatmentPlanSerializer,
    LoginResponseSerializer, LogoutResponseSerializer, ErrorResponseSerializer
)
from clinic.filters import AppointmentFilter, TreatmentPlanFilter, CustomUserFilter
import time

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = CustomUserFilter
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'created_at']
    ordering = ['username']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.role == 'patient':
                return CustomUser.objects.filter(id=self.request.user.id)
            elif self.request.user.role == 'therapist':
                return CustomUser.objects.filter(role='patient')
        return CustomUser.objects.all()

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
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'success': True, 'user_id': user.id})
        return Response({'error': 'Invalid credentials'}, status=401)

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

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = AppointmentFilter
    search_fields = ['note', 'user__username', 'user__first_name', 'user__last_name']
    ordering_fields = ['date', 'status', 'created_at']
    ordering = ['date']

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.role == 'patient':
                return Appointment.objects.filter(user=self.request.user)
            elif self.request.user.role == 'therapist':
                return Appointment.objects.filter(user__role='patient')
        return Appointment.objects.all()

class TreatmentPlanViewSet(viewsets.ModelViewSet):
    queryset = TreatmentPlan.objects.all()
    serializer_class = TreatmentPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TreatmentPlanFilter
    search_fields = ['plan_details', 'appointment__user__username']
    ordering_fields = ['created_at', 'duration_weeks']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.role == 'patient':
                return TreatmentPlan.objects.filter(appointment__user=self.request.user)
            elif self.request.user.role == 'therapist':
                return TreatmentPlan.objects.filter(appointment__user__role='patient')
        return TreatmentPlan.objects.all()

class HomeView(viewsets.ViewSet):
    def get(self, request):
        return Response({
            "title": "Physio Clinic API",
            "description": "Welcome to the Physio Clinic API",
            "endpoints": {
                "documentation": "/swagger/",
                "api": "/api/"
            }
        })




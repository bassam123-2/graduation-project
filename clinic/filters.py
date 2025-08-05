import django_filters
from django_filters import rest_framework as filters
from .models import Appointment, TreatmentPlan, CustomUser
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q

class AppointmentFilter(filters.FilterSet):
    date_from = filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    status = filters.ChoiceFilter(choices=Appointment.STATUS_CHOICES)
    user = filters.ModelChoiceFilter(queryset=CustomUser.objects.all())
    today = filters.BooleanFilter(method='filter_today')
    upcoming = filters.BooleanFilter(method='filter_upcoming')
    past = filters.BooleanFilter(method='filter_past')
    
    class Meta:
        model = Appointment
        fields = {
            'date': ['exact', 'date'],
            'status': ['exact', 'in'],
            'duration': ['exact', 'gte', 'lte'],
        }
    
    def filter_today(self, queryset, name, value):
        if value:
            today = timezone.now().date()
            return queryset.filter(date__date=today)
        return queryset
    
    def filter_upcoming(self, queryset, name, value):
        if value:
            return queryset.filter(date__gte=timezone.now())
        return queryset
    
    def filter_past(self, queryset, name, value):
        if value:
            return queryset.filter(date__lt=timezone.now())
        return queryset

class TreatmentPlanFilter(filters.FilterSet):
    appointment = filters.ModelChoiceFilter(queryset=Appointment.objects.all())
    duration_weeks = filters.NumberFilter()
    duration_weeks_min = filters.NumberFilter(field_name='duration_weeks', lookup_expr='gte')
    duration_weeks_max = filters.NumberFilter(field_name='duration_weeks', lookup_expr='lte')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = TreatmentPlan
        fields = {
            'duration_weeks': ['exact', 'gte', 'lte'],
            'created_at': ['exact', 'date'],
        }

class CustomUserFilter(filters.FilterSet):
    role = filters.ChoiceFilter(choices=CustomUser.ROLE_CHOICES)
    is_active = filters.BooleanFilter()
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    search = filters.CharFilter(method='search_filter')
    
    class Meta:
        model = CustomUser
        fields = {
            'username': ['exact', 'icontains'],
            'email': ['exact', 'icontains'],
            'first_name': ['exact', 'icontains'],
            'last_name': ['exact', 'icontains'],
            'role': ['exact', 'in'],
            'is_active': ['exact'],
        }
    
    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(username__icontains=value) |
            Q(email__icontains=value) |
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value)
        ) 
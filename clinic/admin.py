
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from django.utils import timezone
from .models import CustomUser, Appointment, TreatmentPlan

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'last_login')
    list_filter = ('role', 'is_active', 'date_joined', 'last_login')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Physio Info', {'fields': ('role', 'phone_number', 'date_of_birth')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Physio Info', {'fields': ('role', 'phone_number', 'date_of_birth')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'status', 'duration', 'created_at', 'get_days_until')
    list_filter = ('status', 'date', 'created_at', 'user__role')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'note')
    ordering = ('-date',)
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('user', 'date', 'status', 'duration', 'note')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_days_until(self, obj):
        if obj.date > timezone.now():
            days = (obj.date - timezone.now()).days
            return f"{days} days"
        elif obj.date < timezone.now():
            days = (timezone.now() - obj.date).days
            return f"{days} days ago"
        else:
            return "Today"
    get_days_until.short_description = 'Days Until'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        if search_term:
            queryset |= self.model.objects.filter(
                Q(user__username__icontains=search_term) |
                Q(user__first_name__icontains=search_term) |
                Q(user__last_name__icontains=search_term) |
                Q(note__icontains=search_term)
            )
        return queryset, use_distinct

@admin.register(TreatmentPlan)
class TreatmentPlanAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'duration_weeks', 'created_at', 'get_patient_name')
    list_filter = ('duration_weeks', 'created_at', 'appointment__status')
    search_fields = ('plan_details', 'appointment__user__username', 'appointment__user__first_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Treatment Plan', {
            'fields': ('appointment', 'plan_details', 'exercises', 'duration_weeks')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_patient_name(self, obj):
        return f"{obj.appointment.user.first_name} {obj.appointment.user.last_name}"
    get_patient_name.short_description = 'Patient'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('appointment__user')

# Customize admin site
admin.site.site_header = "Physio Clinic Administration"
admin.site.site_title = "Physio Clinic Admin"
admin.site.index_title = "Welcome to Physio Clinic Administration"


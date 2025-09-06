
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from django.utils import timezone
from .models import CustomUser, Appointment, TreatmentPlan, Testimonial, EmailVerification

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_email_verified', 'date_joined', 'last_login')
    list_filter = ('role', 'is_active', 'is_email_verified', 'date_joined', 'last_login')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Basic Info', {'fields': ('role', 'phone_number', 'date_of_birth', 'gender', 'nationality')}),
        ('Address', {'fields': ('address', 'city', 'postal_code')}),
        ('Medical Info', {'fields': ('blood_type', 'emergency_contact', 'medical_history'), 'classes': ('collapse',)}),
        ('Treatment Info', {'fields': ('treatment_reason', 'condition_description', 'condition_type', 'referring_doctor', 'referral_source'), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Basic Info', {'fields': ('role', 'phone_number', 'date_of_birth', 'gender', 'nationality')}),
        ('Address', {'fields': ('address', 'city', 'postal_code')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'service_type', 'status', 'therapist', 'duration', 'created_at', 'get_days_until')
    list_filter = ('service_type', 'status', 'date', 'created_at', 'user__role', 'therapist')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'note', 'therapist__first_name', 'therapist__last_name')
    ordering = ('-date',)
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('user', 'date', 'service_type', 'therapist', 'status', 'duration', 'note')
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
    list_display = ('appointment', 'duration_weeks', 'total_sessions', 'completed_sessions', 'progress_percentage', 'created_at', 'get_patient_name')
    list_filter = ('duration_weeks', 'created_at', 'appointment__status', 'progress_percentage')
    search_fields = ('plan_details', 'appointment__user__username', 'appointment__user__first_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'progress_percentage')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Treatment Plan', {
            'fields': ('appointment', 'plan_details', 'exercises', 'duration_weeks')
        }),
        ('Progress Tracking', {
            'fields': ('total_sessions', 'completed_sessions', 'progress_percentage')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['calculate_progress']
    
    def calculate_progress(self, request, queryset):
        updated_count = 0
        for plan in queryset:
            plan.calculate_progress()
            updated_count += 1
        self.message_user(request, f'Progress calculated for {updated_count} treatment plans.')
    calculate_progress.short_description = 'Calculate progress for selected plans'
    
    def get_patient_name(self, obj):
        return f"{obj.appointment.user.first_name} {obj.appointment.user.last_name}"
    get_patient_name.short_description = 'Patient'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('appointment__user')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('get_display_name', 'treatment_type', 'rating', 'is_approved', 'is_featured', 'created_at')
    list_filter = ('treatment_type', 'rating', 'is_approved', 'is_featured', 'anonymous', 'created_at')
    search_fields = ('full_name', 'email', 'condition', 'testimonial_text', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'approved_at', 'get_display_name')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'full_name', 'get_display_name', 'age', 'email', 'phone')
        }),
        ('Treatment Information', {
            'fields': ('condition', 'treatment_type', 'treatment_duration', 'specialist')
        }),
        ('Testimonial Content', {
            'fields': ('before_condition', 'treatment_experience', 'results', 'testimonial_text', 'additional_comments')
        }),
        ('Ratings & Recommendations', {
            'fields': ('rating', 'recommend')
        }),
        ('Privacy & Permissions', {
            'fields': ('consent', 'anonymous', 'contact_permission')
        }),
        ('Media', {
            'fields': ('media_file',),
            'classes': ('collapse',)
        }),
        ('Moderation', {
            'fields': ('is_approved', 'is_featured', 'approved_by', 'approved_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_testimonials', 'feature_testimonials', 'unfeatured_testimonials']
    
    def approve_testimonials(self, request, queryset):
        updated_count = queryset.update(is_approved=True, approved_by=request.user, approved_at=timezone.now())
        self.message_user(request, f'{updated_count} testimonials approved.')
    approve_testimonials.short_description = 'Approve selected testimonials'
    
    def feature_testimonials(self, request, queryset):
        updated_count = queryset.update(is_featured=True)
        self.message_user(request, f'{updated_count} testimonials featured.')
    feature_testimonials.short_description = 'Feature selected testimonials'
    
    def unfeatured_testimonials(self, request, queryset):
        updated_count = queryset.update(is_featured=False)
        self.message_user(request, f'{updated_count} testimonials unfeatured.')
    unfeatured_testimonials.short_description = 'Unfeature selected testimonials'
    
    def get_display_name(self, obj):
        return obj.get_display_name()
    get_display_name.short_description = 'Display Name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'approved_by')

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'verification_type', 'verification_code', 'email', 'is_used', 'is_expired_status', 'created_at')
    list_filter = ('verification_type', 'is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'email', 'verification_code', 'token')
    ordering = ('-created_at',)
    readonly_fields = ('token', 'verification_code', 'created_at', 'expires_at', 'used_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Verification Details', {
            'fields': ('user', 'verification_type', 'email', 'verification_code', 'token')
        }),
        ('Status', {
            'fields': ('is_used', 'used_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_used', 'resend_verification']
    
    def is_expired_status(self, obj):
        try:
            if obj.is_expired():
                return format_html('<span style="color: red;">Expired</span>')
            else:
                return format_html('<span style="color: green;">Valid</span>')
        except Exception as e:
            return format_html('<span style="color: orange;">Error: {}</span>', str(e)[:20])
    is_expired_status.short_description = 'Status'
    
    def mark_as_used(self, request, queryset):
        updated_count = 0
        for verification in queryset:
            try:
                if not verification.is_used:
                    verification.mark_as_used()
                    updated_count += 1
            except Exception as e:
                self.message_user(request, f'Error updating verification {verification.id}: {e}', level='ERROR')
        self.message_user(request, f'{updated_count} verifications marked as used.')
    mark_as_used.short_description = 'Mark selected verifications as used'
    
    def resend_verification(self, request, queryset):
        sent_count = 0
        error_count = 0
        for verification in queryset.filter(is_used=False):
            try:
                if verification.send_verification_email():
                    sent_count += 1
                else:
                    error_count += 1
            except Exception as e:
                error_count += 1
                self.message_user(request, f'Error resending verification {verification.id}: {e}', level='ERROR')
        
        if sent_count > 0:
            self.message_user(request, f'{sent_count} verification emails resent successfully.')
        if error_count > 0:
            self.message_user(request, f'{error_count} verifications failed to send.', level='WARNING')
    resend_verification.short_description = 'Resend verification emails'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

# Customize admin site
admin.site.site_header = "AL-BOQAI Center Administration"
admin.site.site_title = "AL-BOQAI Admin"
admin.site.index_title = "Welcome to AL-BOQAI Center Administration"


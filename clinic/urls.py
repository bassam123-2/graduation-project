from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet, AppointmentViewSet, TreatmentPlanViewSet, TestimonialViewSet, health_check, resend_verification, public_appointment_booking, guest_appointment_lookup, guest_appointment_update

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'treatment-plans', TreatmentPlanViewSet)
router.register(r'testimonials', TestimonialViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health_check'),
    path('resend-verification/', resend_verification, name='resend_verification'),
    path('book-appointment/', public_appointment_booking, name='public_appointment_booking'),
    path('guest-lookup/', guest_appointment_lookup, name='guest_appointment_lookup'),
    path('guest-update/', guest_appointment_update, name='guest_appointment_update'),
] 
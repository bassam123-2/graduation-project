from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet, AppointmentViewSet, TreatmentPlanViewSet

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'treatment-plans', TreatmentPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from clinic.models import CustomUser, Appointment, TreatmentPlan


@pytest.mark.django_db
@pytest.mark.api
class TestCustomUserViewSet:
    """Test cases for CustomUserViewSet"""

    def test_list_users_authenticated(self, authenticated_patient_client, multiple_patients):
        """Test listing users when authenticated"""
        url = reverse('customuser-list')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == len(multiple_patients) + 1  # +1 for the authenticated user

    def test_list_users_unauthenticated(self, api_client):
        """Test listing users when not authenticated"""
        url = reverse('customuser-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_user_success(self, api_client, valid_user_data):
        """Test creating a user successfully"""
        url = reverse('customuser-list')
        response = api_client.post(url, valid_user_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == valid_user_data['username']
        assert response.data['email'] == valid_user_data['email']
        assert 'password' not in response.data

    def test_create_user_invalid_data(self, api_client):
        """Test creating a user with invalid data"""
        url = reverse('customuser-list')
        invalid_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'password2': 'different_password'
        }
        response = api_client.post(url, invalid_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data

    def test_retrieve_user_authenticated(self, authenticated_patient_client, patient_user):
        """Test retrieving a user when authenticated"""
        url = reverse('customuser-detail', kwargs={'pk': patient_user.pk})
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == patient_user.username

    def test_update_user_authenticated(self, authenticated_patient_client, patient_user):
        """Test updating a user when authenticated"""
        url = reverse('customuser-detail', kwargs={'pk': patient_user.pk})
        update_data = {'first_name': 'Updated Name'}
        response = authenticated_patient_client.patch(url, update_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated Name'

    def test_delete_user_authenticated(self, authenticated_patient_client, patient_user):
        """Test deleting a user when authenticated"""
        url = reverse('customuser-detail', kwargs={'pk': patient_user.pk})
        response = authenticated_patient_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not CustomUser.objects.filter(pk=patient_user.pk).exists()

    def test_login_success(self, api_client, patient_user):
        """Test successful login"""
        url = reverse('customuser-login')
        login_data = {
            'username': patient_user.username,
            'password': 'testpass123'
        }
        response = api_client.post(url, login_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == patient_user.username

    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        url = reverse('customuser-login')
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, login_data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_login_missing_fields(self, api_client):
        """Test login with missing fields"""
        url = reverse('customuser-login')
        login_data = {'username': 'testuser'}
        response = api_client.post(url, login_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_logout_success(self, authenticated_patient_client):
        """Test successful logout"""
        url = reverse('customuser-logout')
        response = authenticated_patient_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Logged out successfully'

    def test_logout_unauthenticated(self, api_client):
        """Test logout when not authenticated"""
        url = reverse('customuser-logout')
        response = api_client.post(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_search_users(self, authenticated_patient_client, patient_user):
        """Test searching users"""
        url = reverse('customuser-list')
        response = authenticated_patient_client.get(url, {'search': patient_user.username})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
        assert patient_user.username in response.data['results'][0]['username']

    def test_filter_users_by_role(self, authenticated_patient_client, multiple_patients):
        """Test filtering users by role"""
        url = reverse('customuser-list')
        response = authenticated_patient_client.get(url, {'role': 'patient'})
        
        assert response.status_code == status.HTTP_200_OK
        for user_data in response.data['results']:
            assert user_data['role'] == 'patient'


@pytest.mark.django_db
@pytest.mark.api
class TestAppointmentViewSet:
    """Test cases for AppointmentViewSet"""

    def test_list_appointments_patient(self, authenticated_patient_client, patient_appointment):
        """Test listing appointments for a patient"""
        url = reverse('appointment-list')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['id'] == patient_appointment.id

    def test_list_appointments_therapist(self, authenticated_therapist_client, patient_appointment):
        """Test listing appointments for a therapist"""
        url = reverse('appointment-list')
        response = authenticated_therapist_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1

    def test_create_appointment_success(self, authenticated_patient_client, valid_appointment_data):
        """Test creating an appointment successfully"""
        url = reverse('appointment-list')
        response = authenticated_patient_client.post(url, valid_appointment_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['note'] == valid_appointment_data['note']
        assert response.data['status'] == valid_appointment_data['status']

    def test_create_appointment_past_date(self, authenticated_patient_client):
        """Test creating an appointment with past date"""
        url = reverse('appointment-list')
        past_date_data = {
            'date': (timezone.now() - timedelta(days=1)).isoformat(),
            'note': 'Past appointment',
            'status': 'scheduled',
            'duration': 60
        }
        response = authenticated_patient_client.post(url, past_date_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'date' in response.data

    def test_retrieve_appointment_owner(self, authenticated_patient_client, patient_appointment):
        """Test retrieving own appointment"""
        url = reverse('appointment-detail', kwargs={'pk': patient_appointment.pk})
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == patient_appointment.id

    def test_retrieve_appointment_therapist(self, authenticated_therapist_client, patient_appointment):
        """Test therapist retrieving patient appointment"""
        url = reverse('appointment-detail', kwargs={'pk': patient_appointment.pk})
        response = authenticated_therapist_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == patient_appointment.id

    def test_update_appointment_owner(self, authenticated_patient_client, patient_appointment):
        """Test updating own appointment"""
        url = reverse('appointment-detail', kwargs={'pk': patient_appointment.pk})
        update_data = {'note': 'Updated note'}
        response = authenticated_patient_client.patch(url, update_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['note'] == 'Updated note'

    def test_delete_appointment_owner(self, authenticated_patient_client, patient_appointment):
        """Test deleting own appointment"""
        url = reverse('appointment-detail', kwargs={'pk': patient_appointment.pk})
        response = authenticated_patient_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Appointment.objects.filter(pk=patient_appointment.pk).exists()

    def test_upcoming_appointments(self, authenticated_patient_client, future_appointment, past_appointment):
        """Test getting upcoming appointments"""
        url = reverse('appointment-upcoming')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == future_appointment.id

    def test_today_appointments(self, authenticated_patient_client, today_appointment):
        """Test getting today's appointments"""
        url = reverse('appointment-today')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == today_appointment.id

    def test_filter_appointments_by_status(self, authenticated_patient_client, patient_appointment):
        """Test filtering appointments by status"""
        url = reverse('appointment-list')
        response = authenticated_patient_client.get(url, {'status': patient_appointment.status})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['status'] == patient_appointment.status

    def test_filter_appointments_by_date(self, authenticated_patient_client, future_appointment):
        """Test filtering appointments by date"""
        url = reverse('appointment-list')
        date_from = (timezone.now() + timedelta(days=1)).date().isoformat()
        response = authenticated_patient_client.get(url, {'date_from': date_from})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_search_appointments(self, authenticated_patient_client, patient_appointment):
        """Test searching appointments"""
        url = reverse('appointment-list')
        response = authenticated_patient_client.get(url, {'search': patient_appointment.note})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


@pytest.mark.django_db
@pytest.mark.api
class TestTreatmentPlanViewSet:
    """Test cases for TreatmentPlanViewSet"""

    def test_list_treatment_plans_patient(self, authenticated_patient_client, treatment_plan):
        """Test listing treatment plans for a patient"""
        url = reverse('treatmentplan-list')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['id'] == treatment_plan.id

    def test_list_treatment_plans_therapist(self, authenticated_therapist_client, treatment_plan):
        """Test listing treatment plans for a therapist"""
        url = reverse('treatmentplan-list')
        response = authenticated_therapist_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1

    def test_create_treatment_plan_success(self, authenticated_therapist_client, patient_appointment, valid_treatment_plan_data):
        """Test creating a treatment plan successfully"""
        url = reverse('treatmentplan-list')
        valid_treatment_plan_data['appointment'] = patient_appointment.id
        response = authenticated_therapist_client.post(url, valid_treatment_plan_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['plan_details'] == valid_treatment_plan_data['plan_details']
        assert response.data['duration_weeks'] == valid_treatment_plan_data['duration_weeks']

    def test_retrieve_treatment_plan_patient(self, authenticated_patient_client, treatment_plan):
        """Test patient retrieving own treatment plan"""
        url = reverse('treatmentplan-detail', kwargs={'pk': treatment_plan.pk})
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == treatment_plan.id

    def test_retrieve_treatment_plan_therapist(self, authenticated_therapist_client, treatment_plan):
        """Test therapist retrieving treatment plan"""
        url = reverse('treatmentplan-detail', kwargs={'pk': treatment_plan.pk})
        response = authenticated_therapist_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == treatment_plan.id

    def test_update_treatment_plan_therapist(self, authenticated_therapist_client, treatment_plan):
        """Test therapist updating treatment plan"""
        url = reverse('treatmentplan-detail', kwargs={'pk': treatment_plan.pk})
        update_data = {'plan_details': 'Updated plan details'}
        response = authenticated_therapist_client.patch(url, update_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['plan_details'] == 'Updated plan details'

    def test_delete_treatment_plan_therapist(self, authenticated_therapist_client, treatment_plan):
        """Test therapist deleting treatment plan"""
        url = reverse('treatmentplan-detail', kwargs={'pk': treatment_plan.pk})
        response = authenticated_therapist_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not TreatmentPlan.objects.filter(pk=treatment_plan.pk).exists()

    def test_recent_treatment_plans(self, authenticated_patient_client, treatment_plan):
        """Test getting recent treatment plans"""
        url = reverse('treatmentplan-recent')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == treatment_plan.id

    def test_filter_treatment_plans_by_duration(self, authenticated_patient_client, treatment_plan):
        """Test filtering treatment plans by duration"""
        url = reverse('treatmentplan-list')
        response = authenticated_patient_client.get(url, {'duration_weeks': treatment_plan.duration_weeks})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['duration_weeks'] == treatment_plan.duration_weeks

    def test_search_treatment_plans(self, authenticated_patient_client, treatment_plan):
        """Test searching treatment plans"""
        url = reverse('treatmentplan-list')
        response = authenticated_patient_client.get(url, {'search': treatment_plan.plan_details})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


@pytest.mark.django_db
@pytest.mark.api
class TestAPIPermissions:
    """Test cases for API permissions"""

    def test_patient_cannot_access_other_patient_appointments(self, authenticated_patient_client, therapist_appointment):
        """Test that a patient cannot access another patient's appointments"""
        url = reverse('appointment-detail', kwargs={'pk': therapist_appointment.pk})
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_patient_cannot_access_other_patient_treatment_plans(self, authenticated_patient_client, treatment_plan):
        """Test that a patient cannot access another patient's treatment plans"""
        # Create a different patient's treatment plan
        different_patient = CustomUser.objects.create_user(
            username='different_patient',
            email='different@example.com',
            password='testpass123',
            role='patient'
        )
        different_appointment = Appointment.objects.create(
            user=different_patient,
            date=timezone.now() + timedelta(days=1)
        )
        different_plan = TreatmentPlan.objects.create(
            appointment=different_appointment,
            plan_details='Different plan'
        )
        
        url = reverse('treatmentplan-detail', kwargs={'pk': different_plan.pk})
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_therapist_can_access_all_appointments(self, authenticated_therapist_client, patient_appointment):
        """Test that a therapist can access all appointments"""
        url = reverse('appointment-detail', kwargs={'pk': patient_appointment.pk})
        response = authenticated_therapist_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK

    def test_therapist_can_access_all_treatment_plans(self, authenticated_therapist_client, treatment_plan):
        """Test that a therapist can access all treatment plans"""
        url = reverse('treatmentplan-detail', kwargs={'pk': treatment_plan.pk})
        response = authenticated_therapist_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
@pytest.mark.api
class TestAPIPagination:
    """Test cases for API pagination"""

    def test_pagination_users(self, authenticated_patient_client, multiple_patients):
        """Test pagination for users list"""
        url = reverse('customuser-list')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'count' in response.data
        assert 'next' in response.data
        assert 'previous' in response.data
        assert 'results' in response.data
        assert len(response.data['results']) <= 20  # Default page size

    def test_pagination_appointments(self, authenticated_patient_client, multiple_appointments):
        """Test pagination for appointments list"""
        url = reverse('appointment-list')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'count' in response.data
        assert 'next' in response.data
        assert 'previous' in response.data
        assert 'results' in response.data

    def test_pagination_treatment_plans(self, authenticated_patient_client, patient_appointment):
        """Test pagination for treatment plans list"""
        # Create multiple treatment plans
        for i in range(25):  # More than page size
            TreatmentPlan.objects.create(
                appointment=patient_appointment,
                plan_details=f'Plan {i+1}'
            )
        
        url = reverse('treatmentplan-list')
        response = authenticated_patient_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'count' in response.data
        assert response.data['count'] == 25
        assert len(response.data['results']) == 20  # Page size
        assert response.data['next'] is not None  # Should have next page


@pytest.mark.django_db
@pytest.mark.api
class TestAPICaching:
    """Test cases for API caching"""

    def test_upcoming_appointments_caching(self, authenticated_patient_client, future_appointment):
        """Test caching for upcoming appointments"""
        url = reverse('appointment-upcoming')
        
        # First request
        response1 = authenticated_patient_client.get(url)
        assert response1.status_code == status.HTTP_200_OK
        
        # Second request should use cache
        response2 = authenticated_patient_client.get(url)
        assert response2.status_code == status.HTTP_200_OK
        
        # Both responses should be identical
        assert response1.data == response2.data

    def test_recent_treatment_plans_caching(self, authenticated_patient_client, treatment_plan):
        """Test caching for recent treatment plans"""
        url = reverse('treatmentplan-recent')
        
        # First request
        response1 = authenticated_patient_client.get(url)
        assert response1.status_code == status.HTTP_200_OK
        
        # Second request should use cache
        response2 = authenticated_patient_client.get(url)
        assert response2.status_code == status.HTTP_200_OK
        
        # Both responses should be identical
        assert response1.data == response2.data 
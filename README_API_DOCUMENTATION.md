# API Documentation Guide for Physio Project

## 📚 **API Documentation Overview**

Your Django backend now has comprehensive API documentation using **Swagger/OpenAPI** with interactive testing capabilities.

## 🔗 **Documentation URLs**

### Primary Documentation
- **Swagger UI**: `http://localhost:8000/swagger/` - Interactive API documentation
- **ReDoc**: `http://localhost:8000/redoc/` - Clean, responsive documentation
- **API Docs**: `http://localhost:8000/api-docs/` - Alternative Swagger UI

### Raw Schema
- **JSON Schema**: `http://localhost:8000/swagger.json` - OpenAPI specification in JSON
- **YAML Schema**: `http://localhost:8000/swagger.yaml` - OpenAPI specification in YAML

## 🏠 **Home Page**
- **Landing Page**: `http://localhost:8000/` - Beautiful overview of the API

## 🔧 **Features Implemented**

### 1. **Interactive Documentation**
- ✅ **Swagger UI**: Full interactive API testing
- ✅ **ReDoc**: Clean, responsive documentation
- ✅ **Auto-generated schemas**: From Django models and serializers
- ✅ **Request/Response examples**: Real examples for all endpoints

### 2. **Comprehensive Coverage**
- ✅ **All endpoints documented**: Users, appointments, treatment plans
- ✅ **Authentication methods**: Session and token-based auth
- ✅ **Filtering and search**: All query parameters documented
- ✅ **Custom actions**: Login, logout, upcoming, today, recent

### 3. **Enhanced Serializers**
- ✅ **Help text**: Detailed descriptions for all fields
- ✅ **Validation rules**: Password requirements, date validation
- ✅ **Custom fields**: Days until appointment, exercises count
- ✅ **Response schemas**: Proper response documentation

### 4. **Security Documentation**
- ✅ **Authentication schemes**: Session and token authentication
- ✅ **Permission levels**: Role-based access control
- ✅ **Rate limiting**: API throttling documentation

## 📖 **API Endpoints Documentation**

### **Authentication Endpoints**

#### Login
```http
POST /api/users/login/
Content-Type: application/json

{
    "username": "john_doe",
    "password": "secure_password123"
}
```

**Response:**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "patient"
}
```

#### Logout
```http
POST /api/users/logout/
```

**Response:**
```json
{
    "message": "Logged out successfully"
}
```

### **User Management**

#### List Users
```http
GET /api/users/?role=patient&search=john&ordering=-created_at
```

**Query Parameters:**
- `role`: Filter by user role (patient, therapist, admin)
- `search`: Search in username, email, first_name, last_name
- `ordering`: Sort by field (- for descending)

#### Create User
```http
POST /api/users/
Content-Type: application/json

{
    "username": "new_user",
    "email": "user@example.com",
    "password": "secure_password123",
    "password2": "secure_password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "patient",
    "phone_number": "+1234567890",
    "date_of_birth": "1990-01-01"
}
```

### **Appointment Management**

#### List Appointments
```http
GET /api/appointments/?status=scheduled&date_from=2024-01-01&ordering=-date
```

**Query Parameters:**
- `status`: Filter by status (scheduled, confirmed, completed, cancelled)
- `date_from`: Filter appointments from date
- `date_to`: Filter appointments until date
- `today`: Boolean filter for today's appointments
- `upcoming`: Boolean filter for upcoming appointments
- `past`: Boolean filter for past appointments

#### Get Upcoming Appointments
```http
GET /api/appointments/upcoming/?limit=5
```

#### Get Today's Appointments
```http
GET /api/appointments/today/
```

#### Create Appointment
```http
POST /api/appointments/
Content-Type: application/json

{
    "date": "2024-01-15T10:00:00Z",
    "note": "Follow-up session for back pain",
    "status": "scheduled",
    "duration": 60
}
```

### **Treatment Plans**

#### List Treatment Plans
```http
GET /api/treatment-plans/?duration_weeks_min=2&duration_weeks_max=8
```

#### Get Recent Treatment Plans
```http
GET /api/treatment-plans/recent/?limit=3
```

#### Create Treatment Plan
```http
POST /api/treatment-plans/
Content-Type: application/json

{
    "appointment": 1,
    "plan_details": "Comprehensive rehabilitation plan for lower back pain",
    "exercises": [
        {
            "name": "Pelvic Tilt",
            "sets": 3,
            "reps": 10,
            "duration": "5 minutes"
        }
    ],
    "duration_weeks": 6
}
```

## 🔍 **Advanced Features**

### **Filtering Examples**

#### Date Range Filtering
```http
GET /api/appointments/?date_from=2024-01-01&date_to=2024-01-31
```

#### Status and User Filtering
```http
GET /api/appointments/?status=scheduled&user=1
```

#### Search Across Multiple Fields
```http
GET /api/users/?search=john
```

### **Pagination**
All list endpoints support pagination:
```json
{
    "count": 150,
    "next": "http://localhost:8000/api/appointments/?page=2",
    "previous": null,
    "results": [...]
}
```

### **Ordering**
```http
GET /api/appointments/?ordering=-date,status
GET /api/users/?ordering=first_name,-created_at
```

## 🛡️ **Security & Authentication**

### **Authentication Methods**
1. **Session Authentication**: Uses Django session cookies
2. **Token Authentication**: Uses Authorization header

### **Permission Levels**
- **Patients**: Can only access their own data
- **Therapists**: Can access all patient data
- **Admins**: Full access to all data

### **Rate Limiting**
- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour

## 🎯 **Testing the API**

### **Using Swagger UI**
1. Visit `http://localhost:8000/swagger/`
2. Click "Authorize" to authenticate
3. Use the "Try it out" button on any endpoint
4. Fill in the required parameters
5. Click "Execute" to test the API

### **Using cURL**
```bash
# Login
curl -X POST "http://localhost:8000/api/users/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Get appointments (with session cookie)
curl -X GET "http://localhost:8000/api/appointments/" \
  -H "Cookie: sessionid=your_session_id"
```

### **Using Python Requests**
```python
import requests

# Login
response = requests.post('http://localhost:8000/api/users/login/', json={
    'username': 'admin',
    'password': 'password123'
})

# Use session for subsequent requests
session = requests.Session()
session.cookies.update(response.cookies)

# Get appointments
appointments = session.get('http://localhost:8000/api/appointments/')
print(appointments.json())
```

## 📋 **Error Handling**

### **Common Error Responses**

#### 400 Bad Request
```json
{
    "error": "Username and password are required"
}
```

#### 401 Unauthorized
```json
{
    "error": "Invalid credentials"
}
```

#### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

#### 404 Not Found
```json
{
    "detail": "Not found."
}
```

#### 429 Too Many Requests
```json
{
    "detail": "Request was throttled. Expected available in 60 seconds."
}
```

## 🚀 **Getting Started**

### **1. Start the Server**
```bash
python manage.py runserver
```

### **2. Access Documentation**
- Visit `http://localhost:8000/` for the landing page
- Visit `http://localhost:8000/swagger/` for interactive documentation

### **3. Create Test Data**
```bash
python manage.py createsuperuser
```

### **4. Test Authentication**
1. Go to Swagger UI
2. Click "Authorize"
3. Use your superuser credentials
4. Test the login endpoint

### **5. Explore Endpoints**
- Start with simple GET requests
- Try filtering and searching
- Test POST requests to create data
- Use custom actions like `/upcoming/` and `/today/`

## 📚 **Additional Resources**

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [drf-yasg Documentation](https://drf-yasg.readthedocs.io/)
- [ReDoc Documentation](https://github.com/Redocly/redoc)

## 🔧 **Customization**

### **Adding New Endpoints**
1. Add the endpoint to your ViewSet
2. Add `@swagger_auto_schema` decorator
3. Document request/response schemas
4. Add help text to serializers

### **Customizing Swagger UI**
Edit `SWAGGER_SETTINGS` in `settings.py`:
```python
SWAGGER_SETTINGS = {
    'DEFAULT_INFO': 'Your API Info',
    'DEFAULT_API_URL': 'https://yourdomain.com/api/',
    'SECURITY_DEFINITIONS': {
        # Your security definitions
    }
}
```

Your API is now fully documented and ready for developers to use! 🎉 
/**
 * Configuration file for AL-BOQAI Center Frontend
 * Centralizes all API endpoints and server configurations
 */

const CONFIG = {
    // Backend API Configuration
    API: {
        BASE_URL: 'http://localhost:8080/api', // Fixed: Backend runs on port 8080
        ENDPOINTS: {
            USERS: '/users/',
            APPOINTMENTS: '/appointments/',
            TREATMENT_PLANS: '/treatment-plans/',
            TESTIMONIALS: '/testimonials/',
            HEALTH: '/health/',
            LOGIN: '/users/login/',
            LOGOUT: '/users/logout/',
            VERIFY_EMAIL: '/users/verify_email/',
            REQUEST_PASSWORD_RESET: '/users/request_password_reset/',
            RESET_PASSWORD: '/users/reset_password/',
            BOOK_APPOINTMENT: '/book-appointment/',
            REGISTER: '/users/',
            USER_PROFILE: '/users/profile/',
            VALIDATE_SESSION: '/users/validate_session/',
        }
    },
    
    // Frontend Server Configuration
    FRONTEND: {
        PORT: 3000,
        BASE_URL: 'http://localhost:3000',
        PAGES: {
            HOME: '/home.html',
            LOGIN: '/book appointment/sign in.html',
            REGISTER: '/book appointment/register.html',
            PATIENT_DASHBOARD: '/patient-dashboard.html',
            ADMIN_DASHBOARD: '/admin-dashboard.html',
            APPOINTMENTS: '/admin-appointments.html',
            TESTIMONIALS: '/share-testimony.html',
            SYMPTOM_ASSESSMENT: '/symptom-assessment.html',
        }
    },
    
    // Backend Server Configuration
    BACKEND: {
        PORT: 8080, // Fixed: Backend runs on port 8080
        BASE_URL: 'http://localhost:8080', // Fixed: Backend runs on port 8080
    },
    
    // Authentication Configuration
    AUTH: {
        SESSION_KEY: 'sessionId',
        USER_KEY: 'userId',
        ROLE_KEY: 'userRole',
        DATA_KEY: 'userData',
        TOKEN_HEADER: 'Authorization',
        STORAGE_TYPE: 'localStorage', // or 'sessionStorage'
    },
    
    // Development Settings
    DEV: {
        DEBUG: false, // Set to false for production
        LOG_LEVEL: 'error', // Only log errors in production
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3,
        MOCK_DATA: false, // Disable mock data - only show real user data
    },
    
    // Test Configuration
    TEST: {
        ENABLED: false,
        MOCK_API: false,
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3
    },
    
    // Error Messages
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        SERVER_ERROR: 'Server error. Please try again later.',
        AUTH_ERROR: 'Authentication failed. Please check your credentials.',
        VERIFICATION_NEEDED: 'Please verify your email before signing in.',
        ACCOUNT_INACTIVE: 'Account is not active. Please verify your email.',
        INVALID_CREDENTIALS: 'Invalid username or password.',
        SESSION_EXPIRED: 'Session expired. Please sign in again.',
        PERMISSION_DENIED: 'Access denied. Insufficient permissions.',
        BACKEND_UNAVAILABLE: 'Backend server is unavailable. Using fallback data.',
    },
    
    // Mock Data Configuration - Enhanced with more realistic data
    MOCK: {
        USERS: [
            { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'patient' },
            { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', role: 'patient' },
            { id: 3, first_name: 'Dr. Ahmed', last_name: 'Ali', email: 'dr.ahmed@clinic.com', role: 'therapist' }
        ],
        APPOINTMENTS: [
            { 
                id: 1, 
                user: { id: 1, first_name: 'John', last_name: 'Doe' },
                date: '2024-01-15T10:00:00Z',
                service_type: 'physical-therapy',
                status: 'scheduled',
                duration: 60
            },
            { 
                id: 2, 
                user: { id: 2, first_name: 'Jane', last_name: 'Smith' },
                date: '2024-01-16T14:00:00Z',
                service_type: 'manual-therapy',
                status: 'confirmed',
                duration: 45
            },
            { 
                id: 3, 
                user: { id: 1, first_name: 'John', last_name: 'Doe' },
                date: '2024-01-20T09:00:00Z',
                service_type: 'rehabilitation',
                status: 'scheduled',
                duration: 90
            }
        ],
        TREATMENT_PLANS: [
            {
                id: 1,
                appointment: { id: 1, user: { first_name: 'John', last_name: 'Doe' } },
                plan_details: 'Sample treatment plan for back pain rehabilitation',
                duration_weeks: 6,
                total_sessions: 12,
                completed_sessions: 3,
                created_at: '2024-01-10T09:00:00Z'
            }
        ],
        ACTIVITY_LOG: [
            {
                id: 1,
                type: 'appointment_booked',
                description: 'Booked appointment for physical therapy',
                timestamp: '2024-01-10T09:00:00Z'
            },
            {
                id: 2,
                type: 'treatment_started',
                description: 'Started rehabilitation program',
                timestamp: '2024-01-12T10:00:00Z'
            },
            {
                id: 3,
                type: 'session_completed',
                description: 'Completed session 3 of 12',
                timestamp: '2024-01-15T11:00:00Z'
            }
        ]
    }
};

// Helper functions
CONFIG.getApiUrl = function(endpoint) {
    return this.API.BASE_URL + (this.API.ENDPOINTS[endpoint] || endpoint);
};

CONFIG.getAuthHeaders = function() {
    const sessionId = localStorage.getItem(this.AUTH.SESSION_KEY);
    return sessionId ? {
        'Content-Type': 'application/json',
        [this.AUTH.TOKEN_HEADER]: `Bearer ${sessionId}`,
    } : {
        'Content-Type': 'application/json',
    };
};

CONFIG.isBackendAvailable = async function() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.DEV.TIMEOUT);
        
        const response = await fetch(this.getApiUrl('HEALTH'), {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        if (this.DEV.DEBUG) {
            // Silent in production
        }
        return false;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    // Browser environment
    window.CONFIG = CONFIG;
}

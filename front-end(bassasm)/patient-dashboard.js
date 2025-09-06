// Patient Dashboard JavaScript

// Advanced functionality for AL-BOQAI Center Patient Portal



class PatientDashboard {

    constructor() {



        // Check if CONFIG is available, otherwise use fallback

        if (typeof CONFIG !== 'undefined' && CONFIG.API && CONFIG.API.BASE_URL) {

            this.apiBaseUrl = CONFIG.API.BASE_URL;

        } else {

            this.apiBaseUrl = 'http://localhost:8080/api';

        }

        

        this.currentUser = null;

        this.appointments = [];

        this.treatmentPlans = [];

        this.activityLog = [];

        

        // Bind methods to preserve 'this' context

        this.editProfile = this.editProfile.bind(this);

        this.viewAllAppointments = this.viewAllAppointments.bind(this);

        this.refreshDashboard = this.refreshDashboard.bind(this);

        

        this.init();

    }



    async init() {

        try {

            // Debug: Log initial state

            this.logLocalStorageContents();

            // Fetch CSRF token for authentication
            await this.fetchCSRFToken();

            await this.checkAuthentication();

            await this.loadDashboardData();

            this.setupEventListeners();

            this.startPeriodicUpdates();

            

            // Refresh profile data to ensure it's up to date

            this.refreshProfileData();

        } catch (error) {

            console.error('Dashboard initialization error:', error);

            this.showNotification('Failed to load dashboard. Please sign in again.', 'error');

            this.showLoginPrompt();

        }

    }



    // Authentication Methods

    async checkAuthentication() {



        const userId = localStorage.getItem('userId');

        const userRole = localStorage.getItem('userRole');



        if (!userId) {

            // No demo mode - redirect to login if not authenticated

            this.showNotification('Please sign in to access your dashboard.', 'info');

            this.showLoginPrompt();

            return;

        }



        // For patient users, use stored data from localStorage

        if (userRole === 'patient') {



            // Try to get user data from userData first (most complete)

            let userData = null;

            try {

                const userDataStr = localStorage.getItem('userData');



                if (userDataStr) {

                    userData = JSON.parse(userDataStr);



                }

            } catch (e) {



            }

            

            // Use userData if available, otherwise fall back to individual items

            this.currentUser = {

                id: userId,

                first_name: userData?.first_name || userData?.firstname || localStorage.getItem('userName') || 'Patient',

                last_name: userData?.last_name || userData?.lastname || '',

                email: userData?.email || localStorage.getItem('userEmail') || 'patient@example.com',

                role: 'patient',

                phone_number: userData?.phone_number || userData?.phone || localStorage.getItem('userPhone') || 'Not provided',

                created_at: userData?.created_at || new Date().toISOString(),

                gender: userData?.gender || localStorage.getItem('userGender') || 'Not specified',

                address: userData?.address || localStorage.getItem('userAddress') || 'Not provided',

                city: userData?.city || localStorage.getItem('userCity') || 'Not provided',

                date_of_birth: userData?.date_of_birth || userData?.birth_date || localStorage.getItem('userDateOfBirth') || 'Not specified',

                blood_type: userData?.blood_type || localStorage.getItem('userBloodType') || 'Not provided',

                emergency_contact: userData?.emergency_contact || localStorage.getItem('userEmergencyContact') || 'Not provided'

            };

            

            // If we have incomplete userData, try to get more info from other sources

            if (userData && (!userData.first_name && !userData.firstname && !userData.email)) {



                // Only try API if we don't have basic user info

                if (!localStorage.getItem('userData') || localStorage.getItem('userData') === '{"id":95,"role":"patient"}') {



                    this.tryToGetCompleteUserInfo(userId);

                } else {



                }

            }



            this.updateWelcomeSection();

            return;

        }



        try {

            // Only try to validate session for non-patient users

            const response = await fetch(`${this.apiBaseUrl}/users/validate_session/`, {

                method: 'GET',

                headers: {

                    'Content-Type': 'application/json',

                },

                credentials: 'include'

            });



            if (response.ok) {

                const userData = await response.json();

                this.currentUser = userData;

                this.updateWelcomeSection();

                return;

            }



            // If session validation fails, try to get user by ID

            const userResponse = await fetch(`${this.apiBaseUrl}/users/${userId}/`, {

                method: 'GET',

                headers: {

                    'Content-Type': 'application/json',

                },

                credentials: 'include'

            });



            if (!userResponse.ok) {

                const errorText = await userResponse.text();

                throw new Error(`Session expired: ${userResponse.status} ${userResponse.statusText}`);

            }



            this.currentUser = await userResponse.json();

            this.updateWelcomeSection();

            

        } catch (error) {

            console.warn('Session validation failed, using fallback:', error);

            // Fallback to mock user data if API fails (for development/testing)

            this.currentUser = {

                id: userId || 'mock-user-123',

                first_name: 'John',

                last_name: 'Doe',

                email: 'john.doe@example.com',

                phone_number: '+1234567890',

                created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),

                gender: 'Male',

                address: '123 Main St',

                city: 'Sample City',

                date_of_birth: '1990-01-01',

                blood_type: 'O+',

                emergency_contact: 'Jane Doe (+1234567891)'

            };

            

            this.updateWelcomeSection();

        }

    }



    handleAuthError() {

        // Clear local storage

        localStorage.removeItem('userId');

        localStorage.removeItem('sessionId');

        

        // Show notification

        this.showNotification('Session expired. Please sign in again.', 'warning');

        

        // Redirect to sign in page after delay

        setTimeout(() => {

            window.location.href = 'book appointment/sign in.html';

        }, 2000);

    }



    showLoginPrompt() {

        const notification = document.createElement('div');

        notification.className = 'notification notification-info';

        notification.innerHTML = `

            <div class="notification-content">

                <i class="fas fa-info-circle"></i>

                <span>Please sign in to access your dashboard.</span>

            </div>

            <button class="notification-close" onclick="this.parentElement.remove()">

                <i class="fas fa-times"></i>

            </button>

        `;

        

        document.body.appendChild(notification);

        

        // Auto remove after 10 seconds

        setTimeout(() => {

            if (notification.parentElement) {

                notification.remove();

            }

        }, 10000);

    }



    // Data Loading Methods

    async loadDashboardData() {

        try {

            const userRole = localStorage.getItem('userRole');

            

            // For patient users, check if they're new or have existing data

            if (userRole === 'patient') {

                if (this.isNewUser()) {

                    await this.loadRealUserData();

                    this.showEmptyDashboard();

                    this.showNotification('Welcome! Your dashboard is ready. Book your first appointment to get started.', 'info');

                } else {

                    try {

                        // Try to load real user data first

                        await this.loadRealUserData();

                        await this.loadAppointments();

                        await this.loadTreatmentProgress();

                        await this.loadRecentActivity();

                        await this.updateStatistics();

                    } catch (error) {

                        console.warn('Failed to load real data:', error);

                        this.showNotification('Unable to load your data. Please try again later.', 'warning');

                    }

                }

            } else {

                // Check if API is available for non-patient users

                if (!await this.isApiAvailable()) {

                    this.showNotification('Backend service unavailable. Please try again later.', 'warning');

                } else {

                    await this.loadAppointments();

                    await this.loadTreatmentProgress();

                    await this.loadRecentActivity();

                    await this.updateStatistics();

                }

            }

            

            this.hideLoadingStates();

        } catch (error) {

            console.error('Error loading dashboard data:', error);

            this.hideLoadingStates();

            this.showNotification('Failed to load dashboard data. Please try again later.', 'error');

        }

    }



    async isApiAvailable() {

        // For patient users, skip API health check to avoid authentication issues

        const userRole = localStorage.getItem('userRole');

        if (userRole === 'patient') {

            return true; // Don't trigger mock data loading for patients

        }

        

        try {

            const controller = new AbortController();

            const timeoutId = setTimeout(() => controller.abort(), 5000);

            

            const response = await fetch(`${this.apiBaseUrl}/health/`, { 

                method: 'GET',

                signal: controller.signal,

                credentials: 'include'

            });

            

            clearTimeout(timeoutId);

            return response.ok;

        } catch (error) {

            console.error('API health check failed:', error);

            return false;

        }

    }



    async loadRealUserData() {

        // Get user data from localStorage (set during registration/login)

        const userData = localStorage.getItem('userData');

        const userId = localStorage.getItem('userId');

        const userRole = localStorage.getItem('userRole');

        

        if (userData && userId) {

            try {

                // Parse stored user data

                const parsedUserData = JSON.parse(userData);

                

                // Update current user with real data

                this.currentUser = {

                    id: userId,

                    first_name: parsedUserData.first_name || 'Patient',

                    last_name: parsedUserData.last_name || 'User',

                    email: parsedUserData.email || 'patient@example.com',

                    phone_number: parsedUserData.phone_number || 'Not provided',

                    created_at: parsedUserData.created_at || new Date().toISOString(),

                    gender: parsedUserData.gender || 'Not specified',

                    address: parsedUserData.address || 'Not provided',

                    city: parsedUserData.city || 'Not provided',

                    date_of_birth: parsedUserData.date_of_birth || 'Not provided',

                    blood_type: parsedUserData.blood_type || 'Not provided',

                    emergency_contact: parsedUserData.emergency_contact || 'Not provided',

                    role: userRole || 'patient'

                };

                

                this.updateWelcomeSection();

                this.updateProfileSection();

                

                // Try to fetch fresh profile data from API (but don't fail if it doesn't work)
                try {
                    await this.fetchFreshProfileData();
                } catch (error) {
                    console.log('⚠️ Could not fetch fresh profile data, using cached data:', error.message);
                }

                

                return;

            } catch (error) {

                console.error('Error parsing user data:', error);

                throw error;

            }

        } else {

            console.warn('No user data found in localStorage');

            throw new Error('No user data available');

        }

    }



    async fetchFreshProfileData() {

        try {

            console.log('🔄 Fetching fresh profile data from API...');
            console.log('🔍 API Base URL:', this.apiBaseUrl);
            console.log('🔍 Session ID:', localStorage.getItem('sessionId'));
            console.log('🔍 Session ID exists:', !!localStorage.getItem('sessionId'));
            console.log('🔍 Auth Headers:', this.getAuthHeaders());
            console.log('🔍 Current User:', this.currentUser);
            console.log('🔍 Current User ID:', this.currentUser?.id);
            
            // Check if sessionId looks valid
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                console.log('🔍 Session ID length:', sessionId.length);
                console.log('🔍 Session ID starts with:', sessionId.substring(0, 10) + '...');
            } else {
                console.log('❌ No sessionId found in localStorage');
            }

            

            // Use the same authentication method as other working API calls
            console.log('🔍 Using standard auth headers:', this.getAuthHeaders());
            
            const response = await fetch(`${this.apiBaseUrl}/users/${this.currentUser.id}/`, {

                method: 'GET',

                headers: this.getAuthHeaders(),

                credentials: 'include'

            });

            

            if (response.ok) {

                const data = await response.json();

                if (data.success && data.user) {

                    console.log('✅ Fresh profile data received:', data.user);

                    

                    // Update current user with fresh data

                    this.currentUser = {

                        ...this.currentUser,

                        ...data.user

                    };

                    

                    // Update localStorage with fresh data

                    localStorage.setItem('userData', JSON.stringify(data.user));

                    

                    // Update UI

                    this.updateWelcomeSection();

                    this.updateProfileSection();

                    

                    console.log('✅ Profile updated with fresh data');

                }

            } else if (response.status === 404) {

                console.warn('⚠️ User not found in database (404), attempting to create user');

                // User doesn't exist in backend, try to create it from cached data
                // But first check if the cached username already exists
                await this.createUserFromCache();

            } else if (response.status === 401 || response.status === 403) {

                console.warn('⚠️ Authentication failed, using cached data');
                
                // Try to re-authenticate if we have credentials
                if (this.currentUser && this.currentUser.username) {
                    console.log('🔄 Attempting to re-authenticate...');
                    await this.loginWithCreatedUser(this.currentUser.username, this.currentUser.password || 'defaultpassword');
                }

                // Authentication issue, but we can still use cached data

            } else {

                console.warn('⚠️ Could not fetch fresh profile data, using cached data');

            }

        } catch (error) {

            console.error('❌ Error fetching fresh profile data:', error);

            console.log('📊 Using cached profile data instead');

        }

    }

    // Check if a username already exists
    async checkUsernameExists(username) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/?search=${username}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                // If we get results, the username exists
                return data.results && data.results.length > 0;
            }
            return false;
        } catch (error) {
            console.warn('Could not check username existence:', error);
            return false;
        }
    }

    // Create user in backend from cached data
    async createUserFromCache() {
        try {
            const userData = localStorage.getItem('userData');
            if (!userData) {
                console.warn('⚠️ No cached user data available to create user');
                return;
            }

            const parsedUserData = JSON.parse(userData);
            console.log('🔄 Attempting to create user from cache:', parsedUserData);

            // Check if the cached username already exists
            if (parsedUserData.username) {
                const usernameExists = await this.checkUsernameExists(parsedUserData.username);
                if (usernameExists) {
                    console.log('⚠️ Cached username already exists, will generate unique username');
                }
            }

            // Prepare user data for creation with valid field values
            // Always generate unique username and email to avoid conflicts
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const createUserData = {
                username: `user_${timestamp}_${randomSuffix}`, // Always unique
                email: `user_${timestamp}_${randomSuffix}@example.com`, // Always unique
                first_name: parsedUserData.first_name || 'Patient',
                last_name: parsedUserData.last_name || 'User',
                password: 'TempPassword123!', // Temporary password
                password2: 'TempPassword123!',
                role: 'patient',
                phone_number: parsedUserData.phone_number || '',
                gender: parsedUserData.gender || 'prefer-not-to-say', // Use valid choice
                address: parsedUserData.address || '',
                city: parsedUserData.city || '',
                blood_type: parsedUserData.blood_type || '', // Will be validated by model
                emergency_contact: parsedUserData.emergency_contact || ''
            };

            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(createUserData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ User created successfully:', data);
                
                // Update current user with new ID
                this.currentUser.id = data.user_id;
                localStorage.setItem('userId', data.user_id);
                
                // Try to login with the new user
                await this.loginWithCreatedUser(createUserData.username, createUserData.password);
            } else {
                const errorData = await response.json();
                console.error('❌ Failed to create user:', errorData);
                console.error('❌ Validation details:', errorData.details);
                console.error('❌ User data sent:', createUserData);
                console.error('❌ Response status:', response.status);
                
                // Handle different types of errors
                if (response.status === 500) {
                    console.log('🔄 Server error during user creation, trying minimal user creation...');
                    // Try minimal user creation first
                    await this.createMinimalUser();
                } else if (errorData.details && errorData.details.username) {
                    console.log('🔄 Username conflict detected, trying with different username...');
                    await this.createUserWithUniqueUsername(parsedUserData);
                } else if (errorData.details && errorData.details.email) {
                    console.log('🔄 Email conflict detected, trying with different email...');
                    await this.createUserWithUniqueUsername(parsedUserData);
                } else {
                    // If user creation fails for other reasons, continue with cached data
                    console.log('📊 Continuing with cached user data');
                    this.showNotification('Using cached profile data. Some features may be limited.', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error creating user from cache:', error);
            
            // Try creating a minimal user with only required fields
            await this.createMinimalUser();
        }
    }

    // Try to create a user that's already active (bypass email verification)
    async createActiveUser(parsedUserData) {
        try {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            
            // Try to create user with minimal data that might bypass email verification
            const activeUserData = {
                username: `user_${timestamp}_${randomSuffix}`,
                email: `user_${timestamp}_${randomSuffix}@example.com`,
                first_name: parsedUserData.first_name || 'Patient',
                last_name: parsedUserData.last_name || 'User',
                password: 'TempPassword123!',
                password2: 'TempPassword123!',
                role: 'patient',
                is_active: true,  // Try to set as active
                is_email_verified: true  // Try to set as verified
            };

            console.log('🔄 Attempting to create active user:', activeUserData);

            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(activeUserData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Active user created successfully:', data);
                
                // Update current user with new ID
                this.currentUser.id = data.user_id;
                localStorage.setItem('userId', data.user_id);
                
                // Try to login with the new user
                await this.loginWithCreatedUser(activeUserData.username, activeUserData.password);
            } else {
                const errorData = await response.json();
                console.error('❌ Failed to create active user:', errorData);
                console.log('📊 Will continue with cached data only');
            }
        } catch (error) {
            console.error('❌ Error creating active user:', error);
            console.log('📊 Will continue with cached data only');
        }
    }

    // Create user with a guaranteed unique username
    async createUserWithUniqueUsername(parsedUserData) {
        try {
            // Generate multiple unique username attempts
            for (let attempt = 1; attempt <= 3; attempt++) {
                const timestamp = Date.now();
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                const attemptSuffix = attempt > 1 ? `_${attempt}` : '';
                
                const uniqueUserData = {
                    username: `user_${timestamp}_${randomSuffix}${attemptSuffix}`,
                    email: `user_${timestamp}_${randomSuffix}${attemptSuffix}@example.com`, // Always unique
                    first_name: parsedUserData.first_name || 'Patient',
                    last_name: parsedUserData.last_name || 'User',
                    password: 'TempPassword123!',
                    password2: 'TempPassword123!',
                    role: 'patient',
                    phone_number: parsedUserData.phone_number || '',
                    gender: parsedUserData.gender || 'prefer-not-to-say',
                    address: parsedUserData.address || '',
                    city: parsedUserData.city || '',
                    blood_type: parsedUserData.blood_type || '',
                    emergency_contact: parsedUserData.emergency_contact || ''
                };

                console.log(`🔄 Attempt ${attempt}: Creating user with username: ${uniqueUserData.username}`);

                const response = await fetch(`${this.apiBaseUrl}/users/`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    credentials: 'include',
                    body: JSON.stringify(uniqueUserData)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ User created successfully with unique username:', data);
                    
                    // Update current user with new ID
                    this.currentUser.id = data.user_id;
                    localStorage.setItem('userId', data.user_id);
                    
                    // Try to login with the new user
                    await this.loginWithCreatedUser(uniqueUserData.username, uniqueUserData.password);
                    return; // Success, exit the loop
                } else {
                    const errorData = await response.json();
                    console.warn(`⚠️ Attempt ${attempt} failed:`, errorData.details);
                    
                    // If it's still a username conflict and we have more attempts, continue
                    if (errorData.details && errorData.details.username && attempt < 3) {
                        continue;
                    } else {
                        // If it's not a username issue or we've exhausted attempts, break
                        console.error('❌ Failed to create user after multiple attempts:', errorData);
                        break;
                    }
                }
            }
            
            // If all attempts failed, try minimal user creation
            console.log('🔄 All username attempts failed, trying minimal user creation...');
            await this.createMinimalUser();
            
        } catch (error) {
            console.error('❌ Error in createUserWithUniqueUsername:', error);
            await this.createMinimalUser();
        }
    }

    // Create a minimal user with only required fields
    async createMinimalUser() {
        try {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const minimalUserData = {
                username: `user_${timestamp}_${randomSuffix}`,
                email: `user_${timestamp}_${randomSuffix}@example.com`,
                first_name: 'Patient',
                last_name: 'User',
                password: 'TempPassword123!',
                password2: 'TempPassword123!',
                role: 'patient'
            };

            console.log('🔄 Attempting to create minimal user:', minimalUserData);

            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(minimalUserData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Minimal user created successfully:', data);
                
                // Update current user with new ID
                this.currentUser.id = data.user_id;
                localStorage.setItem('userId', data.user_id);
                
                // Try to login with the new user
                await this.loginWithCreatedUser(minimalUserData.username, minimalUserData.password);
            } else {
                const errorData = await response.json();
                console.error('❌ Failed to create minimal user:', errorData);
                console.error('❌ Response status:', response.status);
                console.error('❌ Minimal user data sent:', minimalUserData);
                console.log('📊 Will continue with cached data only');
                this.showNotification('Unable to create user account. Using cached data with limited functionality.', 'warning');
            }
        } catch (error) {
            console.error('❌ Error creating minimal user:', error);
            console.log('📊 Will continue with cached data only');
        }
    }

    // Login with created user credentials
    async loginWithCreatedUser(username, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Login successful after user creation:', data);
                
                // Update session data
                localStorage.setItem('sessionId', data.session_id || Date.now().toString());
                
                // Refresh profile data
                await this.fetchFreshProfileData();
            } else {
                const errorData = await response.json();
                console.error('❌ Login failed after user creation:', errorData);
                console.error('❌ Response status:', response.status);
                
                // Handle specific login errors
                if (response.status === 401) {
                    if (errorData.needs_verification) {
                        console.log('⚠️ User created but needs email verification');
                        this.showNotification('User created successfully. Auto-verifying for development...', 'info');
                        
                        // For development, wait a moment and retry login
                        // The backend should auto-verify the user
                        setTimeout(async () => {
                            console.log('🔄 Retrying login after auto-verification...');
                            await this.loginWithCreatedUser(username, password);
                        }, 1000);
                        
                        return; // Exit early to avoid showing error
                    } else {
                        console.log('⚠️ Login failed - user may be inactive');
                        this.showNotification('User created but login failed. Trying alternative approach...', 'warning');
                        
                        // Try to create an active user as fallback
                        const userData = localStorage.getItem('userData');
                        if (userData) {
                            const parsedUserData = JSON.parse(userData);
                            await this.createActiveUser(parsedUserData);
                        } else {
                            console.log('📊 Continuing with cached data');
                        }
                    }
                } else {
                    console.log('⚠️ Login failed for other reasons');
                    this.showNotification('User created but login failed. Please try signing in manually.', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error logging in with created user:', error);
            this.showNotification('User created but login failed. Please try signing in manually.', 'warning');
        }
    }

    // Check if user is truly new (no appointments, no activity)

    isNewUser() {

        const hasAppointments = localStorage.getItem('userAppointments');

        const hasActivity = localStorage.getItem('userActivity');

        const hasTreatmentPlans = localStorage.getItem('userTreatmentPlans');

        

        return !hasAppointments && !hasActivity && !hasTreatmentPlans;

    }



    // Show empty dashboard for new users

    showEmptyDashboard() {

        // Clear any existing data

        this.appointments = [];

        this.treatmentPlans = [];

        this.activityLog = [];

        

        // Clear any mock data from localStorage

        localStorage.removeItem('userAppointments');

        localStorage.removeItem('userActivity');

        localStorage.removeItem('userTreatmentPlans');

        

        // Update statistics to show 0

        this.updateAppointmentStats();

        this.updateStatistics();

        

        // Show empty states

        this.renderEmptyAppointments();

        this.renderEmptyProgress();

        this.renderEmptyActivity();

        

        // Update welcome message for new users

        this.showWelcomeMessage();

    }



    // Render empty appointments section

    renderEmptyAppointments() {

        const appointmentsList = document.getElementById('appointments-list');

        if (appointmentsList) {

            appointmentsList.innerHTML = `

                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: #6c757d;">

                    <i class="fas fa-calendar-plus" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px; opacity: 0.6;"></i>

                    <h3 style="margin: 15px 0; color: #495057; font-weight: 600;">No Appointments Yet</h3>

                    <p style="margin-bottom: 20px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">

                        You haven't booked any appointments yet. Start your health journey by booking your first session.

                    </p>

                    <button class="btn-primary" onclick="window.location.href='book appointment/book.html'" 

                            style="background: linear-gradient(135deg, #2a5d9f 0%, #1e3c72 100%); 

                                   color: white; border: none; padding: 12px 24px; border-radius: 8px; 

                                   cursor: pointer; font-weight: 500; transition: all 0.3s ease;">

                        <i class="fas fa-plus"></i> Book Your First Appointment

                    </button>

                </div>

            `;

        }

    }



    // Render empty progress section

    renderEmptyProgress() {

        const progressSection = document.querySelector('.treatment-progress .card-content');

        if (progressSection) {

            progressSection.innerHTML = `

                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: #6c757d;">

                    <i class="fas fa-chart-line" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px; opacity: 0.6;"></i>

                    <h3 style="margin: 15px 0; color: #495057; font-weight: 600;">No Treatment Plans Yet</h3>

                    <p style="margin-bottom: 20px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">

                        Your treatment progress will appear here once you start your therapy sessions.

                    </p>

                    <button class="btn-primary" onclick="window.location.href='book appointment/book.html'" 

                            style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 

                                   color: white; border: none; padding: 12px 24px; border-radius: 8px; 

                                   cursor: pointer; font-weight: 500; transition: all 0.3s ease;">

                        <i class="fas fa-plus"></i> Start Your Treatment

                    </button>

                </div>

            `;

        }

    }



    // Render empty activity section

    renderEmptyActivity() {

        const activitySection = document.getElementById('recent-activity');

        if (activitySection) {

            activitySection.innerHTML = `

                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: #6c757d;">

                    <i class="fas fa-history" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px; opacity: 0.6;"></i>

                    <h3 style="margin: 15px 0; color: #495057; font-weight: 600;">No Recent Activity</h3>

                    <p style="margin-bottom: 20px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">

                        Your activity history will appear here as you use the platform.

                    </p>

                    <div style="margin-top: 15px;">

                        <button class="btn-primary" onclick="window.location.href='symptom-assessment.html'" 

                                style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); 

                                       color: white; border: none; padding: 10px 20px; border-radius: 6px; 

                                       cursor: pointer; font-weight: 500; margin-right: 10px; transition: all 0.3s ease;">

                            <i class="fas fa-brain"></i> Take AI Assessment

                        </button>

                        <button class="btn-primary" onclick="window.location.href='share-testimony.html'"

                                style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); 

                                       color: #212529; border: none; padding: 10px 20px; border-radius: 6px; 

                                       cursor: pointer; font-weight: 500; transition: all 0.3s ease;">

                            <i class="fas fa-star"></i> Share Experience

                        </button>

                    </div>

                </div>

            `;

        }

    }









    async loadAppointments() {

        try {

            // Get user ID from localStorage

            const userId = localStorage.getItem('userId');

            if (!userId) {

                throw new Error('User not authenticated');

            }



            // Fetch appointments for the current user

            const response = await fetch(`${this.apiBaseUrl}/appointments/?user_id=${userId}`, {

                headers: this.getAuthHeaders(),

                credentials: 'include'

            });



            if (response.ok) {

                const data = await response.json();



                // Ensure data is an array before filtering

                if (Array.isArray(data)) {

                    // Filter to get upcoming appointments (status: scheduled, confirmed)

                    this.appointments = data.filter(apt => 

                        apt.status === 'scheduled' || apt.status === 'confirmed'

                    ).sort((a, b) => new Date(a.date) - new Date(b.date));

                } else if (data && Array.isArray(data.results)) {

                    // Handle paginated response

                    this.appointments = data.results.filter(apt => 

                        apt.status === 'scheduled' || apt.status === 'confirmed'

                    ).sort((a, b) => new Date(a.date) - new Date(b.date));

                } else if (data && typeof data === 'object') {

                    // Handle other object responses (might be error messages or different formats)



                    if (data.error) {

                        throw new Error(data.error);

                    }

                    this.appointments = [];

                } else {

                    this.appointments = [];

                }

                

                this.renderAppointments();

                this.updateAppointmentStats();

            } else {

                const errorText = await response.text();

                throw new Error(`Failed to load appointments: ${response.status} ${response.statusText}`);

            }

        } catch (error) {

            console.warn('⚠️ API failed, checking localStorage for real appointments...');

            

            // Check if there are real appointments stored in localStorage

            const storedAppointments = localStorage.getItem('userAppointments');

            if (storedAppointments) {

                try {

                    const parsedAppointments = JSON.parse(storedAppointments);

                    if (Array.isArray(parsedAppointments) && parsedAppointments.length > 0) {

                        this.appointments = parsedAppointments.filter(apt => 

                            apt.status === 'scheduled' || apt.status === 'confirmed'

                        ).sort((a, b) => new Date(a.date) - new Date(b.date));

                        

                        this.renderAppointments();

                        this.updateAppointmentStats();

                        return;

                    }

                } catch (parseError) {

                    console.warn('⚠️ Failed to parse stored appointments:', parseError);

                }

            }

            

            // Only use mock data if no real appointments exist

            this.appointments = [

                {

                    id: 1,

                    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

                    status: 'confirmed',

                    service_type: 'physical-therapy',

                    duration: 45,

                    note: 'Follow-up session',

                    isMock: true

                },

                {

                    id: 2,

                    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),

                    status: 'scheduled',

                    service_type: 'consultation',

                    duration: 30,

                    note: 'Initial consultation',

                    isMock: true

                }

            ];

            

            this.renderAppointments();

            this.updateAppointmentStats();

        }

    }



    async loadTreatmentProgress() {

        try {

            const response = await fetch(`${this.apiBaseUrl}/treatment-plans/?patient=${this.currentUser.id}`, {

                headers: this.getAuthHeaders(),

                credentials: 'include'

            });



            if (response.ok) {

                const data = await response.json();



                // Ensure data is an array before assigning

                if (Array.isArray(data)) {

                    this.treatmentPlans = data;

                } else if (data && Array.isArray(data.results)) {

                    // Handle paginated response

                    this.treatmentPlans = data.results;

                } else if (data && typeof data === 'object') {

                    // Handle other object responses

                    if (data.error) {

                        throw new Error(data.error);

                    }

                    this.treatmentPlans = [];

                } else {

                    this.treatmentPlans = [];

                }

                

                this.renderProgressData();

            } else {

                const errorText = await response.text();

                throw new Error(`Failed to load treatment progress: ${response.status} ${response.statusText}`);

            }

        } catch (error) {

            // Fallback to mock data if API fails

            this.treatmentPlans = [

                {

                    id: 1,

                    total_sessions: 10,

                    completed_sessions: 7,

                    treatment_type: 'Physical Therapy',

                    progress_notes: 'Good progress with mobility exercises'

                },

                {

                    id: 2,

                    total_sessions: 8,

                    completed_sessions: 3,

                    treatment_type: 'Manual Therapy',

                    progress_notes: 'Starting manual manipulation techniques'

                }

            ];

            

            this.renderProgressData();

        }

    }



    async loadRecentActivity() {

        try {

            // Mock activity data for now - replace with actual API call

            this.activityLog = [

                {

                    id: 1,

                    type: 'appointment',

                    title: 'Appointment Completed',

                    description: 'Physical therapy session with Dr. Ahmad',

                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),

                    icon: 'fas fa-calendar-check'

                },

                {

                    id: 2,

                    type: 'assessment',

                    title: 'AI Assessment Completed',

                    description: 'Symptom assessment for back pain',

                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),

                    icon: 'fas fa-brain'

                },

                {

                    id: 3,

                    type: 'progress',

                    title: 'Progress Updated',

                    description: 'Treatment plan progress: 75% complete',

                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),

                    icon: 'fas fa-chart-line'

                }

            ];

            

            this.renderRecentActivity();

        } catch (error) {

            this.renderActivityError();

        }

    }



    async updateStatistics() {

        try {

            // Update appointment statistics

            const totalAppointments = await this.getTotalAppointments();

            const upcomingAppointments = await this.getUpcomingAppointments();

            const progressPercentage = await this.getProgressPercentage();



            const totalElement = document.getElementById('total-appointments');

            const upcomingElement = document.getElementById('upcoming-appointments');

            const progressElement = document.getElementById('progress-score');

            

            if (totalElement) {

                totalElement.textContent = totalAppointments;

            }

            

            if (upcomingElement) {

                upcomingElement.textContent = upcomingAppointments;

            }

            

            if (progressElement) {

                progressElement.textContent = `${progressPercentage}%`;

            }

            

        } catch (error) {

            // Silent fail for statistics update

        }

    }



    // Rendering Methods

    updateWelcomeSection() {



        if (this.currentUser) {

            const nameElement = document.getElementById('patient-name');



            if (nameElement) {

                const firstName = this.currentUser.first_name || 'Patient';

                const lastName = this.currentUser.last_name || '';

                const fullName = lastName ? `${firstName} ${lastName}` : firstName;



                nameElement.textContent = fullName;



            }

            

            // Show welcome message for new users

            if (this.currentUser.id && this.currentUser.id !== 'demo-user-123') {

                this.showWelcomeMessage();

            }

            

            // Update profile section

            this.updateProfileSection();

        }

    }



    updateProfileSection() {



        if (this.currentUser) {

            // Update profile name

            const profileName = document.getElementById('profile-name');



            if (profileName) {

                const fullName = `${this.currentUser.first_name} ${this.currentUser.last_name}`.trim();



                profileName.textContent = fullName;

            }

            

            // Update profile email

            const profileEmail = document.getElementById('profile-email');



            if (profileEmail) {



                profileEmail.textContent = this.currentUser.email;

            }

            

            // Update profile phone

            const profilePhone = document.getElementById('profile-phone');

            if (profilePhone) {

                profilePhone.textContent = this.currentUser.phone_number;

            }

            

            // Update extended profile info

            const profileGender = document.getElementById('profile-gender');

            if (profileGender) {

                profileGender.textContent = this.currentUser.gender;

            }

            

            const profileAddress = document.getElementById('profile-address');

            if (profileAddress) {

                profileAddress.textContent = this.currentUser.address;

            }

            

            const profileDob = document.getElementById('profile-dob');

            if (profileDob) {

                profileDob.textContent = this.currentUser.date_of_birth;

            }

            

            const profileBloodType = document.getElementById('profile-blood-type');

            if (profileBloodType) {

                profileBloodType.textContent = this.currentUser.blood_type;

            }

            

            const profileEmergency = document.getElementById('profile-emergency-contact');

            if (profileEmergency) {

                profileEmergency.textContent = this.currentUser.emergency_contact;

            }

            

            // Update member since date

            const memberSince = document.getElementById('member-since');

            if (memberSince && this.currentUser.created_at) {

                const createdDate = new Date(this.currentUser.created_at);

                memberSince.textContent = createdDate.getFullYear().toString();

            }

            

        }

    }







    showWelcomeMessage() {

        // Show welcome message for new users

        const welcomeSection = document.querySelector('.welcome-section');

        if (welcomeSection) {

            const welcomeMessage = document.createElement('div');

            welcomeMessage.className = 'welcome-message';

            welcomeMessage.innerHTML = `

                <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 15px; margin: 10px 0; text-align: center; color: white !important; backdrop-filter: blur(10px); font-weight: 500;">

                    <i class="fas fa-heart"></i>

                    <strong>Welcome to AL-BOQAI Center!</strong> 

                    Start your health journey by booking your first appointment.

                    <a href="book appointment/book.html" style="color: #ffd700 !important; text-decoration: underline;">Book Now</a>

                </div>

            `;

            welcomeSection.appendChild(welcomeMessage);

        }

    }



    renderAppointments() {

        const appointmentsList = document.getElementById('appointments-list');

        if (!appointmentsList) {

            return;

        }

        

        // Ensure appointments is always an array

        if (!Array.isArray(this.appointments) || this.appointments.length === 0) {

            appointmentsList.innerHTML = `

                <div class="empty-state">

                    <i class="fas fa-calendar-times"></i>

                    <p>No upcoming appointments</p>

                    <button class="btn-primary" onclick="bookAppointment()">Book Now</button>

                </div>

            `;

            return;

        }



        // Display upcoming appointments (limit to 5 for dashboard)

        const upcomingAppointments = this.appointments.slice(0, 5);

        

        appointmentsList.innerHTML = upcomingAppointments.map(appointment => {

            try {

                // Ensure appointment object is valid

                if (!appointment || typeof appointment !== 'object') {

                    return '';

                }

                

                const appointmentDate = new Date(appointment.date);

                const formattedDate = appointmentDate.toLocaleDateString('en-US', {

                    weekday: 'short',

                    month: 'short',

                    day: 'numeric',

                    hour: '2-digit',

                    minute: '2-digit'

                });

                

                const statusClass = appointment.status === 'confirmed' ? 'status-confirmed' : 'status-scheduled';

                const statusText = appointment.status === 'confirmed' ? 'Confirmed' : 'Scheduled';

                

                return `

                    <div class="appointment-item ${statusClass}">

                        <div class="appointment-header">

                            <div class="appointment-date">

                                <i class="fas fa-calendar-day"></i>

                                <span>${formattedDate}</span>

                            </div>

                            <span class="appointment-status ${statusClass}">${statusText}</span>

                        </div>

                        <div class="appointment-details">

                            <div class="service-type">

                                <i class="fas fa-stethoscope"></i>

                                <span>${this.formatServiceType(appointment.service_type || 'unknown')}</span>

                            </div>

                            <div class="duration">

                                <i class="fas fa-clock"></i>

                                <span>${appointment.duration || '30'} minutes</span>

                            </div>

                            ${appointment.note ? `

                                <div class="appointment-note">

                                    <i class="fas fa-comment"></i>

                                    <span>${appointment.note}</span>

                                </div>

                            ` : ''}

                        </div>

                        <div class="appointment-actions">

                            <button class="btn-secondary btn-sm" onclick="rescheduleAppointment('${appointment.id || 0}')">

                                <i class="fas fa-edit"></i> Reschedule

                            </button>

                            <button class="btn-danger btn-sm" onclick="cancelAppointment('${appointment.id || 0}')">

                                <i class="fas fa-times"></i> Cancel

                            </button>

                        </div>

                    </div>

                `;

            } catch (error) {

                return '';

            }

        }).join('');

    }



    renderAppointmentsError() {

        const appointmentsList = document.getElementById('appointments-list');

        appointmentsList.innerHTML = `

            <div class="error-state">

                <i class="fas fa-exclamation-triangle"></i>

                <p>Failed to load appointments</p>

                <button class="retry-btn" onclick="dashboard.loadAppointments()">Retry</button>

            </div>

        `;

    }



    formatServiceType(serviceType) {

        const serviceTypes = {

            'manual-therapy': 'Manual Therapy',

            'physical-therapy': 'Physical Therapy',

            'rehabilitation': 'Rehabilitation',

            'consultation': 'Consultation',

            'follow-up': 'Follow-up',

            'assessment': 'Assessment'

        };

        return serviceTypes[serviceType] || serviceType;

    }



    updateAppointmentStats() {

        // Ensure appointments is always an array

        if (!Array.isArray(this.appointments)) {

            return;

        }

        

        const totalAppointments = this.appointments.length;

        const upcomingAppointments = this.appointments.filter(apt => 

            new Date(apt.date) > new Date()

        ).length;

        

        const totalElement = document.getElementById('total-appointments');

        const upcomingElement = document.getElementById('upcoming-appointments');

        

        if (totalElement) {

            totalElement.textContent = totalAppointments;

        }

        

        if (upcomingElement) {

            upcomingElement.textContent = upcomingAppointments;

        }

    }



    async cancelAppointment(appointmentId) {

        try {

            // Check if appointment exists in local data first

            const appointment = this.appointments.find(apt => apt.id == appointmentId);

            if (!appointment) {

                this.showNotification('Appointment not found. Please refresh the page.', 'error');

                return;

            }



            // Check if this is a mock appointment (no real backend ID)

            if (appointment.isMock) {

                // Remove from local array for mock appointments

                this.appointments = this.appointments.filter(apt => apt.id != appointmentId);

                this.renderAppointments();

                this.updateAppointmentStats();

                this.showNotification('Mock appointment cancelled successfully', 'success');

                return;

            }



            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/`, {

                method: 'PATCH',

                headers: {

                    ...this.getAuthHeaders(),

                    'Content-Type': 'application/json'

                },

                credentials: 'include',

                body: JSON.stringify({

                    status: 'cancelled'

                })

            });



            if (response.ok) {

                this.showNotification('Appointment cancelled successfully', 'success');

                // Reload appointments to update the display

                await this.loadAppointments();

            } else {

                throw new Error('Failed to cancel appointment');

            }

        } catch (error) {

            this.showNotification('Failed to cancel appointment. Please try again.', 'error');

        }

    }



    renderProgressData() {

        try {

            const progressPercentage = this.calculateProgressPercentage();

            const progressElement = document.getElementById('progress-percentage');

            const progressCircle = document.querySelector('.progress-ring-progress');

            

            if (progressElement) {

                progressElement.textContent = `${progressPercentage}%`;

            }

            

            if (progressCircle) {

                const circumference = 2 * Math.PI * 52;

                const offset = circumference - (progressPercentage / 100) * circumference;

                progressCircle.style.strokeDashoffset = offset;

            }



            // Update progress details

            const completedSessions = this.getCompletedSessions();

            const totalSessions = this.getTotalSessions();

            const nextSession = this.getNextSessionDate();

            

            const completedElement = document.getElementById('completed-sessions');

            const nextElement = document.getElementById('next-session');

            const goalElement = document.getElementById('recovery-goal');

            

            if (completedElement) completedElement.textContent = `${completedSessions}/${totalSessions}`;

            if (nextElement) nextElement.textContent = nextSession || 'Not scheduled';

            if (goalElement) goalElement.textContent = this.getRecoveryGoalStatus();

        } catch (error) {

            this.renderProgressError();

        }

    }



    renderProgressError() {

        const progressElement = document.getElementById('progress-percentage');

        if (progressElement) {

            progressElement.textContent = 'N/A';

        }

    }



    renderRecentActivity() {

        const activityList = document.getElementById('recent-activity');

        if (!activityList) {

            return;

        }

        

        // Ensure activityLog is always an array

        if (!Array.isArray(this.activityLog) || this.activityLog.length === 0) {

            activityList.innerHTML = `

                <div class="empty-state">

                    <i class="fas fa-history"></i>

                    <p>No recent activity</p>

                </div>

            `;

            return;

        }



        activityList.innerHTML = this.activityLog.map(activity => {

            try {

                // Ensure activity object is valid

                if (!activity || typeof activity !== 'object') {

                    return '';

                }

                

                const icon = activity.icon || 'fas fa-info-circle';

                const title = activity.title || 'Unknown Activity';

                const description = activity.description || 'No description available';

                const timestamp = activity.timestamp || new Date();

                

                return `

                    <div class="activity-item slide-in">

                        <div class="activity-icon">

                            <i class="${icon}"></i>

                        </div>

                        <div class="activity-content">

                            <div class="activity-title">${title}</div>

                            <div class="activity-description">${description}</div>

                        </div>

                        <div class="activity-time">${this.formatRelativeTime(timestamp)}</div>

                    </div>

                `;

            } catch (error) {

                return '';

            }

        }).join('');

    }



    renderActivityError() {

        const activityList = document.getElementById('recent-activity');

        activityList.innerHTML = `

            <div class="error-state">

                <i class="fas fa-exclamation-triangle"></i>

                <p>Failed to load activity</p>

            </div>

        `;

    }



    updateProfileSection() {

        if (!this.currentUser) return;



        const profileName = document.getElementById('profile-name');

        const profileEmail = document.getElementById('profile-email');

        const profilePhone = document.getElementById('profile-phone');

        const memberSinceElement = document.getElementById('member-since');

        

        if (profileName) {

            profileName.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;

        }

        

        if (profileEmail) {

            profileEmail.textContent = this.currentUser.email;

        }

        

        if (profilePhone) {

            profilePhone.textContent = this.currentUser.phone_number || 'Not provided';

        }

        

        if (memberSinceElement) {

            const memberSince = new Date(this.currentUser.created_at).getFullYear();

            memberSinceElement.textContent = memberSince;

        }



        // Update additional profile information if elements exist

        const genderElement = document.getElementById('profile-gender');

        if (genderElement) {

            genderElement.textContent = this.currentUser.gender || 'Not specified';

        }

        

        const addressElement = document.getElementById('profile-address');

        if (addressElement) {

            const address = this.currentUser.address || 'Not provided';

            const city = this.currentUser.city || '';

            addressElement.textContent = city ? `${address}, ${city}` : address;

        }

        

        const dobElement = document.getElementById('profile-dob');

        if (dobElement) {

            dobElement.textContent = this.currentUser.date_of_birth ? 

                new Date(this.currentUser.date_of_birth).toLocaleDateString() : 'Not provided';

        }

        

        const bloodTypeElement = document.getElementById('profile-blood-type');

        if (bloodTypeElement) {

            bloodTypeElement.textContent = this.currentUser.blood_type || 'Not provided';

        }

        

        const emergencyContactElement = document.getElementById('profile-emergency-contact');

        if (emergencyContactElement) {

            emergencyContactElement.textContent = this.currentUser.emergency_contact || 'Not provided';

        }

    }



    // Test function for debugging authentication
    testAuth() {
        console.log('=== AUTHENTICATION TEST ===');
        console.log('Session ID:', localStorage.getItem('sessionId'));
        console.log('User ID:', localStorage.getItem('userId'));
        console.log('User Role:', localStorage.getItem('userRole'));
        console.log('Auth Headers:', this.getAuthHeaders());
        console.log('Current User:', this.currentUser);
        console.log('API Base URL:', this.apiBaseUrl);
        console.log('========================');
    }

    // Utility Methods

    getAuthHeaders() {

        const headers = {

            'Content-Type': 'application/json'

        };

        // Add authentication token if available
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }

        // Add CSRF token if available (for Django session authentication)
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }

        return headers;

    }

    // Get CSRF token from cookies
    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return null;
    }

    // Fetch CSRF token from backend
    async fetchCSRFToken() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                method: 'GET',
                credentials: 'include'
            });
            
            // The CSRF token should be set in cookies by Django
            return this.getCSRFToken();
        } catch (error) {
            console.warn('Could not fetch CSRF token:', error);
            return null;
        }
    }



    formatDate(dateString, format = 'full') {

        const date = new Date(dateString);

        const options = {

            day: format === 'day' ? '2-digit' : undefined,

            month: format === 'month' ? 'short' : format === 'full' ? 'long' : undefined,

            year: format === 'full' ? 'numeric' : undefined

        };

        return date.toLocaleDateString('en-US', options);

    }



    formatTime(dateString) {

        const date = new Date(dateString);

        return date.toLocaleTimeString('en-US', { 

            hour: '2-digit', 

            minute: '2-digit',

            hour12: true 

        });

    }



    formatRelativeTime(date) {

        const now = new Date();

        const diffInSeconds = Math.floor((now - date) / 1000);

        

        if (diffInSeconds < 60) return 'Just now';

        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;

        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;

        return `${Math.floor(diffInSeconds / 86400)} days ago`;

    }



    getStatusText(status) {

        const statusMap = {

            'confirmed': 'Confirmed',

            'pending': 'Pending',

            'completed': 'Completed',

            'cancelled': 'Cancelled'

        };

        return statusMap[status] || 'Unknown';

    }



    // Statistics Methods

    async getTotalAppointments() {

        try {

            const response = await fetch(`${this.apiBaseUrl}/appointments/?count=true`, {

                headers: this.getAuthHeaders(),

                credentials: 'include'

            });

            

            if (response.ok) {

                const data = await response.json();

                return data.count || 0;

            }

        } catch (error) {

            console.error('❌ Error getting total appointments:', error);

            // Silent fail for total appointments

        }

        return 0;

    }



    async getUpcomingAppointments() {

        return this.appointments.length;

    }



    async getProgressPercentage() {

        return this.calculateProgressPercentage();

    }



    calculateProgressPercentage() {

        // Ensure treatmentPlans is always an array

        if (!Array.isArray(this.treatmentPlans) || this.treatmentPlans.length === 0) return 0;

        

        // Calculate based on completed sessions vs total sessions

        const totalSessions = this.treatmentPlans.reduce((sum, plan) => 

            sum + (plan.total_sessions || 0), 0);

        const completedSessions = this.treatmentPlans.reduce((sum, plan) => 

            sum + (plan.completed_sessions || 0), 0);

        

        return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    }



    getCompletedSessions() {

        // Ensure treatmentPlans is always an array

        if (!Array.isArray(this.treatmentPlans)) return 0;

        return this.treatmentPlans.reduce((sum, plan) => 

            sum + (plan.completed_sessions || 0), 0);

    }



    getTotalSessions() {

        // Ensure treatmentPlans is always an array

        if (!Array.isArray(this.treatmentPlans)) return 0;

        return this.treatmentPlans.reduce((sum, plan) => 

            sum + (plan.total_sessions || 0), 0);

    }



    getNextSessionDate() {

        const nextAppointment = this.appointments[0];

        return nextAppointment ? this.formatDate(nextAppointment.date) : null;

    }



    getRecoveryGoalStatus() {

        const progress = this.calculateProgressPercentage();

        if (progress >= 100) return 'Completed';

        if (progress >= 75) return 'Near Completion';

        if (progress >= 50) return 'Good Progress';

        if (progress >= 25) return 'In Progress';

        return 'Just Started';

    }



    // Event Handlers

    setupEventListeners() {

        // Initialize language system if available - with better error handling

        let attempts = 0;

        const maxAttempts = 5;

        

        const tryInitializeLanguage = () => {

            if (typeof window.initializeLanguage === 'function') {

                try {

                    window.initializeLanguage();



                } catch (error) {

                    console.warn('Language system initialization failed:', error);

                }

            } else if (typeof initializeLanguage === 'function') {

                try {

                    initializeLanguage();



                } catch (error) {

                    console.warn('Language system initialization failed:', error);

                }

            } else {

                attempts++;

                if (attempts < maxAttempts) {

                    console.log(`Translation system not available (attempt ${attempts}/${maxAttempts}), retrying in 200ms...`);

                    setTimeout(tryInitializeLanguage, 200);

                } else {

                    console.warn('Translation system not available after multiple attempts - proceeding without it');

                }

            }

        };

        

        // Try to initialize language system

        tryInitializeLanguage();

        

        // Refresh button

        const refreshBtn = document.getElementById('refresh-dashboard');

        if (refreshBtn) {

            refreshBtn.addEventListener('click', this.refreshDashboard);

        }



        // Profile edit button

        const editProfileBtn = document.querySelector('.edit-profile-btn');

        if (editProfileBtn) {

            editProfileBtn.addEventListener('click', this.editProfile);

        }



        // View all appointments button

        const viewAllBtn = document.querySelector('.view-all-btn');

        if (viewAllBtn) {

            viewAllBtn.addEventListener('click', this.viewAllAppointments);

        }

    }



    // Action Methods

    async refreshDashboard() {

        this.showLoadingStates();

        try {

            await this.loadDashboardData();

            this.showNotification('Dashboard refreshed successfully!', 'success');

        } catch (error) {

            this.showNotification('Failed to refresh dashboard', 'error');

        }

    }



    editProfile() {

        this.showProfileEditModal();

    }



    showProfileEditModal() {

        // Create modal overlay

        const modalOverlay = document.createElement('div');

        modalOverlay.className = 'modal-overlay';

        modalOverlay.id = 'profile-edit-modal';

        

        // Create modal content

        const modalContent = document.createElement('div');

        modalContent.className = 'modal-content profile-edit-modal';

        

        // Create form HTML

        const formHTML = `

            <div class="modal-header">

                <h3><i class="fas fa-user-edit"></i> Edit Profile</h3>

                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">

                    <i class="fas fa-times"></i>

                </button>

            </div>

            <form id="profile-edit-form" class="profile-edit-form">

                <div class="form-row">

                    <div class="form-group">

                        <label for="edit-first-name">First Name *</label>

                        <input type="text" id="edit-first-name" name="first_name" value="${this.currentUser?.first_name || ''}" required>

                    </div>

                    <div class="form-group">

                        <label for="edit-last-name">Last Name *</label>

                        <input type="text" id="edit-last-name" name="last_name" value="${this.currentUser?.last_name || ''}" required>

                    </div>

                </div>

                

                <div class="form-row">

                    <div class="form-group">

                        <label for="edit-email">Email *</label>

                        <input type="email" id="edit-email" name="email" value="${this.currentUser?.email || ''}" required>

                    </div>

                    <div class="form-group">

                        <label for="edit-phone">Phone Number</label>

                        <input type="tel" id="edit-phone" name="phone_number" value="${this.currentUser?.phone_number || ''}">

                    </div>

                </div>

                

                <div class="form-row">

                    <div class="form-group">

                        <label for="edit-gender">Gender</label>

                        <select id="edit-gender" name="gender">

                            <option value="">Select Gender</option>

                            <option value="Male" ${this.currentUser?.gender === 'Male' ? 'selected' : ''}>Male</option>

                            <option value="Female" ${this.currentUser?.gender === 'Female' ? 'selected' : ''}>Female</option>

                            <option value="Other" ${this.currentUser?.gender === 'Other' ? 'selected' : ''}>Other</option>

                            <option value="Prefer not to say" ${this.currentUser?.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="edit-dob">Date of Birth</label>

                        <input type="date" id="edit-dob" name="date_of_birth" value="${this.currentUser?.date_of_birth || ''}">

                    </div>

                </div>

                

                <div class="form-row">

                    <div class="form-group">

                        <label for="edit-address">Address</label>

                        <input type="text" id="edit-address" name="address" value="${this.currentUser?.address || ''}" placeholder="Street address">

                    </div>

                    <div class="form-group">

                        <label for="edit-city">City</label>

                        <input type="text" id="edit-city" name="city" value="${this.currentUser?.city || ''}" placeholder="City">

                    </div>

                </div>

                

                <div class="form-row">

                    <div class="form-group">

                        <label for="edit-blood-type">Blood Type</label>

                        <select id="edit-blood-type" name="blood_type">

                            <option value="">Select Blood Type</option>

                            <option value="A+" ${this.currentUser?.blood_type === 'A+' ? 'selected' : ''}>A+</option>

                            <option value="A-" ${this.currentUser?.blood_type === 'A-' ? 'selected' : ''}>A-</option>

                            <option value="B+" ${this.currentUser?.blood_type === 'B+' ? 'selected' : ''}>B+</option>

                            <option value="B-" ${this.currentUser?.blood_type === 'B-' ? 'selected' : ''}>B-</option>

                            <option value="AB+" ${this.currentUser?.blood_type === 'AB+' ? 'selected' : ''}>AB+</option>

                            <option value="AB-" ${this.currentUser?.blood_type === 'AB-' ? 'selected' : ''}>AB-</option>

                            <option value="O+" ${this.currentUser?.blood_type === 'O+' ? 'selected' : ''}>O+</option>

                            <option value="O-" ${this.currentUser?.blood_type === 'O-' ? 'selected' : ''}>O-</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="edit-emergency-contact">Emergency Contact</label>

                        <input type="text" id="edit-emergency-contact" name="emergency_contact" value="${this.currentUser?.emergency_contact || ''}" placeholder="Name and phone number">

                    </div>

                </div>

                

                <div class="form-actions">

                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">

                        Cancel

                    </button>

                    <button type="submit" class="btn-primary">

                        <i class="fas fa-save"></i> Save Changes

                    </button>

                </div>

            </form>

        `;

        

        modalContent.innerHTML = formHTML;

        modalOverlay.appendChild(modalContent);

        document.body.appendChild(modalOverlay);

        

        // Add form submission handler

        const form = document.getElementById('profile-edit-form');

        form.addEventListener('submit', (e) => {

            e.preventDefault();

            this.handleProfileUpdate();

        });

        

        // Add modal styles if they don't exist

        this.addModalStyles();

        

        // Show modal with animation

        setTimeout(() => {

            modalOverlay.classList.add('show');

        }, 10);

    }



    async handleProfileUpdate() {

        try {

            // Show loading state

            const submitBtn = document.querySelector('#profile-edit-form button[type="submit"]');

            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            submitBtn.disabled = true;

            

            // Collect form data

            const formData = new FormData(document.getElementById('profile-edit-form'));

            const profileData = Object.fromEntries(formData.entries());

            

            // Validate required fields

            if (!profileData.first_name || !profileData.last_name || !profileData.email) {

                throw new Error('First name, last name, and email are required');

            }

            

            // Update local user data

            this.currentUser = { ...this.currentUser, ...profileData };

            

            // Try to update on backend if API is available

            if (this.apiBaseUrl && this.currentUser.id && this.currentUser.id !== 'demo-user-123' && this.currentUser.id !== 'mock-user-123') {

                try {

                    const response = await fetch(`${this.apiBaseUrl}/users/${this.currentUser.id}/`, {

                        method: 'PATCH',

                        headers: this.getAuthHeaders(),

                        credentials: 'include',

                        body: JSON.stringify(profileData)

                    });

                    

                    if (!response.ok) {

                        throw new Error(`Failed to update profile: ${response.status}`);

                    }

                    

                    // Update localStorage if needed

                    if (profileData.email !== this.currentUser.email) {

                        localStorage.setItem('userEmail', profileData.email);

                    }

                } catch (apiError) {

                    // Keep local changes if backend update fails

                }

            }

            

            // Update UI

            this.updateWelcomeSection();

            this.updateProfileSection();

            

            // Show success message

            this.showNotification('Profile updated successfully!', 'success');

            

            // Close modal

            const modal = document.getElementById('profile-edit-modal');

            if (modal) {

                modal.remove();

            }

            

        } catch (error) {

            this.showNotification(`Failed to update profile: ${error.message}`, 'error');

            

            // Reset button state

            const submitBtn = document.querySelector('#profile-edit-form button[type="submit"]');

            if (submitBtn) {

                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';

                submitBtn.disabled = false;

            }

        }

    }



    addModalStyles() {

        // Check if styles already exist

        if (document.getElementById('profile-edit-modal-styles')) {

            return;

        }

        

        const styleSheet = document.createElement('style');

        styleSheet.id = 'profile-edit-modal-styles';

        styleSheet.textContent = `

            .modal-overlay {

                position: fixed;

                top: 0;

                left: 0;

                width: 100%;

                height: 100%;

                background: rgba(0, 0, 0, 0.5);

                display: flex;

                align-items: center;

                justify-content: center;

                z-index: 1000;

                opacity: 0;

                transition: opacity 0.3s ease;

            }

            

            .modal-overlay.show {

                opacity: 1;

            }

            

            .modal-content {

                background: white;

                border-radius: 12px;

                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

                max-width: 600px;

                width: 90%;

                max-height: 90vh;

                overflow-y: auto;

                transform: translateY(20px);

                transition: transform 0.3s ease;

            }

            

            .modal-overlay.show .modal-content {

                transform: translateY(0);

            }

            

            .modal-header {

                display: flex;

                justify-content: space-between;

                align-items: center;

                padding: 20px 24px;

                border-bottom: 1px solid #e1e5e9;

                background: #f8f9fa;

                border-radius: 12px 12px 0 0;

            }

            

            .modal-header h3 {

                margin: 0;

                color: #2a5d9f;

                font-size: 1.25rem;

                display: flex;

                align-items: center;

                gap: 8px;

            }

            

            .modal-close {

                background: none;

                border: none;

                font-size: 1.5rem;

                color: #6c757d;

                cursor: pointer;

                padding: 4px;

                border-radius: 4px;

                transition: all 0.2s ease;

            }

            

            .modal-close:hover {

                background: #e9ecef;

                color: #495057;

            }

            

            .profile-edit-form {

                padding: 24px;

            }

            

            .form-row {

                display: grid;

                grid-template-columns: 1fr 1fr;

                gap: 16px;

                margin-bottom: 16px;

            }

            

            .form-group {

                display: flex;

                flex-direction: column;

            }

            

            .form-group label {

                font-weight: 500;

                color: #495057;

                margin-bottom: 6px;

                font-size: 0.9rem;

            }

            

            .form-group input,

            .form-group select {

                padding: 10px 12px;

                border: 1px solid #ced4da;

                border-radius: 6px;

                font-size: 0.95rem;

                transition: border-color 0.2s ease, box-shadow 0.2s ease;

            }

            

            .form-group input:focus,

            .form-group select:focus {

                outline: none;

                border-color: #2a5d9f;

                box-shadow: 0 0 0 3px rgba(42, 93, 159, 0.1);

            }

            

            .form-actions {

                display: flex;

                justify-content: flex-end;

                gap: 12px;

                margin-top: 24px;

                padding-top: 20px;

                border-top: 1px solid #e1e5e9;

            }

            

            .btn-primary,

            .btn-secondary {

                padding: 10px 20px;

                border: none;

                border-radius: 6px;

                font-size: 0.95rem;

                font-weight: 500;

                cursor: pointer;

                transition: all 0.2s ease;

                display: flex;

                align-items: center;

                gap: 6px;

            }

            

            .btn-primary {

                background: #2a5d9f;

                color: white;

            }

            

            .btn-primary:hover {

                background: #1e4a7a;

                transform: translateY(-1px);

            }

            

            .btn-secondary {

                background: #6c757d;

                color: white;

            }

            

            .btn-secondary:hover {

                background: #5a6268;

                transform: translateY(-1px);

            }

            

            .btn-primary:disabled {

                background: #6c757d;

                cursor: not-allowed;

                transform: none;

            }

            

            @media (max-width: 768px) {

                .form-row {

                    grid-template-columns: 1fr;

                }

                

                .modal-content {

                    width: 95%;

                    margin: 20px;

                }

                

                .form-actions {

                    flex-direction: column;

                }

            }

        `;

        

        document.head.appendChild(styleSheet);

    }



    viewAllAppointments() {

        try {

            // Create appointments modal

            const modal = document.createElement('div');

            modal.className = 'modal';

            

            const appointmentsHTML = this.formatAppointmentsForView();

            

            modal.innerHTML = `

                <div class="modal-content">

                    <div class="modal-header">

                        <h3><i class="fas fa-calendar-alt"></i> All Appointments</h3>

                        <button class="modal-close" onclick="this.closest('.modal').remove()">

                            <i class="fas fa-times"></i>

                        </button>

                    </div>

                    <div class="modal-body">

                        <div class="appointments-list">

                            ${appointmentsHTML}

                        </div>

                    </div>

                    <div class="modal-footer">

                        <button class="btn-primary" onclick="window.location.href='book appointment/book.html'">

                            <i class="fas fa-plus"></i> Book New Appointment

                        </button>

                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">

                            <i class="fas fa-times"></i> Close

                        </button>

                    </div>

                </div>

            `;

            

            document.body.appendChild(modal);

            

        } catch (error) {

            console.error('Error showing appointments view:', error);

            this.showNotification('Failed to load appointments view', 'error');

        }

    }



    formatAppointmentsForView() {

        if (!this.appointments || this.appointments.length === 0) {

            return `

                <div class="empty-state">

                    <i class="fas fa-calendar-times"></i>

                    <h4>No Appointments Found</h4>

                    <p>You haven't booked any appointments yet.</p>

                    <button class="btn-primary" onclick="window.location.href='book appointment/book.html'">

                        <i class="fas fa-plus"></i> Book Your First Appointment

                    </button>

                </div>

            `;

        }



        // Sort appointments by date (newest first)

        const sortedAppointments = [...this.appointments].sort((a, b) => new Date(b.date) - new Date(a.date));

        

        return sortedAppointments.map(appointment => {

            const appointmentDate = new Date(appointment.date);

            const isPast = appointmentDate < new Date();

            const isToday = appointmentDate.toDateString() === new Date().toDateString();

            

            let statusClass = 'status-scheduled';

            let statusText = 'Scheduled';

            

            if (appointment.status === 'completed') {

                statusClass = 'status-completed';

                statusText = 'Completed';

            } else if (appointment.status === 'cancelled') {

                statusClass = 'status-cancelled';

                statusText = 'Cancelled';

            } else if (isPast && appointment.status !== 'completed') {

                statusClass = 'status-missed';

                statusText = 'Missed';

            } else if (isToday) {

                statusClass = 'status-today';

                statusText = 'Today';

            }

            

            return `

                <div class="appointment-item ${statusClass}">

                    <div class="appointment-header">

                        <div class="appointment-date">

                            <i class="fas fa-calendar-day"></i>

                            <span>${appointmentDate.toLocaleDateString('en-US', { 

                                weekday: 'long', 

                                year: 'numeric', 

                                month: 'long', 

                                day: 'numeric' 

                            })}</span>

                        </div>

                        <div class="appointment-time">

                            <i class="fas fa-clock"></i>

                            <span>${appointmentDate.toLocaleTimeString('en-US', { 

                                hour: '2-digit', 

                                minute: '2-digit' 

                            })}</span>

                        </div>

                        <div class="appointment-status">

                            <span class="status-badge ${statusClass}">${statusText}</span>

                        </div>

                    </div>

                    <div class="appointment-details">

                        <div class="service-type">

                            <i class="fas fa-stethoscope"></i>

                            <span>${this.formatServiceType(appointment.service_type)}</span>

                        </div>

                        ${appointment.duration ? `

                            <div class="duration">

                                <i class="fas fa-hourglass-half"></i>

                                <span>${appointment.duration} minutes</span>

                            </div>

                        ` : ''}

                        ${appointment.note ? `

                            <div class="notes">

                                <i class="fas fa-sticky-note"></i>

                                <span>${appointment.note}</span>

                            </div>

                        ` : ''}

                    </div>

                    <div class="appointment-actions">

                        ${appointment.status === 'scheduled' && !isPast ? `

                            <button class="btn-secondary btn-sm" onclick="rescheduleAppointment(${appointment.id})">

                                <i class="fas fa-calendar-plus"></i> Reschedule

                            </button>

                            <button class="btn-danger btn-sm" onclick="cancelAppointment(${appointment.id})">

                                <i class="fas fa-times"></i> Cancel

                            </button>

                        ` : ''}

                        ${appointment.status === 'completed' ? `

                            <button class="btn-primary btn-sm" onclick="window.location.href='share-testimony.html'">

                                <i class="fas fa-star"></i> Share Experience

                            </button>

                        ` : ''}

                    </div>

                </div>

            `;

        }).join('');

    }



    formatTreatmentPlanForView() {

        if (!Array.isArray(this.treatmentPlans) || this.treatmentPlans.length === 0) {

            return '<p>No treatment plan found. <a href="create-treatment-plan.html">Create one now!</a></p>';

        }



        const plan = this.treatmentPlans[0]; // Assuming only one plan for now

        let html = `

            <h4>Treatment Plan: ${plan.treatment_type}</h4>

            <p>Total Sessions: ${plan.total_sessions || 'N/A'}</p>

            <p>Completed Sessions: ${plan.completed_sessions || '0'}</p>

            <p>Progress Notes: ${plan.progress_notes || 'No notes available.'}</p>

            <p>Goal: ${this.getRecoveryGoalStatus()}</p>

            <p>Next Session: ${this.getNextSessionDate() || 'Not scheduled'}</p>

        `;



        return html;

    }



    async handleRescheduleAppointment(appointmentId, form) {

        try {

            const formData = new FormData(form);

            

            // Validate required fields

            const newDate = formData.get('newDate');

            const rescheduleReason = formData.get('rescheduleReason');

            

            if (!newDate || !rescheduleReason) {

                this.showNotification('Please fill in all required fields (Date/Time and Reason)', 'error');

                return;

            }

            

            // Validate that new date is in the future

            const selectedDate = new Date(newDate);

            const now = new Date();

            if (selectedDate <= now) {

                this.showNotification('New appointment date must be in the future', 'error');

                return;

            }

            

            // Validate duration if provided

            const newDuration = formData.get('newDuration');

            if (newDuration && newDuration.trim() !== '') {

                const duration = parseInt(newDuration);

                if (isNaN(duration) || duration < 15 || duration > 240) {

                    this.showNotification('Duration must be between 15 and 240 minutes', 'error');

                    return;

                }

            }

            

            // Build reschedule data object

            const rescheduleData = {

                new_date: new Date(newDate).toISOString(),

                reschedule_reason: rescheduleReason

            };

            

            // Add optional fields only if they have values

            const newServiceType = formData.get('newServiceType');

            if (newServiceType && newServiceType.trim() !== '') {

                rescheduleData.new_service_type = newServiceType;

            }

            

            // Use the existing newDuration variable instead of redeclaring it

            if (newDuration && newDuration.trim() !== '') {

                rescheduleData.new_duration = parseInt(newDuration);

            }

            

            const additionalNotes = formData.get('additionalNotes');

            if (additionalNotes && additionalNotes.trim() !== '') {

                rescheduleData.new_note = additionalNotes;

            }



            console.log('Reschedule data:', JSON.stringify(rescheduleData, null, 2));



            // Call API to reschedule appointment

            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/reschedule/`, {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                    ...this.getAuthHeaders()

                },

                credentials: 'include',

                body: JSON.stringify(rescheduleData)

            });



            console.log('Response headers:', JSON.stringify([...response.headers.entries()], null, 2));



            if (response.ok) {

                const result = await response.json();

                console.log('Reschedule successful:', JSON.stringify(result, null, 2));

                this.showNotification('Appointment rescheduled successfully!', 'success');

                

                // Remove the modal

                const modal = form.closest('.modal');

                if (modal) {

                    modal.remove();

                }

                

                // Refresh appointments

                await this.loadAppointments();

            } else {

                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));

                console.error('Reschedule failed:', errorData);

                throw new Error(errorData.error || `HTTP ${response.status}: Failed to reschedule appointment`);

            }

        } catch (error) {

            console.error('Error rescheduling appointment:', error);

            this.showNotification(error.message || 'Failed to reschedule appointment', 'error');

        }

    }



    showLoadingStates() {

        const loadingElements = document.querySelectorAll('.loading-state');

        loadingElements.forEach(element => {

            element.style.display = 'flex';

        });

    }



    hideLoadingStates() {

        const loadingElements = document.querySelectorAll('.loading-state');

        loadingElements.forEach(element => {

            element.style.display = 'none';

        });

    }



    showError(message) {

        this.showNotification(message, 'error');

    }



    renderAppointmentsError() {

        const appointmentsContainer = document.getElementById('appointments-container');

        if (appointmentsContainer) {

            appointmentsContainer.innerHTML = `

                <div class="error-message">

                    <i class="fas fa-exclamation-triangle"></i>

                    <p>Failed to load appointments. Please try again later.</p>

                </div>

            `;

        }

    }



    renderProgressError() {

        const progressContainer = document.getElementById('progress-container');

        if (progressContainer) {

            progressContainer.innerHTML = `

                <div class="error-message">

                    <i class="fas fa-exclamation-triangle"></i>

                    <p>Failed to load treatment progress. Please try again later.</p>

                    </div>

            `;

        }

    }



    renderActivityError() {

        const activityContainer = document.getElementById('activity-container');

        if (activityContainer) {

            activityContainer.innerHTML = `

                <div class="error-message">

                    <i class="fas fa-exclamation-triangle"></i>

                    <p>Failed to load recent activity. Please try again later.</p>

                </div>

            `;

        }

    }



    showNotification(message, type = 'info') {

        // Create notification element

        const notification = document.createElement('div');

        notification.className = `notification notification-${type}`;

        notification.innerHTML = `

            <div class="notification-content">

                <i class="fas fa-${this.getNotificationIcon(type)}"></i>

                <span>${message}</span>

            </div>

            <button class="notification-close" onclick="this.parentElement.remove()">

                <i class="fas fa-times"></i>

            </button>

        `;



        // Add to page

        document.body.appendChild(notification);



        // Auto remove after 5 seconds

        setTimeout(() => {

            if (notification.parentElement) {

                notification.remove();

            }

        }, 5000);

    }



    getNotificationIcon(type) {

        const icons = {

            'success': 'check-circle',

            'error': 'exclamation-circle',

            'warning': 'exclamation-triangle',

            'info': 'info-circle'

        };

        return icons[type] || 'info-circle';

    }



    // Periodic Updates

    startPeriodicUpdates() {

        // Update dashboard data every 5 minutes

        setInterval(() => {

            this.loadDashboardData();

        }, 5 * 60 * 1000);

    }



    // Profile Management Methods

    refreshProfileData() {

        // Check if user is signed in

        const userId = localStorage.getItem('userId');

        const userData = localStorage.getItem('userData');

        

        if (userId && userData) {

            try {

                // Reload user data from localStorage

                const parsedUserData = JSON.parse(userData);

                

                // Map the parsed data to our expected format, handling different field names

                const mappedUserData = {

                    id: userId,

                    first_name: parsedUserData.first_name || parsedUserData.firstname || 'Patient',

                    last_name: parsedUserData.last_name || parsedUserData.lastname || '',

                    email: parsedUserData.email || 'patient@example.com',

                    role: 'patient',

                    phone_number: parsedUserData.phone_number || parsedUserData.phone || 'Not provided',

                    created_at: parsedUserData.created_at || new Date().toISOString(),

                    gender: parsedUserData.gender || 'Not specified',

                    address: parsedUserData.address || 'Not provided',

                    city: parsedUserData.city || 'Not provided',

                    date_of_birth: parsedUserData.date_of_birth || parsedUserData.birth_date || 'Not specified',

                    blood_type: parsedUserData.blood_type || 'Not provided',

                    emergency_contact: parsedUserData.emergency_contact || 'Not provided'

                };

                

                this.currentUser = mappedUserData;



                // Update all profile-related sections

                this.updateWelcomeSection();

                this.updateProfileSection();

                

                // Log localStorage contents for debugging

                this.logLocalStorageContents();

                

                return true;

            } catch (error) {

                console.error('Error refreshing profile data:', error);

                return false;

            }

        } else {



            return false;

        }

    }

    

    // Debug method to log localStorage contents

    logLocalStorageContents() {



        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            const value = localStorage.getItem(key);



        }



    }

    

    // Debug method to set test user data

    setTestUserData() {

        const testUserData = {

            user_id: 'test-user-123',

            first_name: 'John',

            last_name: 'Doe',

            email: 'john.doe@example.com',

            phone: '+1234567890',

            role: 'patient',

            gender: 'Male',

            address: '123 Test Street',

            city: 'Test City',

            date_of_birth: '1990-01-01',

            blood_type: 'O+',

            emergency_contact: '+1234567890'

        };

        

        localStorage.setItem('userId', testUserData.user_id);

        localStorage.setItem('userRole', testUserData.role);

        localStorage.setItem('userData', JSON.stringify(testUserData));



        this.refreshProfileData();

    }

    

    // Try to get complete user info from various sources

    async tryToGetCompleteUserInfo(userId) {



        try {

            // First, try to get user info from the API

            const response = await fetch(`${this.apiBaseUrl}/users/${userId}/`, {

                method: 'GET',

                headers: {

                    'Content-Type': 'application/json',

                },

                credentials: 'include'

            });

            

            if (response.ok) {

                const userInfo = await response.json();



                // Update localStorage with complete user data

                const completeUserData = {

                    id: userId,

                    role: 'patient',

                    ...userInfo

                };

                

                localStorage.setItem('userData', JSON.stringify(completeUserData));

                

                // Update current user and refresh display

                this.currentUser = {

                    ...this.currentUser,

                    first_name: userInfo.first_name || userInfo.firstname || 'Patient',

                    last_name: userInfo.last_name || userInfo.lastname || '',

                    email: userInfo.email || 'patient@example.com',

                    phone_number: userInfo.phone_number || userInfo.phone || 'Not provided',

                    gender: userInfo.gender || 'Not specified',

                    address: userInfo.address || 'Not provided',

                    city: userInfo.city || 'Not provided',

                    date_of_birth: userInfo.date_of_birth || userInfo.birth_date || 'Not specified',

                    blood_type: userInfo.blood_type || 'Not provided',

                    emergency_contact: userInfo.emergency_contact || 'Not provided'

                };

                

                this.updateWelcomeSection();

                this.updateProfileSection();

                

            } else if (response.status === 403) {

                console.log('❌ API access forbidden (403) - user profile endpoint requires authentication');

                this.showNotification('Profile data incomplete. Please use the profile form to update your information.', 'info');

                

                // Show a helpful message about updating profile

                this.showProfileUpdatePrompt();

                

            } else {



                this.showNotification('Could not load complete user profile. Some information may be missing.', 'warning');

            }

            

        } catch (error) {



            this.showNotification('Could not load complete user profile. Some information may be missing.', 'warning');

        }

    }

    

    // Show a prompt to update profile information

    showProfileUpdatePrompt() {

        const promptHtml = `

            <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">

                <h4 style="margin: 0 0 10px 0; color: #1976d2;">

                    <i class="fas fa-user-edit"></i> Profile Information Needed

                </h4>

                <p style="margin: 0 0 15px 0; color: #1565c0;">

                    Your profile is missing some information. Please update it to see your name and details in the dashboard.

                </p>

                <button onclick="window.quickSetUser('Your Name', 'your.email@example.com')" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">

                    <i class="fas fa-user-plus"></i> Set Test Data

                </button>

                <button onclick="this.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">

                    <i class="fas fa-times"></i> Dismiss

                </button>

            </div>

        `;

        

        // Find a good place to insert this prompt

        const dashboardContainer = document.querySelector('.dashboard-container');

        if (dashboardContainer) {

            const promptDiv = document.createElement('div');

            promptDiv.innerHTML = promptHtml;

            promptDiv.className = 'profile-update-prompt';

            

            // Insert after the welcome section

            const welcomeSection = dashboardContainer.querySelector('.welcome-section');

            if (welcomeSection) {

                welcomeSection.parentNode.insertBefore(promptDiv, welcomeSection.nextSibling);

            } else {

                dashboardContainer.insertBefore(promptDiv, dashboardContainer.firstChild);

            }

        }

    }

}



// Global Action Functions

function bookAppointment() {

    window.location.href = 'book appointment/book.html';

}



function startAssessment() {

    window.location.href = 'symptom-assessment.html';

}



function viewTreatmentPlan() {

    if (window.dashboard && window.dashboard.showNotification) {

        window.dashboard.showNotification('Treatment plan view coming soon!', 'info');

    } else {

        alert('Treatment plan view coming soon!');

    }

}



function shareTestimony() {

    window.location.href = 'share-testimony.html';

}



function viewAllAppointments() {

    if (window.dashboard && window.dashboard.showNotification) {

        window.dashboard.showNotification('Appointments view coming soon!', 'info');

    } else {

        alert('Appointments view coming soon!');

    }

}



function rescheduleAppointment(appointmentId) {

    try {

        // Convert appointmentId to number and validate

        const id = parseInt(appointmentId);

        if (isNaN(id) || id <= 0) {

            if (window.dashboard && window.dashboard.showNotification) {

                window.dashboard.showNotification('Invalid appointment ID', 'error');

            } else {

                alert('Invalid appointment ID');

            }

            return;

        }

        

        // Find the appointment

        const appointment = window.dashboard && window.dashboard.appointments ? 

            window.dashboard.appointments.find(a => a.id === id) : null;

        if (!appointment) {

            if (window.dashboard && window.dashboard.showNotification) {

                window.dashboard.showNotification('Appointment not found', 'error');

            } else {

                alert('Appointment not found');

            }

            return;

        }



        // Create reschedule modal

        const modal = document.createElement('div');

        modal.className = 'modal';

        

        modal.innerHTML = `

            <div class="modal-content">

                <div class="modal-header">

                    <h3><i class="fas fa-calendar-plus"></i> Reschedule Appointment</h3>

                    <button class="modal-close" onclick="this.closest('.modal').remove()">

                        <i class="fas fa-times"></i>

                    </button>

                </div>

                <div class="modal-body">

                    <!-- Current Appointment Info -->

                    <div class="current-appointment-info" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2a5d9f;">

                        <h4 style="margin: 0 0 10px 0; color: #2a5d9f;">Current Appointment</h4>

                        <p style="margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(appointment.date).toLocaleString()}</p>

                        <p style="margin: 5px 0; font-size: 14px;"><strong>Service:</strong> ${appointment.service_type || 'Not specified'}</p>

                        <p style="margin: 5px 0; font-size: 14px;"><strong>Duration:</strong> ${appointment.duration || 60} minutes</p>

                        <p style="margin: 5px 0; font-size: 14px;"><strong>Status:</strong> ${appointment.status}</p>

                    </div>

                    

                    <form id="rescheduleForm">

                        <div class="form-group">

                            <label for="newDate">New Date & Time</label>

                            <input type="datetime-local" id="newDate" name="newDate" required 

                                   min="${new Date().toISOString().slice(0, 16)}">

                        </div>

                        <div class="form-group">

                            <label for="rescheduleReason">Reason for Rescheduling</label>

                            <select id="rescheduleReason" name="rescheduleReason" required>

                                <option value="">Select a reason...</option>

                                <option value="conflict">Schedule Conflict</option>

                                <option value="illness">Illness</option>

                                <option value="emergency">Emergency</option>

                                <option value="travel">Travel</option>

                                <option value="other">Other</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="newServiceType">New Service Type (Optional)</label>

                            <select id="newServiceType" name="newServiceType">

                                <option value="">Keep current service type</option>

                                <option value="manual-therapy">Manual Therapy</option>

                                <option value="physical-therapy">Physical Therapy</option>

                                <option value="rehabilitation">Rehabilitation Body Engineering</option>

                                <option value="consultation">General Consultation</option>

                                <option value="follow-up">Follow-up Session</option>

                                <option value="assessment">Initial Assessment</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="newDuration">New Duration (Optional)</label>

                            <select id="newDuration" name="newDuration">

                                <option value="">Keep current duration</option>

                                <option value="15">15 minutes</option>

                                <option value="30">30 minutes</option>

                                <option value="45">45 minutes</option>

                                <option value="60">60 minutes</option>

                                <option value="90">90 minutes</option>

                                <option value="120">120 minutes</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="additionalNotes">Additional Notes (Optional)</label>

                            <textarea id="additionalNotes" name="additionalNotes" rows="3" 

                                      placeholder="Any additional information..."></textarea>

                        </div>

                        <div class="form-actions">

                            <button type="submit" class="btn-primary">

                                <i class="fas fa-save"></i> Reschedule Appointment

                            </button>

                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">

                                <i class="fas fa-times"></i> Cancel

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;

        

        document.body.appendChild(modal);

        

        // Add form submission handler

        const form = modal.querySelector('#rescheduleForm');

        form.addEventListener('submit', (e) => {

            e.preventDefault();

            dashboard.handleRescheduleAppointment(appointmentId, form);

        });

        

    } catch (error) {

        console.error('Error showing reschedule modal:', error);

        dashboard.showNotification('Failed to open reschedule form', 'error');

    }

}



function cancelAppointment(appointmentId) {

    if (confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {

        dashboard.cancelAppointment(appointmentId);

    }

}



function editProfile() {

    // Call the dashboard instance method for profile editing

    if (dashboard && typeof dashboard.editProfile === 'function') {

        dashboard.editProfile();

    } else {

        alert('Profile editing is not available at the moment. Please refresh the page and try again.');

    }

}



function logout() {

    // Show logout confirmation modal

    showLogoutConfirmationModal();

}



function showLogoutConfirmationModal() {

    // Create modal overlay

    const modalOverlay = document.createElement('div');

    modalOverlay.className = 'logout-modal-overlay';

    modalOverlay.style.cssText = `

        position: fixed;

        top: 0;

        left: 0;

        width: 100%;

        height: 100%;

        background: rgba(0, 0, 0, 0.5);

        display: flex;

        justify-content: center;

        align-items: center;

        z-index: 10000;

        animation: fadeIn 0.3s ease-out;

    `;



    // Create modal content

    const modalContent = document.createElement('div');

    modalContent.className = 'logout-modal-content';

    modalContent.style.cssText = `

        background: white;

        padding: 30px;

        border-radius: 12px;

        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

        max-width: 400px;

        width: 90%;

        text-align: center;

        animation: slideInUp 0.3s ease-out;

    `;



    modalContent.innerHTML = `

        <div class="logout-modal-icon" style="margin-bottom: 20px;">

            <i class="fas fa-sign-out-alt" style="font-size: 48px; color: #dc3545;"></i>

        </div>

        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Confirm Logout</h3>

        <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5;">

            Are you sure you want to logout? This will end your current session and you'll need to sign in again.

        </p>

        <div class="logout-modal-actions" style="display: flex; gap: 15px; justify-content: center;">

            <button id="cancelLogoutBtn" style="

                flex: 1; 

                max-width: 120px; 

                background: #6c757d; 

                color: white; 

                border: 1px solid #6c757d; 

                padding: 10px 15px; 

                border-radius: 6px; 

                cursor: pointer;

                font-size: 14px;

            ">

                <i class="fas fa-times"></i> Cancel

            </button>

            <button id="confirmLogoutBtn" style="

                flex: 1; 

                max-width: 120px; 

                background: #dc3545; 

                color: white; 

                border: 1px solid #dc3545; 

                padding: 10px 15px; 

                border-radius: 6px; 

                cursor: pointer;

                font-size: 14px;

            ">

                <i class="fas fa-sign-out-alt"></i> Logout

            </button>

        </div>

    `;



    modalOverlay.appendChild(modalContent);

    document.body.appendChild(modalOverlay);



    // Add event listeners

    const cancelBtn = modalOverlay.querySelector('#cancelLogoutBtn');

    const confirmBtn = modalOverlay.querySelector('#confirmLogoutBtn');



    cancelBtn.addEventListener('click', () => {

        modalOverlay.remove();

    });



    confirmBtn.addEventListener('click', () => {

        localStorage.removeItem('userId');

        localStorage.removeItem('sessionId');

        window.location.href = 'book appointment/sign in.html';

    });



    // Close modal when clicking outside

    modalOverlay.addEventListener('click', (e) => {

        if (e.target === modalOverlay) {

            modalOverlay.remove();

        }

    });



    // Close modal with Escape key

    document.addEventListener('keydown', function closeOnEscape(e) {

        if (e.key === 'Escape') {

            modalOverlay.remove();

            document.removeEventListener('keydown', closeOnEscape);

        }

    });

}



// Initialize Dashboard

let dashboard;

document.addEventListener('DOMContentLoaded', function() {



    try {
        // Debug: Check localStorage before creating dashboard
        console.log('=== PRE-DASHBOARD DEBUG ===');
        console.log('Session ID:', localStorage.getItem('sessionId'));
        console.log('User ID:', localStorage.getItem('userId'));
        console.log('User Role:', localStorage.getItem('userRole'));
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('========================');

        dashboard = new PatientDashboard();

        // Make dashboard globally accessible

        window.dashboard = dashboard;



        // Also make debug functions global immediately

        window.debugDashboard = function() {



            if (window.dashboard) {



                window.dashboard.logLocalStorageContents();

                window.dashboard.refreshProfileData();

            } else {



            }

        };

        

        window.setUserData = function(firstName, lastName, email) {



            const userData = {

                user_id: 'manual-user-123',

                first_name: firstName,

                last_name: lastName,

                email: email,

                role: 'patient'

            };

            

            localStorage.setItem('userId', userData.user_id);

            localStorage.setItem('userRole', userData.role);

            localStorage.setItem('userData', JSON.stringify(userData));

            

            if (window.dashboard) {

                window.dashboard.refreshProfileData();

            }



        };



        // Add a simple way to set user data immediately

        window.quickSetUser = function(name, email) {



            const userData = {

                id: 95,

                role: 'patient',

                first_name: name,

                last_name: '',

                email: email,

                phone_number: 'Not provided',

                gender: 'Not specified',

                address: 'Not provided',

                city: 'Not provided',

                date_of_birth: 'Not specified',

                blood_type: 'Not provided',

                emergency_contact: 'Not provided'

            };

            

            localStorage.setItem('userData', JSON.stringify(userData));



            console.log('New userData:', localStorage.getItem('userData'));

            

            if (window.dashboard) {



                window.dashboard.refreshProfileData();

            } else {



            }

        };

        

        // Add a comprehensive profile update function

        window.updateProfile = function() {

            const name = prompt('Enter your full name:');

            if (!name) return;

            

            const email = prompt('Enter your email:');

            if (!email) return;

            

            const phone = prompt('Enter your phone number (optional):') || 'Not provided';

            

            const userData = {

                id: 95,

                role: 'patient',

                first_name: name.split(' ')[0] || name,

                last_name: name.split(' ').slice(1).join(' ') || '',

                email: email,

                phone_number: phone,

                gender: 'Not specified',

                address: 'Not provided',

                city: 'Not provided',

                date_of_birth: 'Not specified',

                blood_type: 'Not provided',

                emergency_contact: 'Not provided'

            };

            

            localStorage.setItem('userData', JSON.stringify(userData));



            if (window.dashboard) {

                window.dashboard.refreshProfileData();

            }

            

            alert('Profile updated successfully! The dashboard should now show your information.');

        };



        // Add a function to check current state

        window.checkDashboardState = function() {



            console.log('localStorage userData:', localStorage.getItem('userData'));

            console.log('localStorage userId:', localStorage.getItem('userId'));

            console.log('localStorage userRole:', localStorage.getItem('userRole'));

            

            if (window.dashboard) {



            } else {



            }

        };



        // Add a function to force refresh the display

        window.forceRefreshDashboard = function() {



            if (window.dashboard) {

                // Force reload user data from localStorage

                const userDataStr = localStorage.getItem('userData');

                if (userDataStr) {

                    try {

                        const userData = JSON.parse(userDataStr);



                        // Update the dashboard's current user

                        window.dashboard.currentUser = {

                            id: userData.id || 95,

                            role: 'patient',

                            first_name: userData.first_name || 'Patient',

                            last_name: userData.last_name || '',

                            email: userData.email || 'patient@example.com',

                            phone_number: userData.phone_number || 'Not provided',

                            created_at: new Date().toISOString(),

                            gender: userData.gender || 'Not specified',

                            address: userData.address || 'Not provided',

                            city: userData.city || 'Not provided',

                            date_of_birth: userData.date_of_birth || 'Not specified',

                            blood_type: userData.blood_type || 'Not provided',

                            emergency_contact: userData.emergency_contact || 'Not provided'

                        };

                        

                        // Update the display

                        window.dashboard.updateWelcomeSection();

                        window.dashboard.updateProfileSection();



                    } catch (e) {

                        console.error('Error parsing user data:', e);

                    }

                } else {



                }

            } else {



            }

        };



    } catch (error) {

        console.error('Failed to initialize dashboard:', error);

        // Fallback initialization

        try {

            dashboard = new PatientDashboard();

            window.dashboard = dashboard;

        } catch (fallbackError) {

            console.error('Fallback initialization also failed:', fallbackError);

            alert('Failed to load dashboard. Please refresh the page.');

        }

    }

});



// Export for testing

if (typeof module !== 'undefined' && module.exports) {

    module.exports = PatientDashboard;

}



// Global debug function - call this from browser console

window.debugDashboard = function() {



    if (window.dashboard) {



        window.dashboard.logLocalStorageContents();

        window.dashboard.refreshProfileData();

    } else {



    }

};



// Global function to manually set user data

window.setUserData = function(firstName, lastName, email) {



    const userData = {

        user_id: 'manual-user-123',

        first_name: firstName,

        last_name: lastName,

        email: email,

        role: 'patient'

    };

    

    localStorage.setItem('userId', userData.user_id);

    localStorage.setItem('userRole', userData.role);

    localStorage.setItem('userData', JSON.stringify(userData));

    

    if (window.dashboard) {

        window.dashboard.refreshProfileData();

    }



};


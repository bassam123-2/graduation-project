/**
 * Shared Authentication Utilities for AL-BOQAI Center
 * This file provides consistent authentication state management across all pages
 */

// Authentication state management
const AuthUtils = {
    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('userId');
    },

    // Get current user data
    getCurrentUser() {
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        
        if (userId) {
            return {
                id: userId,
                role: userRole,
                name: userName,
                email: userEmail
            };
        }
        return null;
    },

    // Update navigation based on authentication state
    updateNavigationForAuth() {
        const userId = localStorage.getItem('userId');
        console.log('🔐 AuthUtils.updateNavigationForAuth() called, userId:', userId);
        
        const signinLink = document.querySelector('.signin-link, #signin-nav-link, a[href*="sign in.html"]');
        const dashboardLink = document.querySelector('.dashboard-link, #dashboard-nav-link, a[href*="patient-dashboard.html"]');

        if (userId) {

            // User is signed in - show dashboard, hide sign in
            if (signinLink) {
                signinLink.style.display = 'none';

                // Also hide any parent li elements if they exist
                const signinLi = signinLink.closest('li');
                if (signinLi) {
                    signinLi.style.display = 'none';

                }
            }
            
            if (dashboardLink) {
                dashboardLink.style.display = 'block';

                // Also show any parent li elements if they exist
                const dashboardLi = dashboardLink.closest('li');
                if (dashboardLi) {
                    dashboardLi.style.display = 'block';

                }
            }
            
            // Update any other sign-in related elements
            this.updateSignInElements(true);
        } else {

            // User is not signed in - show sign in, hide dashboard
            if (signinLink) {
                signinLink.style.display = 'block';

                // Also show any parent li elements if they exist
                const signinLi = signinLink.closest('li');
                if (signinLi) {
                    signinLi.style.display = 'block';

                }
            }
            
            if (dashboardLink) {
                dashboardLink.style.display = 'none';

                // Also hide any parent li elements if they exist
                const dashboardLi = dashboardLink.closest('li');
                if (dashboardLi) {
                    dashboardLi.style.display = 'none';

                }
            }
            
            // Update any other sign-in related elements
            this.updateSignInElements(false);
        }

    },

    // Update other sign-in related elements
    updateSignInElements(isAuthenticated) {
        // Update any "Sign In" buttons or links that might be in the content
        const signInButtons = document.querySelectorAll('button, a, .btn');
        signInButtons.forEach(element => {
            const text = element.textContent || element.innerText;
            if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
                if (isAuthenticated) {
                    // Replace with dashboard access
                    element.textContent = 'Dashboard';
                    element.href = element.href || 'patient-dashboard.html';
                    element.onclick = () => window.location.href = 'patient-dashboard.html';
                } else {
                    // Keep as sign in
                    element.textContent = 'Sign In';
                    element.href = element.href || 'book appointment/sign in.html';
                }
            }
        });
    },

    // Handle logout
    logout() {
        // Clear user data
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Update navigation
        this.updateNavigationForAuth();
        
        // Redirect to home page
        window.location.href = 'home.html';
    },

    // Show logout confirmation
    showLogoutConfirmation() {
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
                <button id="cancelLogoutBtn" class="btn btn-secondary" style="flex: 1; max-width: 120px;">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button id="confirmLogoutBtn" class="btn btn-danger" style="flex: 1; max-width: 120px;">
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
            this.logout();
            modalOverlay.remove();
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
    },

    // Initialize authentication state for the current page
    init() {
        console.log('🚀 AuthUtils.init() called');
        
        // Update navigation immediately
        this.updateNavigationForAuth();
        
        // Listen for auth state changes (when localStorage changes in other tabs)
        window.addEventListener('storage', (e) => {

            if (e.key === 'userId' || e.key === 'sessionId') {
                this.updateNavigationForAuth();
            }
        });

        // Listen for logout button clicks
        document.addEventListener('click', (e) => {
            if (e.target && (e.target.id === 'logout-btn' || e.target.classList.contains('logout-btn'))) {
                e.preventDefault();
                this.showLogoutConfirmation();
            }
        });

        // Add logout functionality to any logout links
        const logoutLinks = document.querySelectorAll('a[href*="logout"], a[onclick*="logout"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogoutConfirmation();
            });
        });
        
        console.log('✅ AuthUtils.init() completed');
    }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AuthUtils.init();
    });
} else {
    AuthUtils.init();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthUtils;
} else {
    // Browser environment
    window.AuthUtils = AuthUtils;
}

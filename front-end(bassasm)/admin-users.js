// Admin Users Management JavaScript
// Comprehensive functionality for AL-BOQAI Center User Management

class AdminUsersManager {
    constructor() {
        this.apiBaseUrl = CONFIG.API.BASE_URL;
        this.currentUser = null;
        this.users = [];
        this.filteredUsers = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAdminAuthentication();
            await this.loadUsers();
            this.setupEventListeners();
            this.setupSearchAndFilters();
        } catch (error) {
            console.error('Admin users manager initialization error:', error);
            this.handleAuthError();
        }
    }

    // Authentication Methods
    async checkAdminAuthentication() {
        const userId = localStorage.getItem('userId');
        const sessionId = localStorage.getItem('sessionId');
        
        if (!userId) {
            throw new Error('No user session found');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Session expired');
            }

            this.currentUser = await response.json();
            
            if (this.currentUser.role !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }
            
        } catch (error) {
            console.error('Admin authentication check failed:', error);
            throw error;
        }
    }

    handleAuthError() {
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        
        this.showNotification('Access denied or session expired. Please sign in as admin.', 'error');
        
        setTimeout(() => {
            window.location.href = 'book appointment/sign in.html';
        }, 3000);
    }

    // Data Loading Methods
    async loadUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.users = await response.json();
                this.filteredUsers = [...this.users];
                this.renderUsersTable();
                this.hideLoadingState();
            } else {
                throw new Error('Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.renderUsersError();
        }
    }

    // Rendering Methods
    renderUsersTable() {
        const tableBody = document.getElementById('users-table-body');
        
        if (this.filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <span>No users found</span>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredUsers.map(user => {
            const statusClass = user.is_active ? 'status-active' : 'status-inactive';
            const statusText = user.is_active ? 'Active' : 'Inactive';
            const roleText = this.formatRole(user.role);
            
            return `
                <tr class="user-row ${statusClass}">
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="user-details">
                                <span class="user-name">${user.first_name} ${user.last_name}</span>
                                <span class="user-id">ID: ${user.id}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="user-email">${user.email}</span>
                        ${user.is_email_verified ? '<i class="fas fa-check-circle verified" title="Email Verified"></i>' : ''}
                    </td>
                    <td>
                        <span class="user-role role-${user.role}">${roleText}</span>
                    </td>
                    <td>
                        <span class="user-status ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <span class="user-phone">${user.phone_number || 'N/A'}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-secondary btn-sm" onclick="adminUsersManager.viewUser(${user.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-primary btn-sm" onclick="adminUsersManager.editUser(${user.id})" title="Edit User">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-warning btn-sm" onclick="adminUsersManager.toggleUserStatus(${user.id})" title="${user.is_active ? 'Deactivate' : 'Activate'}">
                                <i class="fas fa-${user.is_active ? 'pause' : 'play'}"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderUsersError() {
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Failed to load users</span>
                    <button class="retry-btn" onclick="adminUsersManager.loadUsers()">Retry</button>
                </td>
            </tr>
        `;
    }

    hideLoadingState() {
        const loadingElement = document.querySelector('.loading-state');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Utility Methods
    formatRole(role) {
        const roleMap = {
            'admin': 'Administrator',
            'patient': 'Patient',
            'therapist': 'Therapist'
        };
        return roleMap[role] || role;
    }

    getAuthHeaders() {
        const sessionId = localStorage.getItem('sessionId');
        return {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };
    }

    // Search and Filter Methods
    setupSearchAndFilters() {
        const searchInput = document.getElementById('search-input');
        const roleFilter = document.getElementById('role-filter');
        const statusFilter = document.getElementById('status-filter');

        searchInput.addEventListener('input', () => this.filterUsers());
        roleFilter.addEventListener('change', () => this.filterUsers());
        statusFilter.addEventListener('change', () => this.filterUsers());
    }

    filterUsers() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const roleFilter = document.getElementById('role-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !searchTerm || 
                user.first_name.toLowerCase().includes(searchTerm) ||
                user.last_name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
            
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesStatus = !statusFilter || 
                (statusFilter === 'active' && user.is_active) ||
                (statusFilter === 'inactive' && !user.is_active);

            return matchesSearch && matchesRole && matchesStatus;
        });

        this.renderUsersTable();
    }

    // Action Methods
    async viewUser(userId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const user = await response.json();
                this.showUserDetails(user);
            } else {
                throw new Error('Failed to load user details');
            }
        } catch (error) {
            console.error('Error viewing user:', error);
            this.showNotification('Failed to load user details', 'error');
        }
    }

    async editUser(userId) {
        this.showNotification('User editing coming soon!', 'info');
    }

    async toggleUserStatus(userId) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) return;

            const newStatus = !user.is_active;
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}/`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    is_active: newStatus
                })
            });

            if (response.ok) {
                user.is_active = newStatus;
                this.renderUsersTable();
                this.showNotification(
                    `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 
                    'success'
                );
            } else {
                throw new Error('Failed to update user status');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showNotification('Failed to update user status', 'error');
        }
    }

    showUserDetails(user) {
        const details = `
            <div class="user-details-modal">
                <h3>User Details</h3>
                <div class="detail-row">
                    <strong>Name:</strong> ${user.first_name} ${user.last_name}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${user.email}
                    ${user.is_email_verified ? ' <i class="fas fa-check-circle verified"></i>' : ''}
                </div>
                <div class="detail-row">
                    <strong>Role:</strong> ${this.formatRole(user.role)}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> ${user.is_active ? 'Active' : 'Inactive'}
                </div>
                <div class="detail-row">
                    <strong>Phone:</strong> ${user.phone_number || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Gender:</strong> ${user.gender || 'N/A'}
                </div>
                ${user.medical_history ? `
                    <div class="detail-row">
                        <strong>Medical History:</strong> ${user.medical_history}
                    </div>
                ` : ''}
                <div class="detail-row">
                    <strong>Created:</strong> ${new Date(user.date_joined).toLocaleDateString()}
                </div>
            </div>
        `;

        this.showModal('User Details', details);
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    }

    showNotification(message, type = 'info') {
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

        document.body.appendChild(notification);

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

    // Event Listeners
    setupEventListeners() {
        // Add any additional event listeners here
    }
}

// Global Action Functions
function exportUsers() {
    adminUsersManager.showNotification('User export coming soon!', 'info');
}

function refreshUsers() {
    adminUsersManager.loadUsers();
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

// Initialize Admin Users Manager
let adminUsersManager;
document.addEventListener('DOMContentLoaded', function() {
    adminUsersManager = new AdminUsersManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminUsersManager;
}

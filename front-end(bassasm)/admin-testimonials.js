// Admin Testimonials Management JavaScript
// Comprehensive functionality for AL-BOQAI Center Testimonial Management

class AdminTestimonialsManager {
    constructor() {
        this.apiBaseUrl = CONFIG.API.BASE_URL;
        this.currentUser = null;
        this.testimonials = [];
        this.filteredTestimonials = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAdminAuthentication();
            await this.loadTestimonials();
            this.setupEventListeners();
            this.setupSearchAndFilters();
        } catch (error) {
            console.error('Admin testimonials manager initialization error:', error);
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
    async loadTestimonials() {
        try {
            // Testimonials endpoint allows anonymous access, so we don't need auth headers
            const response = await fetch(`${this.apiBaseUrl}/testimonials/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.testimonials = await response.json();
                this.filteredTestimonials = [...this.testimonials];
                this.renderTestimonialsGrid();
                this.hideLoadingState();
            } else {
                throw new Error('Failed to load testimonials');
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            this.renderTestimonialsError();
        }
    }

    // Rendering Methods
    renderTestimonialsGrid() {
        const grid = document.getElementById('testimonials-grid');
        
        if (this.filteredTestimonials.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star-o"></i>
                    <p>No testimonials found</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredTestimonials.map(testimonial => {
            const statusClass = this.getStatusClass(testimonial.status);
            const statusText = this.formatStatus(testimonial.status);
            const ratingStars = this.generateRatingStars(testimonial.rating);
            const patientName = testimonial.user ? 
                `${testimonial.user.first_name} ${testimonial.user.last_name}` : 
                testimonial.patient_name || 'Anonymous';
            
            return `
                <div class="testimonial-card ${statusClass}">
                    <div class="testimonial-header">
                        <div class="patient-info">
                            <div class="patient-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="patient-details">
                                <span class="patient-name">${patientName}</span>
                                <span class="testimonial-date">${new Date(testimonial.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="testimonial-status">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    
                    <div class="testimonial-rating">
                        ${ratingStars}
                        <span class="rating-text">${testimonial.rating}/5</span>
                    </div>
                    
                    <div class="testimonial-content">
                        <p>${testimonial.testimonial_text}</p>
                    </div>
                    
                    ${testimonial.treatment_type ? `
                        <div class="treatment-info">
                            <i class="fas fa-stethoscope"></i>
                            <span>${this.formatTreatmentType(testimonial.treatment_type)}</span>
                        </div>
                    ` : ''}
                    
                    <div class="testimonial-actions">
                        <button class="btn-secondary btn-sm" onclick="adminTestimonialsManager.viewTestimonial(${testimonial.id})" title="View Details">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${testimonial.status === 'pending' ? `
                            <button class="btn-success btn-sm" onclick="adminTestimonialsManager.approveTestimonial(${testimonial.id})" title="Approve">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-danger btn-sm" onclick="adminTestimonialsManager.rejectTestimonial(${testimonial.id})" title="Reject">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        <button class="btn-warning btn-sm" onclick="adminTestimonialsManager.editTestimonial(${testimonial.id})" title="Edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTestimonialsError() {
        const grid = document.getElementById('testimonials-grid');
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load testimonials</p>
                <button class="retry-btn" onclick="adminTestimonialsManager.loadTestimonials()">Retry</button>
            </div>
        `;
    }

    hideLoadingState() {
        const loadingElement = document.querySelector('.loading-state');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Utility Methods
    getStatusClass(status) {
        const statusMap = {
            'pending': 'status-pending',
            'approved': 'status-approved',
            'rejected': 'status-rejected'
        };
        return statusMap[status] || 'status-pending';
    }

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending Review',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    formatTreatmentType(treatmentType) {
        const treatmentMap = {
            'manual-therapy': 'Manual Therapy',
            'physical-therapy': 'Physical Therapy',
            'rehabilitation': 'Rehabilitation',
            'consultation': 'Consultation',
            'follow-up': 'Follow-up',
            'assessment': 'Assessment'
        };
        return treatmentMap[treatmentType] || treatmentType;
    }

    generateRatingStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star star-filled"></i>';
            } else {
                stars += '<i class="far fa-star star-empty"></i>';
            }
        }
        return stars;
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
        const statusFilter = document.getElementById('status-filter');
        const ratingFilter = document.getElementById('rating-filter');

        searchInput.addEventListener('input', () => this.filterTestimonials());
        statusFilter.addEventListener('change', () => this.filterTestimonials());
        ratingFilter.addEventListener('change', () => this.filterTestimonials());
    }

    filterTestimonials() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const ratingFilter = document.getElementById('rating-filter').value;

        this.filteredTestimonials = this.testimonials.filter(testimonial => {
            const matchesSearch = !searchTerm || 
                testimonial.testimonial_text.toLowerCase().includes(searchTerm) ||
                (testimonial.user && (
                    testimonial.user.first_name.toLowerCase().includes(searchTerm) ||
                    testimonial.user.last_name.toLowerCase().includes(searchTerm)
                )) ||
                (testimonial.patient_name && testimonial.patient_name.toLowerCase().includes(searchTerm));
            
            const matchesStatus = !statusFilter || testimonial.status === statusFilter;
            const matchesRating = !ratingFilter || testimonial.rating == ratingFilter;

            return matchesSearch && matchesStatus && matchesRating;
        });

        this.renderTestimonialsGrid();
    }

    // Action Methods
    async viewTestimonial(testimonialId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/testimonials/${testimonialId}/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const testimonial = await response.json();
                this.showTestimonialDetails(testimonial);
            } else {
                throw new Error('Failed to load testimonial details');
            }
        } catch (error) {
            console.error('Error viewing testimonial:', error);
            this.showNotification('Failed to load testimonial details', 'error');
        }
    }

    async approveTestimonial(testimonialId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/testimonials/${testimonialId}/`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    status: 'approved'
                })
            });

            if (response.ok) {
                const testimonial = this.testimonials.find(t => t.id === testimonialId);
                if (testimonial) {
                    testimonial.status = 'approved';
                    this.renderTestimonialsGrid();
                }
                this.showNotification('Testimonial approved successfully', 'success');
            } else {
                throw new Error('Failed to approve testimonial');
            }
        } catch (error) {
            console.error('Error approving testimonial:', error);
            this.showNotification('Failed to approve testimonial', 'error');
        }
    }

    async rejectTestimonial(testimonialId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/testimonials/${testimonialId}/`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    status: 'rejected'
                })
            });

            if (response.ok) {
                const testimonial = this.testimonials.find(t => t.id === testimonialId);
                if (testimonial) {
                    testimonial.status = 'rejected';
                    this.renderTestimonialsGrid();
                }
                this.showNotification('Testimonial rejected successfully', 'success');
            } else {
                throw new Error('Failed to reject testimonial');
            }
        } catch (error) {
            console.error('Error rejecting testimonial:', error);
            this.showNotification('Failed to reject testimonial', 'error');
        }
    }

    async editTestimonial(testimonialId) {
        this.showNotification('Testimonial editing coming soon!', 'info');
    }

    showTestimonialDetails(testimonial) {
        const patientName = testimonial.user ? 
            `${testimonial.user.first_name} ${testimonial.user.last_name}` : 
            testimonial.patient_name || 'Anonymous';
        
        const details = `
            <div class="testimonial-details-modal">
                <h3>Testimonial Details</h3>
                <div class="detail-row">
                    <strong>Patient:</strong> ${patientName}
                </div>
                <div class="detail-row">
                    <strong>Rating:</strong> ${this.generateRatingStars(testimonial.rating)} (${testimonial.rating}/5)
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> ${this.formatStatus(testimonial.status)}
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> ${new Date(testimonial.created_at).toLocaleString()}
                </div>
                ${testimonial.treatment_type ? `
                    <div class="detail-row">
                        <strong>Treatment Type:</strong> ${this.formatTreatmentType(testimonial.treatment_type)}
                    </div>
                ` : ''}
                <div class="detail-row">
                    <strong>Testimonial:</strong>
                    <div class="testimonial-text">${testimonial.testimonial_text}</div>
                </div>
            </div>
        `;

        this.showModal('Testimonial Details', details);
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
function exportTestimonials() {
    adminTestimonialsManager.showNotification('Testimonial export coming soon!', 'info');
}

function refreshTestimonials() {
    adminTestimonialsManager.loadTestimonials();
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

// Initialize Admin Testimonials Manager
let adminTestimonialsManager;
document.addEventListener('DOMContentLoaded', function() {
    adminTestimonialsManager = new AdminTestimonialsManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminTestimonialsManager;
}

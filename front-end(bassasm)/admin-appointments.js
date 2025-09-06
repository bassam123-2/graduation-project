// Admin Appointments Management JavaScript
// Comprehensive functionality for managing appointments

class AdminAppointmentsManager {
    constructor() {
        this.apiBaseUrl = CONFIG.API.BASE_URL;
        this.currentUser = null;
        this.appointments = [];
        this.filteredAppointments = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        
        this.init();
    }

    async init() {
        try {
            await this.checkAdminAuthentication();
            await this.loadAppointments();
            this.setupEventListeners();
        } catch (error) {
            console.error('Appointments manager initialization error:', error);
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
    async loadAppointments() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.appointments = await response.json();
                this.filteredAppointments = [...this.appointments];
                this.renderAppointments();
                this.updateStatistics();
                this.updateAppointmentsCount();
            } else {
                throw new Error('Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.renderError('Failed to load appointments');
        }
    }

    // Rendering Methods
    renderAppointments() {
        const tbody = document.getElementById('appointments-tbody');
        
        if (this.filteredAppointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row">
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>No appointments found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageAppointments = this.filteredAppointments.slice(startIndex, endIndex);

        tbody.innerHTML = pageAppointments.map(appointment => {
            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusClass = `status-${appointment.status}`;
            const statusText = this.formatStatus(appointment.status);
            
            const patientName = appointment.user ? 
                `${appointment.user.first_name} ${appointment.user.last_name}` : 
                appointment.patient_name || 'Anonymous';
            
            const notes = appointment.note ? 
                (appointment.note.length > 50 ? appointment.note.substring(0, 50) + '...' : appointment.note) : 
                'No notes';
            
            return `
                <tr>
                    <td>
                        <div class="patient-info">
                            <strong>${patientName}</strong>
                            ${appointment.user ? `<br><small>${appointment.user.email}</small>` : ''}
                        </div>
                    </td>
                    <td>${formattedDate}</td>
                    <td>${this.formatServiceType(appointment.service_type)}</td>
                    <td>
                        <span class="appointment-status ${statusClass}">${statusText}</span>
                    </td>
                    <td>${appointment.duration} min</td>
                    <td title="${appointment.note || 'No notes'}">${notes}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-secondary btn-sm" onclick="appointmentsManager.viewAppointment(${appointment.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-primary btn-sm" onclick="appointmentsManager.editAppointment(${appointment.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-danger btn-sm" onclick="appointmentsManager.deleteAppointment(${appointment.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination();
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button onclick="appointmentsManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button onclick="appointmentsManager.goToPage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span>...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button onclick="appointmentsManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    renderError(message) {
        const tbody = document.getElementById('appointments-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="error-row">
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${message}</p>
                        <button class="retry-btn" onclick="appointmentsManager.loadAppointments()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Utility Methods
    formatStatus(status) {
        const statusMap = {
            'scheduled': 'Scheduled',
            'confirmed': 'Confirmed',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
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

    getAuthHeaders() {
        const sessionId = localStorage.getItem('sessionId');
        return {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };
    }

    // Filtering and Search Methods
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.filterAppointments();
        });

        // Filter controls
        const statusFilter = document.getElementById('status-filter');
        const serviceFilter = document.getElementById('service-filter');
        const dateFilter = document.getElementById('date-filter');

        statusFilter.addEventListener('change', () => this.filterAppointments());
        serviceFilter.addEventListener('change', () => this.filterAppointments());
        dateFilter.addEventListener('change', () => this.filterAppointments());
    }

    filterAppointments() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const serviceFilter = document.getElementById('service-filter').value;
        const dateFilter = document.getElementById('date-filter').value;

        this.filteredAppointments = this.appointments.filter(appointment => {
            // Search filter
            const patientName = appointment.user ? 
                `${appointment.user.first_name} ${appointment.user.last_name}`.toLowerCase() : 
                (appointment.patient_name || '').toLowerCase();
            const patientEmail = appointment.user ? appointment.user.email.toLowerCase() : '';
            const notes = (appointment.note || '').toLowerCase();
            
            const matchesSearch = !searchTerm || 
                patientName.includes(searchTerm) || 
                patientEmail.includes(searchTerm) || 
                notes.includes(searchTerm);

            // Status filter
            const matchesStatus = !statusFilter || appointment.status === statusFilter;

            // Service filter
            const matchesService = !serviceFilter || appointment.service_type === serviceFilter;

            // Date filter
            let matchesDate = true;
            if (dateFilter) {
                const appointmentDate = new Date(appointment.date);
                const filterDate = new Date(dateFilter);
                matchesDate = appointmentDate.toDateString() === filterDate.toDateString();
            }

            return matchesSearch && matchesStatus && matchesService && matchesDate;
        });

        this.currentPage = 1;
        this.renderAppointments();
        this.updateAppointmentsCount();
    }

    // Pagination Methods
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderAppointments();
        }
    }

    // Statistics Methods
    updateStatistics() {
        const stats = {
            scheduled: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            total: this.appointments.length
        };

        this.appointments.forEach(apt => {
            if (stats.hasOwnProperty(apt.status)) {
                stats[apt.status]++;
            }
        });

        document.getElementById('scheduled-count').textContent = stats.scheduled;
        document.getElementById('confirmed-count').textContent = stats.confirmed;
        document.getElementById('completed-count').textContent = stats.completed;
        document.getElementById('cancelled-count').textContent = stats.cancelled;
        document.getElementById('total-count').textContent = stats.total;
    }

    updateAppointmentsCount() {
        const countElement = document.getElementById('appointments-count');
        countElement.textContent = `${this.filteredAppointments.length} appointment${this.filteredAppointments.length !== 1 ? 's' : ''}`;
    }

    // Action Methods
    async viewAppointment(appointmentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const appointment = await response.json();
                this.showAppointmentDetails(appointment);
            } else {
                throw new Error('Failed to load appointment details');
            }
        } catch (error) {
            console.error('Error viewing appointment:', error);
            this.showNotification('Failed to load appointment details', 'error');
        }
    }

    async editAppointment(appointmentId) {
        try {
            // Get appointment details first
            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const appointment = await response.json();
                this.showRescheduleModal(appointment);
            } else {
                throw new Error('Failed to load appointment details');
            }
        } catch (error) {
            console.error('Error loading appointment for editing:', error);
            this.showNotification('Failed to load appointment details', 'error');
        }
    }

    showRescheduleModal(appointment) {
        const patientName = appointment.user ? 
            `${appointment.user.first_name} ${appointment.user.last_name}` : 
            appointment.patient_name || 'Anonymous';
        
        const currentDate = new Date(appointment.date);
        const formattedDate = currentDate.toISOString().slice(0, 16); // Format for datetime-local input
        
        const modal = document.createElement('div');
        modal.className = 'modal reschedule-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> Reschedule Appointment</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="appointment-summary">
                        <h4>Current Appointment</h4>
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Current Date:</strong> ${currentDate.toLocaleString()}</p>
                        <p><strong>Service:</strong> ${this.formatServiceType(appointment.service_type)}</p>
                        <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
                    </div>
                    
                    <form id="rescheduleForm" class="reschedule-form">
                        <div class="form-group">
                            <label for="newDate">New Date & Time</label>
                            <input type="datetime-local" id="newDate" name="newDate" value="${formattedDate}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="rescheduleReason">Reason for Rescheduling</label>
                            <select id="rescheduleReason" name="rescheduleReason" required>
                                <option value="">Select a reason</option>
                                <option value="Patient request">Patient request</option>
                                <option value="Therapist unavailable">Therapist unavailable</option>
                                <option value="Emergency">Emergency</option>
                                <option value="Weather conditions">Weather conditions</option>
                                <option value="Technical issues">Technical issues</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="newServiceType">New Service Type (Optional)</label>
                            <select id="newServiceType" name="newServiceType">
                                <option value="">Keep current</option>
                                <option value="manual-therapy">Manual Therapy</option>
                                <option value="physical-therapy">Physical Therapy</option>
                                <option value="rehabilitation">Rehabilitation</option>
                                <option value="consultation">Consultation</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="assessment">Assessment</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="newDuration">New Duration (Optional)</label>
                            <input type="number" id="newDuration" name="newDuration" min="15" max="180" step="15" value="${appointment.duration}">
                            <small>minutes</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="additionalNotes">Additional Notes (Optional)</label>
                            <textarea id="additionalNotes" name="additionalNotes" rows="3" placeholder="Any additional information..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Reschedule Appointment
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
            this.handleRescheduleSubmit(appointment.id, form);
        });
        
        // Focus on first input
        modal.querySelector('#newDate').focus();
    }

    async handleRescheduleSubmit(appointmentId, form) {
        try {
            const formData = new FormData(form);
            
            // Validate form data
            const newDate = formData.get('newDate');
            const rescheduleReason = formData.get('rescheduleReason');
            
            if (!newDate || !rescheduleReason) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Prepare reschedule data
            const rescheduleData = {
                new_date: new Date(newDate).toISOString(),
                reschedule_reason: rescheduleReason
            };
            
            // Add optional fields if provided
            const newServiceType = formData.get('newServiceType');
            if (newServiceType) {
                rescheduleData.new_service_type = newServiceType;
            }
            
            const newDuration = formData.get('newDuration');
            if (newDuration) {
                rescheduleData.new_duration = parseInt(newDuration);
            }
            
            const additionalNotes = formData.get('additionalNotes');
            if (additionalNotes) {
                rescheduleData.new_note = additionalNotes;
            }
            
            // Call reschedule API
            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/reschedule/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(rescheduleData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showNotification('Appointment rescheduled successfully!', 'success');
                
                // Close modal
                form.closest('.modal').remove();
                
                // Refresh appointments list
                await this.loadAppointments();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reschedule appointment');
            }
            
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            this.showNotification(error.message || 'Failed to reschedule appointment', 'error');
        }
    }

    async deleteAppointment(appointmentId) {
        if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });

                if (response.ok) {
                    this.showNotification('Appointment deleted successfully', 'success');
                    await this.loadAppointments();
                } else {
                    throw new Error('Failed to delete appointment');
                }
            } catch (error) {
                console.error('Error deleting appointment:', error);
                this.showNotification('Failed to delete appointment. Please try again.', 'error');
            }
        }
    }

    showAppointmentDetails(appointment) {
        const patientName = appointment.user ? 
            `${appointment.user.first_name} ${appointment.user.last_name}` : 
            appointment.patient_name || 'Anonymous';
        
        const details = `
            <div class="appointment-details-modal">
                <h3>Appointment Details</h3>
                <div class="detail-row">
                    <strong>Patient:</strong> ${patientName}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${appointment.user ? appointment.user.email : 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> ${new Date(appointment.date).toLocaleString()}
                </div>
                <div class="detail-row">
                    <strong>Service:</strong> ${this.formatServiceType(appointment.service_type)}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> ${this.formatStatus(appointment.status)}
                </div>
                <div class="detail-row">
                    <strong>Duration:</strong> ${appointment.duration} minutes
                </div>
                ${appointment.note ? `
                    <div class="detail-row">
                        <strong>Notes:</strong> ${appointment.note}
                    </div>
                ` : ''}
                ${appointment.patient_condition ? `
                    <div class="detail-row">
                        <strong>Condition:</strong> ${appointment.patient_condition}
                    </div>
                ` : ''}
            </div>
        `;

        this.showModal('Appointment Details', details);
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
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 15000);
    }

    // Notification Methods
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
}

// Global Action Functions
function exportAppointments() {
    appointmentsManager.showNotification('Export functionality coming soon!', 'info');
}

function refreshAppointments() {
    appointmentsManager.loadAppointments();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('service-filter').value = '';
    document.getElementById('date-filter').value = '';
    appointmentsManager.filterAppointments();
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

// Initialize Appointments Manager
let appointmentsManager;
document.addEventListener('DOMContentLoaded', function() {
    appointmentsManager = new AdminAppointmentsManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAppointmentsManager;
}

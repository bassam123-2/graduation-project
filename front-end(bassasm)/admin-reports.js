// Admin Reports & Analytics JavaScript
// Comprehensive functionality for AL-BOQAI Center Analytics

class AdminReportsManager {
    constructor() {
        this.apiBaseUrl = CONFIG.API.BASE_URL;
        this.currentUser = null;
        this.charts = {};
        this.data = {
            appointments: [],
            users: [],
            testimonials: []
        };
        this.init();
    }

    async init() {
        try {
            await this.checkAdminAuthentication();
            this.setupDateRange();
            await this.loadAnalyticsData();
            this.setupEventListeners();
            this.initializeCharts();
        } catch (error) {
            console.error('Admin reports manager initialization error:', error);
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

    // Setup Methods
    setupDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        document.getElementById('start-date').value = thirtyDaysAgo.toISOString().split('T')[0];
        document.getElementById('end-date').value = today.toISOString().split('T')[0];
    }

    // Data Loading Methods
    async loadAnalyticsData() {
        try {
            await Promise.all([
                this.loadAppointments(),
                this.loadUsers(),
                this.loadTestimonials()
            ]);
            
            this.updateMetrics();
            this.updateCharts();
            this.renderTopServices();
            this.renderRecentActivity();
            this.hideLoadingStates();
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showError('Failed to load analytics data');
        }
    }

    async loadAppointments() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.data.appointments = await response.json();
            } else {
                throw new Error('Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.data.users = await response.json();
            } else {
                throw new Error('Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadTestimonials() {
        try {
            // Testimonials endpoint allows anonymous access, so we don't need auth headers
            const response = await fetch(`${this.apiBaseUrl}/testimonials/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.data.testimonials = await response.json();
            } else {
                throw new Error('Failed to load testimonials');
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
        }
    }

    // Metrics Update Methods
    updateMetrics() {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        // Filter data by date range
        const filteredAppointments = this.data.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= startDate && aptDate <= endDate;
        });

        const filteredUsers = this.data.users.filter(user => {
            const userDate = new Date(user.date_joined);
            return userDate >= startDate && userDate <= endDate;
        });

        const filteredTestimonials = this.data.testimonials.filter(testimonial => {
            const testimonialDate = new Date(testimonial.created_at);
            return testimonialDate >= startDate && testimonialDate <= endDate;
        });

        // Update metric displays
        document.getElementById('total-appointments-metric').textContent = filteredAppointments.length;
        document.getElementById('total-users-metric').textContent = filteredUsers.length;
        
        // Calculate average rating
        if (filteredTestimonials.length > 0) {
            const totalRating = filteredTestimonials.reduce((sum, t) => sum + t.rating, 0);
            const avgRating = (totalRating / filteredTestimonials.length).toFixed(1);
            document.getElementById('avg-rating-metric').textContent = avgRating;
        } else {
            document.getElementById('avg-rating-metric').textContent = '0.0';
        }

        // Calculate revenue (mock calculation)
        const revenue = filteredAppointments.length * 50; // Assuming $50 per appointment
        document.getElementById('revenue-metric').textContent = `$${revenue}`;
    }

    // Chart Initialization and Updates
    initializeCharts() {
        this.initializeAppointmentTrendsChart();
        this.initializeServiceDistributionChart();
        this.initializeUserGrowthChart();
    }

    initializeAppointmentTrendsChart() {
        const ctx = document.getElementById('appointmentTrendsChart').getContext('2d');
        this.charts.appointmentTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Appointments',
                    data: [],
                    borderColor: '#2a5d9f',
                    backgroundColor: 'rgba(42, 93, 159, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    initializeServiceDistributionChart() {
        const ctx = document.getElementById('serviceDistributionChart').getContext('2d');
        this.charts.serviceDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#2a5d9f',
                        '#4CAF50',
                        '#FF9800',
                        '#9C27B0',
                        '#F44336',
                        '#00BCD4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initializeUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart').getContext('2d');
        this.charts.userGrowth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'New Users',
                    data: [],
                    backgroundColor: '#4CAF50',
                    borderColor: '#4CAF50',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateAppointmentTrendsChart();
        this.updateServiceDistributionChart();
        this.updateUserGrowthChart();
    }

    updateAppointmentTrendsChart() {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        // Generate date labels for the last 30 days
        const labels = [];
        const data = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels.push(dateStr);
            
            const appointmentsOnDate = this.data.appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate.toDateString() === currentDate.toDateString();
            }).length;
            
            data.push(appointmentsOnDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        this.charts.appointmentTrends.data.labels = labels;
        this.charts.appointmentTrends.data.datasets[0].data = data;
        this.charts.appointmentTrends.update();
    }

    updateServiceDistributionChart() {
        const serviceCounts = {};
        
        this.data.appointments.forEach(apt => {
            const service = apt.service_type || 'unknown';
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        const labels = Object.keys(serviceCounts).map(service => this.formatServiceType(service));
        const data = Object.values(serviceCounts);

        this.charts.serviceDistribution.data.labels = labels;
        this.charts.serviceDistribution.data.datasets[0].data = data;
        this.charts.serviceDistribution.update();
    }

    updateUserGrowthChart() {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        // Generate weekly labels
        const labels = [];
        const data = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            labels.push(weekLabel);
            
            const usersInWeek = this.data.users.filter(user => {
                const userDate = new Date(user.date_joined);
                return userDate >= weekStart && userDate <= weekEnd;
            }).length;
            
            data.push(usersInWeek);
            currentDate.setDate(currentDate.getDate() + 7);
        }

        this.charts.userGrowth.data.labels = labels;
        this.charts.userGrowth.data.datasets[0].data = data;
        this.charts.userGrowth.update();
    }

    // Rendering Methods
    renderTopServices() {
        const servicesList = document.getElementById('top-services-list');
        
        if (this.data.appointments.length === 0) {
            servicesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-stethoscope"></i>
                    <p>No services data available</p>
                </div>
            `;
            return;
        }

        // Count service occurrences
        const serviceCounts = {};
        this.data.appointments.forEach(apt => {
            const service = apt.service_type || 'unknown';
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        // Sort by count and take top 5
        const topServices = Object.entries(serviceCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        servicesList.innerHTML = topServices.map(([service, count], index) => {
            const serviceName = this.formatServiceType(service);
            const percentage = ((count / this.data.appointments.length) * 100).toFixed(1);
            
            return `
                <div class="service-item">
                    <div class="service-rank">#${index + 1}</div>
                    <div class="service-info">
                        <span class="service-name">${serviceName}</span>
                        <span class="service-count">${count} appointments</span>
                    </div>
                    <div class="service-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');
    }

    renderRecentActivity() {
        const activityList = document.getElementById('recent-activity-list');
        
        if (this.data.appointments.length === 0 && this.data.users.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        // Combine and sort recent activities
        const activities = [];
        
        // Add recent appointments
        this.data.appointments.slice(0, 10).forEach(apt => {
            activities.push({
                type: 'appointment',
                date: new Date(apt.date),
                text: `New appointment scheduled for ${apt.user ? `${apt.user.first_name} ${apt.user.last_name}` : 'Anonymous'}`,
                icon: 'fas fa-calendar-plus'
            });
        });

        // Add recent user registrations
        this.data.users.slice(0, 10).forEach(user => {
            activities.push({
                type: 'user',
                date: new Date(user.date_joined),
                text: `New user registered: ${user.first_name} ${user.last_name}`,
                icon: 'fas fa-user-plus'
            });
        });

        // Sort by date and take top 10
        activities.sort((a, b) => b.date - a.date);
        const recentActivities = activities.slice(0, 10);

        activityList.innerHTML = recentActivities.map(activity => {
            const timeAgo = this.getTimeAgo(activity.date);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <span class="activity-text">${activity.text}</span>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    hideLoadingStates() {
        const loadingElements = document.querySelectorAll('.loading-state');
        loadingElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Utility Methods
    formatServiceType(serviceType) {
        const serviceTypes = {
            'manual-therapy': 'Manual Therapy',
            'physical-therapy': 'Physical Therapy',
            'rehabilitation': 'Rehabilitation',
            'consultation': 'Consultation',
            'follow-up': 'Follow-up',
            'assessment': 'Assessment',
            'unknown': 'Unknown'
        };
        return serviceTypes[serviceType] || serviceType;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    }

    getAuthHeaders() {
        const sessionId = localStorage.getItem('sessionId');
        return {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };
    }

    showError(message) {
        this.showNotification(message, 'error');
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
function generateReport() {
    adminReportsManager.showNotification('Report generation coming soon!', 'info');
}

function refreshData() {
    adminReportsManager.loadAnalyticsData();
}

function updateCharts() {
    adminReportsManager.updateMetrics();
    adminReportsManager.updateCharts();
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

// Initialize Admin Reports Manager
let adminReportsManager;
document.addEventListener('DOMContentLoaded', function() {
    adminReportsManager = new AdminReportsManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminReportsManager;
}

// Treatment Plan Creation Form JavaScript
class TreatmentPlanCreator {
    constructor() {
        this.exerciseCounter = 0;
        this.patients = [];
        this.appointments = [];
        this.init();
    }

    async init() {
        try {
            // Show backend status indicator
            this.showBackendStatus();
            
            await this.checkAuthentication();
            await this.loadPatients();
            await this.loadAppointments();
            this.setupEventListeners();
            this.addDefaultExercise();
            
            // Check for pending treatment plan from booking flow
            this.checkPendingTreatmentPlan();
        } catch (error) {
            console.error('Error initializing treatment plan creator:', error);
            this.showMessage('Error initializing form. Please refresh the page.', 'error');
        }
    }

    showBackendStatus() {
        const statusDiv = document.getElementById('backendStatus');
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        
        if (!statusDiv || !statusIcon || !statusText) return;
        
        statusDiv.style.display = 'block';
        statusText.textContent = 'Checking backend connection...';
        statusIcon.className = 'fas fa-circle';
        statusIcon.style.color = '#ffc107';
        
        // Check backend connection
        this.checkBackendConnection();
    }

    async checkBackendConnection() {
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        
        if (!statusIcon || !statusText) return;
        
        try {
            const isAccessible = await this.isBackendAccessible();
            
            if (isAccessible) {
                statusIcon.style.color = '#28a745';
                statusText.textContent = 'Backend connected ✓';
                statusIcon.className = 'fas fa-circle';
            } else {
                statusIcon.style.color = '#dc3545';
                statusText.textContent = 'Backend disconnected ✗';
                statusIcon.className = 'fas fa-circle';
            }
        } catch (error) {
            statusIcon.style.color = '#dc3545';
            statusText.textContent = 'Connection error ✗';
            statusIcon.className = 'fas fa-circle';
        }
    }

    // Check for pending treatment plan from booking flow
    checkPendingTreatmentPlan() {
        try {
            // Check URL parameters for appointment ID
            const urlParams = new URLSearchParams(window.location.search);
            const appointmentId = urlParams.get('appointment');
            
            // Check localStorage for pending treatment plan
            const pendingAppointment = localStorage.getItem('pendingTreatmentPlanAppointment');
            
            if (appointmentId || pendingAppointment) {
                const targetAppointmentId = appointmentId || pendingAppointment;
                
                // Show notification about pre-filled appointment
                this.showMessage(`Treatment plan will be created for appointment #${targetAppointmentId}`, 'info');
                
                // Pre-select the appointment in the dropdown
                this.preSelectAppointment(targetAppointmentId);
                
                // Clear the pending appointment from localStorage
                if (pendingAppointment) {
                    localStorage.removeItem('pendingTreatmentPlanAppointment');
                }
                
                // Update URL to remove the appointment parameter
                if (appointmentId) {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                }
            }
        } catch (error) {
            console.error('Error checking pending treatment plan:', error);
        }
    }

    // Pre-select appointment in the dropdown
    preSelectAppointment(appointmentId) {
        try {
            // Wait for appointments to be loaded
            setTimeout(() => {
                const appointmentSelect = document.getElementById('appointmentSelect');
                if (appointmentSelect) {
                    // Find the appointment option
                    for (let option of appointmentSelect.options) {
                        if (option.value === appointmentId) {
                            appointmentSelect.value = appointmentId;
                            appointmentSelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                }
            }, 1000); // Wait for appointments to load
        } catch (error) {
            console.error('Error pre-selecting appointment:', error);
        }
    }

    async checkAuthentication() {
        const userId = localStorage.getItem('userId');
        const sessionId = localStorage.getItem('sessionId');
        
        if (!userId || !sessionId) {
            this.showMessage('Please sign in to create treatment plans.', 'warning');
            // Redirect to login after a delay
            setTimeout(() => {
                window.location.href = '../book appointment/sign in.html';
            }, 3000);
            return;
        }

        // Check if user is a therapist
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/users/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.role !== 'therapist') {
                    this.showMessage('Only therapists can create treatment plans.', 'error');
                    setTimeout(() => {
                        window.location.href = '../home.html';
                    }, 3000);
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking user role:', error);
        }
    }

    async loadPatients() {
        try {
            const sessionId = localStorage.getItem('sessionId');
            const response = await fetch(`${CONFIG.API.BASE_URL}/users/?role=patient`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.patients = Array.isArray(data) ? data : (data.results || []);
                this.populatePatientDropdown();
            } else {
                console.error('Failed to load patients:', response.status);
                this.showMessage('Failed to load patients. Please try again later.', 'warning');
                this.loadDemoPatients();
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            this.loadDemoPatients();
        }
    }

    async loadAppointments() {
        try {
            const sessionId = localStorage.getItem('sessionId');
            const response = await fetch(`${CONFIG.API.BASE_URL}/appointments/`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.appointments = Array.isArray(data) ? data : (data.results || []);
                this.populateAppointmentDropdown();
            } else {
                console.error('Failed to load appointments:', response.status);
                this.showMessage('Failed to load appointments. Please try again later.', 'warning');
                this.loadDemoAppointments();
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.loadDemoAppointments();
        }

    }

    loadDemoPatients() {
        this.patients = [
            { id: 1, first_name: 'John', last_name: 'Doe', username: 'johndoe' },
            { id: 2, first_name: 'Jane', last_name: 'Smith', username: 'janesmith' },
            { id: 3, first_name: 'Mike', last_name: 'Johnson', username: 'mikejohnson' }
        ];
        this.populatePatientDropdown();
    }

    loadDemoAppointments() {
        this.appointments = [
            { id: 1, date: '2025-01-15', time: '10:00:00', service_type: 'manual-therapy', user: { first_name: 'John', last_name: 'Doe' } },
            { id: 2, date: '2025-01-16', time: '14:00:00', service_type: 'physical-therapy', user: { first_name: 'Jane', last_name: 'Smith' } },
            { id: 3, date: '2025-01-17', time: '11:00:00', service_type: 'body-engineering', user: { first_name: 'Mike', last_name: 'Johnson' } }
        ];
        this.populateAppointmentDropdown();
    }

    populatePatientDropdown() {
        const patientSelect = document.getElementById('patientSelect');
        if (!patientSelect) return;

        patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.first_name} ${patient.last_name} (${patient.email})`;
            patientSelect.appendChild(option);
        });
    }

    populateAppointmentDropdown() {
        const appointmentSelect = document.getElementById('appointmentSelect');
        if (!appointmentSelect) return;

        appointmentSelect.innerHTML = '<option value="">Choose an appointment...</option>';
        this.appointments.forEach(appointment => {
            const option = document.createElement('option');
            option.value = appointment.id;
            const date = new Date(appointment.date).toLocaleDateString();
            const time = appointment.time ? appointment.time.substring(0, 5) : '';
            const serviceType = appointment.service_type ? appointment.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
            option.textContent = `${date} ${time} - ${serviceType} (${appointment.user?.first_name} ${appointment.user?.last_name})`;
            appointmentSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('treatmentPlanForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Add exercise button
        const addExerciseBtn = document.getElementById('addExerciseBtn');
        if (addExerciseBtn) {
            addExerciseBtn.addEventListener('click', () => this.addExercise());
        }

        // Save draft button
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Patient selection change
        const patientSelect = document.getElementById('patientSelect');
        if (patientSelect) {
            patientSelect.addEventListener('change', () => this.onPatientChange());
        }
    }

    addExercise() {
        this.exerciseCounter++;
        const exercisesContainer = document.getElementById('exercisesContainer');
        if (!exercisesContainer) return;

        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.dataset.exerciseId = this.exerciseCounter;
        exerciseItem.innerHTML = `
            <h4>
                Exercise ${this.exerciseCounter}
                <button type="button" class="remove-exercise" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </h4>
            <div class="exercise-fields">
                <div class="form-group">
                    <label for="exerciseName${this.exerciseCounter}">Exercise Name *</label>
                    <input type="text" id="exerciseName${this.exerciseCounter}" name="exercise_name_${this.exerciseCounter}" placeholder="e.g., Stretching, Strengthening..." required>
                </div>
                <div class="form-group">
                    <label for="exerciseSets${this.exerciseCounter}">Sets</label>
                    <input type="number" id="exerciseSets${this.exerciseCounter}" name="exercise_sets_${this.exerciseCounter}" min="1" max="10" value="3">
                </div>
                <div class="form-group">
                    <label for="exerciseReps${this.exerciseCounter}">Repetitions</label>
                    <input type="number" id="exerciseReps${this.exerciseCounter}" name="exercise_reps_${this.exerciseCounter}" min="1" max="50" value="10">
                </div>
                <div class="form-group">
                    <label for="exerciseDuration${this.exerciseCounter}">Duration</label>
                    <input type="text" id="exerciseDuration${this.exerciseCounter}" name="exercise_duration_${this.exerciseCounter}" placeholder="e.g., 5 minutes">
                </div>
                <div class="form-group">
                    <label for="exerciseInstructions${this.exerciseCounter}">Instructions</label>
                    <textarea id="exerciseInstructions${this.exerciseCounter}" name="exercise_instructions_${this.exerciseCounter}" rows="2" placeholder="Detailed instructions for this exercise..."></textarea>
                </div>
                <div class="form-group">
                    <label for="exerciseFrequency${this.exerciseCounter}">Frequency</label>
                    <select id="exerciseFrequency${this.exerciseCounter}" name="exercise_frequency_${this.exerciseCounter}">
                        <option value="daily">Daily</option>
                        <option value="twice-daily">Twice Daily</option>
                        <option value="every-other-day">Every Other Day</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
            </div>
        `;

        exercisesContainer.appendChild(exerciseItem);
    }

    addDefaultExercise() {
        this.addExercise();
    }

    onPatientChange() {
        const patientSelect = document.getElementById('patientSelect');
        const appointmentSelect = document.getElementById('appointmentSelect');
        
        if (!patientSelect || !appointmentSelect) return;

        const selectedPatientId = patientSelect.value;
        if (!selectedPatientId) {
            appointmentSelect.innerHTML = '<option value="">Choose an appointment...</option>';
            return;
        }

        // Filter appointments for selected patient
        const patientAppointments = this.appointments.filter(apt => apt.user?.id == selectedPatientId);
        
        appointmentSelect.innerHTML = '<option value="">Choose an appointment...</option>';
        patientAppointments.forEach(appointment => {
            const option = document.createElement('option');
            option.value = appointment.id;
            const date = new Date(appointment.date).toLocaleDateString();
            const time = appointment.time ? appointment.time.substring(0, 5) : '';
            const serviceType = appointment.service_type ? appointment.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
            option.textContent = `${date} ${time} - ${serviceType}`;
            appointmentSelect.appendChild(option);
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = document.getElementById('submitPlanBtn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Plan...';

        try {
            const formData = this.collectFormData();
            await this.submitTreatmentPlan(formData);
            this.showSuccessModal(formData);
        } catch (error) {
            console.error('Error creating treatment plan:', error);
            this.showMessage('Failed to create treatment plan. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    validateForm() {
        const requiredFields = ['patientSelect', 'appointmentSelect', 'planDetails'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showMessage(`Please fill in all required fields.`, 'error');
                isValid = false;
                return;
            }
        });

        // Check if at least one exercise is added
        const exercises = document.querySelectorAll('.exercise-item');
        if (exercises.length === 0) {
            this.showMessage('Please add at least one exercise to the treatment plan.', 'error');
            isValid = false;
        }

        return isValid;
    }

    collectFormData() {
        const exercises = [];
        const exerciseItems = document.querySelectorAll('.exercise-item');
        
        exerciseItems.forEach((item) => {
            const exerciseId = item.dataset.exerciseId;
            if (!exerciseId) return;
            
            const exercise = {
                name: item.querySelector(`#exerciseName${exerciseId}`)?.value || '',
                sets: parseInt(item.querySelector(`#exerciseSets${exerciseId}`)?.value) || 0,
                reps: parseInt(item.querySelector(`#exerciseReps${exerciseId}`)?.value) || 0,
                duration: item.querySelector(`#exerciseDuration${exerciseId}`)?.value || '',
                instructions: item.querySelector(`#exerciseInstructions${exerciseId}`)?.value || '',
                frequency: item.querySelector(`#exerciseFrequency${exerciseId}`)?.value || 'daily'
            };
            
            // Only add if exercise name is provided
            if (exercise.name.trim()) {
                exercises.push(exercise);
            }
        });

        return {
            appointment: parseInt(document.getElementById('appointmentSelect').value),
            plan_details: document.getElementById('planDetails').value,
            exercises: exercises,
            duration_weeks: parseInt(document.getElementById('durationWeeks').value),
            total_sessions: parseInt(document.getElementById('totalSessions').value),
            additional_notes: document.getElementById('additionalNotes').value || ''
        };
    }

    async submitTreatmentPlan(formData) {
        const sessionId = localStorage.getItem('sessionId');
        
        // First check if backend is accessible
        if (!await this.isBackendAccessible()) {
            throw new Error('Backend server is not accessible. Please check if the Django server is running on port 8080.');
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/treatment-plans/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to the backend server. Please check your internet connection and ensure the Django server is running.');
            }
            throw error;
        }
    }

    async isBackendAccessible() {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/health/`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.warn('Backend health check failed:', error);
            return false;
        }
    }

    showSuccessModal(formData) {
        const modal = document.getElementById('successModal');
        const planSummary = document.getElementById('planSummary');
        
        if (!modal || !planSummary) return;

        // Populate plan summary
        planSummary.innerHTML = `
            <div class="plan-summary-item">
                <span class="plan-summary-label">Patient:</span>
                <span class="plan-summary-value">${this.getPatientName(formData.appointment)}</span>
            </div>
            <div class="plan-summary-item">
                <span class="plan-summary-label">Duration:</span>
                <span class="plan-summary-value">${formData.duration_weeks} weeks</span>
            </div>
            <div class="plan-summary-item">
                <span class="plan-summary-label">Total Sessions:</span>
                <span class="plan-summary-value">${formData.total_sessions}</span>
            </div>
            <div class="plan-summary-item">
                <span class="plan-summary-label">Exercises:</span>
                <span class="plan-summary-value">${formData.exercises.length}</span>
            </div>
        `;

        modal.style.display = 'block';
    }

    getPatientName(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id == appointmentId);
        if (appointment && appointment.user) {
            return `${appointment.user.first_name} ${appointment.user.last_name}`;
        }
        return 'Unknown Patient';
    }

    async saveDraft() {
        try {
            const formData = this.collectFormData();
            formData.status = 'draft';
            
            // Save to localStorage as draft
            const drafts = JSON.parse(localStorage.getItem('treatmentPlanDrafts') || '[]');
            drafts.push({
                ...formData,
                id: Date.now(),
                created_at: new Date().toISOString()
            });
            localStorage.setItem('treatmentPlanDrafts', JSON.stringify(drafts));
            
            this.showMessage('Draft saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showMessage('Failed to save draft.', 'error');
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${this.getMessageIcon(type)}"></i>
            <span>${message}</span>
        `;

        const form = document.getElementById('treatmentPlanForm');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }

    getMessageIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Global functions for modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function viewAllPlans() {
    // Navigate to treatment plans list page
    window.location.href = 'view-treatment-plans.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new TreatmentPlanCreator();
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


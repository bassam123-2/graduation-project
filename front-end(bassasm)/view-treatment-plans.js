// Treatment Plans View Page JavaScript
class TreatmentPlansViewer {
    constructor() {
        this.treatmentPlans = [];
        this.currentPlan = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuthentication();
            await this.loadTreatmentPlans();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing treatment plans viewer:', error);
            this.showNoPlansState();
        }
    }

    async checkAuthentication() {
        const userId = localStorage.getItem('userId');
        const sessionId = localStorage.getItem('sessionId');
        
        if (!userId || !sessionId) {
            this.showMessage('Please sign in to view your treatment plans.', 'warning');
            setTimeout(() => {
                window.location.href = '../book appointment/sign in.html';
            }, 3000);
            return;
        }
    }

    async loadTreatmentPlans() {
        try {
            // First check if backend is accessible
            if (!await this.isBackendAccessible()) {
                console.warn('Backend not accessible, loading demo plans');
                this.loadDemoPlans();
                return;
            }

            const sessionId = localStorage.getItem('sessionId');
            const userId = localStorage.getItem('userId');
            
            const response = await fetch(`${CONFIG.API.BASE_URL}/treatment-plans/?appointment__user=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.treatmentPlans = Array.isArray(data) ? data : (data.results || []);
                this.displayTreatmentPlans();
            } else {
                console.error('Failed to load treatment plans:', response.status);
                this.loadDemoPlans();
            }
        } catch (error) {
            console.error('Error loading treatment plans:', error);
            this.loadDemoPlans();
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

    loadDemoPlans() {
        // Load demo plans from localStorage if available
        const drafts = JSON.parse(localStorage.getItem('treatmentPlanDrafts') || '[]');
        if (drafts.length > 0) {
            this.treatmentPlans = drafts.map(draft => ({
                ...draft,
                id: draft.id,
                created_at: draft.created_at,
                progress_percentage: Math.floor(Math.random() * 100),
                completed_sessions: Math.floor(Math.random() * draft.total_sessions),
                status: 'active'
            }));
            this.displayTreatmentPlans();
        } else {
            this.showNoPlansState();
        }
    }

    displayTreatmentPlans() {
        const loadingState = document.getElementById('loadingState');
        const noPlansState = document.getElementById('noPlansState');
        const plansContainer = document.getElementById('plansContainer');

        if (!loadingState || !noPlansState || !plansContainer) return;

        // Hide loading state
        loadingState.style.display = 'none';

        if (this.treatmentPlans.length === 0) {
            this.showNoPlansState();
            return;
        }

        // Show plans container
        noPlansState.style.display = 'none';
        plansContainer.style.display = 'block';

        // Clear existing content
        plansContainer.innerHTML = '';

        // Render each treatment plan
        this.treatmentPlans.forEach(plan => {
            const planCard = this.createPlanCard(plan);
            plansContainer.appendChild(planCard);
        });
    }

    createPlanCard(plan) {
        const planCard = document.createElement('div');
        planCard.className = 'plan-card';
        
        const status = this.getPlanStatus(plan);
        const progressPercentage = plan.progress_percentage || 0;
        const completedSessions = plan.completed_sessions || 0;
        const totalSessions = plan.total_sessions || 1;

        planCard.innerHTML = `
            <div class="plan-header">
                <h3>
                    <i class="fas fa-clipboard-list"></i>
                    Treatment Plan #${plan.id}
                </h3>
                <span class="plan-status ${status}">${status}</span>
            </div>
            <div class="plan-body">
                <div class="plan-info">
                    <div class="plan-info-item">
                        <span class="plan-info-label">Created</span>
                        <span class="plan-info-value">${this.formatDate(plan.created_at)}</span>
                    </div>
                    <div class="plan-info-item">
                        <span class="plan-info-label">Duration</span>
                        <span class="plan-info-value">${plan.duration_weeks} weeks</span>
                    </div>
                    <div class="plan-info-item">
                        <span class="plan-info-label">Total Sessions</span>
                        <span class="plan-info-value">${totalSessions}</span>
                    </div>
                    <div class="plan-info-item">
                        <span class="plan-info-label">Completed</span>
                        <span class="plan-info-value">${completedSessions}</span>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-header">
                        <span class="progress-title">Progress</span>
                        <span class="progress-percentage">${progressPercentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-stats">
                        <span>${completedSessions} of ${totalSessions} sessions completed</span>
                        <span>${plan.duration_weeks} weeks duration</span>
                    </div>
                </div>

                <div class="exercises-preview">
                    <h4>
                        <i class="fas fa-dumbbell"></i>
                        Exercises (${plan.exercises ? plan.exercises.length : 0})
                    </h4>
                    <div class="exercises-list">
                        ${this.renderExercisesPreview(plan.exercises)}
                    </div>
                </div>

                <div class="plan-actions">
                    <button onclick="treatmentPlansViewer.viewPlanDetails(${plan.id})" class="btn-primary btn-small">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button onclick="treatmentPlansViewer.updateProgress(${plan.id})" class="btn-secondary btn-small">
                        <i class="fas fa-chart-line"></i> Update Progress
                    </button>
                </div>
            </div>
        `;

        return planCard;
    }

    renderExercisesPreview(exercises) {
        if (!exercises || exercises.length === 0) {
            return '<p style="color: var(--light-text); font-style: italic;">No exercises assigned yet.</p>';
        }

        // Show first 3 exercises as preview
        const previewExercises = exercises.slice(0, 3);
        let exercisesHtml = '';

        previewExercises.forEach(exercise => {
            exercisesHtml += `
                <div class="exercise-item">
                    <div class="exercise-name">${exercise.name || 'Unnamed Exercise'}</div>
                    <div class="exercise-details">
                        ${exercise.sets ? exercise.sets + ' sets' : ''} 
                        ${exercise.reps ? exercise.reps + ' reps' : ''} 
                        ${exercise.duration ? exercise.duration : ''}
                    </div>
                </div>
            `;
        });

        if (exercises.length > 3) {
            exercisesHtml += `
                <div class="exercise-item" style="text-align: center; color: var(--light-text); font-style: italic;">
                    +${exercises.length - 3} more exercises
                </div>
            `;
        }

        return exercisesHtml;
    }

    getPlanStatus(plan) {
        if (plan.progress_percentage >= 100) return 'completed';
        if (plan.progress_percentage > 0) return 'active';
        return 'draft';
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    async viewPlanDetails(planId) {
        const plan = this.treatmentPlans.find(p => p.id == planId);
        if (!plan) return;

        this.currentPlan = plan;
        this.showPlanDetailsModal(plan);
    }

    showPlanDetailsModal(plan) {
        const modal = document.getElementById('planDetailsModal');
        const content = document.getElementById('planDetailsContent');
        
        if (!modal || !content) return;

        content.innerHTML = this.renderPlanDetails(plan);
        modal.style.display = 'block';
    }

    renderPlanDetails(plan) {
        const exercises = plan.exercises || [];
        const progressPercentage = plan.progress_percentage || 0;
        const completedSessions = plan.completed_sessions || 0;
        const totalSessions = plan.total_sessions || 1;

        return `
            <div class="plan-details-content">
                <div class="plan-details-section">
                    <h4><i class="fas fa-file-medical"></i> Plan Overview</h4>
                    <p><strong>Description:</strong> ${plan.plan_details || 'No description provided.'}</p>
                    <p><strong>Duration:</strong> ${plan.duration_weeks} weeks</p>
                    <p><strong>Total Sessions:</strong> ${totalSessions}</p>
                    <p><strong>Completed Sessions:</strong> ${completedSessions}</p>
                    <p><strong>Progress:</strong> ${progressPercentage}%</p>
                    ${plan.additional_notes ? `<p><strong>Additional Notes:</strong> ${plan.additional_notes}</p>` : ''}
                </div>

                <div class="plan-details-section">
                    <h4><i class="fas fa-dumbbell"></i> Exercises & Activities</h4>
                    ${this.renderExercisesDetails(exercises)}
                </div>

                <div class="plan-details-section">
                    <h4><i class="fas fa-chart-line"></i> Progress Tracking</h4>
                    <div class="progress-bar" style="margin-bottom: 15px;">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <p><strong>Current Status:</strong> ${this.getPlanStatus(plan).toUpperCase()}</p>
                    <p><strong>Next Session:</strong> ${this.getNextSessionDate(plan)}</p>
                </div>
            </div>
        `;
    }

    renderExercisesDetails(exercises) {
        if (!exercises || exercises.length === 0) {
            return '<p style="color: var(--light-text); font-style: italic;">No exercises assigned yet.</p>';
        }

        let exercisesHtml = '<div class="exercises-grid">';
        
        exercises.forEach((exercise, index) => {
            exercisesHtml += `
                <div class="exercise-detail-item">
                    <div class="exercise-detail-header">
                        <span class="exercise-detail-name">${exercise.name || 'Unnamed Exercise'}</span>
                        <div class="exercise-detail-stats">
                            ${exercise.sets ? `<span>${exercise.sets} sets</span>` : ''}
                            ${exercise.reps ? `<span>${exercise.reps} reps</span>` : ''}
                            ${exercise.frequency ? `<span>${exercise.frequency}</span>` : ''}
                        </div>
                    </div>
                    ${exercise.duration ? `<p><strong>Duration:</strong> ${exercise.duration}</p>` : ''}
                    ${exercise.instructions ? `<p><strong>Instructions:</strong> ${exercise.instructions}</p>` : ''}
                </div>
            `;
        });

        exercisesHtml += '</div>';
        return exercisesHtml;
    }

    getNextSessionDate(plan) {
        if (!plan.created_at) return 'To be determined';
        
        const createdDate = new Date(plan.created_at);
        const weeksElapsed = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        if (weeksElapsed >= plan.duration_weeks) {
            return 'Treatment plan completed';
        }
        
        const nextSessionDate = new Date(createdDate);
        nextSessionDate.setDate(createdDate.getDate() + (weeksElapsed + 1) * 7);
        
        return nextSessionDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    async updateProgress(planId) {
        const plan = this.treatmentPlans.find(p => p.id == planId);
        if (!plan) return;

        this.currentPlan = plan;
        this.showProgressModal(plan);
    }

    showProgressModal(plan) {
        const modal = document.getElementById('progressModal');
        const completedSessionsInput = document.getElementById('completedSessions');
        
        if (!modal || !completedSessionsInput) return;

        // Set current value
        completedSessionsInput.value = plan.completed_sessions || 0;
        completedSessionsInput.max = plan.total_sessions;

        modal.style.display = 'block';
    }

    async submitProgressUpdate() {
        if (!this.currentPlan) return;

        const completedSessions = parseInt(document.getElementById('completedSessions').value);
        const progressNotes = document.getElementById('progressNotes').value;

        if (completedSessions < 0 || completedSessions > this.currentPlan.total_sessions) {
            this.showMessage('Invalid number of completed sessions.', 'error');
            return;
        }

        try {
            // Update local data
            this.currentPlan.completed_sessions = completedSessions;
            this.currentPlan.progress_percentage = Math.round((completedSessions / this.currentPlan.total_sessions) * 100);

            // Update display
            this.displayTreatmentPlans();

            // Close modal
            this.closeProgressModal();

            // Show success message
            this.showMessage('Progress updated successfully!', 'success');

            // Save to localStorage for demo purposes
            if (this.currentPlan.id.toString().length > 10) { // Demo plan
                const drafts = JSON.parse(localStorage.getItem('treatmentPlanDrafts') || '[]');
                const draftIndex = drafts.findIndex(d => d.id == this.currentPlan.id);
                if (draftIndex !== -1) {
                    drafts[draftIndex] = { ...this.currentPlan };
                    localStorage.setItem('treatmentPlanDrafts', JSON.stringify(drafts));
                }
            }

        } catch (error) {
            console.error('Error updating progress:', error);
            this.showMessage('Failed to update progress. Please try again.', 'error');
        }
    }

    closeProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showNoPlansState() {
        const loadingState = document.getElementById('loadingState');
        const noPlansState = document.getElementById('noPlansState');
        const plansContainer = document.getElementById('plansContainer');

        if (loadingState) loadingState.style.display = 'none';
        if (plansContainer) plansContainer.style.display = 'none';
        if (noPlansState) noPlansState.style.display = 'block';
    }

    showMessage(message, type = 'info') {
        // Create a temporary message display
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            max-width: 350px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                messageDiv.style.background = '#28a745';
                break;
            case 'error':
                messageDiv.style.background = '#dc3545';
                break;
            case 'warning':
                messageDiv.style.background = '#ffc107';
                messageDiv.style.color = '#333';
                break;
            default:
                messageDiv.style.background = '#17a2b8';
        }

        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }

    setupEventListeners() {
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            const planModal = document.getElementById('planDetailsModal');
            const progressModal = document.getElementById('progressModal');
            
            if (event.target === planModal) {
                planModal.style.display = 'none';
            }
            if (event.target === progressModal) {
                progressModal.style.display = 'none';
            }
        });
    }
}

// Global functions for modals
function closePlanModal() {
    const modal = document.getElementById('planDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeProgressModal() {
    const modal = document.getElementById('progressModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateProgress() {
    if (window.treatmentPlansViewer) {
        window.treatmentPlansViewer.submitProgressUpdate();
    }
}

function printPlan() {
    if (window.treatmentPlansViewer && window.treatmentPlansViewer.currentPlan) {
        const plan = window.treatmentPlansViewer.currentPlan;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Treatment Plan - ${plan.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        .exercise { margin-bottom: 15px; padding: 10px; border-left: 3px solid #2a5d9f; }
                        .progress-bar { width: 100%; height: 20px; background: #ddd; border-radius: 10px; overflow: hidden; }
                        .progress-fill { height: 100%; background: #28a745; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>AL-BOQAI Center Treatment Plan</h1>
                        <p>Plan ID: ${plan.id} | Created: ${new Date(plan.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Plan Overview</h2>
                        <p><strong>Description:</strong> ${plan.plan_details || 'No description provided.'}</p>
                        <p><strong>Duration:</strong> ${plan.duration_weeks} weeks</p>
                        <p><strong>Total Sessions:</strong> ${plan.total_sessions}</p>
                        <p><strong>Progress:</strong> ${plan.progress_percentage || 0}%</p>
                    </div>
                    
                    <div class="section">
                        <h2>Exercises</h2>
                        ${(plan.exercises || []).map(ex => `
                            <div class="exercise">
                                <h3>${ex.name || 'Unnamed Exercise'}</h3>
                                <p>Sets: ${ex.sets || 'N/A'} | Reps: ${ex.reps || 'N/A'} | Duration: ${ex.duration || 'N/A'}</p>
                                ${ex.instructions ? `<p><strong>Instructions:</strong> ${ex.instructions}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="section">
                        <h2>Progress Tracking</h2>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${plan.progress_percentage || 0}%"></div>
                        </div>
                        <p>${plan.completed_sessions || 0} of ${plan.total_sessions} sessions completed</p>
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.treatmentPlansViewer = new TreatmentPlansViewer();
});

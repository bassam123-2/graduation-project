// Gamification System for AL-BOQAI Center
// Advanced engagement and reward system

class GamificationSystem {
    constructor() {
        this.userProgress = this.loadUserProgress();
        this.achievements = this.initializeAchievements();
        this.challenges = this.initializeChallenges();
        this.rewards = this.initializeRewards();
        this.init();
    }

    init() {
        this.createGamificationUI();
        this.setupEventListeners();
        this.checkAchievements();
        this.startDailyChallenges();

    }

    loadUserProgress() {
        const saved = localStorage.getItem('alboqai_progress');
        return saved ? JSON.parse(saved) : {
            level: 1,
            experience: 0,
            totalSessions: 0,
            completedAssessments: 0,
            achievements: [],
            challenges: [],
            streak: 0,
            lastVisit: null,
            points: 0
        };
    }

    saveUserProgress() {
        localStorage.setItem('alboqai_progress', JSON.stringify(this.userProgress));
    }

    initializeAchievements() {
        return {
            first_visit: {
                id: 'first_visit',
                name: 'Welcome!',
                description: 'Complete your first visit to AL-BOQAI Center',
                icon: 'fas fa-star',
                points: 50,
                unlocked: false
            },
            assessment_master: {
                id: 'assessment_master',
                name: 'Assessment Master',
                description: 'Complete 5 AI assessments',
                icon: 'fas fa-brain',
                points: 100,
                unlocked: false
            },
            booking_expert: {
                id: 'booking_expert',
                name: 'Booking Expert',
                description: 'Book 3 appointments',
                icon: 'fas fa-calendar-check',
                points: 150,
                unlocked: false
            },
            streak_7: {
                id: 'streak_7',
                name: 'Week Warrior',
                description: 'Visit for 7 consecutive days',
                icon: 'fas fa-fire',
                points: 200,
                unlocked: false
            },
            therapy_complete: {
                id: 'therapy_complete',
                name: 'Therapy Champion',
                description: 'Complete a full therapy session',
                icon: 'fas fa-trophy',
                points: 300,
                unlocked: false
            },
            social_butterfly: {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Share your progress on social media',
                icon: 'fas fa-share-alt',
                points: 75,
                unlocked: false
            },
            explorer: {
                id: 'explorer',
                name: 'Explorer',
                description: 'Visit all sections of the website',
                icon: 'fas fa-compass',
                points: 125,
                unlocked: false
            },
            feedback_guru: {
                id: 'feedback_guru',
                name: 'Feedback Guru',
                description: 'Provide feedback on your experience',
                icon: 'fas fa-comment-dots',
                points: 80,
                unlocked: false
            }
        };
    }

    initializeChallenges() {
        return {
            daily_assessment: {
                id: 'daily_assessment',
                name: 'Daily Assessment',
                description: 'Complete an AI symptom assessment today',
                icon: 'fas fa-clipboard-check',
                points: 25,
                type: 'daily',
                completed: false
            },
            explore_services: {
                id: 'explore_services',
                name: 'Service Explorer',
                description: 'Learn about all our therapy services',
                icon: 'fas fa-search',
                points: 30,
                type: 'daily',
                completed: false
            },
            share_experience: {
                id: 'share_experience',
                name: 'Share Your Journey',
                description: 'Share your therapy experience',
                icon: 'fas fa-heart',
                points: 40,
                type: 'weekly',
                completed: false
            }
        };
    }

    initializeRewards() {
        return {
            discount_5: {
                id: 'discount_5',
                name: '5% Session Discount',
                description: 'Get 5% off your next therapy session',
                icon: 'fas fa-percentage',
                pointsRequired: 500,
                type: 'discount'
            },
            free_assessment: {
                id: 'free_assessment',
                name: 'Free AI Assessment',
                description: 'Unlock unlimited AI assessments',
                icon: 'fas fa-brain',
                pointsRequired: 300,
                type: 'service'
            },
            priority_booking: {
                id: 'priority_booking',
                name: 'Priority Booking',
                description: 'Get priority booking for appointments',
                icon: 'fas fa-clock',
                pointsRequired: 750,
                type: 'privilege'
            },
            consultation_discount: {
                id: 'consultation_discount',
                name: 'Free Consultation',
                description: 'Free initial consultation session',
                icon: 'fas fa-user-md',
                pointsRequired: 1000,
                type: 'service'
            }
        };
    }

    createGamificationUI() {
        const gamificationHTML = `
            <div id="gamification-panel" class="gamification-panel">
                <div class="gamification-header">
                    <div class="user-level">
                        <div class="level-circle">
                            <span id="user-level">${this.userProgress.level}</span>
                        </div>
                        <div class="level-info">
                            <h4>Level ${this.userProgress.level}</h4>
                            <div class="experience-bar">
                                <div class="experience-fill" id="experience-fill"></div>
                            </div>
                            <span id="experience-text">${this.userProgress.experience} / ${this.getNextLevelExp()} XP</span>
                        </div>
                    </div>
                    <div class="user-stats">
                        <div class="stat-item">
                            <i class="fas fa-coins"></i>
                            <span id="user-points">${this.userProgress.points}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-fire"></i>
                            <span id="user-streak">${this.userProgress.streak}</span>
                        </div>
                    </div>
                </div>
                
                <div class="gamification-tabs">
                    <button class="tab-btn active" data-tab="achievements">
                        <i class="fas fa-trophy"></i> Achievements
                    </button>
                    <button class="tab-btn" data-tab="challenges">
                        <i class="fas fa-target"></i> Challenges
                    </button>
                    <button class="tab-btn" data-tab="rewards">
                        <i class="fas fa-gift"></i> Rewards
                    </button>
                </div>
                
                <div class="gamification-content">
                    <div class="tab-content active" id="achievements-content">
                        <div class="achievements-grid" id="achievements-grid"></div>
                    </div>
                    
                    <div class="tab-content" id="challenges-content">
                        <div class="challenges-list" id="challenges-list"></div>
                    </div>
                    
                    <div class="tab-content" id="rewards-content">
                        <div class="rewards-grid" id="rewards-grid"></div>
                    </div>
                </div>
            </div>
            
            <div id="gamification-toggle" class="gamification-toggle">
                <i class="fas fa-gamepad"></i>
                <span class="notification-badge" id="notification-badge" style="display: none;">0</span>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gamificationHTML);
        this.updateGamificationUI();
    }

    setupEventListeners() {
        // Toggle gamification panel
        document.getElementById('gamification-toggle').addEventListener('click', () => {
            this.toggleGamificationPanel();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Track user actions
        this.trackUserActions();
    }

    toggleGamificationPanel() {
        const panel = document.getElementById('gamification-panel');
        panel.classList.toggle('active');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');
    }

    updateGamificationUI() {
        // Update level and experience
        document.getElementById('user-level').textContent = this.userProgress.level;
        document.getElementById('user-points').textContent = this.userProgress.points;
        document.getElementById('user-streak').textContent = this.userProgress.streak;
        
        const nextLevelExp = this.getNextLevelExp();
        const expPercentage = (this.userProgress.experience / nextLevelExp) * 100;
        document.getElementById('experience-fill').style.width = `${expPercentage}%`;
        document.getElementById('experience-text').textContent = `${this.userProgress.experience} / ${nextLevelExp} XP`;

        // Update achievements
        this.updateAchievementsDisplay();
        
        // Update challenges
        this.updateChallengesDisplay();
        
        // Update rewards
        this.updateRewardsDisplay();
    }

    updateAchievementsDisplay() {
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = Object.values(this.achievements).map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                 data-achievement="${achievement.id}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-points">+${achievement.points} points</span>
                </div>
                <div class="achievement-status">
                    <i class="fas ${achievement.unlocked ? 'fa-check-circle' : 'fa-lock'}"></i>
                </div>
            </div>
        `).join('');
    }

    updateChallengesDisplay() {
        const list = document.getElementById('challenges-list');
        list.innerHTML = Object.values(this.challenges).map(challenge => `
            <div class="challenge-item ${challenge.completed ? 'completed' : ''}" 
                 data-challenge="${challenge.id}">
                <div class="challenge-icon">
                    <i class="${challenge.icon}"></i>
                </div>
                <div class="challenge-info">
                    <h4>${challenge.name}</h4>
                    <p>${challenge.description}</p>
                    <span class="challenge-type">${challenge.type}</span>
                </div>
                <div class="challenge-reward">
                    <span>+${challenge.points} points</span>
                    <button class="claim-btn" ${challenge.completed ? 'disabled' : ''}>
                        ${challenge.completed ? 'Completed' : 'Claim'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateRewardsDisplay() {
        const grid = document.getElementById('rewards-grid');
        grid.innerHTML = Object.values(this.rewards).map(reward => {
            const canClaim = this.userProgress.points >= reward.pointsRequired;
            return `
                <div class="reward-item ${canClaim ? 'available' : 'locked'}" 
                     data-reward="${reward.id}">
                    <div class="reward-icon">
                        <i class="${reward.icon}"></i>
                    </div>
                    <div class="reward-info">
                        <h4>${reward.name}</h4>
                        <p>${reward.description}</p>
                        <span class="reward-cost">${reward.pointsRequired} points</span>
                    </div>
                    <div class="reward-action">
                        <button class="claim-reward-btn" ${canClaim ? '' : 'disabled'}>
                            ${canClaim ? 'Claim' : 'Not Enough Points'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addExperience(amount) {
        this.userProgress.experience += amount;
        this.userProgress.points += amount;
        
        // Check for level up
        const nextLevelExp = this.getNextLevelExp();
        if (this.userProgress.experience >= nextLevelExp) {
            this.levelUp();
        }
        
        this.saveUserProgress();
        this.updateGamificationUI();
        this.showNotification(`+${amount} XP gained!`, 'success');
    }

    levelUp() {
        this.userProgress.level++;
        this.userProgress.experience -= this.getNextLevelExp();
        this.showNotification(`🎉 Level Up! You are now level ${this.userProgress.level}`, 'levelup');
        
        // Add level up bonus
        const bonus = this.userProgress.level * 50;
        this.userProgress.points += bonus;
        this.showNotification(`+${bonus} bonus points for leveling up!`, 'bonus');
    }

    getNextLevelExp() {
        return this.userProgress.level * 100;
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.userProgress.achievements.push(achievementId);
            this.addExperience(achievement.points);
            this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'achievement');
            this.saveUserProgress();
            this.updateGamificationUI();
        }
    }

    completeChallenge(challengeId) {
        const challenge = this.challenges[challengeId];
        if (challenge && !challenge.completed) {
            challenge.completed = true;
            this.addExperience(challenge.points);
            this.showNotification(`🎯 Challenge Completed: ${challenge.name}!`, 'challenge');
            this.saveUserProgress();
            this.updateGamificationUI();
        }
    }

    claimReward(rewardId) {
        const reward = this.rewards[rewardId];
        if (reward && this.userProgress.points >= reward.pointsRequired) {
            this.userProgress.points -= reward.pointsRequired;
            this.showNotification(`🎁 Reward Claimed: ${reward.name}!`, 'reward');
            this.saveUserProgress();
            this.updateGamificationUI();
            
            // Apply reward effect
            this.applyReward(reward);
        }
    }

    applyReward(reward) {
        switch (reward.type) {
            case 'discount':
                // Apply discount to next booking
                localStorage.setItem('active_discount', '5%');
                break;
            case 'service':
                // Unlock free service
                localStorage.setItem('free_assessment', 'true');
                break;
            case 'privilege':
                // Enable priority booking
                localStorage.setItem('priority_booking', 'true');
                break;
        }
    }

    trackUserActions() {
        // Track page visits
        this.trackPageVisit();
        
        // Track specific actions
        this.trackAssessmentCompletion();
        this.trackBookingActions();
        this.trackSocialSharing();
    }

    trackPageVisit() {
        const today = new Date().toDateString();
        if (this.userProgress.lastVisit !== today) {
            this.userProgress.streak++;
            this.userProgress.lastVisit = today;
            this.addExperience(10);
            
            // Check for first visit achievement
            if (!this.achievements.first_visit.unlocked) {
                this.unlockAchievement('first_visit');
            }
            
            // Check for streak achievement
            if (this.userProgress.streak >= 7 && !this.achievements.streak_7.unlocked) {
                this.unlockAchievement('streak_7');
            }
        }
    }

    trackAssessmentCompletion() {
        // This would be called when user completes an assessment
        const checkAssessment = () => {
            if (this.userProgress.completedAssessments > 0) {
                this.userProgress.completedAssessments++;
                
                if (this.userProgress.completedAssessments >= 5 && !this.achievements.assessment_master.unlocked) {
                    this.unlockAchievement('assessment_master');
                }
                
                this.completeChallenge('daily_assessment');
            }
        };
        
        // Listen for assessment completion events
        document.addEventListener('assessmentCompleted', checkAssessment);
    }

    trackBookingActions() {
        // This would be called when user books an appointment
        const checkBooking = () => {
            this.userProgress.totalSessions++;
            
            if (this.userProgress.totalSessions >= 3 && !this.achievements.booking_expert.unlocked) {
                this.unlockAchievement('booking_expert');
            }
        };
        
        // Listen for booking events
        document.addEventListener('appointmentBooked', checkBooking);
    }

    trackSocialSharing() {
        // Track social media sharing
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.unlockAchievement('social_butterfly');
            });
        });
    }

    startDailyChallenges() {
        // Reset daily challenges
        const today = new Date().toDateString();
        if (this.userProgress.lastChallengeReset !== today) {
            Object.values(this.challenges).forEach(challenge => {
                if (challenge.type === 'daily') {
                    challenge.completed = false;
                }
            });
            this.userProgress.lastChallengeReset = today;
            this.saveUserProgress();
        }
    }

    checkAchievements() {
        // Check for explorer achievement
        const visitedPages = JSON.parse(localStorage.getItem('visited_pages') || '[]');
        if (visitedPages.length >= 5 && !this.achievements.explorer.unlocked) {
            this.unlockAchievement('explorer');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `gamification-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // Update notification badge
        this.updateNotificationBadge();
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            achievement: 'trophy',
            challenge: 'target',
            reward: 'gift',
            levelup: 'star',
            bonus: 'coins',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        const unreadCount = this.getUnreadCount();
        
        if (unreadCount > 0) {
            badge.style.display = 'block';
            badge.textContent = unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }

    getUnreadCount() {
        let count = 0;
        
        // Count unlocked achievements
        count += Object.values(this.achievements).filter(a => a.unlocked).length;
        
        // Count completed challenges
        count += Object.values(this.challenges).filter(c => c.completed).length;
        
        return count;
    }
}

// Initialize gamification system
let gamification;
document.addEventListener('DOMContentLoaded', function() {
    gamification = new GamificationSystem();
});

// Global functions for external use
function unlockAchievement(id) {
    if (gamification) gamification.unlockAchievement(id);
}

function completeChallenge(id) {
    if (gamification) gamification.completeChallenge(id);
}

function addExperience(amount) {
    if (gamification) gamification.addExperience(amount);
} 
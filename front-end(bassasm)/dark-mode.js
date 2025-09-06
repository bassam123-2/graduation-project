// Unified Dark Mode and Interactive Features for AL-BOQAI Center

document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeInteractiveFeatures();
    initializeAnimations();
    initializeKeyboardShortcuts();
});

// Dark Mode Management
function initializeDarkMode() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Theme toggle event listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Animation effect
            themeToggleBtn.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                themeToggleBtn.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
            
            showNotification(`Switched to ${newTheme} mode`, 'info');
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
                themeIcon.style.color = '#ffd700';
            } else {
                themeIcon.className = 'fas fa-moon';
                themeIcon.style.color = '#ffffff';
            }
        }
    }
}

// Interactive Features
function initializeInteractiveFeatures() {
    // Enhanced hover effects for forms and buttons
    const interactiveElements = document.querySelectorAll('.booking-form, .forgot-form, .register-form, .signin-form, button[type="submit"], .toggle-password, .service-card, .feature-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 10px 30px var(--shadow-color, rgba(0, 0, 0, 0.15))';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 20px var(--shadow-color, rgba(0, 0, 0, 0.08))';
        });
    });
    
    // Form validation enhancements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Processing...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    showNotification('Form submitted successfully!', 'success');
                }, 2000);
            }
        });
    });
    
    // Enhanced input focus effects
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Animation System
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.booking-form, .forgot-form, .register-form, .signin-form, .form-group, .service-card, .feature-item, .testimonial-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Toggle theme with Ctrl+T
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            if (themeToggleBtn) {
                themeToggleBtn.click();
            }
        }
        
        // Escape key to close dropdowns
        if (e.key === 'Escape') {
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#2a5d9f',
        warning: '#f39c12'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${colors[type] || colors.info};
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS variables for dark mode
if (!document.querySelector('#dark-mode-vars')) {
    const style = document.createElement('style');
    style.id = 'dark-mode-vars';
    style.textContent = `
        :root {
            --primary-color: #2a5d9f;
            --secondary-color: #1d406e;
            --background-color: #ffffff;
            --surface-color: #f8f9fa;
            --text-primary: #333333;
            --text-secondary: #555555;
            --text-light: #777777;
            --border-color: #e1e8ed;
            --shadow-color: rgba(0, 0, 0, 0.1);
            --gradient-primary: linear-gradient(135deg, #2a5d9f 0%, #1d406e 100%);
            --gradient-secondary: linear-gradient(135deg, #f8f9fa 0%, #e8f2ff 100%);
        }

        [data-theme="dark"] {
            --primary-color: #4a7bb8;
            --secondary-color: #2a5d9f;
            --background-color: #1a1a1a;
            --surface-color: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #e0e0e0;
            --text-light: #b0b0b0;
            --border-color: #404040;
            --shadow-color: rgba(0, 0, 0, 0.3);
            --gradient-primary: linear-gradient(135deg, #4a7bb8 0%, #2a5d9f 100%);
            --gradient-secondary: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
        }

        * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        [data-theme="dark"] .header {
            background: linear-gradient(90deg, #7886e9 0%, #7b5fc9 100%);
            border-bottom: 1px solid var(--border-color);
        }

        [data-theme="dark"] .footer {
            background: var(--surface-color);
            color: var(--text-primary);
        }

        [data-theme="dark"] .form-group input,
        [data-theme="dark"] .form-group select,
        [data-theme="dark"] .form-group textarea {
            background: var(--surface-color);
            color: var(--text-primary);
            border-color: var(--border-color);
        }

        [data-theme="dark"] .form-group label {
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);
}

// Console welcome message

// Export functions for external use
window.ALBOQAICenter = {
    toggleTheme: function() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.click();
        }
    },
    
    getCurrentTheme: function() {
        return document.body.getAttribute('data-theme') || 'light';
    },
    
    setTheme: function(theme) {
        if (theme === 'dark' || theme === 'light') {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            const themeIcon = document.getElementById('theme-icon');
            if (themeIcon) {
                if (theme === 'dark') {
                    themeIcon.className = 'fas fa-sun';
                    themeIcon.style.color = '#ffd700';
                } else {
                    themeIcon.className = 'fas fa-moon';
                    themeIcon.style.color = '#ffffff';
                }
            }
        }
    },
    
    showNotification: showNotification
}; 
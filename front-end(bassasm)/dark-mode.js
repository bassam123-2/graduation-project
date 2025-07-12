// Dark Mode and Interactive Features for AL-BOQAI Center

document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode Toggle Functionality
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
            
            // Add animation effect
            themeToggleBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggleBtn.style.transform = 'scale(1)';
            }, 150);
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
    

    
    // Header scroll effect for pages with headers
    const header = document.querySelector('.header');
    if (header) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'var(--background-color)';
                header.style.backdropFilter = 'none';
                header.style.boxShadow = 'none';
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Toggle theme with Ctrl+T
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            if (themeToggleBtn) {
                themeToggleBtn.click();
            }
        }
    });
    
    // Console welcome message
    console.log('%cWelcome to AL-BOQAI Center! 🏥', 'color: #2a5d9f; font-size: 20px; font-weight: bold;');
    console.log('%cDark mode is available - Press Ctrl+T to toggle', 'color: #666; font-size: 14px;');
});



// Add CSS variables for dark mode if not already present
if (!document.querySelector('#dark-mode-vars')) {
    const style = document.createElement('style');
    style.id = 'dark-mode-vars';
    style.textContent = `
        /* CSS Variables for Theme Switching */
        :root {
            /* Light Theme Colors */
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
            /* Dark Theme Colors */
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

        /* Smooth transitions for theme switching */
        * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        /* Dark mode specific adjustments */
        [data-theme="dark"] .header {
            background: var(--background-color);
            border-bottom: 1px solid var(--border-color);
        }

        [data-theme="dark"] .navbar {
            background: var(--background-color);
            border-bottom: 1px solid var(--border-color);
        }

        [data-theme="dark"] .dropdown-menu {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
        }

        [data-theme="dark"] .service-header,
        [data-theme="dark"] .about-header,
        [data-theme="dark"] .cv-header,
        [data-theme="dark"] .target-header {
            background: var(--gradient-primary);
        }

        [data-theme="dark"] .content-wrapper,
        [data-theme="dark"] .about-content,
        [data-theme="dark"] .cv-content,
        [data-theme="dark"] .target-content,
        [data-theme="dark"] .service-card,
        [data-theme="dark"] .technique-card,
        [data-theme="dark"] .element-card,
        [data-theme="dark"] .component-card,
        [data-theme="dark"] .benefit-item,
        [data-theme="dark"] .condition-category,
        [data-theme="dark"] .application-category,
        [data-theme="dark"] .detail-item,
        [data-theme="dark"] .image-container,
        [data-theme="dark"] .info-card {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
        }

        [data-theme="dark"] .booking-form,
        [data-theme="dark"] .forgot-form,
        [data-theme="dark"] .register-form,
        [data-theme="dark"] .signin-form {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
        }

        [data-theme="dark"] .form-group input,
        [data-theme="dark"] .form-group select {
            background: var(--background-color);
            color: var(--text-primary);
            border-color: var(--border-color);
        }

        [data-theme="dark"] .form-group label {
            color: var(--text-primary);
        }

        [data-theme="dark"] .footer {
            background: var(--surface-color);
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);
} 
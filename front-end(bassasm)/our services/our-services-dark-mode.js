// Professional Dark Mode and Interactive Features for AL-BOQAI Center Our Services Pages

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode functionality
    initializeDarkMode();
    
    // Initialize interactive features
    initializeInteractiveFeatures();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize performance optimizations
    initializePerformanceOptimizations();
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
    
    // Theme toggle event listener with enhanced feedback
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Add smooth transition effect
            body.style.transition = 'all 0.3s ease';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Enhanced animation effect
            themeToggleBtn.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                themeToggleBtn.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
            
            // Show theme change notification
            showThemeNotification(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
                themeIcon.style.color = '#ffd700';
                themeIcon.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            } else {
                themeIcon.className = 'fas fa-moon';
                themeIcon.style.color = '#ffffff';
                themeIcon.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            }
        }
    }
    
    function showThemeNotification(theme) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = `Switched to ${theme} mode`;
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
            background: ${theme === 'dark' ? '#2d2d2d' : '#2a5d9f'};
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// Interactive Features
function initializeInteractiveFeatures() {
    // Enhanced hover effects for cards and sections
    const interactiveElements = document.querySelectorAll('.technique-card, .element-card, .component-card, .benefit-item, .condition-category, .application-category, .detail-item, .image-container, .cta-card');
    
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
    
    // Enhanced image hover effects
    const images = document.querySelectorAll('.about-image');
    images.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.filter = 'brightness(1.1)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.filter = 'brightness(1)';
        });
    });
    
    // CTA button enhancements
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Animation System
function initializeAnimations() {
    // Intersection Observer for scroll animations
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
    const animateElements = document.querySelectorAll('.content-wrapper, .technique-card, .element-card, .component-card, .benefit-item, .condition-category, .application-category, .detail-item, .image-container, .cta-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Staggered animation for list items
    const listItems = document.querySelectorAll('.technique-card, .element-card, .component-card, .benefit-item');
    listItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            });
        }, { threshold: 0.1 });
        
        itemObserver.observe(item);
    });
}

// Performance Optimizations
function initializePerformanceOptimizations() {
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            const header = document.querySelector('.header');
            if (header) {
                header.style.background = 'linear-gradient(90deg, #7886e9 0%, #7b5fc9 100%)';
                header.style.backdropFilter = 'none';
                header.style.boxShadow = '0 2px 8px rgba(123, 95, 201, 0.07)';
            }
        }, 16);
    });
    
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Preload critical resources
    preloadCriticalResources();
}

// Scroll Effects Handler
function handleScrollEffects() {
    const header = document.querySelector('.header');
    if (header) {
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
    }
}

// Resource Preloading
function preloadCriticalResources() {
    // Preload critical images
    const criticalImages = [
        'https://alboqai.com/wp-content/uploads/2022/12/4414Artboard-5@3x-8-2048x651.png',
        'https://alboqai.com/wp-content/uploads/2022/12/IMG_2767-750x500.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Keyboard Navigation Support
document.addEventListener('keydown', function(e) {
    // Toggle theme with Ctrl+T
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.click();
        }
    }
    
    // Escape key to close any open modals or dropdowns
    if (e.key === 'Escape') {
        // Close any open dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
});

// Enhanced Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You can add error reporting logic here
});

// Console Welcome Message
console.log('%cWelcome to AL-BOQAI Center Our Services! 🏥', 'color: #2a5d9f; font-size: 18px; font-weight: bold;');
console.log('%cProfessional Dark Mode & Interactive Features Enabled', 'color: #666; font-size: 12px;');
console.log('%cPress Ctrl+T to toggle dark mode', 'color: #2a5d9f; font-size: 12px; font-style: italic;');

// Export functions for potential external use
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
    }
}; 
// Professional Success Stories Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode functionality
    initializeDarkMode();
    
    // Initialize video functionality
    initializeVideoFunctionality();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
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

// Video Functionality
function initializeVideoFunctionality() {
    // Lazy load videos for better performance
    const videoCards = document.querySelectorAll('.video-card');
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const videoCard = entry.target;
                const iframe = videoCard.querySelector('iframe');
                
                if (iframe && !iframe.dataset.loaded) {
                    // Add loading animation
                    videoCard.classList.add('loading');
                    
                    // Simulate loading delay for better UX
                    setTimeout(() => {
                        iframe.dataset.loaded = 'true';
                        videoCard.classList.remove('loading');
                        
                        // Add play button overlay
                        addPlayButtonOverlay(videoCard);
                    }, 800);
                }
            }
        });
    }, { threshold: 0.1 });
    
    videoCards.forEach(card => {
        videoObserver.observe(card);
    });
    
    // Video card hover effects
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add play button overlay to video cards
function addPlayButtonOverlay(videoCard) {
    const videoContainer = videoCard.querySelector('.video-container');
    
    if (videoContainer && !videoContainer.querySelector('.play-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'play-overlay';
        overlay.innerHTML = '<i class="fas fa-play"></i>';
        
        overlay.addEventListener('mouseenter', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1.1)';
            this.style.background = 'rgba(255, 0, 0, 1)';
        });
        
        overlay.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1)';
            this.style.background = 'rgba(255, 0, 0, 0.9)';
        });
        
        overlay.addEventListener('click', function() {
            const iframe = videoContainer.querySelector('iframe');
            if (iframe) {
                // Add autoplay parameter to YouTube URL
                const currentSrc = iframe.src;
                if (!currentSrc.includes('autoplay=1')) {
                    const separator = currentSrc.includes('?') ? '&' : '?';
                    iframe.src = currentSrc + separator + 'autoplay=1&mute=1';
                }
                this.style.display = 'none';
                
                // Show video started notification
                showVideoNotification('Video started playing!');
            }
        });
        
        videoContainer.appendChild(overlay);
    }
}

// Show video notification
function showVideoNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'video-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: #27ae60;
        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
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

// Smooth Scrolling
function initializeSmoothScrolling() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add active state to navigation
                updateActiveNavigation(targetId);
                
                // Show section highlight
                highlightSection(targetElement);
            }
        });
    });
}

// Update active navigation based on scroll position
function updateActiveNavigation(currentSection) {
    const navLinks = document.querySelectorAll('.navbar a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section link
    const currentLink = document.querySelector(`a[href="${currentSection}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
}

// Highlight section when scrolled to
function highlightSection(section) {
    section.style.background = 'var(--gradient-secondary)';
    section.style.transition = 'background 0.5s ease';
    
    setTimeout(() => {
        section.style.background = '';
    }, 2000);
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
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.video-card, .section-header, .stat-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Staggered animation for video cards
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Animate section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header, index) => {
        header.style.transitionDelay = `${index * 0.2}s`;
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
            // Handle scroll-based animations or effects
            handleScrollEffects();
        }, 16);
    });
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Lazy load images and videos
    lazyLoadResources();
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
        'https://alboqai.com/wp-content/uploads/2022/12/4414Artboard-5@3x-8-2048x651.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Lazy Load Resources
function lazyLoadResources() {
    // Lazy load YouTube thumbnails if needed
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    
    const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (!iframe.dataset.loaded) {
                    // Add loading state
                    iframe.style.opacity = '0.7';
                    
                    setTimeout(() => {
                        iframe.style.opacity = '1';
                        iframe.dataset.loaded = 'true';
                    }, 500);
                }
            }
        });
    }, { threshold: 0.1 });
    
    iframes.forEach(iframe => {
        iframeObserver.observe(iframe);
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
    
    // Arrow keys for video navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        navigateVideos(e.key);
    }
});

// Video Navigation
function navigateVideos(direction) {
    const videoCards = document.querySelectorAll('.video-card');
    const currentIndex = Array.from(videoCards).findIndex(card => 
        card.querySelector('.play-overlay') && 
        card.querySelector('.play-overlay').style.display !== 'none'
    );
    
    let nextIndex;
    if (direction === 'ArrowRight') {
        nextIndex = currentIndex < videoCards.length - 1 ? currentIndex + 1 : 0;
    } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : videoCards.length - 1;
    }
    
    // Scroll to next video
    videoCards[nextIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// Enhanced Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You can add error reporting logic here
});

// Console Welcome Message
console.log('%cWelcome to AL-BOQAI Center Success Stories! 🏥', 'color: #2a5d9f; font-size: 18px; font-weight: bold;');
console.log('%cProfessional Success Stories System Enabled', 'color: #666; font-size: 12px;');
console.log('%cPress Ctrl+T to toggle dark mode', 'color: #2a5d9f; font-size: 12px; font-style: italic;');
console.log('%cUse arrow keys to navigate videos', 'color: #2a5d9f; font-size: 12px; font-style: italic;');

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
    },
    
    scrollToSection: function(sectionId) {
        const targetElement = document.querySelector(sectionId);
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    playVideo: function(videoIndex) {
        const videoCards = document.querySelectorAll('.video-card');
        if (videoCards[videoIndex]) {
            const playButton = videoCards[videoIndex].querySelector('.play-overlay');
            if (playButton) {
                playButton.click();
            }
        }
    },
    
    getVideoCount: function() {
        return document.querySelectorAll('.video-card').length;
    }
}; 
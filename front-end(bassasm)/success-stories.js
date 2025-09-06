// Professional Success Stories Page JavaScript - Stories-specific functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeVideoFunctionality();
    initializeSmoothScrolling();
    initializeAnimations();
    initializePerformanceOptimizations();
});

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
                showNotification('Video started playing!', 'info');
            }
        });
        
        videoContainer.appendChild(overlay);
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
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
    
    // Update active navigation on scroll
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        updateActiveNavigation(current);
    });
}

function updateActiveNavigation(currentSection) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSection}`) {
            item.classList.add('active');
        }
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
    const animateElements = document.querySelectorAll('.story-card, .video-card, .testimonial-card, .stats-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Staggered animation for story cards
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Performance Optimizations
function initializePerformanceOptimizations() {
    // Lazy load images
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

// Video Navigation
function navigateVideos(direction) {
    const videoContainer = document.querySelector('.videos-grid');
    const scrollAmount = 400;
    
    if (videoContainer) {
        if (direction === 'left') {
            videoContainer.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        } else {
            videoContainer.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    if (window.ALBOQAICenter && window.ALBOQAICenter.showNotification) {
        window.ALBOQAICenter.showNotification(message, type);
    } else {
        // Fallback notification
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
            bottom: 20px;
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
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Console welcome message

// Professional Share Testimony Page JavaScript - Testimony-specific functionality

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize all functionality
        initializeTranslation();
        initializeForm();
        initializeCharacterCounter();
        initializeRatingSystem();
        initializePreview();
        initializeAnimations();
        initializeMediaUpload();
        initializeDraftButton();
        
        console.log('✅ All testimony functionality initialized successfully');
    } catch (e) {
        console.error('❌ Error during initialization:', e);
        document.body.innerHTML = '<div style="color:red;text-align:center;margin-top:50px;font-size:1.5em;">An error occurred loading the form. Please refresh the page or contact support.<br><br>' + e.message + '</div>';
    }
});

// Translation Management
function initializeTranslation() {
    const langBtn = document.getElementById('lang-toggle-btn');
    let currentLang = localStorage.getItem('lang') || 'en';
    
    // Set initial language
    setLanguage(currentLang);
    
    // Language toggle event listener
    if (langBtn) {
        langBtn.addEventListener('click', function() {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            setLanguage(currentLang);
            
            // Add animation effect
            langBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                langBtn.style.transform = 'scale(1)';
            }, 150);
            
            // Show language change notification
            const message = currentLang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English';
            showNotification(message, 'info');
        });
    }
}

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
    
    // Update page title
    const title = document.querySelector('title');
    if (title) {
        title.textContent = title.getAttribute(`data-${lang}`) || title.textContent;
    }
    
    // Update all elements with translation data attributes
    const translatableElements = document.querySelectorAll('[data-en][data-ar]');
    translatableElements.forEach(element => {
        const translation = element.getAttribute(`data-${lang}`);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Update placeholders
    const inputElements = document.querySelectorAll('input[data-en-placeholder][data-ar-placeholder], textarea[data-en-placeholder][data-ar-placeholder]');
    inputElements.forEach(element => {
        const placeholder = element.getAttribute(`data-${lang}-placeholder`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
    
    // Update select options
    const selectElements = document.querySelectorAll('select option[data-en][data-ar]');
    selectElements.forEach(option => {
        const translation = option.getAttribute(`data-${lang}`);
        if (translation) {
            option.textContent = translation;
        }
    });
    
    // Update navbar alignment for RTL
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (lang === 'ar') {
            navbar.style.flexDirection = 'row-reverse';
            navbar.style.textAlign = 'right';
        } else {
            navbar.style.flexDirection = 'row';
            navbar.style.textAlign = 'left';
        }
    }
    
    // Update dropdown menus
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.textAlign = lang === 'ar' ? 'right' : 'left';
    });
    
    // Update form layout for RTL
    const formGrids = document.querySelectorAll('.form-grid');
    formGrids.forEach(grid => {
        if (lang === 'ar') {
            grid.style.direction = 'rtl';
        } else {
            grid.style.direction = 'ltr';
        }
    });
    
    // Update language button text
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.innerHTML = lang === 'ar' ? '<i class="fas fa-language"></i> English' : '<i class="fas fa-language"></i> العربية';
    }
}

// Form Management
function initializeForm() {
    const form = document.getElementById('testimonialForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                showSuccessModal();
            }
        });
    }
}

// Character Counter
function initializeCharacterCounter() {
    const textarea = document.getElementById('testimonialText');
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = length;
            
            if (length > 1400) {
                charCount.style.color = '#e74c3c';
            } else if (length > 1200) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = 'inherit';
            }
        });
    }
}

// Rating System
function initializeRatingSystem() {
    const ratingStars = document.querySelectorAll('.rating-stars input[type="radio"]');
    const ratingLabel = document.querySelector('.rating-label');
    
    ratingStars.forEach(star => {
        star.addEventListener('change', function() {
            const rating = this.value;
            const currentLang = localStorage.getItem('lang') || 'en';
            const labelText = currentLang === 'ar' ? `تم التقييم بـ ${rating} نجوم` : `Rated ${rating} stars`;
            ratingLabel.textContent = labelText;
        });
    });
}

// Preview System
function initializePreview() {
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            if (validateForm()) {
                showPreviewModal();
            }
        });
    }
}

// Form Validation
function validateForm() {
    clearAllErrors();
    let isValid = true;
    
    const requiredFields = [
        'fullName', 'email', 'condition', 'treatmentType', 
        'beforeCondition', 'treatmentExperience', 'results', 
        'testimonialText', 'rating', 'recommend', 'consent'
    ];
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value && !isValidPhone(phoneField.value)) {
        showFieldError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (fieldName === 'email' && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (fieldName === 'phone' && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        let errorDiv = formGroup.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.85em; margin-top: 5px;';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        field.style.borderColor = '#e74c3c';
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorDiv = formGroup.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
    }
}

function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
        field.style.borderColor = '';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

// Form Data Collection
function getFormData() {
    const form = document.getElementById('testimonialForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Success Modal
function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Thank You!</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Your testimonial has been submitted successfully. We will review it and may contact you for additional information if needed.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="window.location.href='success-stories.html'">View Success Stories</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Preview Modal
function showPreviewModal() {
    const data = getFormData();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h2>Preview Your Testimonial</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                ${generatePreviewHTML(data)}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="submitForm()">Submit Testimonial</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Edit</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function generatePreviewHTML(data) {
    const currentLang = localStorage.getItem('lang') || 'en';
    const labels = {
        en: {
            personalInfo: 'Personal Information',
            medicalInfo: 'Medical Information',
            treatmentExperience: 'Treatment Experience',
            testimonial: 'Your Testimonial',
            rating: 'Rating & Recommendation'
        },
        ar: {
            personalInfo: 'المعلومات الشخصية',
            medicalInfo: 'المعلومات الطبية',
            treatmentExperience: 'تجربة العلاج',
            testimonial: 'شهادتك',
            rating: 'التقييم والتوصية'
        }
    };
    
    return `
        <div class="preview-content">
            <div class="preview-section">
                <h3>${labels[currentLang].personalInfo}</h3>
                <p><strong>Name:</strong> ${data.fullName || 'Not provided'}</p>
                <p><strong>Age:</strong> ${data.age || 'Not provided'}</p>
                <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
                <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${labels[currentLang].medicalInfo}</h3>
                <p><strong>Condition:</strong> ${data.condition || 'Not provided'}</p>
                <p><strong>Treatment Type:</strong> ${data.treatmentType || 'Not provided'}</p>
                <p><strong>Duration:</strong> ${data.treatmentDuration || 'Not provided'}</p>
                <p><strong>Before Treatment:</strong> ${data.beforeCondition || 'Not provided'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${labels[currentLang].treatmentExperience}</h3>
                <p><strong>Experience:</strong> ${data.treatmentExperience || 'Not provided'}</p>
                <p><strong>Results:</strong> ${data.results || 'Not provided'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${labels[currentLang].testimonial}</h3>
                <p>${data.testimonialText || 'Not provided'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${labels[currentLang].rating}</h3>
                <p><strong>Rating:</strong> ${data.rating ? `${data.rating}/5 stars` : 'Not provided'}</p>
                <p><strong>Recommendation:</strong> ${data.recommend || 'Not provided'}</p>
            </div>
        </div>
    `;
}

// Form Submission
function submitForm() {
    const form = document.getElementById('testimonialForm');
    if (form) {
        form.submit();
    }
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
    const animateElements = document.querySelectorAll('.form-section, .form-group, .hero-content');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Media Upload
function initializeMediaUpload() {
    const fileInput = document.getElementById('mediaUpload');
    const preview = document.getElementById('mediaPreview');
    
    if (fileInput && preview) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (file.type.startsWith('image/')) {
                        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
                    } else if (file.type.startsWith('video/')) {
                        preview.innerHTML = `<video controls style="max-width: 200px; max-height: 200px; border-radius: 8px;"><source src="${e.target.result}" type="${file.type}"></video>`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Draft Button
function initializeDraftButton() {
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const draftMessage = document.getElementById('draftMessage');
    
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            const formData = getFormData();
            localStorage.setItem('testimonialDraft', JSON.stringify(formData));
            
            if (draftMessage) {
                draftMessage.style.display = 'block';
                setTimeout(() => {
                    draftMessage.style.display = 'none';
                }, 3000);
            }
            
            showNotification('Draft saved successfully!', 'success');
        });
    }
    
    // Load draft on page load
    const savedDraft = localStorage.getItem('testimonialDraft');
    if (savedDraft) {
        try {
            const draftData = JSON.parse(savedDraft);
            loadDraftData(draftData);
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
}

function loadDraftData(data) {
    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
        if (field) {
            field.value = data[key];
        }
    });
    
    // Update character counter
    const textarea = document.getElementById('testimonialText');
    const charCount = document.getElementById('charCount');
    if (textarea && charCount) {
        charCount.textContent = textarea.value.length;
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
console.log('%cWelcome to AL-BOQAI Center Testimony Page! 📝', 'color: #2a5d9f; font-size: 16px; font-weight: bold;'); 
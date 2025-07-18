// Professional Share Testimony Page JavaScript with Dark Mode and Translation Support

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize all functionality
        initializeDarkMode();
        initializeTranslation();
        initializeForm();
        initializeCharacterCounter();
        initializeRatingSystem();
        initializePreview();
        initializeAnimations();
        initializeMediaUpload();
        initializeDraftButton();
        
        // Debug logging
        console.log('✅ All functionality initialized successfully');
    } catch (e) {
        console.error('❌ Error during initialization:', e);
        document.body.innerHTML = '<div style="color:red;text-align:center;margin-top:50px;font-size:1.5em;">An error occurred loading the form. Please refresh the page or contact support.<br><br>' + e.message + '</div>';
    }
});

// Dark Mode Management
function initializeDarkMode() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    
    console.log('🔧 Initializing dark mode...');
    console.log('Theme toggle button found:', !!themeToggleBtn);
    console.log('Theme icon found:', !!themeIcon);
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    console.log('Current theme from localStorage:', currentTheme);
    
    // Set initial theme
    body.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Theme toggle event listener with enhanced feedback
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎨 Theme toggle clicked');
            
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            console.log('Switching from', currentTheme, 'to', newTheme);
            
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
            
            console.log('✅ Theme switched to:', newTheme);
        });
        
        console.log('✅ Theme toggle event listener added');
    } else {
        console.error('❌ Theme toggle button not found!');
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
            console.log('🎨 Theme icon updated for:', theme);
        } else {
            console.error('❌ Theme icon not found!');
        }
    }
    
    function showThemeNotification(theme) {
        const message = theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
        showNotification(message, 'info');
    }
    
    console.log('✅ Dark mode initialization complete');
}

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

// Form initialization and validation
function initializeForm() {
    const form = document.getElementById('testimonialForm');
    const submitBtn = form.querySelector('.submit-btn');
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            showSuccessModal();
            // Here you would typically send the data to your server
            console.log('Form data:', getFormData());
        }
    });
    
    // Real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Character counter for testimonial text
function initializeCharacterCounter() {
    const textarea = document.getElementById('testimonialText');
    const charCount = document.getElementById('charCount');
    const maxChars = 1500;
    
    textarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = currentLength;
        
        // Update counter color based on length
        if (currentLength > maxChars * 0.9) {
            charCount.style.color = '#e74c3c';
        } else if (currentLength > maxChars * 0.7) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = 'inherit';
        }
        
        // Prevent typing beyond limit
        if (currentLength > maxChars) {
            this.value = this.value.substring(0, maxChars);
            charCount.textContent = maxChars;
        }
    });
}

// Rating system functionality
function initializeRatingSystem() {
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const ratingLabel = document.querySelector('.rating-label');
    
    ratingInputs.forEach(input => {
        input.addEventListener('change', function() {
            const rating = this.value;
            const currentLang = localStorage.getItem('lang') || 'en';
            const ratingText = currentLang === 'ar' ? `${rating} من 5 نجوم` : `${rating} out of 5 stars`;
            ratingLabel.textContent = ratingText;
            
            // Add visual feedback
            const stars = document.querySelectorAll('.rating-stars label');
            stars.forEach((star, index) => {
                if (index < 5 - rating) {
                    star.style.color = '#ddd';
                } else {
                    star.style.color = '#ffc107';
                }
            });
        });
    });
}

// Preview functionality
function initializePreview() {
    const previewBtn = document.getElementById('previewBtn');
    previewBtn.addEventListener('click', function() {
        if (validateForm()) {
            showPreviewModal();
        }
    });
}

// Form validation
function validateForm() {
    const form = document.getElementById('testimonialForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField.value && !isValidEmail(emailField.value)) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const errorMessage = currentLang === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address';
        showFieldError(emailField, errorMessage);
        isValid = false;
    }
    
    // Validate phone format (if provided)
    const phoneField = document.getElementById('phone');
    if (phoneField.value && !isValidPhone(phoneField.value)) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const errorMessage = currentLang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
        showFieldError(phoneField, errorMessage);
        isValid = false;
    }
    
    // Validate age (if provided)
    const ageField = document.getElementById('age');
    if (ageField.value) {
        const age = parseInt(ageField.value);
        if (age < 1 || age > 120) {
            const currentLang = localStorage.getItem('lang') || 'en';
            const errorMessage = currentLang === 'ar' ? 'يرجى إدخال عمر صحيح بين 1 و 120' : 'Please enter a valid age between 1 and 120';
            showFieldError(ageField, errorMessage);
            isValid = false;
        }
    }
    
    return isValid;
}

// Individual field validation
function validateField(field) {
    const value = field.value.trim();
    const currentLang = localStorage.getItem('lang') || 'en';
    
    if (field.hasAttribute('required') && !value) {
        const errorMessage = currentLang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
        showFieldError(field, errorMessage);
        return false;
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error styling
    field.style.borderColor = '#e74c3c';
    field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.85em';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Clear all errors
function clearAllErrors() {
    const errorDivs = document.querySelectorAll('.field-error');
    errorDivs.forEach(div => div.remove());
    
    const fields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    fields.forEach(field => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Get form data
function getFormData() {
    const form = document.getElementById('testimonialForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Show success modal
function showSuccessModal() {
    const currentLang = localStorage.getItem('lang') || 'en';
    const successMessage = currentLang === 'ar' ? 'تم إرسال قصتك بنجاح! شكراً لك على مشاركة تجربتك.' : 'Your story has been submitted successfully! Thank you for sharing your experience.';
    
    showNotification(successMessage, 'success');
    
    // Reset form
    document.getElementById('testimonialForm').reset();
    document.getElementById('charCount').textContent = '0';
    
    const ratingLabel = document.querySelector('.rating-label');
    if (ratingLabel) {
        const labelText = currentLang === 'ar' ? 'انقر للتقييم' : 'Click to rate';
        ratingLabel.textContent = labelText;
    }
    
    // Reset star colors
    const stars = document.querySelectorAll('.rating-stars label');
    stars.forEach(star => {
        star.style.color = '#ddd';
    });
}

// Show preview modal
function showPreviewModal() {
    const currentLang = localStorage.getItem('lang') || 'en';
    const previewTitle = currentLang === 'ar' ? 'معاينة قصتك' : 'Preview Your Story';
    const closeText = currentLang === 'ar' ? 'إغلاق' : 'Close';
    
    // Create modal HTML
    const modalHTML = `
        <div id="previewModal" class="modal" style="display: block;">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>${previewTitle}</h2>
                    <button class="close-btn" onclick="closePreviewModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="previewContent"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closePreviewModal()">${closeText}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Generate preview content
    const previewContent = document.getElementById('previewContent');
    const formData = getFormData();
    previewContent.innerHTML = generatePreviewHTML(formData);
}

function generatePreviewHTML(data) {
    const currentLang = localStorage.getItem('lang') || 'en';
    
    const translations = {
        en: {
            personalInfo: 'Personal Information',
            medicalInfo: 'Medical Information',
            treatmentExp: 'Treatment Experience',
            testimonial: 'Your Testimonial',
            rating: 'Rating & Recommendation',
            additionalInfo: 'Additional Information',
            privacy: 'Privacy & Consent',
            fullName: 'Full Name',
            age: 'Age',
            email: 'Email',
            phone: 'Phone',
            condition: 'Primary Condition',
            treatmentType: 'Treatment Type',
            duration: 'Duration',
            beforeCondition: 'Condition Before Treatment',
            experience: 'Treatment Experience',
            results: 'Results and Improvements',
            story: 'Your Story',
            overallRating: 'Overall Rating',
            recommendation: 'Recommendation',
            specialist: 'Specialist',
            comments: 'Additional Comments',
            consent: 'Consent Given',
            anonymous: 'Anonymous',
            contactPermission: 'Contact Permission'
        },
        ar: {
            personalInfo: 'المعلومات الشخصية',
            medicalInfo: 'المعلومات الطبية',
            treatmentExp: 'تجربة العلاج',
            testimonial: 'شهادتك',
            rating: 'التقييم والتوصية',
            additionalInfo: 'معلومات إضافية',
            privacy: 'الخصوصية والموافقة',
            fullName: 'الاسم الكامل',
            age: 'العمر',
            email: 'البريد الإلكتروني',
            phone: 'الهاتف',
            condition: 'الحالة الأساسية',
            treatmentType: 'نوع العلاج',
            duration: 'المدة',
            beforeCondition: 'الحالة قبل العلاج',
            experience: 'تجربة العلاج',
            results: 'النتائج والتحسينات',
            story: 'قصتك',
            overallRating: 'التقييم العام',
            recommendation: 'التوصية',
            specialist: 'الأخصائي',
            comments: 'تعليقات إضافية',
            consent: 'تم إعطاء الموافقة',
            anonymous: 'مجهول الهوية',
            contactPermission: 'إذن الاتصال'
        }
    };
    
    const t = translations[currentLang];
    
    return `
        <div class="preview-content">
            <div class="preview-section">
                <h3>${t.personalInfo}</h3>
                <p><strong>${t.fullName}:</strong> ${data.fullName || 'N/A'}</p>
                <p><strong>${t.age}:</strong> ${data.age || 'N/A'}</p>
                <p><strong>${t.email}:</strong> ${data.email || 'N/A'}</p>
                <p><strong>${t.phone}:</strong> ${data.phone || 'N/A'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${t.medicalInfo}</h3>
                <p><strong>${t.condition}:</strong> ${data.condition || 'N/A'}</p>
                <p><strong>${t.treatmentType}:</strong> ${data.treatmentType || 'N/A'}</p>
                <p><strong>${t.duration}:</strong> ${data.treatmentDuration || 'N/A'}</p>
                <p><strong>${t.beforeCondition}:</strong> ${data.beforeCondition || 'N/A'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${t.treatmentExp}</h3>
                <p><strong>${t.experience}:</strong> ${data.treatmentExperience || 'N/A'}</p>
                <p><strong>${t.results}:</strong> ${data.results || 'N/A'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${t.testimonial}</h3>
                <p><strong>${t.story}:</strong> ${data.testimonialText || 'N/A'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${t.rating}</h3>
                <p><strong>${t.overallRating}:</strong> ${data.rating || 'N/A'} / 5</p>
                <p><strong>${t.recommendation}:</strong> ${data.recommend || 'N/A'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${t.additionalInfo}</h3>
                <p><strong>${t.specialist}:</strong> ${data.specialist || 'N/A'}</p>
                <p><strong>${t.comments}:</strong> ${data.additionalComments || 'N/A'}</p>
            </div>
            
            <div class="preview-section">
                <h3>${t.privacy}</h3>
                <p><strong>${t.consent}:</strong> ${data.consent ? 'Yes' : 'No'}</p>
                <p><strong>${t.anonymous}:</strong> ${data.anonymous ? 'Yes' : 'No'}</p>
                <p><strong>${t.contactPermission}:</strong> ${data.contactPermission ? 'Yes' : 'No'}</p>
            </div>
        </div>
    `;
}

function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.remove();
    }
}

function submitForm() {
    const form = document.getElementById('testimonialForm');
    if (validateForm()) {
        // Here you would submit the form data to your server
        showSuccessModal();
    }
}

// Animation system
function initializeAnimations() {
    // Add fade-in animation to form sections
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add hover effects to form elements
    const formElements = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.parentNode.style.transform = 'scale(1.02)';
        });
        
        element.addEventListener('blur', function() {
            this.parentNode.style.transform = 'scale(1)';
        });
    });
}

// Media upload functionality
function initializeMediaUpload() {
    const fileInput = document.getElementById('mediaUpload');
    const preview = document.getElementById('mediaPreview');
    
    if (fileInput && preview) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (file.type.startsWith('image/')) {
                        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
                    } else if (file.type.startsWith('video/')) {
                        preview.innerHTML = `<video controls style="max-width: 200px; max-height: 200px; border-radius: 8px;"><source src="${e.target.result}"></video>`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Draft functionality
function initializeDraftButton() {
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const draftMessage = document.getElementById('draftMessage');
    
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            const formData = getFormData();
            localStorage.setItem('testimonialDraft', JSON.stringify(formData));
            
            // Show success message
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
        const element = document.querySelector(`[name="${key}"]`);
        if (element) {
            element.value = data[key];
        }
    });
    
    // Update character counter
    const textarea = document.getElementById('testimonialText');
    if (textarea) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = textarea.value.length;
        }
    }
}

function clearAutoSavedData() {
    localStorage.removeItem('testimonialDraft');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    
    // Toggle language with Ctrl+L
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        const langBtn = document.getElementById('lang-toggle-btn');
        if (langBtn) {
            langBtn.click();
        }
    }
    
    // Escape key to close any open modals
    if (e.key === 'Escape') {
        const modal = document.getElementById('previewModal');
        if (modal) {
            closePreviewModal();
        }
    }
});

// Performance Optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(function() {
    // Your scroll handling logic here
}, 16);

window.addEventListener('scroll', debouncedScrollHandler);

// Console Welcome Message
console.log('%cWelcome to AL-BOQAI Center Share Testimony! 🏥', 'color: #2a5d9f; font-size: 18px; font-weight: bold;');
console.log('%cProfessional Dark Mode & Translation Features Enabled', 'color: #666; font-size: 12px;');
console.log('%cPress Ctrl+T to toggle dark mode, Ctrl+L to toggle language', 'color: #2a5d9f; font-size: 12px; font-style: italic;');

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
    
    toggleLanguage: function() {
        const langBtn = document.getElementById('lang-toggle-btn');
        if (langBtn) {
            langBtn.click();
        }
    },
    
    getCurrentLanguage: function() {
        return localStorage.getItem('lang') || 'en';
    },
    
    setLanguage: function(lang) {
        if (lang === 'en' || lang === 'ar') {
            setLanguage(lang);
        }
    }
}; 
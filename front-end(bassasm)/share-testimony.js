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
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (validateForm()) {
                await submitTestimonial();
            }
        });
    }
}

// Submit testimonial to API with proper field mapping
async function submitTestimonial() {
    const form = document.getElementById('testimonialForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        // Get form data with proper field mapping
        const formData = {
            // Map frontend field names to database field names
            full_name: document.getElementById('fullName').value.trim(),
            age: document.getElementById('age').value ? parseInt(document.getElementById('age').value) : null,
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            condition: document.getElementById('condition').value.trim(),
            treatment_type: document.getElementById('treatmentType').value,
            treatment_duration: document.getElementById('treatmentDuration').value,
            specialist: document.getElementById('specialist').value.trim(),
            before_condition: document.getElementById('beforeCondition').value.trim(),
            treatment_experience: document.getElementById('treatmentExperience').value.trim(),
            results: document.getElementById('results').value.trim(),
            testimonial_text: document.getElementById('testimonialText').value.trim(),
            additional_comments: document.getElementById('additionalComments').value.trim(),
            rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0),
            recommend: document.getElementById('recommend').value,
            consent: document.getElementById('consent').checked,
            anonymous: document.getElementById('anonymous').checked,
            contact_permission: document.getElementById('contactPermission').checked
        };
        
        // Add user_id if logged in
        const userId = localStorage.getItem('userId');
        if (userId) {
            formData.user_id = parseInt(userId);
        }
        
        // Handle media file if present
        const mediaFile = document.getElementById('mediaUpload').files[0];
        
        // Check if backend is available
        const backendAvailable = await checkBackendAvailability();
        
        if (backendAvailable) {
            // Try to submit to backend
            await submitToBackend(formData, mediaFile);
        } else {
            // Backend unavailable, save locally
            await saveTestimonialLocally(formData, mediaFile);
        }
        
        // Success - reset form
        form.reset();
        // Reset character counter
        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = '0';
        // Reset rating
        const ratingLabel = document.querySelector('.rating-label');
        if (ratingLabel) ratingLabel.textContent = 'Click to rate';
        // Clear media preview
        const preview = document.getElementById('mediaPreview');
        if (preview) preview.innerHTML = '';
        
        showSuccessModal();
        
    } catch (error) {
        console.error('Testimonial submission error:', error);
        
        // Try to save locally as fallback
        try {
            const formData = getFormDataForFallback();
            await saveTestimonialLocally(formData);
            showNotification('Backend unavailable. Your testimonial has been saved locally and will be submitted when connection is restored.', 'warning');
        } catch (fallbackError) {
            console.error('Fallback save failed:', fallbackError);
            showNotification('Failed to submit testimonial. Please check your connection and try again.', 'error');
        }
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function checkBackendAvailability() {
    try {
        const response = await fetch('http://localhost:8080/api/health/', {
            method: 'GET',
            timeout: 5000
        });
        return response.ok;
    } catch {
        return false;
    }
}

async function submitToBackend(formData, mediaFile) {
    // Create FormData for file upload
    const apiData = new FormData();
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
            apiData.append(key, formData[key]);
        }
    });
    
    if (mediaFile) {
        apiData.append('media_file', mediaFile);
    }
    
    // Submit to API
    const response = await fetch('http://localhost:8080/api/testimonials/', {
        method: 'POST',
        headers: {
            ...(formData.user_id && { 'Authorization': `Bearer ${localStorage.getItem('sessionId')}` })
        },
        credentials: 'include',
        body: apiData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to submit testimonial. Please try again.';
        throw new Error(errorMessage);
    }
    
    return data;
}

async function saveTestimonialLocally(formData, mediaFile = null) {
    const testimonial = {
        ...formData,
        submitted_at: new Date().toISOString(),
        status: 'pending_submission',
        has_media: !!mediaFile,
        media_filename: mediaFile?.name || null,
        media_size: mediaFile?.size || null,
        media_type: mediaFile?.type || null
    };
    
    // Save to localStorage
    const savedTestimonials = JSON.parse(localStorage.getItem('pendingTestimonials') || '[]');
    savedTestimonials.push(testimonial);
    localStorage.setItem('pendingTestimonials', JSON.stringify(savedTestimonials));
    
    // If there's a media file, we'll need to handle it separately
    if (mediaFile) {
        // For now, we'll just save the file info
        // In a real implementation, you might want to convert to base64 or use IndexedDB

    }
    
    return testimonial;
}

function getFormDataForFallback() {
    return {
        full_name: document.getElementById('fullName').value.trim(),
        age: document.getElementById('age').value ? parseInt(document.getElementById('age').value) : null,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        condition: document.getElementById('condition').value.trim(),
        treatment_type: document.getElementById('treatmentType').value,
        treatment_duration: document.getElementById('treatmentDuration').value,
        specialist: document.getElementById('specialist').value.trim(),
        before_condition: document.getElementById('beforeCondition').value.trim(),
        treatment_experience: document.getElementById('treatmentExperience').value.trim(),
        results: document.getElementById('results').value.trim(),
        testimonial_text: document.getElementById('testimonialText').value.trim(),
        additional_comments: document.getElementById('additionalComments').value.trim(),
        rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0),
        recommend: document.getElementById('recommend').value,
        consent: document.getElementById('consent').checked,
        anonymous: document.getElementById('anonymous').checked,
        contact_permission: document.getElementById('contactPermission').checked,
        user_id: localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : null
    };
}

// Character Counter
function initializeCharacterCounter() {
    const textarea = document.getElementById('testimonialText');
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            updateCharacterCounter();
        });
    }
}

// Helper function to update character counter
function updateCharacterCounter() {
    const textarea = document.getElementById('testimonialText');
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
        const length = textarea.value.length;
        charCount.textContent = length;
        
        if (length > 1400) {
            charCount.style.color = '#e74c3c';
        } else if (length > 1200) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = 'inherit';
        }
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
        // Skip file inputs in draft data since they cannot be restored
        const field = form.querySelector(`[name="${key}"]`);
        if (field && field.type === 'file') {

            continue;
        }
        
        // Use the field's ID instead of name for consistent draft loading
        if (field && field.id) {
            data[field.id] = value;
        } else {
            data[key] = value; // Fallback to name if no ID
        }
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
                // Validate file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                if (file.size > maxSize) {
                    showNotification('File size must be less than 10MB. Please choose a smaller file.', 'error');
                    this.value = '';
                    preview.innerHTML = '';
                    return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
                if (!allowedTypes.includes(file.type)) {
                    showNotification('Please upload a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG) file.', 'error');
                    this.value = '';
                    preview.innerHTML = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        if (file.type.startsWith('image/')) {
                            preview.innerHTML = `
                                <div style="position: relative; display: inline-block;">
                                    <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                                        <i class="fas fa-image"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                </div>
                            `;
                        } else if (file.type.startsWith('video/')) {
                            preview.innerHTML = `
                                <div style="position: relative; display: inline-block;">
                                    <video controls style="max-width: 200px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                        <source src="${e.target.result}" type="${file.type}">
                                        Your browser does not support the video tag.
                                    </video>
                                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                                        <i class="fas fa-video"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                </div>
                            `;
                        }
                        showNotification('File uploaded successfully! Preview shown above.', 'success');
                    } catch (error) {
                        console.error('Error creating file preview:', error);
                        preview.innerHTML = `
                            <div style="color: #666; font-size: 12px;">
                                <i class="fas fa-file"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                                <br><small>Preview not available, but file is ready for upload.</small>
                            </div>
                        `;
                        showNotification('File selected successfully (preview not available).', 'info');
                    }
                };
                
                reader.onerror = function() {
                    console.error('Error reading file');
                    showNotification('Error reading file. Please try again.', 'error');
                    fileInput.value = '';
                    preview.innerHTML = '';
                };
                
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = '';
            }
        });
        
        // Add drag and drop functionality
        const fileInputContainer = fileInput.closest('.form-group');
        if (fileInputContainer) {
            fileInputContainer.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '#f0f8ff';
                this.style.borderColor = '#007bff';
            });
            
            fileInputContainer.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '';
                this.style.borderColor = '';
            });
            
            fileInputContainer.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '';
                this.style.borderColor = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
        }
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

            // Additional safety check before loading
            const hasFileFields = Object.keys(draftData).some(key => 
                key.toLowerCase().includes('upload') || 
                key.toLowerCase().includes('file') || 
                key.toLowerCase().includes('media')
            );
            
            if (hasFileFields) {
                console.warn('Draft data contains file fields, clearing to prevent errors');
                localStorage.removeItem('testimonialDraft');
                showNotification('Draft data contained file fields and has been cleared for safety.', 'warning');
                return;
            }
            
            loadDraftData(draftData);
            showNotification('Draft loaded successfully! Note: File uploads cannot be restored from drafts.', 'info');
        } catch (e) {
            console.error('Error loading draft:', e);
            // Clear corrupted draft data
            localStorage.removeItem('testimonialDraft');
            showNotification('Draft data was corrupted and has been cleared.', 'warning');
        }
    }
    
    // Add a function to clear draft data if needed
    window.clearTestimonialDraft = function() {
        localStorage.removeItem('testimonialDraft');
        showNotification('Draft data has been cleared.', 'info');

    };
    
    // Function to force clear all draft data (useful for debugging)
    window.forceClearTestimonialDraft = function() {
        localStorage.removeItem('testimonialDraft');
        showNotification('All draft data has been forcefully cleared.', 'warning');

        // Also clear any other potential draft-related data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('testimonial') || key.includes('draft'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);

        });
    };
    
    // Function to safely clear corrupted draft data
    function clearCorruptedDraft() {
        try {
            localStorage.removeItem('testimonialDraft');

            showNotification('Corrupted draft data has been cleared.', 'warning');
        } catch (error) {
            console.error('Error clearing corrupted draft:', error);
        }
    }
    
    // Check for and clear any existing corrupted draft data on page load
    try {
        const existingDraft = localStorage.getItem('testimonialDraft');
        if (existingDraft) {
            // Try to parse it to see if it's valid JSON
            const parsedDraft = JSON.parse(existingDraft);

            // Check if the draft data contains any file-related fields that could cause issues
            const hasFileFields = Object.keys(parsedDraft).some(key => 
                key.toLowerCase().includes('upload') || 
                key.toLowerCase().includes('file') || 
                key.toLowerCase().includes('media')
            );
            
            if (hasFileFields) {
                console.warn('Found draft data with file fields, clearing it to prevent errors');
                clearCorruptedDraft();
            }
        }
    } catch (error) {
        console.warn('Found corrupted draft data, clearing it:', error);
        clearCorruptedDraft();
    }
    
    // Final safety measure: clear any draft data that might cause issues
    // This ensures a clean start even if there are edge cases
    try {
        const finalCheck = localStorage.getItem('testimonialDraft');
        if (finalCheck) {
            const finalData = JSON.parse(finalCheck);
            // If any key contains file-related terms, clear it
            const hasAnyFileReferences = Object.keys(finalData).some(key => 
                key.toLowerCase().includes('upload') || 
                key.toLowerCase().includes('file') || 
                key.toLowerCase().includes('media')
            );
            
            if (hasAnyFileReferences) {
                console.warn('Final safety check: Found file references in draft, clearing');
                localStorage.removeItem('testimonialDraft');
                showNotification('Draft data cleared for safety.', 'warning');
            }
        }
    } catch (finalError) {
        console.warn('Final safety check failed, clearing draft:', finalError);
        localStorage.removeItem('testimonialDraft');
    }
}

function loadDraftData(data) {
    try {

        // Clean up old draft data format first
        const cleanedData = cleanDraftData(data);

        // Filter out file input data before processing
        const filteredData = filterFileInputData(cleanedData);

        // Use for...of loop instead of forEach to support continue statements
        for (const key of Object.keys(filteredData)) {
            const field = document.getElementById(key);
            if (field) {

                // Skip file inputs entirely - they cannot be restored
                if (field.type === 'file') {

                    continue; // Use continue to skip this iteration
                }
                
                // Additional safety check for any field that might be a file input
                if (key.toLowerCase().includes('upload') || key.toLowerCase().includes('file') || key.toLowerCase().includes('media')) {

                    continue; // Use continue to skip this iteration
                }
                
                // Log field details for debugging

                // Handle different input types appropriately
                if (field.type === 'checkbox') {
                    try {
                        field.checked = filteredData[key] === 'true' || filteredData[key] === true;

                    } catch (error) {
                        console.warn(`Could not set checkbox for field ${key}:`, error);
                    }
                } else if (field.type === 'radio') {
                    try {
                        field.checked = field.value === filteredData[key];

                    } catch (error) {
                        console.warn(`Could not set radio for field ${key}:`, error);
                    }
                } else {
                    // For text inputs, textareas, and select elements
                    try {
                        // Final safety check - never set values on file inputs
                        if (field.type === 'file') {

                            continue; // Use continue to skip this iteration
                        }
                        
                        // Try to set the value with additional error handling
                        try {
                            field.value = filteredData[key];

                        } catch (setValueError) {
                            console.error(`Failed to set value for field ${key}:`, setValueError);
                            console.error(`Field details:`, {
                                type: field.type,
                                tagName: field.tagName,
                                id: field.id,
                                name: field.name,
                                value: filteredData[key]
                            });
                            
                            // If this is a file input error, skip this field and continue
                            if (setValueError.message && setValueError.message.includes('filename')) {
                                console.warn(`Skipping file input field ${key} due to filename error`);
                                continue; // Use continue to skip this iteration
                            }
                            
                            // For other errors, try to continue but log the issue
                            console.warn(`Continuing despite error for field ${key}`);
                        }
                    } catch (error) {
                        console.warn(`Could not set value for field ${key}:`, error);
                        console.warn(`Field details:`, {
                            type: field.type,
                            tagName: field.tagName,
                            id: field.id,
                            name: field.name
                        });
                    }
                }
            } else {
                console.warn(`Field not found: ${key}`);
            }
        }
    
        // Clear media preview since file inputs cannot be restored
        clearMediaPreview();
        
        // Update character counter
        updateCharacterCounter();
    } catch (error) {
        console.error('Error loading draft data:', error);
        // Clear corrupted draft data
        localStorage.removeItem('testimonialDraft');
        showNotification('Error loading draft. Draft data has been cleared.', 'error');
    }
}

// Function to clear media preview
function clearMediaPreview() {
    const fileInput = document.getElementById('mediaUpload');
    const preview = document.getElementById('mediaPreview');
    
    if (fileInput) {
        fileInput.value = ''; // This is allowed for file inputs
    }
    
    if (preview) {
        preview.innerHTML = '';
    }
}

// Function to filter out file input data from draft data
function filterFileInputData(data) {
    const filteredData = {};
    
    // Use for...of loop instead of forEach for consistency
    for (const key of Object.keys(data)) {
        const field = document.getElementById(key);
        
        // Additional safety checks for file-related fields
        const isFileRelated = key.toLowerCase().includes('upload') || 
                             key.toLowerCase().includes('file') || 
                             key.toLowerCase().includes('media') ||
                             (field && field.type === 'file');
        
        if (!isFileRelated) {
            filteredData[key] = data[key];

        } else {
            console.log(`Filtering out file-related field: ${key} (type: ${field ? field.type : 'unknown'})`);
        }
    }
    
    console.log('Filtered data keys:', Object.keys(filteredData));
    return filteredData;
}

// Function to clean up old draft data format
function cleanDraftData(data) {
    const cleanedData = {};
    
    // Map old field names to new IDs if they exist
    const fieldNameToIdMap = {
        'fullName': 'fullName',
        'age': 'age',
        'email': 'email',
        'phone': 'phone',
        'condition': 'condition',
        'treatmentType': 'treatmentType',
        'treatmentDuration': 'treatmentDuration',
        'specialist': 'specialist',
        'beforeCondition': 'beforeCondition',
        'treatmentExperience': 'treatmentExperience',
        'results': 'results',
        'testimonialText': 'testimonialText',
        'additionalComments': 'additionalComments',
        'rating': 'rating',
        'recommend': 'recommend',
        'consent': 'consent',
        'anonymous': 'anonymous',
        'contactPermission': 'contactPermission'
    };
    
    // Use for...of loop instead of forEach to support continue statements
    for (const key of Object.keys(data)) {
        // Skip file-related fields completely
        if (key.toLowerCase().includes('upload') || 
            key.toLowerCase().includes('file') || 
            key.toLowerCase().includes('media')) {

            continue;
        }
        
        // Map old field names to new IDs
        const newKey = fieldNameToIdMap[key] || key;
        cleanedData[newKey] = data[key];
    }
    
    return cleanedData;
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

// Add helpful console commands for debugging

console.log('%c• clearTestimonialDraft() - Clear draft data', 'color: #f39c12; font-size: 12px;');
console.log('%c• forceClearTestimonialDraft() - Force clear all draft data', 'color: #f39c12; font-size: 12px;');
console.log('%c• localStorage.getItem("testimonialDraft") - View current draft data', 'color: #f39c12; font-size: 12px;');
console.log('%c• updateCharacterCounter() - Manually update character counter', 'color: #f39c12; font-size: 12px;');

// Export all necessary functions to global scope for HTML access
window.submitTestimonial = submitTestimonial;
window.validateForm = validateForm;
window.showNotification = showNotification;
window.loadDraftData = loadDraftData;
window.clearTestimonialDraft = clearTestimonialDraft;
window.forceClearTestimonialDraft = forceClearTestimonialDraft;
window.submitForm = submitForm;
window.showPreviewModal = showPreviewModal;
window.showSuccessModal = showSuccessModal;
window.validateField = validateField;
window.clearAllErrors = clearAllErrors;
window.clearFieldError = clearFieldError;
window.showFieldError = showFieldError;
window.initializeTranslation = initializeTranslation;
window.setLanguage = setLanguage;
window.initializeForm = initializeForm;
window.initializeCharacterCounter = initializeCharacterCounter;
window.updateCharacterCounter = updateCharacterCounter;
window.initializeRatingSystem = initializeRatingSystem;
window.initializePreview = initializePreview;
window.initializeAnimations = initializeAnimations;
window.initializeMediaUpload = initializeMediaUpload;
window.initializeDraftButton = initializeDraftButton;
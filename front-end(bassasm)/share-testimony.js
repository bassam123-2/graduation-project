// Professional Share Testimony Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize all functionality
        initializeForm();
        initializeCharacterCounter();
        initializeRatingSystem();
        initializePreview();
        initializeAnimations();
        initializeMediaUpload();
        initializeDraftButton();
    } catch (e) {
        document.body.innerHTML = '<div style="color:red;text-align:center;margin-top:50px;font-size:1.5em;">An error occurred loading the form. Please refresh the page or contact support.<br><br>' + e.message + '</div>';
    }
});

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
            ratingLabel.textContent = `${rating} out of 5 stars`;
            
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
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone format (if provided)
    const phoneField = document.getElementById('phone');
    if (phoneField.value && !isValidPhone(phoneField.value)) {
        showFieldError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate age (if provided)
    const ageField = document.getElementById('age');
    if (ageField.value) {
        const age = parseInt(ageField.value);
        if (age < 1 || age > 120) {
            showFieldError(ageField, 'Please enter a valid age between 1 and 120');
            isValid = false;
        }
    }
    
    return isValid;
}

// Individual field validation
function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
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
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
    
    // Reset form
    document.getElementById('testimonialForm').reset();
    document.getElementById('charCount').textContent = '0';
    document.querySelector('.rating-label').textContent = 'Click to rate';
    
    // Reset star colors
    const stars = document.querySelectorAll('.rating-stars label');
    stars.forEach(star => {
        star.style.color = '#ddd';
    });
}

// Show preview modal
function showPreviewModal() {
    const modal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    
    // Generate preview content
    const data = getFormData();
    previewContent.innerHTML = generatePreviewHTML(data);
    
    modal.style.display = 'block';
}

// Generate preview HTML
function generatePreviewHTML(data) {
    const rating = data.rating || 'Not rated';
    const stars = '★'.repeat(parseInt(rating)) + '☆'.repeat(5 - parseInt(rating));
    
    return `
        <div class="preview-testimonial">
            <h3>${data.fullName || 'Anonymous'}</h3>
            <div class="preview-meta">
                <p><strong>Age:</strong> ${data.age || 'Not specified'}</p>
                <p><strong>Condition:</strong> ${data.condition || 'Not specified'}</p>
                <p><strong>Treatment:</strong> ${data.treatmentType || 'Not specified'}</p>
                <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
            </div>
            <div class="preview-content-section">
                <h4>Before Treatment:</h4>
                <p>${data.beforeCondition || 'Not specified'}</p>
            </div>
            <div class="preview-content-section">
                <h4>Treatment Experience:</h4>
                <p>${data.treatmentExperience || 'Not specified'}</p>
            </div>
            <div class="preview-content-section">
                <h4>Results:</h4>
                <p>${data.results || 'Not specified'}</p>
            </div>
            <div class="preview-content-section">
                <h4>Testimonial:</h4>
                <p>${data.testimonialText || 'Not specified'}</p>
            </div>
            <div class="preview-content-section">
                <h4>Recommendation:</h4>
                <p>${data.recommend || 'Not specified'}</p>
            </div>
            ${data.additionalComments ? `
            <div class="preview-content-section">
                <h4>Additional Comments:</h4>
                <p>${data.additionalComments}</p>
            </div>
            ` : ''}
        </div>
    `;
}

// Close modal
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Close preview modal
function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// Submit form (called from preview modal)
function submitForm() {
    closePreviewModal();
    showSuccessModal();
    console.log('Form submitted:', getFormData());
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
    
    // Add fade-in class to sections
    const sections = document.querySelectorAll('.form-section, .benefit-card');
    sections.forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.animationDelay = `${index * 0.1}s`;
    });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const successModal = document.getElementById('successModal');
    const previewModal = document.getElementById('previewModal');
    
    if (event.target === successModal) {
        closeModal();
    }
    
    if (event.target === previewModal) {
        closePreviewModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closePreviewModal();
    }
});

// File upload preview
function initializeMediaUpload() {
    const mediaInput = document.getElementById('mediaUpload');
    const preview = document.getElementById('mediaPreview');
    if (!mediaInput || !preview) return;
    mediaInput.addEventListener('change', function() {
        preview.innerHTML = '';
        const file = this.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.display = 'block';
            img.style.margin = '10px auto';
            preview.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.style.maxWidth = '300px';
            video.style.maxHeight = '200px';
            video.style.display = 'block';
            video.style.margin = '10px auto';
            preview.appendChild(video);
        } else {
            preview.textContent = 'Unsupported file type.';
        }
    });
}

// Save as Draft button logic
function initializeDraftButton() {
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const draftMessage = document.getElementById('draftMessage');
    if (!saveDraftBtn || !draftMessage) return;
    saveDraftBtn.addEventListener('click', function() {
        autoSaveForm();
        draftMessage.style.display = 'block';
        setTimeout(() => { draftMessage.style.display = 'none'; }, 2000);
    });
}

// Auto-save form data every 30 seconds
setInterval(autoSaveForm, 30000);

// Load auto-saved data on page load
document.addEventListener('DOMContentLoaded', loadAutoSavedData);

// Clear auto-saved data after successful submission
function clearAutoSavedData() {
    localStorage.removeItem('testimonialDraft');
}

// Enhanced form submission with auto-save clearing
const originalSubmitForm = submitForm;
submitForm = function() {
    clearAutoSavedData();
    originalSubmitForm();
}; 
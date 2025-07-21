// AI Symptom Assessment & Therapy Preview System
// Advanced JavaScript for AL-BOQAI Center Graduation Project

class SymptomAssessment {
    constructor() {
        this.currentStep = 1;
        this.selectedCategory = null;
        this.selectedSymptoms = [];
        this.userData = {};
        this.analysisResults = null;
        this.currentLanguage = localStorage.getItem('lang') || 'en';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSymptomDatabase();
        this.initialize3DPreview();
        console.log('✅ AI Symptom Assessment System initialized');
    }

    setupEventListeners() {
        // Form validation
        document.getElementById('age').addEventListener('change', () => this.validateStep(1));
        document.getElementById('gender').addEventListener('change', () => this.validateStep(1));
        
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.updateLanguage();
        });
    }

    updateLanguage() {
        // Update symptom details if they're currently displayed
        if (this.selectedCategory && this.currentStep >= 3) {
            this.loadSymptomDetails();
        }
        
        // Update results if they're displayed
        if (this.analysisResults) {
            this.displayResults();
        }
    }

    loadSymptomDatabase() {
        // Comprehensive symptom database for AI analysis with bilingual support
        this.symptomDatabase = {
            pain: {
                name: { en: 'Pain & Discomfort', ar: 'الألم وعدم الراحة' },
                icon: 'fas fa-pain',
                symptoms: [
                    { id: 'back_pain', name: { en: 'Back Pain', ar: 'آلام الظهر' }, severity: 'moderate', treatments: ['manual_therapy', 'physical_therapy'] },
                    { id: 'neck_pain', name: { en: 'Neck Pain', ar: 'آلام الرقبة' }, severity: 'moderate', treatments: ['manual_therapy', 'physical_therapy'] },
                    { id: 'joint_pain', name: { en: 'Joint Pain', ar: 'آلام المفاصل' }, severity: 'moderate', treatments: ['physical_therapy', 'rehabilitation'] },
                    { id: 'muscle_pain', name: { en: 'Muscle Pain', ar: 'آلام العضلات' }, severity: 'mild', treatments: ['manual_therapy', 'physical_therapy'] },
                    { id: 'headache', name: { en: 'Headache', ar: 'الصداع' }, severity: 'mild', treatments: ['manual_therapy'] },
                    { id: 'shoulder_pain', name: { en: 'Shoulder Pain', ar: 'آلام الكتف' }, severity: 'moderate', treatments: ['manual_therapy', 'physical_therapy'] }
                ]
            },
            mobility: {
                name: { en: 'Mobility Issues', ar: 'مشاكل الحركة' },
                icon: 'fas fa-walking',
                symptoms: [
                    { id: 'walking_difficulty', name: { en: 'Difficulty Walking', ar: 'صعوبة في المشي' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'balance_problems', name: { en: 'Balance Problems', ar: 'مشاكل في التوازن' }, severity: 'moderate', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'stiffness', name: { en: 'Joint Stiffness', ar: 'تصلب المفاصل' }, severity: 'moderate', treatments: ['manual_therapy', 'physical_therapy'] },
                    { id: 'weakness', name: { en: 'Muscle Weakness', ar: 'ضعف العضلات' }, severity: 'moderate', treatments: ['physical_therapy', 'rehabilitation'] },
                    { id: 'coordination', name: { en: 'Poor Coordination', ar: 'ضعف التنسيق' }, severity: 'moderate', treatments: ['rehabilitation', 'physical_therapy'] }
                ]
            },
            neurological: {
                name: { en: 'Neurological Conditions', ar: 'الأمراض العصبية' },
                icon: 'fas fa-brain',
                symptoms: [
                    { id: 'stroke_recovery', name: { en: 'Stroke Recovery', ar: 'التعافي من السكتة الدماغية' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'cerebral_palsy', name: { en: 'Cerebral Palsy', ar: 'الشلل الدماغي' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'multiple_sclerosis', name: { en: 'Multiple Sclerosis', ar: 'التصلب المتعدد' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'parkinsons', name: { en: 'Parkinson\'s Disease', ar: 'مرض باركنسون' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'nerve_damage', name: { en: 'Nerve Damage', ar: 'تلف الأعصاب' }, severity: 'moderate', treatments: ['physical_therapy', 'rehabilitation'] }
                ]
            },
            developmental: {
                name: { en: 'Developmental Issues', ar: 'المشاكل التطورية' },
                icon: 'fas fa-baby',
                symptoms: [
                    { id: 'birth_injury', name: { en: 'Birth Injury', ar: 'إصابة الولادة' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'development_delay', name: { en: 'Developmental Delay', ar: 'تأخر النمو' }, severity: 'moderate', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'cerebral_palsy_child', name: { en: 'Cerebral Palsy (Child)', ar: 'الشلل الدماغي (طفل)' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'oxygen_deficiency', name: { en: 'Oxygen Deficiency', ar: 'نقص الأكسجين' }, severity: 'severe', treatments: ['rehabilitation', 'physical_therapy'] },
                    { id: 'brachial_plexus', name: { en: 'Brachial Plexus Injury', ar: 'إصابة الضفيرة العضدية' }, severity: 'severe', treatments: ['rehabilitation', 'manual_therapy'] }
                ]
            }
        };
    }

    // Step Navigation
    nextStep(currentStep) {
        if (!this.validateStep(currentStep)) return;

        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.getElementById(`step-${currentStep + 1}`).classList.add('active');
        this.currentStep = currentStep + 1;

        if (currentStep === 1) {
            this.loadSymptomCategories();
        } else if (currentStep === 2) {
            this.loadSymptomDetails();
        }
    }

    prevStep(currentStep) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.getElementById(`step-${currentStep - 1}`).classList.add('active');
        this.currentStep = currentStep - 1;
    }

    validateStep(step) {
        if (step === 1) {
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            
            if (!age || !gender) {
                const message = this.currentLanguage === 'ar' ? 
                    'يرجى ملء جميع الحقول المطلوبة' : 
                    'Please fill in all required fields';
                this.showNotification(message, 'warning');
                return false;
            }
            
            this.userData.age = age;
            this.userData.gender = gender;
            return true;
        }
        return true;
    }

    // Symptom Selection
    selectCategory(category) {
        this.selectedCategory = category;
        
        // Update UI
        document.querySelectorAll('.symptom-category').forEach(cat => {
            cat.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        // Enable next step
        setTimeout(() => this.nextStep(2), 500);
    }

    loadSymptomCategories() {
        // Categories are already in HTML, just ensure they're visible
        console.log('Symptom categories loaded');
    }

    getLocalizedText(textObj) {
        if (typeof textObj === 'string') return textObj;
        return textObj[this.currentLanguage] || textObj.en || textObj;
    }

    loadSymptomDetails() {
        if (!this.selectedCategory) return;

        const symptoms = this.symptomDatabase[this.selectedCategory].symptoms;
        const container = document.getElementById('symptom-details');
        
        const severityText = this.currentLanguage === 'ar' ? 'الشدة' : 'Severity';
        
        container.innerHTML = symptoms.map(symptom => `
            <div class="symptom-item" onclick="assessment.selectSymptom('${symptom.id}')">
                <h4>${this.getLocalizedText(symptom.name)}</h4>
                <p>${severityText}: ${this.getSeverityLabel(symptom.severity)}</p>
            </div>
        `).join('');
    }

    selectSymptom(symptomId) {
        const symptom = this.symptomDatabase[this.selectedCategory].symptoms.find(s => s.id === symptomId);
        
        if (this.selectedSymptoms.find(s => s.id === symptomId)) {
            // Remove if already selected
            this.selectedSymptoms = this.selectedSymptoms.filter(s => s.id !== symptomId);
            event.currentTarget.classList.remove('selected');
        } else {
            // Add if not selected
            this.selectedSymptoms.push(symptom);
            event.currentTarget.classList.add('selected');
        }
    }

    getSeverityLabel(severity) {
        const labels = {
            en: {
                mild: 'Mild',
                moderate: 'Moderate',
                severe: 'Severe'
            },
            ar: {
                mild: 'خفيف',
                moderate: 'متوسط',
                severe: 'شديد'
            }
        };
        return labels[this.currentLanguage]?.[severity] || labels.en[severity] || severity;
    }

    // AI Analysis
    async analyzeSymptoms() {
        if (this.selectedSymptoms.length === 0) {
            const message = this.currentLanguage === 'ar' ? 
                'يرجى اختيار عرض واحد على الأقل' : 
                'Please select at least one symptom';
            this.showNotification(message, 'warning');
            return;
        }

        // Show loading state
        const analyzeBtn = document.querySelector('.analyze-btn');
        const loadingText = this.currentLanguage === 'ar' ? 'جاري التحليل...' : 'Analyzing...';
        const analyzeText = this.currentLanguage === 'ar' ? 'تحليل الأعراض' : 'Analyze Symptoms';
        
        analyzeBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        analyzeBtn.classList.add('analyzing');

        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Perform AI analysis
        this.analysisResults = this.performAIAnalysis();
        
        // Display results
        this.displayResults();
        
        // Reset button
        analyzeBtn.innerHTML = `<i class="fas fa-search"></i> ${analyzeText}`;
        analyzeBtn.classList.remove('analyzing');
    }

    performAIAnalysis() {
        // Advanced AI analysis algorithm
        const analysis = {
            diagnosis: this.generateDiagnosis(),
            recommendations: this.generateRecommendations(),
            confidence: this.calculateConfidence(),
            urgency: this.calculateUrgency(),
            estimatedSessions: this.estimateSessions()
        };

        return analysis;
    }

    generateDiagnosis() {
        const symptoms = this.selectedSymptoms;
        const severity = this.calculateOverallSeverity();
        
        const translations = {
            en: {
                basedOn: 'Based on your symptoms, you appear to be experiencing ',
                serious: 'a serious condition that requires immediate attention. ',
                moderate: 'a moderate condition that can be effectively treated. ',
                mild: 'a mild condition that should improve with proper treatment. ',
                combination: 'The combination of ',
                suggests: ' suggests ',
                neurological: 'a neurological condition that requires specialized rehabilitation.',
                developmental: 'a developmental condition that benefits from early intervention.',
                mobility: 'a mobility issue that can be addressed through targeted therapy.',
                musculoskeletal: 'a musculoskeletal condition that responds well to physical therapy.'
            },
            ar: {
                basedOn: 'بناءً على أعراضك، يبدو أنك تعاني من ',
                serious: 'حالة خطيرة تتطلب اهتماماً فورياً. ',
                moderate: 'حالة متوسطة يمكن علاجها بفعالية. ',
                mild: 'حالة خفيفة يجب أن تتحسن مع العلاج المناسب. ',
                combination: 'مزيج من ',
                suggests: ' يشير إلى ',
                neurological: 'حالة عصبية تتطلب إعادة تأهيل متخصصة.',
                developmental: 'حالة تطورية تستفيد من التدخل المبكر.',
                mobility: 'مشكلة في الحركة يمكن معالجتها من خلال العلاج الموجه.',
                musculoskeletal: 'حالة عضلية هيكلية تستجيب جيداً للعلاج الطبيعي.'
            }
        };
        
        const t = translations[this.currentLanguage];
        let diagnosis = t.basedOn;
        
        if (severity === 'severe') {
            diagnosis += t.serious;
        } else if (severity === 'moderate') {
            diagnosis += t.moderate;
        } else {
            diagnosis += t.mild;
        }

        diagnosis += t.combination + symptoms.map(s => this.getLocalizedText(s.name).toLowerCase()).join(', ') + t.suggests;
        
        // AI-based condition matching
        if (this.selectedCategory === 'neurological') {
            diagnosis += t.neurological;
        } else if (this.selectedCategory === 'developmental') {
            diagnosis += t.developmental;
        } else if (this.selectedCategory === 'mobility') {
            diagnosis += t.mobility;
        } else {
            diagnosis += t.musculoskeletal;
        }

        return diagnosis;
    }

    generateRecommendations() {
        const treatments = this.getRecommendedTreatments();
        const recommendations = [];

        treatments.forEach(treatment => {
            const treatmentInfo = this.getTreatmentInfo(treatment);
            recommendations.push({
                type: treatment,
                name: treatmentInfo.name,
                description: treatmentInfo.description,
                effectiveness: treatmentInfo.effectiveness,
                duration: treatmentInfo.duration
            });
        });

        return recommendations;
    }

    getRecommendedTreatments() {
        const allTreatments = this.selectedSymptoms.flatMap(s => s.treatments);
        const treatmentCount = {};
        
        allTreatments.forEach(treatment => {
            treatmentCount[treatment] = (treatmentCount[treatment] || 0) + 1;
        });

        // Return top 2 most recommended treatments
        return Object.entries(treatmentCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([treatment]) => treatment);
    }

    getTreatmentInfo(treatment) {
        const treatments = {
            manual_therapy: {
                name: { en: 'Manual Therapy', ar: 'العلاج اليدوي' },
                description: { 
                    en: 'Hands-on treatment techniques to reduce pain and improve mobility',
                    ar: 'تقنيات علاج يدوية لتقليل الألم وتحسين الحركة'
                },
                effectiveness: '85%',
                duration: { en: '6-12 sessions', ar: '6-12 جلسة' }
            },
            physical_therapy: {
                name: { en: 'Physical Therapy', ar: 'العلاج الطبيعي' },
                description: { 
                    en: 'Exercise-based treatment to strengthen muscles and improve function',
                    ar: 'علاج قائم على التمارين لتقوية العضلات وتحسين الوظيفة'
                },
                effectiveness: '90%',
                duration: { en: '8-16 sessions', ar: '8-16 جلسة' }
            },
            rehabilitation: {
                name: { en: 'Comprehensive Rehabilitation', ar: 'إعادة التأهيل الشاملة' },
                description: { 
                    en: 'Multi-disciplinary approach for complex conditions',
                    ar: 'نهج متعدد التخصصات للحالات المعقدة'
                },
                effectiveness: '95%',
                duration: { en: '12-24 sessions', ar: '12-24 جلسة' }
            }
        };
        
        const treatmentInfo = treatments[treatment];
        if (!treatmentInfo) return treatments.manual_therapy;
        
        return {
            name: this.getLocalizedText(treatmentInfo.name),
            description: this.getLocalizedText(treatmentInfo.description),
            effectiveness: treatmentInfo.effectiveness,
            duration: this.getLocalizedText(treatmentInfo.duration)
        };
    }

    calculateConfidence() {
        // AI confidence calculation based on symptom clarity and consistency
        let confidence = 75; // Base confidence
        
        // Increase confidence based on number of symptoms
        confidence += this.selectedSymptoms.length * 5;
        
        // Increase confidence for specific categories
        if (this.selectedCategory === 'neurological' || this.selectedCategory === 'developmental') {
            confidence += 10;
        }
        
        // Cap at 95%
        return Math.min(confidence, 95);
    }

    calculateUrgency() {
        const severity = this.calculateOverallSeverity();
        const urgencyLevels = {
            en: {
                mild: 'Low',
                moderate: 'Medium',
                severe: 'High'
            },
            ar: {
                mild: 'منخفض',
                moderate: 'متوسط',
                severe: 'عالي'
            }
        };
        return urgencyLevels[this.currentLanguage]?.[severity] || urgencyLevels.en[severity];
    }

    calculateOverallSeverity() {
        const severities = this.selectedSymptoms.map(s => s.severity);
        const severityScores = { mild: 1, moderate: 2, severe: 3 };
        const avgScore = severities.reduce((sum, s) => sum + severityScores[s], 0) / severities.length;
        
        if (avgScore >= 2.5) return 'severe';
        if (avgScore >= 1.5) return 'moderate';
        return 'mild';
    }

    estimateSessions() {
        const severity = this.calculateOverallSeverity();
        const sessionRanges = {
            en: {
                mild: '4-8 sessions',
                moderate: '8-16 sessions',
                severe: '16-24 sessions'
            },
            ar: {
                mild: '4-8 جلسات',
                moderate: '8-16 جلسة',
                severe: '16-24 جلسة'
            }
        };
        return sessionRanges[this.currentLanguage]?.[severity] || sessionRanges.en[severity];
    }

    // Display Results
    displayResults() {
        // Show results section
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('preview-section').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'flex';

        // Update diagnosis
        const urgencyText = this.currentLanguage === 'ar' ? 'مستوى الاستعجال' : 'Urgency Level';
        const sessionsText = this.currentLanguage === 'ar' ? 'الجلسات المقدرة' : 'Estimated Sessions';
        
        document.getElementById('diagnosis-content').innerHTML = `
            <p>${this.analysisResults.diagnosis}</p>
            <div class="diagnosis-details">
                <div class="detail-item">
                    <strong>${urgencyText}:</strong> ${this.analysisResults.urgency}
                </div>
                <div class="detail-item">
                    <strong>${sessionsText}:</strong> ${this.analysisResults.estimatedSessions}
                </div>
            </div>
        `;

        // Update recommendations
        const effectivenessText = this.currentLanguage === 'ar' ? 'الفعالية' : 'Effectiveness';
        const durationText = this.currentLanguage === 'ar' ? 'المدة' : 'Duration';
        
        const recommendationsHtml = this.analysisResults.recommendations.map(rec => `
            <div class="recommendation-item">
                <h4>${rec.name}</h4>
                <p>${rec.description}</p>
                <div class="recommendation-stats">
                    <span class="effectiveness">${effectivenessText}: ${rec.effectiveness}</span>
                    <span class="duration">${durationText}: ${rec.duration}</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('therapy-recommendations').innerHTML = recommendationsHtml;

        // Update confidence meter
        const confidenceFill = document.getElementById('confidence-fill');
        const confidenceText = document.getElementById('confidence-text');
        
        confidenceFill.style.width = `${this.analysisResults.confidence}%`;
        confidenceText.textContent = `${this.analysisResults.confidence}%`;

        // Scroll to results
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }

    // 3D Preview System
    initialize3DPreview() {
        this.currentPreview = null;
        this.previewData = {
            manual: {
                title: 'Manual Therapy',
                description: 'Hands-on treatment techniques including joint mobilization, soft tissue techniques, and myofascial release.',
                benefits: ['Pain relief', 'Improved mobility', 'Reduced stiffness', 'Faster recovery'],
                duration: '30-60 minutes per session',
                frequency: '2-3 times per week'
            },
            physical: {
                title: 'Physical Therapy',
                description: 'Exercise-based treatment focusing on strengthening, flexibility, and functional movement.',
                benefits: ['Muscle strengthening', 'Improved balance', 'Better coordination', 'Enhanced function'],
                duration: '45-60 minutes per session',
                frequency: '2-4 times per week'
            },
            rehabilitation: {
                title: 'Comprehensive Rehabilitation',
                description: 'Multi-disciplinary approach combining various therapeutic techniques for complex conditions.',
                benefits: ['Holistic treatment', 'Long-term improvement', 'Functional independence', 'Quality of life'],
                duration: '60-90 minutes per session',
                frequency: '3-5 times per week'
            }
        };
    }

    showPreview(type) {
        // Update active button
        document.querySelectorAll('.preview-btn').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');

        // Update preview content
        const data = this.previewData[type];
        const canvas = document.getElementById('preview-canvas');
        const info = document.getElementById('preview-info');

        // Create 3D preview (simplified for demo)
        canvas.innerHTML = `
            <div class="preview-3d">
                <div class="preview-scene">
                    <div class="preview-object ${type}-object">
                        <i class="fas ${this.getPreviewIcon(type)}"></i>
                    </div>
                    <div class="preview-particles"></div>
                </div>
                <div class="preview-overlay">
                    <h3>${data.title}</h3>
                    <p>Interactive 3D Preview</p>
                </div>
            </div>
        `;

        // Update info panel
        info.innerHTML = `
            <h3>${data.title}</h3>
            <p>${data.description}</p>
            <div class="preview-benefits">
                <h4>Benefits:</h4>
                <ul>
                    ${data.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
            <div class="preview-details">
                <div class="detail">
                    <strong>Session Duration:</strong> ${data.duration}
                </div>
                <div class="detail">
                    <strong>Frequency:</strong> ${data.frequency}
                </div>
            </div>
        `;

        this.currentPreview = type;
        this.animatePreview();
    }

    getPreviewIcon(type) {
        const icons = {
            manual: 'fa-hands',
            physical: 'fa-dumbbell',
            rehabilitation: 'fa-heart'
        };
        return icons[type] || 'fa-vr-cardboard';
    }

    animatePreview() {
        const object = document.querySelector('.preview-object');
        if (object) {
            object.style.animation = 'previewFloat 3s ease-in-out infinite';
        }
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Action Functions
    bookAppointment() {
        // Redirect to booking page with pre-filled data
        const params = new URLSearchParams({
            service: this.analysisResults.recommendations[0].type,
            assessment: 'true'
        });
        window.location.href = `book appointment/book.html?${params}`;
    }

    downloadReport() {
        // Generate and download assessment report
        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AL-BOQAI_Assessment_Report.txt';
        a.click();
        
        URL.revokeObjectURL(url);
        const message = this.currentLanguage === 'ar' ? 
            'تم تحميل التقرير بنجاح' : 
            'Report downloaded successfully';
        this.showNotification(message, 'success');
    }

    generateReport() {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        
        return `AL-BOQAI CENTER - AI ASSESSMENT REPORT
Generated on: ${date} at ${time}

PATIENT INFORMATION:
Age Range: ${this.userData.age}
Gender: ${this.userData.gender}

ASSESSMENT RESULTS:
Selected Category: ${this.symptomDatabase[this.selectedCategory].name}
Selected Symptoms: ${this.selectedSymptoms.map(s => s.name).join(', ')}

AI DIAGNOSIS:
${this.analysisResults.diagnosis}

RECOMMENDATIONS:
${this.analysisResults.recommendations.map(rec => 
    `${rec.name}:
    - Description: ${rec.description}
    - Effectiveness: ${rec.effectiveness}
    - Duration: ${rec.duration}`
).join('\n\n')}

ASSESSMENT METRICS:
Confidence Level: ${this.analysisResults.confidence}%
Urgency Level: ${this.analysisResults.urgency}
Estimated Sessions: ${this.analysisResults.estimatedSessions}

This report was generated by AL-BOQAI Center's AI Assessment System.
For professional medical advice, please consult with our specialists.

Contact: +962775252444
Email: alboqaiworld@gmail.com`;
    }

    restartAssessment() {
        // Reset all data and go back to step 1
        this.currentStep = 1;
        this.selectedCategory = null;
        this.selectedSymptoms = [];
        this.userData = {};
        this.analysisResults = null;

        // Reset UI
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-1').classList.add('active');
        
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('preview-section').style.display = 'none';
        document.getElementById('action-buttons').style.display = 'none';

        // Reset form
        document.getElementById('age').value = '';
        document.getElementById('gender').value = '';
        
        // Reset selections
        document.querySelectorAll('.symptom-category').forEach(cat => cat.classList.remove('selected'));
        document.querySelectorAll('.symptom-item').forEach(item => item.classList.remove('selected'));

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const message = this.currentLanguage === 'ar' ? 
            'تم إعادة تشغيل التقييم' : 
            'Assessment restarted';
        this.showNotification(message, 'info');
    }
}

// Initialize the assessment system
let assessment;
document.addEventListener('DOMContentLoaded', function() {
    assessment = new SymptomAssessment();
});

// Global functions for HTML onclick events
function nextStep(step) { assessment.nextStep(step); }
function prevStep(step) { assessment.prevStep(step); }
function selectCategory(category) { assessment.selectCategory(category); }
function selectSymptom(symptomId) { assessment.selectSymptom(symptomId); }
function analyzeSymptoms() { assessment.analyzeSymptoms(); }
function showPreview(type) { assessment.showPreview(type); }
function bookAppointment() { assessment.bookAppointment(); }
function downloadReport() { assessment.downloadReport(); }
function restartAssessment() { assessment.restartAssessment(); }

// Add CSS for notifications and 3D preview animations
const additionalCSS = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 15px 20px;
    box-shadow: 0 5px 20px var(--shadow-color);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification.show {
    transform: translateX(0);
}

.notification-warning {
    border-left: 4px solid var(--warning-color);
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.preview-3d {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(42, 93, 159, 0.1) 0%, rgba(29, 64, 110, 0.1) 100%);
    border-radius: 10px;
}

.preview-scene {
    position: relative;
    width: 200px;
    height: 200px;
}

.preview-object {
    width: 100px;
    height: 100px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: white;
    font-size: 2em;
    box-shadow: 0 10px 30px rgba(42, 93, 159, 0.3);
}

@keyframes previewFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

.preview-overlay {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px 25px;
    border-radius: 25px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.preview-benefits ul {
    list-style: none;
    padding: 0;
}

.preview-benefits li {
    padding: 5px 0;
    position: relative;
    padding-left: 20px;
}

.preview-benefits li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--success-color);
    font-weight: bold;
}

.preview-details {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.preview-details .detail {
    margin: 10px 0;
    padding: 10px;
    background: var(--surface-color);
    border-radius: 8px;
}

.diagnosis-details {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.detail-item {
    margin: 10px 0;
    padding: 10px;
    background: var(--surface-color);
    border-radius: 8px;
}

.recommendation-item {
    background: var(--surface-color);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    border: 1px solid var(--border-color);
}

.recommendation-item h4 {
    color: var(--primary-color);
    margin-bottom: 10px;
}

.recommendation-stats {
    display: flex;
    gap: 20px;
    margin-top: 15px;
}

.recommendation-stats span {
    background: var(--primary-color);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.9em;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style); 
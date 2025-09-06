// Translation System for AL-BOQAI Center Patient Dashboard

// Flag to prevent multiple initializations
let isInitialized = false;

// Translation data
const translations = {
    en: {
        // Navigation
        dashboard: 'Dashboard',
        bookAppointment: 'Book Appointment',
        aiAssessment: 'AI Assessment',
        successStories: 'Success Stories',
        profile: 'Profile',
        shareTestimony: 'Share Testimony',
        
        // Welcome Section
        welcomeBack: 'Welcome back,',
        healthJourneyOverview: "Here's your health journey overview",
        totalAppointments: 'Total Appointments',
        upcoming: 'Upcoming',
        progress: 'Progress',
        
        // Dashboard Cards
        quickActions: 'Quick Actions',
        upcomingAppointments: 'Upcoming Appointments',
        treatmentProgress: 'Treatment Progress',
        healthInsights: 'Health Insights',
        recentActivity: 'Recent Activity',
        profileSummary: 'Profile Summary',
        
        // Quick Actions
        bookAppointmentAction: 'Book Appointment',
        aiAssessmentAction: 'AI Assessment',
        treatmentPlan: 'Treatment Plan',
        shareExperience: 'Share Experience',
        
        // Progress
        sessionsCompleted: 'Sessions Completed',
        nextSession: 'Next Session',
        recoveryGoal: 'Recovery Goal',
        complete: 'Complete',
        inProgress: 'In Progress',
        notScheduled: 'Not scheduled',
        
        // Health Insights
        stayConsistent: 'Stay Consistent',
        stayConsistentText: 'Regular therapy sessions show better recovery outcomes',
        exerciseReminder: 'Exercise Reminder',
        exerciseReminderText: "Don't forget your daily exercises for optimal recovery",
        scheduleCheckup: 'Schedule Check-up',
        scheduleCheckupText: "It's time for your monthly progress evaluation",
        
        // Profile
        editProfile: 'Edit Profile',
        refresh: 'Refresh',
        notSpecified: 'Not specified',
        notProvided: 'Not provided',
        memberSince: 'Member since',
        
        // Actions
        viewAll: 'View All',
        loading: 'Loading...',
        loadingAppointments: 'Loading appointments...',
        loadingActivity: 'Loading activity...',
        
        // Footer
        centerName: 'AL-BOQAI Center',
        journeyStart: 'Your journey to recovery starts here',
        contact: 'Contact',
        followUs: 'Follow Us',
        allRightsReserved: 'All rights reserved.',
        
        // Notifications
        languageChanged: 'Language changed to English',
        profileComingSoon: 'Profile page coming soon!',
        settingsComingSoon: 'Settings page coming soon!'
    },
    ar: {
        // Navigation
        dashboard: 'لوحة التحكم',
        bookAppointment: 'احجز موعد',
        aiAssessment: 'تقييم الذكاء الاصطناعي',
        successStories: 'قصص النجاح',
        profile: 'الملف الشخصي',
        shareTestimony: 'شارك تجربتك',
        
        // Welcome Section
        welcomeBack: 'مرحباً بعودتك،',
        healthJourneyOverview: 'إليك نظرة عامة على رحلتك الصحية',
        totalAppointments: 'إجمالي المواعيد',
        upcoming: 'القادمة',
        progress: 'التقدم',
        
        // Dashboard Cards
        quickActions: 'إجراءات سريعة',
        upcomingAppointments: 'المواعيد القادمة',
        treatmentProgress: 'تقدم العلاج',
        healthInsights: 'رؤى صحية',
        recentActivity: 'النشاط الأخير',
        profileSummary: 'ملخص الملف الشخصي',
        
        // Quick Actions
        bookAppointmentAction: 'احجز موعد',
        aiAssessmentAction: 'تقييم الذكاء الاصطناعي',
        treatmentPlan: 'خطة العلاج',
        shareExperience: 'شارك تجربتك',
        
        // Progress
        sessionsCompleted: 'الجلسات المكتملة',
        nextSession: 'الجلسة التالية',
        recoveryGoal: 'هدف التعافي',
        complete: 'مكتمل',
        inProgress: 'قيد التنفيذ',
        notScheduled: 'غير مجدول',
        
        // Health Insights
        stayConsistent: 'حافظ على الانتظام',
        stayConsistentText: 'الجلسات العلاجية المنتظمة تظهر نتائج تعافي أفضل',
        exerciseReminder: 'تذكير بالتمارين',
        exerciseReminderText: 'لا تنس تمارينك اليومية للتعافي الأمثل',
        scheduleCheckup: 'جدولة فحص',
        scheduleCheckupText: 'حان وقت تقييم تقدمك الشهري',
        
        // Profile
        editProfile: 'تعديل الملف الشخصي',
        refresh: 'تحديث',
        notSpecified: 'غير محدد',
        notProvided: 'غير متوفر',
        memberSince: 'عضو منذ',
        
        // Actions
        viewAll: 'عرض الكل',
        loading: 'جاري التحميل...',
        loadingAppointments: 'جاري تحميل المواعيد...',
        loadingActivity: 'جاري تحميل النشاط...',
        
        // Footer
        centerName: 'مركز البقاعي',
        journeyStart: 'رحلة تعافيك تبدأ من هنا',
        contact: 'اتصل بنا',
        followUs: 'تابعنا',
        allRightsReserved: 'جميع الحقوق محفوظة.',
        
        // Notifications
        languageChanged: 'تم تغيير اللغة إلى العربية',
        profileComingSoon: 'صفحة الملف الشخصي قريباً!',
        settingsComingSoon: 'صفحة الإعدادات قريباً!'
    }
};

// Language Management Functions
function setLanguage(lang) {
    if (isInitialized && document.documentElement.lang === lang) {

        return;
    }
    
    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
    
    const t = translations[lang];
    if (!t) return;
    
    updateDashboardTranslations(t);
    updateHeaderTranslations(t);
    updateFooterTranslations(t);
    updateLanguageToggleButton(lang);
    updateNavbarAlignment(lang);
    
    isInitialized = true;

}

function updateDashboardTranslations(t) {
    // Welcome section
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        welcomeTitle.innerHTML = `${t.welcomeBack} <span id="patient-name">Patient</span>!`;
    }
    
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    if (welcomeSubtitle) {
        welcomeSubtitle.textContent = t.healthJourneyOverview;
    }
    
    // Stats labels
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = t.totalAppointments;
        statLabels[1].textContent = t.upcoming;
        statLabels[2].textContent = t.progress;
    }
    
    // Card headers
    const cardHeaders = document.querySelectorAll('.card-header h3');
    cardHeaders.forEach(header => {
        const icon = header.querySelector('i');
        const iconClass = icon ? icon.className : '';
        
        if (header.textContent.includes('Quick Actions')) {
            header.innerHTML = `<i class="${iconClass}"></i> ${t.quickActions}`;
        } else if (header.textContent.includes('Upcoming Appointments')) {
            header.innerHTML = `<i class="${iconClass}"></i> ${t.upcomingAppointments}`;
        } else if (header.textContent.includes('Treatment Progress')) {
            header.innerHTML = `<i class="${iconClass}"></i> ${t.treatmentProgress}`;
        } else if (header.textContent.includes('Health Insights')) {
            header.innerHTML = `<i class="${iconClass}"></i> ${t.healthInsights}`;
        } else if (header.textContent.includes('Recent Activity')) {
            header.innerHTML = `<i class="${iconClass}"></i> ${t.recentActivity}`;
        } else if (header.textContent.includes('Profile Summary')) {
            header.innerHTML = `<i class="${iconClass}"></i> ${t.profileSummary}`;
        }
    });
    
    // Quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn span');
    if (quickActionBtns.length >= 4) {
        quickActionBtns[0].textContent = t.bookAppointmentAction;
        quickActionBtns[1].textContent = t.aiAssessmentAction;
        quickActionBtns[2].textContent = t.treatmentPlan;
        quickActionBtns[3].textContent = t.shareExperience;
    }
    
    // View all button
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
        viewAllBtn.textContent = t.viewAll;
    }
    
    // Health insights
    const insightItems = document.querySelectorAll('.insight-item span');
    if (insightItems.length >= 3) {
        insightItems[0].textContent = t.stayConsistentText;
        insightItems[1].textContent = t.exerciseReminderText;
        insightItems[2].textContent = t.scheduleCheckupText;
    }
    
    // Profile actions
    const profileActions = document.querySelectorAll('.profile-actions .icon-btn');
    if (profileActions.length >= 2) {
        profileActions[0].setAttribute('title', t.editProfile);
        profileActions[1].setAttribute('title', t.refresh);
    }
    
    // Loading states
    const loadingElements = document.querySelectorAll('[id*="appointments-list"], [id*="activity-content"]');
    loadingElements.forEach(element => {
        if (element.id === 'appointments-list' && element.innerHTML.includes('Loading')) {
            element.innerHTML = `<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> ${t.loadingAppointments}</div>`;
        } else if (element.id === 'activity-content' && element.innerHTML.includes('Loading')) {
            element.innerHTML = `<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> ${t.loadingActivity}</div>`;
        }
    });
}

function updateHeaderTranslations(t) {
    // Navigation items - be more specific to avoid conflicts
    const navItems = document.querySelectorAll('.navbar a');
    navItems.forEach(item => {
        const text = item.textContent.trim();
        // Only translate if the text is in English (not already translated)
        if (text === 'Dashboard') {
            item.textContent = t.dashboard;
        } else if (text === 'Book Appointment') {
            item.textContent = t.bookAppointment;
        } else if (text === 'AI Assessment') {
            item.textContent = t.aiAssessment;
        } else if (text === 'Success Stories') {
            item.textContent = t.successStories;
        } else if (text === 'Profile') {
            item.textContent = t.profile;
        } else if (text.includes('Share Testimony') && !text.includes('📝')) {
            item.textContent = t.shareTestimony;
        }
        // Don't translate if already in Arabic or mixed
    });
    
    // Dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-menu a');
    dropdownItems.forEach(item => {
        const text = item.textContent.trim();
        if (text === 'View Profile') item.textContent = t.profile;
        else if (text === 'Settings') item.textContent = t.profile;
        else if (text === 'Logout') item.textContent = 'Logout'; // Keep logout in English
    });
}

function updateFooterTranslations(t) {
    const footerSections = document.querySelectorAll('.footer-section h4, .footer-section p');
    footerSections.forEach(element => {
        const text = element.textContent.trim();
        if (text === 'AL-BOQAI Center') element.textContent = t.centerName;
        else if (text === 'Your journey to recovery starts here') element.textContent = t.journeyStart;
        else if (text === 'Contact') element.textContent = t.contact;
        else if (text === 'Follow Us') element.textContent = t.followUs;
    });
    
    const footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom) {
        footerBottom.innerHTML = `&copy; 2024 ${t.centerName}. ${t.allRightsReserved}`;
    }
}

function updateLanguageToggleButton(lang) {
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.innerHTML = lang === 'ar' ? 
            '<i class="fas fa-language"></i> English' : 
            '<i class="fas fa-language"></i> العربية';
    }
}

function updateNavbarAlignment(lang) {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.justifyContent = lang === 'ar' ? 'flex-end' : 'flex-start';
        navbar.style.marginLeft = lang === 'ar' ? '0' : '30px';
        navbar.style.marginRight = lang === 'ar' ? '30px' : '0';
    }
    
    const logo = document.querySelector('.header .logo');
    if (logo) {
        logo.style.marginLeft = lang === 'ar' ? '0' : '30px';
        logo.style.marginRight = lang === 'ar' ? '30px' : '0';
    }
}

function initializeLanguage() {
    if (isInitialized) {

        return;
    }
    
    const currentLang = localStorage.getItem('lang') || 'en';
    setLanguage(currentLang);
    
    // Add language toggle event listener
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('lang') || 'en';
            const newLang = currentLang === 'en' ? 'ar' : 'en';
            setLanguage(newLang);
            
            // Show language change notification
            const message = newLang === 'ar' ? 
                translations.ar.languageChanged : 
                translations.en.languageChanged;
            
            if (window.dashboard && window.dashboard.showNotification) {
                window.dashboard.showNotification(message, 'success');
            } else {

            }
        });
    }

}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        translations,
        setLanguage,
        updateDashboardTranslations,
        updateHeaderTranslations,
        updateFooterTranslations,
        updateLanguageToggleButton,
        updateNavbarAlignment,
        initializeLanguage
    };
} else {
    // Browser environment
    window.translations = translations;
    window.setLanguage = setLanguage;
    window.updateDashboardTranslations = updateDashboardTranslations;
    window.updateHeaderTranslations = updateHeaderTranslations;
    window.updateFooterTranslations = updateFooterTranslations;
    window.updateLanguageToggleButton = updateLanguageToggleButton;
    window.updateNavbarAlignment = updateNavbarAlignment;
    window.initializeLanguage = initializeLanguage;
}

// Admin Dashboard JavaScript
// Comprehensive functionality for AL-BOQAI Center Admin Portal

// Translation Management
const translations = {
    ar: {
        // Header and Navigation
        header: {
            adminDashboard: 'لوحة تحكم المدير',
            appointments: 'المواعيد',
            users: 'المستخدمون',
            testimonials: 'التوصيات',
            reports: 'التقارير',
            createTreatmentPlan: '📋 إنشاء خطة علاج',
            admin: 'المدير',
            settings: 'الإعدادات',
            logout: 'تسجيل الخروج'
        },
        // Dashboard Content
        dashboard: {
            welcomeTitle: 'لوحة تحكم المدير',
            welcomeSubtitle: 'إدارة عمليات مركز البقاعي',
            totalAppointments: 'إجمالي المواعيد',
            totalUsers: 'إجمالي المستخدمين',
            totalTestimonials: 'التوصيات',
            todayAppointments: 'مواعيد اليوم'
        },
        // Quick Actions
        quickActions: {
            title: 'إجراءات سريعة',
            viewAllAppointments: 'عرض جميع المواعيد',
            manageUsers: 'إدارة المستخدمين',
            reviewTestimonials: 'مراجعة التوصيات',
            generateReports: 'إنشاء التقارير'
        },
        // Recent Appointments
        recentAppointments: {
            title: 'المواعيد الحديثة',
            viewAll: 'عرض الكل',
            loading: 'جاري تحميل المواعيد...',
            noAppointments: 'لا توجد مواعيد',
            failedToLoad: 'فشل في تحميل المواعيد',
            retry: 'إعادة المحاولة'
        },
        // Appointment Statistics
        appointmentStats: {
            title: 'إحصائيات المواعيد',
            scheduled: 'مجدول',
            confirmed: 'مؤكد',
            completed: 'مكتمل',
            cancelled: 'ملغي'
        },
        // Service Distribution
        serviceDistribution: {
            title: 'توزيع أنواع الخدمات',
            loading: 'جاري تحميل بيانات الخدمة...',
            noData: 'لا توجد بيانات خدمة متاحة',
            appointments: 'مواعيد'
        },
        // Recent Activity
        recentActivity: {
            title: 'النشاط الحديث',
            loading: 'جاري تحميل النشاط...',
            noActivity: 'لا يوجد نشاط حديث',
            appointmentScheduled: 'تم جدولة موعد لـ'
        },
        // Footer
        footer: {
            quickLinks: 'روابط سريعة',
            home: 'الرئيسية',
            contact: 'تواصل معنا',
            email: 'البريد الإلكتروني: alboqaiworld@gmail.com',
            phone: 'الهاتف: +962775252444',
            address: 'شارع الأندلس، إربد',
            workingHours: 'ساعات العمل',
            saturdayThursday: 'السبت - الخميس: 8:00 - 16:00',
            friday: 'الجمعة: مغلق',
            copyright: '© 2025 مركز البقاعي. جميع الحقوق محفوظة.'
        },
        // Common Actions
        actions: {
            view: 'عرض',
            edit: 'تعديل',
            retry: 'إعادة المحاولة',
            cancel: 'إلغاء',
            confirm: 'تأكيد'
        },
        // Status Messages
        status: {
            scheduled: 'مجدول',
            confirmed: 'مؤكد',
            completed: 'مكتمل',
            cancelled: 'ملغي'
        },
        // Service Types
        services: {
            'manual-therapy': 'العلاج اليدوي',
            'physical-therapy': 'العلاج الفيزيائي',
            'rehabilitation': 'إعادة التأهيل',
            'consultation': 'استشارة',
            'follow-up': 'متابعة',
            'assessment': 'تقييم'
        },
        // Time
        time: {
            justNow: 'الآن',
            minutesAgo: 'دقيقة مضت',
            hoursAgo: 'ساعة مضت',
            daysAgo: 'يوم مضت',
            monthsAgo: 'شهر مضت'
        },
        // Notifications
        notifications: {
            settingsComingSoon: 'صفحة الإعدادات قريباً!',
            appointmentEditingComingSoon: 'تعديل المواعيد قريباً!',
            reportGenerationComingSoon: 'إنشاء التقارير قريباً!',
            accessDenied: 'تم رفض الوصول. المستخدمون المديرون لا يمكنهم تسجيل الدخول من الواجهة الأمامية. يرجى الاتصال بمسؤول النظام.',
            sessionExpired: 'انتهت صلاحية الجلسة',
            failedToLoad: 'فشل في تحميل البيانات',
            failedToLoadAppointments: 'فشل في تحميل المواعيد',
            failedToLoadUsers: 'فشل في تحميل المستخدمين',
            failedToLoadTestimonials: 'فشل في تحميل التوصيات',
            failedToLoadAppointmentDetails: 'فشل في تحميل تفاصيل الموعد',
            reportGenerated: 'تم إنشاء التقرير وتنزيله بنجاح!',
            failedToGenerateReport: 'فشل في إنشاء التقرير'
        },
        // Modal
        modal: {
            appointmentDetails: 'تفاصيل الموعد',
            patient: 'المريض',
            date: 'التاريخ',
            service: 'الخدمة',
            status: 'الحالة',
            duration: 'المدة',
            notes: 'ملاحظات',
            confirmLogout: 'تأكيد تسجيل الخروج',
            confirmLogoutMessage: 'هل أنت متأكد من أنك تريد تسجيل الخروج؟ سيؤدي هذا إلى إنهاء جلستك الحالية وستحتاج إلى تسجيل الدخول مرة أخرى.',
            cancel: 'إلغاء',
            logout: 'تسجيل الخروج',
            rescheduleAppointment: 'إعادة جدولة الموعد',
            currentAppointment: 'الموعد الحالي',
            currentDate: 'التاريخ الحالي',
            rescheduleReason: 'سبب إعادة الجدولة',
            selectReason: 'اختر سبباً',
            reasonPatientRequest: 'طلب المريض',
            reasonTherapistUnavailable: 'الطبيب غير متوفر',
            reasonEmergency: 'طوارئ',
            reasonWeather: 'ظروف الطقس',
            reasonTechnical: 'مشاكل فنية',
            reasonOther: 'أخرى',
            newDate: 'التاريخ والوقت الجديد',
            newServiceType: 'نوع الخدمة الجديد (اختياري)',
            keepCurrent: 'الاحتفاظ بالحالي',
            newDuration: 'المدة الجديدة (اختياري)',
            durationMinutes: 'دقائق',
            additionalNotes: 'ملاحظات إضافية (اختياري)',
            notesPlaceholder: 'أي معلومات إضافية...',
            rescheduleSuccess: 'تم إعادة جدولة الموعد بنجاح!',
            rescheduleError: 'فشل في إعادة جدولة الموعد',
            validationError: 'من فضلك أملأ جميع الحقول المطلوبة'
        }
    },
    en: {
        // Header and Navigation
        header: {
            adminDashboard: 'Admin Dashboard',
            appointments: 'Appointments',
            users: 'Users',
            testimonials: 'Testimonials',
            reports: 'Reports',
            createTreatmentPlan: '📋 Create Treatment Plan',
            admin: 'Admin',
            settings: 'Settings',
            logout: 'Logout'
        },
        // Dashboard Content
        dashboard: {
            welcomeTitle: 'Admin Dashboard',
            welcomeSubtitle: 'Manage AL-BOQAI Center operations',
            totalAppointments: 'Total Appointments',
            totalUsers: 'Total Users',
            totalTestimonials: 'Testimonials',
            todayAppointments: 'Today\'s Appointments'
        },
        // Quick Actions
        quickActions: {
            title: 'Quick Actions',
            viewAllAppointments: 'View All Appointments',
            manageUsers: 'Manage Users',
            reviewTestimonials: 'Review Testimonials',
            generateReports: 'Generate Reports'
        },
        // Recent Appointments
        recentAppointments: {
            title: 'Recent Appointments',
            viewAll: 'View All',
            loading: 'Loading appointments...',
            noAppointments: 'No appointments found',
            failedToLoad: 'Failed to load appointments',
            retry: 'Retry'
        },
        // Appointment Statistics
        appointmentStats: {
            title: 'Appointment Statistics',
            scheduled: 'Scheduled',
            confirmed: 'Confirmed',
            completed: 'Completed',
            cancelled: 'Cancelled'
        },
        // Service Distribution
        serviceDistribution: {
            title: 'Service Type Distribution',
            loading: 'Loading service data...',
            noData: 'No service data available',
            appointments: 'appointments'
        },
        // Recent Activity
        recentActivity: {
            title: 'Recent Activity',
            loading: 'Loading activity...',
            noActivity: 'No recent activity',
            appointmentScheduled: 'Appointment scheduled for'
        },
        // Footer
        footer: {
            quickLinks: 'Quick Links',
            home: 'Home',
            contact: 'Contact',
            email: 'Email: alboqaiworld@gmail.com',
            phone: 'Phone: +962775252444',
            address: 'al-andlos road, Irbid',
            workingHours: 'Working Hours',
            saturdayThursday: 'Saturday - Thursday: 8:00 - 16:00',
            friday: 'Friday: Closed',
            copyright: '© 2025 AL-BOQAI CENTER. All rights reserved.'
        },
        // Common Actions
        actions: {
            view: 'View',
            edit: 'Edit',
            retry: 'Retry',
            cancel: 'Cancel',
            confirm: 'Confirm'
        },
        // Status Messages
        status: {
            scheduled: 'Scheduled',
            confirmed: 'Confirmed',
            completed: 'Completed',
            cancelled: 'Cancelled'
        },
        // Service Types
        services: {
            'manual-therapy': 'Manual Therapy',
            'physical-therapy': 'Physical Therapy',
            'rehabilitation': 'Rehabilitation',
            'consultation': 'Consultation',
            'follow-up': 'Follow-up',
            'assessment': 'Assessment'
        },
        // Time
        time: {
            justNow: 'Just now',
            minutesAgo: 'm ago',
            hoursAgo: 'h ago',
            daysAgo: 'd ago',
            monthsAgo: 'mo ago'
        },
        // Notifications
        notifications: {
            settingsComingSoon: 'Settings page coming soon!',
            appointmentEditingComingSoon: 'Appointment editing coming soon!',
            reportGenerationComingSoon: 'Report generation coming soon!',
            accessDenied: 'Access denied. Admin users cannot sign in through the frontend. Please contact the system administrator.',
            sessionExpired: 'Session expired',
            failedToLoad: 'Failed to load data',
            failedToLoadAppointments: 'Failed to load appointments',
            failedToLoadUsers: 'Failed to load users',
            failedToLoadTestimonials: 'Failed to load testimonials',
            failedToLoadAppointmentDetails: 'Failed to load appointment details',
            reportGenerated: 'Report generated and downloaded successfully!',
            failedToGenerateReport: 'Failed to generate report'
        },
        // Modal
        modal: {
            appointmentDetails: 'Appointment Details',
            patient: 'Patient',
            date: 'Date',
            service: 'Service',
            status: 'Status',
            duration: 'Duration',
            notes: 'Notes',
            confirmLogout: 'Confirm Logout',
            confirmLogoutMessage: 'Are you sure you want to logout? This will end your current session and you\'ll need to sign in again.',
            cancel: 'Cancel',
            logout: 'Logout',
            rescheduleAppointment: 'Reschedule Appointment',
            currentAppointment: 'Current Appointment',
            currentDate: 'Current Date',
            rescheduleReason: 'Reason for Rescheduling',
            selectReason: 'Select a reason',
            reasonPatientRequest: 'Patient request',
            reasonTherapistUnavailable: 'Therapist unavailable',
            reasonEmergency: 'Emergency',
            reasonWeather: 'Weather conditions',
            reasonTechnical: 'Technical issues',
            reasonOther: 'Other',
            newDate: 'New Date & Time',
            newServiceType: 'New Service Type (Optional)',
            keepCurrent: 'Keep current',
            newDuration: 'New Duration (Optional)',
            durationMinutes: 'minutes',
            additionalNotes: 'Additional Notes (Optional)',
            notesPlaceholder: 'Any additional information...',
            rescheduleSuccess: 'Appointment rescheduled successfully!',
            rescheduleError: 'Failed to reschedule appointment',
            validationError: 'Please fill in all required fields'
        }
    }
};

// Language management functions
function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
    
    const t = translations[lang];
    
    // Update header navigation
    updateHeaderTranslations(t);
    
    // Update dashboard content
    updateDashboardTranslations(t);
    
    // Update footer
    updateFooterTranslations(t);
    
    // Update language toggle button
    updateLanguageToggleButton(lang);
    
    // Update navbar alignment
    updateNavbarAlignment(lang);
}

function updateHeaderTranslations(t) {
    // Update navigation items
    const navItems = [
        { selector: '.navbar li:nth-child(1) a', text: t.header.adminDashboard },
        { selector: '.navbar li:nth-child(2) a', text: t.header.appointments },
        { selector: '.navbar li:nth-child(3) a', text: t.header.users },
        { selector: '.navbar li:nth-child(4) a', text: t.header.testimonials },
        { selector: '.navbar li:nth-child(5) a', text: t.header.reports },
        { selector: '.navbar li:nth-child(6) a', text: t.header.createTreatmentPlan },
        { selector: '.dropdown-trigger', text: t.header.admin },
        { selector: '.dropdown-menu li:first-child a', text: t.header.settings },
        { selector: '.dropdown-menu li:last-child a', text: t.header.logout }
    ];
    
    navItems.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            element.textContent = item.text;
        }
    });
}

function updateDashboardTranslations(t) {
    // Update welcome section
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) welcomeTitle.textContent = t.dashboard.welcomeTitle;
    
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    if (welcomeSubtitle) welcomeSubtitle.textContent = t.dashboard.welcomeSubtitle;
    
    // Update stat labels
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 4) {
        statLabels[0].textContent = t.dashboard.totalAppointments;
        statLabels[1].textContent = t.dashboard.totalUsers;
        statLabels[2].textContent = t.dashboard.totalTestimonials;
        statLabels[3].textContent = t.dashboard.todayAppointments;
    }
    
    // Update quick actions
    const quickActionsTitle = document.querySelector('.quick-actions .card-header h3');
    if (quickActionsTitle) quickActionsTitle.innerHTML = `<i class="fas fa-bolt"></i> ${t.quickActions.title}`;
    
    const actionButtons = document.querySelectorAll('.action-btn span');
    if (actionButtons.length >= 4) {
        actionButtons[0].textContent = t.quickActions.viewAllAppointments;
        actionButtons[1].textContent = t.quickActions.manageUsers;
        actionButtons[2].textContent = t.quickActions.reviewTestimonials;
        actionButtons[3].textContent = t.quickActions.generateReports;
    }
    
    // Update recent appointments
    const recentAppointmentsTitle = document.querySelector('.recent-appointments .card-header h3');
    if (recentAppointmentsTitle) recentAppointmentsTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${t.recentAppointments.title}`;
    
    const viewAllBtn = document.querySelector('.recent-appointments .view-all-btn');
    if (viewAllBtn) viewAllBtn.textContent = t.recentAppointments.viewAll;
    
    // Update appointment statistics
    const appointmentStatsTitle = document.querySelector('.appointment-stats .card-header h3');
    if (appointmentStatsTitle) appointmentStatsTitle.innerHTML = `<i class="fas fa-chart-pie"></i> ${t.appointmentStats.title}`;
    
    const statLabels2 = document.querySelectorAll('.appointment-stats .stat-label');
    if (statLabels2.length >= 4) {
        statLabels2[0].textContent = t.appointmentStats.scheduled;
        statLabels2[1].textContent = t.appointmentStats.confirmed;
        statLabels2[2].textContent = t.appointmentStats.completed;
        statLabels2[3].textContent = t.appointmentStats.cancelled;
    }
    
    // Update service distribution
    const serviceDistributionTitle = document.querySelector('.service-distribution .card-header h3');
    if (serviceDistributionTitle) serviceDistributionTitle.innerHTML = `<i class="fas fa-stethoscope"></i> ${t.serviceDistribution.title}`;
    
    // Update recent activity
    const recentActivityTitle = document.querySelector('.recent-activity .card-header h3');
    if (recentActivityTitle) recentActivityTitle.innerHTML = `<i class="fas fa-history"></i> ${t.recentActivity.title}`;
    
    // Update loading states with data attributes
    updateLoadingStates(t);
}

function updateFooterTranslations(t) {
    // Update footer sections
    const footerSections = document.querySelectorAll('.footer-section h4');
    if (footerSections.length >= 3) {
        footerSections[0].textContent = t.footer.quickLinks;
        footerSections[1].textContent = t.footer.contact;
        footerSections[2].textContent = t.footer.workingHours;
    }
    
    // Update quick links
    const quickLinks = document.querySelectorAll('.footer-section:first-child ul li a');
    if (quickLinks.length >= 5) {
        quickLinks[0].textContent = t.footer.home;
        quickLinks[1].textContent = t.header.adminDashboard;
        quickLinks[2].textContent = t.header.appointments;
        quickLinks[3].textContent = t.header.users;
        quickLinks[4].textContent = t.header.testimonials;
    }
    
    // Update contact info
    const contactInfo = document.querySelectorAll('.footer-section:nth-child(2) ul li');
    if (contactInfo.length >= 3) {
        contactInfo[0].innerHTML = `<a href="mailto:alboqaiworld@gmail.com" target="_blank">${t.footer.email}</a>`;
        contactInfo[1].textContent = `${t.footer.phone}: +962775252444`;
        contactInfo[2].innerHTML = `<a href="https://maps.app.goo.gl/8sPWu3tUFbbenmvd7?g_st=iw" target="_blank">${t.footer.address}</a>`;
    }
    
    // Update working hours
    const workingHours = document.querySelectorAll('.footer-section:last-child ul li');
    if (workingHours.length >= 2) {
        workingHours[0].textContent = `${t.footer.saturdayThursday}: 8:00 - 16:00`;
        workingHours[1].textContent = `${t.footer.friday}: ${t.footer.closed || 'Closed'}`;
    }
    
    // Update copyright
    const copyright = document.querySelector('.footer-bottom');
    if (copyright) copyright.textContent = t.footer.copyright;
}

function updateLanguageToggleButton(lang) {
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.innerHTML = lang === 'ar' ? '<i class="fas fa-language"></i> English' : '<i class="fas fa-language"></i> العربية';
    }
}

function updateNavbarAlignment(lang) {
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
    
    // Update dropdown menu alignment
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.textAlign = lang === 'ar' ? 'right' : 'left';
    });
}

function updateLoadingStates(t) {
    // Update all elements with data attributes for translations
    const elementsWithData = document.querySelectorAll('[data-en][data-ar]');
    elementsWithData.forEach(element => {
        const currentLang = localStorage.getItem('lang') || 'en';
        const translation = element.getAttribute(`data-${currentLang}`);
        if (translation) {
            element.textContent = translation;
        }
    });
}

// Initialize language system
function initializeLanguage() {
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
            const message = newLang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English';
            if (window.adminDashboard) {
                adminDashboard.showNotification(message, 'info');
            }
        });
    }
}

class AdminDashboard {
    constructor() {
        this.apiBaseUrl = CONFIG.API.BASE_URL;
        this.currentUser = null;
        this.stats = {};
        this.currentLanguage = localStorage.getItem('lang') || 'en';
        this.init();
    }

    async init() {
        try {
            // Initialize language system first
            initializeLanguage();
            
            await this.checkAdminAuthentication();
            await this.loadDashboardData();
            this.setupEventListeners();
            this.startPeriodicUpdates();
        } catch (error) {
            console.error('Admin dashboard initialization error:', error);
            this.handleAuthError();
        }
    }

    // Authentication Methods
    async checkAdminAuthentication() {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            throw new Error('No user session found');
        }

        try {
            // Validate session with backend using session cookies
            const response = await fetch(`${this.apiBaseUrl}/users/validate_session/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // This sends cookies automatically
            });

            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData;
                
                // Check if user is admin
                if (this.currentUser.role !== 'admin') {
                    throw new Error('Access denied. Admin privileges required.');
                }
                return;
            }

            // If session validation fails, try to get user by ID
            const userResponse = await fetch(`${this.apiBaseUrl}/users/${userId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // This sends cookies automatically
            });

            if (!userResponse.ok) {
                throw new Error('Session expired');
            }

            this.currentUser = await userResponse.json();
            
            // Check if user is admin
            if (this.currentUser.role !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }
            
        } catch (error) {
            console.error('Admin authentication check failed:', error);
            throw error;
        }
    }

    handleAuthError() {
        // Clear local storage
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userRole');
        
        // Show notification
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        this.showNotification(t.notifications.accessDenied, 'error');
        
        // Redirect to home page after delay
        setTimeout(() => {
            window.location.href = '../home.html';
        }, 3000);
    }

    // Data Loading Methods
    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadAllAppointments(),
                this.loadUsers(),
                this.loadTestimonials(),
                this.updateStatistics()
            ]);
            
            this.renderServiceChart();
            this.renderActivityList();
            this.hideLoadingStates();
        } catch (error) {
            console.error('Error loading admin dashboard data:', error);
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showError(t.notifications.failedToLoad);
        }
    }

    async loadAllAppointments() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/`, {
                headers: this.getAuthHeaders(),
                credentials: 'include' // Include cookies for session authentication
            });

            if (response.ok) {
                this.appointments = await response.json();
                this.renderRecentAppointments();
                this.updateAppointmentStats();
            } else {
                throw new Error('Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.renderAppointmentsError();
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.users = await response.json();
            } else {
                throw new Error('Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showNotification(t.notifications.failedToLoadUsers, 'error');
        }
    }

    async loadTestimonials() {
        try {
            // Testimonials endpoint allows anonymous access, so we don't need auth headers
            const response = await fetch(`${this.apiBaseUrl}/testimonials/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.testimonials = await response.json();
            } else {
                throw new Error('Failed to load testimonials');
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showNotification(t.notifications.failedToLoadTestimonials, 'error');
        }
    }

    async updateStatistics() {
        try {
            // Update dashboard statistics
            document.getElementById('total-appointments').textContent = this.appointments.length;
            document.getElementById('total-users').textContent = this.users.length;
            document.getElementById('total-testimonials').textContent = this.testimonials.length;
            
            // Calculate today's appointments
            const today = new Date();
            const todayAppointments = this.appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate.toDateString() === today.toDateString();
            }).length;
            document.getElementById('today-appointments').textContent = todayAppointments;
            
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    // Rendering Methods
    renderRecentAppointments() {
        const appointmentsList = document.getElementById('recent-appointments-list');
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        if (this.appointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>${t.recentAppointments.noAppointments}</p>
                </div>
            `;
            return;
        }

        // Display recent appointments (limit to 5 for dashboard)
        const recentAppointments = this.appointments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        appointmentsList.innerHTML = recentAppointments.map(appointment => {
            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusClass = `status-${appointment.status}`;
            const statusText = this.formatStatus(appointment.status);
            
            const patientName = appointment.user ? 
                `${appointment.user.first_name} ${appointment.user.last_name}` : 
                appointment.patient_name || 'Anonymous';
            
            return `
                <div class="appointment-item ${statusClass}">
                    <div class="appointment-header">
                        <div class="appointment-date">
                            <i class="fas fa-calendar-day"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <span class="appointment-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="appointment-details">
                        <div class="patient-name">
                            <i class="fas fa-user"></i>
                            <span>${patientName}</span>
                        </div>
                        <div class="service-type">
                            <i class="fas fa-stethoscope"></i>
                            <span>${this.formatServiceType(appointment.service_type)}</span>
                        </div>
                        <div class="duration">
                            <i class="fas fa-clock"></i>
                            <span>${appointment.duration} minutes</span>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-secondary btn-sm" onclick="adminDashboard.viewAppointment(${appointment.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-primary btn-sm" onclick="adminDashboard.editAppointment(${appointment.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAppointmentStats() {
        const stats = {
            scheduled: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0
        };

        this.appointments.forEach(apt => {
            if (stats.hasOwnProperty(apt.status)) {
                stats[apt.status]++;
            }
        });

        document.getElementById('scheduled-count').textContent = stats.scheduled;
        document.getElementById('confirmed-count').textContent = stats.confirmed;
        document.getElementById('completed-count').textContent = stats.completed;
        document.getElementById('cancelled-count').textContent = stats.cancelled;
    }

    renderAppointmentsError() {
        const appointmentsList = document.getElementById('recent-appointments-list');
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        appointmentsList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${t.recentAppointments.failedToLoad}</p>
                <button class="retry-btn" onclick="adminDashboard.loadAllAppointments()">${t.actions.retry}</button>
            </div>
        `;
    }

    // Utility Methods
    formatStatus(status) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        return t.status[status] || status;
    }

    formatServiceType(serviceType) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        return t.services[serviceType] || serviceType;
    }

    getAuthHeaders() {
        const sessionId = localStorage.getItem('sessionId');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add session ID if available
        if (sessionId) {
            headers['Authorization'] = `Bearer ${sessionId}`;
        }
        
        return headers;
    }

    // Action Methods
    async viewAppointment(appointmentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const appointment = await response.json();
                this.showAppointmentDetails(appointment);
            } else {
                throw new Error('Failed to load appointment details');
            }
        } catch (error) {
            console.error('Error viewing appointment:', error);
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showNotification(t.notifications.failedToLoadAppointmentDetails, 'error');
        }
    }

    async editAppointment(appointmentId) {
        try {

            console.log('Auth headers:', this.getAuthHeaders());
            
            // Get appointment details first
            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/`, {
                headers: this.getAuthHeaders(),
                credentials: 'include' // Include cookies for session authentication
            });

            if (response.ok) {
                const appointment = await response.json();

                this.showRescheduleModal(appointment);
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                console.error('Failed to load appointment:', errorData);
                throw new Error(`HTTP ${response.status}: Failed to load appointment details`);
            }
        } catch (error) {
            console.error('Error loading appointment for editing:', error);
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showNotification(t.notifications.failedToLoadAppointmentDetails, 'error');
        }
    }

    showRescheduleModal(appointment) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        const patientName = appointment.user ? 
            `${appointment.user.first_name} ${appointment.user.last_name}` : 
            appointment.patient_name || 'Anonymous';
        
        const currentDate = new Date(appointment.date);
        const formattedDate = currentDate.toISOString().slice(0, 16); // Format for datetime-local input
        
        const modal = document.createElement('div');
        modal.className = 'modal reschedule-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> ${t.modal.rescheduleAppointment || 'Reschedule Appointment'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="appointment-summary">
                        <h4>${t.modal.currentAppointment || 'Current Appointment'}</h4>
                        <p><strong>${t.modal.patient}:</strong> ${patientName}</p>
                        <p><strong>${t.modal.currentDate || 'Current Date'}:</strong> ${currentDate.toLocaleString()}</p>
                        <p><strong>${t.modal.service}:</strong> ${this.formatServiceType(appointment.service_type)}</p>
                        <p><strong>${t.modal.duration}:</strong> ${appointment.duration} minutes</p>
                    </div>
                    
                    <form id="rescheduleForm" class="reschedule-form">
                        <div class="form-group">
                            <label for="newDate">${t.modal.newDate || 'New Date & Time'}</label>
                            <input type="datetime-local" id="newDate" name="newDate" value="${formattedDate}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="rescheduleReason">${t.modal.rescheduleReason || 'Reason for Rescheduling'}</label>
                            <select id="rescheduleReason" name="rescheduleReason" required>
                                <option value="">${t.modal.selectReason || 'Select a reason'}</option>
                                <option value="Patient request">${t.modal.reasonPatientRequest || 'Patient request'}</option>
                                <option value="Therapist unavailable">${t.modal.reasonTherapistUnavailable || 'Therapist unavailable'}</option>
                                <option value="Emergency">${t.modal.reasonEmergency || 'Emergency'}</option>
                                <option value="Weather conditions">${t.modal.reasonWeather || 'Weather conditions'}</option>
                                <option value="Technical issues">${t.modal.reasonTechnical || 'Technical issues'}</option>
                                <option value="Other">${t.modal.reasonOther || 'Other'}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="newServiceType">${t.modal.newServiceType || 'New Service Type (Optional)'}</label>
                            <select id="newServiceType" name="newServiceType">
                                <option value="">${t.modal.keepCurrent || 'Keep current'}</option>
                                <option value="manual-therapy">${t.services['manual-therapy']}</option>
                                <option value="physical-therapy">${t.services['physical-therapy']}</option>
                                <option value="rehabilitation">${t.services.rehabilitation}</option>
                                <option value="consultation">${t.services.consultation}</option>
                                <option value="follow-up">${t.services['follow-up']}</option>
                                <option value="assessment">${t.services.assessment}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="newDuration">${t.modal.newDuration || 'New Duration (Optional)'}</label>
                            <input type="number" id="newDuration" name="newDuration" min="15" max="180" step="15" value="${appointment.duration}">
                            <small>${t.modal.durationMinutes || 'minutes'}</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="additionalNotes">${t.modal.additionalNotes || 'Additional Notes (Optional)'}</label>
                            <textarea id="additionalNotes" name="additionalNotes" rows="3" placeholder="${t.modal.notesPlaceholder || 'Any additional information...'}"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                                ${t.modal.cancel}
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> ${t.modal.rescheduleAppointment || 'Reschedule Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add form submission handler
        const form = modal.querySelector('#rescheduleForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRescheduleSubmit(appointment.id, form);
        });
        
        // Focus on first input
        modal.querySelector('#newDate').focus();
    }

    async handleRescheduleSubmit(appointmentId, form) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        try {
            const formData = new FormData(form);
            
            // Validate form data
            const newDate = formData.get('newDate');
            const rescheduleReason = formData.get('rescheduleReason');
            
            if (!newDate || !rescheduleReason) {
                this.showNotification(t.modal.validationError || 'Please fill in all required fields', 'error');
                return;
            }
            
            // Prepare reschedule data
            const rescheduleData = {
                new_date: new Date(newDate).toISOString(),
                reschedule_reason: rescheduleReason
            };
            
            // Add optional fields if provided
            const newServiceType = formData.get('newServiceType');
            if (newServiceType) {
                rescheduleData.new_service_type = newServiceType;
            }
            
            const newDuration = formData.get('newDuration');
            if (newDuration) {
                rescheduleData.new_duration = parseInt(newDuration);
            }
            
            const additionalNotes = formData.get('additionalNotes');
            if (additionalNotes) {
                rescheduleData.new_note = additionalNotes;
            }
            
            // Debug logging

            console.log('Auth headers:', this.getAuthHeaders());
            
            // Call reschedule API
            const response = await fetch(`${this.apiBaseUrl}/appointments/${appointmentId}/reschedule/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                credentials: 'include', // Include cookies for session authentication
                body: JSON.stringify(rescheduleData)
            });

            console.log('Response headers:', [...response.headers.entries()]);
            
            if (response.ok) {
                const result = await response.json();

                this.showNotification(t.modal.rescheduleSuccess || 'Appointment rescheduled successfully!', 'success');
                
                // Close modal
                form.closest('.modal').remove();
                
                // Refresh dashboard data
                await this.loadDashboardData();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                console.error('Reschedule failed:', errorData);
                throw new Error(errorData.error || `HTTP ${response.status}: Failed to reschedule appointment`);
            }
            
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            this.showNotification(error.message || t.modal.rescheduleError || 'Failed to reschedule appointment', 'error');
        }
    }

    showAppointmentDetails(appointment) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        const patientName = appointment.user ? 
            `${appointment.user.first_name} ${appointment.user.last_name}` : 
            appointment.patient_name || 'Anonymous';
        
        const details = `
            <div class="appointment-details-modal">
                <h3>${t.modal.appointmentDetails}</h3>
                <div class="detail-row">
                    <strong>${t.modal.patient}:</strong> ${patientName}
                </div>
                <div class="detail-row">
                    <strong>${t.modal.date}:</strong> ${new Date(appointment.date).toLocaleString()}
                </div>
                <div class="detail-row">
                    <strong>${t.modal.service}:</strong> ${this.formatServiceType(appointment.service_type)}
                </div>
                <div class="detail-row">
                    <strong>${t.modal.status}:</strong> ${this.formatStatus(appointment.status)}
                </div>
                <div class="detail-row">
                    <strong>${t.modal.duration}:</strong> ${appointment.duration} minutes
                </div>
                ${appointment.note ? `
                    <div class="detail-row">
                        <strong>${t.modal.notes}:</strong> ${appointment.note}
                    </div>
                ` : ''}
            </div>
        `;

        // Create and show modal
        this.showModal(t.modal.appointmentDetails, details);
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    }

    hideLoadingStates() {
        const loadingElements = document.querySelectorAll('.loading-state');
        loadingElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    renderServiceChart() {
        const serviceChart = document.getElementById('service-chart');
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        if (!this.appointments || this.appointments.length === 0) {
            serviceChart.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <p>${t.serviceDistribution.noData}</p>
                </div>
            `;
            return;
        }

        // Count service types
        const serviceCounts = {};
        this.appointments.forEach(apt => {
            const service = apt.service_type || 'unknown';
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        // Create service chart HTML
        const chartHTML = Object.entries(serviceCounts).map(([service, count]) => {
            const serviceName = this.formatServiceType(service);
            const percentage = ((count / this.appointments.length) * 100).toFixed(1);
            
            return `
                <div class="service-item">
                    <div class="service-info">
                        <span class="service-name">${serviceName}</span>
                        <span class="service-count">${count} ${t.serviceDistribution.appointments}</span>
                    </div>
                    <div class="service-bar">
                        <div class="service-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="service-percentage">${percentage}%</span>
                </div>
            `;
        }).join('');

        serviceChart.innerHTML = chartHTML;
    }

    renderActivityList() {
        const activityList = document.getElementById('activity-list');
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        if (!this.appointments || this.appointments.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>${t.recentActivity.noActivity}</p>
                </div>
            `;
            return;
        }

        // Get recent appointments for activity feed
        const recentAppointments = this.appointments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const activityHTML = recentAppointments.map(appointment => {
            const appointmentDate = new Date(appointment.date);
            const timeAgo = this.getTimeAgo(appointmentDate);
            const patientName = appointment.user ? 
                `${appointment.user.first_name} ${appointment.user.last_name}` : 
                appointment.patient_name || 'Anonymous';
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-calendar-plus"></i>
                    </div>
                    <div class="activity-content">
                        <span class="activity-text">${t.recentActivity.appointmentScheduled} ${patientName}</span>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');

        activityList.innerHTML = activityHTML;
    }

    getTimeAgo(date) {
        const currentLang = localStorage.getItem('lang') || 'en';
        const t = translations[currentLang];
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return t.time.justNow;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t.time.minutesAgo}`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t.time.hoursAgo}`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}${t.time.daysAgo}`;
        return `${Math.floor(diffInSeconds / 2592000)}${t.time.monthsAgo}`;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Periodic Updates
    startPeriodicUpdates() {
        // Update every 5 minutes
        setInterval(() => {
            this.updateStatistics();
        }, 5 * 60 * 1000);
        
        // Real-time updates every 30 seconds for critical data
        setInterval(() => {
            this.loadDashboardData();
        }, 30 * 1000);
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }

    generateReport() {
        try {
            const reportData = this.prepareReportData();
            const reportContent = this.formatReportContent(reportData);
            
            // Create and download report
            this.downloadReport(reportContent, 'al-boqai-center-report.html');
            
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showNotification(t.notifications.reportGenerated, 'success');
        } catch (error) {
            console.error('Error generating report:', error);
            const currentLang = localStorage.getItem('lang') || 'en';
            const t = translations[currentLang];
            this.showNotification(t.notifications.failedToGenerateReport, 'error');
        }
    }

    prepareReportData() {
        const now = new Date();
        const reportDate = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Calculate statistics
        const totalAppointments = this.appointments?.length || 0;
        const completedAppointments = this.appointments?.filter(a => a.status === 'completed').length || 0;
        const pendingAppointments = this.appointments?.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length || 0;
        const cancelledAppointments = this.appointments?.filter(a => a.status === 'cancelled').length || 0;

        // Service type breakdown
        const serviceBreakdown = {};
        if (this.appointments) {
            this.appointments.forEach(appointment => {
                const serviceType = appointment.service_type || 'unknown';
                serviceBreakdown[serviceType] = (serviceBreakdown[serviceType] || 0) + 1;
            });
        }

        // Monthly trends
        const monthlyTrends = {};
        if (this.appointments) {
            this.appointments.forEach(appointment => {
                const month = new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
            });
        }

        return {
            reportDate,
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            cancelledAppointments,
            serviceBreakdown,
            monthlyTrends,
            completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0
        };
    }

    formatReportContent(data) {
        const serviceBreakdownHTML = Object.entries(data.serviceBreakdown)
            .map(([service, count]) => `
                <tr>
                    <td>${this.formatServiceType(service)}</td>
                    <td>${count}</td>
                    <td>${((count / data.totalAppointments) * 100).toFixed(1)}%</td>
                </tr>
            `).join('');

        const monthlyTrendsHTML = Object.entries(data.monthlyTrends)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([month, count]) => `
                <tr>
                    <td>${month}</td>
                    <td>${count}</td>
                </tr>
            `).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AL-BOQAI Center - Monthly Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #2a5d9f; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { color: #2a5d9f; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .report-date { color: #666; font-size: 14px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                    .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #2a5d9f; }
                    .summary-number { font-size: 32px; font-weight: bold; color: #2a5d9f; }
                    .summary-label { color: #666; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f8f9fa; font-weight: bold; color: #2a5d9f; }
                    .section { margin: 40px 0; }
                    .section-title { color: #2a5d9f; border-bottom: 1px solid #2a5d9f; padding-bottom: 10px; margin-bottom: 20px; }
                    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">AL-BOQAI Center</div>
                    <div class="report-date">Monthly Report - ${data.reportDate}</div>
                </div>

                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-number">${data.totalAppointments}</div>
                        <div class="summary-label">Total Appointments</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number">${data.completedAppointments}</div>
                        <div class="summary-label">Completed</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number">${data.pendingAppointments}</div>
                        <div class="summary-label">Pending</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number">${data.completionRate}%</div>
                        <div class="summary-label">Completion Rate</div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Service Type Breakdown</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Service Type</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${serviceBreakdownHTML}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2 class="section-title">Monthly Trends</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Appointments</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monthlyTrendsHTML}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Report generated on ${data.reportDate}</p>
                    <p>AL-BOQAI Center - World for Judgmental Therapy</p>
                </div>
            </body>
            </html>
        `;
    }

    downloadReport(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Global Action Functions
function viewAllAppointments() {
    window.location.href = 'admin-appointments.html';
}

function manageUsers() {
    window.location.href = 'admin-users.html';
}

function viewTestimonials() {
    window.location.href = 'admin-testimonials.html';
}

function generateReports() {
    const currentLang = localStorage.getItem('lang') || 'en';
    const t = translations[currentLang];
    adminDashboard.showNotification(t.notifications.reportGenerationComingSoon, 'info');
}

function logout() {
    // Show logout confirmation modal
    showLogoutConfirmationModal();
}

function showLogoutConfirmationModal() {
    const currentLang = localStorage.getItem('lang') || 'en';
    const t = translations[currentLang];
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'logout-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'logout-modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: slideInUp 0.3s ease-out;
    `;

    modalContent.innerHTML = `
        <div class="logout-modal-icon" style="margin-bottom: 20px;">
            <i class="fas fa-sign-out-alt" style="font-size: 48px; color: #dc3545;"></i>
        </div>
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">${t.modal.confirmLogout}</h3>
        <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5;">
            ${t.modal.confirmLogoutMessage}
        </p>
        <div class="logout-modal-actions" style="display: flex; gap: 15px; justify-content: center;">
            <button id="cancelLogoutBtn" style="
                flex: 1; 
                max-width: 120px; 
                background: #6c757d; 
                color: white; 
                border: 1px solid #6c757d; 
                padding: 10px 15px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 14px;
            ">
                <i class="fas fa-times"></i> ${t.modal.cancel}
            </button>
            <button id="confirmLogoutBtn" style="
                flex: 1; 
                max-width: 120px; 
                background: #dc3545; 
                color: white; 
                border: 1px solid #dc3545; 
                padding: 10px 15px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 14px;
            ">
                <i class="fas fa-sign-out-alt"></i> ${t.modal.logout}
            </button>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    const cancelBtn = modalOverlay.querySelector('#cancelLogoutBtn');
    const confirmBtn = modalOverlay.querySelector('#confirmLogoutBtn');

    cancelBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });

    confirmBtn.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        window.location.href = 'book appointment/sign in.html';
    });

    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            modalOverlay.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

// Initialize Admin Dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
});

// Global function for settings notification
function showSettingsNotification() {
    const currentLang = localStorage.getItem('lang') || 'en';
    const t = translations[currentLang];
    if (adminDashboard) {
        adminDashboard.showNotification(t.notifications.settingsComingSoon, 'info');
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}

// Professional WhatsApp-Style Chatbot for AL-BOQAI Center

class ALBOQAIChatbot {
    constructor() {
        this.isOpen = false;
        this.currentLanguage = localStorage.getItem('lang') || 'en';
        this.messages = [];
        this.typing = false;
        this.init();
    }

    init() {
        this.createChatWidget();
        this.loadInitialMessage();
        this.setupEventListeners();
        this.loadLanguage();
    }

    createChatWidget() {
        const chatHTML = `
            <div id="chatbot-widget" class="chatbot-widget">
                <!-- Chat Header -->
                <div class="chatbot-header" id="chatbot-header">
                    <div class="chatbot-avatar">
                        <img src="https://alboqai.com/wp-content/uploads/2022/12/4414Artboard-5@3x-8-2048x651.png" alt="AL-BOQAI Center">
                    </div>
                    <div class="chatbot-info">
                        <h4 id="chatbot-title">AL-BOQAI Center</h4>
                        <p id="chatbot-status">Online</p>
                    </div>
                    <div class="chatbot-controls">
                        <button class="chatbot-minimize" id="chatbot-minimize">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="chatbot-close" id="chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="chatbot-welcome">
                        <div class="welcome-message">
                            <p id="welcome-text">Welcome to AL-BOQAI Center! How can I help you today?</p>
                        </div>
                        <div class="quick-actions" id="quick-actions">
                            <!-- Quick action buttons will be added here -->
                        </div>
                    </div>
                </div>

                <!-- Chat Input -->
                <div class="chatbot-input-container">
                    <div class="chatbot-input-wrapper">
                        <input type="text" id="chatbot-input" placeholder="Type your message..." maxlength="500">
                        <button id="chatbot-send" class="chatbot-send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Chat Toggle Button -->
            <div id="chatbot-toggle" class="chatbot-toggle">
                <div class="chatbot-toggle-icon">
                    <img src="https://alboqai.com/wp-content/uploads/2022/12/4414Artboard-5@3x-8-2048x651.png" alt="AL-BOQAI Center">
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    loadLanguage() {
        const translations = {
            en: {
                title: "AL-BOQAI Center",
                status: "Online",
                welcome: "Welcome to AL-BOQAI Center! How can I help you today?",
                placeholder: "Type your message...",
                toggleText: "Chat with us",
                quickActions: {
                    services: "Our Services",
                    appointment: "Book Appointment",
                    contact: "Contact Info",
                    pricing: "Pricing & Insurance",
                    about: "About Center",
                    hours: "Working Hours",
                    success: "Success Stories"
                },
                responses: {
                    services: "We offer comprehensive rehabilitation services including:\n\n• Manual Therapy\n• Physical Therapy\n• Comprehensive Physical Rehabilitation\n• Treatment for various conditions\n\nWould you like to know more about any specific service?",
                    appointment: "To book an appointment:\n\n📱 WhatsApp: +962-799-965-888\n📧 Email: alboqaiworld@gmail.com\n\nFor first consultation, please bring:\n• Medical reports\n• Previous treatment records\n• ID or passport\n\nWould you like me to help you with anything else?",
                    contact: "📞 Phone: +962-799-965-888 (WhatsApp)\n📧 Email: alboqaiworld@gmail.com\n📍 Location: Irbid, Jordan\n⏰ Hours: Sunday-Thursday, 8 AM - 6 PM\n\nNeed directions or have other questions?",
                    pricing: "Our pricing varies based on treatment type and duration. We accept:\n\n• Cash payments\n• Insurance coverage (please check with your provider)\n• Payment plans available\n\nFor specific pricing, please contact us directly.",
                    about: "AL-BOQAI Center is a leading rehabilitation facility in Jordan, specializing in:\n\n• Physical therapy\n• Manual therapy\n• Comprehensive rehabilitation\n• Treatment for complex conditions\n\nFounded by Dr. Mohammed Khalid Al-Baqai, a distinguished specialist in physical therapy and rehabilitation.",
                    hours: "🕐 Working Hours:\n\nSunday - Thursday: 8:00 AM - 6:00 PM\nFriday: Closed\nSaturday: Closed\n\nEmergency consultations available by appointment.",
                    success: "We have many success stories including:\n\n• Child from Oman with oxygen deficiency\n• Child with brachial plexus tear\n• Various stroke recovery cases\n• Cerebral palsy improvements\n\nWould you like to read more success stories on our website?",
                    doctor: "Dr. Mohammed Khalid Al-Baqai:\n\n• Founder & President of AL-BOQAI Center\n• PhD in Physical Therapy\n• Specialist in advanced rehabilitation\n• Member of international medical associations\n• Published researcher and conference speaker\n• 15+ years of experience\n\nHe specializes in treating complex cases and developing personalized treatment plans.",
                    rehabilitation: "Comprehensive Physical Rehabilitation is a complete approach that includes:\n\n• Physical therapy\n• Manual therapy\n• Exercise programs\n• Pain management\n• Functional training\n• Patient education\n\nThis approach addresses the whole person, not just symptoms.",
                    manualTherapy: "Manual Therapy is hands-on treatment that includes:\n\n• Joint mobilization\n• Soft tissue techniques\n• Myofascial release\n• Trigger point therapy\n• Stretching techniques\n\nIt's effective for pain relief, mobility improvement, and faster recovery.",
                    conditions: "We treat various conditions including:\n\n• Oxygen deficiency\n• Cerebral palsy\n• Hip dislocation\n• Brachial plexus tears\n• Disc problems\n• Stroke recovery\n• Spinal cord injuries\n• Birth dislocations\n• Epilepsy\n• Musculoskeletal problems\n\nEach treatment is personalized to the patient's needs.",
                    default: "Thank you for your message! I'm here to help with information about our services, appointments, or any questions about AL-BOQAI Center. How can I assist you today?"
                }
            },
            ar: {
                title: "مركز البقاعي",
                status: "متصل",
                welcome: "مرحباً بكم في مركز البقاعي! كيف يمكنني مساعدتكم اليوم؟",
                placeholder: "اكتب رسالتك...",
                toggleText: "تحدث معنا",
                quickActions: {
                    services: "خدماتنا",
                    appointment: "حجز موعد",
                    contact: "معلومات التواصل",
                    pricing: "الأسعار والتأمين",
                    about: "عن المركز",
                    hours: "ساعات العمل",
                    success: "قصص النجاح"
                },
                responses: {
                    services: "نقدم خدمات إعادة التأهيل الشاملة بما في ذلك:\n\n• العلاج اليدوي\n• العلاج الطبيعي\n• إعادة التأهيل البدني الشامل\n• علاج الحالات المختلفة\n\nهل تريد معرفة المزيد عن خدمة معينة؟",
                    appointment: "لحجز موعد:\n\n📱 واتساب: +962-799-965-888\n📧 البريد الإلكتروني: alboqaiworld@gmail.com\n\nللاستشارة الأولى، يرجى إحضار:\n• التقارير الطبية\n• سجلات العلاج السابقة\n• الهوية أو جواز السفر\n\nهل تريد مساعدة في شيء آخر؟",
                    contact: "📞 الهاتف: +962-799-965-888 (واتساب)\n📧 البريد الإلكتروني: alboqaiworld@gmail.com\n📍 الموقع: إربد، الأردن\n⏰ الساعات: الأحد-الخميس، 8 صباحاً - 6 مساءً\n\nهل تحتاج إلى اتجاهات أو لديك أسئلة أخرى؟",
                    pricing: "تختلف أسعارنا حسب نوع العلاج والمدة. نقبل:\n\n• المدفوعات النقدية\n• تغطية التأمين (يرجى التحقق من مزود التأمين)\n• خطط دفع متاحة\n\nللحصول على أسعار محددة، يرجى الاتصال بنا مباشرة.",
                    about: "مركز البقاعي هو منشأة رائدة لإعادة التأهيل في الأردن، متخصصة في:\n\n• العلاج الطبيعي\n• العلاج اليدوي\n• إعادة التأهيل الشامل\n• علاج الحالات المعقدة\n\nأسسه الدكتور محمد خالد البقاعي، أخصائي متميز في العلاج الطبيعي وإعادة التأهيل.",
                    hours: "🕐 ساعات العمل:\n\nالأحد - الخميس: 8:00 صباحاً - 6:00 مساءً\nالجمعة: مغلق\nالسبت: مغلق\n\nالاستشارات الطارئة متاحة بموعد مسبق.",
                    success: "لدينا العديد من قصص النجاح بما في ذلك:\n\n• طفل من عمان يعاني من نقص الأكسجين\n• طفل يعاني من تمزق الضفيرة العضدية\n• حالات شفاء مختلفة من السكتة الدماغية\n• تحسينات الشلل الدماغي\n\nهل تريد قراءة المزيد من قصص النجاح على موقعنا؟",
                    doctor: "الدكتور محمد خالد البقاعي:\n\n• مؤسس ورئيس مركز البقاعي\n• دكتوراه في العلاج الطبيعي\n• أخصائي في إعادة التأهيل المتقدم\n• عضو في الجمعيات الطبية الدولية\n• باحث منشور ومتحدث في المؤتمرات\n• أكثر من 15 عاماً من الخبرة\n\nيتخصص في علاج الحالات المعقدة وتطوير خطط العلاج الشخصية.",
                    rehabilitation: "إعادة التأهيل البدني الشامل هي نهج كامل يشمل:\n\n• العلاج الطبيعي\n• العلاج اليدوي\n• برامج التمارين\n• إدارة الألم\n• التدريب الوظيفي\n• تعليم المريض\n\nهذا النهج يعالج الشخص كاملاً، وليس الأعراض فقط.",
                    manualTherapy: "العلاج اليدوي هو علاج باليدين يشمل:\n\n• تحريك المفاصل\n• تقنيات الأنسجة الرخوة\n• إطلاق اللفافة العضلية\n• علاج نقاط التحفيز\n• تقنيات التمدد\n\nإنه فعال لتخفيف الألم وتحسين الحركة والتعافي السريع.",
                    conditions: "نعالج حالات مختلفة بما في ذلك:\n\n• نقص الأكسجين\n• الشلل الدماغي\n• خلع الورك\n• تمزق الضفيرة العضدية\n• مشاكل الأقراص\n• التعافي من السكتة الدماغية\n• إصابات الحبل الشوكي\n• الخلع الولادي\n• الصرع\n• مشاكل الجهاز العضلي الهيكلي\n\nكل علاج مخصص لاحتياجات المريض.",
                    default: "شكراً لرسالتك! أنا هنا لمساعدتك في معلومات عن خدماتنا أو المواعيد أو أي أسئلة حول مركز البقاعي. كيف يمكنني مساعدتك اليوم؟"
                }
            }
        };

        this.translations = translations;
        this.updateLanguage();
    }

    updateLanguage() {
        const t = this.translations[this.currentLanguage];
        
        // Update UI elements
        document.getElementById('chatbot-title').textContent = t.title;
        document.getElementById('chatbot-status').textContent = t.status;
        document.getElementById('welcome-text').textContent = t.welcome;
        document.getElementById('chatbot-input').placeholder = t.placeholder;

        // Update quick actions
        this.updateQuickActions();
    }

    updateQuickActions() {
        const t = this.translations[this.currentLanguage];
        const quickActions = document.getElementById('quick-actions');
        
        quickActions.innerHTML = Object.entries(t.quickActions).map(([key, text]) => `
            <button class="quick-action-btn" data-action="${key}">
                ${text}
            </button>
        `).join('');

        // Add event listeners to quick action buttons
        quickActions.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        const t = this.translations[this.currentLanguage];
        const response = t.responses[action] || t.responses.default;
        this.addMessage('user', t.quickActions[action]);
        this.addMessage('bot', response);
    }

    setupEventListeners() {
        // Toggle button
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChat();
        });

        // Close button
        document.getElementById('chatbot-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Minimize button
        document.getElementById('chatbot-minimize').addEventListener('click', () => {
            this.minimizeChat();
        });

        // Send button
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in input
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Language toggle (if exists)
        const langBtn = document.getElementById('lang-toggle-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.currentLanguage = localStorage.getItem('lang') || 'en';
                    this.updateLanguage();
                }, 100);
            });
        }
    }

    toggleChat() {
        const widget = document.getElementById('chatbot-widget');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            widget.classList.remove('chatbot-open');
            toggle.classList.remove('chatbot-hidden');
        } else {
            widget.classList.add('chatbot-open');
            toggle.classList.add('chatbot-hidden');
            document.getElementById('chatbot-input').focus();
        }
        
        this.isOpen = !this.isOpen;
    }

    closeChat() {
        const widget = document.getElementById('chatbot-widget');
        const toggle = document.getElementById('chatbot-toggle');
        
        widget.classList.remove('chatbot-open');
        toggle.classList.remove('chatbot-hidden');
        this.isOpen = false;
    }

    minimizeChat() {
        const widget = document.getElementById('chatbot-widget');
        widget.classList.toggle('chatbot-minimized');
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage('user', message);
            input.value = '';
            this.processUserMessage(message);
        }
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.formatMessage(text)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Remove welcome message after first user message
        const welcome = messagesContainer.querySelector('.chatbot-welcome');
        if (welcome && sender === 'user') {
            welcome.remove();
        }
    }

    formatMessage(text) {
        // Convert line breaks to <br> tags
        return text.replace(/\n/g, '<br>');
    }

    processUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        const t = this.translations[this.currentLanguage];
        
        // Show typing indicator
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            let response = t.responses.default;
            
            // Check for specific keywords
            if (lowerMessage.includes('service') || lowerMessage.includes('خدمة') || lowerMessage.includes('علاج')) {
                response = t.responses.services;
            } else if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('موعد') || lowerMessage.includes('حجز')) {
                response = t.responses.appointment;
            } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('تواصل') || lowerMessage.includes('هاتف')) {
                response = t.responses.contact;
            } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('insurance') || lowerMessage.includes('سعر') || lowerMessage.includes('تكلفة')) {
                response = t.responses.pricing;
            } else if (lowerMessage.includes('about') || lowerMessage.includes('center') || lowerMessage.includes('عن') || lowerMessage.includes('مركز')) {
                response = t.responses.about;
            } else if (lowerMessage.includes('hour') || lowerMessage.includes('time') || lowerMessage.includes('ساعة') || lowerMessage.includes('وقت')) {
                response = t.responses.hours;
            } else if (lowerMessage.includes('success') || lowerMessage.includes('story') || lowerMessage.includes('نجاح') || lowerMessage.includes('قصة')) {
                response = t.responses.success;
            } else if (lowerMessage.includes('doctor') || lowerMessage.includes('dr') || lowerMessage.includes('دكتور') || lowerMessage.includes('طبيب')) {
                response = t.responses.doctor;
            } else if (lowerMessage.includes('rehabilitation') || lowerMessage.includes('تأهيل')) {
                response = t.responses.rehabilitation;
            } else if (lowerMessage.includes('manual therapy') || lowerMessage.includes('العلاج اليدوي')) {
                response = t.responses.manualTherapy;
            } else if (lowerMessage.includes('condition') || lowerMessage.includes('problem') || lowerMessage.includes('حالة') || lowerMessage.includes('مشكلة')) {
                response = t.responses.conditions;
            }
            
            this.addMessage('bot', response);
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    loadInitialMessage() {
        // Initial message will be shown in the welcome section
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.alboqaiChatbot = new ALBOQAIChatbot();
});

// Export for external use
window.ALBOQAIChatbot = ALBOQAIChatbot; 
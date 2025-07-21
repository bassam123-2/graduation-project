// Voice-Enabled AI Assistant for AL-BOQAI Center
// Advanced Speech Recognition and Natural Language Processing

class VoiceAssistant {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = null;
        this.currentLanguage = localStorage.getItem('lang') || 'en';
        this.commands = this.initializeCommands();
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.setupSpeechSynthesis();
        this.createVoiceUI();
        this.loadLanguageModel();
        console.log('🎤 Voice Assistant initialized');
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            this.recognition.maxAlternatives = 3;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceUI();
                const message = this.currentLanguage === 'ar' ? 'أنا أستمع' : 'I am listening';
                this.speak(message);
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log('Voice transcript:', transcript);
                this.processVoiceCommand(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                const message = this.currentLanguage === 'ar' ? 'عذراً، لم أفهم ذلك' : 'Sorry, I did not understand that';
                this.speak(message);
                this.isListening = false;
                this.updateVoiceUI();
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceUI();
            };
        } else {
            console.error('Speech recognition not supported');
        }
    }

    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    createVoiceUI() {
        const voiceHTML = `
            <div id="voice-assistant" class="voice-assistant">
                <div class="voice-button" id="voice-button">
                    <i class="fas fa-microphone"></i>
                    <div class="voice-pulse"></div>
                </div>
                <div class="voice-status" id="voice-status">
                    <span id="voice-text">Click to speak</span>
                </div>
                <div class="voice-commands" id="voice-commands">
                    <h4 id="voice-commands-title">Voice Commands</h4>
                    <ul id="voice-commands-list">
                        <li>"Book appointment"</li>
                        <li>"Show services"</li>
                        <li>"Contact information"</li>
                        <li>"Start assessment"</li>
                        <li>"Switch language"</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', voiceHTML);
        
        document.getElementById('voice-button').addEventListener('click', () => {
            this.toggleListening();
        });

        // Listen for language changes from UI
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            if (this.recognition) {
                this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            }
            this.updateVoiceCommandsDisplay();
            console.log('Voice assistant language updated to:', this.currentLanguage);
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isListening) {
                this.recognition.stop();
            }
        });
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateVoiceUI() {
        const button = document.getElementById('voice-button');
        const status = document.getElementById('voice-status');
        const text = document.getElementById('voice-text');
        
        if (this.isListening) {
            button.classList.add('listening');
            status.style.display = 'block';
            text.textContent = 'Listening...';
        } else {
            button.classList.remove('listening');
            status.style.display = 'none';
            text.textContent = 'Click to speak';
        }
    }

    speak(text) {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            this.synthesis.speak(utterance);
        }
    }

    initializeCommands() {
        return {
            en: {
                'book appointment': () => this.navigateTo('book appointment/book.html'),
                'book an appointment': () => this.navigateTo('book appointment/book.html'),
                'make appointment': () => this.navigateTo('book appointment/book.html'),
                'show services': () => this.showServices(),
                'services': () => this.showServices(),
                'our services': () => this.showServices(),
                'contact information': () => this.showContact(),
                'contact': () => this.showContact(),
                'contact us': () => this.showContact(),
                'start assessment': () => this.navigateTo('symptom-assessment.html'),
                'ai assessment': () => this.navigateTo('symptom-assessment.html'),
                'symptom assessment': () => this.navigateTo('symptom-assessment.html'),
                'switch language': () => this.switchLanguage(),
                'change language': () => this.switchLanguage(),
                'home': () => this.navigateTo('home.html'),
                'go home': () => this.navigateTo('home.html'),
                'main page': () => this.navigateTo('home.html'),
                'success stories': () => this.navigateTo('success-stories.html'),
                'stories': () => this.navigateTo('success-stories.html'),
                'about us': () => this.navigateTo('about us/aboutus.html'),
                'about': () => this.navigateTo('about us/aboutus.html'),
                'dark mode': () => this.toggleDarkMode(),
                'toggle dark mode': () => this.toggleDarkMode(),
                'help': () => this.showHelp(),
                'what can you do': () => this.showHelp(),
                'commands': () => this.showHelp()
            },
            ar: {
                'احجز موعد': () => this.navigateTo('book appointment/book.html'),
                'حجز موعد': () => this.navigateTo('book appointment/book.html'),
                'عرض الخدمات': () => this.showServices(),
                'الخدمات': () => this.showServices(),
                'معلومات التواصل': () => this.showContact(),
                'تواصل معنا': () => this.showContact(),
                'ابدأ التقييم': () => this.navigateTo('symptom-assessment.html'),
                'تقييم الأعراض': () => this.navigateTo('symptom-assessment.html'),
                'تبديل اللغة': () => this.switchLanguage(),
                'تغيير اللغة': () => this.switchLanguage(),
                'الرئيسية': () => this.navigateTo('home.html'),
                'الصفحة الرئيسية': () => this.navigateTo('home.html'),
                'قصص النجاح': () => this.navigateTo('success-stories.html'),
                'من نحن': () => this.navigateTo('about us/aboutus.html'),
                'الوضع المظلم': () => this.toggleDarkMode(),
                'مساعدة': () => this.showHelp(),
                'ماذا يمكنك أن تفعل': () => this.showHelp()
            }
        };
    }

    processVoiceCommand(transcript) {
        console.log('Voice command:', transcript);
        
        const commands = this.commands[this.currentLanguage];
        let commandExecuted = false;
        
        // More flexible command matching
        for (const [command, action] of Object.entries(commands)) {
            const commandWords = command.toLowerCase().split(' ');
            const transcriptWords = transcript.toLowerCase().split(' ');
            
            // Check if all command words are present in transcript
            const allWordsPresent = commandWords.every(word => 
                transcriptWords.some(transcriptWord => 
                    transcriptWord.includes(word) || word.includes(transcriptWord)
                )
            );
            
            if (allWordsPresent || transcript.includes(command.toLowerCase())) {
                const message = this.currentLanguage === 'ar' ? 
                    `تنفيذ ${command}` : 
                    `Executing ${command}`;
                this.speak(message);
                action();
                commandExecuted = true;
                break;
            }
        }
        
        if (!commandExecuted) {
            const message = this.currentLanguage === 'ar' ? 
                'الأمر غير معروف. يرجى المحاولة مرة أخرى.' : 
                'Command not recognized. Please try again.';
            this.speak(message);
        }
    }

    navigateTo(url) {
        window.location.href = url;
    }

    showServices() {
        const message = this.currentLanguage === 'ar' ?
            'خدماتنا تشمل العلاج اليدوي، العلاج الطبيعي، وإعادة التأهيل الشامل' :
            'Our services include Manual Therapy, Physical Therapy, and Comprehensive Rehabilitation';
        this.speak(message);
        // Could also open services modal or navigate to services page
    }

    showContact() {
        const message = this.currentLanguage === 'ar' ?
            'تواصل معنا على الرقم +962775252444 أو البريد الإلكتروني alboqaiworld@gmail.com' :
            'Contact us at +962775252444 or email alboqaiworld@gmail.com';
        this.speak(message);
    }

    switchLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.currentLanguage = newLang;
        localStorage.setItem('lang', newLang);
        
        // Update recognition language
        if (this.recognition) {
            this.recognition.lang = newLang === 'ar' ? 'ar-SA' : 'en-US';
        }
        
        const message = newLang === 'ar' ? 'تم تبديل اللغة إلى العربية' : 'Language switched to English';
        this.speak(message);
        
        // Trigger language change event
        const event = new CustomEvent('languageChanged', { detail: { language: newLang } });
        document.dispatchEvent(event);
        
        // Update UI language
        if (typeof setLanguage === 'function') {
            setLanguage(newLang);
        }
    }

    toggleDarkMode() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.speak(`Switched to ${newTheme} mode`);
    }

    showHelp() {
        const commands = this.currentLanguage === 'ar' ? 
            'الأوامر المتاحة: احجز موعد، عرض الخدمات، معلومات التواصل، ابدأ التقييم، تبديل اللغة، الوضع المظلم' :
            'Available commands: Book appointment, Show services, Contact information, Start assessment, Switch language, Dark mode, Help';
        this.speak(commands);
    }

    loadLanguageModel() {
        // Advanced language processing could be added here
        // For now, we use simple keyword matching
        this.updateVoiceCommandsDisplay();
    }

    updateVoiceCommandsDisplay() {
        const title = document.getElementById('voice-commands-title');
        const list = document.getElementById('voice-commands-list');
        
        if (this.currentLanguage === 'ar') {
            title.textContent = 'أوامر الصوت';
            list.innerHTML = `
                <li>"احجز موعد"</li>
                <li>"عرض الخدمات"</li>
                <li>"معلومات التواصل"</li>
                <li>"ابدأ التقييم"</li>
                <li>"تبديل اللغة"</li>
            `;
        } else {
            title.textContent = 'Voice Commands';
            list.innerHTML = `
                <li>"Book appointment"</li>
                <li>"Show services"</li>
                <li>"Contact information"</li>
                <li>"Start assessment"</li>
                <li>"Switch language"</li>
            `;
        }
    }
}

// Initialize voice assistant
let voiceAssistant;
document.addEventListener('DOMContentLoaded', function() {
    voiceAssistant = new VoiceAssistant();
}); 
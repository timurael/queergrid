// ===== OPTIMIZED QUEER GRID APPLICATION =====
// Performance-first architecture with module pattern

'use strict';

// ===== CONFIGURATION & CONSTANTS =====
const CONFIG = Object.freeze({
    API_BASE_URL: 'http://localhost:3002',
    ENVIRONMENT: 'production',
    SELECTORS: {
        moodToggle: '#moodToggle',
        posterStream: '#posterStream',
        consentPopup: '#consentPopup',
        emailForm: '#emailForm',
        storySection: '#story'
    },
    TIMING: {
        consentDelay: 1000,
        sparkleTimeout: 3000,
        notificationTimeout: 6000,
        carouselInterval: 2500,
        autoRefreshInterval: 30000
    },
    SPARKLES: ['🏳️‍⚧️', '🏳️‍🌈', '🧠', '🦄', '🧿', '💻', '🎨'],
    POSTER_IMAGES: [
        '9cdedb18a9890863f944403e4fe59350.jpg',
        '630f003a7cd1d5026b2c5b0846fa485d.jpg',
        '15e6cbc005353d9b1ec5f601247109f9.jpg',
        '27511f9c1acb785b350f646c015f5ff5.jpg',
        'c1531ac005b4c5fb19f24fae05419ddd.jpg',
        '191f289e6a2ef9b290731b22c36b4b9e.jpg'
    ]
});

// ===== PERFORMANCE UTILITIES =====
const Performance = {
    // Optimized debounce with immediate option
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // Throttle for high-frequency events
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },

    // Efficient DOM query with caching
    $: (() => {
        const cache = new Map();
        return (selector, context = document) => {
            const key = `${selector}:${context === document ? 'doc' : context.id || 'ctx'}`;
            if (!cache.has(key)) {
                cache.set(key, context.querySelector(selector));
            }
            return cache.get(key);
        };
    })(),

    // Batch DOM operations
    batchDOM(operations) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                operations.forEach(op => op());
                resolve();
            });
        });
    },

    // Optimized class management
    toggleClasses(element, classes) {
        if (!element) return;
        const classList = element.classList;
        classes.forEach(cls => {
            if (cls.startsWith('!')) {
                classList.remove(cls.slice(1));
            } else {
                classList.add(cls);
            }
        });
    }
};

// ===== STATE MANAGEMENT =====
const AppState = {
    data: {
        currentMode: 'cute',
        consentGiven: false,
        consentChoices: { essential: true, analytics: false, marketing: false },
        backendAvailable: true,
        isLoading: false,
        posters: [],
        mousePosition: { x: 0, y: 0 }
    },

    get(key) {
        return this.data[key];
    },

    set(key, value) {
        this.data[key] = value;
        this.notify(key, value);
    },

    update(updates) {
        Object.assign(this.data, updates);
        Object.keys(updates).forEach(key => this.notify(key, updates[key]));
    },

    // Simple pub/sub for state changes
    listeners: new Map(),
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    },

    notify(key, value) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => callback(value));
        }
    }
};

// ===== API MODULE =====
const API = {
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    },

    async checkHealth() {
        try {
            await this.request('/health');
            AppState.set('backendAvailable', true);
            return true;
        } catch (error) {
            AppState.set('backendAvailable', false);
            return false;
        }
    },

    async subscribeEmail(data) {
        return this.request('/api/email/subscribe', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async recordConsent(data) {
        return this.request('/api/gdpr/consent', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

// ===== UI COMPONENTS =====
const UI = {
    // Efficient notification system
    showNotification(message, type = 'info') {
        // Remove existing notifications efficiently
        document.querySelectorAll('.notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close">×</button>
        `;

        // Event delegation for close button
        notification.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                notification.remove();
            }
        });

        document.body.appendChild(notification);
        Effects.createSparkle(notification);

        // Auto-remove with animation
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, CONFIG.TIMING.notificationTimeout);
    },

    // Optimized loading state
    setLoading(isLoading) {
        AppState.set('isLoading', isLoading);
        
        const elements = ['submitBtn', 'email', 'consent'].map(id => 
            Performance.$(`#${id}`)
        ).filter(Boolean);

        Performance.batchDOM(() => {
            elements.forEach(el => {
                el.disabled = isLoading;
                if (el.id === 'submitBtn') {
                    Performance.toggleClasses(el, isLoading ? ['loading'] : ['!loading']);
                }
            });
        });
    },

    // Efficient message display
    showMessage(message, type) {
        const messageElement = Performance.$(`#${type}Message`);
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.display = 'block';
        }
    },

    hideMessages() {
        ['success', 'error'].forEach(type => {
            const element = Performance.$(`#${type}Message`);
            if (element) element.style.display = 'none';
        });
    }
};

// ===== VISUAL EFFECTS MODULE =====
const Effects = {
    // Optimized sparkle creation with object pooling
    sparklePool: [],
    
    getSparkle() {
        return this.sparklePool.pop() || document.createElement('div');
    },

    returnSparkle(sparkle) {
        sparkle.className = '';
        sparkle.style.cssText = '';
        sparkle.innerHTML = '';
        this.sparklePool.push(sparkle);
    },

    createSparkle(element, count = 1) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            const sparkle = this.getSparkle();
            sparkle.className = 'dynamic-sparkle';
            sparkle.innerHTML = CONFIG.SPARKLES[Math.floor(Math.random() * CONFIG.SPARKLES.length)];
            
            Object.assign(sparkle.style, {
                position: 'fixed',
                left: rect.left + Math.random() * rect.width + 'px',
                top: rect.top + Math.random() * rect.height + 'px',
                pointerEvents: 'none',
                zIndex: '9999',
                fontSize: Math.min(Math.max(window.innerWidth * 0.02, 16), 32) + 'px',
                animation: 'sparkleEffect 3s ease-out forwards'
            });

            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentElement) {
                    sparkle.parentElement.removeChild(sparkle);
                    this.returnSparkle(sparkle);
                }
            }, CONFIG.TIMING.sparkleTimeout);
        }
    },

    // Optimized explosion effect
    createExplosion(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const sparkleCount = 8;

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = this.getSparkle();
            const angle = (i / sparkleCount) * 2 * Math.PI;
            const distance = 100;
            
            sparkle.className = 'explosion-sparkle';
            sparkle.innerHTML = CONFIG.SPARKLES[i % CONFIG.SPARKLES.length];
            
            Object.assign(sparkle.style, {
                position: 'fixed',
                left: centerX + 'px',
                top: centerY + 'px',
                pointerEvents: 'none',
                zIndex: '9999',
                fontSize: '1.5rem',
                '--end-x': centerX + Math.cos(angle) * distance + 'px',
                '--end-y': centerY + Math.sin(angle) * distance + 'px',
                animation: 'explosionEffect 1.5s ease-out forwards'
            });

            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentElement) {
                    sparkle.parentElement.removeChild(sparkle);
                    this.returnSparkle(sparkle);
                }
            }, 1500);
        }
    }
};

// ===== MOOD SYSTEM =====
const MoodSystem = {
    init() {
        const toggle = Performance.$(CONFIG.SELECTORS.moodToggle);
        if (toggle) {
            toggle.addEventListener('click', this.toggle.bind(this));
        }
    },

    toggle() {
        const newMode = AppState.get('currentMode') === 'cute' ? 'angry' : 'cute';
        AppState.set('currentMode', newMode);
        document.documentElement.setAttribute('data-mode', newMode);
        
        // Switch logo based on mood
        this.switchLogo(newMode);
        
        if (newMode === 'angry') {
            PosterSystem.init();
            AngryMode.init();
        } else {
            PosterSystem.clear();
            AngryMode.clear();
        }
    },

    switchLogo(mode) {
        const logoImages = document.querySelectorAll('.logo-image');
        const newLogoSrc = mode === 'cute' ? 'logo/logocute.png' : 'logo/logonotcute.png';
        
        logoImages.forEach(logoImg => {
            logoImg.src = newLogoSrc;
        });
    }
};

// ===== POSTER SYSTEM =====
const PosterSystem = {
    init() {
        this.clear();
        const container = Performance.$(CONFIG.SELECTORS.posterStream);
        if (!container) return;

        const fragment = document.createDocumentFragment();
        
        CONFIG.POSTER_IMAGES.forEach((imageName, index) => {
            const poster = document.createElement('img');
            poster.src = `queer rage photos/${imageName}`;
            poster.className = 'poster';
            poster.alt = 'Queer rage poster';
            poster.loading = 'lazy'; // Performance optimization
            
            Object.assign(poster.style, {
                left: Math.random() * (window.innerWidth - 200) + 'px',
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
                animationDelay: `${index * 2}s`
            });
            
            fragment.appendChild(poster);
        });
        
        container.appendChild(fragment);
        AppState.set('posters', Array.from(container.querySelectorAll('.poster')));
    },

    clear() {
        const container = Performance.$(CONFIG.SELECTORS.posterStream);
        if (container) {
            container.innerHTML = '';
            AppState.set('posters', []);
        }
    },

    jitterNearby: Performance.throttle(function() {
        const { x, y } = AppState.get('mousePosition');
        const posters = AppState.get('posters');
        
        posters.forEach(poster => {
            const rect = poster.getBoundingClientRect();
            const distance = Math.hypot(
                x - (rect.left + rect.width / 2),
                y - (rect.top + rect.height / 2)
            );
            
            if (distance < 150) {
                const jitterX = (Math.random() - 0.5) * 16;
                const jitterY = (Math.random() - 0.5) * 16;
                poster.style.transform += ` translate(${jitterX}px, ${jitterY}px)`;
                
                setTimeout(() => {
                    poster.style.transform = poster.style.transform.replace(/translate\([^)]*\)/g, '');
                }, 100);
            }
        });
    }, 50)
};

// ===== ANGRY MODE EFFECTS =====
const AngryMode = {
    init() {
        this.addCursorEffect();
        this.startGlitchEffects();
    },

    clear() {
        this.removeCursorEffect();
        this.stopGlitchEffects();
    },

    addCursorEffect() {
        document.addEventListener('mousemove', this.createTrail);
    },

    removeCursorEffect() {
        document.removeEventListener('mousemove', this.createTrail);
    },

    createTrail: Performance.throttle(function(e) {
        const trail = document.createElement('div');
        trail.className = 'angry-cursor-trail';
        Object.assign(trail.style, {
            position: 'fixed',
            left: e.clientX - 2 + 'px',
            top: e.clientY - 2 + 'px',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 500);
    }, 16), // ~60fps

    startGlitchEffects() {
        this.glitchInterval = setInterval(() => {
            this.triggerGlitch();
        }, 3000);
    },

    stopGlitchEffects() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
            this.glitchInterval = null;
        }
    },

    triggerGlitch() {
        const elements = document.querySelectorAll('h1, h2, .btn');
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        if (randomElement) {
            Performance.toggleClasses(randomElement, ['angry-glitch']);
            setTimeout(() => {
                Performance.toggleClasses(randomElement, ['!angry-glitch']);
            }, 200);
        }
    }
};

// ===== EMAIL SYSTEM =====
const EmailSystem = {
    async init() {
        const form = Performance.$(CONFIG.SELECTORS.emailForm);
        if (form && !form.hasAttribute('data-netlify')) {
            // Only add JavaScript handling if NOT using Netlify forms
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        // Check backend availability only if not using Netlify forms
        if (form && !form.hasAttribute('data-netlify')) {
            await API.checkHealth();
        }
    },

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email')?.trim();
        const consent = formData.get('consent') === 'on';
        
        // Validation
        if (!this.validateEmail(email)) {
            UI.showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (!consent) {
            UI.showMessage('Please accept our privacy policy', 'error');
            return;
        }
        
        if (!AppState.get('consentGiven')) {
            UI.showMessage('Please accept our GDPR consent first', 'error');
            ConsentSystem.show();
            return;
        }
        
        UI.setLoading(true);
        UI.hideMessages();
        
        try {
            const result = await API.subscribeEmail({
                email,
                consent,
                source: 'website',
                timestamp: new Date().toISOString()
            });
            
            UI.showMessage(result.message || 'Successfully subscribed!', 'success');
            event.target.reset();
            Effects.createExplosion(Performance.$('#submitBtn'));
            
        } catch (error) {
            // Always show generic error message regardless of backend status
            const errorMsg = AppState.get('currentMode') === 'cute' 
                ? 'oops! something went wrong. please try again later, bb 💖'
                : 'SUBMISSION ERROR. TRY AGAIN LATER. ⚡';
            UI.showMessage(errorMsg, 'error');
            
        } finally {
            UI.setLoading(false);
        }
    },

    validateEmail(email) {
        return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
};

// ===== CONSENT SYSTEM =====
const ConsentSystem = {
    init() {
        // Load saved consent
        const saved = localStorage.getItem('gdpr-consent');
        if (saved) {
            AppState.update({
                consentChoices: JSON.parse(saved),
                consentGiven: true
            });
        } else {
            setTimeout(() => this.show(), CONFIG.TIMING.consentDelay);
        }
        
        this.bindEvents();
    },

    bindEvents() {
        const popup = Performance.$(CONFIG.SELECTORS.consentPopup);
        if (!popup) return;
        
        // Event delegation for all consent buttons
        popup.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) this[action]();
        });
    },

    show() {
        const popup = Performance.$(CONFIG.SELECTORS.consentPopup);
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            Effects.createSparkle(popup, 3);
        }
    },

    hide() {
        const popup = Performance.$(CONFIG.SELECTORS.consentPopup);
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    acceptAll() {
        this.saveChoices({ essential: true, analytics: true, marketing: true });
        UI.showNotification('Thank you for trusting us with your data! 💖', 'success');
        Effects.createExplosion(Performance.$('#acceptAllConsent'));
    },

    acceptSelected() {
        const choices = {
            essential: true,
            analytics: Performance.$('#analyticsCookies')?.checked || false,
            marketing: Performance.$('#marketingConsent')?.checked || false
        };
        this.saveChoices(choices);
        UI.showNotification('Your preferences have been saved', 'success');
    },

    rejectAll() {
        this.saveChoices({ essential: true, analytics: false, marketing: false });
        UI.showNotification('Only essential cookies will be used', 'info');
    },

    saveChoices(choices) {
        AppState.update({
            consentChoices: choices,
            consentGiven: true
        });
        localStorage.setItem('gdpr-consent', JSON.stringify(choices));
        this.hide();
        
        // Send to backend if available
        if (AppState.get('backendAvailable')) {
            API.recordConsent(choices).catch(console.warn);
        }
    }
};

// ===== SCROLL OPTIMIZATION =====
const ScrollManager = {
    init() {
        const handler = Performance.throttle(this.handleScroll.bind(this), 16);
        window.addEventListener('scroll', handler, { passive: true });
    },

    handleScroll() {
        const scrollTop = window.pageYOffset;
        const header = Performance.$('.header');
        
        if (header) {
            header.style.transform = scrollTop > 100 
                ? 'translateY(-100%)' 
                : 'translateY(0)';
        }
    }
};

// ===== MOUSE TRACKING =====
const MouseTracker = {
    init() {
        const handler = Performance.throttle(this.updatePosition.bind(this), 16);
        document.addEventListener('mousemove', handler, { passive: true });
    },

    updatePosition(e) {
        AppState.set('mousePosition', { x: e.clientX, y: e.clientY });
        
        if (AppState.get('currentMode') === 'angry') {
            PosterSystem.jitterNearby();
        }
    }
};

// ===== MAIN APPLICATION =====
const App = {
    async init() {
        // Initialize core systems
        AppState.subscribe('currentMode', (mode) => {
            document.documentElement.setAttribute('data-mode', mode);
        });

        // Initialize modules in order of dependency
        await Promise.all([
            ConsentSystem.init(),
            EmailSystem.init(),
            MoodSystem.init()
        ]);

        // Initialize performance optimizations
        ScrollManager.init();
        MouseTracker.init();

        // Add global error handling
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handleError.bind(this));

        console.log('🚀 Queer Grid App initialized with performance optimizations');
    },

    handleError(event) {
        console.error('App Error:', event.error || event.reason);
        UI.showNotification('Something went wrong, but the revolution continues! 🚀', 'error');
    }
};

// ===== INITIALIZATION =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// ===== EXPORTS FOR GLOBAL ACCESS =====
window.QueergridApp = {
    AppState,
    API,
    UI,
    Effects,
    Performance
}; 
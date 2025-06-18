// ===== CONFIGURATION =====
const API_BASE_URL = 'http://localhost:3002'; // Local email collection server

// Environment detection and graceful degradation
const ENVIRONMENT = 'production';
const IS_PRODUCTION = ENVIRONMENT === 'production';

// Override backend functions for production if backend is not available
if (IS_PRODUCTION) {
  // Check if backend is available
  let backendAvailable = true;
  
  // Test backend connectivity (silently)
  fetch(API_BASE_URL + '/health')
    .catch(() => {
      backendAvailable = false;
      console.warn('🚨 Backend not available - running in frontend-only mode');
      // No user notification - handle gracefully in background
    });
  
  // Override email signup for production without backend
  const originalHandleEmailSignup = handleEmailSignup;
  window.handleEmailSignup = async function(event) {
    event.preventDefault();
    
    if (!backendAvailable) {
      // Gracefully handle - just show normal form validation
      showError(
        currentMode === 'cute' ? 
        'oops! something went wrong. please try again later, bb 💖' : 
        'SUBMISSION ERROR. TRY AGAIN LATER. ⚡'
      );
      return;
    }
    
    return originalHandleEmailSignup(event);
  };
  
  // Override consent backend calls for production
  const originalSendConsentToBackend = sendConsentToBackend;
  window.sendConsentToBackend = async function(consentData) {
    if (!backendAvailable) {
      console.log('Consent saved locally only (backend unavailable)');
      return;
    }
    
    return originalSendConsentToBackend(consentData);
  };
}

// ===== QUEER GRID DUAL MOOD REVOLUTION ===== //

// ===== GDPR CONSENT MANAGEMENT ===== //
let consentGiven = false;
let consentChoices = {
    essential: true,
    analytics: false,
    marketing: false
};

// Initialize consent system
document.addEventListener('DOMContentLoaded', function() {
    initializeConsentSystem();
    setupConsentPopup();
});

function initializeConsentSystem() {
    // Check if consent has been given
    const savedConsent = localStorage.getItem('gdpr-consent');
    if (savedConsent) {
        consentChoices = JSON.parse(savedConsent);
        consentGiven = true;
        applyConsentChoices();
    } else {
        // Show consent popup after a short delay
        setTimeout(() => {
            showConsentPopup();
        }, 1000);
    }
}

function setupConsentPopup() {
    const acceptAllBtn = document.getElementById('acceptAllConsent');
    const acceptSelectedBtn = document.getElementById('acceptSelectedConsent');
    const rejectAllBtn = document.getElementById('rejectAllConsent');
    
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            acceptAllConsent();
        });
    }
    
    if (acceptSelectedBtn) {
        acceptSelectedBtn.addEventListener('click', () => {
            acceptSelectedConsent();
        });
    }
    
    if (rejectAllBtn) {
        rejectAllBtn.addEventListener('click', () => {
            rejectAllConsent();
        });
    }
}

function showConsentPopup() {
    const popup = document.getElementById('consentPopup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add sparkle effect
        createMultipleSparkles(3);
    }
}

function hideConsentPopup() {
    const popup = document.getElementById('consentPopup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function acceptAllConsent() {
    consentChoices = {
        essential: true,
        analytics: true,
        marketing: true
    };
    saveConsentChoices();
    hideConsentPopup();
    
    // Show success message
    showNotification(
        currentMode === 'cute' ? 
        'yay! thanks for trusting us with your data, bb! 💖' : 
        'CONSENT ACCEPTED. REVOLUTION CONTINUES. ⚡',
        'success'
    );
    
    // Create mega sparkle explosion
    createMegaSparkleExplosion();
}

function acceptSelectedConsent() {
    // Get user's choices from checkboxes
    const analyticsCheckbox = document.getElementById('analyticsCookies');
    const marketingCheckbox = document.getElementById('marketingConsent');
    
    consentChoices = {
        essential: true, // Always true
        analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
        marketing: marketingCheckbox ? marketingCheckbox.checked : false
    };
    
    saveConsentChoices();
    hideConsentPopup();
    
    showNotification(
        currentMode === 'cute' ? 
        'perfect! your choices have been saved 💫' : 
        'CONSENT PREFERENCES SAVED. ⚡',
        'success'
    );
    
    createSparkleExplosion(document.getElementById('acceptSelectedConsent'));
}

function rejectAllConsent() {
    consentChoices = {
        essential: true,
        analytics: false,
        marketing: false
    };
    saveConsentChoices();
    hideConsentPopup();
    
    showNotification(
        currentMode === 'cute' ? 
        'no worries! only essential cookies for you 🍪' : 
        'MINIMAL DATA COLLECTION ACTIVE. ⚡',
        'info'
    );
}

function saveConsentChoices() {
    const consentData = {
        ...consentChoices,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData));
    consentGiven = true;
    applyConsentChoices();
    
    // Send consent to backend
    sendConsentToBackend(consentData);
}

function applyConsentChoices() {
    // Apply analytics consent
    if (consentChoices.analytics) {
        initializeAnalytics();
    }
    
    // Apply marketing consent (affects email form)
    const marketingCheckbox = document.getElementById('consent');
    if (marketingCheckbox && consentChoices.marketing) {
        marketingCheckbox.checked = true;
    }
}

function initializeAnalytics() {
    // Privacy-friendly analytics - only if consent given
    if (consentChoices.analytics) {
        trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }
}

async function sendConsentToBackend(consentData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/gdpr/consent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                consent: consentData,
                source: 'website',
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            console.warn('Failed to send consent to backend');
        }
    } catch (error) {
        console.warn('Error sending consent to backend:', error);
    }
}

// ===== MOOD TOGGLE SYSTEM ===== //
let currentMode = 'cute';
const html = document.documentElement;
let posterStream, moodToggle;

// Poster image list
const posterImages = [
    '9cdedb18a9890863f944403e4fe59350.jpg',
    '630f003a7cd1d5026b2c5b0846fa485d.jpg',
    '15e6cbc005353d9b1ec5f601247109f9.jpg',
    '27511f9c1acb785b350f646c015f5ff5.jpg',
    'c1531ac005b4c5fb19f24fae05419ddd.jpg',
    '191f289e6a2ef9b290731b22c36b4b9e.jpg',
    'd9dbcb1104eb16ab8c436ec1181b8a21.jpg',
    'cdfe0e6c64e16752e1a909297f420c0d.jpg',
    'e32dfff756cc3a43076ecb3bb9840cfb.jpg',
    'b24876bcb00b1501e814aa7a781ea1f1.jpg',
    '3a34365b08819858368cc75cbc3a9c7a.jpg',
    'L&R 1 4 cover.jpg'
];

let posters = [];
let moodMouseX = 0;
let moodMouseY = 0;

// Initialize mood toggle when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    posterStream = document.getElementById('posterStream');
    moodToggle = document.getElementById('moodToggle');
    
    // Initialize correct logo on page load
    switchLogo();
    
    // Initialize mood toggle
    if (moodToggle) {
        moodToggle.addEventListener('click', toggleMood);
    }
    
    // Check if form is using Netlify (has data-netlify attribute)
    const emailForm = document.getElementById('emailForm');
    if (emailForm && !emailForm.hasAttribute('data-netlify')) {
        // Only add JavaScript handling if NOT using Netlify forms
        emailForm.addEventListener('submit', handleEmailSignup);
    }
});

function toggleMood() {
    currentMode = currentMode === 'cute' ? 'angry' : 'cute';
    html.setAttribute('data-mode', currentMode);
    
    // Switch logo based on mood
    switchLogo();
    
    if (currentMode === 'angry') {
        initializePosters();
        initializeAngryMode();
    } else {
        clearPosters();
        clearAngryMode();
    }
}

// Function to switch logo based on mood
function switchLogo() {
    const logoImages = document.querySelectorAll('.logo-image');
    const newLogoSrc = currentMode === 'cute' ? 'logo/logocute.png' : 'logo/logonotcute.png';
    
    logoImages.forEach(logoImg => {
        logoImg.src = newLogoSrc;
    });
}

// Initialize poster stream for angry mode
function initializePosters() {
    clearPosters();
    
    posterImages.forEach((imageName, index) => {
        const poster = document.createElement('img');
        poster.src = `queer rage photos/${imageName}`;
        poster.className = 'poster';
        poster.alt = 'Queer rage poster';
        
        // Random positioning and rotation
        const leftPosition = Math.random() * (window.innerWidth - 200);
        const rotation = Math.random() * 30 - 15; // -15 to 15 degrees
        const delay = index * 2; // Stagger the animations
        
        poster.style.left = `${leftPosition}px`;
        poster.style.transform = `rotate(${rotation}deg)`;
        poster.style.animationDelay = `${delay}s`;
        
        posterStream.appendChild(poster);
        posters.push(poster);
    });
}

function clearPosters() {
    if (posterStream) {
        posterStream.innerHTML = '';
        posters = [];
    }
}

// Mouse tracking for poster jitter effect
document.addEventListener('mousemove', (e) => {
    moodMouseX = e.clientX;
    moodMouseY = e.clientY;
    
    if (currentMode === 'angry' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        jitterNearbyPosters();
    }
});

function jitterNearbyPosters() {
    posters.forEach(poster => {
        const rect = poster.getBoundingClientRect();
        const posterCenterX = rect.left + rect.width / 2;
        const posterCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(moodMouseX - posterCenterX, 2) + 
            Math.pow(moodMouseY - posterCenterY, 2)
        );
        
        if (distance < 150) { // Within 150px of cursor
            const jitterX = (Math.random() - 0.5) * 16; // ±8px
            const jitterY = (Math.random() - 0.5) * 16; // ±8px
            poster.style.transform += ` translate(${jitterX}px, ${jitterY}px)`;
            
            // Reset after a short delay
            setTimeout(() => {
                poster.style.transform = poster.style.transform.replace(/translate\([^)]*\)/g, '');
            }, 100);
        }
    });
}

// ===== CAROUSEL ANIMATION =====
let currentCarouselIndex = 0;
const carouselTexts = document.querySelectorAll('.carousel-text');

function showNextCarouselText() {
    // Hide current text
    carouselTexts[currentCarouselIndex].classList.remove('active');
    
    // Move to next text
    currentCarouselIndex = (currentCarouselIndex + 1) % carouselTexts.length;
    
    // Show next text
    carouselTexts[currentCarouselIndex].classList.add('active');
}

// Start carousel animation
if (carouselTexts.length > 0) {
    setInterval(showNextCarouselText, 2500);
}

// ===== SMOOTH SCROLLING REVOLUTION =====
function scrollToStory() {
    const storySection = document.getElementById('story');
    storySection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Add sparkle effect on scroll
    createMultipleSparkles(5);
}

// ===== EMAIL SIGNUP REVOLUTION =====
async function handleEmailSignup(event) {
    event.preventDefault();
    
    const form = document.getElementById('emailForm');
    const emailInput = document.getElementById('email');
    const consentInput = document.getElementById('consent');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // Clear previous messages
    hideMessages();
    
    // Get form data
    const formData = new FormData(form);
    const email = formData.get('email').trim();
    const consent = consentInput.checked;
    
    // Client-side validation
    if (!email) {
        showError('drop that email, bb! we need it for the revolution ⚡');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('hmm, that email looks sus 👀 try again?');
        return;
    }
    
    if (!consent) {
        showError('we need your consent to send you revolutionary updates! 🏳️‍🌈');
        return;
    }
    
    // Check if GDPR consent has been given
    if (!consentGiven) {
        showError('please accept our privacy policy first! 🍪');
        showConsentPopup();
        return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Add sparkle explosion
    createSparkleExplosion(submitBtn);
    
    try {
        // Capture UTM parameters
        captureUTMParameters();
        
        // Prepare submission data
        const submissionData = {
            email: email,
            consent: consent,
            source: formData.get('source') || 'website',
            utmSource: formData.get('utmSource') || null,
            utmMedium: formData.get('utmMedium') || null,
            utmCampaign: formData.get('utmCampaign') || null
        };
        
        // Submit to backend
        const response = await fetch(`${API_BASE_URL}/api/email/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            if (result.alreadySubscribed) {
                showSuccess('you\'re already part of the revolution! 🌈✨');
                showNotification('already in the revolution! 🌈✨', 'info');
            } else if (result.requiresVerification) {
                showSuccess('WELCOME TO THE REVOLUTION! 🚀 check your email for verification magic ✨');
                showNotification('check your email for the verification magic! ✨', 'success');
            } else {
                showSuccess('REVOLUTIONARY SIGNUP COMPLETE! 🚀');
                showNotification('WELCOME TO THE REVOLUTION! 🚀', 'success');
            }
            
            // Clear form
            form.reset();
            
            // Track successful subscription
            trackEvent('email_subscription', {
                email_hash: hashEmail(email),
                source: submissionData.source
            });
            
        } else {
            // Error
            const errorMsg = result.error || 'something went wrong in the revolution 😅 try again?';
            showError(errorMsg);
            showNotification(errorMsg, 'error');
            
            // Track error
            trackEvent('email_subscription_error', {
                error: result.code || 'unknown_error'
            });
        }
        
    } catch (error) {
        console.error('Subscription error:', error);
        
        // More helpful error message for local development
        let errorMsg;
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            errorMsg = currentMode === 'cute' ? 
                'oops bb! the local email server isn\'t running 😅 check the setup guide!' : 
                'LOCAL EMAIL SERVER OFFLINE. CHECK SETUP INSTRUCTIONS. ⚡';
        } else {
            errorMsg = currentMode === 'cute' ? 
                'network hiccup in the matrix 🌐 try again in a moment?' :
                'NETWORK ERROR. RETRY REVOLUTION. 🌐';
        }
        
        // Only show error, don't auto-scroll to avoid page jumping
        showError(errorMsg);
        
        // Track network error
        trackEvent('email_subscription_network_error', {
            error: error.message
        });
        
    } finally {
        setLoading(false);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== TELEGRAM REVOLUTION =====
function joinTelegram() {
    // Replace with your actual Telegram group invite link
    const telegramLink = 'https://t.me/your_actual_queer_grid_invite_link';
    
    showNotification('opening the portal to revolution central 👑✨', 'info');
    
    // Create mega sparkle effect
    createMegaSparkleExplosion();
    
    // Open Telegram after sparkle effect
    setTimeout(() => {
        window.open(telegramLink, '_blank');
    }, 1200);
}

// ===== REVOLUTIONARY NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create revolutionary notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification with sparkle effect
    document.body.appendChild(notification);
    createSparkleEffect(notification);
    
    // Auto-remove after 6 seconds (longer for revolutionary messages)
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutNotification 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 6000);
}

// ===== ENHANCED SPARKLE REVOLUTION =====
function createSparkleEffect(element) {
    const sparkles = ['🏳️‍⚧️', '🏳️‍🌈', '🧠', '🦄', '🧿', '💻', '🎨'];
    const sparkle = document.createElement('div');
    
    sparkle.className = 'dynamic-sparkle';
    sparkle.innerHTML = sparkles[Math.floor(Math.random() * sparkles.length)];
    
    const rect = element.getBoundingClientRect();
    sparkle.style.position = 'fixed';
    sparkle.style.left = rect.left + Math.random() * rect.width + 'px';
    sparkle.style.top = rect.top + Math.random() * rect.height + 'px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.fontSize = clamp(1, window.innerWidth * 0.03, 2) + 'rem';
    sparkle.style.animation = 'revolutionarySparkle 3s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 3000);
}

function createMultipleSparkles(count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'chaos-sparkle';
            const gaySparkles = ['🏳️‍⚧️', '🏳️‍🌈', '🧠', '🦄', '🧿', '💻', '🎨'];
            sparkle.innerHTML = gaySparkles[Math.floor(Math.random() * gaySparkles.length)];
            
            sparkle.style.position = 'fixed';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = Math.random() * window.innerHeight + 'px';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';
            sparkle.style.fontSize = '2rem';
            sparkle.style.animation = 'chaosSparkle 2s ease-out forwards';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 2000);
        }, i * 200);
    }
}

function createSparkleExplosion(element) {
    const sparkleCount = 8;
    const sparkles = ['🏳️‍⚧️', '🏳️‍🌈', '🧠', '🦄', '🧿', '💻', '🎨'];
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'explosion-sparkle';
        sparkle.innerHTML = sparkles[i];
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        sparkle.style.position = 'fixed';
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.style.fontSize = '1.5rem';
        
        // Calculate explosion direction
        const angle = (i / sparkleCount) * 2 * Math.PI;
        const distance = 100;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        sparkle.style.setProperty('--end-x', endX + 'px');
        sparkle.style.setProperty('--end-y', endY + 'px');
        sparkle.style.animation = 'sparkleExplosion 1.5s ease-out forwards';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1500);
    }
}

function createMegaSparkleExplosion() {
    const sparkleCount = 15;
    const sparkles = ['🏳️‍⚧️', '🏳️‍🌈', '🧠', '🦄', '🧿', '💻', '🎨'];
    
    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = sparkles[Math.floor(Math.random() * sparkles.length)];
            
            sparkle.style.position = 'fixed';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = Math.random() * window.innerHeight + 'px';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '10000';
            sparkle.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
            sparkle.style.animation = 'megaExplosion 3s ease-out forwards';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 3000);
        }, i * 100);
    }
}

// ===== VIBE GALLERY REVOLUTION =====
document.addEventListener('DOMContentLoaded', function() {
    const vibeCards = document.querySelectorAll('.vibe-card');
    
    vibeCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const messages = [
                'trans excellence is the standard, bbs! 🏳️‍⚧️🧠',
                'code that liberates > code that exploits 💻🦄',
                'creative chaos is how we break the system 🎨🧿',
                'mutual aid, not charity - we lift each other up 🏳️‍🌈💻',
                'building the future we deserve, one line at a time 🦄🎨',
                'radical love changes EVERYTHING 🧿🏳️‍⚧️'
            ];
            
            showNotification(messages[index], 'info');
            createSparkleExplosion(this);
            
            // Add temporary glow effect
            this.style.boxShadow = '0 0 30px rgba(255, 20, 147, 0.6)';
            setTimeout(() => {
                this.style.boxShadow = '';
            }, 1000);
        });
        
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// ===== REVOLUTIONARY SCROLL EFFECTS =====
function handleScrollAnimations() {
    // Removed story-block animations - they appear immediately now
    const elements = document.querySelectorAll('.telegram-preview');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-in');
        }
    });
}

// ===== GLITCH TEXT REVOLUTION =====
function addGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
        if (!element.hasAttribute('data-text')) {
            element.setAttribute('data-text', element.textContent);
        }
    });
}

// ===== HEADER REVOLUTION =====
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 150) {
        // Scrolling down - hide header
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up - show header
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// ===== REVOLUTIONARY KEYBOARD NAVIGATION =====
document.addEventListener('keydown', function(e) {
    // Escape key closes notifications and resets effects
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notif => notif.remove());
        
        // Remove any sparkles
        const sparkles = document.querySelectorAll('.dynamic-sparkle, .chaos-sparkle, .explosion-sparkle');
        sparkles.forEach(sparkle => sparkle.remove());
    }
    
    // Space bar creates random sparkle
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        createMultipleSparkles(3);
    }
    
    // Enhanced tab navigation
    if (e.key === 'Tab') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('vibe-card')) {
            createSparkleEffect(focusedElement);
        }
    }
});

// ===== MOUSE-RESPONSIVE FLOATING EMOJIS =====
let mouseX = 0;
let mouseY = 0;
let isMouseMoving = false;

function initMouseInteraction() {
    const floatingEmojis = document.querySelectorAll('.floating-emoji');
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        
        // Clear the timeout if it exists
        clearTimeout(window.mouseStopTimeout);
        
        // Set timeout to detect when mouse stops
        window.mouseStopTimeout = setTimeout(() => {
            isMouseMoving = false;
            resetEmojiPositions();
        }, 2000);
        
        updateEmojiPositions();
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        isMouseMoving = false;
        resetEmojiPositions();
    });
}

function updateEmojiPositions() {
    const floatingEmojis = document.querySelectorAll('.floating-emoji');
    
    floatingEmojis.forEach((emoji, index) => {
        const rect = emoji.getBoundingClientRect();
        const emojiCenterX = rect.left + rect.width / 2;
        const emojiCenterY = rect.top + rect.height / 2;
        
        // Calculate distance from mouse
        const deltaX = mouseX - emojiCenterX;
        const deltaY = mouseY - emojiCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only affect emojis within a certain range
        const maxDistance = 300;
        if (distance < maxDistance) {
            // Calculate influence (closer = stronger effect)
            const influence = (maxDistance - distance) / maxDistance;
            
            // Very subtle movement - much slower
            const moveX = (deltaX / distance) * influence * 15; // Reduced from 30
            const moveY = (deltaY / distance) * influence * 15; // Reduced from 30
            
            // Apply gentle rotation based on movement
            const rotation = (deltaX / distance) * influence * 8; // Reduced from 15
            
            // Apply transform with slow transition
            emoji.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(${1 + influence * 0.05})`;
        }
    });
}

function resetEmojiPositions() {
    const floatingEmojis = document.querySelectorAll('.floating-emoji');
    
    floatingEmojis.forEach((emoji) => {
        emoji.style.transform = '';
    });
}

// ===== PERFORMANCE & ACCESSIBILITY =====
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

function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
}

// Debounced scroll handler
const debouncedScrollHandler = debounce(handleScrollAnimations, 100);
window.addEventListener('scroll', debouncedScrollHandler);

// Initialize mouse interaction when page loads
document.addEventListener('DOMContentLoaded', () => {
    initMouseInteraction();
});

// ===== ACCESSIBILITY REVOLUTION =====
// Respect user preferences
if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast');
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
    
    // Disable intensive animations for reduced motion users
    const chaosBackground = document.querySelector('.chaos-bg');
    if (chaosBackground) {
        chaosBackground.style.display = 'none';
    }
}

// ===== ENHANCED DYNAMIC STYLES =====
const revolutionaryStyles = document.createElement('style');
revolutionaryStyles.textContent = `
    /* Revolutionary Notification Styles */
    .notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(25px);
        border: 3px solid;
        border-image: linear-gradient(135deg, #FF1493, #E0218A, #C471ED) 1;
        border-radius: 1.5rem;
        padding: 1.2rem 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 12px 40px rgba(255, 20, 147, 0.2);
        z-index: 10000;
        animation: slideInNotification 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 450px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
    
    .notification-success {
        border-image: linear-gradient(135deg, #A8E6CF, #98FB98, #00FF7F) 1;
        background: linear-gradient(135deg, rgba(168, 230, 207, 0.1), rgba(255, 255, 255, 0.98));
    }
    
    .notification-error {
        border-image: linear-gradient(135deg, #FF1493, #FF69B4, #FFB3DA) 1;
        background: linear-gradient(135deg, rgba(255, 20, 147, 0.1), rgba(255, 255, 255, 0.98));
    }
    
    .notification-info {
        border-image: linear-gradient(135deg, #87CEEB, #00BFFF, #1E90FF) 1;
        background: linear-gradient(135deg, rgba(135, 206, 235, 0.1), rgba(255, 255, 255, 0.98));
    }
    
    .notification-message {
        flex: 1;
        font-size: 1rem;
        line-height: 1.4;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.8rem;
        cursor: pointer;
        color: #888;
        transition: all 0.2s ease;
        font-weight: bold;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .notification-close:hover {
        color: #FF1493;
        background: rgba(255, 20, 147, 0.1);
        transform: scale(1.1);
    }
    
    @keyframes slideInNotification {
        from {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideOutNotification {
        from {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
        }
    }
    
    /* Revolutionary Sparkle Animations */
    @keyframes revolutionarySparkle {
        0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-80px) scale(0.3) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes chaosSparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0.2) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes sparkleExplosion {
        0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.3) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes megaExplosion {
        0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(2) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0.1) rotate(720deg);
            opacity: 0;
        }
    }
    
    /* Scroll animations - removed story block animations */
    
    /* Mobile notification adjustments */
    @media (max-width: 768px) {
        .notification {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
            font-size: 0.95rem;
            padding: 1rem 1.5rem;
        }
        
        .notification-close {
            font-size: 1.5rem;
            width: 25px;
            height: 25px;
        }
    }
    
    /* Reduced motion overrides */
    @media (prefers-reduced-motion: reduce) {
        .notification {
            animation: none !important;
        }
        
        .dynamic-sparkle, .chaos-sparkle, .explosion-sparkle {
            display: none !important;
        }
    }
`;

document.head.appendChild(revolutionaryStyles);

// ===== INITIALIZATION REVOLUTION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 QUEER GRID REVOLUTION LOADED! 🚀');
    console.log('✨ Time to break some systems and build better ones ✨');
    
    // Initialize all revolutionary features
    handleScrollAnimations();
    addGlitchEffect();
    manageChaosBackground();
    
    // Add initial sparkle shower
    setTimeout(() => {
        createMultipleSparkles(8);
    }, 1000);
    
    // Page loaded animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
    
    // Random sparkle intervals (but not too much)
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 10 seconds
            createMultipleSparkles(2);
        }
    }, 10000);
});

// ===== EASTER EGGS =====
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        // KONAMI CODE ACTIVATED - MEGA SPARKLE REVOLUTION
        showNotification('KONAMI CODE ACTIVATED! MAXIMUM CHAOS MODE ENGAGED! 🌈⚡👑', 'success');
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                createMegaSparkleExplosion();
            }, i * 200);
        }
        
        konamiCode = [];
    }
});

// ===== ANGRY MODE ENHANCEMENTS =====
let angryModeInterval;
let glitchElements = [];

function initializeAngryMode() {
    // Add glitch effect to text elements
    addAngryModeEffects();
    
    // Start continuous glitch effects
    startAngryModeEffects();
    
    // Add angry mode cursor trail
    addAngryModeCursor();
    
    // Transform text content for angry mode
    transformAngryModeText();
}

function clearAngryMode() {
    // Clear all angry mode effects
    if (angryModeInterval) {
        clearInterval(angryModeInterval);
        angryModeInterval = null;
    }
    
    // Remove glitch classes
    glitchElements.forEach(element => {
        element.classList.remove('angry-glitch');
    });
    glitchElements = [];
    
    // Clear cursor trail
    clearAngryModeCursor();
    
    // Restore original text content
    restoreOriginalText();
}

function addAngryModeEffects() {
    // Add glitch effects to headers and important text
    const headers = document.querySelectorAll('h1, h2, h3, .hero-title, .story-title');
    headers.forEach(header => {
        header.classList.add('angry-glitch');
        glitchElements.push(header);
    });
    
    // Add terminal-like effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (!button.querySelector('.terminal-prefix')) {
            const prefix = document.createElement('span');
            prefix.className = 'terminal-prefix';
            prefix.textContent = '$ ';
            button.prepend(prefix);
        }
    });
}

function startAngryModeEffects() {
    // Random screen glitch effects
    angryModeInterval = setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every interval
            triggerScreenGlitch();
        }
        
        if (Math.random() < 0.1) { // 10% chance for text scramble
            triggerTextScramble();
        }
    }, 500);
}

function triggerScreenGlitch() {
    const body = document.body;
    body.style.filter = 'hue-rotate(90deg) contrast(1.5) brightness(1.2)';
    
    setTimeout(() => {
        body.style.filter = 'hue-rotate(-45deg) contrast(0.8) brightness(0.9)';
    }, 50);
    
    setTimeout(() => {
        body.style.filter = '';
    }, 100);
}

function triggerTextScramble() {
    const glitchTargets = document.querySelectorAll('.angry-glitch');
    if (glitchTargets.length === 0) return;
    
    const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
    const originalText = target.textContent;
    const scrambledChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    
    // Scramble text briefly
    let scrambled = '';
    for (let i = 0; i < originalText.length; i++) {
        if (Math.random() < 0.3 && originalText[i] !== ' ') {
            scrambled += scrambledChars[Math.floor(Math.random() * scrambledChars.length)];
        } else {
            scrambled += originalText[i];
        }
    }
    
    target.textContent = scrambled;
    
    // Restore original text
    setTimeout(() => {
        target.textContent = originalText;
    }, 100);
}

let cursorTrail = [];
const maxTrailLength = 10;

function addAngryModeCursor() {
    document.addEventListener('mousemove', createAngryTrail);
}

function clearAngryModeCursor() {
    document.removeEventListener('mousemove', createAngryTrail);
    cursorTrail.forEach(trail => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
    });
    cursorTrail = [];
}

function createAngryTrail(e) {
    if (cursorTrail.length >= maxTrailLength) {
        const oldTrail = cursorTrail.shift();
        if (oldTrail.parentNode) {
            oldTrail.parentNode.removeChild(oldTrail);
        }
    }
    
    const trail = document.createElement('div');
    trail.className = 'angry-cursor-trail';
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    document.body.appendChild(trail);
    cursorTrail.push(trail);
    
    // Remove trail after animation
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
        const index = cursorTrail.indexOf(trail);
        if (index > -1) {
            cursorTrail.splice(index, 1);
        }
    }, 500);
}

const originalTexts = new Map();

function transformAngryModeText() {
    // Transform specific text elements for angry mode
    const transformations = {
        'join us': '> INFILTRATE_SYSTEM.exe',
        'drop your email': '> ACCESS_TERMINAL',
        'get in': '> HACK_THE_MATRIX',
        'feeling cute today': 'SYSTEM_STABLE.status',
        'feeling angry today': 'REVOLUTION_MODE.exe'
    };
    
    // Store original texts and apply transformations
    document.querySelectorAll('button, a, .mood-label').forEach(element => {
        const originalText = element.textContent.toLowerCase().trim();
        if (!originalTexts.has(element)) {
            originalTexts.set(element, element.innerHTML);
        }
        
        for (const [original, transformed] of Object.entries(transformations)) {
            if (originalText.includes(original)) {
                element.innerHTML = element.innerHTML.replace(new RegExp(original, 'gi'), transformed);
                break;
            }
        }
    });
}

function restoreOriginalText() {
    // Restore all original text content
    originalTexts.forEach((originalHTML, element) => {
        element.innerHTML = originalHTML;
    });
    
    // Remove terminal prefixes
    document.querySelectorAll('.terminal-prefix').forEach(prefix => {
        prefix.remove();
    });
}

// ===== GDPR FORM HELPERS =====

// Show/hide message functions
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Don't auto-scroll to success message - let users naturally see it
        // This prevents unwanted page jumping on form submission
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Don't auto-scroll to error - this was causing unwanted page jumping
        // Users can see the error message without forced scrolling
    }
}

function hideMessages() {
    const successElement = document.getElementById('successMessage');
    const errorElement = document.getElementById('errorMessage');
    
    if (successElement) successElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
}

// Loading state management
function setLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const emailInput = document.getElementById('email');
    const consentInput = document.getElementById('consent');
    
    if (!submitBtn) return;
    
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        if (emailInput) emailInput.disabled = true;
        if (consentInput) consentInput.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        if (emailInput) emailInput.disabled = false;
        if (consentInput) consentInput.disabled = false;
    }
}

// Capture UTM parameters from URL
function captureUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    const utmSourceField = document.getElementById('utmSource');
    const utmMediumField = document.getElementById('utmMedium');
    const utmCampaignField = document.getElementById('utmCampaign');
    
    if (utmSource && utmSourceField) utmSourceField.value = utmSource;
    if (utmMedium && utmMediumField) utmMediumField.value = utmMedium;
    if (utmCampaign && utmCampaignField) utmCampaignField.value = utmCampaign;
}

// Hash email for privacy-friendly analytics
function hashEmail(email) {
    // Simple hash function for client-side (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Privacy-friendly event tracking
function trackEvent(eventName, properties = {}) {
    // Only track if analytics is enabled and user has consented
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Console log for development
    if (window.location.hostname === 'localhost') {
        console.log('Event tracked:', eventName, properties);
    }
}

// Data rights modal functionality
function setupDataRightsModal() {
    const dataRightsLink = document.getElementById('dataRightsLink');
    
    if (dataRightsLink) {
        dataRightsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showDataRightsModal();
        });
    }
}

function showDataRightsModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="dataRightsModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔒 Your Data Rights</h3>
                    <button class="modal-close" onclick="closeDataRightsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Under GDPR, you have the following rights regarding your personal data:</p>
                    
                    <div class="rights-list">
                        <div class="right-item">
                            <h4>📋 Right of Access</h4>
                            <p>Get a copy of all personal data we have about you</p>
                        </div>
                        
                        <div class="right-item">
                            <h4>✏️ Right to Rectification</h4>
                            <p>Correct any inaccurate or incomplete data</p>
                        </div>
                        
                        <div class="right-item">
                            <h4>🗑️ Right to Erasure</h4>
                            <p>Delete your personal data (Right to be forgotten)</p>
                        </div>
                        
                        <div class="right-item">
                            <h4>⏸️ Right to Restriction</h4>
                            <p>Limit how we process your data</p>
                        </div>
                        
                        <div class="right-item">
                            <h4>📦 Right to Data Portability</h4>
                            <p>Get your data in a machine-readable format</p>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <p><strong>To exercise your rights:</strong></p>
                        <p>Email us at: <a href="mailto:privacy@queergrid.org">privacy@queergrid.org</a></p>
                        <p>We will respond within 30 days as required by law.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles if not already present
    if (!document.getElementById('modalStyles')) {
        const styles = `
            <style id="modalStyles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                }
                
                .modal-header {
                    padding: 20px 20px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 20px;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #333;
                    flex: 1;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close:hover {
                    color: #333;
                }
                
                .modal-body {
                    padding: 0 20px 20px;
                    color: #333;
                    line-height: 1.6;
                }
                
                .rights-list {
                    margin: 20px 0;
                }
                
                .right-item {
                    margin-bottom: 15px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }
                
                .right-item h4 {
                    margin: 0 0 8px 0;
                    color: #667eea;
                }
                
                .right-item p {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                }
                
                .contact-info {
                    margin-top: 25px;
                    padding: 15px;
                    background: #e3f2fd;
                    border-radius: 8px;
                }
                
                .contact-info a {
                    color: #667eea;
                    text-decoration: none;
                }
                
                .contact-info a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 768px) {
                    .modal-content {
                        margin: 10px;
                        max-height: 90vh;
                    }
                    
                    .modal-header, .modal-body {
                        padding: 15px;
                    }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

function closeDataRightsModal() {
    const modal = document.getElementById('dataRightsModal');
    if (modal) {
        modal.remove();
    }
}

// Initialize GDPR functionality
document.addEventListener('DOMContentLoaded', function() {
    setupDataRightsModal();
    captureUTMParameters();
});

// Export functions for potential external use
window.queerGridRevolution = {
    joinTelegram,
    createSparkleEffect,
    createMultipleSparkles,
    showNotification,
    initializeAngryMode,
    clearAngryMode,
    showDataRightsModal,
    closeDataRightsModal
}; 
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
function handleEmailSignup(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('drop that email, bb! we need it for the revolution ⚡', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('hmm, that email looks sus 👀 try again?', 'error');
        return;
    }
    
    // Revolutionary form submission
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span>joining...</span>';
    submitBtn.disabled = true;
    
    // Add sparkle explosion
    createSparkleExplosion(submitBtn);
    
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        emailInput.value = '';
        showNotification('WELCOME TO THE REVOLUTION! 🚀 check your email for the magic ✨', 'success');
        
        // Console log for backend integration
        console.log('Revolutionary email submitted:', email);
        console.log('Send this to your ConvertKit/Mailchimp/etc API');
    }, 2500);
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

// ===== GAY WALK BADGE SPECIAL POPUP =====
function showGayWalkPopup(event) {
    event.stopPropagation(); // Prevent regular click popup
    
    const popup = document.createElement('div');
    popup.className = 'gay-walk-popup';
    popup.innerHTML = `
        <div class="gay-walk-popup-content">
            <div class="gay-walk-flags">🏳️‍🌈🏳️‍⚧️</div>
            <div class="gay-walk-title">GAY WALK: ACTIVATED</div>
            <div class="gay-walk-subtitle">strutting through the revolution</div>
            <div class="gay-walk-message">✨ baby steps also counts <3 ✨</div>
        </div>
    `;

    // Position at top-right corner
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.right = '20px';
    popup.style.zIndex = '10001';

    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => popup.classList.add('show'), 10);

    // Create special sparkle explosion
    createGayWalkSparkles();

    // Remove after longer duration
    setTimeout(() => {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 500);
    }, 4000);
}

function createGayWalkSparkles() {
    const sparkleCount = 12;
    const gaySparkles = ['🏳️‍🌈', '🏳️‍⚧️', '✨', '💫', '🌈', '👑'];
    
    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'gay-walk-sparkle';
            sparkle.innerHTML = gaySparkles[Math.floor(Math.random() * gaySparkles.length)];
            
            // Start from badge area and spread out
            const startX = window.innerWidth / 2;
            const startY = 150;
            
            sparkle.style.position = 'fixed';
            sparkle.style.left = startX + 'px';
            sparkle.style.top = startY + 'px';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';
            sparkle.style.fontSize = '2rem';
            sparkle.style.opacity = '1';
            
            // Random explosion direction
            const angle = Math.random() * 2 * Math.PI;
            const distance = 100 + Math.random() * 150;
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            sparkle.style.setProperty('--end-x', endX + 'px');
            sparkle.style.setProperty('--end-y', endY + 'px');
            sparkle.style.animation = 'gayWalkSparkle 2s ease-out forwards';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 2000);
        }, i * 100);
    }
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

// Export functions for potential external use
window.queerGridRevolution = {
    joinTelegram,
    createSparkleEffect,
    createMultipleSparkles,
    showNotification
};

// ===== QUEER GRID - MINIMAL SPACESHIP INTERFACE =====
// Mode toggle, poster grid, and interactive effects

class QueerGridInterface {
    constructor() {
        this.currentMode = 'cute';
        this.posters = [];
        this.posterElements = [];
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.vibrationEnabled = 'vibrate' in navigator && !this.isReducedMotion;
        
        this.init();
    }

    // Initialize the interface
    init() {
        this.setupModeToggle();
        this.loadPosters();
        this.setupMouseEffects();
        this.setupAccessibility();
        this.setupFormHandler();
    }

    // ===== MODE TOGGLE SYSTEM =====
    setupModeToggle() {
        const toggle = document.getElementById('mode-toggle');
        const htmlElement = document.documentElement;
        
        if (!toggle) return;

        // Set initial state
        this.currentMode = toggle.checked ? 'cute' : 'angry';
        htmlElement.setAttribute('data-mode', this.currentMode);

        // Handle toggle changes
        toggle.addEventListener('change', (e) => {
            this.currentMode = e.target.checked ? 'cute' : 'angry';
            this.switchMode(this.currentMode);
        });

        // Update ARIA states
        toggle.addEventListener('change', (e) => {
            const switchElement = e.target.closest('.toggle-switch');
            if (switchElement) {
                switchElement.setAttribute('aria-checked', e.target.checked);
            }
        });
    }

    // Switch between cute and angry modes
    switchMode(mode) {
        const htmlElement = document.documentElement;
        
        // Update data attribute for CSS
        htmlElement.setAttribute('data-mode', mode);
        
        // Reposition posters with new effects
        this.repositionPosters();
        
        // Update cursor style
        this.updateCursorStyle(mode);
        
        // Trigger haptic feedback if available
        if (this.vibrationEnabled) {
            navigator.vibrate(50);
        }
        
        // Announce mode change for screen readers
        this.announceMode(mode);
    }

    // ===== POSTER GRID MANAGEMENT =====
    async loadPosters() {
        // Asset manifest for poster images
        const posterPaths = [
            'queer rage photos/9cdedb18a9890863f944403e4fe59350.jpg',
            'queer rage photos/630f003a7cd1d5026b2c5b0846fa485d.jpg',
            'queer rage photos/15e6cbc005353d9b1ec5f601247109f9.jpg',
            'queer rage photos/27511f9c1acb785b350f646c015f5ff5.jpg',
            'queer rage photos/c1531ac005b4c5fb19f24fae05419ddd.jpg',
            'queer rage photos/191f289e6a2ef9b290731b22c36b4b9e.jpg',
            'queer rage photos/d9dbcb1104eb16ab8c436ec1181b8a21.jpg',
            'queer rage photos/cdfe0e6c64e16752e1a909297f420c0d.jpg',
            'queer rage photos/e32dfff756cc3a43076ecb3bb9840cfb.jpg',
            'queer rage photos/b24876bcb00b1501e814aa7a781ea1f1.jpg',
            'queer rage photos/3a34365b08819858368cc75cbc3a9c7a.jpg',
            'queer rage photos/L&R 1 4 cover.jpg'
        ];

        const posterGrid = document.querySelector('.poster-grid');
        if (!posterGrid) return;

        // Create poster elements
        posterPaths.forEach((path, index) => {
            const img = document.createElement('img');
            img.src = path;
            img.alt = ''; // Decorative images
            img.className = 'poster';
            img.loading = 'lazy';
            
            // Error handling
            img.onerror = () => {
                console.warn(`Failed to load poster: ${path}`);
                img.style.display = 'none';
            };

            // Position poster randomly
            this.positionPoster(img, index);
            
            posterGrid.appendChild(img);
            this.posterElements.push(img);
        });
    }

    // Position poster at random location
    positionPoster(img, index) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const posterWidth = 200;
        const posterHeight = 300;
        
        // Safe zones to avoid content overlap
        const safeZones = [
            { x: 0, y: 0, width: viewportWidth, height: 100 }, // Top toggle area
            { x: (viewportWidth - 800) / 2, y: 100, width: 800, height: viewportHeight - 200 } // Main content area
        ];
        
        let x, y, attempts = 0;
        
        // Try to find a position that doesn't overlap safe zones
        do {
            x = Math.random() * (viewportWidth - posterWidth);
            y = Math.random() * (viewportHeight - posterHeight);
            attempts++;
        } while (this.isInSafeZone(x, y, posterWidth, posterHeight, safeZones) && attempts < 50);
        
        // Set position
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        
        // Set rotation for angry mode
        const rotation = 7 + Math.random() * 8; // 7-15 degrees
        img.style.setProperty('--poster-rotation', `${rotation}deg`);
    }

    // Check if position overlaps with safe zones
    isInSafeZone(x, y, width, height, safeZones) {
        return safeZones.some(zone => {
            return x < zone.x + zone.width &&
                   x + width > zone.x &&
                   y < zone.y + zone.height &&
                   y + height > zone.y;
        });
    }

    // Reposition posters (for mode changes)
    repositionPosters() {
        if (this.isReducedMotion) return;
        
        this.posterElements.forEach((poster, index) => {
            // Small random offset for angry mode
            if (this.currentMode === 'angry') {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                poster.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(var(--poster-rotation))`;
            } else {
                poster.style.transform = '';
            }
        });
    }

    // ===== MOUSE EFFECTS =====
    setupMouseEffects() {
        if (this.isReducedMotion) return;
        
        let mouseTimeout;
        
        document.addEventListener('mousemove', (e) => {
            if (this.currentMode === 'angry') {
                clearTimeout(mouseTimeout);
                mouseTimeout = setTimeout(() => {
                    this.randomizePosterPositions();
                }, 100); // Throttle to avoid excessive calls
            }
        });
    }

    // Randomize poster positions slightly on mouse move (angry mode)
    randomizePosterPositions() {
        if (this.isReducedMotion || this.currentMode !== 'angry') return;
        
        this.posterElements.forEach(poster => {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            const currentTransform = poster.style.transform;
            const baseTransform = currentTransform.replace(/translate\([^)]*\)/, '');
            poster.style.transform = `translate(${offsetX}px, ${offsetY}px) ${baseTransform}`;
        });
    }

    // Update cursor style
    updateCursorStyle(mode) {
        const body = document.body;
        
        if (mode === 'angry') {
            // Create pixelated crosshair cursor
            const cursorDataURL = this.createPixelatedCrosshair();
            body.style.cursor = `url("${cursorDataURL}") 16 16, crosshair`;
        } else {
            body.style.cursor = '';
        }
    }

    // Create pixelated crosshair cursor
    createPixelatedCrosshair() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, 32, 32);
        
        // Draw pixelated crosshair
        ctx.fillStyle = '#ff0033';
        ctx.imageSmoothingEnabled = false;
        
        // Vertical line
        ctx.fillRect(14, 8, 4, 16);
        // Horizontal line
        ctx.fillRect(8, 14, 16, 4);
        
        return canvas.toDataURL();
    }

    // ===== ACCESSIBILITY =====
    setupAccessibility() {
        // Announce mode changes
        this.createScreenReaderAnnouncer();
        
        // Handle reduced motion preferences
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addListener(() => {
            this.isReducedMotion = mediaQuery.matches;
        });
        
        // Keyboard navigation for toggle
        const toggle = document.getElementById('mode-toggle');
        if (toggle) {
            toggle.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    // Create hidden element for screen reader announcements
    createScreenReaderAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        document.body.appendChild(announcer);
    }

    // Announce mode change to screen readers
    announceMode(mode) {
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            const message = mode === 'cute' 
                ? 'Switched to cute mode: soft pastel colors and gentle animations'
                : 'Switched to angry mode: high contrast brutalist design with sharp edges';
            announcer.textContent = message;
        }
    }

    // ===== FORM HANDLING =====
    setupFormHandler() {
        const form = document.querySelector('.email-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            this.handleEmailSignup(e);
        });
        
        // Add button hover effects
        const buttons = document.querySelectorAll('.submit-btn, .signal-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (this.vibrationEnabled && this.currentMode === 'angry') {
                    navigator.vibrate(50);
                }
            });
        });
    }

    // Handle email form submission
    handleEmailSignup(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        if (!email) return;
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('please enter a valid email address', 'error');
            return;
        }
        
        // Show success message
        this.showMessage('thanks for joining the revolution! 💅', 'success');
        
        // Clear form
        document.getElementById('email').value = '';
        
        // Haptic feedback
        if (this.vibrationEnabled) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    // Show temporary message
    showMessage(text, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.temp-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const message = document.createElement('div');
        message.className = `temp-message temp-message-${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'error' ? 'var(--angry-red)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--radius-md);
            z-index: var(--z-toast);
            font-family: var(--font-heading);
            font-weight: var(--font-weight-bold);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            opacity: 0;
            transition: opacity var(--transition-medium);
        `;
        
        document.body.appendChild(message);
        
        // Animate in
        requestAnimationFrame(() => {
            message.style.opacity = '1';
        });
        
        // Remove after delay
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 300);
        }, 3000);
        
        // Announce to screen readers
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            announcer.textContent = text;
        }
    }

    // ===== RESPONSIVE HANDLING =====
    handleResize() {
        // Reposition posters on resize
        this.posterElements.forEach((poster, index) => {
            this.positionPoster(poster, index);
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const interface = new QueerGridInterface();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            interface.handleResize();
        }, 250);
    });
    
    // Add page load animation
    document.body.classList.add('loaded');
});

// ===== GLOBAL FUNCTIONS FOR BACKWARDS COMPATIBILITY =====
function handleEmailSignup(event) {
    // This function exists for backwards compatibility with the form onsubmit
    // The actual handling is done by the QueerGridInterface class
    event.preventDefault();
}

// ===== UTILITY FUNCTIONS =====
// Debounce function for performance
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

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Queer Grid Interface Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
}); 
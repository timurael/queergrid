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





// ===== MOOD TOGGLE SYSTEM =====
function initMoodToggle() {
    const moodToggle = document.getElementById('moodToggle');
    const html = document.documentElement;
    const cuteLabel = document.querySelector('.toggle-label.cute');
    const angryLabel = document.querySelector('.toggle-label.angry');
    
    // Load saved mood preference
    const savedMood = localStorage.getItem('queerGridMood') || 'cute';
    if (savedMood === 'angry') {
        setAngryMode();
    }
    
    // Toggle functionality
    if (moodToggle) {
        moodToggle.addEventListener('click', () => {
            if (html.classList.contains('angry-mode')) {
                setCuteMode();
            } else {
                setAngryMode();
            }
        });
    }
    
    function setCuteMode() {
        html.classList.remove('angry-mode');
        cuteLabel?.classList.add('active');
        angryLabel?.classList.remove('active');
        
        // Save preference
        localStorage.setItem('queerGridMood', 'cute');
        
        // Update content
        updateContentForMood('cute');
        
        // Hide rage gallery
        const rageGallery = document.querySelector('.rage-gallery');
        if (rageGallery) {
            rageGallery.style.display = 'none';
        }
        
        // Show notification
        showNotification('✨ Feeling cute and revolutionary! ✨', 'info');
    }
    
    function setAngryMode() {
        html.classList.add('angry-mode');
        cuteLabel?.classList.remove('active');
        angryLabel?.classList.add('active');
        
        // Save preference
        localStorage.setItem('queerGridMood', 'angry');
        
        // Update content
        updateContentForMood('angry');
        
        // Show rage gallery
        const rageGallery = document.querySelector('.rage-gallery');
        if (rageGallery) {
            rageGallery.style.display = 'block';
        }
        
        // Show notification
        showNotification('🔥 RAGE MODE ACTIVATED - BURN IT ALL DOWN 🔥', 'error');
        
        // Add some chaos effects
        addChaosEffects();
    }
    
    function updateContentForMood(mood) {
        const heroTitle = document.querySelector('.hero-title');
        const storyTitle = document.querySelector('.story-title');
        const joinTitle = document.querySelector('.join-title');
        const telegramTitle = document.querySelector('.telegram-title .glitch-text');
        
        if (mood === 'angry') {
            // Update main headline
            if (heroTitle) {
                const titleLines = heroTitle.querySelectorAll('.title-line');
                if (titleLines[0]) titleLines[0].textContent = 'AI REVOLUTION HAPPENING';
                if (titleLines[1]) titleLines[1].textContent = 'WITHOUT US?';
                if (titleLines[2]) titleLines[2].textContent = 'FUCK THAT NOISE';
                if (titleLines[3]) titleLines[3].textContent = 'BURN IT DOWN 🔥';
            }
            
            // Update story title
            if (storyTitle) {
                const titleWords = storyTitle.querySelectorAll('.title-word');
                if (titleWords[0]) titleWords[0].textContent = 'WHY';
                if (titleWords[1]) titleWords[1].textContent = 'I\'M';
                if (titleWords[2]) titleWords[2].textContent = 'ANGRY';
            }
            
            // Update join title
            if (joinTitle) {
                joinTitle.textContent = 'JOIN THE RESISTANCE.';
            }
            
            // Update signal title
            if (telegramTitle) {
                telegramTitle.textContent = 'FIGHT WITH US';
            }
            
        } else {
            // Restore cute mode content
            if (heroTitle) {
                const titleLines = heroTitle.querySelectorAll('.title-line');
                if (titleLines[0]) titleLines[0].textContent = 'ai revolution happening';
                if (titleLines[1]) titleLines[1].textContent = 'without us?';
                if (titleLines[2]) titleLines[2].textContent = 'absolutely tf not,';
                if (titleLines[3]) titleLines[3].textContent = 'bbs ⚡';
            }
            
            // Restore story title
            if (storyTitle) {
                const titleWords = storyTitle.querySelectorAll('.title-word');
                if (titleWords[0]) titleWords[0].textContent = 'my';
                if (titleWords[1]) titleWords[1].textContent = 'fucking';
                if (titleWords[2]) titleWords[2].textContent = 'story';
            }
            
            // Restore join title
            if (joinTitle) {
                joinTitle.textContent = 'drop your email for the newsletter.';
            }
            
            // Restore signal title
            if (telegramTitle) {
                telegramTitle.textContent = 'get in the group';
            }
        }
    }
    
    function addChaosEffects() {
        // Add some extra chaos when switching to angry mode
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.animation = 'brutalistShake 0.5s ease-in-out';
                setTimeout(() => {
                    btn.style.animation = '';
                }, 500);
            }, index * 100);
        });
        
        // Add glitch effect to title
        const mainTitle = document.querySelector('.hero-title');
        if (mainTitle) {
            mainTitle.style.animation = 'brutalistGlitch 1s ease-in-out';
            setTimeout(() => {
                mainTitle.style.animation = '';
            }, 1000);
        }
    }
}

// Add brutalist shake animation
const brutalistStyles = document.createElement('style');
brutalistStyles.textContent = `
    @keyframes brutalistShake {
        0%, 100% { transform: translateX(0) skew(0deg); }
        10% { transform: translateX(-2px) skew(-1deg); }
        20% { transform: translateX(2px) skew(1deg); }
        30% { transform: translateX(-2px) skew(-1deg); }
        40% { transform: translateX(2px) skew(1deg); }
        50% { transform: translateX(-2px) skew(-1deg); }
        60% { transform: translateX(2px) skew(1deg); }
        70% { transform: translateX(-2px) skew(-1deg); }
        80% { transform: translateX(2px) skew(1deg); }
        90% { transform: translateX(-2px) skew(-1deg); }
    }
`;
document.head.appendChild(brutalistStyles);

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
    initMoodToggle();
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
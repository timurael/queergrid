# ✨ Queer Grid - Community Website

A sparkly, inclusive website for the queer tech community built with radical love and glittery code.

## 🌈 Features

- **Barbiecore Aesthetic**: Iridescent colors, pastel gradients, and sparkle effects
- **Mobile-First Design**: Responsive and accessible on all devices
- **Interactive Elements**: Animated carousel, sparkle effects, and smooth scrolling
- **Email Signup**: Collect community member emails with style
- **Telegram Integration**: Direct links to join your community chat
- **Accessibility**: Screen reader friendly, keyboard navigation, reduced motion support

## 🚀 Quick Start

1. **Open the website**: Simply open `index.html` in your web browser
2. **Customize content**: Edit the HTML file to add your community's information
3. **Add your links**: Update Telegram and social media links
4. **Deploy**: Upload to any web hosting service

## 🎨 Customization Guide

### Update Community Information

**Logo & Branding** (in `index.html`):
```html
<div class="logo">
    <span class="logo-icon">✨🌈</span>
    <span class="logo-text">Your Community Name</span>
</div>
```

**Hero Section**:
```html
<h1 class="hero-title">
    Your community tagline, <span class="gradient-text">together</span>.
</h1>
<p class="hero-subtitle">
    Your community description with personality.
</p>
```

### Add Your Telegram Link

In `script.js`, find the `joinTelegram()` function and replace with your actual invite link:
```javascript
function joinTelegram() {
    const telegramLink = 'https://t.me/your_actual_group_invite_link';
    // ... rest of function
}
```

### Customize Colors

In `styles.css`, update the CSS custom properties:
```css
:root {
    --pastel-pink: #FFB6C1;      /* Change to your preferred pink */
    --pastel-mint: #98FB98;      /* Change to your preferred mint */
    --baby-blue: #87CEEB;        /* Change to your preferred blue */
    /* Add more custom colors as needed */
}
```

### Email Integration

Replace the demo email handler in `script.js` with your preferred service:

**For ConvertKit**:
```javascript
// In handleEmailSignup function, replace the setTimeout with:
fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        api_key: 'YOUR_API_KEY',
        email: email
    })
});
```

**For Mailchimp, Typeform, or other services**: Follow their API documentation

## 📱 Social Media Links

Update the footer links in `index.html`:
```html
<div class="footer-links">
    <a href="https://t.me/your_group" class="footer-link">Telegram</a>
    <a href="https://instagram.com/your_handle" class="footer-link">Instagram</a>
    <a href="https://notion.so/your_page" class="footer-link">Notion</a>
</div>
```

## 🌟 Content Sections Explained

### About Carousel
The rotating text showcases who your community serves. Update these in `index.html`:
```html
<div class="about-carousel">
    <div class="carousel-text active">For [your community].</div>
    <div class="carousel-text">For [another group].</div>
    <!-- Add more as needed -->
</div>
```

### Vibe Gallery
Interactive grid showing community values. Customize the messages in `script.js`:
```javascript
const messages = [
    'Your custom message! 🏳️‍⚧️✨',
    'Another inspiring message 💻💕',
    // Add 6 total messages
];
```

## 🚀 Deployment Options

### GitHub Pages (Free)
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Netlify (Free)
1. Drag and drop your project folder to netlify.com
2. Get instant deployment with custom domain options

### Vercel (Free)
1. Connect your GitHub repository to vercel.com
2. Automatic deployments on every push

### Custom Domain
Once deployed, you can add a custom domain through your hosting provider's dashboard.

## 🎯 Performance Tips

- Images: Add real photos to replace emoji placeholders in the gallery
- Fonts: The site uses Google Fonts - they load automatically
- Analytics: Add Google Analytics or Plausible tracking if needed
- SEO: Update meta tags in `<head>` section

## ♿ Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Adapts to system contrast settings
- **Focus Management**: Clear focus indicators

## 🛠️ Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Older browsers may not display all visual effects but remain functional.

## 💡 Tips for Community Growth

1. **Share Early**: Launch with just the essentials and iterate
2. **Community Input**: Ask community members what they want to see
3. **Regular Updates**: Keep content fresh and engaging
4. **Cross-Platform**: Share your website across all your social channels
5. **Analytics**: Track what content resonates most

## 🏳️‍🌈 Built With Love

This website celebrates queer joy, radical inclusion, and the power of community. Feel free to fork, adapt, and make it your own!

---

**Questions?** Open an issue or reach out to the community! ✨

*Built with glitter & rage* 💅 
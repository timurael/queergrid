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

# Queer Grid - GDPR-Compliant Email Collection System

🌈 **A revolutionary dual-mode website with full GDPR compliance for email collection and data management.**

## 🚀 Features

### Frontend
- **Dual-mode interface**: Cute mode and Angry mode with stunning visual effects
- **GDPR-compliant email forms** with explicit consent checkboxes
- **Real-time form validation** and user feedback
- **UTM parameter tracking** for marketing attribution
- **Data rights modal** explaining GDPR rights to users
- **Accessible design** with reduced motion support
- **Mobile-responsive** design

### Backend
- **Full GDPR compliance** with comprehensive audit trails
- **Email verification** system with automated emails
- **Data subject rights** handling (export, delete, rectify, restrict, portability)
- **Secure API** with rate limiting and validation
- **Audit logging** for all data operations
- **Admin panel** capabilities for data management
- **Email service integration** with beautiful HTML templates

## 🏗️ Architecture

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Email**: Nodemailer with SMTP
- **Session Storage**: Redis
- **Security**: Helmet, bcryptjs, rate limiting

### Database Schema
- `EmailSubscriber` - User subscription data
- `AuditLog` - Complete audit trail for compliance
- `DataRequest` - GDPR data subject requests
- `ConsentRecord` - Consent tracking history
- `AdminUser` - Admin access management

## 🛠️ Installation & Setup

### Prerequisites
```bash
# Required software
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)
- Git
```

### 1. Clone & Install
```bash
git clone <repository-url>
cd queer-grid
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/queer_grid_db"

# Server
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-session-secret-key-change-this

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@queergrid.org
FROM_NAME="Queer Grid"

# Redis
REDIS_URL=redis://localhost:6379

# GDPR Compliance
DATA_RETENTION_DAYS=730
CONSENT_VERSION=1.0
COMPANY_NAME="Queer Grid Collective"
DPO_EMAIL=privacy@queergrid.org
PRIVACY_POLICY_URL=https://queergrid.org/privacy
TERMS_URL=https://queergrid.org/terms
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Services

#### Development
```bash
# Start Redis (if not running as service)
redis-server

# Start the backend
npm run dev

# Serve frontend (simple HTTP server)
npx serve . -p 3000
```

#### Production
```bash
# Build and start
npm start

# With PM2 (recommended)
npm install -g pm2
pm2 start server.js --name queer-grid-backend
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### Other SMTP Providers
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-username@mg.yourdomain.com
SMTP_PASS=your-mailgun-password
```

## 🔒 GDPR Compliance Features

### Data Collection
- ✅ Explicit consent checkboxes
- ✅ Clear purpose statements
- ✅ Opt-in only (no pre-checked boxes)
- ✅ Consent version tracking
- ✅ IP address and timestamp logging

### Data Subject Rights
- ✅ **Right of Access** - Export all personal data
- ✅ **Right to Rectification** - Correct inaccurate data
- ✅ **Right to Erasure** - Delete personal data
- ✅ **Right to Restriction** - Limit data processing
- ✅ **Right to Data Portability** - Export in machine-readable format

### Audit & Compliance
- ✅ Complete audit trails for all operations
- ✅ Legal basis tracking for data processing
- ✅ Automated data retention policies
- ✅ Secure data export with expiring links
- ✅ Admin access controls and logging

## 🌐 API Endpoints

### Email Subscription
```http
POST /api/email/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "consent": true,
  "source": "website",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "launch"
}
```

### Email Verification
```http
GET /api/email/verify/{token}
```

### Unsubscribe
```http
GET /api/email/unsubscribe/{token}
```

### GDPR Data Requests
```http
POST /api/gdpr/request-data
Content-Type: application/json

{
  "email": "user@example.com",
  "requestType": "EXPORT"
}
```

### Verify GDPR Request
```http
GET /api/gdpr/verify-request/{token}
```

## 🎨 Frontend Integration

### Basic Email Form
```html
<form id="emailForm" onsubmit="handleEmailSignup(event)">
  <input type="email" id="email" name="email" required>
  
  <label class="consent-checkbox">
    <input type="checkbox" id="consent" name="consent" required>
    <span class="checkmark"></span>
    <span class="consent-text">
      I consent to receiving email newsletters and updates.
      <a href="/privacy">Privacy Policy</a>
    </span>
  </label>
  
  <button type="submit" id="submitBtn">
    <span class="btn-text">Subscribe</span>
    <span class="btn-loading" style="display: none;">
      <span class="spinner"></span> Processing...
    </span>
  </button>
  
  <div class="form-messages">
    <div class="success-message" id="successMessage" style="display: none;"></div>
    <div class="error-message" id="errorMessage" style="display: none;"></div>
  </div>
</form>
```

### JavaScript Configuration
```javascript
// Update API base URL for production
const API_BASE_URL = 'https://your-domain.com';

// The handleEmailSignup function will automatically:
// - Validate form inputs
// - Show loading states
// - Submit to backend API
// - Handle success/error states
// - Track UTM parameters
```

## 🔧 Administration

### Creating Admin Users
```javascript
// Use Prisma Studio or direct database insert
const bcrypt = require('bcryptjs');

const hashedPassword = await bcrypt.hash('secure-password', 12);

await prisma.adminUser.create({
  data: {
    email: 'admin@queergrid.org',
    passwordHash: hashedPassword,
    role: 'SUPER_ADMIN',
    isActive: true
  }
});
```

### Monitoring & Logs
```bash
# View audit logs
tail -f logs/audit.log

# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log
```

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=3001
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### SSL/TLS Configuration
```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Database Migration
```bash
# Production database setup
npx prisma migrate deploy
npx prisma generate
```

### Process Management
```bash
# Using PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Analytics & Tracking

### Privacy-Friendly Analytics
The system includes privacy-friendly event tracking:

```javascript
// Automatic event tracking (privacy-safe)
- email_subscription
- email_subscription_error
- email_verification_completed
- gdpr_request_submitted
```

### UTM Parameter Tracking
- Automatically captures UTM parameters from URLs
- Associates them with email subscriptions
- Enables attribution tracking without compromising privacy

## 🛡️ Security Features

- **Rate limiting** on all API endpoints
- **Input validation** and sanitization
- **SQL injection** protection via Prisma
- **XSS protection** via Helmet
- **CSRF protection** for admin routes
- **Secure session** management with Redis
- **Password hashing** with bcrypt
- **Email verification** to prevent abuse

## 🧪 Testing

### Development Testing
```bash
# Test email functionality with development SMTP
MOCK_EMAIL_VERIFICATION=true npm run dev
```

### API Testing
```bash
# Test subscription endpoint
curl -X POST http://localhost:3001/api/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","consent":true}'
```

## 📝 Legal Compliance

### Required Legal Pages
You'll need to create these pages for full GDPR compliance:

1. **Privacy Policy** (`/privacy`) - Must include:
   - What data you collect
   - How you use it
   - Legal basis for processing
   - Data retention periods
   - User rights under GDPR
   - Contact information for Data Protection Officer

2. **Terms of Service** (`/terms`) - Must include:
   - Service usage terms
   - Data processing terms
   - User responsibilities

3. **Cookie Policy** (if using cookies) - Must include:
   - Types of cookies used
   - Purpose of each cookie
   - How to manage cookie preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Support

Built with queer rage and revolutionary love. For support:

- 📧 Email: support@queergrid.org
- 🔒 Privacy: privacy@queergrid.org
- 🐛 Issues: GitHub Issues
- 💬 Community: [Signal Group](https://signal.group/#CjQKIN6mrjEmePaXryf1zQ__kW7CF0W-fxs87_Q9KV0-gqEeEhCrXBYYjv_vUkCGo5q368b8)

---

**🏳️‍🌈 Queer Grid Collective** - *Building the future we want to live in* 
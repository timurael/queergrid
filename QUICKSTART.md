# 🏳️‍🌈 Queer Grid GDPR Backend - Quick Start

Get your GDPR-compliant email collection system running in 5 minutes!

## 🚀 Quick Setup

```bash
# 1. Run the setup script
./setup.sh sqlite  # Use SQLite for development

# 2. Set up your database
npm run db:migrate

# 3. Start the development server
npm run dev
```

Your backend will be running at `http://localhost:3001`

## 🔧 Environment Configuration

The setup script creates a `.env` file from `env.example`. Key things to configure:

```bash
# Essential settings for development
NODE_ENV=development
DATABASE_URL="file:./dev.db"  # SQLite for local development
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret

# Email settings (for verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@queergrid.org
```

## 🧪 Test the API

Once running, test these endpoints:

```bash
# Health check
curl http://localhost:3001/health

# GDPR transparency info
curl http://localhost:3001/api/transparency

# Public API info
curl http://localhost:3001/api/public/info
```

## 📧 Test Email Collection

The frontend form at `index.html` is already connected! Just:

1. Open `index.html` in your browser
2. **GDPR consent popup will appear** - accept or customize your preferences
3. Fill out the email form with GDPR consent
4. Check your server logs to see the email being processed

### 🍪 GDPR Consent Popup Features

- **Automatic popup** on first visit
- **Granular consent** for analytics, marketing, essential cookies
- **Mode-aware messaging** (cute/angry text)
- **Local storage** of consent preferences
- **Backend integration** for consent tracking
- **Graceful degradation** if backend is offline

## 🗄️ Database Options

### Development (SQLite)
```bash
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/queer_grid_db"
```

## 🔐 Admin Panel

Create an admin user and access the admin panel:

```bash
# After starting the server, create admin user via API
curl -X POST http://localhost:3001/api/admin/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@queergrid.org", "password": "secure-password"}'
```

## 🛡️ GDPR Features Ready Out of the Box

- ✅ Explicit consent collection
- ✅ Email verification
- ✅ Complete audit trails
- ✅ Data export (JSON format)
- ✅ Right to deletion
- ✅ Data rectification
- ✅ Processing restriction
- ✅ Data portability

## 🆘 Troubleshooting

**"Database not found"**
```bash
npm run db:migrate
```

**"Redis connection failed"**
- Comment out Redis in `server.js` for development
- Or install Redis: `brew install redis` and `brew services start redis`

**"Email sending failed"**
- Set `MOCK_EMAIL_VERIFICATION=true` in `.env` for development

## 📚 Next Steps

- Read the full `README.md` for production deployment
- Check `routes/` directory for API documentation
- Customize email templates in `services/emailService.js` 
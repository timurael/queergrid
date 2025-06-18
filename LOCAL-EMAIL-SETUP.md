# 📧 Local Email Collection System

A simple, local email collection system for Queer Grid that saves emails directly to your computer!

## 🚀 Quick Start

### 1. Start the Local Email Server
```bash
# Option 1: Using npm script (recommended)
npm run email-server

# Option 2: Direct node command
node local-email-server.js

# Option 3: Development mode with auto-restart
npm run email-dev
```

### 2. Start Your Website
In a separate terminal:
```bash
# Simple HTTP server (already running)
python3 -m http.server 8000

# Or if you prefer node
npx http-server -p 8000
```

### 3. Access Your Site
- **Website**: http://localhost:8000
- **Admin Dashboard**: http://localhost:8000/email-admin.html
- **Direct API**: http://localhost:3001

## 📊 Features

### ✅ What It Does
- **Local Storage**: Saves emails to `collected-emails.json` in your project folder
- **GDPR Compliant**: Tracks consent and stores metadata
- **Duplicate Prevention**: Won't save the same email twice
- **Admin Dashboard**: Beautiful interface to view collected emails
- **CSV Export**: Download emails as CSV for external use
- **Real-time Stats**: See total emails, today's count, weekly count
- **UTM Tracking**: Captures marketing campaign data
- **Auto-refresh**: Dashboard updates every 30 seconds

### 📁 Files Created
- `collected-emails.json` - Your email database (auto-created)
- `local-email-server.js` - The email collection server
- `email-admin.html` - Admin dashboard for viewing emails

## 🎯 How It Works

### Email Collection Flow
1. User fills out email form on your website
2. Form submits to `http://localhost:3001/api/email/subscribe`
3. Server validates email and consent
4. Email saved to `collected-emails.json` with metadata:
   - Email address
   - Consent status
   - Source (website, utm params, etc.)
   - Timestamp
   - IP address
   - User agent

### Data Structure
Each email entry contains:
```json
{
  "email": "user@example.com",
  "consent": true,
  "source": "website",
  "utmSource": "instagram",
  "utmMedium": "social",
  "utmCampaign": "pride-month",
  "subscribedAt": "2024-01-15T10:30:00.000Z",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

## 🛠 API Endpoints

### Public Endpoints
- `POST /api/email/subscribe` - Submit email subscription
- `POST /api/gdpr/consent` - Record GDPR consent
- `GET /health` - Server health check

### Admin Endpoints
- `GET /api/admin/emails` - View all collected emails (JSON)
- `GET /api/admin/emails/export` - Download emails as CSV

## 📱 Admin Dashboard

Access at `http://localhost:8000/email-admin.html`

### Features
- **Stats Overview**: Total emails, today's count, weekly count
- **Email List**: Sortable list of all collected emails
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **CSV Export**: One-click download of all emails
- **Mobile Responsive**: Works great on phone/tablet

### Dashboard Actions
- 🔄 **Refresh**: Manually update email list
- 📥 **Export CSV**: Download emails for external use
- 🏠 **Back to Site**: Return to main website

## 🔧 Customization

### Change Port
Edit `local-email-server.js`:
```javascript
const PORT = 3001; // Change to your preferred port
```

Then update `script.js`:
```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT';
```

### Change File Location
Edit `local-email-server.js`:
```javascript
const EMAILS_FILE = path.join(__dirname, 'your-custom-file.json');
```

### Add Custom Fields
Modify the email subscription endpoint to capture additional data:
```javascript
const newSubscription = {
    email: email.toLowerCase(),
    consent: consent,
    // Add your custom fields here
    customField: req.body.customField,
    // ...
};
```

## 🔒 Privacy & Security

### Local Data Only
- All emails stay on your computer
- No external services or databases
- Complete control over your data

### GDPR Compliance
- Explicit consent tracking
- Timestamp recording
- Easy data export/deletion
- Transparent data collection

### Security Notes
- Server runs locally only (localhost)
- No authentication required (local access only)
- IP addresses are captured for basic analytics
- Consider adding authentication for production use

## 🚨 Troubleshooting

### Common Issues

**Email server won't start:**
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill existing process if needed
kill -9 <PID>
```

**Emails not saving:**
- Check file permissions in project directory
- Ensure you have write access to the folder
- Check server console for error messages

**Frontend can't connect:**
- Verify email server is running on port 3001
- Check browser console for CORS errors
- Ensure `API_BASE_URL` is set correctly

**Dashboard shows errors:**
- Make sure email server is running
- Check network tab in browser dev tools
- Verify URLs are correct (localhost:3001)

### Debug Mode
Start server with verbose logging:
```bash
DEBUG=* node local-email-server.js
```

## 📈 Next Steps

### Production Considerations
- Add authentication to admin endpoints
- Implement rate limiting
- Add email validation
- Set up automated backups
- Consider encryption for sensitive data

### Integration Options
- Connect to MailChimp/ConvertKit API
- Set up automated email sequences
- Add webhook notifications
- Create backup system

## 🎉 Success!

You now have a fully functional local email collection system! 

Visit your website at `http://localhost:8000` and try signing up with an email. Then check the admin dashboard at `http://localhost:8000/email-admin.html` to see your collected emails.

Your emails are saved in `collected-emails.json` - you can open this file directly or use the beautiful admin dashboard to manage your revolutionary email list! 🚀

---

*Happy collecting! 📧✨* 
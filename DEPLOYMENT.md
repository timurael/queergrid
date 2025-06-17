# 🏳️‍🌈 Queer Grid Deployment Guide

## Local Backend + GitHub Pages Setup

This setup allows you to:
- 🏠 Run the GDPR-compliant backend locally for development
- 🚀 Auto-deploy the frontend to GitHub Pages
- 🔄 Gracefully handle backend unavailability in production

## 🛠️ Development Setup

### 1. Local Backend Setup

```bash
# Clone and setup
git clone <your-repo>
cd queer-grid

# Install dependencies
npm install

# Setup environment
cp env.example .env
# Edit .env with your local configuration

# Setup database (SQLite for development)
npm run db:migrate

# Start local backend
npm run dev
```

Your backend will run at `http://localhost:3001`

### 2. Frontend Development

```bash
# Open index.html in your browser
# Or use a local server:
npx serve . -p 3000
```

The frontend will automatically connect to your local backend at `localhost:3001`.

### 3. GitHub Pages Auto-Deployment

#### Setup GitHub Pages

1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The `.github/workflows/deploy.yml` will handle deployment

#### Configure Backend URL

Edit `scripts/build-production.js` and update the production API URL:

```javascript
production: {
  API_BASE_URL: 'https://your-backend-domain.com', // Update this!
  ENVIRONMENT: 'production'
}
```

#### Auto-Deployment

Every push to `main` branch will:
1. Build the frontend for production
2. Configure API endpoints for your backend
3. Deploy to GitHub Pages
4. Handle graceful degradation if backend is offline

## 🌐 Backend Deployment Options

### Option 1: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 2: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create queer-grid-backend

# Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with one click

## 🔧 Environment Configuration

### Local Development (.env)

```bash
NODE_ENV=development
DATABASE_URL="file:./dev.db"
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Email settings
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
JWT_SECRET=your-local-secret
SESSION_SECRET=your-session-secret
```

### Production Environment

```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:port/db"
API_BASE_URL=https://your-backend-domain.com
FRONTEND_URL=https://username.github.io/repo-name

# Production email settings
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Production security
JWT_SECRET=super-secure-production-secret
SESSION_SECRET=super-secure-session-secret
```

## 🚀 Deployment Workflow

### Development Workflow

```bash
# 1. Work on features locally
git checkout -b feature/awesome-feature

# 2. Test with local backend
npm run dev

# 3. Test frontend locally
open index.html

# 4. Commit and push
git add .
git commit -m "Add awesome feature"
git push origin feature/awesome-feature

# 5. Create PR and merge to main
```

### Production Deployment

```bash
# 1. Merge to main triggers GitHub Actions
git checkout main
git merge feature/awesome-feature
git push origin main

# 2. GitHub Actions will:
#    - Build frontend for production
#    - Configure API endpoints
#    - Deploy to GitHub Pages
#    - Handle offline backend gracefully
```

## 🛡️ GDPR Compliance in Production

### With Backend Available
- ✅ Full GDPR compliance
- ✅ Email collection and verification
- ✅ Data subject rights handling
- ✅ Complete audit trails
- ✅ Consent tracking

### Without Backend (Graceful Degradation)
- ✅ GDPR consent popup still works
- ✅ Consent saved locally
- ⚠️ Email signup disabled with friendly message
- ⚠️ Data rights requests show "coming soon"
- ✅ Privacy policy and transparency info available

## 🔍 Monitoring & Debugging

### Check Deployment Status

```bash
# Check if backend is available
curl https://your-backend-domain.com/health

# Check frontend deployment
curl https://username.github.io/repo-name/deployment-info.json
```

### Development Debugging

```bash
# Check backend logs
npm run dev

# Check database
npx prisma studio

# Test API endpoints
curl http://localhost:3001/api/transparency
```

## 🆘 Troubleshooting

### "Backend not available" in production

1. Check if your backend is deployed and running
2. Verify the API_BASE_URL in `scripts/build-production.js`
3. Check CORS settings in your backend
4. Verify environment variables are set

### GitHub Pages deployment fails

1. Check the Actions tab in your GitHub repository
2. Ensure `scripts/` directory exists
3. Verify Node.js version compatibility
4. Check file permissions

### Local development issues

1. Ensure port 3001 is available
2. Check database connection
3. Verify environment variables in `.env`
4. Try `npm run db:migrate` to reset database

## 🌈 Best Practices

### Security

- Never commit `.env` files
- Use strong secrets in production
- Enable HTTPS for backend
- Regularly update dependencies

### Performance

- Use CDN for static assets
- Enable gzip compression
- Monitor backend response times
- Implement caching strategies

### GDPR Compliance

- Regular audit log reviews
- Data retention policy enforcement
- User consent version tracking
- Privacy policy updates

## 📞 Support

For issues with this setup:

1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Test locally first
4. Open an issue with detailed logs

Happy deploying! 🏳️‍🌈⚡ 
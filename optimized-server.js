const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const compression = require('compression');

// Performance and security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3002;
const EMAILS_FILE = path.join(__dirname, 'collected-emails.json');

// ===== PERFORMANCE MIDDLEWARE =====

// Compression for all responses
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Allow local development
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

const emailLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit email submissions to 5 per minute per IP
    message: { error: 'Too many email submissions, please wait a moment' }
});

app.use(limiter);
app.use('/api/email', emailLimiter);

// CORS with specific origins for production
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with caching
app.use(express.static('.', {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.json')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// ===== EMAIL DATA MANAGEMENT =====
class EmailManager {
    constructor() {
        this.cache = null;
        this.lastModified = null;
        this.initializeFile();
    }

    async initializeFile() {
        try {
            await fs.access(EMAILS_FILE);
            const stats = await fs.stat(EMAILS_FILE);
            this.lastModified = stats.mtime;
        } catch (error) {
            await fs.writeFile(EMAILS_FILE, JSON.stringify([], null, 2));
            console.log('📧 Created new emails collection file');
            this.lastModified = new Date();
        }
    }

    async loadEmails() {
        try {
            const stats = await fs.stat(EMAILS_FILE);
            
            // Use cache if file hasn't been modified
            if (this.cache && this.lastModified && stats.mtime <= this.lastModified) {
                return this.cache;
            }

            const data = await fs.readFile(EMAILS_FILE, 'utf8');
            this.cache = JSON.parse(data);
            this.lastModified = stats.mtime;
            return this.cache;
        } catch (error) {
            console.error('Error loading emails:', error);
            return [];
        }
    }

    async saveEmails(emails) {
        try {
            await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2));
            this.cache = emails;
            this.lastModified = new Date();
            return true;
        } catch (error) {
            console.error('Error saving emails:', error);
            return false;
        }
    }

    async addEmail(emailData) {
        const emails = await this.loadEmails();
        
        // Check for duplicates (case-insensitive)
        const existingEmail = emails.find(e => 
            e.email.toLowerCase() === emailData.email.toLowerCase()
        );
        
        if (existingEmail) {
            return { alreadySubscribed: true, email: existingEmail };
        }

        const newSubscription = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            email: emailData.email.toLowerCase(),
            consent: emailData.consent,
            source: emailData.source || 'website',
            utmSource: emailData.utmSource || null,
            utmMedium: emailData.utmMedium || null,
            utmCampaign: emailData.utmCampaign || null,
            subscribedAt: new Date().toISOString(),
            ipAddress: emailData.ipAddress,
            userAgent: emailData.userAgent
        };

        emails.push(newSubscription);
        const saved = await this.saveEmails(emails);
        
        return saved ? { success: true, email: newSubscription } : { error: 'Failed to save' };
    }

    async getStats() {
        const emails = await this.loadEmails();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            total: emails.length,
            today: emails.filter(email => new Date(email.subscribedAt) >= today).length,
            thisWeek: emails.filter(email => new Date(email.subscribedAt) >= weekAgo).length,
            lastUpdated: this.lastModified
        };
    }

    generateCSV(emails) {
        const headers = [
            'ID', 'Email', 'Consent', 'Source', 'UTM Source', 
            'UTM Medium', 'UTM Campaign', 'Subscribed At', 'IP Address'
        ];
        
        const csvContent = [
            headers.join(','),
            ...emails.map(email => [
                email.id || '',
                `"${email.email}"`,
                email.consent,
                `"${email.source || ''}"`,
                `"${email.utmSource || ''}"`,
                `"${email.utmMedium || ''}"`,
                `"${email.utmCampaign || ''}"`,
                email.subscribedAt,
                `"${email.ipAddress || ''}"`
            ].join(','))
        ].join('\n');

        return csvContent;
    }
}

const emailManager = new EmailManager();

// ===== VALIDATION MIDDLEWARE =====
const validateEmail = (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    next();
};

const enrichRequest = (req, res, next) => {
    req.clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    req.userAgent = req.get('User-Agent') || 'Unknown';
    next();
};

// ===== API ROUTES =====

// Health check with system info
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Local email server is running!',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Email subscription endpoint
app.post('/api/email/subscribe', enrichRequest, validateEmail, async (req, res) => {
    try {
        const { email, consent, source, utmSource, utmMedium, utmCampaign } = req.body;

        if (!consent) {
            return res.status(400).json({ 
                error: 'Consent is required for the revolution! 🏳️‍🌈' 
            });
        }

        const result = await emailManager.addEmail({
            email,
            consent,
            source,
            utmSource,
            utmMedium,
            utmCampaign,
            ipAddress: req.clientIP,
            userAgent: req.userAgent
        });

        if (result.alreadySubscribed) {
            return res.json({
                success: true,
                alreadySubscribed: true,
                message: 'You\'re already part of the revolution! 🌈✨'
            });
        }

        if (result.success) {
            console.log(`📧 New email collected: ${email}`);
            const stats = await emailManager.getStats();
            console.log(`📊 Total emails: ${stats.total}`);
            
            res.json({
                success: true,
                message: 'WELCOME TO THE REVOLUTION! 🚀',
                requiresVerification: false
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to save email - revolution paused 😅' 
            });
        }

    } catch (error) {
        console.error('Email subscription error:', error);
        res.status(500).json({ 
            error: 'Something went wrong in the matrix 🌐' 
        });
    }
});

// Admin endpoints with basic protection
app.get('/api/admin/emails', async (req, res) => {
    try {
        const emails = await emailManager.loadEmails();
        const stats = await emailManager.getStats();
        
        res.json({
            ...stats,
            emails: emails
        });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

// CSV export with proper headers
app.get('/api/admin/emails/export', async (req, res) => {
    try {
        const emails = await emailManager.loadEmails();
        
        if (emails.length === 0) {
            return res.status(404).json({ error: 'No emails to export' });
        }

        const csvContent = emailManager.generateCSV(emails);
        const filename = `queer-grid-emails-${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Add BOM for Excel compatibility
        res.send('\ufeff' + csvContent);

    } catch (error) {
        console.error('Error exporting emails:', error);
        res.status(500).json({ error: 'Failed to export emails' });
    }
});

// Statistics endpoint
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = await emailManager.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// GDPR consent endpoint
app.post('/api/gdpr/consent', async (req, res) => {
    try {
        console.log('📝 GDPR consent recorded:', {
            choices: req.body,
            ip: req.clientIP,
            timestamp: new Date().toISOString()
        });
        res.json({ success: true, message: 'Consent recorded locally' });
    } catch (error) {
        console.error('GDPR consent error:', error);
        res.status(500).json({ error: 'Failed to record consent' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'POST /api/email/subscribe',
            'GET /api/admin/emails',
            'GET /api/admin/emails/export',
            'GET /api/admin/stats'
        ]
    });
});

// ===== SERVER STARTUP =====
async function startServer() {
    try {
        await emailManager.initializeFile();
        
        const server = app.listen(PORT, () => {
            console.log('\n🏳️‍🌈 OPTIMIZED QUEER GRID EMAIL SERVER 🏳️‍🌈');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📧 Emails saved to: ${EMAILS_FILE}`);
            console.log(`📊 Admin API: http://localhost:${PORT}/api/admin/emails`);
            console.log(`📥 Export CSV: http://localhost:${PORT}/api/admin/emails/export`);
            console.log(`📈 Statistics: http://localhost:${PORT}/api/admin/stats`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💖 PERFORMANCE OPTIMIZATIONS ACTIVE 💖');
            console.log('• Compression enabled');
            console.log('• Rate limiting active');
            console.log('• Email caching enabled');
            console.log('• Security headers set');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('📤 Received SIGTERM, shutting down gracefully');
            server.close(() => {
                console.log('🛑 Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n📤 Received SIGINT, shutting down gracefully');
            server.close(() => {
                console.log('🛑 Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer(); 
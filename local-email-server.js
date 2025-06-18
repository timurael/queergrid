const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const EMAILS_FILE = path.join(__dirname, 'collected-emails.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure emails file exists
async function initializeEmailsFile() {
    try {
        await fs.access(EMAILS_FILE);
    } catch (error) {
        // File doesn't exist, create it
        await fs.writeFile(EMAILS_FILE, JSON.stringify([], null, 2));
        console.log('📧 Created new emails collection file');
    }
}

// Load existing emails
async function loadEmails() {
    try {
        const data = await fs.readFile(EMAILS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading emails:', error);
        return [];
    }
}

// Save emails
async function saveEmails(emails) {
    try {
        await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving emails:', error);
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Local email server is running!' });
});

// Email subscription endpoint
app.post('/api/email/subscribe', async (req, res) => {
    try {
        const { email, consent, source, utmSource, utmMedium, utmCampaign } = req.body;

        // Basic validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ 
                error: 'Valid email is required bb! 💖' 
            });
        }

        if (!consent) {
            return res.status(400).json({ 
                error: 'Consent is required for the revolution! 🏳️‍🌈' 
            });
        }

        // Load existing emails
        const emails = await loadEmails();

        // Check if email already exists
        const existingEmail = emails.find(e => e.email.toLowerCase() === email.toLowerCase());
        
        if (existingEmail) {
            return res.json({
                success: true,
                alreadySubscribed: true,
                message: 'You\'re already part of the revolution! 🌈✨'
            });
        }

        // Add new email
        const newSubscription = {
            email: email.toLowerCase(),
            consent: consent,
            source: source || 'website',
            utmSource: utmSource || null,
            utmMedium: utmMedium || null,
            utmCampaign: utmCampaign || null,
            subscribedAt: new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || null
        };

        emails.push(newSubscription);

        // Save to file
        const saved = await saveEmails(emails);

        if (saved) {
            console.log(`📧 New email collected: ${email}`);
            console.log(`📊 Total emails: ${emails.length}`);
            
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

// Get all collected emails (for admin viewing)
app.get('/api/admin/emails', async (req, res) => {
    try {
        const emails = await loadEmails();
        res.json({
            total: emails.length,
            emails: emails
        });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

// Export emails as CSV
app.get('/api/admin/emails/export', async (req, res) => {
    try {
        const emails = await loadEmails();
        
        if (emails.length === 0) {
            return res.status(404).json({ error: 'No emails to export' });
        }

        // Create CSV content
        const headers = ['Email', 'Consent', 'Source', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Subscribed At', 'IP Address'];
        const csvContent = [
            headers.join(','),
            ...emails.map(email => [
                email.email,
                email.consent,
                email.source || '',
                email.utmSource || '',
                email.utmMedium || '',
                email.utmCampaign || '',
                email.subscribedAt,
                email.ipAddress || ''
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="queer-grid-emails-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting emails:', error);
        res.status(500).json({ error: 'Failed to export emails' });
    }
});

// GDPR consent endpoint (simplified for local use)
app.post('/api/gdpr/consent', async (req, res) => {
    try {
        console.log('📝 GDPR consent recorded:', req.body);
        res.json({ success: true, message: 'Consent recorded locally' });
    } catch (error) {
        console.error('GDPR consent error:', error);
        res.status(500).json({ error: 'Failed to record consent' });
    }
});

// Start server
async function startServer() {
    await initializeEmailsFile();
    
    app.listen(PORT, () => {
        console.log('\n🏳️‍🌈 QUEER GRID LOCAL EMAIL SERVER 🏳️‍🌈');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📧 Emails will be saved to: ${EMAILS_FILE}`);
        console.log(`📊 Admin panel: http://localhost:${PORT}/api/admin/emails`);
        console.log(`📥 Export CSV: http://localhost:${PORT}/api/admin/emails/export`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💖 Ready to collect revolutionary emails! 💖\n');
    });
}

startServer().catch(console.error); 
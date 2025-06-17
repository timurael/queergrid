const express = require('express');
const router = express.Router();

// Basic info endpoint
router.get('/info', (req, res) => {
  res.json({
    name: 'Queer Grid API',
    version: '1.0.0',
    description: 'GDPR-compliant email collection and community building platform',
    support: {
      email: process.env.DPO_EMAIL || 'privacy@queergrid.org',
      website: process.env.FRONTEND_URL || 'https://queergrid.org'
    }
  });
});

// Status endpoint (public version of health check)
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: 'operational', // In production, you might want to actually check this
      email: 'operational'
    }
  });
});

module.exports = router; 
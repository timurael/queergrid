require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');

// Initialize services
const prisma = new PrismaClient();
const app = express();

// Initialize Redis client
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
}

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'queer-grid-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many sensitive requests from this IP, please try again later.'
  }
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
if (redisClient) {
  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
}

// Request logging and audit trail middleware
app.use((req, res, next) => {
  req.requestId = require('node:crypto').randomUUID();
  req.timestamp = new Date().toISOString();
  
  // Log all requests
  logger.info('Request received', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: req.timestamp
  });
  
  // Capture response for audit logging
  const originalSend = res.send;
  res.send = function(data) {
    if (req.url.startsWith('/api/')) {
      logger.info('Request completed', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        ip: req.ip,
        responseTime: Date.now() - new Date(req.timestamp).getTime()
      });
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Import routes
const gdprRoutes = require('./routes/gdpr');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

// API Routes
app.use('/api/gdpr', gdprRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// GDPR transparency endpoint
app.get('/api/transparency', (req, res) => {
  res.json({
    dataController: {
      name: process.env.COMPANY_NAME || 'Queer Grid Collective',
      email: process.env.DPO_EMAIL || 'privacy@queergrid.org'
    },
    dataProcessing: {
      purposes: [
        'Email newsletter delivery',
        'Community building and engagement',
        'Event notifications and updates'
      ],
      legalBasis: 'Consent (GDPR Art. 6(1)(a))',
      retention: `${process.env.DATA_RETENTION_DAYS || 730} days from last interaction`,
      recipients: [
        'Email service providers',
        'Analytics services (anonymized data only)'
      ]
    },
    rights: [
      'Right of access (Art. 15)',
      'Right to rectification (Art. 16)',
      'Right to erasure (Art. 17)',
      'Right to restrict processing (Art. 18)',
      'Right to data portability (Art. 20)',
      'Right to object (Art. 21)'
    ],
    contact: {
      dpo: process.env.DPO_EMAIL || 'privacy@queergrid.org',
      privacyPolicy: process.env.PRIVACY_POLICY_URL || '/privacy',
      terms: process.env.TERMS_URL || '/terms'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: {
      message: isDevelopment ? err.message : 'Internal server error',
      requestId: req.requestId,
      ...(isDevelopment && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      requestId: req.requestId
    }
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  
  if (redisClient) {
    await redisClient.quit();
  }
  
  await prisma.$disconnect();
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  
  if (redisClient) {
    await redisClient.quit();
  }
  
  await prisma.$disconnect();
  
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Queer Grid backend server running on port ${PORT}`);
  logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 GDPR compliance: ${process.env.CONSENT_VERSION || '1.0'}`);
});

module.exports = app; 
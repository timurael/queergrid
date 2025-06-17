const express = require('express');
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { auditLog, getAuditStats, searchAuditLogs } = require('../services/auditService');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many admin requests from this IP, please try again later.'
  }
});

router.use(adminLimiter);

// Helper function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Admin authentication middleware
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        requestId: req.requestId
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        error: 'Invalid or inactive admin account',
        requestId: req.requestId
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    console.error('Admin authentication error:', error);
    
    await auditLog(prisma, {
      action: 'ADMIN_AUTH_FAILED',
      description: 'Admin authentication failed',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { error: error.message }
    });

    res.status(401).json({
      error: 'Invalid access token',
      requestId: req.requestId
    });
  }
}

// Admin login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        requestId: req.requestId
      });
    }

    const { email, password } = req.body;
    const clientIP = getClientIP(req);

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!admin || !admin.isActive) {
      // Log failed login attempt
      await auditLog(prisma, {
        action: 'ADMIN_LOGIN_FAILED',
        description: 'Admin login failed - user not found or inactive',
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { email, reason: 'user_not_found' }
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        requestId: req.requestId
      });
    }

    // Check if account is locked
    if (admin.lockedUntil && new Date() < admin.lockedUntil) {
      await auditLog(prisma, {
        subscriberId: admin.id,
        action: 'ADMIN_LOGIN_BLOCKED',
        description: 'Admin login blocked - account locked',
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { email, lockedUntil: admin.lockedUntil }
      });

      return res.status(423).json({
        error: 'Account temporarily locked due to failed login attempts',
        requestId: req.requestId
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!validPassword) {
      // Increment failed login attempts
      const failedAttempts = admin.failedLoginAttempts + 1;
      const lockAccount = failedAttempts >= 5;

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 minutes lock
        }
      });

      await auditLog(prisma, {
        subscriberId: admin.id,
        action: 'ADMIN_LOGIN_FAILED',
        description: 'Admin login failed - invalid password',
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          email, 
          failedAttempts: failedAttempts,
          accountLocked: lockAccount
        }
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        requestId: req.requestId
      });
    }

    // Reset failed attempts and update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: clientIP
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await auditLog(prisma, {
      subscriberId: admin.id,
      action: 'ADMIN_LOGIN_SUCCESS',
      description: 'Admin login successful',
      ipAddress: clientIP,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'legitimate_interests',
      newData: { email, role: admin.role }
    });

    res.json({
      message: 'Login successful',
      token: token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    await auditLog(prisma, {
      action: 'ADMIN_LOGIN_ERROR',
      description: 'Admin login failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { error: error.message }
    });

    res.status(500).json({
      error: 'Internal server error during login',
      requestId: req.requestId
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get basic subscriber statistics
    const totalSubscribers = await prisma.emailSubscriber.count();
    const activeSubscribers = await prisma.emailSubscriber.count({
      where: { isActive: true }
    });
    const verifiedSubscribers = await prisma.emailSubscriber.count({
      where: { isVerified: true }
    });
    const unverifiedSubscribers = await prisma.emailSubscriber.count({
      where: { isVerified: false, isActive: true }
    });

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignups = await prisma.emailSubscriber.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get pending GDPR requests
    const pendingDataRequests = await prisma.dataRequest.count({
      where: {
        status: {
          in: ['PENDING', 'VERIFIED', 'PROCESSING']
        }
      }
    });

    // Get audit statistics
    const auditStats = await getAuditStats({
      startDate: thirtyDaysAgo,
      endDate: new Date()
    });

    // Recent activity
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriber: {
          select: {
            email: true
          }
        }
      }
    });

    res.json({
      dashboard: {
        subscribers: {
          total: totalSubscribers,
          active: activeSubscribers,
          verified: verifiedSubscribers,
          unverified: unverifiedSubscribers,
          recentSignups: recentSignups
        },
        gdpr: {
          pendingRequests: pendingDataRequests
        },
        audit: auditStats,
        recentActivity: recentActivity.map(log => ({
          id: log.id,
          action: log.action,
          description: log.description,
          createdAt: log.createdAt,
          subscriberEmail: log.subscriber?.email || null
        }))
      },
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard data',
      requestId: req.requestId
    });
  }
});

// Get subscribers with pagination and filters
router.get('/subscribers', authenticateAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['all', 'active', 'inactive', 'verified', 'unverified']),
  query('sort').optional().isIn(['createdAt', 'email', 'updatedAt']),
  query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        requestId: req.requestId
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      status = 'all',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};

    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (status !== 'all') {
      switch (status) {
        case 'active':
          where.isActive = true;
          break;
        case 'inactive':
          where.isActive = false;
          break;
        case 'verified':
          where.isVerified = true;
          break;
        case 'unverified':
          where.isVerified = false;
          break;
      }
    }

    // Get total count
    const totalCount = await prisma.emailSubscriber.count({ where });

    // Get subscribers
    const subscribers = await prisma.emailSubscriber.findMany({
      where: where,
      select: {
        id: true,
        email: true,
        isActive: true,
        isVerified: true,
        consentGiven: true,
        consentTimestamp: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        verifiedAt: true,
        unsubscribedAt: true
      },
      orderBy: {
        [sort]: order
      },
      take: parseInt(limit),
      skip: offset
    });

    res.json({
      subscribers: subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      },
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      error: 'Failed to retrieve subscribers',
      requestId: req.requestId
    });
  }
});

// Get GDPR data requests
router.get('/gdpr-requests', authenticateAdmin, async (req, res) => {
  try {
    const dataRequests = await prisma.dataRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriber: {
          select: {
            email: true
          }
        }
      }
    });

    res.json({
      requests: dataRequests.map(request => ({
        id: request.id,
        type: request.type,
        status: request.status,
        requestEmail: request.requestEmail,
        subscriberEmail: request.subscriber?.email || null,
        createdAt: request.createdAt,
        processedAt: request.processedAt,
        verifiedAt: request.verifiedAt,
        notes: request.notes
      })),
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Get GDPR requests error:', error);
    res.status(500).json({
      error: 'Failed to retrieve GDPR requests',
      requestId: req.requestId
    });
  }
});

// Search audit logs
router.get('/audit-logs', authenticateAdmin, [
  query('email').optional().isString().trim(),
  query('action').optional().isString().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        requestId: req.requestId
      });
    }

    const {
      email,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const searchOptions = {
      email: email,
      action: action,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const result = await searchAuditLogs(searchOptions);

    res.json({
      logs: result.logs.map(log => ({
        id: log.id,
        action: log.action,
        description: log.description,
        legalBasis: log.legalBasis,
        createdAt: log.createdAt,
        ipAddress: log.ipAddress,
        subscriberEmail: log.subscriber?.email || null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        hasMore: result.pagination.hasMore
      },
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Search audit logs error:', error);
    res.status(500).json({
      error: 'Failed to search audit logs',
      requestId: req.requestId
    });
  }
});

// Export data (admin only)
router.get('/export/:type', authenticateAdmin, async (req, res) => {
  try {
    const { type } = req.params;

    if (!['subscribers', 'audit-logs', 'gdpr-requests'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid export type',
        requestId: req.requestId
      });
    }

    // Only SUPER_ADMIN and ADMIN can export data
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.admin.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions for data export',
        requestId: req.requestId
      });
    }

    let data;
    let filename;

    switch (type) {
      case 'subscribers':
        data = await prisma.emailSubscriber.findMany({
          select: {
            email: true,
            isActive: true,
            isVerified: true,
            consentGiven: true,
            consentTimestamp: true,
            source: true,
            createdAt: true
          }
        });
        filename = `subscribers-export-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'audit-logs':
        data = await prisma.auditLog.findMany({
          take: 10000, // Limit to prevent memory issues
          orderBy: { createdAt: 'desc' },
          select: {
            action: true,
            description: true,
            legalBasis: true,
            createdAt: true,
            ipAddress: true
          }
        });
        filename = `audit-logs-export-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'gdpr-requests':
        data = await prisma.dataRequest.findMany({
          select: {
            type: true,
            status: true,
            requestEmail: true,
            createdAt: true,
            processedAt: true
          }
        });
        filename = `gdpr-requests-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    // Log the export
    await auditLog(prisma, {
      subscriberId: req.admin.id,
      action: 'DATA_EXPORT',
      description: `Admin exported ${type} data`,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'legitimate_interests',
      newData: {
        exportType: type,
        recordCount: data.length,
        adminEmail: req.admin.email
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      exportMetadata: {
        type: type,
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        exportedBy: req.admin.email
      },
      data: data
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Failed to export data',
      requestId: req.requestId
    });
  }
});

module.exports = router; 
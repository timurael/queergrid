const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auditLog } = require('../services/auditService');

const prisma = new PrismaClient();

/**
 * Middleware to validate GDPR consent requirements
 */
const validateConsent = async (req, res, next) => {
  try {
    const { consent } = req.body;

    // Check if consent is explicitly given
    if (consent !== true) {
      await auditLog(prisma, {
        action: 'CONSENT_VALIDATION_FAILED',
        description: 'GDPR consent validation failed - consent not explicitly given',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          consentValue: consent,
          consentType: typeof consent
        }
      });

      return res.status(400).json({
        error: 'Explicit consent is required',
        code: 'CONSENT_REQUIRED',
        details: {
          message: 'Under GDPR, we need your explicit consent to process your personal data',
          legalBasis: 'GDPR Article 6(1)(a) - Consent',
          privacyPolicy: process.env.PRIVACY_POLICY_URL
        },
        requestId: req.requestId
      });
    }

    // Log successful consent validation
    await auditLog(prisma, {
      action: 'CONSENT_VALIDATION_SUCCESS',
      description: 'GDPR consent validation passed',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'consent',
      newData: { 
        consentGiven: true,
        consentVersion: process.env.CONSENT_VERSION || '1.0'
      }
    });

    next();

  } catch (error) {
    console.error('Consent validation error:', error);
    
    await auditLog(prisma, {
      action: 'CONSENT_VALIDATION_ERROR',
      description: 'GDPR consent validation failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { error: error.message }
    });

    res.status(500).json({
      error: 'Internal server error during consent validation',
      requestId: req.requestId
    });
  }
};

/**
 * Middleware to validate data subject rights requests
 */
const validateDataSubjectRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('requestType')
    .isIn(['EXPORT', 'DELETE', 'RECTIFY', 'RESTRICT', 'PORTABILITY'])
    .withMessage('Invalid request type'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await auditLog(prisma, {
          action: 'DATA_SUBJECT_REQUEST_VALIDATION_FAILED',
          description: 'Data subject request validation failed',
          ipAddress: getClientIP(req),
          userAgent: req.get('User-Agent'),
          requestId: req.requestId,
          newData: { 
            errors: errors.array(),
            requestBody: req.body
          }
        });

        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId: req.requestId
        });
      }

      // Log successful validation
      await auditLog(prisma, {
        action: 'DATA_SUBJECT_REQUEST_VALIDATION_SUCCESS',
        description: 'Data subject request validation passed',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        legalBasis: 'legal_obligation',
        newData: { 
          requestType: req.body.requestType,
          email: req.body.email
        }
      });

      next();

    } catch (error) {
      console.error('Data subject request validation error:', error);
      
      await auditLog(prisma, {
        action: 'DATA_SUBJECT_REQUEST_VALIDATION_ERROR',
        description: 'Data subject request validation failed due to server error',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { error: error.message }
      });

      res.status(500).json({
        error: 'Internal server error during validation',
        requestId: req.requestId
      });
    }
  }
];

/**
 * Middleware to check if data retention period has expired
 */
const checkDataRetention = async (req, res, next) => {
  try {
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS) || 730; // 2 years default
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Find subscribers whose data should be purged
    const expiredSubscribers = await prisma.emailSubscriber.findMany({
      where: {
        updatedAt: {
          lt: cutoffDate
        },
        isActive: false // Only inactive subscribers
      },
      select: {
        id: true,
        email: true,
        updatedAt: true
      }
    });

    if (expiredSubscribers.length > 0) {
      // Log the expired data found
      await auditLog(prisma, {
        action: 'DATA_RETENTION_CHECK',
        description: `Found ${expiredSubscribers.length} subscribers with expired data retention`,
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        legalBasis: 'legal_obligation',
        newData: { 
          expiredCount: expiredSubscribers.length,
          retentionDays: retentionDays,
          cutoffDate: cutoffDate.toISOString()
        }
      });

      // Add expired subscribers to request for processing
      req.expiredData = {
        subscribers: expiredSubscribers,
        retentionDays: retentionDays,
        cutoffDate: cutoffDate
      };
    }

    next();

  } catch (error) {
    console.error('Data retention check error:', error);
    
    await auditLog(prisma, {
      action: 'DATA_RETENTION_CHECK_ERROR',
      description: 'Data retention check failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { error: error.message }
    });

    // Don't fail the request, just log the error
    next();
  }
};

/**
 * Middleware to validate admin permissions for GDPR operations
 */
const validateAdminGDPRAccess = async (req, res, next) => {
  try {
    // This assumes you have admin authentication middleware that sets req.admin
    if (!req.admin) {
      return res.status(401).json({
        error: 'Authentication required',
        requestId: req.requestId
      });
    }

    // Check if admin has permission for GDPR operations
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (!allowedRoles.includes(req.admin.role)) {
      await auditLog(prisma, {
        action: 'GDPR_ACCESS_DENIED',
        description: 'Admin access denied for GDPR operation - insufficient permissions',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          adminId: req.admin.id,
          adminRole: req.admin.role,
          requiredRoles: allowedRoles
        }
      });

      return res.status(403).json({
        error: 'Insufficient permissions for GDPR operations',
        requiredRoles: allowedRoles,
        requestId: req.requestId
      });
    }

    // Log successful access
    await auditLog(prisma, {
      action: 'GDPR_ACCESS_GRANTED',
      description: 'Admin access granted for GDPR operation',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'legal_obligation',
      newData: { 
        adminId: req.admin.id,
        adminRole: req.admin.role
      }
    });

    next();

  } catch (error) {
    console.error('Admin GDPR access validation error:', error);
    
    await auditLog(prisma, {
      action: 'GDPR_ACCESS_VALIDATION_ERROR',
      description: 'Admin GDPR access validation failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { error: error.message }
    });

    res.status(500).json({
      error: 'Internal server error during access validation',
      requestId: req.requestId
    });
  }
};

/**
 * Middleware to track consent withdrawal events
 */
const trackConsentWithdrawal = async (req, res, next) => {
  try {
    const { subscriberId, reason } = req.body;

    if (!subscriberId) {
      return res.status(400).json({
        error: 'Subscriber ID is required for consent withdrawal',
        requestId: req.requestId
      });
    }

    // Get subscriber information
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { id: subscriberId }
    });

    if (!subscriber) {
      return res.status(404).json({
        error: 'Subscriber not found',
        requestId: req.requestId
      });
    }

    // Record consent withdrawal in consent records
    await prisma.consentRecord.create({
      data: {
        email: subscriber.email,
        consentType: 'email_marketing',
        consentGiven: false,
        consentVersion: process.env.CONSENT_VERSION || '1.0',
        legalBasis: 'consent_withdrawn',
        purpose: reason || 'User requested consent withdrawal',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        source: 'admin_withdrawal'
      }
    });

    // Log the consent withdrawal
    await auditLog(prisma, {
      subscriberId: subscriberId,
      action: 'CONSENT_WITHDRAWN',
      description: 'Consent withdrawn by admin',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'consent_withdrawn',
      oldData: { 
        consentGiven: subscriber.consentGiven,
        isActive: subscriber.isActive
      },
      newData: { 
        consentGiven: false,
        reason: reason,
        withdrawnBy: req.admin?.id
      }
    });

    req.consentWithdrawal = {
      subscriberId: subscriberId,
      subscriberEmail: subscriber.email,
      reason: reason
    };

    next();

  } catch (error) {
    console.error('Consent withdrawal tracking error:', error);
    
    await auditLog(prisma, {
      action: 'CONSENT_WITHDRAWAL_TRACKING_ERROR',
      description: 'Consent withdrawal tracking failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { error: error.message }
    });

    res.status(500).json({
      error: 'Internal server error during consent withdrawal tracking',
      requestId: req.requestId
    });
  }
};

/**
 * Middleware to validate lawful basis for data processing
 */
const validateLawfulBasis = (requiredBasis) => {
  return async (req, res, next) => {
    try {
      const validBases = [
        'consent',
        'contract',
        'legal_obligation',
        'vital_interests',
        'public_task',
        'legitimate_interests'
      ];

      if (!validBases.includes(requiredBasis)) {
        throw new Error(`Invalid lawful basis: ${requiredBasis}`);
      }

      // Log the lawful basis validation
      await auditLog(prisma, {
        action: 'LAWFUL_BASIS_VALIDATED',
        description: `Lawful basis validated: ${requiredBasis}`,
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        legalBasis: requiredBasis,
        newData: { 
          requiredBasis: requiredBasis,
          validBases: validBases
        }
      });

      req.lawfulBasis = requiredBasis;
      next();

    } catch (error) {
      console.error('Lawful basis validation error:', error);
      
      await auditLog(prisma, {
        action: 'LAWFUL_BASIS_VALIDATION_ERROR',
        description: 'Lawful basis validation failed due to server error',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          error: error.message,
          requiredBasis: requiredBasis
        }
      });

      res.status(500).json({
        error: 'Internal server error during lawful basis validation',
        requestId: req.requestId
      });
    }
  };
};

// Helper function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

module.exports = {
  validateConsent,
  validateDataSubjectRequest,
  checkDataRetention,
  validateAdminGDPRAccess,
  trackConsentWithdrawal,
  validateLawfulBasis
}; 
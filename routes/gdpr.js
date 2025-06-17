const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { sendDataRequestEmail, sendDataExportEmail } = require('../services/emailService');
const { auditLog } = require('../services/auditService');

const router = express.Router();
const prisma = new PrismaClient();

// Consent tracking endpoint
router.post('/consent',
  [
    body('consent')
      .isObject()
      .withMessage('Consent data must be an object'),
    body('consent.essential')
      .isBoolean()
      .withMessage('Essential consent must be a boolean'),
    body('consent.analytics')
      .isBoolean()
      .withMessage('Analytics consent must be a boolean'),
    body('consent.marketing')
      .isBoolean()
      .withMessage('Marketing consent must be a boolean'),
    body('source')
      .optional()
      .isString()
      .withMessage('Source must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId: req.requestId
        });
      }

      const { consent, source, userAgent, timestamp } = req.body;
      const clientIP = getClientIP(req);

      // Create consent record
      const consentRecord = await prisma.consentRecord.create({
        data: {
          email: 'anonymous', // We don't have email yet at this stage
          consentType: 'website_cookies',
          consentGiven: consent.essential || consent.analytics || consent.marketing,
          consentVersion: consent.version || '1.0',
          legalBasis: 'consent',
          purpose: 'Website functionality, analytics, and marketing communications',
          ipAddress: clientIP,
          userAgent: userAgent || req.get('User-Agent'),
          source: source || 'website',
          timestamp: timestamp ? new Date(timestamp) : new Date()
        }
      });

      // Audit log
      await auditLog(prisma, {
        action: 'CONSENT_RECORDED',
        description: 'Website consent preferences recorded',
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        legalBasis: 'consent',
        newData: {
          consentRecordId: consentRecord.id,
          consentChoices: consent,
          source: source
        }
      });

      res.status(200).json({
        message: 'Consent preferences recorded successfully',
        consentId: consentRecord.id,
        requestId: req.requestId
      });

    } catch (error) {
      console.error('Consent recording error:', error);
      
      await auditLog(prisma, {
        action: 'CONSENT_RECORDING_ERROR',
        description: 'Failed to record consent preferences',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          error: error.message,
          consentData: req.body.consent
        }
      });

      res.status(500).json({
        error: 'Internal server error while recording consent',
        requestId: req.requestId
      });
    }
  }
);

// Rate limiting for GDPR requests
const gdprRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // limit each IP to 5 GDPR requests per day
  message: {
    error: 'Too many GDPR requests from this IP, please try again tomorrow.',
    code: 'GDPR_RATE_LIMIT_EXCEEDED'
  }
});

// Helper function to hash email for lookup
function hashEmail(email) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

// Helper function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Request data export (GDPR Article 15 - Right of access)
router.post('/request-data',
  gdprRequestLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('requestType')
      .isIn(['EXPORT', 'DELETE', 'RECTIFY', 'RESTRICT', 'PORTABILITY'])
      .withMessage('Invalid request type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId: req.requestId
        });
      }

      const { email, requestType } = req.body;
      const emailHash = hashEmail(email);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Check if subscriber exists
      const subscriber = await prisma.emailSubscriber.findUnique({
        where: { emailHash }
      });

      // Create data request regardless of whether subscriber exists
      // This is important for GDPR compliance - we must respond to all requests
      const dataRequest = await prisma.dataRequest.create({
        data: {
          subscriberId: subscriber?.id,
          type: requestType,
          requestEmail: email,
          verificationToken: verificationToken,
          verificationSentAt: new Date()
        }
      });

      // Send verification email for the data request
      await sendDataRequestEmail(email, verificationToken, requestType);

      // Audit log
      await auditLog(prisma, {
        subscriberId: subscriber?.id,
        action: 'GDPR_REQUEST_CREATED',
        description: `GDPR ${requestType} request created`,
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        legalBasis: 'legal_obligation',
        newData: {
          requestType: requestType,
          email: email,
          dataRequestId: dataRequest.id
        }
      });

      res.status(200).json({
        message: 'Data request submitted. Please check your email to verify your identity.',
        requestId: req.requestId,
        dataRequestId: dataRequest.id,
        estimatedProcessingTime: '30 days' // GDPR compliance
      });

    } catch (error) {
      console.error('GDPR data request error:', error);
      
      await auditLog(prisma, {
        action: 'GDPR_REQUEST_ERROR',
        description: 'GDPR data request failed due to server error',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          error: error.message,
          email: req.body.email,
          requestType: req.body.requestType
        }
      });

      res.status(500).json({
        error: 'Internal server error during data request',
        requestId: req.requestId
      });
    }
  }
);

// Verify data request
router.get('/verify-request/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'Verification token is required',
        requestId: req.requestId
      });
    }

    // Find data request by verification token
    const dataRequest = await prisma.dataRequest.findUnique({
      where: { verificationToken: token },
      include: {
        subscriber: true
      }
    });

    if (!dataRequest) {
      await auditLog(prisma, {
        action: 'GDPR_VERIFICATION_FAILED',
        description: 'GDPR request verification failed - invalid token',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { token: token }
      });

      return res.status(404).json({
        error: 'Invalid or expired verification token',
        requestId: req.requestId
      });
    }

    if (dataRequest.status !== 'PENDING') {
      return res.status(200).json({
        message: 'Request already processed',
        status: dataRequest.status,
        requestId: req.requestId
      });
    }

    // Check if verification token is expired (7 days for GDPR requests)
    const tokenAge = Date.now() - dataRequest.verificationSentAt.getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (tokenAge > maxAge) {
      await prisma.dataRequest.update({
        where: { id: dataRequest.id },
        data: { status: 'EXPIRED' }
      });

      await auditLog(prisma, {
        subscriberId: dataRequest.subscriberId,
        action: 'GDPR_REQUEST_EXPIRED',
        description: 'GDPR request verification expired',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          dataRequestId: dataRequest.id,
          tokenAge: tokenAge, 
          maxAge: maxAge 
        }
      });

      return res.status(400).json({
        error: 'Verification token has expired. Please submit a new request.',
        code: 'TOKEN_EXPIRED',
        requestId: req.requestId
      });
    }

    // Update request as verified and process it
    await prisma.dataRequest.update({
      where: { id: dataRequest.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date()
      }
    });

    // Process the request based on type
    const processedRequest = await processDataRequest(dataRequest, req);

    // Audit log
    await auditLog(prisma, {
      subscriberId: dataRequest.subscriberId,
      action: 'GDPR_REQUEST_VERIFIED',
      description: `GDPR ${dataRequest.type} request verified and processed`,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'legal_obligation',
      newData: {
        dataRequestId: dataRequest.id,
        requestType: dataRequest.type,
        processedAt: new Date()
      }
    });

    res.status(200).json({
      message: `Your ${dataRequest.type.toLowerCase()} request has been verified and processed.`,
      requestType: dataRequest.type,
      status: 'PROCESSED',
      data: processedRequest,
      requestId: req.requestId
    });

  } catch (error) {
    console.error('GDPR verification error:', error);
    
    await auditLog(prisma, {
      action: 'GDPR_VERIFICATION_ERROR',
      description: 'GDPR request verification failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { 
        error: error.message,
        token: req.params.token 
      }
    });

    res.status(500).json({
      error: 'Internal server error during verification',
      requestId: req.requestId
    });
  }
});

// Process different types of data requests
async function processDataRequest(dataRequest, req) {
  const { type, subscriberId, requestEmail } = dataRequest;

  switch (type) {
    case 'EXPORT':
      return await processDataExport(dataRequest, req);
    
    case 'DELETE':
      return await processDataDeletion(dataRequest, req);
    
    case 'RECTIFY':
      return await processDataRectification(dataRequest, req);
    
    case 'RESTRICT':
      return await processDataRestriction(dataRequest, req);
    
    case 'PORTABILITY':
      return await processDataPortability(dataRequest, req);
    
    default:
      throw new Error(`Unknown request type: ${type}`);
  }
}

// Process data export request
async function processDataExport(dataRequest, req) {
  const { subscriberId, requestEmail } = dataRequest;

  let exportData = {
    requestedAt: new Date().toISOString(),
    requestEmail: requestEmail,
    dataFound: false,
    subscriber: null,
    auditLogs: [],
    consentRecords: []
  };

  if (subscriberId) {
    // Get subscriber data
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { id: subscriberId }
    });

    // Get audit logs related to this subscriber
    const auditLogs = await prisma.auditLog.findMany({
      where: { subscriberId: subscriberId },
      orderBy: { createdAt: 'desc' }
    });

    // Get consent records
    const consentRecords = await prisma.consentRecord.findMany({
      where: { email: requestEmail },
      orderBy: { timestamp: 'desc' }
    });

    exportData = {
      ...exportData,
      dataFound: true,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        consentGiven: subscriber.consentGiven,
        consentTimestamp: subscriber.consentTimestamp,
        consentVersion: subscriber.consentVersion,
        isVerified: subscriber.isVerified,
        verifiedAt: subscriber.verifiedAt,
        isActive: subscriber.isActive,
        unsubscribedAt: subscriber.unsubscribedAt,
        source: subscriber.source,
        utmSource: subscriber.utmSource,
        utmMedium: subscriber.utmMedium,
        utmCampaign: subscriber.utmCampaign,
        createdAt: subscriber.createdAt,
        updatedAt: subscriber.updatedAt
      },
      auditLogs: auditLogs.map(log => ({
        action: log.action,
        description: log.description,
        legalBasis: log.legalBasis,
        createdAt: log.createdAt
      })),
      consentRecords: consentRecords.map(record => ({
        consentType: record.consentType,
        consentGiven: record.consentGiven,
        consentVersion: record.consentVersion,
        legalBasis: record.legalBasis,
        purpose: record.purpose,
        timestamp: record.timestamp
      }))
    };
  }

  // Store export data and create download link
  const exportId = crypto.randomUUID();
  const exportPath = path.join(process.env.STORAGE_PATH || './storage', 'exports');
  const exportFile = path.join(exportPath, `${exportId}.json`);
  
  // Ensure export directory exists
  await fs.mkdir(exportPath, { recursive: true });
  
  // Write export data to file
  await fs.writeFile(exportFile, JSON.stringify(exportData, null, 2));

  // Set expiry time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (parseInt(process.env.EXPORT_EXPIRY_HOURS) || 72));

  // Update data request with export info
  await prisma.dataRequest.update({
    where: { id: dataRequest.id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date(),
      exportData: exportData,
      exportUrl: `/api/gdpr/download-export/${exportId}`,
      exportExpiresAt: expiresAt
    }
  });

  // Send email with download link
  await sendDataExportEmail(requestEmail, exportId, expiresAt);

  return {
    message: 'Data export completed. Download link sent to your email.',
    exportId: exportId,
    expiresAt: expiresAt,
    dataFound: exportData.dataFound
  };
}

// Process data deletion request
async function processDataDeletion(dataRequest, req) {
  const { subscriberId, requestEmail } = dataRequest;

  let deletionResult = {
    email: requestEmail,
    dataFound: false,
    itemsDeleted: []
  };

  if (subscriberId) {
    // Before deletion, create a final audit log
    await auditLog(prisma, {
      subscriberId: subscriberId,
      action: 'DATA_DELETION_INITIATED',
      description: 'User requested complete data deletion under GDPR Article 17',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'legal_obligation'
    });

    // Delete in the correct order due to foreign key constraints
    // 1. Delete audit logs
    const auditLogsDeleted = await prisma.auditLog.deleteMany({
      where: { subscriberId: subscriberId }
    });

    // 2. Delete data requests
    const dataRequestsDeleted = await prisma.dataRequest.deleteMany({
      where: { subscriberId: subscriberId }
    });

    // 3. Delete subscriber
    const subscriberDeleted = await prisma.emailSubscriber.delete({
      where: { id: subscriberId }
    });

    deletionResult = {
      ...deletionResult,
      dataFound: true,
      itemsDeleted: [
        `Subscriber record: ${subscriberDeleted.email}`,
        `Audit logs: ${auditLogsDeleted.count} records`,
        `Data requests: ${dataRequestsDeleted.count} records`
      ]
    };
  }

  // Also delete consent records for this email
  const consentRecordsDeleted = await prisma.consentRecord.deleteMany({
    where: { email: requestEmail }
  });

  if (consentRecordsDeleted.count > 0) {
    deletionResult.itemsDeleted.push(`Consent records: ${consentRecordsDeleted.count} records`);
  }

  // Create a final audit log for the deletion (without subscriberId since it's deleted)
  await auditLog(prisma, {
    action: 'DATA_DELETION_COMPLETED',
    description: 'Complete data deletion executed under GDPR Article 17',
    ipAddress: getClientIP(req),
    userAgent: req.get('User-Agent'),
    requestId: req.requestId,
    legalBasis: 'legal_obligation',
    newData: deletionResult
  });

  // Update data request status
  await prisma.dataRequest.update({
    where: { id: dataRequest.id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date()
    }
  });

  return deletionResult;
}

// Placeholder functions for other GDPR request types
async function processDataRectification(dataRequest, req) {
  // Update data request status
  await prisma.dataRequest.update({
    where: { id: dataRequest.id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date(),
      notes: 'Data rectification requires manual review. Our team will contact you within 30 days.'
    }
  });

  return {
    message: 'Data rectification request received. Our team will review and contact you within 30 days.',
    requiresManualReview: true
  };
}

async function processDataRestriction(dataRequest, req) {
  const { subscriberId } = dataRequest;

  if (subscriberId) {
    // Mark subscriber as restricted (inactive but not deleted)
    await prisma.emailSubscriber.update({
      where: { id: subscriberId },
      data: {
        isActive: false,
        // Add a note about restriction
      }
    });
  }

  await prisma.dataRequest.update({
    where: { id: dataRequest.id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date()
    }
  });

  return {
    message: 'Processing restriction applied. Your data will not be used for marketing purposes.',
    restricted: true
  };
}

async function processDataPortability(dataRequest, req) {
  // For email subscription data, this is similar to export but in a structured format
  const exportResult = await processDataExport(dataRequest, req);
  
  return {
    ...exportResult,
    message: 'Data portability export completed. Your data is provided in a structured, machine-readable format.'
  };
}

// Download export file
router.get('/download-export/:exportId', async (req, res) => {
  try {
    const { exportId } = req.params;

    // Find the data request with this export ID
    const dataRequest = await prisma.dataRequest.findFirst({
      where: {
        exportUrl: `/api/gdpr/download-export/${exportId}`,
        status: 'COMPLETED'
      }
    });

    if (!dataRequest) {
      return res.status(404).json({
        error: 'Export not found',
        requestId: req.requestId
      });
    }

    // Check if export has expired
    if (dataRequest.exportExpiresAt && new Date() > dataRequest.exportExpiresAt) {
      return res.status(410).json({
        error: 'Export download link has expired',
        requestId: req.requestId
      });
    }

    const exportPath = path.join(process.env.STORAGE_PATH || './storage', 'exports', `${exportId}.json`);

    try {
      const exportData = await fs.readFile(exportPath, 'utf8');
      
      // Audit log the download
      await auditLog(prisma, {
        subscriberId: dataRequest.subscriberId,
        action: 'DATA_EXPORT_DOWNLOADED',
        description: 'User downloaded their data export',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        legalBasis: 'legal_obligation',
        newData: { exportId: exportId }
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="my-data-export-${exportId}.json"`);
      res.send(exportData);

    } catch (fileError) {
      console.error('Export file read error:', fileError);
      res.status(404).json({
        error: 'Export file not found',
        requestId: req.requestId
      });
    }

  } catch (error) {
    console.error('Export download error:', error);
    res.status(500).json({
      error: 'Internal server error during download',
      requestId: req.requestId
    });
  }
});

// Get GDPR request status
router.get('/request-status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const dataRequest = await prisma.dataRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        processedAt: true,
        exportExpiresAt: true,
        notes: true
      }
    });

    if (!dataRequest) {
      return res.status(404).json({
        error: 'Request not found',
        requestId: req.requestId
      });
    }

    res.json({
      request: dataRequest,
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Request status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.requestId
    });
  }
});

module.exports = router; 
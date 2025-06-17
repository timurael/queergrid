const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');
const { auditLog } = require('../services/auditService');
const { validateConsent } = require('../middleware/gdprValidation');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for email submissions
const emailSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 email submissions per windowMs
  message: {
    error: 'Too many email submissions from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Helper function to hash email for deduplication
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

// Subscribe to email list
router.post('/subscribe', 
  emailSubmissionLimiter,
  validateConsent,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('consent')
      .isBoolean()
      .withMessage('Consent must be explicitly given'),
    body('source')
      .optional()
      .isString()
      .trim()
      .escape(),
    body('utmSource')
      .optional()
      .isString()
      .trim()
      .escape(),
    body('utmMedium')
      .optional()
      .isString()
      .trim()
      .escape(),
    body('utmCampaign')
      .optional()
      .isString()
      .trim()
      .escape()
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await auditLog(prisma, {
          action: 'SUBSCRIPTION_FAILED',
          description: 'Email subscription failed - validation errors',
          ipAddress: getClientIP(req),
          userAgent: req.get('User-Agent'),
          requestId: req.requestId,
          newData: { errors: errors.array() }
        });

        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId: req.requestId
        });
      }

      const { email, consent, source, utmSource, utmMedium, utmCampaign } = req.body;

      // Check if consent was given
      if (!consent) {
        await auditLog(prisma, {
          action: 'SUBSCRIPTION_FAILED',
          description: 'Email subscription failed - consent not given',
          ipAddress: getClientIP(req),
          userAgent: req.get('User-Agent'),
          requestId: req.requestId,
          newData: { email: email }
        });

        return res.status(400).json({
          error: 'Consent is required for email subscription',
          code: 'CONSENT_REQUIRED',
          requestId: req.requestId
        });
      }

      const emailHash = hashEmail(email);
      const clientIP = getClientIP(req);
      const userAgent = req.get('User-Agent');
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Check if email already exists
      const existingSubscriber = await prisma.emailSubscriber.findUnique({
        where: { emailHash }
      });

      if (existingSubscriber) {
        // Log duplicate subscription attempt
        await auditLog(prisma, {
          subscriberId: existingSubscriber.id,
          action: 'DUPLICATE_SUBSCRIPTION_ATTEMPT',
          description: 'Attempted to subscribe with existing email',
          ipAddress: clientIP,
          userAgent: userAgent,
          requestId: req.requestId,
          newData: { 
            email: email,
            source: source,
            existingStatus: existingSubscriber.isActive ? 'active' : 'inactive'
          }
        });

        // If the subscriber exists but is inactive, reactivate them
        if (!existingSubscriber.isActive) {
          const updatedSubscriber = await prisma.emailSubscriber.update({
            where: { id: existingSubscriber.id },
            data: {
              isActive: true,
              consentGiven: true,
              consentTimestamp: new Date(),
              consentIpAddress: clientIP,
              consentUserAgent: userAgent,
              consentVersion: process.env.CONSENT_VERSION || '1.0',
              verificationToken: verificationToken,
              verificationSentAt: new Date(),
              source: source || existingSubscriber.source,
              utmSource: utmSource,
              utmMedium: utmMedium,
              utmCampaign: utmCampaign
            }
          });

          // Send verification email
          await sendVerificationEmail(email, verificationToken);

          await auditLog(prisma, {
            subscriberId: updatedSubscriber.id,
            action: 'SUBSCRIPTION_REACTIVATED',
            description: 'Reactivated existing inactive subscription',
            ipAddress: clientIP,
            userAgent: userAgent,
            requestId: req.requestId,
            legalBasis: 'consent',
            newData: { 
              email: email,
              source: source,
              consentVersion: process.env.CONSENT_VERSION || '1.0'
            }
          });

          return res.status(200).json({
            message: 'Subscription reactivated. Please check your email to verify.',
            requiresVerification: true,
            requestId: req.requestId
          });
        }

        // If already active, just send a friendly message
        return res.status(200).json({
          message: 'You are already subscribed to our newsletter!',
          alreadySubscribed: true,
          requestId: req.requestId
        });
      }

      // Create new subscriber
      const subscriber = await prisma.emailSubscriber.create({
        data: {
          email: email,
          emailHash: emailHash,
          consentGiven: true,
          consentTimestamp: new Date(),
          consentIpAddress: clientIP,
          consentUserAgent: userAgent,
          consentVersion: process.env.CONSENT_VERSION || '1.0',
          verificationToken: verificationToken,
          verificationSentAt: new Date(),
          source: source || 'website',
          utmSource: utmSource,
          utmMedium: utmMedium,
          utmCampaign: utmCampaign
        }
      });

      // Record consent in separate table for audit trail
      await prisma.consentRecord.create({
        data: {
          email: email,
          consentType: 'email_marketing',
          consentGiven: true,
          consentVersion: process.env.CONSENT_VERSION || '1.0',
          legalBasis: 'consent',
          purpose: 'Email newsletter and community updates',
          ipAddress: clientIP,
          userAgent: userAgent,
          source: source || 'website'
        }
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      // Audit log
      await auditLog(prisma, {
        subscriberId: subscriber.id,
        action: 'SUBSCRIPTION_CREATED',
        description: 'New email subscription created',
        ipAddress: clientIP,
        userAgent: userAgent,
        requestId: req.requestId,
        legalBasis: 'consent',
        newData: {
          email: email,
          source: source,
          consentVersion: process.env.CONSENT_VERSION || '1.0',
          utmSource: utmSource,
          utmMedium: utmMedium,
          utmCampaign: utmCampaign
        }
      });

      res.status(201).json({
        message: 'Subscription successful! Please check your email to verify your subscription.',
        requiresVerification: true,
        subscriberId: subscriber.id,
        requestId: req.requestId
      });

    } catch (error) {
      console.error('Email subscription error:', error);
      
      await auditLog(prisma, {
        action: 'SUBSCRIPTION_ERROR',
        description: 'Email subscription failed due to server error',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          error: error.message,
          email: req.body.email 
        }
      });

      res.status(500).json({
        error: 'Internal server error during subscription',
        requestId: req.requestId
      });
    }
  }
);

// Verify email address
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'Verification token is required',
        requestId: req.requestId
      });
    }

    // Find subscriber by verification token
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { verificationToken: token }
    });

    if (!subscriber) {
      await auditLog(prisma, {
        action: 'VERIFICATION_FAILED',
        description: 'Email verification failed - invalid token',
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

    if (subscriber.isVerified) {
      return res.status(200).json({
        message: 'Email already verified',
        alreadyVerified: true,
        requestId: req.requestId
      });
    }

    // Check if verification token is expired (24 hours)
    const tokenAge = Date.now() - subscriber.verificationSentAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      await auditLog(prisma, {
        subscriberId: subscriber.id,
        action: 'VERIFICATION_EXPIRED',
        description: 'Email verification failed - token expired',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { tokenAge: tokenAge, maxAge: maxAge }
      });

      return res.status(400).json({
        error: 'Verification token has expired',
        code: 'TOKEN_EXPIRED',
        requestId: req.requestId
      });
    }

    // Update subscriber as verified
    const updatedSubscriber = await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verificationToken: null // Clear the token after use
      }
    });

    // Send welcome email
    await sendWelcomeEmail(subscriber.email);

    // Audit log
    await auditLog(prisma, {
      subscriberId: subscriber.id,
      action: 'EMAIL_VERIFIED',
      description: 'Email address successfully verified',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'consent',
      newData: {
        email: subscriber.email,
        verifiedAt: updatedSubscriber.verifiedAt
      }
    });

    res.status(200).json({
      message: 'Email successfully verified! Welcome to the Queer Grid community.',
      verified: true,
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    await auditLog(prisma, {
      action: 'VERIFICATION_ERROR',
      description: 'Email verification failed due to server error',
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

// Unsubscribe endpoint
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'Unsubscribe token is required',
        requestId: req.requestId
      });
    }

    // Find subscriber by unsubscribe token
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { unsubscribeToken: token }
    });

    if (!subscriber) {
      await auditLog(prisma, {
        action: 'UNSUBSCRIBE_FAILED',
        description: 'Unsubscribe failed - invalid token',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { token: token }
      });

      return res.status(404).json({
        error: 'Invalid unsubscribe token',
        requestId: req.requestId
      });
    }

    if (!subscriber.isActive) {
      return res.status(200).json({
        message: 'You are already unsubscribed',
        alreadyUnsubscribed: true,
        requestId: req.requestId
      });
    }

    // Update subscriber as unsubscribed
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    // Record consent withdrawal
    await prisma.consentRecord.create({
      data: {
        email: subscriber.email,
        consentType: 'email_marketing',
        consentGiven: false,
        consentVersion: process.env.CONSENT_VERSION || '1.0',
        legalBasis: 'consent_withdrawn',
        purpose: 'Consent withdrawn for email marketing',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        source: 'unsubscribe_link'
      }
    });

    // Audit log
    await auditLog(prisma, {
      subscriberId: subscriber.id,
      action: 'UNSUBSCRIBED',
      description: 'User unsubscribed from email list',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      legalBasis: 'consent_withdrawn',
      oldData: { isActive: true },
      newData: { 
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    res.status(200).json({
      message: 'You have been successfully unsubscribed from our newsletter.',
      unsubscribed: true,
      requestId: req.requestId
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    
    await auditLog(prisma, {
      action: 'UNSUBSCRIBE_ERROR',
      description: 'Unsubscribe failed due to server error',
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      newData: { 
        error: error.message,
        token: req.params.token 
      }
    });

    res.status(500).json({
      error: 'Internal server error during unsubscribe',
      requestId: req.requestId
    });
  }
});

// Resend verification email
router.post('/resend-verification', 
  emailSubmissionLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
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

      const { email } = req.body;
      const emailHash = hashEmail(email);

      const subscriber = await prisma.emailSubscriber.findUnique({
        where: { emailHash }
      });

      if (!subscriber) {
        // Don't reveal whether email exists or not for security
        return res.status(200).json({
          message: 'If this email is in our system, a verification email has been sent.',
          requestId: req.requestId
        });
      }

      if (subscriber.isVerified) {
        return res.status(200).json({
          message: 'This email is already verified.',
          alreadyVerified: true,
          requestId: req.requestId
        });
      }

      if (!subscriber.isActive) {
        return res.status(400).json({
          error: 'This subscription is inactive. Please subscribe again.',
          requestId: req.requestId
        });
      }

      // Generate new verification token
      const newVerificationToken = crypto.randomBytes(32).toString('hex');

      await prisma.emailSubscriber.update({
        where: { id: subscriber.id },
        data: {
          verificationToken: newVerificationToken,
          verificationSentAt: new Date()
        }
      });

      // Send verification email
      await sendVerificationEmail(email, newVerificationToken);

      // Audit log
      await auditLog(prisma, {
        subscriberId: subscriber.id,
        action: 'VERIFICATION_RESENT',
        description: 'Verification email resent',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { email: email }
      });

      res.status(200).json({
        message: 'Verification email sent. Please check your inbox.',
        requestId: req.requestId
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      
      await auditLog(prisma, {
        action: 'VERIFICATION_RESEND_ERROR',
        description: 'Failed to resend verification email',
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent'),
        requestId: req.requestId,
        newData: { 
          error: error.message,
          email: req.body.email 
        }
      });

      res.status(500).json({
        error: 'Internal server error',
        requestId: req.requestId
      });
    }
  }
);

module.exports = router; 
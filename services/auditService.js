const { PrismaClient } = require('@prisma/client');
const winston = require('winston');

const prisma = new PrismaClient();

// Configure audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'audit-service' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/audit.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: 'logs/audit-error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Create an audit log entry
 * @param {PrismaClient} prismaClient - Prisma client instance
 * @param {Object} auditData - Audit log data
 * @param {string} auditData.subscriberId - Optional subscriber ID
 * @param {string} auditData.action - Action performed
 * @param {string} auditData.description - Human-readable description
 * @param {string} auditData.ipAddress - Client IP address
 * @param {string} auditData.userAgent - Client user agent
 * @param {string} auditData.requestId - Request ID for tracing
 * @param {string} auditData.legalBasis - Legal basis for processing
 * @param {Object} auditData.oldData - Data before change
 * @param {Object} auditData.newData - Data after change
 */
async function auditLog(prismaClient, auditData) {
  try {
    const {
      subscriberId,
      action,
      description,
      ipAddress,
      userAgent,
      requestId,
      legalBasis,
      oldData,
      newData
    } = auditData;

    // Validate required fields
    if (!action || !description) {
      throw new Error('Action and description are required for audit logging');
    }

    // Create audit log in database
    const auditRecord = await prismaClient.auditLog.create({
      data: {
        subscriberId: subscriberId || null,
        action: action,
        description: description,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        requestId: requestId || null,
        legalBasis: legalBasis || null,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null
      }
    });

    // Also log to Winston for file-based audit trail
    auditLogger.info('Audit log created', {
      auditId: auditRecord.id,
      subscriberId: subscriberId,
      action: action,
      description: description,
      ipAddress: ipAddress,
      userAgent: userAgent,
      requestId: requestId,
      legalBasis: legalBasis,
      timestamp: auditRecord.createdAt,
      oldData: oldData,
      newData: newData
    });

    return auditRecord;

  } catch (error) {
    // Log error but don't fail the main operation
    auditLogger.error('Failed to create audit log', {
      error: error.message,
      stack: error.stack,
      auditData: auditData
    });
    
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid disrupting main operations
    return null;
  }
}

/**
 * Get audit logs for a specific subscriber
 * @param {string} subscriberId - Subscriber ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of records to return
 * @param {number} options.offset - Number of records to skip
 * @param {string} options.action - Filter by action type
 * @param {Date} options.startDate - Start date filter
 * @param {Date} options.endDate - End date filter
 */
async function getAuditLogs(subscriberId, options = {}) {
  try {
    const {
      limit = 100,
      offset = 0,
      action,
      startDate,
      endDate
    } = options;

    const where = {
      subscriberId: subscriberId
    };

    // Add filters
    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        action: true,
        description: true,
        legalBasis: true,
        createdAt: true,
        ipAddress: true,
        requestId: true,
        oldData: true,
        newData: true
      }
    });

    return auditLogs;

  } catch (error) {
    auditLogger.error('Failed to retrieve audit logs', {
      error: error.message,
      subscriberId: subscriberId,
      options: options
    });
    throw error;
  }
}

/**
 * Get audit statistics for reporting
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date filter
 * @param {Date} options.endDate - End date filter
 */
async function getAuditStats(options = {}) {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = options;

    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    // Get total count
    const totalCount = await prisma.auditLog.count({ where });

    // Get count by action type
    const actionCounts = await prisma.auditLog.groupBy({
      by: ['action'],
      where: where,
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    });

    // Get count by legal basis
    const legalBasisCounts = await prisma.auditLog.groupBy({
      by: ['legalBasis'],
      where: where,
      _count: {
        legalBasis: true
      },
      orderBy: {
        _count: {
          legalBasis: 'desc'
        }
      }
    });

    // Get daily activity
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM audit_logs 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      period: {
        startDate: startDate,
        endDate: endDate
      },
      totalCount: totalCount,
      actionCounts: actionCounts.map(item => ({
        action: item.action,
        count: item._count.action
      })),
      legalBasisCounts: legalBasisCounts.map(item => ({
        legalBasis: item.legalBasis,
        count: item._count.legalBasis
      })),
      dailyActivity: dailyActivity
    };

  } catch (error) {
    auditLogger.error('Failed to get audit statistics', {
      error: error.message,
      options: options
    });
    throw error;
  }
}

/**
 * Search audit logs with advanced filtering
 * @param {Object} searchOptions - Search parameters
 * @param {string} searchOptions.email - Email to search for
 * @param {string} searchOptions.ipAddress - IP address to search for
 * @param {string} searchOptions.action - Action to filter by
 * @param {string} searchOptions.description - Description to search in
 * @param {Date} searchOptions.startDate - Start date
 * @param {Date} searchOptions.endDate - End date
 * @param {number} searchOptions.limit - Max results
 * @param {number} searchOptions.offset - Offset for pagination
 */
async function searchAuditLogs(searchOptions = {}) {
  try {
    const {
      email,
      ipAddress,
      action,
      description,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = searchOptions;

    let where = {};

    // Search by email (need to join with subscriber table)
    if (email) {
      const subscriber = await prisma.emailSubscriber.findFirst({
        where: {
          email: {
            contains: email,
            mode: 'insensitive'
          }
        }
      });
      
      if (subscriber) {
        where.subscriberId = subscriber.id;
      } else {
        // No subscriber found, return empty results
        return {
          logs: [],
          total: 0,
          searchOptions: searchOptions
        };
      }
    }

    // Filter by IP address
    if (ipAddress) {
      where.ipAddress = {
        contains: ipAddress
      };
    }

    // Filter by action
    if (action) {
      where.action = action;
    }

    // Search in description
    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive'
      };
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where });

    // Get audit logs with subscriber information
    const logs = await prisma.auditLog.findMany({
      where: where,
      include: {
        subscriber: {
          select: {
            id: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return {
      logs: logs,
      total: total,
      searchOptions: searchOptions,
      pagination: {
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < total
      }
    };

  } catch (error) {
    auditLogger.error('Failed to search audit logs', {
      error: error.message,
      searchOptions: searchOptions
    });
    throw error;
  }
}

/**
 * Clean up old audit logs based on retention policy
 * @param {number} retentionDays - Number of days to retain logs
 */
async function cleanupOldAuditLogs(retentionDays = null) {
  try {
    const retention = retentionDays || parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 2555; // 7 years default
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retention);

    const deleteResult = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    auditLogger.info('Audit log cleanup completed', {
      retentionDays: retention,
      cutoffDate: cutoffDate,
      deletedCount: deleteResult.count
    });

    return {
      retentionDays: retention,
      cutoffDate: cutoffDate,
      deletedCount: deleteResult.count
    };

  } catch (error) {
    auditLogger.error('Failed to cleanup old audit logs', {
      error: error.message,
      retentionDays: retentionDays
    });
    throw error;
  }
}

/**
 * Export audit logs for compliance reporting
 * @param {Object} exportOptions - Export parameters
 * @param {Date} exportOptions.startDate - Start date for export
 * @param {Date} exportOptions.endDate - End date for export
 * @param {string} exportOptions.format - Export format (json, csv)
 */
async function exportAuditLogs(exportOptions = {}) {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
      format = 'json'
    } = exportOptions;

    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    const auditLogs = await prisma.auditLog.findMany({
      where: where,
      include: {
        subscriber: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const exportData = {
      exportMetadata: {
        generatedAt: new Date().toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalRecords: auditLogs.length,
        format: format
      },
      auditLogs: auditLogs.map(log => ({
        id: log.id,
        subscriberId: log.subscriberId,
        subscriberEmail: log.subscriber?.email,
        action: log.action,
        description: log.description,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        requestId: log.requestId,
        legalBasis: log.legalBasis,
        oldData: log.oldData,
        newData: log.newData,
        createdAt: log.createdAt.toISOString()
      }))
    };

    auditLogger.info('Audit logs exported', {
      startDate: startDate,
      endDate: endDate,
      recordCount: auditLogs.length,
      format: format
    });

    return exportData;

  } catch (error) {
    auditLogger.error('Failed to export audit logs', {
      error: error.message,
      exportOptions: exportOptions
    });
    throw error;
  }
}

module.exports = {
  auditLog,
  getAuditLogs,
  getAuditStats,
  searchAuditLogs,
  cleanupOldAuditLogs,
  exportAuditLogs
}; 
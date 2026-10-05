const { evaluateRisk } = require('./riskEngine');
const Log = require('../models/Log');
const { isDbConnected, addMemoryLog } = require('../config/db');

const securityMiddleware = async (req, res, next) => {
  // Skip security checks for internal monitoring/log endpoints if desired
  if (req.originalUrl.startsWith('/api/logs')) {
    return next();
  }

  const startTime = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Evaluate request risk score & classification
  const riskResult = evaluateRisk(req);

  // Attach risk context to request for downstream handlers (e.g. login route failure tracking)
  req.riskContext = riskResult;

  const logPayload = {
    timestamp: new Date(),
    ip,
    method: req.method,
    endpoint: req.originalUrl || req.url,
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    reasons: riskResult.reasons,
    reason: riskResult.reasonSummary,
    userAgent: req.headers['user-agent'] || 'Unknown Client'
  };

  // -------------------------------------------------------------
  // HIGH RISK -> BLOCK IMMEDIATELY
  // -------------------------------------------------------------
  if (riskResult.action === 'BLOCK') {
    const responseTime = Date.now() - startTime;
    const blockedLog = {
      ...logPayload,
      status: 'BLOCKED',
      statusCode: 403,
      responseTime
    };

    // Save log asynchronously
    saveLog(blockedLog);

    return res.status(403).json({
      error: 'Security Policy Violation',
      message: 'Request blocked by Behavioral API Security Middleware',
      status: 'BLOCKED',
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      reasons: riskResult.reasons,
      timestamp: new Date().toISOString()
    });
  }

  // -------------------------------------------------------------
  // LOW / MEDIUM RISK -> ALLOW / FLAG & CONTINUE
  // Intercept response completion to capture status code and execution time
  // -------------------------------------------------------------
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;
    const finalStatus = riskResult.action === 'FLAG' ? 'FLAGGED' : 'ALLOWED';

    const completedLog = {
      ...logPayload,
      status: finalStatus,
      statusCode: res.statusCode,
      responseTime
    };

    saveLog(completedLog);
    return originalEnd.apply(res, args);
  };

  next();
};

/**
 * Helper to save log to MongoDB if connected, or memory buffer as fallback
 */
async function saveLog(logData) {
  try {
    // Always store in memory for quick frontend retrieval
    addMemoryLog(logData);

    // If MongoDB is connected, persist to collection
    if (isDbConnected()) {
      await Log.create(logData);
    }
  } catch (err) {
    console.error('[SecurityMiddleware] Failed to save security log:', err.message);
  }
}

module.exports = securityMiddleware;

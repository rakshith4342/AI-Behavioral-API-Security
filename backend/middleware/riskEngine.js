/**
 * BEHAVIORAL SECURITY RISK ENGINE (RULE-BASED CORE)
 * 
 * Future ML Integration Note:
 * This module evaluates API request risk using deterministic security rules.
 * In Phase 2, a Python + Scikit-learn Isolation Forest model will be added 
 * to provide secondary behavioral anomaly scores.
 */

// In-Memory state trackers for rate limiting and failed logins
const ipRequestHistory = new Map(); // IP -> Array of timestamps
const ipFailedLoginHistory = new Map(); // IP -> Array of timestamps

// Configuration thresholds
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const RATE_LIMIT_WARNING = 5;       // >5 requests in 10s = suspicious
const RATE_LIMIT_BLOCK = 10;        // >10 requests in 10s = high risk

const FAILED_LOGIN_WINDOW_MS = 60000; // 60 seconds

/**
 * Record a failed login attempt for an IP
 */
const recordFailedLogin = (ip) => {
  const now = Date.now();
  const attempts = ipFailedLoginHistory.get(ip) || [];
  const validAttempts = attempts.filter(ts => now - ts < FAILED_LOGIN_WINDOW_MS);
  validAttempts.push(now);
  ipFailedLoginHistory.set(ip, validAttempts);
};

/**
 * Reset all security tracking stores (useful for demo resets)
 */
const resetSecurityTrackers = () => {
  ipRequestHistory.clear();
  ipFailedLoginHistory.clear();
};

/**
 * Evaluate Risk Score for an incoming request
 * @param {Object} req - Express Request object
 * @returns {Object} { riskScore, riskLevel, action, reasons }
 */
const evaluateRisk = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const endpoint = req.originalUrl || req.url;
  const method = req.method;
  const headers = req.headers || {};
  const body = req.body || {};
  const query = req.query || {};
  
  let riskScore = 0;
  const reasons = [];

  const now = Date.now();

  // -------------------------------------------------------------
  // RULE 1: RATE LIMITING & REQUEST FREQUENCY (Request Burst)
  // -------------------------------------------------------------
  const timestamps = ipRequestHistory.get(ip) || [];
  const recentRequests = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  recentRequests.push(now);
  ipRequestHistory.set(ip, recentRequests);

  const requestCount = recentRequests.length;
  if (requestCount > RATE_LIMIT_BLOCK) {
    riskScore += 70;
    reasons.push(`High Frequency Burst: ${requestCount} requests in last 10s (Threshold: ${RATE_LIMIT_BLOCK})`);
  } else if (requestCount > RATE_LIMIT_WARNING) {
    riskScore += 35;
    reasons.push(`Moderate Frequency Burst: ${requestCount} requests in last 10s (Threshold: ${RATE_LIMIT_WARNING})`);
  }

  // -------------------------------------------------------------
  // RULE 2: REPEATED FAILED LOGIN TRACKING
  // -------------------------------------------------------------
  const failedAttempts = (ipFailedLoginHistory.get(ip) || []).filter(ts => now - ts < FAILED_LOGIN_WINDOW_MS);
  if (failedAttempts.length >= 2) {
    riskScore += 75;
    reasons.push(`Brute-force Threat: ${failedAttempts.length} previous failed login attempts recorded for IP`);
  } else if (failedAttempts.length === 1) {
    riskScore += 35;
    reasons.push(`Authentication Warning: ${failedAttempts.length} previous failed login recorded for IP`);
  }

  // -------------------------------------------------------------
  // RULE 3: ENDPOINT PROTECTION & AUTHORIZATION CHECK
  // -------------------------------------------------------------
  if (endpoint.startsWith('/api/admin')) {
    const authHeader = headers['authorization'] || headers['x-admin-token'];
    if (!authHeader || authHeader !== 'secret-admin-key') {
      riskScore += 65;
      reasons.push(`Unauthorized Access Attempt: Protected route '${endpoint}' missing valid admin token`);
    }
  }

  // -------------------------------------------------------------
  // RULE 4: REQUEST VALIDATION & SUSPICIOUS PAYLOAD PATTERNS
  // -------------------------------------------------------------
  const payloadStr = JSON.stringify({ body, query }).toLowerCase();
  
  // SQL Injection basic signature test
  const sqliPatterns = ['or 1=1', 'union select', 'drop table', 'exec(', '--'];
  for (const pattern of sqliPatterns) {
    if (payloadStr.includes(pattern)) {
      riskScore += 60;
      reasons.push(`Suspicious Payload Signature: SQL Injection pattern detected ('${pattern}')`);
      break;
    }
  }

  // XSS Signature test
  const xssPatterns = ['<script>', 'javascript:', 'onerror='];
  for (const pattern of xssPatterns) {
    if (payloadStr.includes(pattern)) {
      riskScore += 50;
      reasons.push(`Suspicious Payload Signature: XSS Script pattern detected ('${pattern}')`);
      break;
    }
  }

  // Cap score between 0 and 100
  riskScore = Math.min(Math.max(riskScore, 0), 100);

  // Default reason if normal request
  if (reasons.length === 0) {
    reasons.push('Normal request pattern conforming to baseline behavior');
  }

  // -------------------------------------------------------------
  // RISK LEVEL & ACTION CLASSIFICATION
  // -------------------------------------------------------------
  let riskLevel = 'LOW';
  let action = 'ALLOW';

  if (riskScore >= 61) {
    riskLevel = 'HIGH';
    action = 'BLOCK';
  } else if (riskScore >= 31) {
    riskLevel = 'MEDIUM';
    action = 'FLAG';
  } else {
    riskLevel = 'LOW';
    action = 'ALLOW';
  }

  return {
    riskScore,
    riskLevel,
    action,
    reasons,
    reasonSummary: reasons.join(' | ')
  };
};

module.exports = {
  evaluateRisk,
  recordFailedLogin,
  resetSecurityTrackers
};

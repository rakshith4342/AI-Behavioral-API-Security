const express = require('express');
const router = express.Router();
const { recordFailedLogin } = require('../middleware/riskEngine');

// 1. GET /api/products - Sample public products endpoint
router.get('/products', (req, res) => {
  res.json({
    success: true,
    count: 3,
    data: [
      { id: 101, name: 'AI API Security Shield', category: 'Cybersecurity', price: 499, status: 'Active' },
      { id: 102, name: 'Behavioral Anomaly Scanner', category: 'Machine Learning', price: 799, status: 'Active' },
      { id: 103, name: 'Cloud WAF Integration Module', category: 'DevOps', price: 299, status: 'Active' }
    ],
    meta: {
      riskScore: req.riskContext?.riskScore || 0,
      riskLevel: req.riskContext?.riskLevel || 'LOW'
    }
  });
});

// 2. GET /api/users - Sample users endpoint
router.get('/users', (req, res) => {
  res.json({
    success: true,
    count: 2,
    data: [
      { id: 1, name: 'Security Admin', email: 'admin@secureshield.io', role: 'SecOps' },
      { id: 2, name: 'DevOps Lead', email: 'devops@secureshield.io', role: 'Engineer' }
    ],
    meta: {
      riskScore: req.riskContext?.riskScore || 0,
      riskLevel: req.riskContext?.riskLevel || 'LOW'
    }
  });
});

// 3. POST /api/login - Login endpoint with failed login behavioral tracking
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Demo valid credentials
  if (username === 'admin' && password === 'secret123') {
    return res.json({
      success: true,
      message: 'Authentication successful',
      token: 'demo-jwt-session-token-xyz',
      user: { username: 'admin', role: 'Administrator' }
    });
  }

  // Record failed login attempt for behavioral risk scoring
  recordFailedLogin(ip);

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials',
    message: 'Authentication failed. Incorrect username or password.',
    ipLogged: ip
  });
});

// 4. GET /api/admin - Protected endpoint requiring Authorization header
router.get('/admin', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];

  if (authHeader !== 'secret-admin-key') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized Access',
      message: 'Invalid or missing admin security token'
    });
  }

  res.json({
    success: true,
    message: 'Welcome to Security Control Panel',
    systemMetrics: {
      cpuUsage: '14%',
      activeSessions: 42,
      threatProtectionStatus: 'OPTIMAL'
    }
  });
});

module.exports = router;

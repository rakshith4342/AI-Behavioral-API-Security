const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { isDbConnected, getMemoryLogs, clearMemoryLogs } = require('../config/db');
const { resetSecurityTrackers } = require('../middleware/riskEngine');

// GET /api/logs - Retrieve security logs & summary stats
router.get('/', async (req, res) => {
  try {
    let logs = [];

    if (isDbConnected()) {
      logs = await Log.find().sort({ timestamp: -1 }).limit(100).lean();
    } else {
      logs = getMemoryLogs();
    }

    // Compute summary metrics
    const stats = {
      total: logs.length,
      allowed: logs.filter(l => l.status === 'ALLOWED').length,
      flagged: logs.filter(l => l.status === 'FLAGGED').length,
      blocked: logs.filter(l => l.status === 'BLOCKED').length,
      avgRiskScore: logs.length ? Math.round(logs.reduce((acc, l) => acc + (l.riskScore || 0), 0) / logs.length) : 0
    };

    res.json({
      success: true,
      stats,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security logs',
      message: error.message
    });
  }
});

// DELETE /api/logs - Reset security logs and risk trackers for live demo
router.delete('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      await Log.deleteMany({});
    }
    clearMemoryLogs();
    resetSecurityTrackers();

    res.json({
      success: true,
      message: 'Security logs and rate limit trackers reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset logs',
      message: error.message
    });
  }
});

module.exports = router;

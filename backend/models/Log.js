const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ip: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  status: {
    type: String, // ALLOW, FLAGGED, BLOCKED
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String, // LOW, MEDIUM, HIGH
    required: true
  },
  reason: {
    type: String, // Summary or bullet points of rules triggered
    default: 'Normal Request Pattern'
  },
  reasons: [{
    type: String
  }],
  responseTime: {
    type: Number, // Execution time in milliseconds
    default: 0
  },
  userAgent: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Log', LogSchema);

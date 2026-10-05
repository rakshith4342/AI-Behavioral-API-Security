const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const securityMiddleware = require('./middleware/securityMiddleware');
const apiRoutes = require('./routes/apiRoutes');
const logRoutes = require('./routes/logRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (with automatic fallback to in-memory store)
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Behavioral Security Middleware (runs before API business routes)
app.use(securityMiddleware);

// API Routes
app.use('/api', apiRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'AI-Powered Behavioral API Security Platform (Phase 1 Rule Engine)',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  BEHAVIORAL API SECURITY BACKEND ACTIVE`);
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

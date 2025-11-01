const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Import middleware
const {
  corsMiddleware,
  apiLogger,
  errorLogger,
  notFound,
  errorHandler,
  sanitizeInput,
  preventNoSQLInjection
} = require('./middlewares');

// Global Middleware (Order matters!)

// 1. CORS - Must be first
app.use(corsMiddleware);

// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging
app.use(apiLogger);

// 4. Security - Sanitization (applied globally)
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// Routes
const authRoutes = require('./routes/authRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const bidRoutes = require('./routes/bidRoutes');

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Supplier Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      suppliers: '/api/suppliers',
      catalog: '/api/catalog',
      rfqs: '/api/rfqs',
      bids: '/api/bids'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/bids', bidRoutes);

// Error Handling Middleware (Must be last)

// 1. 404 handler for undefined routes
app.use(notFound);

// 2. Error logger
app.use(errorLogger);

// 3. Global error handler
app.use(errorHandler);

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
});

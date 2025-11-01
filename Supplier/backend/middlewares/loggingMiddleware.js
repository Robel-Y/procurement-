// Request logging middleware

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  if (req.user) {
    console.log(`  User: ${req.user.email} (${req.user.role})`);
  }
  
  if (req.organizationId) {
    console.log(`  Organization: ${req.organizationId}`);
  }

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    console.log(`  Body:`, JSON.stringify(sanitizedBody, null, 2));
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    originalSend.call(this, data);
  };

  next();
};

const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    if (req.user) {
      logData.userId = req.user._id;
      logData.userEmail = req.user.email;
    }

    if (req.organizationId) {
      logData.organizationId = req.organizationId;
    }

    // Color code based on status
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                       res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                       res.statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                       '\x1b[32m'; // Green for 2xx
    const resetColor = '\x1b[0m';

    console.log(`${statusColor}[API]${resetColor}`, JSON.stringify(logData));
  });

  next();
};

const errorLogger = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`);
  console.error(`  Method: ${req.method}`);
  console.error(`  URL: ${req.originalUrl}`);
  console.error(`  Message: ${err.message}`);
  console.error(`  Stack: ${err.stack}`);
  
  if (req.user) {
    console.error(`  User: ${req.user.email} (${req.user._id})`);
  }

  next(err);
};

module.exports = {
  requestLogger,
  apiLogger,
  errorLogger
};

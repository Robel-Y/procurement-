// CORS middleware configuration

const corsMiddleware = (req, res, next) => {
  // Get origin from request
  const origin = req.headers.origin;
  
  // List of allowed origins (can be moved to environment variables)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
    process.env.ORGANIZATION_FRONTEND_URL
  ].filter(Boolean); // Remove undefined values

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow all origins
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  // Allowed methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  // Allowed headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Organization-Id'
  );
  
  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Set max age for preflight requests
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// Strict CORS for production
const strictCorsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ORGANIZATION_FRONTEND_URL
  ].filter(Boolean);

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      message: 'CORS policy: Origin not allowed'
    });
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Organization-Id'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// CORS for API-only access (no browser)
const apiOnlyCors = (req, res, next) => {
  // Only allow requests with API key
  if (!req.headers['x-api-key']) {
    return res.status(401).json({
      message: 'API key required'
    });
  }

  // No CORS headers needed for API-only access
  next();
};

module.exports = {
  corsMiddleware,
  strictCorsMiddleware,
  apiOnlyCors
};

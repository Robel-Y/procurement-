// Rate limiting middleware

// Simple in-memory rate limiter
const rateLimitStore = new Map();

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit data for this key
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || now - rateLimitData.resetTime > windowMs) {
      // Reset or create new rate limit data
      rateLimitData = {
        count: 0,
        resetTime: now
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Increment request count
    rateLimitData.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitData.count));
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime + windowMs).toISOString());

    // Check if limit exceeded
    if (rateLimitData.count > maxRequests) {
      return res.status(429).json({
        message,
        retryAfter: Math.ceil((rateLimitData.resetTime + windowMs - now) / 1000)
      });
    }

    // Handle skip options
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;
      res.send = function (data) {
        const shouldSkip = 
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400);
        
        if (shouldSkip) {
          rateLimitData.count--;
        }
        
        originalSend.call(this, data);
      };
    }

    next();
  };
};

// Specific rate limiters for different endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests, please try again later'
});

const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Rate limit exceeded, please slow down'
});

// User-based rate limiter (requires authentication)
const userRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = options;

  return rateLimit({
    windowMs,
    maxRequests,
    message,
    keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip
  });
};

// Clean up old entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 60 * 60 * 1000) { // Remove entries older than 1 hour
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

module.exports = {
  rateLimit,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  userRateLimit
};

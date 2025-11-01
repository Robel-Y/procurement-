// Simple in-memory cache middleware

const cache = new Map();

// Simple cache middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query parameters
    const key = `${req.originalUrl || req.url}`;
    
    // Check if cached response exists
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      const { data, timestamp } = cachedResponse;
      const age = (Date.now() - timestamp) / 1000;
      
      // Check if cache is still valid
      if (age < duration) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', Math.floor(age));
        return res.json(data);
      } else {
        // Cache expired, remove it
        cache.delete(key);
      }
    }

    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = (data) => {
      // Cache the response
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Cache with user-specific keys
const userCache = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (!req.user) {
      return next();
    }

    const key = `${req.user._id}:${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      const { data, timestamp } = cachedResponse;
      const age = (Date.now() - timestamp) / 1000;
      
      if (age < duration) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', Math.floor(age));
        return res.json(data);
      } else {
        cache.delete(key);
      }
    }

    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Clear cache for specific pattern
const clearCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Clear cache middleware (for POST, PUT, DELETE requests)
const clearCacheOnMutation = (patterns = []) => {
  return (req, res, next) => {
    // Only clear cache on mutation methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const originalJson = res.json.bind(res);
      
      res.json = (data) => {
        // Clear cache after successful response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (patterns.length === 0) {
            // Clear all cache
            cache.clear();
          } else {
            // Clear specific patterns
            patterns.forEach(pattern => clearCache(pattern));
          }
        }
        
        return originalJson(data);
      };
    }

    next();
  };
};

// Cache statistics
const getCacheStats = () => {
  const now = Date.now();
  let totalSize = 0;
  let expiredCount = 0;

  for (const [key, value] of cache.entries()) {
    totalSize++;
    const age = (now - value.timestamp) / 1000;
    if (age > 3600) { // Consider entries older than 1 hour as expired
      expiredCount++;
    }
  }

  return {
    totalEntries: totalSize,
    expiredEntries: expiredCount,
    activeEntries: totalSize - expiredCount
  };
};

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 3600 * 1000; // 1 hour

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > maxAge) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000); // Run every 10 minutes

// Conditional cache based on response
const conditionalCache = (duration = 300, condition = () => true) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      const { data, timestamp } = cachedResponse;
      const age = (Date.now() - timestamp) / 1000;
      
      if (age < duration) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', Math.floor(age));
        return res.json(data);
      } else {
        cache.delete(key);
      }
    }

    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Only cache if condition is met
      if (condition(data, req, res)) {
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
        res.setHeader('X-Cache', 'MISS');
      } else {
        res.setHeader('X-Cache', 'SKIP');
      }
      
      return originalJson(data);
    };

    next();
  };
};

module.exports = {
  cacheMiddleware,
  userCache,
  clearCache,
  clearCacheOnMutation,
  getCacheStats,
  conditionalCache
};

// Input sanitization middleware

const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove potentially dangerous keys
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove HTML tags
    value = value.replace(/<[^>]*>/g, '');
    
    // Remove script tags and content
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Trim whitespace
    value = value.trim();
  }

  return value;
};

// Prevent NoSQL injection
const preventNoSQLInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const [key, value] of Object.entries(obj)) {
      // Check for MongoDB operators
      if (key.startsWith('$') || key.includes('.')) {
        return true;
      }

      // Recursively check nested objects
      if (typeof value === 'object' && value !== null) {
        if (checkForInjection(value)) {
          return true;
        }
      }
    }

    return false;
  };

  // Check body, query, and params
  if (checkForInjection(req.body) || 
      checkForInjection(req.query) || 
      checkForInjection(req.params)) {
    return res.status(400).json({
      message: 'Invalid request',
      error: 'Potentially malicious input detected'
    });
  }

  next();
};

// Remove empty fields from request body
const removeEmptyFields = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = removeEmpty(req.body);
  }

  next();
};

const removeEmpty = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeEmpty(item)).filter(item => item !== null && item !== undefined);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object') {
        const cleanedValue = removeEmpty(value);
        if (Object.keys(cleanedValue).length > 0 || Array.isArray(cleanedValue)) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
};

module.exports = {
  sanitizeInput,
  preventNoSQLInjection,
  removeEmptyFields
};

const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  deleteRFQ
} = require('../controllers/rfqController');

const {
  systemAuth,
  validateRFQ,
  validateMongoId,
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware,
  clearCacheOnMutation,
  sanitizeInput,
  preventNoSQLInjection
} = require('../middlewares');

// Apply sanitization and NoSQL injection prevention to all routes
router.use(sanitizeInput);
router.use(preventNoSQLInjection);

// All RFQ routes protected - only accessible via API calls from organization system

// Create RFQ - System auth with validation
router.post('/',
  systemAuth,
  apiRateLimit,
  validateRFQ,
  clearCacheOnMutation(['/rfq']),
  createRFQ
);

// Get all RFQs - System auth with pagination and caching
router.get('/',
  systemAuth,
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware(180), // Cache for 3 minutes
  getRFQs
);

// Get RFQ by ID - System auth with validation and caching
router.get('/:id',
  systemAuth,
  validateMongoId('id'),
  cacheMiddleware(180),
  getRFQById
);

// Update RFQ - System auth with validation
router.put('/:id',
  systemAuth,
  validateMongoId('id'),
  validateRFQ,
  clearCacheOnMutation(['/rfq']),
  updateRFQ
);

// Delete RFQ - System auth only
router.delete('/:id',
  systemAuth,
  validateMongoId('id'),
  clearCacheOnMutation(['/rfq']),
  deleteRFQ
);

module.exports = router;

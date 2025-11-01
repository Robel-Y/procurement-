const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  approveSupplier,
  rejectSupplier,
  suspendSupplier,
  getSupplierStats,
  rateSupplier,
  syncSupplierToExternal,
  syncAllSuppliersToExternal,
  getSupplierForExternal
} = require('../controllers/supplierController');

const {
  protect,
  adminOnly,
  systemAuth,
  validateSupplier,
  validateMongoId,
  verifySupplierOwnership,
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware,
  clearCacheOnMutation,
  sanitizeInput,
  preventNoSQLInjection
} = require('../middlewares');

// Apply sanitization to all routes
router.use(sanitizeInput);

// Create supplier - Admin only with validation
router.post('/',
  protect,
  adminOnly,
  apiRateLimit,
  validateSupplier,
  clearCacheOnMutation(['/suppliers']),
  createSupplier
);

// Get all suppliers - Protected with pagination and caching
router.get('/',
  protect,
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware(300), // Cache for 5 minutes
  getSuppliers
);

// Get supplier by ID - Protected with validation and caching
router.get('/:id',
  protect,
  validateMongoId('id'),
  cacheMiddleware(300),
  getSupplierById
);

// Update supplier - Protected with ownership verification
router.put('/:id',
  protect,
  validateMongoId('id'),
  verifySupplierOwnership,
  validateSupplier,
  clearCacheOnMutation(['/suppliers']),
  updateSupplier
);

// Delete supplier - Admin only
router.delete('/:id',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/suppliers']),
  deleteSupplier
);

// Approve supplier - Admin only
router.put('/:id/approve',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/suppliers']),
  approveSupplier
);

// Reject supplier - Admin only
router.put('/:id/reject',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/suppliers']),
  rejectSupplier
);

// Suspend supplier - Admin only
router.put('/:id/suspend',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/suppliers']),
  suspendSupplier
);

// Get supplier statistics
router.get('/:id/stats',
  protect,
  validateMongoId('id'),
  cacheMiddleware(180),
  getSupplierStats
);

// Rate supplier
router.post('/:id/rate',
  protect,
  validateMongoId('id'),
  clearCacheOnMutation(['/suppliers']),
  rateSupplier
);

// Sync all active suppliers to external system - Admin only
router.post('/sync-all',
  protect,
  adminOnly,
  syncAllSuppliersToExternal
);

// Get supplier data for external system - System auth
router.get('/external/:id',
  systemAuth,
  validateMongoId('id'),
  getSupplierForExternal
);

// Sync single supplier to external system - Admin only
router.post('/:id/sync',
  protect,
  adminOnly,
  validateMongoId('id'),
  syncSupplierToExternal
);

module.exports = router;

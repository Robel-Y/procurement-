const express = require('express');
const router = express.Router();
const {
  createCatalogItem,
  getCatalogItems,
  getCatalogItemById,
  updateCatalogItem,
  deleteCatalogItem
} = require('../controllers/catalogController');

const {
  protect,
  validateCatalogItem,
  validateMongoId,
  verifyCatalogItemOwnership,
  verifySupplierInBody,
  requireActiveSupplier,
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware,
  clearCacheOnMutation,
  sanitizeInput,
  preventNoSQLInjection
} = require('../middlewares');

// Apply sanitization to all routes
router.use(sanitizeInput);
router.use(preventNoSQLInjection);

// Create catalog item - Protected with validation and supplier verification
router.post('/',
  protect,
  apiRateLimit,
  validateCatalogItem,
  verifySupplierInBody,
  requireActiveSupplier,
  clearCacheOnMutation(['/catalog']),
  createCatalogItem
);

// Get all catalog items - Public with pagination and caching
router.get('/',
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware(600), // Cache for 10 minutes (catalog changes less frequently)
  getCatalogItems
);

// Get catalog item by ID - Public with validation and caching
router.get('/:id',
  validateMongoId('id'),
  cacheMiddleware(600),
  getCatalogItemById
);

// Update catalog item - Protected with ownership verification
router.put('/:id',
  protect,
  validateMongoId('id'),
  verifyCatalogItemOwnership,
  validateCatalogItem,
  clearCacheOnMutation(['/catalog']),
  updateCatalogItem
);

// Delete catalog item - Protected with ownership verification
router.delete('/:id',
  protect,
  validateMongoId('id'),
  verifyCatalogItemOwnership,
  clearCacheOnMutation(['/catalog']),
  deleteCatalogItem
);

module.exports = router;

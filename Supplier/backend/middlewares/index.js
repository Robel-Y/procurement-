// Central export file for all middleware

const { protect, adminOnly } = require('./authMiddleware');
const { systemAuth } = require('./systemAuthMiddleware');
const {
  validateRegister,
  validateLogin,
  validateSupplier,
  validateRFQ,
  validateBid,
  validateCatalogItem,
  validateMongoId
} = require('./validationMiddleware');
const {
  requireRole,
  adminOnly: roleAdminOnly,
  userOnly,
  adminOrSelf
} = require('./roleMiddleware');
const {
  notFound,
  errorHandler,
  asyncHandler
} = require('./errorMiddleware');
const {
  requestLogger,
  apiLogger,
  errorLogger
} = require('./loggingMiddleware');
const {
  rateLimit,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  userRateLimit
} = require('./rateLimitMiddleware');
const {
  verifySupplierOwnership,
  verifyBidOwnership,
  verifyCatalogItemOwnership,
  verifySupplierInBody,
  requireActiveSupplier
} = require('./ownershipMiddleware');
const {
  sanitizeInput,
  preventNoSQLInjection,
  removeEmptyFields
} = require('./sanitizationMiddleware');
const {
  corsMiddleware,
  strictCorsMiddleware,
  apiOnlyCors
} = require('./corsMiddleware');
const {
  paginate,
  addPaginationHelper,
  advancedPaginate,
  cursorPaginate,
  createPaginationResponse
} = require('./paginationMiddleware');
const {
  cacheMiddleware,
  userCache,
  clearCache,
  clearCacheOnMutation,
  getCacheStats,
  conditionalCache
} = require('./cacheMiddleware');

module.exports = {
  // Authentication
  protect,
  adminOnly,
  systemAuth,
  
  // Validation
  validateRegister,
  validateLogin,
  validateSupplier,
  validateRFQ,
  validateBid,
  validateCatalogItem,
  validateMongoId,
  
  // Role-based access
  requireRole,
  roleAdminOnly,
  userOnly,
  adminOrSelf,
  
  // Error handling
  notFound,
  errorHandler,
  asyncHandler,
  
  // Logging
  requestLogger,
  apiLogger,
  errorLogger,
  
  // Rate limiting
  rateLimit,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  userRateLimit,
  
  // Ownership verification
  verifySupplierOwnership,
  verifyBidOwnership,
  verifyCatalogItemOwnership,
  verifySupplierInBody,
  requireActiveSupplier,
  
  // Sanitization
  sanitizeInput,
  preventNoSQLInjection,
  removeEmptyFields,
  
  // CORS
  corsMiddleware,
  strictCorsMiddleware,
  apiOnlyCors,
  
  // Pagination
  paginate,
  addPaginationHelper,
  advancedPaginate,
  cursorPaginate,
  createPaginationResponse,
  
  // Caching
  cacheMiddleware,
  userCache,
  clearCache,
  clearCacheOnMutation,
  getCacheStats,
  conditionalCache
};

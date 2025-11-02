const express = require('express');
const router = express.Router();
const {
  createBid,
  getBids,
  getBidsByRFQ,
  getBidById,
  updateBid,
  deleteBid,
  getMyBids,
  evaluateBid,
  shortlistBid,
  acceptBid,
  rejectBid
} = require('../controllers/bidController');

const {
  protect,
  adminOnly,
  systemAuth,
  validateBid,
  validateMongoId,
  verifyBidOwnership,
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

// Create bid - Protected with validation and active supplier check
router.post('/',
  protect,
  apiRateLimit,
  validateBid,
  requireActiveSupplier,
  clearCacheOnMutation(['/bids', '/rfq']),
  createBid
);

// Get all bids - System auth with pagination
router.get('/',
  systemAuth,
  apiRateLimit,
  advancedPaginate,
  cacheMiddleware(120), // Cache for 2 minutes
  getBids
);

// Get my bids - Supplier's own bids
router.get('/my-bids',
  protect,
  advancedPaginate,
  getMyBids
);

// Get bids by RFQ - Anonymous (no supplier info disclosed)
router.get('/rfq/:rfqId',
  protect,
  validateMongoId('rfqId'),
  getBidsByRFQ
);

// Get single bid - With conditional supplier anonymization
router.get('/:id',
  protect,
  validateMongoId('id'),
  cacheMiddleware(120),
  getBidById
);

// Update bid - Protected with ownership verification and deadline check
router.put('/:id',
  protect,
  validateMongoId('id'),
  verifyBidOwnership,
  validateBid,
  clearCacheOnMutation(['/bids', '/rfq']),
  updateBid
);

// Delete/Withdraw bid - Protected with ownership verification and deadline check
router.delete('/:id',
  protect,
  validateMongoId('id'),
  verifyBidOwnership,
  clearCacheOnMutation(['/bids', '/rfq']),
  deleteBid
);

// Evaluate bid - Admin only
router.put('/:id/evaluate',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/bids']),
  evaluateBid
);

// Shortlist bid - Admin only
router.put('/:id/shortlist',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/bids']),
  shortlistBid
);

// Accept bid - Admin only
router.put('/:id/accept',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/bids', '/rfq']),
  acceptBid
);

// Reject bid - Admin only
router.put('/:id/reject',
  protect,
  adminOnly,
  validateMongoId('id'),
  clearCacheOnMutation(['/bids']),
  rejectBid
);

module.exports = router;

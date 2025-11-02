const Bid = require('../models/Bid');
const RFQ = require('../models/RFQ');
const { asyncHandler } = require('../middlewares');

// @desc    Create a bid
// @route   POST /api/bids
// @access  Private
exports.createBid = asyncHandler(async (req, res) => {
  const { rfqId, supplierId, items, pricing, deliveryTerms, paymentTerms, warranty } = req.body;

  // Check if RFQ exists
  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    return res.status(404).json({
      success: false,
      message: 'RFQ not found'
    });
  }

  // Check if RFQ deadline has passed
  if (new Date() > new Date(rfq.deadline)) {
    return res.status(400).json({
      success: false,
      message: 'RFQ deadline has passed. Bids are no longer accepted.',
      deadline: rfq.deadline
    });
  }

  // Check if RFQ is still open
  if (rfq.status !== 'open') {
    return res.status(400).json({
      success: false,
      message: `RFQ is ${rfq.status}. Bids can only be submitted for open RFQs.`,
      status: rfq.status
    });
  }

  // Check if supplier already has an active bid for this RFQ
  const existingBid = await Bid.findOne({
    rfqId,
    supplierId,
    status: { $in: ['submitted', 'under_review', 'shortlisted'] }
  });

  if (existingBid) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active bid for this RFQ. Please update your existing bid instead.',
      existingBidId: existingBid._id
    });
  }

  // Create bid
  const bid = await Bid.create({
    rfqId,
    supplierId,
    items,
    pricing,
    deliveryTerms,
    paymentTerms,
    warranty,
    status: 'submitted',
    submittedAt: new Date(),
    submittedBy: {
      name: req.user.name,
      email: req.user.email
    }
  });

  // Increment RFQ bid count
  await rfq.incrementBidCount();

  res.status(201).json({
    success: true,
    message: 'Bid submitted successfully',
    data: bid
  });
});

// @desc    Get all bids (system access only - shows supplier info)
// @route   GET /api/bids
// @access  Private/System
exports.getBids = asyncHandler(async (req, res) => {
  const { skip, limit, sort, search } = req.pagination;

  let query = {};

  // Filter by RFQ
  if (req.query.rfqId) {
    query.rfqId = req.query.rfqId;
  }

  // Filter by supplier
  if (req.query.supplierId) {
    query.supplierId = req.query.supplierId;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Execute query with supplier information (system access)
  const bids = await Bid.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('rfqId', 'rfqNumber title deadline status')
    .populate('supplierId', 'companyName email phone rating');

  const total = await Bid.countDocuments(query);

  res.json({
    success: true,
    count: bids.length,
    ...res.paginate(bids, total)
  });
});

// @desc    Get bids by RFQ ID (anonymous - no supplier info)
// @route   GET /api/bids/rfq/:rfqId
// @access  Private
exports.getBidsByRFQ = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Check if RFQ exists
  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    return res.status(404).json({
      success: false,
      message: 'RFQ not found'
    });
  }

  // Get bids without supplier information
  const bids = await Bid.find({ rfqId })
    .select('-supplierId -submittedBy -internalNotes')
    .populate('rfqId', 'rfqNumber title deadline status');

  // Transform bids to anonymize them
  const anonymizedBids = bids.map((bid, index) => ({
    _id: bid._id,
    bidNumber: bid.bidNumber,
    rfqId: bid.rfqId,
    items: bid.items,
    pricing: bid.pricing,
    deliveryTerms: bid.deliveryTerms,
    paymentTerms: bid.paymentTerms,
    warranty: bid.warranty,
    technicalCompliance: bid.technicalCompliance,
    status: bid.status,
    submittedAt: bid.submittedAt,
    evaluationScore: bid.evaluationScore,
    rank: bid.rank,
    isWinner: bid.isWinner,
    // Add anonymous identifier
    supplierReference: `Supplier ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt
  }));

  res.json({
    success: true,
    count: anonymizedBids.length,
    data: anonymizedBids,
    note: 'Supplier information is anonymized for confidentiality'
  });
});

// @desc    Get single bid by ID
// @route   GET /api/bids/:id
// @access  Private
exports.getBidById = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id)
    .populate('rfqId', 'rfqNumber title deadline status');

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  // Check if user is the bid owner or admin/system
  const isOwner = req.user && bid.supplierId.toString() === req.user.supplierId?.toString();
  const isAdmin = req.user && req.user.role === 'admin';
  const isSystem = req.headers['x-api-key']; // System access

  let bidData = bid.toObject();

  // If not owner, admin, or system - anonymize supplier info
  if (!isOwner && !isAdmin && !isSystem) {
    delete bidData.supplierId;
    delete bidData.submittedBy;
    delete bidData.internalNotes;
    bidData.supplierReference = 'Anonymous Supplier';
  } else if (isOwner || isAdmin || isSystem) {
    // Populate supplier info for authorized users
    await bid.populate('supplierId', 'companyName email phone rating');
    bidData = bid.toObject();
  }

  res.json({
    success: true,
    data: bidData
  });
});

// @desc    Update bid
// @route   PUT /api/bids/:id
// @access  Private
exports.updateBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id).populate('rfqId');

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  // Check if RFQ deadline has passed
  if (new Date() > new Date(bid.rfqId.deadline)) {
    return res.status(400).json({
      success: false,
      message: 'RFQ deadline has passed. Bid cannot be updated.',
      deadline: bid.rfqId.deadline
    });
  }

  // Check if RFQ is still open
  if (bid.rfqId.status !== 'open') {
    return res.status(400).json({
      success: false,
      message: `RFQ is ${bid.rfqId.status}. Bids can only be updated for open RFQs.`,
      status: bid.rfqId.status
    });
  }

  // Check if bid can be updated (only draft or submitted bids)
  if (!['draft', 'submitted'].includes(bid.status)) {
    return res.status(400).json({
      success: false,
      message: `Bid is ${bid.status}. Only draft or submitted bids can be updated.`,
      status: bid.status
    });
  }

  // Update allowed fields
  const allowedUpdates = [
    'items',
    'pricing',
    'deliveryTerms',
    'paymentTerms',
    'warranty',
    'technicalCompliance',
    'attachments',
    'notes'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Update bid
  const updatedBid = await Bid.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Bid updated successfully',
    data: updatedBid
  });
});

// @desc    Delete/Withdraw bid
// @route   DELETE /api/bids/:id
// @access  Private
exports.deleteBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id).populate('rfqId');

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  // Check if RFQ deadline has passed
  if (new Date() > new Date(bid.rfqId.deadline)) {
    return res.status(400).json({
      success: false,
      message: 'RFQ deadline has passed. Bid cannot be withdrawn.',
      deadline: bid.rfqId.deadline
    });
  }

  // Check if bid can be withdrawn
  if (['accepted', 'rejected'].includes(bid.status)) {
    return res.status(400).json({
      success: false,
      message: `Bid is ${bid.status}. Cannot withdraw ${bid.status} bids.`,
      status: bid.status
    });
  }

  // Withdraw bid instead of deleting
  bid.status = 'withdrawn';
  await bid.save();

  res.json({
    success: true,
    message: 'Bid withdrawn successfully',
    data: bid
  });
});

// @desc    Get my bids (supplier's own bids)
// @route   GET /api/bids/my-bids
// @access  Private
exports.getMyBids = asyncHandler(async (req, res) => {
  if (!req.user.supplierId) {
    return res.status(400).json({
      success: false,
      message: 'User is not associated with a supplier'
    });
  }

  const { skip, limit, sort } = req.pagination;

  let query = { supplierId: req.user.supplierId };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  const bids = await Bid.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('rfqId', 'rfqNumber title deadline status category');

  const total = await Bid.countDocuments(query);

  res.json({
    success: true,
    count: bids.length,
    ...res.paginate(bids, total)
  });
});

// @desc    Evaluate bid (admin/system only)
// @route   PUT /api/bids/:id/evaluate
// @access  Private/Admin
exports.evaluateBid = asyncHandler(async (req, res) => {
  const { technical, commercial, delivery, evaluationNotes } = req.body;

  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  // Calculate overall score (weighted average)
  const overall = ((technical || 0) * 0.4 + (commercial || 0) * 0.3 + (delivery || 0) * 0.3);

  bid.evaluationScore = {
    technical,
    commercial,
    delivery,
    overall
  };
  bid.evaluationNotes = evaluationNotes;
  bid.status = 'under_review';
  bid.reviewedAt = new Date();
  bid.reviewedBy = req.user._id;

  await bid.save();

  res.json({
    success: true,
    message: 'Bid evaluated successfully',
    data: bid
  });
});

// @desc    Shortlist bid (admin/system only)
// @route   PUT /api/bids/:id/shortlist
// @access  Private/Admin
exports.shortlistBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  await bid.shortlist();

  res.json({
    success: true,
    message: 'Bid shortlisted successfully',
    data: bid
  });
});

// @desc    Accept bid (admin/system only)
// @route   PUT /api/bids/:id/accept
// @access  Private/Admin
exports.acceptBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id).populate('rfqId');

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  await bid.accept(req.user._id);

  // Award the RFQ to this bid
  await bid.rfqId.awardBid(bid._id, req.user._id);

  res.json({
    success: true,
    message: 'Bid accepted and RFQ awarded successfully',
    data: bid
  });
});

// @desc    Reject bid (admin/system only)
// @route   PUT /api/bids/:id/reject
// @access  Private/Admin
exports.rejectBid = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found'
    });
  }

  await bid.reject(reason, req.user._id);

  res.json({
    success: true,
    message: 'Bid rejected',
    data: bid
  });
});

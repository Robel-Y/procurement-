const Supplier = require('../models/Supplier');
const { asyncHandler } = require('../middlewares');
const axios = require('axios');

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private/Admin
exports.createSupplier = asyncHandler(async (req, res) => {
  const {
    companyName,
    email,
    phone,
    address,
    contactPerson,
    businessDetails,
    categories,
    bankDetails
  } = req.body;

  // Check if supplier already exists
  const existing = await Supplier.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Supplier with this email already exists'
    });
  }

  // Create supplier
  const supplier = await Supplier.create({
    companyName,
    email,
    phone,
    address,
    contactPerson,
    businessDetails,
    categories,
    bankDetails,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: supplier
  });
});

// @desc    Get all suppliers with filtering, sorting, and pagination
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = asyncHandler(async (req, res) => {
  const { skip, limit, sort, search } = req.pagination;

  // Build query
  let query = {};

  // Search functionality
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { categories: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by categories
  if (req.query.category) {
    query.categories = req.query.category;
  }

  // Filter by rating
  if (req.query.minRating) {
    query['rating.average'] = { $gte: parseFloat(req.query.minRating) };
  }

  // Execute query
  const suppliers = await Supplier.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-bankDetails -documents'); // Exclude sensitive data

  const total = await Supplier.countDocuments(query);

  res.json({
    success: true,
    count: suppliers.length,
    ...res.paginate(suppliers, total)
  });
});

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate('approvedBy', 'name email');

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Exclude bank details unless admin
  let supplierData = supplier.toObject();
  if (req.user && req.user.role !== 'admin') {
    delete supplierData.bankDetails;
    delete supplierData.internalNotes;
  }

  res.json({
    success: true,
    data: supplierData
  });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
exports.updateSupplier = asyncHandler(async (req, res) => {
  let supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Update fields
  const allowedUpdates = [
    'companyName',
    'phone',
    'address',
    'contactPerson',
    'businessDetails',
    'categories',
    'certifications',
    'notes'
  ];

  // Admin can update more fields
  if (req.user && req.user.role === 'admin') {
    allowedUpdates.push('status', 'bankDetails', 'approvedBy', 'approvedAt', 'rejectedReason');
  }

  // Filter request body to only allowed updates
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  // Update activity timestamp
  await supplier.updateActivity();

  res.json({
    success: true,
    message: 'Supplier updated successfully',
    data: supplier
  });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
exports.deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  await supplier.deleteOne();

  res.json({
    success: true,
    message: 'Supplier removed successfully'
  });
});

// @desc    Approve supplier
// @route   PUT /api/suppliers/:id/approve
// @access  Private/Admin
exports.approveSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  supplier.status = 'active';
  supplier.approvedBy = req.user._id;
  supplier.approvedAt = Date.now();
  await supplier.save();

  res.json({
    success: true,
    message: 'Supplier approved successfully',
    data: supplier
  });
});

// @desc    Reject supplier
// @route   PUT /api/suppliers/:id/reject
// @access  Private/Admin
exports.rejectSupplier = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  supplier.status = 'rejected';
  supplier.rejectedReason = reason;
  await supplier.save();

  res.json({
    success: true,
    message: 'Supplier rejected',
    data: supplier
  });
});

// @desc    Suspend supplier
// @route   PUT /api/suppliers/:id/suspend
// @access  Private/Admin
exports.suspendSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  supplier.status = 'suspended';
  await supplier.save();

  res.json({
    success: true,
    message: 'Supplier suspended',
    data: supplier
  });
});

// @desc    Get supplier statistics
// @route   GET /api/suppliers/:id/stats
// @access  Private
exports.getSupplierStats = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  res.json({
    success: true,
    data: {
      performanceMetrics: supplier.performanceMetrics,
      rating: supplier.rating,
      winRate: supplier.winRate,
      status: supplier.status,
      lastActivityAt: supplier.lastActivityAt
    }
  });
});

// @desc    Rate supplier
// @route   POST /api/suppliers/:id/rate
// @access  Private
exports.rateSupplier = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  await supplier.updateRating(rating);

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      averageRating: supplier.rating.average,
      totalRatings: supplier.rating.count
    }
  });
});

// @desc    Sync supplier to external system
// @route   POST /api/suppliers/:id/sync
// @access  Private/Admin
exports.syncSupplierToExternal = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Only sync active suppliers
  if (supplier.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Only active suppliers can be synced to external system',
      currentStatus: supplier.status
    });
  }

  // Prepare supplier data for external system
  const supplierData = {
    supplierId: supplier._id,
    companyName: supplier.companyName,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.fullAddress,
    contactPerson: supplier.contactPerson,
    businessDetails: supplier.businessDetails,
    categories: supplier.categories,
    certifications: supplier.certifications,
    rating: supplier.rating,
    performanceMetrics: supplier.performanceMetrics,
    status: supplier.status,
    approvedAt: supplier.approvedAt,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt
  };

  try {
    // Send to external organization system
    const externalSystemUrl = process.env.ORGANIZATION_SYSTEM_URL || 'http://localhost:3001/api/suppliers/sync';
    
    const response = await axios.post(externalSystemUrl, supplierData, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ORGANIZATION_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });

    res.json({
      success: true,
      message: 'Supplier synced to external system successfully',
      data: {
        supplier: supplier._id,
        externalResponse: response.data,
        syncedAt: new Date()
      }
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('External sync error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to sync supplier to external system',
      error: error.response?.data?.message || error.message,
      supplier: supplier._id
    });
  }
});

// @desc    Sync all active suppliers to external system
// @route   POST /api/suppliers/sync-all
// @access  Private/Admin
exports.syncAllSuppliersToExternal = asyncHandler(async (req, res) => {
  // Get all active suppliers
  const suppliers = await Supplier.find({ status: 'active' });

  if (suppliers.length === 0) {
    return res.json({
      success: true,
      message: 'No active suppliers to sync',
      count: 0
    });
  }

  const results = {
    total: suppliers.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  const externalSystemUrl = process.env.ORGANIZATION_SYSTEM_URL || 'http://localhost:3001/api/suppliers/sync';

  // Sync each supplier
  for (const supplier of suppliers) {
    const supplierData = {
      supplierId: supplier._id,
      companyName: supplier.companyName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.fullAddress,
      contactPerson: supplier.contactPerson,
      businessDetails: supplier.businessDetails,
      categories: supplier.categories,
      certifications: supplier.certifications,
      rating: supplier.rating,
      performanceMetrics: supplier.performanceMetrics,
      status: supplier.status,
      approvedAt: supplier.approvedAt,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    };

    try {
      await axios.post(externalSystemUrl, supplierData, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ORGANIZATION_API_KEY
        },
        timeout: 10000
      });
      
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        supplierId: supplier._id,
        companyName: supplier.companyName,
        error: error.response?.data?.message || error.message
      });
    }
  }

  res.json({
    success: results.failed === 0,
    message: `Synced ${results.successful} of ${results.total} suppliers`,
    data: results,
    syncedAt: new Date()
  });
});

// @desc    Get supplier data for external system (webhook endpoint)
// @route   GET /api/suppliers/external/:id
// @access  System (API Key)
exports.getSupplierForExternal = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Return supplier data in external system format
  const supplierData = {
    supplierId: supplier._id,
    companyName: supplier.companyName,
    email: supplier.email,
    phone: supplier.phone,
    address: {
      street: supplier.address?.street,
      city: supplier.address?.city,
      state: supplier.address?.state,
      country: supplier.address?.country,
      zipCode: supplier.address?.zipCode,
      fullAddress: supplier.fullAddress
    },
    contactPerson: supplier.contactPerson,
    businessDetails: supplier.businessDetails,
    categories: supplier.categories,
    certifications: supplier.certifications,
    rating: {
      average: supplier.rating.average,
      count: supplier.rating.count
    },
    performanceMetrics: supplier.performanceMetrics,
    status: supplier.status,
    approvedAt: supplier.approvedAt,
    approvedBy: supplier.approvedBy,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
    lastActivityAt: supplier.lastActivityAt
  };

  res.json({
    success: true,
    data: supplierData
  });
});

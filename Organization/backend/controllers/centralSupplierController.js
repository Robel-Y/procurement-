const CentralSupplier = require("../models/CentralSupplier");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private/Admin
exports.createSupplier = asyncHandler(async (req, res, next) => {
  const supplier = await CentralSupplier.create(req.body);

  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    data: supplier,
  });
});

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
exports.getSuppliers = asyncHandler(async (req, res, next) => {
  const { category, verified, search } = req.query;

  let filter = {};

  if (category) filter.categories = category;
  if (verified) filter.isVerified = verified === "true";
  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const suppliers = await CentralSupplier.find(filter).sort({ rating: -1 });

  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers,
  });
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Public
exports.getSupplier = asyncHandler(async (req, res, next) => {
  const supplier = await CentralSupplier.findById(req.params.id);

  if (!supplier) {
    return next(new ErrorResponse("Supplier not found", 404));
  }

  res.json({
    success: true,
    data: supplier,
  });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
exports.updateSupplier = asyncHandler(async (req, res, next) => {
  const supplier = await CentralSupplier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!supplier) {
    return next(new ErrorResponse("Supplier not found", 404));
  }

  res.json({
    success: true,
    message: "Supplier updated successfully",
    data: supplier,
  });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
exports.deleteSupplier = asyncHandler(async (req, res, next) => {
  const supplier = await CentralSupplier.findByIdAndDelete(req.params.id);

  if (!supplier) {
    return next(new ErrorResponse("Supplier not found", 404));
  }

  res.json({
    success: true,
    message: "Supplier deleted successfully",
  });
});

// @desc    Get suppliers by category
// @route   GET /api/suppliers/category/:category
// @access  Public
exports.getSuppliersByCategory = asyncHandler(async (req, res, next) => {
  const suppliers = await CentralSupplier.find({
    categories: req.params.category,
  }).sort({ rating: -1 });

  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers,
  });
});

// @desc    AI Supplier Matching
// @route   POST /api/suppliers/match
// @access  Private
exports.matchSuppliers = asyncHandler(async (req, res, next) => {
  const { category, budget, urgency } = req.body;

  if (!category) {
    return next(new ErrorResponse("Category is required", 400));
  }

  // Get suppliers in category
  const suppliers = await CentralSupplier.find({ categories: category });

  // Simple AI matching algorithm
  const scoredSuppliers = suppliers.map((supplier) => {
    let score = 0;

    // Base rating (40%)
    score += supplier.rating * 8;

    // Delivery score (30%)
    score += supplier.deliveryScore * 3;

    // Price score (20%)
    score += supplier.priceScore * 2;

    // Urgency bonus (10%)
    if (urgency === "high" && supplier.deliveryScore >= 8) {
      score += 10;
    }

    return {
      ...supplier._doc,
      matchScore: Math.min(100, score), // Cap at 100
      reason: getMatchReason(supplier, urgency),
    };
  });

  // Sort by score and return top 3
  const topSuppliers = scoredSuppliers
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  res.json({
    success: true,
    count: topSuppliers.length,
    data: topSuppliers,
  });
});

// Helper function for match reasons
function getMatchReason(supplier, urgency) {
  const reasons = [];

  if (supplier.rating >= 4) reasons.push("High rating");
  if (supplier.deliveryScore >= 8) reasons.push("Fast delivery");
  if (urgency === "high" && supplier.deliveryScore >= 8)
    reasons.push("Good for urgent orders");
  if (supplier.priceScore >= 7) reasons.push("Competitive pricing");

  return reasons.join(", ");
}

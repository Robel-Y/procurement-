const PurchaseOrder = require("../models/PurchaseOrder");
const PurchaseRequest = require("../models/PurchaseRequest");
const CentralSupplier = require("../models/CentralSupplier");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc    Create purchase order from approved request
// @route   POST /api/purchase-orders
// @access  Private/Admin
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { purchaseRequestId, supplierId, items, deliveryDate } = req.body;

  // Check if purchase request exists and is approved
  const purchaseRequest = await PurchaseRequest.findById(purchaseRequestId);
  if (!purchaseRequest) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  if (purchaseRequest.status !== "approved") {
    return next(
      new ErrorResponse(
        "Only approved requests can be converted to orders",
        400
      )
    );
  }

  // Check if supplier exists
  const supplier = await CentralSupplier.findById(supplierId);
  if (!supplier) {
    return next(new ErrorResponse("Supplier not found", 404));
  }

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const purchaseOrder = await PurchaseOrder.create({
    purchaseRequest: purchaseRequestId,
    supplier: supplierId,
    items,
    totalAmount,
    deliveryDate,
    createdBy: req.user.id,
  });

  // Update purchase request status
  purchaseRequest.status = "ordered";
  await purchaseRequest.save();

  await purchaseOrder.populate("purchaseRequest", "title description");
  await purchaseOrder.populate("supplier", "companyName email phone");
  await purchaseOrder.populate("createdBy", "name email");

  res.status(201).json({
    success: true,
    message: "Purchase order created successfully",
    data: purchaseOrder,
  });
});

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  let filter = {};

  if (status) filter.status = status;

  const orders = await PurchaseOrder.find(filter)
    .populate("purchaseRequest", "title description requestedBy department")
    .populate("supplier", "companyName email phone")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate("purchaseRequest")
    .populate("supplier")
    .populate("createdBy", "name email");

  if (!order) {
    return next(new ErrorResponse("Purchase order not found", 404));
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Update purchase order status
// @route   PUT /api/purchase-orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = [
    "created",
    "sent",
    "confirmed",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse("Invalid status", 400));
  }

  const order = await PurchaseOrder.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("purchaseRequest")
    .populate("supplier")
    .populate("createdBy", "name email");

  if (!order) {
    return next(new ErrorResponse("Purchase order not found", 404));
  }

  res.json({
    success: true,
    message: "Purchase order status updated successfully",
    data: order,
  });
});

// @desc    Get purchase orders by supplier
// @route   GET /api/purchase-orders/supplier/:supplierId
// @access  Private/Admin
exports.getOrdersBySupplier = asyncHandler(async (req, res, next) => {
  const orders = await PurchaseOrder.find({ supplier: req.params.supplierId })
    .populate("purchaseRequest", "title description")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

const PurchaseRequest = require("../models/PurchaseRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// Fixed approver ID and info
const FIXED_APPROVER_ID = "690607665705c888367296d1"; // your fixed approver
const FIXED_APPROVER_NAME = "Fixed Approver";
const FIXED_APPROVER_EMAIL = "a@gmail.com";

// @desc    Create purchase request
// @route   POST /api/purchase-requests
// @access  Private/Requester
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { title, description, category, quantity, budget, urgency } = req.body;

  // Get requester info
  const requester = await User.findById(req.user.id);

  const purchaseRequest = await PurchaseRequest.create({
    title,
    description,
    category,
    quantity,
    budget,
    urgency,
    requestedBy: req.user.id,
    department: requester.department,
    status: "draft",
  });

  // Populate requester details
  await purchaseRequest.populate("requestedBy", "name email department");

  res.status(201).json({
    success: true,
    message: "Purchase request created successfully",
    data: purchaseRequest,
  });
});

// @desc    Submit purchase request for approval
// @route   PUT /api/purchase-requests/:id/submit
// @access  Private/Requester
exports.submitRequest = asyncHandler(async (req, res, next) => {
  const purchaseRequest = await PurchaseRequest.findById(req.params.id);

  if (!purchaseRequest) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  if (purchaseRequest.requestedBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to update this request", 403)
    );
  }

  // Assign the fixed approver
  purchaseRequest.status = "submitted";
  purchaseRequest.currentApprover = FIXED_APPROVER_ID;
  await purchaseRequest.save();

  // Populate fixed approver and requester info for response
  await purchaseRequest.populate([
    { path: "currentApprover", select: "name email" },
    { path: "requestedBy", select: "name email department" },
  ]);

  res.json({
    success: true,
    message: "Purchase request submitted for approval",
    data: purchaseRequest,
  });
});

// @desc    Get all purchase requests
// @route   GET /api/purchase-requests
// @access  Private
exports.getRequests = asyncHandler(async (req, res, next) => {
  const { status, department } = req.query;
  let filter = {};

  // Filter based on user role
  if (req.user.role === "requester") {
    filter.requestedBy = req.user.id;
  } else if (req.user.role === "approver") {
    filter.department = req.user.department;
    filter.status = "submitted";
  }
  // Admin sees all

  if (status) filter.status = status;
  if (department) filter.department = department;

  const requests = await PurchaseRequest.find(filter)
    .populate("requestedBy", "name email department")
    .populate("currentApprover", "name email")
    .populate("suggestedSuppliers.supplier", "companyName rating")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Get single purchase request
// @route   GET /api/purchase-requests/:id
// @access  Private
exports.getRequest = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequest.findById(req.params.id)
    .populate("requestedBy", "name email department")
    .populate("currentApprover", "name email")
    .populate(
      "suggestedSuppliers.supplier",
      "companyName email phone rating deliveryScore"
    );

  if (!request) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  // Authorization check
  if (
    req.user.role === "requester" &&
    request.requestedBy._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse("Not authorized to access this request", 403)
    );
  }

  if (
    req.user.role === "approver" &&
    request.department !== req.user.department
  ) {
    return next(
      new ErrorResponse("Not authorized to access this request", 403)
    );
  }

  res.json({
    success: true,
    data: request,
  });
});

// @desc    Approve/Reject purchase request
// @route   PUT /api/purchase-requests/:id/approve
// @access  Private/Approver
exports.approveRequest = asyncHandler(async (req, res, next) => {
  const { status, comments } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return next(
      new ErrorResponse("Status must be either approved or rejected", 400)
    );
  }

  const purchaseRequest = await PurchaseRequest.findById(req.params.id);

  if (!purchaseRequest) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  // Check if current approver matches the fixed approver ID
  let currentApproverId;

  if (purchaseRequest.currentApprover && purchaseRequest.currentApprover._id) {
    currentApproverId = purchaseRequest.currentApprover._id.toString();
  } else {
    currentApproverId = purchaseRequest.currentApprover
      ? purchaseRequest.currentApprover.toString()
      : null;
  }

  // Debug logs
  console.log("Current Approver ID from DB:", currentApproverId);
  console.log("Fixed Approver ID:", FIXED_APPROVER_ID);
  console.log("Logged in User ID:", req.user.id);

  // Check authorization - user must be the fixed approver
  if (req.user.id !== FIXED_APPROVER_ID) {
    return next(
      new ErrorResponse("Not authorized to approve this request", 403)
    );
  }

  // Also verify the request is assigned to this approver
  if (currentApproverId !== FIXED_APPROVER_ID) {
    return next(
      new ErrorResponse("This request is not assigned to you for approval", 403)
    );
  }

  // Check budget against approval limit if applicable
  if (status === "approved" && req.user.approvalLimit) {
    if (purchaseRequest.budget > req.user.approvalLimit) {
      return next(
        new ErrorResponse(
          `Approval limit exceeded. Your limit: ${req.user.approvalLimit}`,
          400
        )
      );
    }
  }

  purchaseRequest.status = status;
  purchaseRequest.approvalHistory.push({
    approver: req.user.id,
    status,
    comments,
    date: new Date(),
  });

  // Clear currentApprover after decision
  purchaseRequest.currentApprover = null;

  await purchaseRequest.save();

  // Populate the response
  await purchaseRequest.populate("requestedBy", "name email department");

  res.json({
    success: true,
    message: `Purchase request ${status} successfully`,
    data: purchaseRequest,
  });
});

// @desc    Update purchase request
// @route   PUT /api/purchase-requests/:id
// @access  Private/Requester
exports.updateRequest = asyncHandler(async (req, res, next) => {
  const { title, description, category, quantity, budget, urgency } = req.body;

  let purchaseRequest = await PurchaseRequest.findById(req.params.id);

  if (!purchaseRequest) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  // Check ownership and status
  if (purchaseRequest.requestedBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to update this request", 403)
    );
  }

  if (purchaseRequest.status !== "draft") {
    return next(new ErrorResponse("Cannot update submitted request", 400));
  }

  purchaseRequest = await PurchaseRequest.findByIdAndUpdate(
    req.params.id,
    { title, description, category, quantity, budget, urgency },
    { new: true, runValidators: true }
  ).populate("requestedBy", "name email department");

  res.json({
    success: true,
    message: "Purchase request updated successfully",
    data: purchaseRequest,
  });
});

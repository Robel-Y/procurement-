const PurchaseRequest = require("../models/PurchaseRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");


// Fixed approver ID and info
const FIXED_APPROVER_ID = "6907b2ae9e9e4995b25918c8"; // keb@gmail.com
const FIXED_APPROVER_NAME = "Kebede";
const FIXED_APPROVER_EMAIL = "keb@gmail.com";

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

// Fixed approver ID and info (updated for keb@gmail.com)

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

// @desc    Get all approved purchase requests (Public - for supplier system)
// @route   GET /api/public/purchase-requests/approved
// @access  Public
exports.getPublicApprovedRequests = asyncHandler(async (req, res, next) => {
  const { category, minBudget, maxBudget, page = 1, limit = 10 } = req.query;

  let filter = {
    status: "approved",
    // Only show requests that are ready for supplier bidding
    $or: [{ biddingStatus: { $exists: false } }, { biddingStatus: "open" }],
  };

  // Add filters if provided
  if (category) filter.category = category;
  if (minBudget || maxBudget) {
    filter.budget = {};
    if (minBudget) filter.budget.$gte = parseFloat(minBudget);
    if (maxBudget) filter.budget.$lte = parseFloat(maxBudget);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const requests = await PurchaseRequest.find(filter)
    .populate("requestedBy", "name department")
    .select(
      "-internalNotes -approvalHistory -suggestedSuppliers -currentApprover"
    ) // Exclude all sensitive data
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await PurchaseRequest.countDocuments(filter);

  res.json({
    success: true,
    count: requests.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: requests,
  });
});

// @desc    Get single approved purchase request details (Public)
// @route   GET /api/public/purchase-requests/:id
// @access  Public
exports.getPublicRequestById = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequest.findById(req.params.id)
    .populate("requestedBy", "name department")
    .select(
      "-internalNotes -approvalHistory -suggestedSuppliers -currentApprover"
    ); // Exclude sensitive data

  if (!request) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  // Only return if request is approved
  if (request.status !== "approved") {
    return next(new ErrorResponse("Purchase request not available", 404));
  }

  res.json({
    success: true,
    data: request,
  });
});

// @desc    Get purchase request categories (Public)
// @route   GET /api/public/purchase-requests/categories
// @access  Public

exports.getPublicCategories = asyncHandler(async (req, res, next) => {
  const { department } = req.query;

  // Always show only approved requests
  let filter = { status: "approved" };

  // Optional department filter
  if (department) filter.department = department;

  // Fetch purchase requests (no user restriction)
  const requests = await PurchaseRequest.find(filter)
    .populate("currentApprover", "name email")
    .populate("suggestedSuppliers.supplier", "companyName rating")
    .sort({ createdAt: -1 })
    .lean(); // converts to plain JS objects for easy modification

  // Remove 'requestedBy' and add 'companyName: "BDU"'
  const cleanedRequests = requests.map((req) => {
    const { requestedBy, department, ...rest } = req; // exclude requestedBy
    return { ...rest, companyName: "BDU" };
  });

  res.json({
    success: true,
    count: cleanedRequests.length,
    data: cleanedRequests,
  });
});

exports.getUserByIdPublic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the user by ID and exclude sensitive fields
  const user = await PurchaseRequest.findById(id)
    .select("-password -resetToken -resetTokenExpire")
    .lean();

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  let extraData = null;

  // Fetch related model data depending on the user role
  if (user.role === "Patient") {
    extraData = await Patient.findOne({ user: id }).lean();
  } else if (user.role === "Doctor") {
    extraData = await Doctor.findOne({ user: id }).lean();
  }

  // Merge user info and extra data
  const fullData = {
    ...user,
    details: extraData || {},
  };

  res.status(200).json({
    success: true,
    message: "User details fetched successfully",
    data: fullData,
  });
});


// @desc    Create purchase request
// @route   POST /api/purchase-requests
// @access  Private (any logged-in user)
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { title, description, category, quantity, budget, urgency } = req.body;

  // Make sure required fields are provided
  if (!title || !description || !category || !budget || !urgency) {
    return next(
      new ErrorResponse("Please provide all required fields", 400)
    );
  }

  // Get user info to assign department (optional)
  const user = await User.findById(req.user.id);

  const purchaseRequest = await PurchaseRequest.create({
    title,
    description,
    category,
    quantity,
    budget,
    urgency,
    requestedBy: req.user.id,
    department: user?.department || null,
    status: "draft",
  });

  // Populate requestedBy details for response
  await purchaseRequest.populate("requestedBy", "name email department");

  res.status(201).json({
    success: true,
    message: "Purchase request created successfully",
    data: purchaseRequest,
  });
});

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile/me
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    department: req.body.department,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, department, approvalLimit, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name,
      email,
      role,
      department,
      approvalLimit: role === "approver" ? approvalLimit : 0,
      isActive,
    },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private/Admin
exports.getUsersByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;

  if (!["admin", "approver", "requester"].includes(role)) {
    return next(new ErrorResponse("Invalid role specified", 400));
  }

  const users = await User.find({ role, isActive: true })
    .select("-password")
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

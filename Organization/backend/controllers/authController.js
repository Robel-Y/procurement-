const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Send Token Response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    approvalLimit: user.approvalLimit,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    data: userResponse,
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password))) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse("Account is deactivated", 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, department, approvalLimit } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse("User already exists with this email", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "requester",
    department,
    approvalLimit: role === "approver" ? approvalLimit || 10000 : 0,
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.correctPassword(currentPassword))) {
    return next(new ErrorResponse("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message:
      "Logged out successfully - Please remove token from client storage",
  });
});

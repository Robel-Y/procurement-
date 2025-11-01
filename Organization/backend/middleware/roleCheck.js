const ErrorResponse = require("../utils/ErrorResponse");

// Check if user can approve based on amount
exports.canApprove = (req, res, next) => {
  if (req.user.role !== "approver") {
    return next(new ErrorResponse("Only approvers can approve requests", 403));
  }
  next();
};

// Check if user is requester of the request
exports.isRequester = (req, res, next) => {
  if (req.user.role !== "requester") {
    return next(
      new ErrorResponse("Only requesters can perform this action", 403)
    );
  }
  next();
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorResponse("Admin access required", 403));
  }
  next();
};

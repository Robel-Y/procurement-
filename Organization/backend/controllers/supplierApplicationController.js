const PurchaseRequest = require("../models/PurchaseRequest");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// Supplier applies to an approved request
exports.applyToRequest = asyncHandler(async (req, res, next) => {
  const { requestId, supplierId, comment } = req.body;

  const request = await PurchaseRequest.findById(requestId);
  if (!request) {
    return next(new ErrorResponse("Purchase request not found", 404));
  }

  // Only approved requests can be applied to
  if (request.status !== "approved") {
    return next(new ErrorResponse("Request not open for application", 400));
  }

  request.applications = request.applications || [];
  request.applications.push({
    supplier: supplierId,
    comment,
    appliedAt: new Date(),
  });

  await request.save();

  res.json({
    success: true,
    message: "Application submitted successfully",
    data: request,
  });
});

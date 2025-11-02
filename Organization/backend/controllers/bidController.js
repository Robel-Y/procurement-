exports.sendBidForm = asyncHandler(async (req, res, next) => {
  const { requestId, supplierId, formDetails } = req.body;

  // Send bid form to supplier system using ExternalApiService
  const externalResponse =
    await require("../services/externalApiService").sendBidFormToSupplier({
      requestId,
      supplierId,
      formDetails,
    });

  res.json({
    success: externalResponse.success,
    data: externalResponse.data,
  });
});

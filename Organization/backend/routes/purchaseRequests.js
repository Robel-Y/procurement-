const express = require("express");
const {
  createRequest,
  submitRequest,
  getRequests,
  getRequest,
  approveRequest,
  updateRequest,
} = require("../controllers/purchaseRequestController");
const { protect, authorize } = require("../middleware/auth");
const { isRequester, canApprove } = require("../middleware/roleCheck");

const router = express.Router();

router.post("/", protect, isRequester, createRequest);
router.get("/", protect, getRequests);
router.get("/:id", protect, getRequest);
router.put("/:id/submit", protect, isRequester, submitRequest);
router.put("/:id/approve", protect, canApprove, approveRequest);
router.put("/:id", protect, isRequester, updateRequest);

module.exports = router;

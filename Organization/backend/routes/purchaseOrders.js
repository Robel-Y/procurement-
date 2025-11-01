const express = require("express");
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrdersBySupplier,
} = require("../controllers/purchaseOrderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("admin"), createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.get(
  "/supplier/:supplierId",
  protect,
  authorize("admin"),
  getOrdersBySupplier
);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

module.exports = router;

const express = require("express");
const {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  getSuppliersByCategory,
  matchSuppliers,
} = require("../controllers/centralSupplierController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("admin"), createSupplier);
router.get("/", getSuppliers);
router.get("/category/:category", getSuppliersByCategory);
router.get("/:id", getSupplier);
router.put("/:id", protect, authorize("admin"), updateSupplier);
router.delete("/:id", protect, authorize("admin"), deleteSupplier);
router.post("/match", protect, matchSuppliers);

module.exports = router;

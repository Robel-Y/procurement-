const express = require("express");
const {
  applyToRequest,
} = require("../controllers/supplierApplicationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/apply", protect, applyToRequest);

module.exports = router;

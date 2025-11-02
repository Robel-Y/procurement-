const express = require("express");
const {
  getPublicCategories,
  getUserByIdPublic,
} = require("../controllers/purchaseRequestController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getPublicCategories);
router.get("/:id", getUserByIdPublic);

module.exports = router;

const express = require("express");
const {
  getUsers,
  getUser,
  getProfile,
  updateProfile,
  updateUser,
  deleteUser,
  getUsersByRole,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Admin only routes
router.get("/", protect, authorize("admin"), getUsers);
router.get("/role/:role", protect, authorize("admin"), getUsersByRole);
router.get("/:id", protect, authorize("admin"), getUser);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

// User profile routes (all authenticated users)
router.get("/profile/me", protect, getProfile);
router.put("/profile/me", protect, updateProfile);

module.exports = router;

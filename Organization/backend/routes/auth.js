const express = require("express");
const {
  login,
  register,
  getMe,
  updatePassword,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-password", protect, updatePassword);
router.post("/logout", protect, logout);

module.exports = router;

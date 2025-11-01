const express = require('express');
const { 
  registerUser, 
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  logoutUser
} = require('../controllers/authController');
const {
  protect,
  validateRegister,
  validateLogin,
  authRateLimit,
  sanitizeInput,
  preventNoSQLInjection
} = require('../middlewares');

const router = express.Router();

// Apply sanitization to all auth routes
router.use(sanitizeInput);
router.use(preventNoSQLInjection);

// Public routes
router.post('/register', 
  authRateLimit,
  validateRegister,
  registerUser
);

router.post('/login',
  authRateLimit,
  validateLogin,
  loginUser
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutUser);

module.exports = router;

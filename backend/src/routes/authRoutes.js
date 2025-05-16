// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// OTP Registration Flow
router.post('/register/request-otp', authController.requestRegistrationOtp); // Step 1
router.post('/register/verify-otp', authController.verifyOtpAndRegister);   // Step 2

router.post('/login', authController.loginUser);
router.get('/me', protect, authController.getMe); // Example protected route

module.exports = router;
const express = require('express');
const router  = express.Router();
const { register, login, getMe, sendOtpController, verifyOtpController } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/send-otp  — sends SMS OTP via Fast2SMS
router.post('/send-otp', sendOtpController);

// POST /api/auth/verify-otp — verifies OTP + creates account
router.post('/verify-otp', verifyOtpController);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;

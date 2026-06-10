const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtp: sendSmsOtp, verifyOtp: verifySmsOtp } = require('../services/otpService');

/**
 * Generates a signed JWT for the given user ID.
 * @param {string} id - MongoDB user _id
 * @returns {string} Signed JWT string
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── Register ─────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Creates a new passenger account.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, phoneVerified } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Prevent duplicate emails
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Only allow 'admin' role if explicitly set (restricted in production)
    const assignedRole = role === 'admin' ? 'admin' : 'passenger';

    const user = await User.create({
      name, email, password, role: assignedRole,
      phone: phone || '',
      phoneVerified: phoneVerified === true,
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        phone:         user.phone,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/login
 * Authenticates user credentials and returns a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Include password field explicitly (it's excluded by default via `select: false`)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// ─── Send OTP ───────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP to the given Indian mobile number.
 */
const sendOtpController = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
    }
    await sendSmsOtp(phone);
    res.status(200).json({ success: true, message: `OTP sent to ${phone}` });
  } catch (err) {
    console.error('OTP send error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to send OTP.' });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/verify-otp
 * Verifies the OTP. If valid, registers the user account.
 */
const verifyOtpController = async (req, res, next) => {
  try {
    const { phone, otp, name, email, password } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    const result = verifySmsOtp(phone, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // If registration data provided, create the account now
    if (name && email && password) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      const user = await User.create({
        name, email, password,
        phone, phoneVerified: true,
        role: 'passenger',
      });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, phoneVerified: true },
      });
    }

    res.status(200).json({ success: true, message: 'OTP verified.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, sendOtpController, verifyOtpController };

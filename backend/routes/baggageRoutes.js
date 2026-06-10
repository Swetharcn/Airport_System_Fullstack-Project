const express = require('express');
const router = express.Router();
const {
  registerBaggage,
  getUserBaggage,
  updateBaggageStatus,
  getFlightBaggage,
  getAllBaggage,
} = require('../controllers/baggageController');
const protect = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Passenger routes
router.post('/register', protect, registerBaggage);
router.get('/user/me', protect, getUserBaggage);

// Admin routes
router.get('/', protect, requireRole('admin'), getAllBaggage);
router.get('/flight/:flightId', protect, requireRole('admin'), getFlightBaggage);
router.put('/:id/status', protect, requireRole('admin'), updateBaggageStatus);

module.exports = router;

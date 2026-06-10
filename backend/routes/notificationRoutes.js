const express = require('express');
const router = express.Router();
const { 
  registerFlight, 
  getMyFlights, 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

router.post('/register-flight', protect, registerFlight);
router.get('/my-flights', protect, getMyFlights);

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;

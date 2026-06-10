const express = require('express');
const router = express.Router();
const {
  addBoardingPass,
  getUserBoardingPasses,
  deleteBoardingPass,
  subscribePush,
  unsubscribePush,
  getVapidPublicKey,
  sendTestPush,
} = require('../controllers/boardingPassController');
const protect = require('../middleware/authMiddleware');

// Public — needed by client before auth to set up SW
router.get('/vapid-public-key', getVapidPublicKey);

// Protected routes
router.get('/', protect, getUserBoardingPasses);
router.post('/', protect, addBoardingPass);
router.delete('/:id', protect, deleteBoardingPass);

// Push subscription management
router.post('/push-subscribe', protect, subscribePush);
router.post('/push-unsubscribe', protect, unsubscribePush);
router.post('/test-push', protect, sendTestPush);

module.exports = router;

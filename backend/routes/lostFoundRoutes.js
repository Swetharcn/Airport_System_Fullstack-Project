const express = require('express');
const router = express.Router();
const { 
  reportLostItem, 
  getMyLostItems, 
  getAllLostItems, 
  updateLostItemStatus,
  getPublicFoundItems
} = require('../controllers/lostFoundController');
const protect = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public/Passenger routes
router.get('/public', getPublicFoundItems); // NEW: Get all 'Found' items globally
router.post('/', protect, reportLostItem);
router.get('/my', protect, getMyLostItems);

// Admin only routes
router.get('/', protect, requireRole('admin'), getAllLostItems);
router.put('/:id', protect, requireRole('admin'), updateLostItemStatus);

module.exports = router;

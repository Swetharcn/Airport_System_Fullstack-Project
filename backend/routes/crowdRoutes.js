const express = require('express');
const router = express.Router();
const { getCrowdDensity, getAlternatives } = require('../controllers/crowdController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getCrowdDensity);
router.get('/alternatives', protect, getAlternatives);

module.exports = router;

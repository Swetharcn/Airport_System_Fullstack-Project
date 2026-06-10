const express = require('express');
const router = express.Router();
const { getDelayPrediction, getGateChangePrediction, searchAndPredict } = require('../controllers/predictionController');
const protect = require('../middleware/authMiddleware');

router.get('/search', protect, searchAndPredict);
router.get('/delay/:flightId', protect, getDelayPrediction);
router.get('/gate-change/:flightId', protect, getGateChangePrediction);

module.exports = router;

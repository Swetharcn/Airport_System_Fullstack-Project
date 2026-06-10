const express = require('express');
const router  = express.Router();
const {
  getFlights, getFlightById,
  createFlight, updateFlight, deleteFlight,
} = require('../controllers/flightController');
const authMiddleware    = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

// ── Public Routes ──────────────────────────────────────────────────────────────
router.get('/',    getFlights);
router.get('/:id', getFlightById);

// ── Admin-only Routes ──────────────────────────────────────────────────────────
router.post(  '/',    authMiddleware, requireRole('admin'), createFlight);
router.put(   '/:id', authMiddleware, requireRole('admin'), updateFlight);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteFlight);

module.exports = router;

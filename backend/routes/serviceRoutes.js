const express = require('express');
const router  = express.Router();
const {
  getServices, getServiceById,
  createService, updateService, deleteService,
} = require('../controllers/serviceController');
const authMiddleware   = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

// ── Public Routes ──────────────────────────────────────────────────────────────
router.get('/',    getServices);
router.get('/:id', getServiceById);

// ── Admin-only Routes ──────────────────────────────────────────────────────────
router.post(  '/',    authMiddleware, requireRole('admin'), createService);
router.put(   '/:id', authMiddleware, requireRole('admin'), updateService);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteService);

module.exports = router;

const express = require('express');
const router  = express.Router();
const { chatController } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/chat — Requires authentication (passengers only)
router.post('/', authMiddleware, chatController);

module.exports = router;

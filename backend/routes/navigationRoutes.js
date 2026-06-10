const express = require('express');
const router = express.Router();
const { getNodes, getPath } = require('../controllers/navigationController');
const protect = require('../middleware/authMiddleware');

router.get('/nodes', protect, getNodes);
router.get('/path', protect, getPath);

module.exports = router;

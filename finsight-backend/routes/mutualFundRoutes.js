const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  getMutualFunds,
} = require('../controllers/mutualFundController');

// All mutual fund routes require login
router.use(protect);

// GET /api/mutual-funds
router.get('/', getMutualFunds);

module.exports = router;
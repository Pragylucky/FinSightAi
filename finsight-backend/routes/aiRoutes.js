const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  chatWithAI,
  analyzeCompany,
} = require('../controllers/aiController');

// Require authentication
router.use(protect);

// POST /api/ai/chat
router.post('/chat', chatWithAI);

// POST /api/ai/company-analysis
router.post('/company-analysis', analyzeCompany);

module.exports = router;
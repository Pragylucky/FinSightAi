const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  chatWithAI,
  analyzeCompany,
  submitFeedback,
  getAiStats,
} = require('../controllers/aiController');

// Require authentication
router.use(protect);

// POST /api/ai/chat
router.post('/chat', chatWithAI);

// POST /api/ai/company-analysis
router.post('/company-analysis', analyzeCompany);

// POST /api/ai/feedback  — thumbs up/down on an answer
router.post('/feedback', submitFeedback);

// GET /api/ai/stats  — latency, cost, error rate, helpful rate
router.get('/stats', getAiStats);

module.exports = router;
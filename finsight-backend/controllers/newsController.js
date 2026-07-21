// controllers/newsController.js

const { getMarketNews } = require('../services/financeService');
const { summarizeNews } = require('../services/aiService');

// ── GET /api/news ─────────────────────────────────────────────
// Query: ?category=general|forex|merger|crypto
const getNews = async (req, res, next) => {
  try {
    const { category = 'general' } = req.query;
    const news = await getMarketNews(category);
    res.json({ success: true, news });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/news/:id/summarize ───────────────────────────────
// AI-summarize a specific news article
// Body: { headline, content }
const summarizeArticle = async (req, res, next) => {
  try {
    const { headline, content } = req.body;
    if (!headline || !content) {
      return res.status(400).json({ success: false, message: 'headline and content required' });
    }

    const analysis = await summarizeNews(content, headline);
    res.json({ success: true, analysis });
  } catch (error) {
    // Don't crash if AI fails
    next(error);
  }
};

module.exports = { getNews, summarizeArticle };

// controllers/marketController.js
const { getOverview } = require('../services/marketService');

// GET /api/market/overview — indices, top movers and ticker, all from live data
const overview = async (req, res, next) => {
  try {
    res.json({ success: true, ...(await getOverview()) });
  } catch (error) {
    next(error);
  }
};

module.exports = { overview };

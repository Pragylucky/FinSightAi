// controllers/screenerController.js
// Stock screener over the ~265-stock universe. Data comes from the background snapshot in
// services/marketService.js, so this responds instantly.

const { getSnapshot } = require('../services/marketService');
const { screenerStocks } = require('../data/screenerData');

const toNum = (v, fallback) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

// ── GET /api/screener ─────────────────────────────────────────
// Query: sector, search, peMin, peMax, roeMin, marketCapMin, divMin, debtEqMax, sortBy, sortDir, page, limit
const screenStocks = async (req, res, next) => {
  try {
    const { sector = 'all', cap = 'all', search = '', sortBy = 'marketCap', sortDir = 'desc' } = req.query;
    const peMin = toNum(req.query.peMin, null);
    const peMax = toNum(req.query.peMax, null);
    const roeMin = toNum(req.query.roeMin, null);
    const marketCapMin = toNum(req.query.marketCapMin, null);
    const divMin = toNum(req.query.divMin, null);
    const debtEqMax = toNum(req.query.debtEqMax, null);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 300);

    const snapshot = await getSnapshot();
    let results = snapshot.stocks;

    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (sector !== 'all') results = results.filter((s) => s.sector === sector);
    if (cap !== 'all') results = results.filter((s) => s.capClass === cap);

    // A missing metric (null) never passes a filter on that metric
    results = results.filter((s) =>
      (peMin == null || (s.pe != null && s.pe >= peMin)) &&
      (peMax == null || (s.pe != null && s.pe <= peMax)) &&
      (roeMin == null || (s.roe != null && s.roe >= roeMin)) &&
      (marketCapMin == null || (s.marketCap != null && s.marketCap >= marketCapMin)) &&
      (divMin == null || (s.div != null && s.div >= divMin)) &&
      (debtEqMax == null || (s.debtEq != null && s.debtEq <= debtEqMax)));

    const sortable = ['marketCap', 'pe', 'roe', 'div', 'debtEq', 'revenueGrowth', 'price', 'changePercent'];
    if (sortable.includes(sortBy)) {
      const dir = sortDir === 'asc' ? 1 : -1;
      // nulls always sort last
      results = [...results].sort((a, b) => {
        if (a[sortBy] == null && b[sortBy] == null) return 0;
        if (a[sortBy] == null) return 1;
        if (b[sortBy] == null) return -1;
        return (a[sortBy] - b[sortBy]) * dir;
      });
    }

    const start = (page - 1) * limit;
    res.json({
      success: true,
      count: Math.min(limit, Math.max(results.length - start, 0)),
      total: results.length,
      universe: snapshot.total,
      page,
      totalPages: Math.ceil(results.length / limit),
      updatedAt: snapshot.updatedAt,
      // true while ROE / D/E / growth are still being fetched in the background
      loadingFundamentals: snapshot.loadingFundamentals,
      stocks: results.slice(start, start + limit),
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/screener/sectors ─────────────────────────────────
const getSectors = (req, res) => {
  res.json({ success: true, sectors: [...new Set(screenerStocks.map((s) => s.sector))].sort() });
};

module.exports = { screenStocks, getSectors };

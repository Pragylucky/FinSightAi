// controllers/screenerController.js
// Stock screener — filter by financial metrics
// In production you'd query a financial data provider
// For now returns our local dataset with optional live prices

const { screenerStocks } = require('../data/screenerData');
const { getCompanyProfile } = require('../services/financeService');
// ── GET /api/screener ─────────────────────────────────────────
// Query params: sector, peMax, roeMin, marketCapMin, divMin, search, sortBy, sortDir, page, limit
const screenStocks = async (req, res, next) => {
  try {
    const {
      sector = 'all',
      peMax = 200,
      peMin = 0,
      roeMin = 0,
      marketCapMin = 0,
      divMin = 0,
      debtEqMax = 100,
      search = '',
      sortBy = 'marketCap',
      sortDir = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const profiles = await Promise.all(
  screenerStocks.map(async (stock) => {
    try {
      const profile = await getCompanyProfile(stock.yahooSymbol);

      if (!profile) {
        return null;
      }

      return {
        symbol: stock.symbol,
        name: profile.name || stock.name,
        sector:
          profile.sector && profile.sector !== 'Unknown'
            ? profile.sector
            : stock.sector,

        marketCap: profile.marketCap
          ? profile.marketCap / 10000000
          : 0,

        pe: profile.pe || 0,
        roe: profile.roe || 0,
        debtEq: profile.debtToEquity || 0,
        div: profile.dividendYield || 0,
        revenueGrowth: profile.revenueGrowth || 0,

        high52W: profile.week52High || 0,
        low52W: profile.week52Low || 0,
      };
    } catch (error) {
      console.error(
        `Screener profile error for ${stock.symbol}:`,
        error.message
      );

      return null;
    }
  })
);

let results = profiles.filter(Boolean);
console.log(
  '🔥 SCREENER PROFILES:',
  profiles.map(p => p && ({
    symbol: p.symbol,
    marketCap: p.marketCap,
    pe: p.pe,
    roe: p.roe,
  }))
);

console.log(
  `🔥 Yahoo profiles successful: ${profiles.filter(Boolean).length}/${screenerStocks.length}`
);

    // ── Apply filters ──────────────────────────────────────
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    if (sector !== 'all') {
      results = results.filter(s => s.sector === sector);
    }

   results = results.filter(s => {
  const pe = Number(s.pe) || 0;
  const roe = Number(s.roe) || 0;
  const marketCap = Number(s.marketCap) || 0;
  const div = Number(s.div) || 0;
  const debtEq = Number(s.debtEq) || 0;

  return (
    (parseFloat(peMin) === 0 || pe >= parseFloat(peMin)) &&
    (parseFloat(peMax) === 200 || pe <= parseFloat(peMax)) &&
    (parseFloat(roeMin) === 0 || roe >= parseFloat(roeMin)) &&
    (parseFloat(marketCapMin) === 0 ||
      marketCap >= parseFloat(marketCapMin)) &&
    (parseFloat(divMin) === 0 || div >= parseFloat(divMin)) &&
    (parseFloat(debtEqMax) === 100 ||
      debtEq <= parseFloat(debtEqMax))
  );
});

    // ── Sort ───────────────────────────────────────────────
    const allowedSorts = ['marketCap', 'pe', 'roe', 'div', 'debtEq', 'revenueGrowth', 'price'];
    if (allowedSorts.includes(sortBy)) {
      results.sort((a, b) =>
        sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
      );
    }

    // ── Paginate ───────────────────────────────────────────
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // max 50 per page
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      count: paginatedResults.length,
      total: results.length,
      page: pageNum,
      totalPages: Math.ceil(results.length / limitNum),
      stocks: paginatedResults,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/screener/sectors ─────────────────────────────────
const getSectors = async (req, res) => {
  const { screenerStocks } = require('../data/screenerData');
  const sectors = [...new Set(screenerStocks.map(s => s.sector))].sort();
  res.json({ success: true, sectors });
};

module.exports = { screenStocks, getSectors };

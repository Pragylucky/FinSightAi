// controllers/companyController.js
// Fetches company/stock data from finance APIs + generates AI analysis

const { getStockQuote, getCompanyProfile, getHistoricalData, getCompanyNews, getQuarterlyFinancials } = require('../services/financeService');
const { generateCompanySummary } = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');

// ── GET /api/companies/:symbol ────────────────────────────────
// Full company data: profile + live quote + AI analysis
const getCompany = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    // Fetch all data in parallel (faster than sequential)
  const [quote, profile, news, quarterlyResults] = await Promise.all([
    getStockQuote(upperSymbol),
    getCompanyProfile(upperSymbol),
    getCompanyNews(upperSymbol),
    getQuarterlyFinancials(upperSymbol),
  ]);

    if (!quote) {
      return next(new AppError(`No data found for symbol: ${upperSymbol}`, 404));
    }

    // Generate AI summary using the live data
    // Only call AI if we have real profile data
    let aiAnalysis = null;
    if (profile && profile.pe) {
      try {
        aiAnalysis = await generateCompanySummary({
          symbol: upperSymbol,
          price: quote.price,
          changePercent: quote.changePercent,
          pe: profile.pe,
          pb: profile.pb,
          roe: profile.roe,
          dividendYield: profile.dividendYield,
          revenueGrowth: profile.revenueGrowth,
          netMargin: profile.netMargin,
          debtToEquity: profile.debtToEquity,
          sector: profile.sector,
          marketCap: profile.marketCap,
        });
      } catch (aiErr) {
        console.error('AI summary generation failed:', aiErr.message);
        // Don't fail the request — just return without AI analysis
      }
    }

    res.json({
      success: true,
      company: {
        symbol: upperSymbol,
        ...profile,
        quote,
        news: news.slice(0, 5),
        quarterlyResults,
        aiAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/quote ─────────────────────────
// Just the live price — lighter, faster, called for real-time updates
const getQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const quote = await getStockQuote(symbol.toUpperCase());
    res.json({ success: true, quote });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/chart ─────────────────────────
// Historical price data for charts
// Query: ?days=30 (default 30)
const getChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days) || 30;

    if (days > 365) {
      return next(new AppError('Max 365 days of history', 400));
    }

    const data = await getHistoricalData(symbol.toUpperCase(), days);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/news ──────────────────────────
const getCompanyNewsRoute = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const news = await getCompanyNews(symbol.toUpperCase());
    res.json({ success: true, news });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/search?q=tata ─────────────────────────
// Search for companies (simple search against known symbols)
// With real finance API you'd use their search endpoint
const searchCompanies = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ success: true, results: [] });
    }

    
    const knownStocks = [
      { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE' },
      { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE' },
      { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE' },
      { symbol: 'HDFC', name: 'HDFC Bank', exchange: 'NSE' },
      { symbol: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE' },
      { symbol: 'BAJFIN', name: 'Bajaj Finance', exchange: 'NSE' },
      { symbol: 'ICICI', name: 'ICICI Bank', exchange: 'NSE' },
      { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
      { symbol: 'LT', name: 'Larsen & Toubro', exchange: 'NSE' },
      { symbol: 'HCLTECH', name: 'HCL Technologies', exchange: 'NSE' },
      { symbol: 'ZOMATO', name: 'Zomato Limited', exchange: 'NSE' },
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
    ];

    const query = q.toLowerCase();
    const results = knownStocks.filter(
      s => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    ).slice(0, 8);

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompany, getQuote, getChartData, getCompanyNewsRoute, searchCompanies };

// controllers/companyController.js
// Company pages: profile + live quote + news + quarterly results, with the AI analysis served
// from its own endpoint so a slow AI call never blocks (or breaks) the page.

const {
  getStockQuote, getCompanyProfile, getHistoricalData, getCompanyNews, getQuarterlyFinancials, searchSymbols,
} = require('../services/financeService');
const AiEvent = require('../models/AiEvent');
const { generateCompanySummary } = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');

const ANALYSIS_TTL_MS = 6 * 60 * 60 * 1000;
const analysisCache = new Map(); // SYMBOL -> { at, data }

const cleanSymbol = (s) => decodeURIComponent(String(s)).toUpperCase().trim();

// ── GET /api/companies/:symbol ────────────────────────────────
const getCompany = async (req, res, next) => {
  try {
    const symbol = cleanSymbol(req.params.symbol);

    const [quote, profile, news, quarterlyResults] = await Promise.allSettled([
      getStockQuote(symbol),
      getCompanyProfile(symbol),
      getCompanyNews(symbol),
      getQuarterlyFinancials(symbol),
    ]);

    // The quote is the one thing the page can't do without
    if (quote.status === 'rejected') {
      const known = profile.status === 'fulfilled' && profile.value;
      return next(new AppError(
        known ? `Live price for ${symbol} is unavailable right now. Try again shortly.` : `No data found for symbol: ${symbol}`,
        known ? 502 : 404
      ));
    }

    res.json({
      success: true,
      company: {
        symbol,
        ...(profile.status === 'fulfilled' ? profile.value : {}),
        quote: quote.value,
        news: news.status === 'fulfilled' ? news.value.slice(0, 8) : [],
        quarterlyResults: quarterlyResults.status === 'fulfilled' ? quarterlyResults.value : [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/snapshot ───────────────────────
// Just the quote and key ratios (no news or quarterly results): ~3x faster, used by Compare.
const getSnapshot = async (req, res, next) => {
  try {
    const symbol = cleanSymbol(req.params.symbol);
    const [quote, profile] = await Promise.allSettled([getStockQuote(symbol), getCompanyProfile(symbol)]);
    if (quote.status === 'rejected') {
      return next(new AppError(
        profile.status === 'fulfilled' && profile.value ? `Live price for ${symbol} is unavailable right now.` : `No data found for symbol: ${symbol}`,
        profile.status === 'fulfilled' && profile.value ? 502 : 404
      ));
    }
    res.json({ success: true, company: { symbol, ...(profile.status === 'fulfilled' ? profile.value : {}), quote: quote.value } });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/analysis ───────────────────────
// AI summary, strengths, risks, outlook. Cached for 6 hours per symbol.
const getAnalysis = async (req, res, next) => {
  try {
    const symbol = cleanSymbol(req.params.symbol);

    const hit = analysisCache.get(symbol);
    if (hit && Date.now() - hit.at < ANALYSIS_TTL_MS) {
      AiEvent.create({ user: req.user?._id, kind: 'analysis', symbols: [symbol], grounded: true, cached: true }).catch(() => {});
      return res.json({ success: true, analysis: hit.data, cached: true });
    }

    const [profile, quote] = await Promise.all([
      getCompanyProfile(symbol),
      getStockQuote(symbol).catch(() => null),
    ]);
    if (!profile) return next(new AppError(`No data found for symbol: ${symbol}`, 404));

    // Only send what we actually have; the model is told not to invent the rest
    const facts = Object.fromEntries(Object.entries({
      symbol,
      name: profile.name,
      sector: profile.sector,
      industry: profile.industry,
      currency: profile.currency,
      price: quote?.price,
      todayChangePercent: quote?.changePercent,
      marketCap: profile.marketCap,
      pe: profile.pe,
      forwardPE: profile.forwardPE,
      pb: profile.pb,
      eps: profile.eps,
      roePercent: profile.roe,
      netMarginPercent: profile.netMargin,
      revenueGrowthPercent: profile.revenueGrowth,
      debtToEquityRatio: profile.debtToEquity,
      dividendYieldPercent: profile.dividendYield,
      week52High: profile.week52High,
      week52Low: profile.week52Low,
    }).filter(([, v]) => v != null && v !== 'Unknown'));

    let generated;
    try {
      generated = await generateCompanySummary(facts);
    } catch (err) {
      AiEvent.create({ user: req.user?._id, kind: 'analysis', symbols: [symbol], grounded: true, ok: false, error: String(err.message).slice(0, 200) }).catch(() => {});
      throw err;
    }
    const { _meta, ...fields } = generated;
    AiEvent.create({
      user: req.user?._id, kind: 'analysis', symbols: [symbol], grounded: true, model: _meta?.model,
      latencyMs: _meta?.latencyMs, inputTokens: _meta?.inputTokens, outputTokens: _meta?.outputTokens,
    }).catch(() => {});
    // `inputs` lists exactly what the model was shown, so the UI can display it
    const data = { ...fields, inputs: facts, model: _meta?.model, generatedAt: new Date().toISOString() };
    analysisCache.set(symbol, { at: Date.now(), data });
    res.json({ success: true, analysis: data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/quote ──────────────────────────
const getQuote = async (req, res, next) => {
  try {
    res.json({ success: true, quote: await getStockQuote(cleanSymbol(req.params.symbol)) });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/chart?days=30 ──────────────────
const getChartData = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    if (days > 365) return next(new AppError('Max 365 days of history', 400));
    res.json({ success: true, data: await getHistoricalData(cleanSymbol(req.params.symbol), days) });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/:symbol/news ───────────────────────────
const getCompanyNewsRoute = async (req, res, next) => {
  try {
    res.json({ success: true, news: await getCompanyNews(cleanSymbol(req.params.symbol)) });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/companies/search?q=tata ──────────────────────────
const searchCompanies = async (req, res, next) => {
  try {
    res.json({ success: true, results: await searchSymbols(req.query.q) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompany, getSnapshot, getAnalysis, getQuote, getChartData, getCompanyNewsRoute, searchCompanies };

// controllers/aiController.js

const {
  generateAIResponse,
  generateCompanySummary,
} = require('../services/aiService');
const { getStockQuote, getCompanyProfile } = require('../services/financeService');
const { guardChatAnswer } = require('../services/aiGuard');
const AiEvent = require('../models/AiEvent');
const AiFeedback = require('../models/AiFeedback');
const { screenerStocks, usStocks, symbolAliases } = require('../data/screenerData');

// Finds stocks mentioned in a chat message ("Is TCS overvalued?", "compare infosys and wipro")
// so the AI can be handed live numbers instead of guessing. Max 2 to keep it fast.
const UNIVERSE = [
  ...screenerStocks.map((s) => ({ symbol: s.symbol, name: s.name.replace(/\s*\(.*?\)/g, '').toLowerCase() })),
  ...usStocks.map((s) => ({ symbol: s.symbol, name: s.name.toLowerCase().replace(/\s+(inc\.?|corporation|company)$/, '') })),
];

const findMentionedStocks = (text) => {
  const lower = text.toLowerCase();
  const found = [];
  for (const { symbol, name } of UNIVERSE) {
    // Short tickers (IT, LT, V...) collide with normal words, so those are matched by name only
    const bySymbol = symbol.length >= 3 && new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text) && /[A-Z]/.test(symbol);
    const byName = name.length >= 4 && lower.includes(name);
    if (bySymbol || byName) found.push(symbol);
  }
  for (const [old, current] of Object.entries(symbolAliases)) {
    if (new RegExp(`\\b${old}\\b`, 'i').test(text) && !found.includes(current)) found.push(current);
  }
  return [...new Set(found)].slice(0, 2);
};

// Live quote + key ratios for the mentioned stocks (best effort: never blocks the chat)
const buildChatContext = async (text) => {
  const symbols = findMentionedStocks(text);
  if (!symbols.length) return null;

  const rows = await Promise.all(symbols.map(async (symbol) => {
    const [quote, profile] = await Promise.all([
      getStockQuote(symbol).catch(() => null),
      getCompanyProfile(symbol).catch(() => null),
    ]);
    if (!quote && !profile) return null;
    return Object.fromEntries(Object.entries({
      symbol,
      name: profile?.name,
      price: quote?.price,
      currency: quote?.currency,
      todayChangePercent: quote?.changePercent && Number(quote.changePercent.toFixed(2)),
      marketCap: profile?.marketCap,
      pe: profile?.pe,
      pb: profile?.pb,
      roePercent: profile?.roe && Number(profile.roe.toFixed(1)),
      debtToEquity: profile?.debtToEquity,
      dividendYieldPercent: profile?.dividendYield && Number(profile.dividendYield.toFixed(2)),
      week52High: profile?.week52High,
      week52Low: profile?.week52Low,
    }).filter(([, v]) => v != null));
  }));

  const live = rows.filter(Boolean);
  return live.length ? { liveMarketData: live, asOf: new Date().toISOString() } : null;
};


// Telemetry must never break a user request
const record = (event) => { AiEvent.create(event).catch(() => {}); };

const chatWithAI = async (req, res, next) => {
  try {
    const { messages, context = null } = req.body;

    // Validate messages
    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one chat message is required',
      });
    }

    // Make sure every message has valid structure
    const validMessages = messages.filter(
      message =>
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim()
    );

    if (validMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format',
      });
    }

    // Use live data for stocks named in the latest user message, unless the caller supplied context
    const lastUser = [...validMessages].reverse().find((m) => m.role === 'user');
    const liveContext = context || (lastUser ? await buildChatContext(lastUser.content).catch(() => null) : null);

    let result;
    try {
      result = await generateAIResponse(validMessages, liveContext);
    } catch (err) {
      record({ user: req.user?._id, kind: 'chat', ok: false, error: String(err.message).slice(0, 200), grounded: !!liveContext });
      throw err;
    }

    const { message, flags } = guardChatAnswer(result.message);
    const symbols = (liveContext?.liveMarketData || []).map((d) => d.symbol);
    record({
      user: req.user?._id, kind: 'chat', model: result.meta?.model, symbols, grounded: symbols.length > 0,
      latencyMs: result.meta?.latencyMs, inputTokens: result.meta?.inputTokens, outputTokens: result.meta?.outputTokens,
      guardFlags: flags,
    });

    res.json({
      success: true,
      message,
      // What the answer was grounded in, so the UI can show it instead of asking users to trust it
      sources: symbols.length ? { symbols, asOf: liveContext.asOf } : null,
    });
  } catch (error) {
    console.error(
      '❌ Gemini AI chat error:',
      error.response?.data || error.message
    );

    next(error);
  }
};

// ── POST /api/ai/company-analysis ─────────────────────────────
// Body: { companyData: {...} }

const analyzeCompany = async (req, res, next) => {
  try {
    const { companyData } = req.body;

    if (!companyData) {
      return res.status(400).json({
        success: false,
        message: 'Company data is required',
      });
    }

    const { _meta, ...analysis } = await generateCompanySummary(companyData);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      '❌ Gemini company analysis error:',
      error.response?.data || error.message
    );

    next(error);
  }
};

// ── POST /api/ai/feedback ─────────────────────────────────────
// Body: { kind: 'chat'|'analysis', ref, rating: 1|-1, reason? }
const submitFeedback = async (req, res, next) => {
  try {
    const { kind, ref, rating, reason = null } = req.body || {};
    if (!['chat', 'analysis'].includes(kind) || typeof ref !== 'string' || !ref.trim() || ![1, -1].includes(rating)) {
      return res.status(400).json({ success: false, message: 'kind, ref and rating (1 or -1) are required' });
    }
    await AiFeedback.findOneAndUpdate(
      { user: req.user._id, kind, ref: ref.slice(0, 80) },
      { rating, reason: rating === -1 ? reason : null, createdAt: new Date() },
      { upsert: true, runValidators: true }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/ai/stats?days=30 ─────────────────────────────────
// Aggregate quality/cost numbers for the AI features (the dashboard a PM would watch).
const percentile = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null);

const getAiStats = async (req, res, next) => {
  try {
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 864e5);
    const [events, feedback] = await Promise.all([
      AiEvent.find({ createdAt: { $gte: since } }).select('kind ok grounded cached latencyMs inputTokens outputTokens guardFlags').lean(),
      AiFeedback.find({ createdAt: { $gte: since } }).select('kind rating reason').lean(),
    ]);

    const byKind = (kind) => {
      const rows = events.filter((e) => e.kind === kind);
      const live = rows.filter((e) => e.ok && !e.cached);
      const lat = live.map((e) => e.latencyMs).filter(Number.isFinite).sort((a, b) => a - b);
      const votes = feedback.filter((f) => f.kind === kind);
      const up = votes.filter((f) => f.rating === 1).length;
      const sum = (key) => live.reduce((a, e) => a + (e[key] || 0), 0);
      return {
        requests: rows.length,
        errorRate: rows.length ? +(rows.filter((e) => !e.ok).length / rows.length).toFixed(3) : null,
        cacheHitRate: rows.length ? +(rows.filter((e) => e.cached).length / rows.length).toFixed(3) : null,
        groundedRate: rows.length ? +(rows.filter((e) => e.grounded).length / rows.length).toFixed(3) : null,
        latencyMs: { p50: percentile(lat, 0.5), p95: percentile(lat, 0.95) },
        avgTokens: live.length ? { input: Math.round(sum('inputTokens') / live.length), output: Math.round(sum('outputTokens') / live.length) } : null,
        guardrailFlags: rows.reduce((a, e) => a + (e.guardFlags?.length || 0), 0),
        feedback: { votes: votes.length, helpfulRate: votes.length ? +(up / votes.length).toFixed(3) : null },
      };
    };

    const reasons = {};
    feedback.filter((f) => f.rating === -1 && f.reason).forEach((f) => { reasons[f.reason] = (reasons[f.reason] || 0) + 1; });

    res.json({ success: true, windowDays: days, chat: byKind('chat'), analysis: byKind('analysis'), downvoteReasons: reasons });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getAiStats,
  findMentionedStocks,
  chatWithAI,
  analyzeCompany,
};
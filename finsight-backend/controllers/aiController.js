// controllers/aiController.js

const {
  generateAIResponse,
  generateCompanySummary,
} = require('../services/aiService');
const { getStockQuote, getCompanyProfile } = require('../services/financeService');
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

    const result = await generateAIResponse(
      validMessages,
      liveContext
    );

    res.json({
      success: true,
      message: result.message,
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

    const analysis =
      await generateCompanySummary(companyData);

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

module.exports = {
  findMentionedStocks,
  chatWithAI,
  analyzeCompany,
};
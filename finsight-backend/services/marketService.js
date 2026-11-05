// services/marketService.js
// Keeps an in-memory snapshot of the ~100-stock universe so the screener, top movers and
// ticker are served instantly instead of hitting Yahoo on every page view.
//
//  - Prices/ratios: 2 batched `quote()` calls, refreshed every 5 minutes.
//  - ROE / debt-to-equity / revenue growth: one `quoteSummary` per stock, 4 at a time,
//    refreshed daily in the background. Until they arrive those columns are null (shown as "—").

const { yahooFinance, LOOSE, toYahooSymbol, chartMeta } = require('./financeService');
const { screenerStocks } = require('../data/screenerData');

const QUOTE_REFRESH_MS = 5 * 60 * 1000;
const FUNDAMENTALS_REFRESH_MS = 6 * 60 * 60 * 1000;
const FUNDAMENTALS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CONCURRENCY = 5;

const stocks = new Map(); // symbol -> row
let updatedAt = null;
let quotesInFlight = null;
let fundamentalsRunning = false;

// Rough SEBI-style buckets by market cap (₹ crore): Large >= 80,000, Mid >= 25,000, otherwise Small
const capClass = (cr) => (cr == null ? null : cr >= 80000 ? 'Large' : cr >= 25000 ? 'Mid' : 'Small');

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Prices and headline ratios ────────────────────────────────
const refreshQuotes = () => {
  if (quotesInFlight) return quotesInFlight;

  quotesInFlight = (async () => {
    const bySymbol = new Map(screenerStocks.map((s) => [s.yahooSymbol, s]));
    const symbols = [...bySymbol.keys()];
    let loaded = 0;

    for (let i = 0; i < symbols.length; i += 50) {
      try {
        const quotes = await yahooFinance.quote(symbols.slice(i, i + 50), {}, LOOSE);
        for (const q of quotes) {
          const base = bySymbol.get(q.symbol);
          if (!base || !num(q.regularMarketPrice)) continue;
          const prev = stocks.get(base.symbol) || {};
          stocks.set(base.symbol, {
            ...prev,
            symbol: base.symbol,
            name: base.name,
            sector: base.sector,
            price: q.regularMarketPrice,
            change: num(q.regularMarketChange) ?? 0,
            changePercent: num(q.regularMarketChangePercent) ?? 0,
            marketCap: num(q.marketCap) ? q.marketCap / 1e7 : null, // ₹ crore
            capClass: num(q.marketCap) ? capClass(q.marketCap / 1e7) : null,
            pe: num(q.trailingPE),
            pb: num(q.priceToBook),
            div: num(q.dividendYield) ?? (num(q.trailingAnnualDividendYield) != null ? q.trailingAnnualDividendYield * 100 : null),
            high52W: num(q.fiftyTwoWeekHigh),
            low52W: num(q.fiftyTwoWeekLow),
            volume: num(q.regularMarketVolume),
          });
          loaded += 1;
        }
      } catch (error) {
        console.error('Market quote batch failed:', error.message);
      }
    }

    // Batched quotes unavailable (Yahoo refusing the session crumb from this host): fall back to
    // per-symbol chart calls, which need no crumb. Prices and 52W range only; ratios stay empty.
    if (!loaded) {
      const queue = [...bySymbol.values()];
      const worker = async () => {
        while (queue.length) {
          const base = queue.shift();
          try {
            const m = await chartMeta(toYahooSymbol(base.symbol));
            const prev = stocks.get(base.symbol) || {};
            stocks.set(base.symbol, {
              ...prev, symbol: base.symbol, name: base.name, sector: base.sector,
              price: m.price, change: m.change, changePercent: m.changePercent,
              high52W: m.high52W, low52W: m.low52W, volume: m.volume,
            });
            loaded += 1;
          } catch (error) { /* skip this symbol */ }
        }
      };
      await Promise.all(Array.from({ length: 8 }, worker));
      if (loaded) console.log('Market snapshot served by chart fallback (no crumb)');
    }

    if (loaded) updatedAt = new Date();
    console.log(`📈 Market snapshot: ${loaded}/${symbols.length} stocks refreshed`);
  })().finally(() => { quotesInFlight = null; });

  return quotesInFlight;
};

// ── Slower fundamentals (ROE, D/E, revenue growth) ────────────
const refreshFundamentals = async () => {
  if (fundamentalsRunning) return;
  fundamentalsRunning = true;

  try {
    const queue = [...stocks.values()].filter(
      (s) => !s.fundamentalsAt || Date.now() - s.fundamentalsAt > FUNDAMENTALS_MAX_AGE_MS
    ).filter((s) => !s.fundamentalsTried || Date.now() - s.fundamentalsTried > 60 * 60 * 1000);

    let done = 0;
    const worker = async () => {
      while (queue.length) {
        const s = queue.shift();
        const row = stocks.get(s.symbol);
        try {
          const r = await yahooFinance.quoteSummary(toYahooSymbol(s.symbol), { modules: ['financialData'] }, LOOSE);
          const fd = r.financialData || {};
          row.roe = num(fd.returnOnEquity) != null ? fd.returnOnEquity * 100 : null;
          row.debtEq = num(fd.debtToEquity) != null ? fd.debtToEquity / 100 : null; // Yahoo gives a percentage
          row.revenueGrowth = num(fd.revenueGrowth) != null ? fd.revenueGrowth * 100 : null;
          row.fundamentalsAt = Date.now();
          done += 1;
        } catch (error) {
          row.fundamentalsTried = Date.now(); // don't hammer a symbol that keeps failing
        }
        await sleep(150);
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    if (done) console.log(`📊 Fundamentals refreshed for ${done} stocks`);
  } finally {
    fundamentalsRunning = false;
  }
};

// ── Public API ────────────────────────────────────────────────
const start = () => {
  refreshQuotes().then(refreshFundamentals).catch((e) => console.error('Market warm-up failed:', e.message));
  setInterval(() => refreshQuotes().catch(() => {}), QUOTE_REFRESH_MS).unref();
  setInterval(() => refreshFundamentals().catch(() => {}), FUNDAMENTALS_REFRESH_MS).unref();
};

// Waits (briefly) for the first load so the very first request after boot isn't empty.
const ensureLoaded = async () => {
  if (stocks.size) return;
  await Promise.race([refreshQuotes(), sleep(20000)]);
};

const getSnapshot = async () => {
  await ensureLoaded();
  const rows = [...stocks.values()];
  const withFundamentals = rows.filter((r) => r.fundamentalsAt).length;
  return {
    stocks: rows,
    total: screenerStocks.length,
    updatedAt,
    fundamentalsLoaded: withFundamentals,
    loadingFundamentals: fundamentalsRunning || withFundamentals < rows.length,
  };
};

// Indices + FX, cached for a minute
let indexCache = { at: 0, data: [] };
const INDICES = [
  { symbol: '^NSEI', name: 'Nifty 50' },
  { symbol: '^BSESN', name: 'Sensex' },
  { symbol: '^NSEBANK', name: 'Bank Nifty' },
  { symbol: 'INR=X', name: 'USD/INR' },
];

const getIndices = async () => {
  if (Date.now() - indexCache.at < 60 * 1000 && indexCache.data.length) return indexCache.data;
  try {
    const quotes = await yahooFinance.quote(INDICES.map((i) => i.symbol), {}, LOOSE);
    const data = INDICES.map((i) => {
      const q = quotes.find((x) => x.symbol === i.symbol);
      return q && num(q.regularMarketPrice) ? { name: i.name, value: q.regularMarketPrice, change: num(q.regularMarketChangePercent) ?? 0 } : null;
    }).filter(Boolean);
    if (data.length) indexCache = { at: Date.now(), data };
    return data;
  } catch (error) {
    console.error('Index quote error:', error.message);
  }
  try {
    const rows = await Promise.all(INDICES.map(async (i) => {
      try { const m = await chartMeta(i.symbol); return { name: i.name, value: m.price, change: m.changePercent }; } catch { return null; }
    }));
    const data = rows.filter(Boolean);
    if (data.length) indexCache = { at: Date.now(), data };
  } catch { /* keep last good */ }
  return indexCache.data; // last good values, or empty
};

const getOverview = async () => {
  const [snapshot, indices] = await Promise.all([getSnapshot(), getIndices()]);
  const priced = snapshot.stocks.filter((s) => typeof s.changePercent === 'number');
  const byChange = [...priced].sort((a, b) => b.changePercent - a.changePercent);
  const slim = (s) => ({ symbol: s.symbol, name: s.name, price: s.price, change: s.changePercent });

  return {
    indices,
    gainers: byChange.slice(0, 6).map(slim),
    losers: byChange.slice(-6).reverse().map(slim),
    ticker: [
      ...indices.map((i) => ({ symbol: i.name, price: i.value, change: i.change })),
      ...[...priced].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)).slice(0, 14).map((s) => ({ symbol: s.symbol, price: s.price, change: s.changePercent })),
    ],
    updatedAt: snapshot.updatedAt,
  };
};

module.exports = { start, getSnapshot, getOverview };

// services/financeService.js
// All market-data calls live here. Source: Yahoo Finance (no API key needed).
// Optional: FINNHUB_API_KEY adds extra general market headlines.
//
// Principles
//  - Never invent data. If Yahoo fails we serve the last good (stale) value, otherwise throw.
//  - Yahoo's response schema changes often; `validateResult: false` stops one odd field from
//    failing a whole request (that used to make some stocks show no metrics at all).

const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const { AppError } = require('../middleware/errorHandler');
const { screenerStocks, usStocks, symbolAliases } = require('../data/screenerData');

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
  validation: { logErrors: false },
});
const LOOSE = { validateResult: false };

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const US_SYMBOLS = new Set(usStocks.map((s) => s.symbol));
const TRACKED = new Set([...screenerStocks.map((s) => s.symbol), ...US_SYMBOLS]);

// ── Cache with stale fallback ─────────────────────────────────
// fresh for `ttl`, but kept for 24h so a Yahoo outage doesn't blank the app
const cache = new Map();
const STALE_MS = 24 * 60 * 60 * 1000;

const getCached = (key) => {
  const hit = cache.get(key);
  return hit && Date.now() < hit.expiresAt ? hit.data : null;
};
const getStale = (key) => {
  const hit = cache.get(key);
  return hit && Date.now() < hit.staleUntil ? hit.data : null;
};
const setCache = (key, data, ttlSeconds = 60) => {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000, staleUntil: Date.now() + STALE_MS });
};

// ── Symbol helpers ────────────────────────────────────────────
// TCS -> TCS.NS, AAPL -> AAPL, ZOMATO -> ETERNAL.NS (renamed), ^NSEI stays as-is
const toYahooSymbol = (symbol) => {
  const s = String(symbol || '').toUpperCase().trim();
  if (s.startsWith('^') || s.includes('=') || s.includes('.')) return s;
  const clean = symbolAliases[s] || s;
  return US_SYMBOLS.has(clean) ? clean : `${clean}.NS`;
};

const toISO = (v) => {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v).toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// `chartPreviousClose` is the close before the whole 5-day window, not yesterday's, so using it
// overstates (or reverses) the daily move. `previousClose` is often absent, so fall back to the
// prior daily close in the series.
const previousCloseOf = (result) => {
  const meta = result?.meta || {};
  if (typeof meta.previousClose === 'number') return meta.previousClose;
  const closes = (result?.indicators?.quote?.[0]?.close || []).filter((v) => typeof v === 'number');
  return closes.length >= 2 ? closes[closes.length - 2] : null;
};

// ── Crumb-free fallback ───────────────────────────────────────
// yahoo-finance2's quote/quoteSummary need a session crumb, which Yahoo often refuses to cloud
// hosts. The public chart endpoint needs none, so it backs up price, 52-week range and volume.
const chartMeta = async (yahooSymbol) => {
  const response = await axios.get(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
    { params: { interval: '1d', range: '5d' }, timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  const result = response.data?.chart?.result?.[0];
  const meta = result?.meta;
  const price = meta?.regularMarketPrice;
  if (!meta || !(price > 0)) throw new Error('No price in chart response');
  const prev = previousCloseOf(result);
  return {
    name: meta.longName || meta.shortName || null,
    price,
    change: prev ? price - prev : 0,
    changePercent: prev ? ((price - prev) / prev) * 100 : 0,
    high52W: num(meta.fiftyTwoWeekHigh),
    low52W: num(meta.fiftyTwoWeekLow),
    volume: num(meta.regularMarketVolume),
    currency: meta.currency || 'INR',
  };
};

// ── Circuit breaker for the crumb-based calls ─────────────────
// When Yahoo refuses the session crumb every call fails slowly. After 3 failures in a row we skip
// those calls for 3 minutes and go straight to the crumb-free fallbacks, so pages stay fast.
let crumbFailures = 0;
let crumbDownUntil = 0;
const crumbCall = async (fn) => {
  if (Date.now() < crumbDownUntil) throw new Error('Yahoo session unavailable (circuit open)');
  try {
    const out = await fn();
    crumbFailures = 0;
    return out;
  } catch (error) {
    crumbFailures += 1;
    if (crumbFailures >= 3) { crumbDownUntil = Date.now() + 3 * 60 * 1000; crumbFailures = 0; }
    throw error;
  }
};

// Valuation and efficiency ratios from Yahoo's fundamentals-timeseries endpoint, which needs no crumb.
// Statement amounts can be in a different currency from the share price, so only ratios are derived.
const FUNDAMENTAL_TYPES = [
  'trailingPeRatio', 'trailingForwardPeRatio', 'trailingPbRatio', 'trailingMarketCap',
  'annualNetIncome', 'annualTotalRevenue', 'annualStockholdersEquity',
  'quarterlyTotalDebt', 'quarterlyStockholdersEquity',
].join(',');

const fundamentalsLite = async (yahooSymbol) => {
  const cacheKey = `FUNDLITE:${yahooSymbol}`;
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  const response = await axios.get(
    `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(yahooSymbol)}`,
    {
      params: { type: FUNDAMENTAL_TYPES, period1: Math.floor(Date.now() / 1000) - 3 * 365 * 86400, period2: Math.floor(Date.now() / 1000) + 86400 },
      timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' },
    }
  );

  // newest-first list of values per type
  const series = {};
  for (const r of response.data?.timeseries?.result || []) {
    const type = r.meta?.type?.[0];
    series[type] = (r[type] || []).filter((x) => x?.reportedValue?.raw != null)
      .sort((a, b) => String(b.asOfDate).localeCompare(String(a.asOfDate))).map((x) => x.reportedValue.raw);
  }
  const first = (t) => num(series[t]?.[0]);
  const ratio = (a, b) => (a != null && b ? a / b : null);

  const netIncome = first('annualNetIncome');
  const equity = first('annualStockholdersEquity');
  const revenue = first('annualTotalRevenue');
  const prevRevenue = num(series.annualTotalRevenue?.[1]);

  const data = {
    pe: first('trailingPeRatio'),
    forwardPE: first('trailingForwardPeRatio'),
    pb: first('trailingPbRatio'),
    marketCap: first('trailingMarketCap'),
    roe: ratio(netIncome, equity) != null ? (netIncome / equity) * 100 : null,
    netMargin: ratio(netIncome, revenue) != null ? (netIncome / revenue) * 100 : null,
    revenueGrowth: revenue != null && prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : null,
    debtToEquity: ratio(first('quarterlyTotalDebt'), first('quarterlyStockholdersEquity')),
  };
  if (Object.values(data).every((v) => v == null)) throw new Error('No fundamentals in timeseries response');
  setCache(cacheKey, data, 6 * 3600);
  return data;
};

// ── Live quote ────────────────────────────────────────────────
const getStockQuote = async (symbol) => {
  const cacheKey = `QUOTE:${symbol}`;
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  const yahooSymbol = toYahooSymbol(symbol);

  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
      { params: { interval: '1d', range: '5d' }, timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const result = response.data?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) throw new Error('No data returned from Yahoo Finance');

    const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
    if (!price) throw new Error('No valid price returned');

    const prevClose = previousCloseOf(result);
    const change = prevClose ? price - prevClose : 0;

    const data = {
      symbol,
      price,
      change,
      changePercent: prevClose ? (change / prevClose) * 100 : 0,
      high: meta.regularMarketDayHigh || price,
      low: meta.regularMarketDayLow || price,
      open: meta.regularMarketOpen || price,
      prevClose,
      volume: meta.regularMarketVolume || null,
      currency: meta.currency || 'INR',
      exchange: meta.exchangeName || 'NSE',
    };

    setCache(cacheKey, data, 60);
    return data;
  } catch (error) {
    console.error(`Quote error for ${yahooSymbol}:`, error.message);
    const stale = getStale(cacheKey);
    if (stale) return stale;
    throw new AppError(`Live price for ${symbol} is unavailable right now.`, 502);
  }
};

// ── Company profile (key metrics) ─────────────────────────────
const buildProfile = (symbol, { price = {}, summary = {}, stats = {}, financial = {}, profile = {} }) => ({
  symbol,
  name: price.longName || price.shortName || symbol,
  sector: profile.sector || 'Unknown',
  industry: profile.industry || 'Unknown',
  website: profile.website || '',
  description: profile.longBusinessSummary || '',
  employees: profile.fullTimeEmployees || 0,

  marketCap: num(price.marketCap),
  pe: num(summary.trailingPE),
  forwardPE: num(summary.forwardPE),
  pb: num(stats.priceToBook),
  eps: num(stats.trailingEps),

  roe: num(financial.returnOnEquity) != null ? financial.returnOnEquity * 100 : null,
  netMargin: num(financial.profitMargins) != null ? financial.profitMargins * 100 : null,
  revenueGrowth: num(financial.revenueGrowth) != null ? financial.revenueGrowth * 100 : null,
  // Yahoo reports D/E as a percentage (9.83 = 0.098x); the UI shows the ratio
  debtToEquity: num(financial.debtToEquity) != null ? financial.debtToEquity / 100 : null,

  dividendYield: num(summary.dividendYield) != null ? summary.dividendYield * 100 : null,
  week52High: num(summary.fiftyTwoWeekHigh),
  week52Low: num(summary.fiftyTwoWeekLow),
  revenue: num(financial.totalRevenue),
  currency: price.currency || 'INR',
});

const getCompanyProfile = async (symbol) => {
  const cacheKey = `PROFILE:${symbol}`;
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  const yahooSymbol = toYahooSymbol(symbol);

  try {
    const result = await crumbCall(() => yahooFinance.quoteSummary(
      yahooSymbol,
      { modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile'] },
      LOOSE
    ));
    const data = buildProfile(symbol, {
      price: result.price, summary: result.summaryDetail, stats: result.defaultKeyStatistics,
      financial: result.financialData, profile: result.assetProfile,
    });
    setCache(cacheKey, data, 3600);
    return data;
  } catch (error) {
    console.error(`Profile error for ${yahooSymbol}:`, error.message);
  }

  // quoteSummary failed (Yahoo hiccup / unusual symbol): fall back to the lighter quote endpoint
  try {
    const q = await crumbCall(() => yahooFinance.quote(yahooSymbol, {}, LOOSE));
    if (!q) throw new Error('empty quote');
    const data = buildProfile(symbol, {
      price: { longName: q.longName, shortName: q.shortName, marketCap: q.marketCap, currency: q.currency },
      summary: {
        trailingPE: q.trailingPE, forwardPE: q.forwardPE, fiftyTwoWeekHigh: q.fiftyTwoWeekHigh, fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        dividendYield: q.dividendYield != null ? q.dividendYield / 100 : undefined,
      },
      stats: { priceToBook: q.priceToBook, trailingEps: q.epsTrailingTwelveMonths },
    });
    setCache(cacheKey, data, 600);
    return data;
  } catch (error) {
    console.error(`Profile fallback error for ${yahooSymbol}:`, error.message);
  }

  // Last resort, no Yahoo session needed: price range from the chart endpoint plus ratios from the
  // fundamentals timeseries. Either may be missing; whatever arrives is real, the rest stays empty.
  const [chart, fund] = await Promise.allSettled([chartMeta(yahooSymbol), fundamentalsLite(yahooSymbol)]);
  if (chart.status === 'fulfilled' || fund.status === 'fulfilled') {
    const m = chart.status === 'fulfilled' ? chart.value : {};
    const f = fund.status === 'fulfilled' ? fund.value : {};
    const roe = f.roe ?? null;
    const data = buildProfile(symbol, {
      price: { longName: m.name, currency: m.currency, marketCap: f.marketCap },
      profile: { sector: (screenerStocks.find((x) => x.symbol === symbol) || usStocks.find((x) => x.symbol === symbol) || {}).sector },
      summary: { trailingPE: f.pe, forwardPE: f.forwardPE, fiftyTwoWeekHigh: m.high52W, fiftyTwoWeekLow: m.low52W },
      stats: { priceToBook: f.pb, trailingEps: m.price && f.pe ? m.price / f.pe : null },
      financial: {
        returnOnEquity: roe != null ? roe / 100 : null,
        profitMargins: f.netMargin != null ? f.netMargin / 100 : null,
        revenueGrowth: f.revenueGrowth != null ? f.revenueGrowth / 100 : null,
        debtToEquity: f.debtToEquity != null ? f.debtToEquity * 100 : null,
      },
    });
    setCache(cacheKey, data, 600);
    return data;
  }
  console.error(`Profile chart/fundamentals fallback failed for ${yahooSymbol}:`, chart.reason?.message, fund.reason?.message);
  return getStale(cacheKey);
};

// ── Price history for charts ──────────────────────────────────
const getHistoricalData = async (symbol, days = 30) => {
  const cacheKey = `HISTORY:${symbol}:${days}`;
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  const yahooSymbol = toYahooSymbol(symbol);
  const range = days <= 7 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';

  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
      { params: { interval: '1d', range }, timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const result = response.data?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0];
    if (!quote || timestamps.length === 0) throw new Error('No historical data returned');

    const data = timestamps
      .map((t, i) => ({
        ts: t * 1000, // lets clients line up different markets by calendar date
        date: new Date(t * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        price: quote.close?.[i],
        open: quote.open?.[i],
        high: quote.high?.[i],
        low: quote.low?.[i],
        volume: quote.volume?.[i],
      }))
      .filter((item) => item.price != null)
      .slice(-days);

    if (data.length === 0) throw new Error('No valid candles');

    setCache(cacheKey, data, 3600);
    return data;
  } catch (error) {
    console.error(`History error for ${yahooSymbol}:`, error.message);
    const stale = getStale(cacheKey);
    if (stale) return stale;
    throw new AppError(`Price history for ${symbol} is unavailable right now.`, 502);
  }
};

// ── News ──────────────────────────────────────────────────────
// Headline sentiment from wording. Cheap and key-free; it's an estimate, not AI.
const POSITIVE = ['surge', 'rally', 'gain', 'jump', 'soar', 'rise', 'rises', 'record high', 'beat', 'profit', 'growth', 'upgrade', 'bullish', 'strong', 'boost', 'rebound', 'recover', 'climb', 'higher', 'wins', 'approval', 'expands', 'optimism'];
const NEGATIVE = ['fall', 'falls', 'drop', 'slump', 'plunge', 'crash', 'loss', 'decline', 'miss', 'downgrade', 'bearish', 'weak', 'sell-off', 'selloff', 'lower', 'tumble', 'slide', 'fear', 'concern', 'probe', 'fraud', 'ban', 'cuts', 'layoff', 'warning', 'penalty'];

const scoreSentiment = (text) => {
  const t = ` ${text.toLowerCase()} `;
  const count = (words) => words.reduce((n, w) => n + (new RegExp(`\\b${w.replace('-', '[- ]?')}\\b`).test(t) ? 1 : 0), 0);
  const pos = count(POSITIVE);
  const neg = count(NEGATIVE);
  const bullishScore = Math.round((100 * (pos + 1)) / (pos + neg + 2));
  return {
    sentiment: bullishScore >= 60 ? 'bullish' : bullishScore <= 40 ? 'bearish' : 'neutral',
    bullishScore,
    bearishScore: 100 - bullishScore,
  };
};

// Which section a headline belongs in (drives the News page filter)
const ECONOMY_RE = /\b(rbi|inflation|gdp|rupee|repo|interest rate|rate (cut|hike)|budget|fiscal|tariff|economy|economic|monetary|fed|trade deficit|forex)\b/i;
const COMPANY_RE = /\b(earnings|results|quarter|q[1-4]|ipo|merger|acquisition|acquires|dividend|stake|order win|profit|revenue|shares of)\b/i;
const classify = (title, summary, related) => {
  const text = `${title} ${summary}`;
  if (ECONOMY_RE.test(text)) return 'Economy';
  if (related.length || COMPANY_RE.test(text)) return 'Companies';
  return 'Markets';
};

const mapYahooNews = (article, category = 'business') => ({
  id: article.uuid || article.link,
  title: article.title || 'Untitled',
  summary: article.summary || '',
  source: article.publisher || 'Yahoo Finance',
  url: article.link || '',
  time: toISO(article.providerPublishTime),
  category,
  // Only tickers the app tracks, so the News page's stock filter never offers indices or junk symbols
  relatedStocks: (article.relatedTickers || [])
    .map((t) => t.replace(/\.(NS|BO)$/, ''))
    .filter((t, i, all) => TRACKED.has(t) && all.indexOf(t) === i)   // NSE + BSE listings collapse to one
    .slice(0, 4),
});

const getMarketNews = async () => {
  const cacheKey = 'NEWS:market';
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  const collected = [];

  // Primary: Yahoo headlines about the Indian market (no key needed)
  // Yahoo's news search only matches short queries; long phrases return nothing
  const queries = ['Sensex', 'Nifty 50', 'Indian stocks', 'RBI', 'Indian economy', 'rupee', 'NSE India', 'India IPO'];
  const yahoo = await Promise.allSettled(
    queries.map((q) => yahooFinance.search(q, { newsCount: 15, quotesCount: 0 }, LOOSE))
  );
  yahoo.forEach((r) => {
    if (r.status === 'fulfilled') (r.value.news || []).forEach((a) => collected.push(mapYahooNews(a)));
    else console.error('Yahoo news error:', r.reason?.message);
  });

  // Optional extra: Finnhub general headlines, if a key is configured
  if (process.env.FINNHUB_API_KEY) {
    try {
      const { data } = await axios.get(`${FINNHUB_BASE}/news`, {
        params: { category: 'general', token: process.env.FINNHUB_API_KEY },
        timeout: 5000,
      });
      (data || []).slice(0, 15).forEach((a) =>
        collected.push({
          id: String(a.id),
          title: a.headline,
          summary: a.summary || '',
          source: a.source,
          url: a.url,
          time: toISO(a.datetime),
          category: 'global',
          relatedStocks: (a.related ? a.related.split(',') : []).filter((t) => TRACKED.has(t)).slice(0, 4),
        })
      );
    } catch (error) {
      console.error('Finnhub news error:', error.message);
    }
  }

  const seen = new Set();
  const data = collected
    .filter((a) => a.title && a.url && !seen.has(a.title.toLowerCase()) && seen.add(a.title.toLowerCase()))
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 40)
    .map((a) => ({ ...a, category: a.category === 'global' ? 'Global' : classify(a.title, a.summary, a.relatedStocks), ...scoreSentiment(`${a.title} ${a.summary}`) }));

  if (data.length) {
    setCache(cacheKey, data, 600);
    return data;
  }
  return getStale(cacheKey) || [];
};

const getCompanyNews = async (symbol) => {
  const cacheKey = `CNEWS:${symbol}`;
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  const clean = String(symbol).replace(/\.(NS|BO)$/i, '').toUpperCase();
  const resolved = symbolAliases[clean] || clean;
  const known = screenerStocks.find((s) => s.symbol === resolved) || usStocks.find((s) => s.symbol === resolved);
  const fullName = known?.name || resolved;

  // "Eternal (Zomato)" -> search "Eternal", "Zomato" and the ticker itself
  const base = fullName.replace(/\s*\(.*?\)/g, '').trim();
  const alt = (fullName.match(/\(([^)]+)\)/) || [])[1];
  const queries = [...new Set([base, alt, resolved].filter(Boolean))];

  try {
    const results = await Promise.allSettled(
      queries.map((q) => yahooFinance.search(q, { newsCount: 15, quotesCount: 0 }, LOOSE))
    );

    // Accept an article if Yahoo tags it with this ticker, or its text names the company
    // (single short words like "Eternal" must be tagged, otherwise unrelated stories slip in)
    const nameIsSpecific = base.includes(' ') || base.length >= 8;
    const isRelevant = (a) => {
      const related = (a.relatedTickers || []).some((t) => t.toUpperCase().replace(/\.(NS|BO)$/, '') === resolved);
      const text = `${a.title || ''} ${a.summary || ''}`.toLowerCase();
      return related || (nameIsSpecific && text.includes(base.toLowerCase()));
    };

    const seen = new Set();
    const data = results
      .flatMap((r) => (r.status === 'fulfilled' ? r.value.news || [] : []))
      .filter((a) => a.title && isRelevant(a) && !seen.has(a.title) && seen.add(a.title))
      .sort((a, b) => new Date(toISO(b.providerPublishTime)) - new Date(toISO(a.providerPublishTime)))
      .slice(0, 10)
      .map((a) => mapYahooNews(a, 'company'));

    setCache(cacheKey, data, 600);
    return data;
  } catch (error) {
    console.error(`Company news error for ${fullName}:`, error.message);
    return getStale(cacheKey) || [];
  }
};

// ── Quarterly results ─────────────────────────────────────────
const getQuarterlyFinancials = async (symbol) => {
  const cacheKey = `QFIN:${symbol}`;
  const fresh = getCached(cacheKey);
  if (fresh) return fresh;

  try {
    const result = await yahooFinance.fundamentalsTimeSeries(
      toYahooSymbol(symbol),
      { period1: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), type: 'quarterly', module: 'financials' },
      LOOSE
    );

    // newest first. Five rows so the UI can compute growth for the latest four.
    const data = result
      .filter((r) => r.date && (r.totalRevenue || r.netIncome))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((r) => ({
        date: toISO(r.date),
        revenue: r.totalRevenue || 0,
        netIncome: r.netIncome || 0,
        operatingIncome: r.operatingIncome || 0,
        ebitda: r.EBITDA || 0,
      }));

    setCache(cacheKey, data, 6 * 3600);
    return data;
  } catch (error) {
    console.error(`Quarterly financials error for ${symbol}:`, error.message);
    return getStale(cacheKey) || [];
  }
};

// ── Symbol search ─────────────────────────────────────────────
// Searches our ~100-stock universe + a few US names first, then asks Yahoo for any other NSE company.
const searchSymbols = async (q) => {
  const query = String(q || '').trim().toLowerCase();
  if (!query) return [];

  const aliasTarget = symbolAliases[query.toUpperCase()];
  const pool = [
    ...screenerStocks.map((s) => ({ symbol: s.symbol, name: s.name, exchange: 'NSE', sector: s.sector })),
    ...usStocks,
  ];

  const rank = (s) => {
    const sym = s.symbol.toLowerCase();
    const name = s.name.toLowerCase();
    if (sym === query || s.symbol === aliasTarget) return 0;
    if (sym.startsWith(query)) return 1;
    if (name.startsWith(query)) return 2;
    if (name.includes(query) || sym.includes(query)) return 3;
    return 99;
  };

  const local = pool.map((s) => ({ s, r: rank(s) })).filter((x) => x.r < 99).sort((a, b) => a.r - b.r).map((x) => x.s).slice(0, 8);
  if (local.length >= 5 || query.length < 2) return local;

  // Not enough local matches: ask Yahoo for other NSE-listed equities
  const cacheKey = `SEARCH:${query}`;
  let remote = getCached(cacheKey);
  if (!remote) {
    try {
      const r = await yahooFinance.search(query, { quotesCount: 8, newsCount: 0 }, LOOSE);
      remote = (r.quotes || [])
        .filter((x) => x.symbol && x.quoteType === 'EQUITY' && x.exchange === 'NSI' && /\.NS$/.test(x.symbol) && !/-/.test(x.symbol))
        .map((x) => ({ symbol: x.symbol.replace(/\.NS$/, ''), name: x.longname || x.shortname || x.symbol, exchange: 'NSE' }));
      setCache(cacheKey, remote, 3600);
    } catch (error) {
      console.error('Symbol search error:', error.message);
      remote = [];
    }
  }

  const have = new Set(local.map((s) => s.symbol));
  return [...local, ...remote.filter((s) => !have.has(s.symbol))].slice(0, 8);
};

module.exports = {
  scoreSentiment,
  yahooFinance,
  LOOSE,
  toYahooSymbol,
  chartMeta,
  fundamentalsLite,
  crumbCall,
  previousCloseOf,
  getStockQuote,
  getCompanyProfile,
  getHistoricalData,
  getMarketNews,
  getCompanyNews,
  getQuarterlyFinancials,
  searchSymbols,
};

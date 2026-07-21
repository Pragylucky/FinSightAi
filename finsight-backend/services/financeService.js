// services/financeService.js
// All external finance API calls live here
// Using Finnhub (free tier: 60 calls/min) as primary
// Alpha Vantage as fallback for some data
//
// Free API keys:
// Finnhub:       https://finnhub.io  (no credit card needed)
// Alpha Vantage: https://www.alphavantage.co (no credit card needed)

const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const AV_BASE = 'https://www.alphavantage.co/query';

// Simple in-memory cache to avoid hitting rate limits
// Key = 'PRICE:TCS', Value = { data: {...}, expiresAt: timestamp }
const cache = new Map();

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data, ttlSeconds = 60) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

// ── Get real-time stock quote ─────────────────────────────────
// Finnhub: GET /quote?symbol=TCS.NS&token=KEY
// Indian stocks: append .NS for NSE, .BO for BSE
// US stocks: just the symbol (AAPL, TSLA)
const getStockQuote = async (symbol) => {
  const cacheKey = `QUOTE:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Indian NSE stocks use .NS on Yahoo Finance
  // US stocks can be passed without a suffix
  const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA'];

  const yahooSymbol = symbol.includes('.')
    ? symbol
    : usStocks.includes(symbol)
      ? symbol
      : `${symbol}.NS`;

  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
      {
        params: {
          interval: '1d',
          range: '5d',
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const result = response.data?.chart?.result?.[0];

    if (!result) {
      throw new Error('No data returned from Yahoo Finance');
    }

    const meta = result.meta;

    const price =
      meta.regularMarketPrice ??
      meta.chartPreviousClose;

    const prevClose =
      meta.previousClose ??
      meta.chartPreviousClose;

    if (!price) {
      throw new Error('No valid price returned from Yahoo Finance');
    }

    const change = prevClose
      ? price - prevClose
      : 0;

    const changePercent = prevClose
      ? (change / prevClose) * 100
      : 0;

    const data = {
      symbol,
      price,
      change,
      changePercent,
      high: meta.regularMarketDayHigh || price,
      low: meta.regularMarketDayLow || price,
      open: meta.regularMarketOpen || price,
      prevClose,
      currency: meta.currency || 'INR',
      exchange: meta.exchangeName || 'NSE',
      isMock: false,
    };

    console.log(`✅ Yahoo Finance quote fetched for ${yahooSymbol}:`, data);

    setCache(cacheKey, data, 60);

    return data;

  } catch (error) {
    console.error(
      `❌ Yahoo Finance quote error for ${yahooSymbol}:`,
      error.message
    );

    // Keep mock fallback temporarily while developing
    return getMockQuote(symbol);
  }
};

// ── Get company profile ───────────────────────────────────────
const getCompanyProfile = async (symbol) => {
  const cacheKey = `PROFILE:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA'];

  const yahooSymbol = symbol.includes('.')
    ? symbol
    : usStocks.includes(symbol)
      ? symbol
      : `${symbol}.NS`;

  try {
    const result = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: [
        'price',
        'summaryDetail',
        'defaultKeyStatistics',
        'financialData',
        'assetProfile',
      ],
    });

    const price = result.price || {};
    const summary = result.summaryDetail || {};
    const stats = result.defaultKeyStatistics || {};
    const financial = result.financialData || {};
    const profile = result.assetProfile || {};

    const data = {
      symbol,

      // Basic company information
      name: price.longName || price.shortName || symbol,
      sector: profile.sector || 'Unknown',
      industry: profile.industry || 'Unknown',
      website: profile.website || '',
      description: profile.longBusinessSummary || '',
      employees: profile.fullTimeEmployees || 0,

      // Valuation
      marketCap: price.marketCap || 0,
      pe: summary.trailingPE || 0,
      forwardPE: summary.forwardPE || 0,
      pb: stats.priceToBook || 0,
      eps: stats.trailingEps || 0,

      // Financial performance
      roe: financial.returnOnEquity
        ? financial.returnOnEquity * 100
        : 0,

      netMargin: financial.profitMargins
        ? financial.profitMargins * 100
        : 0,

      revenueGrowth: financial.revenueGrowth
        ? financial.revenueGrowth * 100
        : 0,

      debtToEquity: financial.debtToEquity || 0,

      // Dividend
      dividendYield: summary.dividendYield
        ? summary.dividendYield * 100
        : 0,

      // 52-week range
      week52High: summary.fiftyTwoWeekHigh || 0,
      week52Low: summary.fiftyTwoWeekLow || 0,

      // Revenue
      revenue: financial.totalRevenue || 0,

      currency: price.currency || 'INR',
    };

    console.log(
      `✅ Yahoo Finance profile fetched for ${yahooSymbol}:`,
      data
    );

    setCache(cacheKey, data, 3600);

    return data;

  } catch (error) {
    console.error(
      `❌ Yahoo Finance profile error for ${yahooSymbol}:`,
      error.message
    );

    return null;
  }
};

// ── Get historical price data for charts ─────────────────────
// Finnhub candles: /stock/candle?symbol=...&resolution=D&from=...&to=...
const getHistoricalData = async (symbol, days = 30) => {
  const cacheKey = `HISTORY:${symbol}:${days}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // US stocks don't need a suffix.
  // Indian NSE stocks use .NS on Yahoo Finance.
  const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA'];

  const yahooSymbol = symbol.includes('.')
    ? symbol
    : usStocks.includes(symbol)
      ? symbol
      : `${symbol}.NS`;

  // Choose enough Yahoo history for the requested number of days
  let range = '1mo';

  if (days <= 7) {
    range = '5d';
  } else if (days <= 30) {
    range = '1mo';
  } else if (days <= 90) {
    range = '3mo';
  } else if (days <= 180) {
    range = '6mo';
  } else {
    range = '1y';
  }

  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
      {
        params: {
          interval: '1d',
          range,
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const result = response.data?.chart?.result?.[0];

    if (!result) {
      throw new Error('No historical data returned from Yahoo Finance');
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];

    if (!quote || timestamps.length === 0) {
      throw new Error('Invalid historical data returned from Yahoo Finance');
    }

    const data = timestamps
      .map((timestamp, i) => ({
        date: new Date(timestamp * 1000).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        }),
        price: quote.close?.[i],
        open: quote.open?.[i],
        high: quote.high?.[i],
        low: quote.low?.[i],
        volume: quote.volume?.[i],
      }))
      // Yahoo can occasionally return null candles
      .filter(item => item.price != null)
      // Keep approximately the number of days requested
      .slice(-days);

    if (data.length === 0) {
      throw new Error('No valid historical candles found');
    }

    console.log(
      `✅ Yahoo Finance history fetched for ${yahooSymbol}: ${data.length} candles`
    );

    setCache(cacheKey, data, 3600);

    return data;

  } catch (error) {
    console.error(
      `❌ Yahoo Finance historical data error for ${yahooSymbol}:`,
      error.message
    );

    // Temporary fallback during development
    return generateMockHistory(symbol, days);
  }
};

// ── Get financial news ────────────────────────────────────────
const getMarketNews = async (category = 'general') => {
  const cacheKey = `NEWS:${category}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${FINNHUB_BASE}/news`, {
      params: {
        category: 'general',
        token: process.env.FINNHUB_API_KEY,
      },
      timeout: 5000,
    });

    // Keywords used to identify finance/business-related articles
    const financeKeywords = [
      'stock',
      'stocks',
      'market',
      'markets',
      'shares',
      'earnings',
      'revenue',
      'profit',
      'investor',
      'investment',
      'investing',
      'ipo',
      'bank',
      'banking',
      'interest rate',
      'inflation',
      'economy',
      'economic',
      'finance',
      'financial',
      'nifty',
      'sensex',
      'nse',
      'bse',
      'rbi',
      'fed',
      'nasdaq',
      'dow',
      's&p',
      'dividend',
      'valuation',
      'merger',
      'acquisition',
      'quarter',
      'oil price',
      'gold price',
      'currency',
      'forex',
    ];

    const filteredNews = response.data.filter(article => {
      const text = `${article.headline || ''} ${article.summary || ''}`.toLowerCase();

      return financeKeywords.some(keyword =>
        text.includes(keyword.toLowerCase())
      );
    });

    const data = filteredNews.slice(0, 20).map(article => ({
      id: article.id,
      title: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      time: new Date(article.datetime * 1000).toISOString(),
      related: article.related,
      category: article.category,
    }));

    setCache(cacheKey, data, 600);

    return data;
  } catch (error) {
    console.error('News fetch error:', error.message);
    return [];
  }
};;

// ── Get company-specific news ─────────────────────────────────
const getCompanyNews = async (symbol) => {
  const cacheKey = `CNEWS:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const companyNames = {
    TCS: 'Tata Consultancy Services',
    INFY: 'Infosys',
    RELIANCE: 'Reliance Industries',
    HDFCBANK: 'HDFC Bank',
    ICICIBANK: 'ICICI Bank',
    SBIN: 'State Bank of India',
    WIPRO: 'Wipro',
    BAJFINANCE: 'Bajaj Finance',
    LT: 'Larsen & Toubro',

    AAPL: 'Apple',
    MSFT: 'Microsoft',
    GOOGL: 'Alphabet Google',
    TSLA: 'Tesla',
    AMZN: 'Amazon',
    META: 'Meta Platforms',
    NVDA: 'Nvidia',
  };

  // Remove .NS if symbol already contains it
  const cleanSymbol = symbol
    .replace('.NS', '')
    .replace('.BO', '')
    .toUpperCase();

  // Search Yahoo using company name instead of ticker
  const searchQuery = companyNames[cleanSymbol] || cleanSymbol;

  try {
    console.log(
      `🔍 Searching Yahoo Finance news for: ${searchQuery}`
    );

    const result = await yahooFinance.search(searchQuery, {
      newsCount: 20,
      quotesCount: 0,
    });

    const news = result.news || [];

    // Filter results so unrelated Yahoo articles don't appear
    const companyKeywords = searchQuery
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3);

   const filteredNews = news.filter(article => {
  const text = `${article.title || ''} ${article.summary || ''}`.toLowerCase();

  // For TCS, accept either full company name or ticker
  return (
    text.includes(searchQuery.toLowerCase()) ||
    text.includes(cleanSymbol.toLowerCase())
  );
});

   console.log('📰 Yahoo raw news:', news.map(n => n.title));
    console.log('📰 Filtered news:', filteredNews.map(n => n.title));

    const data = filteredNews.slice(0, 10).map((article, index) => ({
  id: article.uuid || `${cleanSymbol}-${index}`,

  title: article.title || 'Untitled',

  summary: article.summary || '',

  source: article.publisher || 'Yahoo Finance',

  url: article.link || '',

  time: article.providerPublishTime
    ? new Date(article.providerPublishTime * 1000).toISOString()
    : new Date().toISOString(),

  thumbnail:
    article.thumbnail?.resolutions?.[0]?.url || '',
}));

    console.log(
      `✅ Yahoo Finance news fetched for ${searchQuery}: ${data.length} relevant articles`
    );

    setCache(cacheKey, data, 600);

    return data;
  } catch (error) {
    console.error(
      `❌ Yahoo Finance news error for ${searchQuery}:`,
      error.message
    );

    return [];
  }
};

// ── Mock data fallbacks ───────────────────────────────────────
// These kick in when the real API fails (rate limit, network, etc.)
// Prevents the frontend from breaking during development

const getMockQuote = (symbol) => {
  const prices = { TCS: 3842, INFY: 1456, RELIANCE: 2891, HDFC: 1678, WIPRO: 456, BAJFIN: 7234 };
  const basePrice = prices[symbol] || 1000;
  const change = (Math.random() - 0.5) * basePrice * 0.03;
  return {
    symbol,
    price: basePrice + change,
    change,
    changePercent: (change / basePrice) * 100,
    high: basePrice * 1.02,
    low: basePrice * 0.98,
    open: basePrice * 0.999,
    prevClose: basePrice,
    isMock: true, // Flag so you know it's not real data
  };
};

const generateMockHistory = (symbol, days) => {
  const prices = { TCS: 3842, INFY: 1456, RELIANCE: 2891, HDFC: 1678 };
  let price = prices[symbol] || 1000;
  const data = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price += (Math.random() - 0.48) * price * 0.02;
    data.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000),
    });
  }
  return data;
};
// ── Get quarterly financial results ───────────────────────────
const getQuarterlyFinancials = async (symbol) => {
  // Convert TCS → TCS.NS for Yahoo Finance
  // If symbol already has .NS/.BO etc., leave it unchanged
  const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  try {
    // Fetch quarterly financial data from Yahoo Finance
    const result = await yahooFinance.fundamentalsTimeSeries(yahooSymbol, {
      period1: new Date(
        Date.now() - 2 * 365 * 24 * 60 * 60 * 1000
      ),
      type: 'quarterly',
      module: 'financials',
    });

    console.log(
      `✅ Quarterly financials fetched for ${yahooSymbol}:`,
      result
    );

    const formattedResults = result
  .slice(-4)
  .reverse()
  .map((item) => ({
    date: item.date,
    revenue: item.totalRevenue || 0,
    netIncome: item.netIncome || 0,
    operatingIncome: item.operatingIncome || 0,
    ebitda: item.EBITDA || 0,
  }));

return formattedResults;
  } catch (error) {
    console.error(
      `❌ Quarterly financials error for ${yahooSymbol}:`,
      error.message
    );

    return [];
  }
};
module.exports = {
  getStockQuote,
  getCompanyProfile,
  getHistoricalData,
  getMarketNews,
  getCompanyNews,
  getQuarterlyFinancials,
  getCompanyProfile,
};
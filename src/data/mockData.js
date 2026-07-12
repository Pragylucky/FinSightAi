// ============================================================
// MOCK DATA — Replace with real API calls when backend is ready
// ============================================================

// --- Market Ticker Stocks ---
export const tickerStocks = [
  { symbol: 'TCS', name: 'TCS', price: 3842.50, change: 1.24 },
  { symbol: 'INFY', name: 'Infosys', price: 1456.80, change: -0.87 },
  { symbol: 'RELIANCE', name: 'Reliance', price: 2891.30, change: 2.15 },
  { symbol: 'HDFC', name: 'HDFC Bank', price: 1678.90, change: 0.56 },
  { symbol: 'WIPRO', name: 'Wipro', price: 456.70, change: -1.23 },
  { symbol: 'BAJFIN', name: 'Bajaj Finance', price: 7234.00, change: 3.12 },
  { symbol: 'ICICI', name: 'ICICI Bank', price: 1023.45, change: 1.78 },
  { symbol: 'SBIN', name: 'SBI', price: 678.90, change: -0.45 },
  { symbol: 'LT', name: 'L&T', price: 3456.20, change: 0.98 },
  { symbol: 'NIFTY50', name: 'Nifty 50', price: 23456.80, change: 0.67 },
  { symbol: 'SENSEX', name: 'SENSEX', price: 76890.30, change: 0.72 },
  { symbol: 'AAPL', name: 'Apple', price: 189.56, change: 1.45 },
  { symbol: 'MSFT', name: 'Microsoft', price: 378.90, change: 0.89 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 143.20, change: -0.56 },
  { symbol: 'TSLA', name: 'Tesla', price: 234.50, change: -2.34 },
];

// --- Top Gainers ---
export const topGainers = [
  { symbol: 'BAJFIN', name: 'Bajaj Finance', price: 7234.00, change: 8.34, volume: '2.3M' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2891.30, change: 5.67, volume: '4.1M' },
  { symbol: 'ADANI', name: 'Adani Enterprises', price: 2456.80, change: 4.89, volume: '1.8M' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life', price: 678.40, change: 3.56, volume: '890K' },
  { symbol: 'PAYTM', name: 'Paytm', price: 456.20, change: 3.12, volume: '3.2M' },
];

// --- Top Losers ---
export const topLosers = [
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.50, change: -6.78, volume: '12.4M' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 456.70, change: -4.23, volume: '2.1M' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', price: 123.40, change: -3.87, volume: '5.6M' },
  { symbol: 'NYKAA', name: 'Nykaa (FSN E-Com)', price: 167.80, change: -3.12, volume: '1.4M' },
  { symbol: 'PBFIN', name: 'PB Fintech', price: 891.30, change: -2.56, volume: '780K' },
];

// --- Portfolio Holdings ---
export const portfolioHoldings = [
  { symbol: 'TCS', name: 'Tata Consultancy', qty: 10, avgPrice: 3600, currentPrice: 3842.50, sector: 'IT' },
  { symbol: 'HDFC', name: 'HDFC Bank', qty: 25, avgPrice: 1580, currentPrice: 1678.90, sector: 'Banking' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 15, avgPrice: 2700, currentPrice: 2891.30, sector: 'Energy' },
  { symbol: 'INFY', name: 'Infosys', qty: 30, avgPrice: 1500, currentPrice: 1456.80, sector: 'IT' },
  { symbol: 'BAJFIN', name: 'Bajaj Finance', qty: 5, avgPrice: 6800, currentPrice: 7234.00, sector: 'Finance' },
  { symbol: 'LT', name: 'L&T', qty: 8, avgPrice: 3200, currentPrice: 3456.20, sector: 'Infrastructure' },
];

// --- Watchlist ---
export const watchlistItems = [
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 143.20, change: -0.56, targetPrice: 160, sector: 'Tech', pe: 24.5, marketCap: '1.8T' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 0.89, targetPrice: 420, sector: 'Tech', pe: 35.2, marketCap: '2.8T' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.56, change: 1.45, targetPrice: 210, sector: 'Tech', pe: 29.1, marketCap: '2.9T' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', price: 123.40, change: -3.87, targetPrice: 150, sector: 'Consumer', pe: 78.3, marketCap: '1.1T' },
  { symbol: 'NAUKRI', name: 'Info Edge India', price: 5678.00, change: 1.23, targetPrice: 6500, sector: 'Tech', pe: 56.7, marketCap: '490B' },
];

// --- News ---
export const newsItems = [
  {
    id: 1,
    title: 'RBI Holds Interest Rates Steady, Signals Possible Cut in Q2 2025',
    summary: 'The Reserve Bank of India maintained its key policy rate, with the MPC voting 4-2 to keep the repo rate at 6.5%, while signaling potential easing if inflation moderates.',
    source: 'Economic Times',
    time: '2 hours ago',
    sentiment: 'neutral',
    sentimentScore: 0.52,
    relatedStocks: ['HDFCBANK', 'SBIN', 'ICICIBANK'],
    category: 'Macro',
    bullishScore: 52,
    bearishScore: 48,
  },
  {
    id: 2,
    title: 'TCS Reports 8.7% YoY Revenue Growth in Q3 FY25, Beats Estimates',
    summary: 'TCS announced strong Q3 FY25 results with revenue of Rs 63,092 crores, up 8.7% YoY. Net profit rose 11.2% to Rs 12,380 crores, beating analyst expectations.',
    source: 'Mint',
    time: '4 hours ago',
    sentiment: 'bullish',
    sentimentScore: 0.78,
    relatedStocks: ['TCS'],
    category: 'Earnings',
    bullishScore: 78,
    bearishScore: 22,
  },
  {
    id: 3,
    title: 'Reliance Jio IPO: Ambani Eyes Rs 2 Trillion Valuation in Landmark Offering',
    summary: 'Reliance Industries is planning to list its telecom arm Jio at a valuation of approximately Rs 2 trillion, which would make it one of the largest IPOs in Indian market history.',
    source: 'Bloomberg',
    time: '6 hours ago',
    sentiment: 'bullish',
    sentimentScore: 0.82,
    relatedStocks: ['RELIANCE'],
    category: 'IPO',
    bullishScore: 82,
    bearishScore: 18,
  },
  {
    id: 4,
    title: 'IT Sector Faces Pressure as US Tech Spending Slows Down',
    summary: 'Indian IT companies may face headwinds as major US enterprises are cutting technology budgets by 12-15% in 2025, potentially impacting deal wins for TCS, Infosys, and Wipro.',
    source: 'Reuters',
    time: '8 hours ago',
    sentiment: 'bearish',
    sentimentScore: 0.25,
    relatedStocks: ['TCS', 'INFY', 'WIPRO', 'HCL'],
    category: 'Sector',
    bullishScore: 25,
    bearishScore: 75,
  },
  {
    id: 5,
    title: 'Zomato Achieves Operational Profitability for Third Consecutive Quarter',
    summary: "Food delivery giant Zomato reported its third straight quarter of operational profitability with EBITDA of Rs 226 crores. The company's Blinkit division grew 95% YoY.",
    source: 'CNBC-TV18',
    time: '10 hours ago',
    sentiment: 'bullish',
    sentimentScore: 0.71,
    relatedStocks: ['ZOMATO'],
    category: 'Earnings',
    bullishScore: 71,
    bearishScore: 29,
  },
  {
    id: 6,
    title: 'FIIs Turn Net Buyers, Infuse Rs 8,240 Crore in Indian Equities',
    summary: 'Foreign Institutional Investors turned net buyers after two months of selling, pumping Rs 8,240 crore into Indian equity markets, signaling renewed confidence.',
    source: 'Financial Express',
    time: '12 hours ago',
    sentiment: 'bullish',
    sentimentScore: 0.75,
    relatedStocks: ['NIFTY50'],
    category: 'FII/DII',
    bullishScore: 75,
    bearishScore: 25,
  },
];

// --- Company Data ---
export const companyData = {
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    description: 'Tata Consultancy Services is a global leader in IT services, consulting and business solutions, with a presence in 55+ countries.',
    price: 3842.50,
    change: 1.24,
    changeAmt: 47.10,
    open: 3810.00,
    high: 3856.70,
    low: 3798.20,
    prevClose: 3795.40,
    volume: '2.3M',
    avgVolume: '1.9M',
    marketCap: 'Rs 14.0 Lakh Cr',
    pe: 28.4,
    pb: 12.6,
    eps: 135.25,
    dividendYield: 1.45,
    week52High: 4255.00,
    week52Low: 3311.00,
    revenue: 'Rs 2,40,893 Cr',
    netProfit: 'Rs 46,099 Cr',
    revenueGrowth: 8.7,
    profitGrowth: 11.2,
    debtToEquity: 0.04,
    roe: 46.8,
    riskScore: 28,
    investmentOutlook: 'Positive',
    aiSummary: "TCS remains the gold standard of Indian IT. With a massive $42B+ deal pipeline, industry-leading margins (24%+), and consistent dividend track record, it's a core holding for long-term investors. The main risk is US tech spending slowdown, but TCS's diversified client base provides resilience. Current valuation at 28x PE looks fair given quality.",
    pros: [
      'Market leader with global diversification across 55+ countries',
      'Industry-best net margin of 24.1% among large-cap IT',
      'Consistent dividend payer — 3.7% yield on cost for 5Y holders',
      'Strong deal wins with $11.2B TCV in recent quarters',
      'Low debt-to-equity ratio of 0.04',
    ],
    cons: [
      'Slowing revenue growth due to US tech budget cuts',
      'High PE of 28x limits upside in near term',
      'Employee attrition remains elevated at 12.5%',
      'Concentration risk: ~52% revenue from Banking & Financial Services',
    ],
  },
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Retail',
    industry: 'Conglomerate',
    description: "Reliance Industries is India's largest company by market cap, with business spanning petrochemicals, retail, telecom (Jio), and media.",
    price: 2891.30,
    change: 2.15,
    changeAmt: 61.10,
    open: 2845.00,
    high: 2904.50,
    low: 2838.60,
    prevClose: 2830.20,
    volume: '4.1M',
    avgVolume: '3.8M',
    marketCap: 'Rs 19.5 Lakh Cr',
    pe: 24.8,
    pb: 2.45,
    eps: 116.58,
    dividendYield: 0.34,
    week52High: 3024.90,
    week52Low: 2220.30,
    revenue: 'Rs 9,09,029 Cr',
    netProfit: 'Rs 79,020 Cr',
    revenueGrowth: 6.2,
    profitGrowth: 7.4,
    debtToEquity: 0.34,
    roe: 10.2,
    riskScore: 35,
    investmentOutlook: 'Positive',
    aiSummary: 'Reliance is a diversified behemoth with three massive growth engines — Jio (telecom), retail, and O2C (oil-to-chemicals). The upcoming Jio IPO could unlock significant value for shareholders. New Energy bets position it for the next decade.',
    pros: [
      'Three massive businesses: Jio, Retail, O2C each worth $50B+',
      'Jio IPO could unlock Rs 2T+ in shareholder value',
      "India's #1 retailer by revenue with 18,000+ stores",
      'Strong balance sheet cleanup — net debt reduced significantly',
    ],
    cons: [
      'Conglomerate discount — complex to value accurately',
      'Low dividend yield of 0.34% for income investors',
      'O2C business exposed to volatile crude oil prices',
      'Regulatory risks across multiple business segments',
    ],
  },
  INFY: {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    description: 'Infosys is a global leader in next-generation digital services and consulting with operations in 56 countries.',
    price: 1456.80,
    change: -0.87,
    changeAmt: -12.75,
    open: 1472.00,
    high: 1478.50,
    low: 1448.30,
    prevClose: 1469.55,
    volume: '3.1M',
    avgVolume: '2.8M',
    marketCap: 'Rs 6.05 Lakh Cr',
    pe: 23.6,
    pb: 7.8,
    eps: 61.73,
    dividendYield: 2.34,
    week52High: 1768.00,
    week52Low: 1307.00,
    revenue: 'Rs 1,53,670 Cr',
    netProfit: 'Rs 26,248 Cr',
    revenueGrowth: 4.2,
    profitGrowth: 9.1,
    debtToEquity: 0.08,
    roe: 32.4,
    riskScore: 32,
    investmentOutlook: 'Neutral',
    aiSummary: "Infosys is a solid, well-governed IT company with strong digital capabilities. Revenue growth has lagged TCS, but margins are improving. The Cobalt cloud strategy and AI-driven cost efficiency are key positives. Higher dividend yield than peers makes it attractive for income investors.",
    pros: [
      'High dividend yield of 2.34% vs peers',
      'Strong AI and cloud transformation capabilities',
      'Better margin trajectory than mid-tier IT peers',
      'Clean governance with strong ESG credentials',
    ],
    cons: [
      'Revenue growth lagging industry leader TCS',
      'Client concentration in financial services',
      'Cautious FY25 guidance of 1-3% growth',
    ],
  },
};

// --- Stock Chart Data Generator ---
export const generateStockChartData = (basePrice = 3800, days = 30) => {
  const data = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * (basePrice * 0.025);
    price = Math.max(price + change, basePrice * 0.7);
    data.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 3000000 + 1000000),
    });
  }
  return data;
};

// --- Portfolio Sector Allocation ---
export const portfolioAllocation = [
  { name: 'IT', value: 35, color: '#00D4FF' },
  { name: 'Banking', value: 28, color: '#7B61FF' },
  { name: 'Energy', value: 20, color: '#00E676' },
  { name: 'Infrastructure', value: 10, color: '#FFB800' },
  { name: 'Finance', value: 7, color: '#FF3B5C' },
];

// --- Portfolio Performance History ---
export const generatePortfolioHistory = () => {
  const data = [];
  let value = 720000;
  const now = new Date();
  for (let i = 180; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.46) * 8000;
    value = Math.max(value + change, 650000);
    if (i % 5 === 0) {
      data.push({
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        value: parseFloat(value.toFixed(0)),
      });
    }
  }
  return data;
};

// --- Mutual Funds ---
export const mutualFunds = [
  {
    id: 1,
    name: 'Mirae Asset Large Cap Fund',
    category: 'Large Cap',
    amc: 'Mirae Asset',
    nav: 102.45,
    returns1Y: 18.4,
    returns3Y: 14.2,
    returns5Y: 16.8,
    expenseRatio: 0.54,
    aum: 'Rs 35,240 Cr',
    riskLevel: 'Moderate',
    rating: 5,
    minSip: 1000,
  },
  {
    id: 2,
    name: 'Parag Parikh Flexi Cap Fund',
    category: 'Flexi Cap',
    amc: 'PPFAS',
    nav: 78.92,
    returns1Y: 22.6,
    returns3Y: 19.4,
    returns5Y: 21.2,
    expenseRatio: 0.62,
    aum: 'Rs 72,890 Cr',
    riskLevel: 'Moderate High',
    rating: 5,
    minSip: 1000,
  },
  {
    id: 3,
    name: 'Axis Small Cap Fund',
    category: 'Small Cap',
    amc: 'Axis MF',
    nav: 89.34,
    returns1Y: 31.2,
    returns3Y: 24.7,
    returns5Y: 28.9,
    expenseRatio: 0.76,
    aum: 'Rs 18,450 Cr',
    riskLevel: 'High',
    rating: 4,
    minSip: 500,
  },
  {
    id: 4,
    name: 'SBI Nifty Index Fund',
    category: 'Index Fund',
    amc: 'SBI MF',
    nav: 189.67,
    returns1Y: 14.8,
    returns3Y: 13.1,
    returns5Y: 15.4,
    expenseRatio: 0.20,
    aum: 'Rs 8,920 Cr',
    riskLevel: 'Moderate',
    rating: 4,
    minSip: 500,
  },
  {
    id: 5,
    name: 'Nippon India Liquid Fund',
    category: 'Liquid',
    amc: 'Nippon',
    nav: 5489.23,
    returns1Y: 7.2,
    returns3Y: 6.8,
    returns5Y: 6.4,
    expenseRatio: 0.19,
    aum: 'Rs 26,340 Cr',
    riskLevel: 'Low',
    rating: 5,
    minSip: 1000,
  },
  {
    id: 6,
    name: 'Quant Active Fund',
    category: 'Multi Cap',
    amc: 'Quant MF',
    nav: 567.89,
    returns1Y: 38.4,
    returns3Y: 35.2,
    returns5Y: 40.1,
    expenseRatio: 0.58,
    aum: 'Rs 9,870 Cr',
    riskLevel: 'Very High',
    rating: 4,
    minSip: 1000,
  },
];

// --- Screener Stocks ---
export const screenerStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', marketCap: 1950000, pe: 24.8, roe: 10.2, debtEq: 0.34, div: 0.34, high52W: 3024, low52W: 2220, revenueGrowth: 6.2, price: 2891 },
  { symbol: 'TCS', name: 'TCS', sector: 'IT', marketCap: 1400000, pe: 28.4, roe: 46.8, debtEq: 0.04, div: 1.45, high52W: 4255, low52W: 3311, revenueGrowth: 8.7, price: 3842 },
  { symbol: 'HDFC', name: 'HDFC Bank', sector: 'Banking', marketCap: 1250000, pe: 18.7, roe: 16.2, debtEq: 7.8, div: 1.12, high52W: 1880, low52W: 1363, revenueGrowth: 21.4, price: 1678 },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', marketCap: 600000, pe: 23.6, roe: 32.4, debtEq: 0.08, div: 2.34, high52W: 1768, low52W: 1307, revenueGrowth: 4.2, price: 1456 },
  { symbol: 'ICICI', name: 'ICICI Bank', sector: 'Banking', marketCap: 720000, pe: 16.8, roe: 18.9, debtEq: 6.2, div: 0.78, high52W: 1196, low52W: 822, revenueGrowth: 24.6, price: 1023 },
  { symbol: 'BAJFIN', name: 'Bajaj Finance', sector: 'Finance', marketCap: 450000, pe: 32.4, roe: 22.6, debtEq: 3.45, div: 0.11, high52W: 8192, low52W: 6187, revenueGrowth: 28.4, price: 7234 },
  { symbol: 'LT', name: 'L&T', sector: 'Infrastructure', marketCap: 480000, pe: 34.2, roe: 14.8, debtEq: 1.23, div: 1.04, high52W: 3900, low52W: 2600, revenueGrowth: 15.6, price: 3456 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', marketCap: 390000, pe: 21.8, roe: 24.6, debtEq: 0.02, div: 3.45, high52W: 1890, low52W: 1215, revenueGrowth: 7.8, price: 1620 },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'IT', marketCap: 240000, pe: 20.4, roe: 17.8, debtEq: 0.06, div: 0.56, high52W: 563, low52W: 374, revenueGrowth: 3.2, price: 456 },
  { symbol: 'ASIAN', name: 'Asian Paints', sector: 'Consumer', marketCap: 280000, pe: 56.7, roe: 31.4, debtEq: 0.01, div: 1.23, high52W: 3588, low52W: 2500, revenueGrowth: 8.4, price: 2987 },
];

// --- Finance Dictionary ---
export const financeDictionary = [
  {
    term: 'PE Ratio',
    short: 'Price-to-Earnings',
    definition: "A valuation metric that compares a company's stock price to its earnings per share. A PE of 20 means you're paying Rs 20 for every Rs 1 of earnings.",
    example: 'TCS at PE 28 means investors pay Rs 28 for every Rs 1 of TCS profit.',
  },
  {
    term: 'EBITDA',
    short: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
    definition: "A measure of a company's core profitability before accounting for capital structure, taxes, and non-cash charges. Good for comparing companies across industries.",
    example: 'If TCS has EBITDA of Rs 50,000 Cr, it earned Rs 50,000 Cr from core operations before debt costs.',
  },
  {
    term: 'Market Cap',
    short: 'Market Capitalization',
    definition: 'Total market value of a company = Share Price x Total Shares Outstanding. Classifies companies as Large Cap (>Rs 20,000 Cr), Mid Cap, or Small Cap (<Rs 5,000 Cr).',
    example: 'TCS price Rs 3842 x 366 Cr shares = Rs 14 Lakh Crore market cap.',
  },
  {
    term: 'ROE',
    short: 'Return on Equity',
    definition: "Measures how efficiently a company uses shareholders' money to generate profit. ROE = Net Profit / Shareholders Equity. Higher is better.",
    example: "TCS ROE of 46% means for every Rs 100 of equity, it generates Rs 46 in profit.",
  },
  {
    term: 'PB Ratio',
    short: 'Price-to-Book',
    definition: 'Compares stock price to book value (assets minus liabilities). PB < 1 may indicate undervaluation; PB > 1 means market values the company above its net assets.',
    example: 'HDFC Bank PB of 3.2 means investors pay 3.2x its book value.',
  },
  {
    term: 'Dividend Yield',
    short: 'Annual Dividends / Stock Price',
    definition: 'Annual dividend as a percentage of current stock price. Shows income return from holding a stock, separate from price appreciation.',
    example: 'TCS yield of 1.45% means if you hold Rs 1 lakh of TCS, you get Rs 1,450/year in dividends.',
  },
  {
    term: 'FII/FPI',
    short: 'Foreign Institutional Investors',
    definition: 'Foreign entities (mutual funds, pension funds, hedge funds) investing in Indian markets. Their buying/selling heavily influences index direction.',
    example: 'When FIIs sell Rs 10,000 Cr of Indian stocks, it can cause markets to fall 1-2%.',
  },
  {
    term: 'NAV',
    short: 'Net Asset Value',
    definition: 'Price of one unit of a mutual fund = (Total Assets - Liabilities) / Number of Units. Mutual fund equivalent of a stock price.',
    example: 'Mirae Large Cap NAV of Rs 102 means one unit costs Rs 102 today.',
  },
  {
    term: 'SIP',
    short: 'Systematic Investment Plan',
    definition: 'A method of investing a fixed amount in a mutual fund at regular intervals (usually monthly). Helps in rupee-cost averaging and building wealth over time.',
    example: 'Investing Rs 5,000/month in a flexi-cap fund for 10 years at 15% returns grows to ~Rs 13.9 lakhs.',
  },
  {
    term: 'Debt-to-Equity',
    short: 'D/E Ratio',
    definition: "Measures how much debt a company uses relative to shareholder equity. Lower is generally better for non-financial companies. D/E = Total Debt / Shareholders' Equity.",
    example: 'TCS D/E of 0.04 means barely any debt — very healthy. A bank at D/E 7 is normal for their business model.',
  },
];

// --- Chat Suggestions ---
export const chatSuggestions = [
  "Should I invest in TCS right now?",
  "Explain Tesla's earnings report",
  "What is EBITDA in simple terms?",
  "Compare Infosys vs Wipro",
  "What happened to Zomato stock today?",
  "Is Bajaj Finance overvalued?",
  "Explain the difference between large cap and small cap funds",
  "What does a PE ratio of 28 mean?",
];

// --- Dashboard Stats ---
export const dashboardStats = {
  portfolioValue: 847235,
  portfolioChange: 3.24,
  portfolioChangeAmt: 26580,
  totalInvested: 812000,
  totalPL: 35235,
  totalPLPercent: 4.34,
  watchlistCount: 5,
  alertsCount: 2,
  nifty50: { value: 23456.80, change: 0.67 },
  sensex: { value: 76890.30, change: 0.72 },
  gold: { value: 71234, change: -0.23 },
  dollarInr: { value: 84.23, change: 0.12 },
};

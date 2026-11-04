// Sample data. The backend has no market-movers or index feed yet, so the
// dashboard's "Top movers" and index cards read from here and are labelled
// "Sample data" in the UI. Chat suggestions are static prompts.

export const topGainers = [
  { symbol: 'BAJFIN', name: 'Bajaj Finance', price: 7234.00, change: 8.34, volume: '2.3M' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2891.30, change: 5.67, volume: '4.1M' },
  { symbol: 'ADANI', name: 'Adani Enterprises', price: 2456.80, change: 4.89, volume: '1.8M' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life', price: 678.40, change: 3.56, volume: '890K' },
  { symbol: 'PAYTM', name: 'Paytm', price: 456.20, change: 3.12, volume: '3.2M' },
];

export const topLosers = [
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.50, change: -6.78, volume: '12.4M' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 456.70, change: -4.23, volume: '2.1M' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', price: 123.40, change: -3.87, volume: '5.6M' },
  { symbol: 'NYKAA', name: 'Nykaa (FSN E-Com)', price: 167.80, change: -3.12, volume: '1.4M' },
  { symbol: 'PBFIN', name: 'PB Fintech', price: 891.30, change: -2.56, volume: '780K' },
];

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

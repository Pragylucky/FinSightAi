// data/screenerData.js
// Curated stock universe for the FinSight screener.
// Financial metrics are fetched dynamically from Yahoo Finance.

const screenerStocks = [
  {
    symbol: 'RELIANCE',
    yahooSymbol: 'RELIANCE.NS',
    name: 'Reliance Industries',
    sector: 'Energy',
  },
  {
    symbol: 'TCS',
    yahooSymbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    sector: 'IT',
  },
  {
    symbol: 'HDFCBANK',
    yahooSymbol: 'HDFCBANK.NS',
    name: 'HDFC Bank',
    sector: 'Banking',
  },
  {
    symbol: 'INFY',
    yahooSymbol: 'INFY.NS',
    name: 'Infosys',
    sector: 'IT',
  },
  {
    symbol: 'ICICIBANK',
    yahooSymbol: 'ICICIBANK.NS',
    name: 'ICICI Bank',
    sector: 'Banking',
  },
  {
    symbol: 'BAJFINANCE',
    yahooSymbol: 'BAJFINANCE.NS',
    name: 'Bajaj Finance',
    sector: 'Finance',
  },
  {
    symbol: 'LT',
    yahooSymbol: 'LT.NS',
    name: 'Larsen & Toubro',
    sector: 'Infrastructure',
  },
  {
    symbol: 'HCLTECH',
    yahooSymbol: 'HCLTECH.NS',
    name: 'HCL Technologies',
    sector: 'IT',
  },
  {
    symbol: 'WIPRO',
    yahooSymbol: 'WIPRO.NS',
    name: 'Wipro',
    sector: 'IT',
  },
  {
    symbol: 'ASIANPAINT',
    yahooSymbol: 'ASIANPAINT.NS',
    name: 'Asian Paints',
    sector: 'Consumer',
  },
  {
    symbol: 'ETERNAL',
    yahooSymbol: 'ETERNAL.NS',
    name: 'Eternal',
    sector: 'Consumer',
  },
  {
    symbol: 'NAUKRI',
    yahooSymbol: 'NAUKRI.NS',
    name: 'Info Edge India',
    sector: 'Technology',
  },
  {
    symbol: 'PAYTM',
    yahooSymbol: 'PAYTM.NS',
    name: 'One97 Communications',
    sector: 'Fintech',
  },
  {
    symbol: 'ADANIENT',
    yahooSymbol: 'ADANIENT.NS',
    name: 'Adani Enterprises',
    sector: 'Conglomerate',
  },
  {
    symbol: 'SBIN',
    yahooSymbol: 'SBIN.NS',
    name: 'State Bank of India',
    sector: 'Banking',
  },
];

module.exports = { screenerStocks };
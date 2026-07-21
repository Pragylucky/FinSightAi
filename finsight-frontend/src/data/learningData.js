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

export const investmentBasics = [
  {
    id: 'stocks',
    title: 'What is a Stock?',
    description:
      'A stock represents partial ownership in a company. When you buy shares, you become a shareholder and can benefit if the company grows in value.',
    keyPoint:
      'Stocks can generate returns through price appreciation and dividends.',
  },
  {
    id: 'mutual-funds',
    title: 'What is a Mutual Fund?',
    description:
      'A mutual fund pools money from many investors and invests it across assets such as stocks or bonds. The portfolio is managed according to the fund’s investment objective.',
    keyPoint:
      'Mutual funds can provide diversification without requiring you to select every investment individually.',
  },
  {
    id: 'sip',
    title: 'SIP vs Lump Sum',
    description:
      'A Systematic Investment Plan (SIP) lets you invest a fixed amount regularly, while lump-sum investing means investing a larger amount at once.',
    keyPoint:
      'SIPs encourage disciplined investing and reduce the need to time the market.',
  },
  {
    id: 'risk-return',
    title: 'Risk vs Return',
    description:
      'Investments with higher potential returns generally involve higher levels of risk. Your investment choices should reflect your goals, time horizon, and ability to tolerate losses.',
    keyPoint:
      'Higher potential return usually comes with higher uncertainty.',
  },
  {
    id: 'diversification',
    title: 'Diversification',
    description:
      'Diversification means spreading investments across different companies, sectors, or asset classes instead of concentrating everything in one investment.',
    keyPoint:
      'Diversification can reduce concentration risk, but it cannot eliminate market risk.',
  },
  {
    id: 'fundamental-analysis',
    title: 'Fundamental Analysis',
    description:
      'Fundamental analysis evaluates a company using factors such as revenue, profit, debt, growth, valuation ratios, and business quality.',
    keyPoint:
      'Metrics such as PE, ROE, EPS, revenue growth, and debt-to-equity can help evaluate a company.',
  },
];
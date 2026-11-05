// controllers/portfolioController.js
// All portfolio operations: get, add holding, remove holding, update

const Portfolio = require('../models/Portfolio');
const { getStockQuote, getCompanyProfile } = require('../services/financeService');
const { AppError } = require('../middleware/errorHandler');

// ── GET /api/portfolio ────────────────────────────────────────
// Get user's portfolio with live prices fetched for each holding
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });

    if (!portfolio) {
      return next(new AppError('Portfolio not found', 404));
    }

    // US holdings are priced in dollars: convert to rupees for the totals (rows keep their own currency)
    const needsFx = portfolio.holdings.some((h) => h.exchange === 'NYSE' || h.exchange === 'NASDAQ');
    let usdInr = null;
    if (needsFx) {
      try { usdInr = (await getStockQuote('INR=X')).price; } catch { /* totals fall back to unconverted below */ }
    }

    // Fetch live prices for all holdings in parallel
    const holdingsWithPrices = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const foreign = holding.exchange === 'NYSE' || holding.exchange === 'NASDAQ';
        const currency = foreign ? 'USD' : 'INR';
        const fxRate = foreign ? (usdInr || 1) : 1;
        const base = { ...holding.toObject(), currency, fxRate };
        try {
          const quote = await getStockQuote(holding.symbol);
          const currentPrice = quote.price;
          const invested = holding.quantity * holding.averagePrice;
          const current = holding.quantity * currentPrice;
          const pl = current - invested;
          const plPercent = invested ? (pl / invested) * 100 : 0;

          return {
            ...base,
            currentPrice,
            currentValue: current,
            pl,
            plPercent,
            todayChange: quote.changePercent,
            investedInr: invested * fxRate,
            valueInr: current * fxRate,
          };
        } catch (e) {
          // If price fetch fails, show the buy price and flag it
          const invested = holding.quantity * holding.averagePrice;
          return { ...base, currentPrice: holding.averagePrice, currentValue: invested, pl: 0, plPercent: 0, investedInr: invested * fxRate, valueInr: invested * fxRate, error: 'Price unavailable' };
        }
      })
    );

    // Totals are always in rupees
    const totalInvested = holdingsWithPrices.reduce((acc, h) => acc + h.investedInr, 0);
    const totalCurrent = holdingsWithPrices.reduce((acc, h) => acc + h.valueInr, 0);
    const totalPL = totalCurrent - totalInvested;
    const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    res.json({
      success: true,
      portfolio: {
        ...portfolio.toObject(),
        holdings: holdingsWithPrices,
        summary: {
          totalInvested,
          totalCurrent,
          totalPL,
          totalPLPercent,
          holdingsCount: portfolio.holdings.length,
          usdInr: needsFx ? usdInr : null,
          currency: 'INR',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/portfolio/holdings ──────────────────────────────
// Add a new stock holding to portfolio
// Body: { symbol, name, quantity, averagePrice, sector, exchange }
const addHolding = async (req, res, next) => {
  try {
    const { symbol, name, sector: givenSector, exchange, notes } = req.body;
    const quantity = Number(req.body.quantity);
    const averagePrice = Number(req.body.averagePrice);

    if (!symbol || !name) {
      return next(new AppError('Pick a stock from the search results first', 400));
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1e9) {
      return next(new AppError('Quantity must be a positive number', 400));
    }
    if (!Number.isFinite(averagePrice) || averagePrice <= 0 || averagePrice > 1e9) {
      return next(new AppError('Buy price must be a positive number', 400));
    }

    // Stocks found only through search have no sector: look it up so allocation charts are meaningful
    let sector = givenSector;
    if (!sector || sector === 'Unknown') {
      sector = (await getCompanyProfile(symbol.toUpperCase()).catch(() => null))?.sector || 'Other';
    }

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    // Check if this stock is already in the portfolio
    const existingIndex = portfolio.holdings.findIndex(
      h => h.symbol === symbol.toUpperCase()
    );

    if (existingIndex !== -1) {
      // Stock already exists — recalculate average price (weighted average)
      // Formula: (existingQty * existingAvg + newQty * newPrice) / (existingQty + newQty)
      const existing = portfolio.holdings[existingIndex];
      const totalQty = existing.quantity + quantity;
      const newAvgPrice = (existing.quantity * existing.averagePrice + quantity * averagePrice) / totalQty;

      portfolio.holdings[existingIndex].quantity = totalQty;
      portfolio.holdings[existingIndex].averagePrice = newAvgPrice;
    } else {
      // New stock — add to holdings array
      portfolio.holdings.push({
        symbol: symbol.toUpperCase(),
        name,
        quantity,
        averagePrice,
        sector: sector || 'Unknown',
        exchange: exchange || 'NSE',
        notes,
      });
    }

    // Update total invested
    portfolio.totalInvested = portfolio.holdings.reduce(
      (acc, h) => acc + h.quantity * h.averagePrice, 0
    );

    await portfolio.save();

    res.status(201).json({
      success: true,
      message: 'Holding added successfully',
      portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/portfolio/holdings/:symbol ───────────────────────
// Update a holding (sell some shares, add notes, etc.)
const updateHolding = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { quantity, averagePrice, notes } = req.body;
    const bad = (v) => v !== undefined && (!Number.isFinite(Number(v)) || Number(v) <= 0);
    if (bad(quantity) || bad(averagePrice)) {
      return next(new AppError('Quantity and buy price must be positive numbers', 400));
    }

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const holdingIndex = portfolio.holdings.findIndex(
      h => h.symbol === symbol.toUpperCase()
    );

    if (holdingIndex === -1) {
      return next(new AppError(`${symbol} not found in your portfolio`, 404));
    }

    if (quantity !== undefined) portfolio.holdings[holdingIndex].quantity = Number(quantity);
    if (averagePrice !== undefined) portfolio.holdings[holdingIndex].averagePrice = Number(averagePrice);
    if (notes !== undefined) portfolio.holdings[holdingIndex].notes = notes;

    portfolio.totalInvested = portfolio.holdings.reduce((acc, h) => acc + h.quantity * h.averagePrice, 0);
    await portfolio.save();
    res.json({ success: true, message: 'Holding updated', portfolio });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/portfolio/holdings/:symbol ────────────────────
// Remove a stock from portfolio (sold completely)
const removeHolding = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const before = portfolio.holdings.length;
    portfolio.holdings = portfolio.holdings.filter(
      h => h.symbol !== symbol.toUpperCase()
    );

    if (portfolio.holdings.length === before) {
      return next(new AppError(`${symbol} not found in your portfolio`, 404));
    }

    portfolio.totalInvested = portfolio.holdings.reduce(
      (acc, h) => acc + h.quantity * h.averagePrice, 0
    );

    await portfolio.save();
    res.json({ success: true, message: `${symbol} removed from portfolio` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPortfolio, addHolding, updateHolding, removeHolding };

// controllers/watchlistController.js

const Watchlist = require('../models/Watchlist');
const { getStockQuote } = require('../services/financeService');
const { AppError } = require('../middleware/errorHandler');

// ── GET /api/watchlist ────────────────────────────────────────
const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) return next(new AppError('Watchlist not found', 404));

    // Enrich with live prices
    const stocksWithPrices = await Promise.all(
      watchlist.stocks.map(async (stock) => {
        try {
          const quote = await getStockQuote(stock.symbol);
          return {
            ...stock.toObject(),
            currentPrice: quote.price,
            change: quote.changePercent,
            // Calculate upside to target
            upsideToTarget: stock.targetPrice
              ? ((stock.targetPrice / quote.price - 1) * 100).toFixed(2)
              : null,
          };
        } catch {
          return stock.toObject();
        }
      })
    );

    res.json({ success: true, watchlist: { ...watchlist.toObject(), stocks: stocksWithPrices } });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/watchlist ───────────────────────────────────────
// Body: { symbol, name, targetPrice, notes }
const addToWatchlist = async (req, res, next) => {
  try {
    const { symbol, name, targetPrice, notes, exchange } = req.body;
    if (!symbol || !name) return next(new AppError('Symbol and name are required', 400));

    const watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) return next(new AppError('Watchlist not found', 404));

    // Prevent duplicates
    const exists = watchlist.stocks.some(s => s.symbol === symbol.toUpperCase());
    if (exists) return next(new AppError(`${symbol} is already in your watchlist`, 400));

    watchlist.stocks.push({
      symbol: symbol.toUpperCase(),
      name,
      targetPrice,
      notes,
      exchange: exchange || 'NSE',
    });
    await watchlist.save();

    res.status(201).json({ success: true, message: `${symbol} added to watchlist`, watchlist });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/watchlist/:symbol ────────────────────────────────
const updateWatchlistItem = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { targetPrice, notes, alerts } = req.body;

    const watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) return next(new AppError('Watchlist not found', 404));

    const itemIndex = watchlist.stocks.findIndex(s => s.symbol === symbol.toUpperCase());
    if (itemIndex === -1) return next(new AppError(`${symbol} not in watchlist`, 404));

    if (targetPrice !== undefined) watchlist.stocks[itemIndex].targetPrice = targetPrice;
    if (notes !== undefined) watchlist.stocks[itemIndex].notes = notes;
    if (alerts !== undefined) watchlist.stocks[itemIndex].alerts = alerts;

    await watchlist.save();
    res.json({ success: true, message: 'Watchlist updated' });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/watchlist/:symbol ────────────────────────────
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) return next(new AppError('Watchlist not found', 404));

    watchlist.stocks = watchlist.stocks.filter(s => s.symbol !== symbol.toUpperCase());
    await watchlist.save();
    res.json({ success: true, message: `${symbol} removed from watchlist` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist };

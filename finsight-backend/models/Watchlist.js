// models/Watchlist.js
// Stocks a user wants to track without owning

const mongoose = require('mongoose');


const watchlistItemSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  exchange: {
    type: String,
    default: 'NSE',
  },
  sector: String,

  // User-set target price for alerts
  targetPrice: {
    type: Number,
    min: 0,
  },

  // User notes: "Wait for dip below 3500"
  notes: String,

  // Alert preferences for this stock
  alerts: {
    priceAbove: Number,   // Alert when price goes above this
    priceBelow: Number,   // Alert when price drops below this
    percentChange: Number, // Alert on % move
    enabled: { type: Boolean, default: false },
  },

  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stocks: [watchlistItemSchema],
},
{ timestamps: true });

watchlistSchema.index({ user: 1 });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
module.exports = Watchlist;

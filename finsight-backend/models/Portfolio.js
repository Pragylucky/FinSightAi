// models/Portfolio.js
// A user can have one portfolio with multiple holdings
// Each holding = one stock they own

const mongoose = require('mongoose');

// Sub-document schema for individual holdings
// (embedded inside Portfolio, not a separate collection)
const holdingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,  // TCS, INFY, RELIANCE etc.
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  exchange: {
    type: String,
    enum: ['NSE', 'BSE', 'NYSE', 'NASDAQ'],
    default: 'NSE',
  },
  sector: String,

  // How many shares they bought
  quantity: {
    type: Number,
    required: true,
    min: [0.001, 'Quantity must be positive'], // support fractional shares
  },

  // Average buying price (if they bought multiple times)
  averagePrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },

  // When they first bought this stock
  dateAdded: {
    type: Date,
    default: Date.now,
  },

  // Notes (e.g., "Bought for long term, target 20% gain")
  notes: String,
},
{
  // Virtual properties (computed, not stored in DB)
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: total invested in this holding
// virtuals are calculated on the fly — not stored in DB
holdingSchema.virtual('totalInvested').get(function () {
  return this.quantity * this.averagePrice;
});

// Main Portfolio schema
const portfolioSchema = new mongoose.Schema({
  // Reference to the User who owns this portfolio
  // ObjectId = MongoDB's unique identifier type
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',      // 'ref' enables mongoose .populate() to fetch the User
    required: true,
    unique: true,     // One portfolio per user (you can remove this for multiple portfolios)
  },

  name: {
    type: String,
    default: 'My Portfolio',
    maxlength: 50,
  },

  // Array of holdings (the sub-documents above)
  holdings: [holdingSchema],

  // Cached total value (updated periodically, not in real time)
  totalInvested: {
    type: Number,
    default: 0,
  },

  // Description / notes for the whole portfolio
  description: String,
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for faster queries — we'll frequently look up by user
portfolioSchema.index({ user: 1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;

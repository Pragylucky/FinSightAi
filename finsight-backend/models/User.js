// models/User.js
// Mongoose schema = shape of documents in MongoDB
// Think of it like a class/blueprint for User objects

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,             // removes leading/trailing spaces
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,           // creates a unique index in MongoDB
    lowercase: true,        // stored as lowercase always
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,          // NEVER returned in queries by default — must explicitly ask for it
  },

  role: {
    type: String,
    enum: ['user', 'admin'],  // only these two values allowed
    default: 'user',
  },

  // Email verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiry: Date,

  // Password reset
  passwordResetToken: String,
  passwordResetExpiry: Date,

  // Profile
  avatar: {
    type: String,
    default: '',
  },

  // User preferences (saved for personalization)
  preferences: {
    currency: { type: String, default: 'INR' },
    theme: { type: String, default: 'dark' },
    defaultMarket: { type: String, default: 'NSE' },
  },

  // Track last login
  lastLogin: {
    type: Date,
    default: Date.now,
  },

  // Soft delete — instead of actually deleting, we mark as inactive
  isActive: {
    type: Boolean,
    default: true,
  },
},
{
  // Automatically adds createdAt and updatedAt timestamps
  timestamps: true,
});

// ── Pre-save hook ─────────────────────────────────────────────
// Runs BEFORE saving to database
// Hashes password if it was modified (also catches first save = creation)
userSchema.pre('save', async function (next) {
  // Only hash if password was actually changed (not other updates like name)
  if (!this.isModified('password')) return next();

  // bcrypt.hash(password, saltRounds)
  // saltRounds = 12 means 2^12 = 4096 iterations — good balance of security vs speed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────
// Methods available on individual user documents

// Compare entered password with hashed one in DB
// Usage: const isMatch = await user.comparePassword('enteredPassword')
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare handles the hashing internally
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and return a JWT access token
userSchema.methods.generateAccessToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, role: this.role },   // payload — what we store in the token
    process.env.JWT_SECRET,              // secret key
    { expiresIn: process.env.JWT_EXPIRE || '15m' } // short-lived for security
  );
};

// Create and return a JWT refresh token (longer lived)
userSchema.methods.generateRefreshToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// controllers/authController.js
// Handles all authentication: register, login, logout, refresh token
//
// Pattern: Controller function → validate → do DB work → send response
// We use try/catch + next(error) to send errors to globalErrorHandler

const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { sendVerificationEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// ── Helper: Send tokens in response ──────────────────────────
// Access token → in JSON response body (stored in memory / localStorage on frontend)
// Refresh token → in httpOnly cookie (can't be accessed by JS, more secure)
const sendTokens = (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // httpOnly cookie — JS can't read this, only browser sends it automatically
  // This is more secure than storing refresh token in localStorage
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    accessToken,  // frontend stores this and sends with every request
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
  });
};

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    // Create verification token (random hex string)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user — password gets hashed in User model's pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiry,
    });
  

    // Also create empty portfolio and watchlist for the user
    const Portfolio = require('../models/Portfolio');
    const Watchlist = require('../models/Watchlist');
    await Portfolio.create({ user: user._id });
    await Watchlist.create({ user: user._id });

    // Send verification email (don't block response if it fails)
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        requiresVerification: true,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // .select('+password') overrides the select: false in the model
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if account is active (soft delete check)
    if (!user.isActive) {
      return next(new AppError('Account has been deactivated. Contact support.', 401));
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password', 401));
    }
    // Require email verification before allowing login
        if (!user.isVerified) {
          return next(
            new AppError(
              'Please verify your email address before logging in.',
              403
            )
          );
        }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false }); // skip full validation for this update

    sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────
// Gets new access token using the refresh token from cookie
// Called automatically by frontend when access token expires
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.cookies;
    if (!token) {
      return next(new AppError('No refresh token. Please log in again.', 401));
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('User not found. Please log in again.', 401));
    }

    // Issue new access token only
    const accessToken = user.generateAccessToken();
    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
const logout = (req, res) => {
  // Clear the refresh token cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiry to past = delete cookie
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── GET /api/auth/me ──────────────────────────────────────────
// Returns current logged-in user's info
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/verify/:token ───────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    console.log("========= VERIFY EMAIL =========");
    console.log("TOKEN FROM URL:", token);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }, // token not expired
    });
    console.log("FOUND USER:", user ? user.email : "NO USER FOUND");
    console.log("================================");

    if (!user) {
      return next(new AppError('Invalid or expired verification link', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Don't reveal if email exists — security best practice
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const { sendPasswordResetEmail } = require('../utils/sendEmail');
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Email could not be sent. Try again later.', 500));
    }

    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/reset-password/:token ─────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset link', 400));
    }

    user.password = password; // will be hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, verifyEmail, forgotPassword, resetPassword };

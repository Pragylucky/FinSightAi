// controllers/authController.js
// Handles all authentication: register, login, logout, refresh token
//
// Pattern: Controller function → validate → do DB work → send response
// We use try/catch + next(error) to send errors to globalErrorHandler

const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');
const { AppError } = require('../middleware/errorHandler');
const { sendVerificationCode, sendPasswordResetEmail, isConfigured } = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const CODE_TTL_MS = 15 * 60 * 1000;      // a code is valid for 15 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;    // one email per minute per account
const MAX_CODE_ATTEMPTS = 5;             // wrong guesses before the code is burned
const isProd = process.env.NODE_ENV === 'production';
// Email verification is OFF by default (college/demo friendly). Set REQUIRE_EMAIL_VERIFICATION=true
// to make sign-up require the emailed 6-digit code.
const requireVerification = () => process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Refresh-token cookie. In production the frontend (e.g. Vercel) and API are on different
// sites, so the cookie must be SameSite=None; Secure or the browser never sends it back
// and users get logged out when the 15-minute access token expires.
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

// ── Helper: Send tokens in response ──────────────────────────
// Access token → JSON body (frontend keeps it in localStorage)
// Refresh token → httpOnly cookie (JS can't read it)
const sendTokens = (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      isGuest: user.isGuest,
    },
  });
};

// Generate a fresh 6-digit code, store its hash, and email it.
// Never throws: returns { emailSent } so callers can tell the user honestly.
const issueVerificationCode = async (user) => {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

  user.verificationCodeHash = sha256(code);
  user.verificationCodeExpiry = new Date(Date.now() + CODE_TTL_MS);
  user.verificationAttempts = 0;
  user.verificationLastSent = new Date();
  await user.save({ validateBeforeSave: false });

  // No mail transport configured (typical on a fresh local setup): print the code instead.
  if (!isConfigured()) {
    console.warn(`[auth] Email is not configured. Verification code for ${user.email}: ${code}`);
    return { emailSent: false };
  }

  try {
    await sendVerificationCode(user.email, user.name, code);
    return { emailSent: true };
  } catch (err) {
    console.error('[auth] Verification email failed:', err.response?.data || err.message);
    if (!isProd) console.warn(`[auth] (dev) code for ${user.email}: ${code}`);
    return { emailSent: false };
  }
};

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verification off: create a ready-to-use account and sign the user in immediately.
    if (!requireVerification()) {
      if (await User.findOne({ email })) {
        return next(new AppError('An account with this email already exists', 400));
      }
      const created = await User.create({ name, email, password, isVerified: true });
      await Portfolio.create({ user: created._id });
      await Watchlist.create({ user: created._id });
      return sendTokens(created, 201, res);
    }

    let user = await User.findOne({ email }).select('+verificationCodeHash');

    if (user && user.isVerified) {
      return next(new AppError('An account with this email already exists', 400));
    }

    if (user) {
      // Signed up before but never verified: let them start over instead of being stuck.
      // Safe because activating the account still requires the code sent to this inbox.
      user.name = name;
      user.password = password;
      await user.save();
    } else {
      user = await User.create({ name, email, password });
      await Portfolio.create({ user: user._id });
      await Watchlist.create({ user: user._id });
    }

    const recentlySent = user.verificationLastSent && Date.now() - user.verificationLastSent.getTime() < RESEND_COOLDOWN_MS && user.verificationCodeHash;
    const { emailSent } = recentlySent ? { emailSent: true } : await issueVerificationCode(user);

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Account created. We emailed you a 6-digit code.'
        : 'Account created, but we could not send the email. Use "Resend code" in a moment.',
      requiresVerification: true,
      emailSent,
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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account has been deactivated. Contact support.', 401));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Correct password but email not confirmed yet. The code lets the frontend send them
    // to the verification screen instead of showing a dead-end error.
    if (!user.isVerified && requireVerification()) {
      return next(new AppError('Please verify your email to continue.', 403, 'EMAIL_NOT_VERIFIED'));
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

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

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive || (!user.isVerified && requireVerification())) {
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
  // Attributes must match the ones used when the cookie was set, or the browser keeps it
  res.clearCookie('refreshToken', cookieOptions);
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

// ── POST /api/auth/verify-email ───────────────────────────────
// Body: { email, code }. On success the user is signed in straight away.
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+verificationCodeHash');

    // Same message for "no such user" and "wrong code" so this can't be used to probe emails
    const invalid = new AppError('That code is not correct.', 400, 'INVALID_CODE');

    if (!user) return next(invalid);
    if (user.isVerified) return next(new AppError('This email is already verified. Please sign in.', 400, 'ALREADY_VERIFIED'));

    if (!user.verificationCodeHash || !user.verificationCodeExpiry || user.verificationCodeExpiry < Date.now()) {
      return next(new AppError('That code has expired. Request a new one.', 400, 'CODE_EXPIRED'));
    }

    if (user.verificationAttempts >= MAX_CODE_ATTEMPTS) {
      user.verificationCodeHash = undefined;
      user.verificationCodeExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Too many wrong attempts. Request a new code.', 429, 'TOO_MANY_ATTEMPTS'));
    }

    if (!safeEqual(sha256(code), user.verificationCodeHash)) {
      user.verificationAttempts += 1;
      await user.save({ validateBeforeSave: false });
      const left = MAX_CODE_ATTEMPTS - user.verificationAttempts;
      return next(new AppError(left > 0 ? `That code is not correct. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong attempts. Request a new code.', left > 0 ? 400 : 429, left > 0 ? 'INVALID_CODE' : 'TOO_MANY_ATTEMPTS'));
    }

    user.isVerified = true;
    user.verificationCodeHash = undefined;
    user.verificationCodeExpiry = undefined;
    user.verificationAttempts = 0;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/resend-code ────────────────────────────────
// Body: { email }. Always answers the same way unless the cooldown applies,
// so it doesn't reveal which emails are registered.
const resendCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const generic = { success: true, message: 'If that account is waiting for verification, a new code is on its way.' };

    if (!user || user.isVerified) return res.json(generic);

    const wait = user.verificationLastSent ? RESEND_COOLDOWN_MS - (Date.now() - user.verificationLastSent.getTime()) : 0;
    if (wait > 0) {
      const secs = Math.ceil(wait / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${secs}s before requesting another code.`, code: 'COOLDOWN', retryAfter: secs });
    }

    const { emailSent } = await issueVerificationCode(user);
    if (!emailSent && isProd) {
      return next(new AppError('We could not send the email right now. Please try again shortly.', 502, 'EMAIL_FAILED'));
    }
    res.json({ ...generic, retryAfter: Math.ceil(RESEND_COOLDOWN_MS / 1000) });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/guest ──────────────────────────────────────
// One-click demo account: its own empty portfolio/watchlist, deleted after GUEST_TTL_DAYS.
const GUEST_TTL_DAYS = 7;
const createGuest = async (req, res, next) => {
  try {
    const id = crypto.randomBytes(6).toString('hex');
    const user = await User.create({
      name: 'Guest',
      email: `guest-${id}@guest.finsight.app`,
      password: crypto.randomBytes(24).toString('hex'), // nobody logs in with it; the session comes from the token
      isVerified: true,
      isGuest: true,
    });
    await Portfolio.create({ user: user._id });
    await Watchlist.create({ user: user._id });
    sendTokens(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Deletes guest accounts (and everything they own) older than GUEST_TTL_DAYS.
const cleanupGuests = async () => {
  const Chat = require('../models/Chat');
  const cutoff = new Date(Date.now() - GUEST_TTL_DAYS * 24 * 60 * 60 * 1000);
  const stale = await User.find({ isGuest: true, createdAt: { $lt: cutoff } }).select('_id');
  if (!stale.length) return 0;
  const ids = stale.map((u) => u._id);
  await Promise.all([
    Portfolio.deleteMany({ user: { $in: ids } }),
    Watchlist.deleteMany({ user: { $in: ids } }),
    Chat.deleteMany({ user: { $in: ids } }),
  ]);
  await User.deleteMany({ _id: { $in: ids } });
  return ids.length;
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
    user.passwordResetToken = sha256(resetToken); // only the hash is stored
    user.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

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
      passwordResetToken: sha256(token),
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset link', 400));
    }

    user.password = password; // will be hashed by pre-save hook
    user.isVerified = true;   // they just proved they own this mailbox
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, verifyEmail, resendCode, createGuest, cleanupGuests, forgotPassword, resetPassword };

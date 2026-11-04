// middleware/rateLimiter.js
// Rate limiting prevents abuse — too many requests from one IP gets blocked
// Uses express-rate-limit

const rateLimit = require('express-rate-limit');

// ── Global limiter — applies to all /api routes ───────────────
// 400 requests per 15 minutes per IP (a dashboard load alone makes ~6 calls)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 400,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,  // Returns rate limit info in headers (RateLimit-*)
  legacyHeaders: false,
});

// ── Auth limiter — stricter for login/signup ──────────────────
// 10 attempts per hour per IP — prevents brute force attacks
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// ── Verification limiter — code entry / resend ────────────────
// Per-user attempt caps live in the controller; this is the per-IP backstop.
const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Guest limiter — stops someone scripting thousands of throwaway accounts ──
const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many guest sessions from this network. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── AI Chat limiter — prevent API cost abuse ──────────────────
// 30 messages per hour per user (after auth)
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Chat rate limit reached. You can send 30 messages per hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, codeLimiter, guestLimiter, chatLimiter };

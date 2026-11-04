// routes/auth.js
// Maps HTTP method + URL → controller function
// router.post('/login') → POST /api/auth/login

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authLimiter, codeLimiter, guestLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const {
  register, login, refreshToken, logout,
  getMe, verifyEmail, resendCode, createGuest, forgotPassword, resetPassword,
} = require('../controllers/authController');

// Validation rules using express-validator
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const emailValidation = body('email').isEmail().withMessage('Please provide a valid email')
  .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes (no auth needed)
router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/guest', guestLimiter, createGuest);
router.post('/refresh', refreshToken);
router.post('/verify-email', codeLimiter, emailValidation, body('code').trim().matches(/^\d{6}$/).withMessage('Enter the 6-digit code'), validateRequest, verifyEmail);
router.post('/resend-code', codeLimiter, emailValidation, validateRequest, resendCode);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (need valid JWT)
router.get('/me', protect, getMe);
router.post('/logout', logout); // public: must work even when the access token has expired

module.exports = router;

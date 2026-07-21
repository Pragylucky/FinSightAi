// routes/auth.js
// Maps HTTP method + URL → controller function
// router.post('/login') → POST /api/auth/login

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const {
  register, login, refreshToken, logout,
  getMe, verifyEmail, forgotPassword, resetPassword,
} = require('../controllers/authController');

// Validation rules using express-validator
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes (no auth needed)
router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/refresh', refreshToken);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (need valid JWT)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;

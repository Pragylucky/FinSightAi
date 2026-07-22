// server.js
// ─────────────────────────────────────────────────────────────
// Entry point for FinSight AI backend
// Loads env vars → connects DB → mounts routes → starts server
// ─────────────────────────────────────────────────────────────

require('dotenv').config(); // MUST be first line — loads .env into process.env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

// ── Import all route files ────────────────────────────────────
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const companyRoutes = require('./routes/company');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const newsRoutes = require('./routes/news');
const screenerRoutes = require('./routes/screener');
const userRoutes = require('./routes/user');

// ── Create Express app ───────────────────────────────────────
const app = express();

// ── Connect to MongoDB ───────────────────────────────────────
connectDB();

// ── Global Middleware ────────────────────────────────────────

// Helmet adds security headers (hides that we use Express, prevents XSS etc.)
app.use(helmet());

// CORS — controls which frontend URLs can call this API
// In development: localhost:3000 (your Vite dev server)
// In production: your Vercel URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://fin-sight-ai-six-kappa.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without an Origin header (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Morgan logs every HTTP request to the terminal — great for debugging
// Example output: POST /api/auth/login 200 45ms
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON request bodies — without this, req.body is undefined
app.use(express.json({ limit: '10mb' })); // 10mb limit for PDF uploads
app.use(express.urlencoded({ extended: true }));

// Parse cookies — needed for refresh token stored in httpOnly cookie
app.use(cookieParser());

// Global rate limiter — 100 requests per 15 mins per IP
// Prevents brute force attacks and API abuse
app.use('/api', globalLimiter);

// ── Health Check ─────────────────────────────────────────────
// Simple endpoint to check if server is running
// Visit: http://localhost:5000/health
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FinSight AI API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// ── API Routes ────────────────────────────────────────────────
// All routes are prefixed with /api
// Example: POST /api/auth/login
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/screener', screenerRoutes);
app.use('/api/user', userRoutes);
app.use(
  '/api/mutual-funds',
  require('./routes/mutualFundRoutes')
);
app.use(
  '/api/ai',
  require('./routes/aiRoutes')
);

// ── Error Handling ────────────────────────────────────────────
// Order matters: notFound must come after all routes,
// globalErrorHandler must be last
app.use(notFound);
app.use(globalErrorHandler);

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     FinSight AI Backend Running       ║
  ║  http://localhost:${PORT}                ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}              ║
  ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections (async errors not caught by try/catch)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

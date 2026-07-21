// middleware/auth.js
// Protects routes — checks if the user has a valid JWT token
// Usage: router.get('/profile', protect, getProfile)

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

// ── protect ───────────────────────────────────────────────────
// Middleware that runs before protected route handlers
// Reads JWT from Authorization header: "Bearer eyJhbGci..."
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // get the token part after "Bearer "
    }

    if (!token) {
      return next(new AppError('Not authenticated. Please log in.', 401));
    }

    // Verify the token — throws if expired or invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: 'user_id_here', iat: timestamp, exp: timestamp }

    // Check if user still exists (they might have been deleted after token was issued)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Attach user to the request object — now available as req.user in route handlers
    req.user = user;
    next();

  } catch (error) {
    next(error); // JWT errors handled in globalErrorHandler
  }
};

// ── restrictTo ────────────────────────────────────────────────
// Role-based access — only certain roles can access a route
// Usage: router.delete('/users/:id', protect, restrictTo('admin'), deleteUser)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to do this', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };

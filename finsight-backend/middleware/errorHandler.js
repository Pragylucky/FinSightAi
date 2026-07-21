// middleware/errorHandler.js
// Centralized error handling — instead of writing res.status(500).json(...)
// everywhere, we just call next(error) and this catches it
//
// Express recognizes a middleware with 4 params (err, req, res, next)
// as an error handler

// Custom error class — lets us throw errors with a status code attached
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // vs unexpected bugs — we handle these gracefully
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handles routes that don't exist
// Example: GET /api/unknown → "Route not found"
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Main error handler — catches ALL errors passed via next(err)
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose Errors ──────────────────────────────────────
  // Duplicate key (e.g., email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error (field required but not provided)
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }

  // Invalid MongoDB ObjectId (e.g., /api/portfolio/notanid)
  if (err.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    message = 'Session expired. Please log in again.';
    statusCode = 401;
  }

  // JWT invalid (tampered token)
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
    statusCode = 401;
  }

  // In development: send full error stack for debugging
  // In production: only send the message
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, notFound, globalErrorHandler };

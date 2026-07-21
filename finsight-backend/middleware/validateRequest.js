// middleware/validateRequest.js
// Reads express-validator errors and sends them as a response
// Attach AFTER validation rules in the route chain

const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // send first error only (cleaner UX)
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { validateRequest };

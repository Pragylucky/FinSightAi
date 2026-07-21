const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
});

// PUT /api/user/profile — update name, preferences
router.put('/profile', async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,  // return the updated document
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/change-password
router.put('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// models/Event.js
// Minimal product analytics: one row per meaningful user action. Auto-deleted after 180 days.

const mongoose = require('mongoose');

const NAMES = ['guest_started', 'signup', 'company_view', 'ai_tab_open', 'compare_used', 'screen_applied', 'chat_message'];

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  session: { type: String, maxlength: 40 },
  name: { type: String, enum: NAMES, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});
eventSchema.index({ name: 1, createdAt: -1 });

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
module.exports.NAMES = NAMES;

// models/AiFeedback.js
// Thumbs up/down on an AI answer. One vote per user per answer (re-voting overwrites).

const mongoose = require('mongoose');

const aiFeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['chat', 'analysis'], required: true },
  ref: { type: String, required: true, maxlength: 80 },   // symbol for analysis, message id for chat
  rating: { type: Number, enum: [1, -1], required: true },
  reason: { type: String, enum: ['wrong-data', 'unclear', 'unhelpful', 'too-generic', 'other', null], default: null },
  createdAt: { type: Date, default: Date.now },
});

aiFeedbackSchema.index({ user: 1, kind: 1, ref: 1 }, { unique: true });

module.exports = mongoose.models.AiFeedback || mongoose.model('AiFeedback', aiFeedbackSchema);

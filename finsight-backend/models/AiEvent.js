// models/AiEvent.js
// One row per AI call: lets us measure latency, token cost, error rate and grounding.
// Auto-deleted after 90 days.

const mongoose = require('mongoose');

const aiEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  kind: { type: String, enum: ['chat', 'analysis'], required: true },
  model: String,
  symbols: [String],            // stocks the answer was grounded in
  grounded: { type: Boolean, default: false },
  ok: { type: Boolean, default: true },
  error: String,
  latencyMs: Number,
  inputTokens: Number,
  outputTokens: Number,
  guardFlags: [String],         // output-guard rules that fired
  cached: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
});

module.exports = mongoose.models.AiEvent || mongoose.model('AiEvent', aiEventSchema);

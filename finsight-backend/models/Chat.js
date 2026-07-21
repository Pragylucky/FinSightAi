// models/Chat.js
// Stores AI chat history for each user
// Each Chat = one conversation thread
// Each Message = one message inside a thread

const mongoose = require('mongoose');

// Individual message inside a chat
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  // Store any financial context used for this message
  context: {
    symbols: [String],       // stocks mentioned: ['TCS', 'INFY']
    dataUsed: [String],      // what data was fetched: ['price', 'news']
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Tokens used for billing tracking (when you add paid tiers)
  tokensUsed: Number,
});

// Chat = one conversation session
const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Auto-generated title from first message
  title: {
    type: String,
    default: 'New Chat',
    maxlength: 100,
  },

  messages: [messageSchema],

  // Is this chat still active or archived
  isActive: {
    type: Boolean,
    default: true,
  },

  // Last activity — for sorting chats by recency
  lastActivity: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps: true,
});

// Index: fetch all chats for a user quickly
chatSchema.index({ user: 1, lastActivity: -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;

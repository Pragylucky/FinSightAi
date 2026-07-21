// controllers/chatController.js
// Handles AI chat — sends messages to Claude, saves history

const Chat = require('../models/Chat');
const { generateAIResponse } = require('../services/aiService');
const { getStockQuote, getCompanyNews } = require('../services/financeService');
const { AppError } = require('../middleware/errorHandler');

// ── POST /api/chat/message ────────────────────────────────────
// Send a message and get an AI response
// Body: { message: string, chatId: string (optional) }
const sendMessage = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return next(new AppError('Message cannot be empty', 400));
    }

    // ── Find or create a chat session ─────────────────────
    let chat;
    if (chatId) {
      // Continue existing chat
      chat = await Chat.findOne({ _id: chatId, user: userId });
      if (!chat) return next(new AppError('Chat not found', 404));
    } else {
      // Start a new chat — auto-title from first message
      const title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
      chat = await Chat.create({ user: userId, title, messages: [] });
    }

    // ── Build context from financial data ─────────────────
    // Detect if the message mentions a stock symbol
    // Simple regex: 2-10 uppercase letters
    const symbolMatch = message.match(/\b[A-Z]{2,10}\b/g);
    let context = null;

    if (symbolMatch) {
      // Try to fetch live data for mentioned symbols
      const symbolData = {};
      for (const sym of symbolMatch.slice(0, 2)) { // max 2 symbols to avoid rate limits
        try {
          const quote = await getStockQuote(sym);
          const news = await getCompanyNews(sym);
          symbolData[sym] = { quote, recentNews: news.slice(0, 3) };
        } catch (e) {
          // ignore failed symbol fetches
        }
      }
      if (Object.keys(symbolData).length > 0) {
        context = { stockData: symbolData, timestamp: new Date().toISOString() };
      }
    }

    // ── Call Claude API ───────────────────────────────────
    // Pass the full conversation history for context
    const conversationHistory = chat.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    conversationHistory.push({ role: 'user', content: message });

    const { message: aiResponse, tokensUsed } = await generateAIResponse(conversationHistory, context);

    // ── Save both messages to DB ──────────────────────────
    chat.messages.push(
      {
        role: 'user',
        content: message,
        context: { symbols: symbolMatch || [] },
      },
      {
        role: 'assistant',
        content: aiResponse,
        tokensUsed,
      }
    );
    chat.lastActivity = Date.now();
    await chat.save();

    res.json({
      success: true,
      message: aiResponse,
      chatId: chat._id,
      tokensUsed,
    });
  } catch (error) {
    // If Claude API fails, return a helpful message
    if (error.response?.status === 529 || error.code === 'ECONNABORTED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily busy. Please try again in a moment.',
      });
    }
    next(error);
  }
};

// ── GET /api/chat/history ─────────────────────────────────────
// Get all chat sessions for the current user
const getChatHistory = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user.id, isActive: true })
      .select('title lastActivity createdAt messages')  // don't return all messages
      .sort({ lastActivity: -1 }) // newest first
      .limit(20);

    // Return summary (title + message count, not full messages)
    const chatSummaries = chats.map(chat => ({
      id: chat._id,
      title: chat.title,
      messageCount: chat.messages.length,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
    }));

    res.json({ success: true, chats: chatSummaries });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/chat/:chatId ─────────────────────────────────────
// Get full messages of a specific chat
const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) return next(new AppError('Chat not found', 404));

    res.json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/chat/:chatId ──────────────────────────────────
const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, user: req.user.id });
    if (!chat) return next(new AppError('Chat not found', 404));

    // Soft delete
    chat.isActive = false;
    await chat.save();

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getChatHistory, getChatById, deleteChat };

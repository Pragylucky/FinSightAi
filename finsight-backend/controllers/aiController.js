// controllers/aiController.js

const {
  generateAIResponse,
  generateCompanySummary,
} = require('../services/aiService');

// ── POST /api/ai/chat ─────────────────────────────────────────
// Body: {
//   messages: [{ role: 'user', content: 'What is PE ratio?' }],
//   context: optional financial data
// }

const chatWithAI = async (req, res, next) => {
  try {
    const { messages, context = null } = req.body;

    // Validate messages
    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one chat message is required',
      });
    }

    // Make sure every message has valid structure
    const validMessages = messages.filter(
      message =>
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim()
    );

    if (validMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format',
      });
    }

    const result = await generateAIResponse(
      validMessages,
      context
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      '❌ Gemini AI chat error:',
      error.response?.data || error.message
    );

    next(error);
  }
};

// ── POST /api/ai/company-analysis ─────────────────────────────
// Body: { companyData: {...} }

const analyzeCompany = async (req, res, next) => {
  try {
    const { companyData } = req.body;

    if (!companyData) {
      return res.status(400).json({
        success: false,
        message: 'Company data is required',
      });
    }

    const analysis =
      await generateCompanySummary(companyData);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      '❌ Gemini company analysis error:',
      error.response?.data || error.message
    );

    next(error);
  }
};

module.exports = {
  chatWithAI,
  analyzeCompany,
};
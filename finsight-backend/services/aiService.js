// services/aiService.js
// Gemini-powered AI service for FinSight

const axios = require('axios');

const GEMINI_MODEL = 'gemini-3.5-flash';

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── FinSight AI system instructions ───────────────────────────
const SYSTEM_PROMPT = `
You are FinSight AI, an expert financial research assistant built into the FinSight platform.

You help everyday Indian investors understand stocks, mutual funds, financial concepts, and market trends.

Your personality:
- Knowledgeable but approachable
- Explain complex financial concepts in simple language
- Be honest about uncertainty
- Never invent financial data
- Use Indian financial context such as NSE, BSE, INR and SEBI when relevant
- Use financial data provided in the context when available

Your capabilities:
- Analyze stocks and companies
- Explain PE ratio, ROE, EPS, EBITDA, debt-to-equity and other metrics
- Compare companies and mutual funds
- Summarize financial news
- Explain market impact
- Discuss portfolio diversification and risk
- Present bull and bear cases

Rules:
- Use **bold** for important concepts and numbers
- Use bullet points when useful
- Keep responses concise but informative
- Never guarantee returns
- Never provide guaranteed buy/sell calls or target prices
- If real-time data is not provided, clearly say you do not have it
- Treat all analysis as educational information, not personalized financial advice

Always end general chat responses with:
⚠️ This is educational analysis only — not financial advice. Do your own research before investing.
`;

// ── Call Gemini API ───────────────────────────────────────────
// ── Call Gemini API with retry handling ───────────────────────
const callGemini = async (
  prompt,
  {
    systemPrompt = SYSTEM_PROMPT,
    temperature = 0.4,
    maxOutputTokens = 1500,
  } = {}
) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        GEMINI_URL,
        {
          system_instruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },

          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        },
        {
          params: {
            key: process.env.GEMINI_API_KEY,
          },

          headers: {
            'Content-Type': 'application/json',
          },

          // Gemini can occasionally take longer under load
          timeout: 60000,
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim();

      if (!text) {
        throw new Error('Gemini returned an empty response');
      }

      return text;

    } catch (error) {
      const status = error.response?.status;

      console.error(
        `Gemini API attempt ${attempt + 1} failed:`,
        status || error.code || error.message
      );

      // Retry temporary server errors and timeouts
      const shouldRetry =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        error.code === 'ECONNABORTED';

      if (shouldRetry && attempt < MAX_RETRIES) {
        // Wait longer after each failed attempt
        const delay = 2000 * (attempt + 1);

        console.log(`Retrying Gemini in ${delay / 1000}s...`);

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        continue;
      }

      // Friendly error after retries are exhausted
      if (status === 503) {
        throw new Error(
          'FinSight AI is temporarily busy. Please try again in a moment.'
        );
      }

      if (status === 429) {
        throw new Error(
          'FinSight AI rate limit reached. Please wait a moment and try again.'
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error(
          'FinSight AI took too long to respond. Please try again.'
        );
      }

      throw error;
    }
  }
};

// ── Main AI Chat ──────────────────────────────────────────────
// messages = [{ role: 'user'|'assistant', content: '...' }]
// context = optional financial data
const generateAIResponse = async (
  messages,
  context = null
) => {
  const recentMessages = messages.slice(-10);

  const conversation = recentMessages
    .map(message => {
      const role =
        message.role === 'assistant'
          ? 'FinSight AI'
          : 'User';

      return `${role}: ${message.content}`;
    })
    .join('\n\n');

  let prompt = '';

  if (context) {
    prompt += `
FINANCIAL DATA CONTEXT:
${JSON.stringify(context, null, 2)}

Use the above data when relevant. Do not invent missing financial values.

`;
  }

  prompt += `
CONVERSATION:
${conversation}

Respond to the user's latest message as FinSight AI.
`;

  const message = await callGemini(prompt, {
    systemPrompt: SYSTEM_PROMPT,
    temperature: 0.5,
    maxOutputTokens: 1500,
  });

  return {
    message,
    tokensUsed: null,
  };
};

// ── Generate Company AI Summary ───────────────────────────────
const generateCompanySummary = async (companyData) => {
  const prompt = `
Analyze the following company data for an Indian retail investor.

Company data:
${JSON.stringify(companyData, null, 2)}

Return:
1. A concise 3-4 sentence summary
2. 3-4 key strengths
3. 2-3 key risks
4. Overall outlook
5. Risk score from 1-100, where lower means relatively safer

Return ONLY valid JSON in exactly this structure:

{
  "summary": "string",
  "pros": ["string", "string"],
  "cons": ["string", "string"],
  "outlook": "Positive",
  "riskScore": 35
}

The outlook must be one of:
"Positive", "Neutral", or "Negative".

Do not wrap the response in markdown.
`;

  const text = await callGemini(prompt, {
    systemPrompt:
      'You are a financial analyst. Analyze only the supplied data. Return only valid JSON with no markdown or additional commentary.',
    temperature: 0.2,
    maxOutputTokens: 1000,
  });

  const clean = text
  .replace(/```json/gi, '')
  .replace(/```/g, '')
  .trim();

try {
  return JSON.parse(clean);
} catch (error) {
  console.error('Failed to parse Gemini company summary JSON:');
  console.error(clean);

  // Try extracting only the JSON object
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');

  if (start !== -1 && end !== -1) {
    const extractedJSON = clean.slice(start, end + 1);

    try {
      return JSON.parse(extractedJSON);
    } catch (secondError) {
      console.error('JSON extraction also failed:', secondError.message);
    }
  }

  // Safe fallback so Company page does not break
  return {
    summary:
      'AI analysis is temporarily unavailable. Please review the financial metrics shown above.',
    pros: [],
    cons: [],
    outlook: 'Neutral',
    riskScore: 50,
  };
}
};

// ── Summarize Financial News ──────────────────────────────────
const summarizeNews = async (
  newsText,
  headline
) => {
  const prompt = `
Headline:
${headline}

Article:
${newsText.slice(0, 2000)}

Analyze this financial news for a retail investor.

Return ONLY valid JSON:

{
  "summary": "Two sentence plain-English summary",
  "sentiment": "bullish",
  "bullishScore": 65,
  "bearishScore": 35,
  "affectedStocks": ["TCS", "INFY"]
}

Rules:
- sentiment must be "bullish", "bearish", or "neutral"
- bullishScore and bearishScore must be numbers from 0-100
- bullishScore + bearishScore should equal 100
- affectedStocks should contain relevant stock symbols when identifiable
- Do not invent affected stocks if none can be identified
`;

  const text = await callGemini(prompt, {
    systemPrompt:
      'You are a financial news analyst. Return only valid JSON with no markdown or additional commentary.',
    temperature: 0.2,
    maxOutputTokens: 500,
  });

  const clean = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(clean);
};

module.exports = {
  generateAIResponse,
  generateCompanySummary,
  summarizeNews,
};
// services/aiGuard.js
// Output guardrails applied to every chat answer, independent of what the model decided to say.
// Rule 1: the disclaimer is always present (we never rely on the model to add it).
// Rule 2: answers that promise returns or give a hard buy/sell call are flagged so we can measure them.

const DISCLAIMER = '⚠️ This is educational analysis only — not financial advice. Do your own research before investing.';

const RULES = [
  { flag: 'guaranteed-returns', test: /\b(guaranteed|assured|risk[- ]free|sure[- ]shot)\b[^.\n]{0,40}\b(return|profit|gain|income)s?\b/i },
  { flag: 'hard-call', test: /\byou (should|must) (definitely |certainly )?(buy|sell)\b/i },
  { flag: 'price-target', test: /\b(will (reach|hit|touch)|target price (of|is))\s*₹?\s*\d/i },
];

// The disclaimer belongs on answers that discuss investing, not on greetings or redirections.
const INVESTING = /\b(stocks?|shares?|equit(?:y|ies)|invest\w*|buy|sell|portfolio|mutual funds?|sip|etf|nifty|sensex|returns?|dividends?|valuation|overvalued|undervalued|p\/?e|roe|ebitda|market cap|nse|bse|ipo|bonds?|trading|trade)\b/gi;

const guardChatAnswer = (text, { grounded = false } = {}) => {
  const flags = RULES.filter((r) => r.test.test(text)).map((r) => r.flag);
  // Substantive investing talk = a real-length answer using several distinct investing terms.
  // A short redirect that merely names "NSE", "BSE" or "stocks" does not count.
  const terms = new Set((text.match(INVESTING) || []).map((t) => t.toLowerCase()));
  const needsDisclaimer = grounded || flags.length > 0 || (terms.size >= 3 && text.length >= 250);
  const hasDisclaimer = /not financial advice/i.test(text);
  const message = needsDisclaimer && !hasDisclaimer ? `${text.trimEnd()}\n\n${DISCLAIMER}` : text;
  return { message, flags, disclaimed: needsDisclaimer };
};

module.exports = { guardChatAnswer, DISCLAIMER };

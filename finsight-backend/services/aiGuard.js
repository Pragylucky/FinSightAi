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

const guardChatAnswer = (text) => {
  const flags = RULES.filter((r) => r.test.test(text)).map((r) => r.flag);
  const hasDisclaimer = /not financial advice/i.test(text);
  const message = hasDisclaimer ? text : `${text.trimEnd()}\n\n${DISCLAIMER}`;
  return { message, flags };
};

module.exports = { guardChatAnswer, DISCLAIMER };

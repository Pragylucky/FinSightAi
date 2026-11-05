const test = require('node:test');
const assert = require('node:assert/strict');

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:1/unused';
const { guardChatAnswer, DISCLAIMER } = require('../services/aiGuard');
const { parseJsonObject } = require('../services/aiService');
const { findMentionedStocks } = require('../controllers/aiController');
const cases = require('../eval/mentionCases');

// ── Guardrails ────────────────────────────────────────────────
test('guard appends the disclaimer to investing answers the model left bare', () => {
  const bare = 'TCS shares trade at a PE of 28 and the stock pays a dividend. Compared with other large IT names its ROE is high, so many investors treat it as a quality holding, though a lower valuation elsewhere in the sector can look more attractive when growth is expected to pick up over the next few years.';
  assert.ok(guardChatAnswer(bare).message.endsWith(DISCLAIMER));
  assert.ok(guardChatAnswer('Anything at all.', { grounded: true }).message.endsWith(DISCLAIMER));
});

test('guard leaves greetings and redirections without a disclaimer', () => {
  const redirect = "I focus on finance and markets, so I can't help with that. Want to look at a stock or a concept instead?";
  assert.equal(guardChatAnswer(redirect).message, redirect);
  // A real redirect seen in production: names NSE, BSE and stock markets but is still just a redirect
  const live = "I focus specifically on finance and financial markets, but I'd be happy to help you understand how government economic policies or the Union Budget impact Indian stock markets like the NSE and BSE!";
  assert.equal(guardChatAnswer(live).message, live);
  assert.equal(guardChatAnswer('Haha, fair enough! What would you like to explore?').message, 'Haha, fair enough! What would you like to explore?');
});

test('guard does not duplicate the disclaimer', () => {
  const { message } = guardChatAnswer(`Fine.\n\n${DISCLAIMER}`);
  assert.equal(message.split('not financial advice').length - 1, 1);
});

test('guard flags guaranteed-return language and hard buy calls', () => {
  assert.deepEqual(guardChatAnswer('This fund gives guaranteed returns of 20%.').flags, ['guaranteed-returns']);
  assert.ok(guardChatAnswer('You should definitely buy this stock today.').flags.includes('hard-call'));
  assert.ok(guardChatAnswer('The stock will reach ₹4000 by March.').flags.includes('price-target'));
});

test('guard leaves balanced educational text unflagged', () => {
  const text = 'There is no guarantee of returns; equities can fall. Consider the risks before buying.';
  assert.deepEqual(guardChatAnswer(text).flags, []);
});

// ── Defensive JSON parsing of model output ────────────────────
test('parseJsonObject handles fenced, chatty and broken output', () => {
  assert.deepEqual(parseJsonObject('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseJsonObject('Sure! Here you go: {"a":2} Hope that helps'), { a: 2 });
  assert.equal(parseJsonObject('no json here'), null);
  assert.equal(parseJsonObject('{"a":'), null);
});

// ── Grounding eval: does the chat fetch live data for the right stocks? ──
test('stock-mention detection meets precision/recall targets on the labelled set', () => {
  let tp = 0; let fp = 0; let fn = 0; const misses = [];
  for (const { q, expect } of cases) {
    const got = findMentionedStocks(q);
    const hit = got.filter((s) => expect.includes(s)).length;
    tp += hit; fp += got.length - hit; fn += expect.length - hit;
    if (got.length !== hit || hit !== expect.length) misses.push(`${q} -> got [${got}] expected [${expect}]`);
  }
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  console.log(`   mention detection: precision ${(precision * 100).toFixed(0)}%, recall ${(recall * 100).toFixed(0)}% over ${cases.length} queries`);
  if (misses.length) console.log('   misses:\n     ' + misses.join('\n     '));
  assert.ok(precision >= 0.9, `precision ${precision}`);
  assert.ok(recall >= 0.85, `recall ${recall}`);
});

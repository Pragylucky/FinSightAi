const test = require('node:test');
const assert = require('node:assert/strict');

const { scoreSentiment, toYahooSymbol } = require('../services/financeService');
const { screenerStocks, symbolAliases } = require('../data/screenerData');
const { findMentionedStocks } = require('../controllers/aiController');

test('universe: ~265 unique, well-formed stocks', () => {
  assert.ok(screenerStocks.length >= 250, `expected 250+ stocks, got ${screenerStocks.length}`);
  const symbols = screenerStocks.map((s) => s.symbol);
  assert.equal(new Set(symbols).size, symbols.length, 'duplicate symbols');
  for (const s of screenerStocks) {
    assert.ok(s.symbol && s.name && s.sector, `incomplete row: ${JSON.stringify(s)}`);
    assert.equal(s.yahooSymbol, `${s.symbol}.NS`);
  }
});

test('universe: every alias points at a stock we track', () => {
  const known = new Set(screenerStocks.map((s) => s.symbol));
  for (const [old, current] of Object.entries(symbolAliases)) {
    assert.ok(known.has(current), `${old} -> ${current} is not in the universe`);
  }
});

test('toYahooSymbol: NSE suffix, aliases, US names, indices', () => {
  assert.equal(toYahooSymbol('tcs'), 'TCS.NS');
  assert.equal(toYahooSymbol('ZOMATO'), 'ETERNAL.NS'); // renamed company
  assert.equal(toYahooSymbol('TATAMOTORS'), 'TMPV.NS');
  assert.equal(toYahooSymbol('M&M'), 'M&M.NS');
  assert.equal(toYahooSymbol('AAPL'), 'AAPL');
  assert.equal(toYahooSymbol('^NSEI'), '^NSEI');
  assert.equal(toYahooSymbol('INR=X'), 'INR=X');
  assert.equal(toYahooSymbol('INFY.NS'), 'INFY.NS');
});

test('scoreSentiment: bullish, bearish and neutral headlines', () => {
  assert.equal(scoreSentiment('Sensex surges to record high as banks rally').sentiment, 'bullish');
  assert.equal(scoreSentiment('Stocks tumble as RBI fears grow').sentiment, 'bearish');
  assert.equal(scoreSentiment('Company announces new office').sentiment, 'neutral');
  const s = scoreSentiment('Profit jumps, shares soar');
  assert.equal(s.bullishScore + s.bearishScore, 100);
});

test('findMentionedStocks: finds companies by symbol, name and old ticker', () => {
  assert.deepEqual(findMentionedStocks('Is TCS overvalued right now?'), ['TCS']);
  assert.deepEqual(findMentionedStocks('compare infosys and wipro'), ['INFY', 'WIPRO']);
  assert.deepEqual(findMentionedStocks('should I buy zomato'), ['ETERNAL']);
  assert.deepEqual(findMentionedStocks('how is HDFC Bank doing'), ['HDFCBANK']);
});

test('findMentionedStocks: generic questions match nothing', () => {
  assert.deepEqual(findMentionedStocks('What is a PE ratio?'), []);
  assert.deepEqual(findMentionedStocks('explain EBITDA'), []);
  assert.deepEqual(findMentionedStocks('is it a good time to invest'), []);
});

test('findMentionedStocks: never returns more than two stocks', () => {
  assert.ok(findMentionedStocks('TCS INFY WIPRO HCLTECH SBIN').length <= 2);
});

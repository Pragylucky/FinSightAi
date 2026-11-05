import test from 'node:test';
import assert from 'node:assert/strict';
import { inr, money, pct, isMarketOpen, greeting, timeAgo } from '../src/lib/format.js';

test('inr: Indian digit grouping and safe fallbacks', () => {
  assert.equal(inr(1234567), '₹12,34,567');
  assert.equal(inr(99.5, 2), '₹99.50');
  assert.equal(inr(undefined), '—');
  assert.equal(inr(NaN), '—');
});

test('pct: sign and fallback', () => {
  assert.equal(pct(3.456), '+3.46%');
  assert.equal(pct(-1.2), '-1.20%');
  assert.equal(pct(null), '—');
});

test('isMarketOpen: NSE hours in IST, weekdays only', () => {
  assert.equal(isMarketOpen(new Date('2026-11-04T05:00:00Z')), true);  // Wed 10:30 IST
  assert.equal(isMarketOpen(new Date('2026-11-04T11:00:00Z')), false); // Wed 16:30 IST, after close
  assert.equal(isMarketOpen(new Date('2026-11-04T03:00:00Z')), false); // Wed 08:30 IST, before open
  assert.equal(isMarketOpen(new Date('2026-11-07T05:00:00Z')), false); // Saturday
});

test('greeting: follows the hour', () => {
  assert.equal(greeting(new Date(2026, 0, 1, 9)), 'Good morning');
  assert.equal(greeting(new Date(2026, 0, 1, 14)), 'Good afternoon');
  assert.equal(greeting(new Date(2026, 0, 1, 19)), 'Good evening');
});

test('timeAgo: relative labels', () => {
  const now = new Date('2026-11-04T12:00:00Z').getTime();
  assert.equal(timeAgo('2026-11-04T11:59:40Z', now), 'just now');
  assert.equal(timeAgo('2026-11-04T11:30:00Z', now), '30m ago');
  assert.equal(timeAgo('2026-11-04T09:00:00Z', now), '3h ago');
  assert.equal(timeAgo('2026-11-02T12:00:00Z', now), '2d ago');
  assert.equal(timeAgo('garbage', now), '');
});

test('money: rupees for NSE holdings, dollars for US holdings, safe fallback', () => {
  assert.equal(money(1234567), '₹12,34,567');
  assert.equal(money(349.5, 'USD', 2), '$349.50');
  assert.equal(money(1234.5, 'USD', 0), '$1,235');
  assert.equal(money(null, 'USD'), '—');
});

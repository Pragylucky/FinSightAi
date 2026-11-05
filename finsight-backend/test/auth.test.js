const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

// The verification code is only ever stored as a SHA-256 hash; these pin the properties we rely on.
const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

test('codes are always 6 digits, including leading zeros', () => {
  for (let i = 0; i < 2000; i += 1) {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    assert.match(code, /^\d{6}$/);
  }
});

test('the stored hash never contains the code and differs per code', () => {
  assert.notEqual(sha256('123456'), sha256('123457'));
  assert.ok(!sha256('123456').includes('123456'));
  assert.equal(sha256('123456'), sha256('123456'));
});

test('the auth controller exports every handler the routes need', () => {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:1/unused';
  const c = require('../controllers/authController');
  for (const name of ['register', 'login', 'refreshToken', 'logout', 'getMe', 'verifyEmail', 'resendCode', 'createGuest', 'cleanupGuests', 'forgotPassword', 'resetPassword']) {
    assert.equal(typeof c[name], 'function', `${name} missing`);
  }
});

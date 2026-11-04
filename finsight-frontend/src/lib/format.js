// Number / currency helpers so pages don't each reinvent them.

export const inr = (n, digits = 0) =>
  typeof n === 'number' && Number.isFinite(n)
    ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: digits })}`
    : '—';

export const pct = (n, digits = 2) =>
  typeof n === 'number' && Number.isFinite(n) ? `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%` : '—';

export const num = (n, digits = 2) =>
  typeof n === 'number' && Number.isFinite(n) ? n.toFixed(digits) : '—';

// NSE/BSE regular session: Mon–Fri, 09:15–15:30 IST. Holidays are not accounted for.
export function isMarketOpen(now = new Date()) {
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Hello';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good evening';
}

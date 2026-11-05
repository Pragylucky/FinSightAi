// Recently viewed companies, kept in this browser only.
const KEY = 'finsight:recent';
const MAX = 8;

export function getRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((x) => x && x.symbol) : [];
  } catch {
    return [];
  }
}

export function addRecent(symbol, name) {
  try {
    const rest = getRecent().filter((x) => x.symbol !== symbol);
    localStorage.setItem(KEY, JSON.stringify([{ symbol, name }, ...rest].slice(0, MAX)));
  } catch { /* storage unavailable (private mode): feature just doesn't persist */ }
}

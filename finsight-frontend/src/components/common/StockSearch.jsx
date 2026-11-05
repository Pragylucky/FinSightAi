import { useRef, useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

// Debounced symbol search. Calls onSelect(stock) when a result is picked.
// onEnter(query): optional; called when Enter is pressed with no suggestion to pick.
export default function StockSearch({ onSelect, onEnter, placeholder = 'Search TCS, Infosys, Reliance…', autoFocus = false, className = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const latest = useRef(0);
  const box = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Close the dropdown on outside click
  useEffect(() => {
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timer.current);

    if (!value.trim()) {
      latest.current += 1;
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ticket = ++latest.current;
    timer.current = setTimeout(async () => {
      try {
        const res = await api.company.search(value.trim());
        if (ticket === latest.current) setResults(res.results || []);
      } catch {
        if (ticket === latest.current) setResults([]);
      } finally {
        if (ticket === latest.current) setLoading(false);
      }
    }, 250);
  };

  const pick = (stock) => {
    onSelect(stock);
    setQuery('');
    setResults([]);
    latest.current += 1;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') setResults([]);
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (results[0]) pick(results[0]);
    else if (onEnter && query.trim()) onEnter(query.trim());
  };

  return (
    <div className={`relative ${className}`} ref={box}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        className="input-field pl-9"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label="Search stocks"
        autoComplete="off"
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
      />
      {loading && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />}

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 rounded-lg border border-bg-border bg-bg-secondary shadow-xl shadow-black/40 z-50 overflow-hidden max-h-64 overflow-y-auto">
          {results.map((stock) => (
            <li key={stock.symbol}>
              <button
                type="button"
                onClick={() => pick(stock)}
                className="w-full text-left px-4 py-3 hover:bg-bg-tertiary transition-colors"
              >
                <p className="font-semibold text-sm text-text-primary">{stock.symbol} <span className="font-normal text-xs text-text-muted ml-1">{stock.exchange}</span></p>
                <p className="text-xs text-text-muted">{stock.name}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

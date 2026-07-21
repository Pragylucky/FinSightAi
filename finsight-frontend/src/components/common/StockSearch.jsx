import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StockSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        console.log("Searching:", query);

        const res = await api.company.search(query);
        console.log("API returned:", res);

        setResults(res.results || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="relative">
      <input
        className="input-field"
        placeholder="Search TCS, Infosys, Reliance..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-lg border border-bg-border bg-bg-secondary shadow-xl z-50 overflow-hidden">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              type="button"
              onClick={() => {
                onSelect(stock);
                setQuery(stock.symbol);
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-bg-tertiary transition"
            >
              <p className="font-semibold">{stock.symbol}</p>
              <p className="text-xs text-text-muted">
                {stock.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
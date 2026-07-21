import { useState } from "react";
import { X, Search } from "lucide-react";
import api from "../../services/api";
import StockSearch from "../common/StockSearch";

export default function AddWatchlistModal({  open,
  onClose,
  onSuccess,
}) {
    const [selectedStock, setSelectedStock] = useState(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
  symbol: "",
  name: "",
  targetPrice: "",
  notes: "",
});

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.watchlist.add({
        symbol: form.symbol.toUpperCase(),
        name: form.name,
        targetPrice: Number(form.targetPrice),
        notes: form.notes,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add holding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">

      <div className="bg-bg-secondary border border-bg-border rounded-2xl w-full max-w-lg">

        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <h2 className="text-xl font-bold">
              Add to Watchlist

          </h2>

          <button onClick={onClose}>
            <X size={20}/>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4"
        >

          <div>
            <label className="text-sm mb-2 block">
                Search Stock
            </label>

            <StockSearch
            onSelect={(stock) => {
                console.log("SELECTED STOCK:", stock);

                setSelectedStock(stock);

                setForm((prev) => {
                const updated = {
                    ...prev,
                    symbol: stock.symbol,
                    name: stock.name,
                    exchange: stock.exchange || "NSE",
                    sector: stock.sector || "Unknown",
                };

                console.log("UPDATED FORM:", updated);

                return updated;
                });
            }}
            />
            </div>

            {selectedStock && (
            <div className="mt-3 rounded-lg border border-bg-border bg-bg-tertiary p-4">
                <h3 className="font-semibold text-text-primary">
                {selectedStock.symbol}
                </h3>

                <p className="text-sm text-text-secondary">
                {selectedStock.name}
                </p>

                <p className="text-xs text-text-muted mt-1">
                {selectedStock.exchange || "NSE"}
                {selectedStock.sector
                    ? ` • ${selectedStock.sector}`
                    : ""}
                </p>
            </div>
            )}
        <div>
  <label className="text-sm mb-1 block">
    Target Price (Optional)
  </label>

  <input
    type="number"
    className="input"
    placeholder="2500"
    value={form.targetPrice}
    onChange={(e) =>
      setForm({
        ...form,
        targetPrice: e.target.value,
      })
    }
  />
</div>

<div>
  <label className="text-sm mb-1 block">
    Notes (Optional)
  </label>

  <textarea
    rows={3}
    className="input"
    value={form.notes}
    onChange={(e) =>
      setForm({
        ...form,
        notes: e.target.value,
      })
    }
  />
</div>

          <button
            disabled={loading}
            className="btn-primary w-full h-11"
          >
            {loading ? "Adding..." : "Add to Watchlist"}
          </button>

        </form>

      </div>

    </div>
  );
}
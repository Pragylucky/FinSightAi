import { useState } from "react";
import { X, Search } from "lucide-react";
import api from "../../services/api";
import StockSearch from "../common/StockSearch";

export default function AddHoldingModal({
  open,
  onClose,
  onSuccess,
}) {
    const [selectedStock, setSelectedStock] = useState(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    symbol: "",
    name: "",
    quantity: "",
    averagePrice: "",
    notes: "",
  });

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.portfolio.addHolding({
        symbol: form.symbol.toUpperCase(),
        name: form.name,
        quantity: Number(form.quantity),
        averagePrice: Number(form.averagePrice),
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
            Add Holding
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

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm mb-1 block">
                Quantity
              </label>

              <input
                type="number"
                className="input"
                value={form.quantity}
                onChange={(e)=>
                  setForm({...form,quantity:e.target.value})
                }
              />
            </div>

            <div>
              <label className="text-sm mb-1 block">
                Buy Price
              </label>

              <input
                type="number"
                className="input"
                value={form.averagePrice}
                onChange={(e)=>
                  setForm({...form,averagePrice:e.target.value})
                }
              />
            </div>

          </div>

          <div>
            <label className="text-sm mb-1 block">
              Notes
            </label>

            <textarea
              rows={3}
              className="input"
              value={form.notes}
              onChange={(e)=>
                setForm({...form,notes:e.target.value})
              }
            />
          </div>

          <button
            disabled={loading}
            className="btn-primary w-full h-11"
          >
            {loading ? "Adding..." : "Add Holding"}
          </button>

        </form>

      </div>

    </div>
  );
}
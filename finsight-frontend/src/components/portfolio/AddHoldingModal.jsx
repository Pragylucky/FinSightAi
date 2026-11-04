import { useState } from 'react';
import api from '../../services/api';
import StockSearch from '../common/StockSearch';
import { Modal, ErrorNotice } from '../ui';

const EMPTY = { stock: null, quantity: '', averagePrice: '', notes: '' };

export default function AddHoldingModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Remount the search box when the modal reopens so it starts empty
  const [session, setSession] = useState(0);

  const close = () => {
    setForm(EMPTY);
    setError('');
    setSession((n) => n + 1);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.stock) {
      setError('Pick a stock from the search results first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.portfolio.addHolding({
        symbol: form.stock.symbol.toUpperCase(),
        name: form.stock.name,
        exchange: form.stock.exchange || 'NSE',
        sector: form.stock.sector || 'Unknown',
        quantity: Number(form.quantity),
        averagePrice: Number(form.averagePrice),
        notes: form.notes,
      });
      await onSuccess?.();
      close();
    } catch (err) {
      setError(err.message || 'Unable to add holding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add holding">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorNotice message={error} />

        <div>
          <label className="text-sm text-text-secondary mb-2 block">Stock</label>
          <StockSearch key={session} onSelect={(stock) => setForm((f) => ({ ...f, stock }))} />
          {form.stock && (
            <div className="mt-3 rounded-lg border border-bg-border bg-bg-tertiary p-3">
              <p className="font-semibold text-text-primary text-sm">{form.stock.symbol}</p>
              <p className="text-xs text-text-secondary">{form.stock.name}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block" htmlFor="qty">Quantity</label>
            <input id="qty" type="number" min="1" step="1" required className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block" htmlFor="avg">Buy price</label>
            <input id="avg" type="number" min="0.01" step="0.01" required className="input" value={form.averagePrice} onChange={(e) => setForm({ ...form, averagePrice: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="text-sm text-text-secondary mb-1 block" htmlFor="notes">Notes <span className="text-text-muted">(optional)</span></label>
          <textarea id="notes" rows={2} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button disabled={loading} className="btn-primary w-full h-11">{loading ? 'Adding…' : 'Add holding'}</button>
      </form>
    </Modal>
  );
}

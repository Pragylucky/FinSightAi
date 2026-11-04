import { useState } from 'react';
import api from '../../services/api';
import StockSearch from '../common/StockSearch';
import { Modal, ErrorNotice } from '../ui';

const EMPTY = { stock: null, targetPrice: '', notes: '' };

export default function AddWatchlistModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      await api.watchlist.add({
        symbol: form.stock.symbol.toUpperCase(),
        name: form.stock.name,
        exchange: form.stock.exchange || 'NSE',
        targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
        notes: form.notes,
      });
      await onSuccess?.();
      close();
    } catch (err) {
      setError(err.message || 'Unable to add to watchlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add to watchlist">
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

        <div>
          <label className="text-sm text-text-secondary mb-1 block" htmlFor="target">Target price <span className="text-text-muted">(optional)</span></label>
          <input id="target" type="number" min="0" step="0.01" className="input" value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} />
        </div>

        <div>
          <label className="text-sm text-text-secondary mb-1 block" htmlFor="wnotes">Notes <span className="text-text-muted">(optional)</span></label>
          <textarea id="wnotes" rows={2} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button disabled={loading} className="btn-primary w-full h-11">{loading ? 'Adding…' : 'Add to watchlist'}</button>
      </form>
    </Modal>
  );
}

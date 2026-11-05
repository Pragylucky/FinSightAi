import { useState } from 'react';
import api from '../../services/api';
import { Modal, ErrorNotice } from '../ui';

// The form mounts fresh each time a holding is opened, so its fields start from that holding's values
function EditForm({ holding, onClose, onSuccess }) {
  const [form, setForm] = useState({ quantity: String(holding.quantity), averagePrice: String(holding.averagePrice), notes: holding.notes || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.portfolio.updateHolding(holding.symbol, { quantity: Number(form.quantity), averagePrice: Number(form.averagePrice), notes: form.notes });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const usd = holding.currency === 'USD';

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNotice message={error} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-text-secondary mb-1 block" htmlFor="e-qty">Quantity</label>
          <input id="e-qty" type="number" min="0.0001" step="any" required className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-text-secondary mb-1 block" htmlFor="e-avg">Avg buy price <span className="text-text-muted">({usd ? '$' : '₹'})</span></label>
          <input id="e-avg" type="number" min="0.01" step="any" required className="input" value={form.averagePrice} onChange={(e) => setForm({ ...form, averagePrice: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-sm text-text-secondary mb-1 block" htmlFor="e-notes">Notes <span className="text-text-muted">(optional)</span></label>
        <textarea id="e-notes" rows={2} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <button disabled={loading} className="btn-primary w-full h-11">{loading ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

export default function EditHoldingModal({ holding, onClose, onSuccess }) {
  return (
    <Modal open={Boolean(holding)} onClose={onClose} title={holding ? `Edit ${holding.symbol}` : 'Edit holding'}>
      {holding && <EditForm key={holding.symbol} holding={holding} onClose={onClose} onSuccess={onSuccess} />}
    </Modal>
  );
}

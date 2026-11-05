// Thumbs up/down on an AI answer. A thumbs-down asks why, so the signal is actionable.
// Votes go to /ai/feedback and feed the helpful-rate metric on the AI stats endpoint.

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import api from '../../services/api';

const REASONS = [
  ['wrong-data', 'Wrong numbers'],
  ['unclear', 'Unclear'],
  ['too-generic', 'Too generic'],
  ['unhelpful', 'Not helpful'],
];

export default function Feedback({ kind, refId, className = '' }) {
  const [vote, setVote] = useState(0);          // 0 none, 1 up, -1 down
  const [reasonOpen, setReasonOpen] = useState(false);
  const [done, setDone] = useState(false);

  const send = (rating, reason = null) => {
    api.ai.feedback({ kind, ref: refId, rating, reason }).catch(() => { /* feedback must never get in the way */ });
  };

  const up = () => { setVote(1); setReasonOpen(false); setDone(true); send(1); };
  const down = () => { setVote(-1); setReasonOpen(true); setDone(false); send(-1); };
  const pickReason = (reason) => { send(-1, reason); setReasonOpen(false); setDone(true); };

  return (
    <div className={`flex items-center gap-2 text-xs text-text-muted ${className}`}>
      {!reasonOpen && (
        <>
          <button onClick={up} aria-label="Helpful" aria-pressed={vote === 1} className={`p-1 rounded hover:text-accent-green transition-colors ${vote === 1 ? 'text-accent-green' : ''}`}>
            <ThumbsUp size={13} />
          </button>
          <button onClick={down} aria-label="Not helpful" aria-pressed={vote === -1} className={`p-1 rounded hover:text-accent-red transition-colors ${vote === -1 ? 'text-accent-red' : ''}`}>
            <ThumbsDown size={13} />
          </button>
        </>
      )}
      {reasonOpen && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="What was wrong?">
          <span>What was wrong?</span>
          {REASONS.map(([key, label]) => (
            <button key={key} onClick={() => pickReason(key)} className="px-2 py-0.5 rounded-full border border-bg-border hover:border-accent-primary/50 hover:text-text-primary transition-colors">{label}</button>
          ))}
        </div>
      )}
      {done && !reasonOpen && <span className="flex items-center gap-1 text-accent-green"><Check size={12} /> Thanks for the feedback</span>}
    </div>
  );
}

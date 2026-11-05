// Chat.jsx — AI assistant

import { useState, useRef, useEffect, useLayoutEffect, Fragment } from 'react';
import { Send, Zap, User, RefreshCw, Copy, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { chatSuggestions } from '../data/mockData';
import api from '../services/api';
import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';

const WELCOME = "Hi, I'm FinSight AI.\n\nI can help you:\n• Analyse a stock or company\n• Explain terms like PE ratio, EBITDA or ROE\n• Compare funds or stocks\n• Make sense of market news\n\nWhat would you like to know?";
const now = () => Date.now();

// ── Safe mini-markdown renderer (no innerHTML) ───────────────────────────────
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-text-primary font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="px-1 py-0.5 rounded bg-bg-tertiary font-mono text-xs text-accent-primary">{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isDivider = (l) => /^\s*\|[\s:|-]+\|\s*$/.test(l);
const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

function Markdown({ text }) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (isTableRow(line)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) { if (!isDivider(lines[i])) rows.push(cells(lines[i])); i += 1; }
      i -= 1;
      const [head, ...body] = rows;
      out.push(
        <div key={i} className="overflow-x-auto my-2">
          <table className="text-xs w-full">
            <thead><tr className="border-b border-bg-border">{head.map((c, j) => <th key={j} className="text-left py-1.5 pr-4 text-text-primary font-semibold">{inline(c)}</th>)}</tr></thead>
            <tbody>{body.map((r, k) => <tr key={k} className="border-b border-bg-border/50 last:border-0">{r.map((c, j) => <td key={j} className="py-1.5 pr-4 text-text-secondary">{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }

    const bullet = line.match(/^\s*[•\-*]\s+(.*)/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    const heading = line.match(/^#{1,4}\s+(.*)/);

    if (bullet) out.push(<div key={i} className="flex gap-2 text-sm text-text-secondary leading-relaxed"><span className="text-accent-primary">•</span><span>{inline(bullet[1])}</span></div>);
    else if (numbered) out.push(<div key={i} className="flex gap-2 text-sm text-text-secondary leading-relaxed"><span className="font-mono text-accent-primary">{numbered[1]}.</span><span>{inline(numbered[2])}</span></div>);
    else if (heading) out.push(<p key={i} className="text-sm font-semibold text-text-primary pt-1">{inline(heading[1])}</p>);
    else if (!line.trim()) out.push(<div key={i} className="h-2" />);
    else out.push(<p key={i} className="text-sm leading-relaxed text-text-secondary">{inline(line)}</p>);
  }
  return <div className="space-y-1">{out}</div>;
}

function Message({ msg }) {
  const isAI = msg.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <motion.div
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isAI ? 'bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/20' : 'bg-bg-tertiary border border-bg-border'}`}>
        {isAI ? <Zap size={14} className="text-white" /> : <User size={14} className="text-text-secondary" />}
      </div>

      <div className={`min-w-0 max-w-[85%] sm:max-w-[80%] ${!isAI ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${isAI ? 'bg-bg-secondary border border-bg-border rounded-tl-none' : 'bg-accent-primary/10 border border-accent-primary/20 rounded-tr-none'}`}>
          {isAI ? <Markdown text={msg.content} /> : <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-words">{msg.content}</p>}
        </div>

        <div className="flex items-center gap-2 mt-1.5 mx-1 text-xs text-text-muted">
          <span>{new Date(msg.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          {isAI && (
            <button onClick={copyText} aria-label="Copy reply" className="hover:text-text-secondary transition-colors flex items-center gap-1">
              {copied ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
              {copied && <span className="text-accent-green">Copied</span>}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <motion.div className="flex gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shrink-0">
        <Zap size={14} className="text-white" />
      </div>
      <div className="bg-bg-secondary border border-bg-border rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5" aria-label="FinSight is thinking">
        {[0, 1, 2].map((d) => (
          <span key={d} className="w-1.5 h-1.5 rounded-full bg-accent-primary" style={{ animation: `blink-dot 1.2s ${d * 0.15}s infinite` }} />
        ))}
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: WELCOME, at: now() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  // Auto-grow the textarea up to 120px
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;

    const history = [...messages, { role: 'user', content, at: now() }];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      // The welcome message is UI-only; don't send it to the model as history.
      const payload = history.slice(1).map(({ role, content: c }) => ({ role, content: c }));
      const data = await api.ai.chat(payload);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message, at: now() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `I couldn't answer that: ${err.message}`, at: now() }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => setMessages([{ role: 'assistant', content: WELCOME, at: now() }]);
  const canSend = input.trim() && !loading;

  return (
    <div className="flex flex-col w-full min-w-0 h-[calc(100vh-150px)] min-h-[420px]">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">AI Chat Assistant</h1>
          <p className="text-text-secondary text-sm">Ask about stocks, markets or financial concepts</p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary border border-bg-border rounded-lg hover:bg-bg-secondary transition-colors">
          <RefreshCw size={14} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-2 pb-4 min-h-0" aria-live="polite">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        <AnimatePresence>{loading && <Typing key="typing" />}</AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div className="mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <p className="text-text-muted text-xs mb-2 font-medium uppercase tracking-wider">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {chatSuggestions.slice(0, 6).map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 bg-bg-secondary border border-bg-border rounded-full text-xs text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-colors"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3 bg-bg-secondary border border-bg-border rounded-xl p-3 focus-within:border-accent-primary/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all">
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Message"
          placeholder="Ask about a stock, a concept, a trend…  (Enter to send, Shift+Enter for a new line)"
          rows={1}
          className="flex-1 bg-transparent text-text-primary text-sm resize-none outline-none placeholder:text-text-muted py-2"
        />
        <motion.button
          onClick={() => send()}
          disabled={!canSend}
          aria-label="Send"
          whileTap={canSend ? { scale: 0.9 } : undefined}
          className={`p-2.5 rounded-lg shrink-0 transition-colors ${canSend ? 'bg-accent-primary text-white hover:bg-accent-primary/90' : 'bg-bg-tertiary text-text-muted cursor-not-allowed'}`}
        >
          <Send size={16} />
        </motion.button>
      </div>
      <p className="text-center text-xs text-text-muted mt-2">Educational only · Not financial advice</p>
    </div>
  );
}

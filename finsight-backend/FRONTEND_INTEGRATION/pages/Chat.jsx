import { useState, useRef, useEffect } from 'react';
import { Send, Zap, User, Loader2, RefreshCw, Copy, ThumbsUp, ThumbsDown, History } from 'lucide-react';
import { chatSuggestions } from '../data/mockData';
import api from '../services/api';

function Message({ msg }) {
  const isAI = msg.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown renderer: **bold**, bullet points, line breaks
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');
      if (line.startsWith('•') || line.match(/^[-*]\s/)) {
        return (
          <li key={i} className="ml-4 text-text-secondary text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/^[•\-*]\s*/, '') }} />
        );
      }
      if (!line.trim()) return <br key={i} />;
      return <p key={i} className="text-sm leading-relaxed text-text-secondary"
        dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
        isAI ? 'bg-gradient-to-br from-accent-cyan to-accent-purple' : 'bg-bg-tertiary border border-bg-border'
      }`}>
        {isAI ? <Zap size={14} className="text-bg-primary" /> : <User size={14} className="text-text-secondary" />}
      </div>
      <div className={`flex-1 max-w-[80%] ${!isAI ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isAI
            ? 'bg-bg-secondary border border-bg-border rounded-tl-none'
            : 'bg-accent-cyan/10 border border-accent-cyan/20 rounded-tr-none'
        }`}>
          <div className="space-y-1">{renderContent(msg.content)}</div>
        </div>
        {isAI && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <button onClick={copyText} className="text-text-muted hover:text-text-secondary transition-colors">
              <Copy size={12} />
            </button>
            {copied && <span className="text-xs text-accent-green">Copied!</span>}
            <button className="text-text-muted hover:text-accent-green transition-colors"><ThumbsUp size={12} /></button>
            <button className="text-text-muted hover:text-accent-red transition-colors"><ThumbsDown size={12} /></button>
          </div>
        )}
        <p className="text-xs text-text-muted mt-1 mx-1">
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm FinSight AI, powered by Claude.\n\nI can help you:\n• Analyze any stock or company\n• Explain financial concepts (PE ratio, EBITDA, ROE...)\n• Compare funds or stocks\n• Answer investment questions\n\nWhat would you like to know today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);  // tracks current backend chat session
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // ← REAL: POST /api/chat/message → calls Claude API on backend
      // Backend saves history in MongoDB and returns AI response
      const data = await api.chat.send(text, chatId);
      setChatId(data.chatId);    // save session ID for continuity
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setError(err.message || 'AI is temporarily unavailable. Please try again.');
      // Remove the user message if it failed (so they can retry)
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChatId(null);
    setMessages([{
      role: 'assistant',
      content: "New chat started! What would you like to explore?",
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">AI Chat Assistant</h1>
          <p className="text-text-secondary text-sm">Powered by Claude · Answers backed by live financial data</p>
        </div>
        <button onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary border border-bg-border rounded-lg hover:bg-bg-secondary transition-all">
          <RefreshCw size={14} /> New chat
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 pb-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shrink-0">
              <Zap size={14} className="text-bg-primary" />
            </div>
            <div className="bg-bg-secondary border border-bg-border rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">FinSight AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto px-4 py-2 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red text-center">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown on fresh chat only) */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-2 font-medium uppercase tracking-wider">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {chatSuggestions.slice(0, 6).map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="px-3 py-1.5 bg-bg-secondary border border-bg-border rounded-full text-xs text-text-secondary hover:text-text-primary hover:border-accent-cyan/30 hover:bg-bg-tertiary transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 bg-bg-secondary border border-bg-border rounded-xl p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about any stock, financial concept, or market trend... (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent text-text-primary text-sm resize-none outline-none placeholder:text-text-muted"
          style={{ maxHeight: '120px' }}
        />
        <button onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className={`p-2.5 rounded-lg transition-all shrink-0 ${
            input.trim() && !loading
              ? 'bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90'
              : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
          }`}>
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-xs text-text-muted mt-2">
        FinSight AI · Claude-powered · Educational purposes only · Not financial advice
      </p>
    </div>
  );
}

// Chat.jsx
// AI Chat Assistant page
// Uses mock responses for now — replace with real AI API calls when backend ready

import { useState, useRef, useEffect } from 'react';
import { Send, Zap, User, Loader2, RefreshCw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { chatSuggestions } from '../data/mockData';

// Mock AI response generator
// TODO: Replace with real API call: POST /api/chat/message
const getMockResponse = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes('tcs') || msg.includes('tata consultancy')) {
    return `**TCS (Tata Consultancy Services) Analysis:**

TCS is India's largest IT company and a global leader in technology services. Here's a quick breakdown:

**Current Status:**
• Stock Price: ₹3,842 | PE Ratio: 28.4x
• Market Cap: ₹14 Lakh Crore (India's most valuable company by market cap at times)
• Revenue Growth: 8.7% YoY | Net Margin: 24%+

**Should you invest?**
TCS is often considered a "blue-chip" stock — stable, dividend-paying, and unlikely to disappear. For long-term investors (5+ years), TCS makes sense as a core holding.

**Key risks to watch:**
• US tech spending slowdown could reduce deal wins
• High PE of 28x means limited near-term upside
• Rupee appreciation hurts export revenue

**Bottom line:** TCS is a quality business at a fair (not cheap) price. Suitable for long-term SIP-style investment rather than short-term trading.

⚠️ *This is educational analysis only — not financial advice. Always do your own research.*`;
  }

  if (msg.includes('ebitda')) {
    return `**What is EBITDA? (Simply explained)**

EBITDA = **E**arnings **B**efore **I**nterest, **T**axes, **D**epreciation & **A**mortization

Think of it as the money a business makes from its actual operations, before:
• Paying interest on loans (bank's cut)
• Paying taxes (government's cut)
• Accounting for equipment aging (depreciation)

**Why it matters:**
EBITDA helps compare companies fairly regardless of how they're financed or taxed. It shows core business profitability.

**Simple example:**
TCS Revenue: ₹60,000 Cr
→ Minus staff costs, rent, etc.
→ **EBITDA: ₹15,000 Cr** ← "operational profit"
→ Minus depreciation on servers/equipment: ₹500 Cr
→ EBIT: ₹14,500 Cr
→ Minus loan interest: ₹200 Cr
→ Minus taxes: ₹3,500 Cr
→ **Net Profit: ₹10,800 Cr** ← what shareholders actually get

**EBITDA Margin** = EBITDA / Revenue × 100 → Higher is better!`;
  }

  if (msg.includes('pe') || msg.includes('p/e') || msg.includes('pe ratio')) {
    return `**PE Ratio Explained Simply**

PE Ratio = Price Per Share ÷ Earnings Per Share

It tells you: **"How many rupees are you paying for every ₹1 of profit?"**

**Example with TCS:**
• Price: ₹3,842
• EPS (Earnings Per Share): ₹135
• PE = 3842 ÷ 135 = **28.4x**

This means: you pay ₹28.4 for every ₹1 TCS earns.

**How to use PE:**
| PE Range | What it suggests |
|----------|-----------------|
| < 15 | Potentially undervalued (or slow growth) |
| 15-25 | Fair value for most companies |
| 25-40 | Growth premium — market expects high growth |
| 40+ | Expensive — needs to justify with strong growth |

**Important:** PE only makes sense when comparing companies in the SAME sector. A bank at PE 12 isn't "cheaper" than an IT company at PE 25 — they're different businesses.

**High PE ≠ Bad. Low PE ≠ Good.** Context always matters!`;
  }

  if (msg.includes('compare') && (msg.includes('infosys') || msg.includes('infy') || msg.includes('wipro'))) {
    return `**Infosys vs Wipro — Head to Head**

| Metric | Infosys (INFY) | Wipro |
|--------|---------------|-------|
| Price | ₹1,456 | ₹456 |
| Market Cap | ₹6 Lakh Cr | ₹2.4 Lakh Cr |
| PE Ratio | 23.6x | 20.4x |
| Revenue Growth | 4.2% | 3.2% |
| Net Margin | 17% | 16% |
| ROE | 32.4% | 17.8% |
| Dividend Yield | 2.34% | 0.56% |

**Key Differences:**

🟢 **Infosys Strengths:**
• Higher ROE (more efficient with shareholder money)
• Better dividend yield for income investors
• Stronger AI/Cloud transformation narrative

🟡 **Wipro Strengths:**
• Lower PE — slightly cheaper valuation
• Stronger M&A strategy (40+ acquisitions)
• Better growth in Europe segment

**My take:**
If forced to choose between the two, Infosys generally wins on quality metrics — higher ROE, better margins, more consistent guidance. But Wipro's lower valuation could offer better risk-reward if execution improves under new CEO.

Neither is growing as fast as TCS — keep that in mind!`;
  }

  if (msg.includes('mutual fund') || msg.includes('sip') || msg.includes('mf')) {
    return `**Mutual Funds & SIP — Beginner Guide**

**What is a Mutual Fund?**
A pool of money collected from many investors, managed by professional fund managers who invest it in stocks/bonds on your behalf.

**What is SIP?**
Systematic Investment Plan — investing a fixed amount (e.g., ₹5,000) every month automatically. Like an EMI, but for wealth creation.

**Types of Mutual Funds (simplified):**

📊 **By asset class:**
• Equity Funds → Invest in stocks (high risk, high return)
• Debt Funds → Bonds, FDs (low risk, stable return)
• Hybrid Funds → Mix of both

📊 **By market cap:**
• Large Cap → Top 100 companies (TCS, HDFC) — stable
• Mid Cap → Companies 101-250 — more growth potential
• Small Cap → Beyond 250 — high risk, high reward

**For a 22-year-old starting out:**
1. Start with a Nifty 50 Index Fund (low cost, diversified)
2. Add a Flexi Cap Fund (Parag Parikh is popular)
3. Keep investing every month regardless of market ups/downs

**Rule of thumb:** The younger you are, the more equity you can hold. SIP for 15+ years and compounding does the magic.`;
  }

  // Default response for anything else
  return `I understand you're asking about: **"${message}"**

I'm FinSight AI, your financial research assistant. I can help you with:

📊 **Company Analysis** — Ask about any stock: "What is TCS's PE ratio?" or "Analyze HDFC Bank"

💡 **Financial Concepts** — "Explain EBITDA", "What is PE ratio?", "How does SIP work?"

📈 **Stock Comparison** — "Compare Infosys and Wipro" or "TCS vs Infosys"

📰 **Market Events** — "Why did Zomato fall today?" or "What happened to Reliance?"

🏦 **Mutual Funds** — "Best mutual funds for beginners" or "What is expense ratio?"

Try one of the example questions below or type your specific question!

⚠️ *Remember: I provide educational information only. Always consult a SEBI-registered advisor before investing real money.*`;
};

// Message bubble component
function Message({ msg }) {
  const isAI = msg.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-ish renderer for bold, bullet points
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');
      // Bullet points
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <li key={i}
            className="ml-4 text-text-secondary text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/^[•-]\s*/, '') }}
          />
        );
      }
      // Empty lines
      if (!line.trim()) return <br key={i} />;
      // Normal lines
      return (
        <p key={i}
          className="text-sm leading-relaxed text-text-secondary"
          dangerouslySetInnerHTML={{ __html: line }}
        />
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
        isAI ? 'bg-gradient-to-br from-accent-cyan to-accent-purple' : 'bg-bg-tertiary border border-bg-border'
      }`}>
        {isAI ? <Zap size={14} className="text-bg-primary" /> : <User size={14} className="text-text-secondary" />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[80%] ${!isAI ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isAI
            ? 'bg-bg-secondary border border-bg-border rounded-tl-none'
            : 'bg-accent-cyan/10 border border-accent-cyan/20 rounded-tr-none'
        }`}>
          <div className="space-y-1">
            {renderContent(msg.content)}
          </div>
        </div>

        {/* Actions for AI messages */}
        {isAI && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <button onClick={copyText} className="text-text-muted hover:text-text-secondary transition-colors">
              <Copy size={12} />
            </button>
            {copied && <span className="text-xs text-accent-green">Copied!</span>}
            <button className="text-text-muted hover:text-accent-green transition-colors">
              <ThumbsUp size={12} />
            </button>
            <button className="text-text-muted hover:text-accent-red transition-colors">
              <ThumbsDown size={12} />
            </button>
          </div>
        )}

        {/* Timestamp */}
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
      content: "Hey! I'm FinSight AI, your personal financial research assistant.\n\nI can help you:\n• Analyze any stock or company\n• Explain financial concepts (PE ratio, EBITDA, ROE...)\n• Compare funds or stocks\n• Summarize market news\n• Answer any investment question\n\nWhat would you like to know today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new message appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate network delay
    // TODO: Replace with real API call:
    // const res = await fetch('/api/chat/message', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //   body: JSON.stringify({ message: text, history: messages }),
    // });
    // const data = await res.json();
    // const aiResponse = data.message;

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800));
    const aiResponse = getMockResponse(text);

    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! Start a new conversation. What would you like to explore?",
    }]);
  };

  return (
    <div className="flex flex-col flex-1 page-enter">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">AI Chat Assistant</h1>
          <p className="text-text-secondary text-sm">Ask anything about stocks, markets, or financial concepts</p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary border border-bg-border rounded-lg hover:bg-bg-secondary transition-all"
        >
          <RefreshCw size={14} />
          New chat
        </button>
      </div>

      {/* ── CHAT AREA ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 pb-4 min-h-0">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shrink-0">
              <Zap size={14} className="text-bg-primary" />
            </div>
            <div className="bg-bg-secondary border border-bg-border rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">FinSight is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── SUGGESTIONS ───────────────────────────────────────────────── */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-2 font-medium uppercase tracking-wider">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {chatSuggestions.slice(0, 6).map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="px-3 py-1.5 bg-bg-secondary border border-bg-border rounded-full text-xs text-text-secondary hover:text-text-primary hover:border-accent-cyan/30 hover:bg-bg-tertiary transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── INPUT ─────────────────────────────────────────────────────── */}
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
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className={`p-2.5 rounded-lg transition-all shrink-0 ${
            input.trim() && !loading
              ? 'bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90'
              : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-xs text-text-muted mt-2">
        FinSight AI · Educational purposes only · Not financial advice
      </p>
    </div>
  );
}

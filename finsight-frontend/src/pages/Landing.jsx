// Landing.jsx
// The public homepage — first thing users see before logging in
// Goal: communicate value quickly and get them to sign up

import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, MessageSquareText, Shield, BarChart3, Newspaper, ArrowRight, Star, ChevronRight } from 'lucide-react';

// Feature cards data
const features = [
  {
    icon: MessageSquareText,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    title: 'AI Chat Assistant',
    description: 'Ask anything — "Should I buy TCS?" or "Explain this balance sheet" — get instant intelligent answers backed by real financial data.',
  },
  {
    icon: BarChart3,
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10 border-accent-purple/20',
    title: 'Deep Company Analysis',
    description: 'Live stock prices, PE ratios, financials, shareholding patterns, AI-generated pros/cons and investment outlook for any listed company.',
  },
  {
    icon: TrendingUp,
    color: 'text-accent-green',
    bg: 'bg-accent-green/10 border-accent-green/20',
    title: 'Portfolio Tracker',
    description: 'Track your holdings, P&L, sector allocation, diversification score, and risk analysis — all in one dashboard.',
  },
  {
    icon: Newspaper,
    color: 'text-accent-yellow',
    bg: 'bg-accent-yellow/10 border-accent-yellow/20',
    title: 'AI News Summarizer',
    description: 'Get AI-powered summaries and sentiment scores for every financial news article. Know if it\'s bullish or bearish in seconds.',
  },
  {
    icon: Shield,
    color: 'text-accent-red',
    bg: 'bg-accent-red/10 border-accent-red/20',
    title: 'Stock Screener',
    description: 'Filter thousands of stocks by PE, ROE, debt, market cap, dividend yield, sector, and growth metrics with one click.',
  },
  {
    icon: Star,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    title: 'Mutual Fund Analysis',
    description: 'Compare funds by returns, expense ratio, AUM, risk level and ratings. Find the best SIP for your goals.',
  },
];

// Mock ticker for landing page
const landingTicker = [
  { s: 'NIFTY', v: '23,456', c: '+0.67%', up: true },
  { s: 'SENSEX', v: '76,890', c: '+0.72%', up: true },
  { s: 'TCS', v: '₹3,842', c: '+1.24%', up: true },
  { s: 'RELIANCE', v: '₹2,891', c: '+2.15%', up: true },
  { s: 'TSLA', v: '$234', c: '-2.34%', up: false },
  { s: 'INFY', v: '₹1,456', c: '-0.87%', up: false },
  { s: 'HDFC', v: '₹1,678', c: '+0.56%', up: true },
  { s: 'BAJFIN', v: '₹7,234', c: '+3.12%', up: true },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-bg-border bg-bg-primary/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Zap size={16} className="text-bg-primary" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">FinSight AI</span>
          </div>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost text-sm"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-sm py-2 px-4"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* ── MINI TICKER ──────────────────────────────────────────────────── */}
      <div className="bg-bg-secondary border-b border-bg-border py-2 overflow-hidden ticker-wrap">
        <div className="ticker-content flex gap-8">
          {[...landingTicker, ...landingTicker].map((item, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-text-muted font-semibold">{item.s}</span>
              <span className="text-xs font-mono text-text-primary">{item.v}</span>
              <span className={`text-xs font-mono font-semibold ${item.up ? 'text-accent-green' : 'text-accent-red'}`}>{item.c}</span>
              <span className="text-bg-border">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded-full text-xs text-accent-cyan font-medium mb-6">
            <Zap size={12} fill="currentColor" />
            AI-Powered Financial Intelligence Platform
          </div>

          {/* Main headline */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-tight mb-6">
            Understand stocks, funds &<br />
            <span className="gradient-text">markets like a pro</span>
          </h1>

          {/* Subtitle */}
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            FinSight AI combines real-time market data, financial analysis, and conversational AI to help everyday investors make smarter decisions — no MBA required.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary flex items-center gap-2 text-base px-8 py-3"
            >
              Start for free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center gap-2 text-base px-8 py-3"
            >
              View live demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { num: '5,000+', label: 'Stocks covered' },
              { num: '500+', label: 'Mutual funds' },
              { num: 'Real-time', label: 'Market data' },
              { num: 'AI-powered', label: 'Analysis engine' },
            ].map((stat) => (
              <div key={stat.num}>
                <p className="font-display font-bold text-2xl gradient-text">{stat.num}</p>
                <p className="text-text-muted text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-2xl border border-bg-border bg-bg-secondary overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-bg-tertiary border-b border-bg-border">
              <div className="w-3 h-3 rounded-full bg-accent-red/60" />
              <div className="w-3 h-3 rounded-full bg-accent-yellow/60" />
              <div className="w-3 h-3 rounded-full bg-accent-green/60" />
              <div className="flex-1 mx-4 bg-bg-secondary rounded-md px-3 py-1 text-xs text-text-muted font-mono">
                finsight.ai/dashboard
              </div>
            </div>
            
            {/* Mock dashboard content */}
            <div className="p-6 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: 'Portfolio Value', v: '₹8,47,235', c: '+3.24%', pos: true },
                  { l: 'Total P&L', v: '+₹35,235', c: '+4.34%', pos: true },
                  { l: 'Nifty 50', v: '23,456', c: '+0.67%', pos: true },
                  { l: 'SENSEX', v: '76,890', c: '+0.72%', pos: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-bg-tertiary rounded-lg p-3 border border-bg-border">
                    <p className="text-text-muted text-xs mb-1">{stat.l}</p>
                    <p className="font-mono font-bold text-text-primary text-sm">{stat.v}</p>
                    <p className={`text-xs font-mono ${stat.pos ? 'text-accent-green' : 'text-accent-red'}`}>{stat.c}</p>
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="bg-bg-tertiary rounded-lg p-4 border border-bg-border">
                <p className="text-text-secondary text-sm mb-3 font-medium">Portfolio Performance</p>
                <div className="h-24 flex items-end gap-1">
                  {[40, 35, 55, 48, 62, 58, 70, 65, 80, 75, 88, 85, 92, 90, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: i === 14
                          ? 'linear-gradient(180deg, #00D4FF, #0099BB)'
                          : '#1E2D45',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Holdings preview */}
              <div className="grid grid-cols-2 gap-3">
                {['TCS', 'HDFC', 'RELIANCE', 'INFY'].map((s, i) => (
                  <div key={s} className="flex items-center justify-between bg-bg-tertiary rounded-lg px-3 py-2 border border-bg-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-bg-secondary flex items-center justify-center text-xs font-bold text-accent-cyan">{s[0]}</div>
                      <span className="text-sm font-medium text-text-primary">{s}</span>
                    </div>
                    <span className={`text-xs font-mono ${i % 3 !== 1 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {i % 3 !== 1 ? '+' : ''}{['+5.3%', '-1.2%', '+7.8%', '+2.1%'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-4">
            Everything you need to invest smarter
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            From company deep-dives to AI chat to portfolio tracking — FinSight covers the full investor workflow in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-bg-secondary border border-bg-border rounded-xl p-6 hover:border-accent-cyan/30 transition-all hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon size={22} className={f.color} />
              </div>
              <h3 className="font-display font-semibold text-text-primary text-lg mb-2 group-hover:text-accent-cyan transition-colors">
                {f.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-bg-secondary border-y border-bg-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-4">
              Research like a fund manager, in minutes
            </h2>
            <p className="text-text-secondary text-lg">Three steps from question to investment decision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search or ask', desc: 'Type a company name or ask the AI anything — "Is TCS a good buy?" or "What mutual fund suits a 25-year-old?"' },
              { step: '02', title: 'Analyze with AI', desc: 'Get AI-generated summaries, financial ratios, news sentiment, pros/cons, and risk scores — all in plain English.' },
              { step: '03', title: 'Track & decide', desc: 'Add to watchlist, build your portfolio, set price alerts, and track your investments over time.' },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 mb-4">
                  <span className="font-mono font-bold text-accent-cyan text-lg">{step.step}</span>
                </div>
                <h3 className="font-display font-semibold text-text-primary text-lg mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-4">
          Start your research journey today
        </h2>
        <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
          Free to get started. No credit card required. Access AI-powered financial research instantly.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="btn-primary flex items-center gap-2 text-base px-8 py-3 mx-auto"
        >
          Create free account
          <ChevronRight size={18} />
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-bg-border bg-bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Zap size={12} className="text-bg-primary" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-text-primary">FinSight AI</span>
          </div>
          <p className="text-text-muted text-sm">
            For educational purposes only. Not financial advice. Always do your own research.
          </p>
        </div>
      </footer>
    </div>
  );
}

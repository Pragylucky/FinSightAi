// Landing.jsx — public marketing page

import { Link } from 'react-router-dom';
import { Zap, TrendingUp, TrendingDown, MessageSquareText, SlidersHorizontal, BarChart3, Newspaper, ArrowRight, ChevronRight, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GuestButton } from '../components/auth/AuthShell';
import { motion, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Reveal, CountUp } from '../components/motion';
import useApi from '../lib/useApi';
import api from '../services/api';
import { trackSpotlight, EASE } from '../lib/motion';

const features = [
  { icon: MessageSquareText, color: 'text-accent-primary', bg: 'bg-accent-primary/10 border-accent-primary/20', title: 'AI chat assistant', description: 'Ask "Is TCS overvalued?" or "Explain this balance sheet" and get a plain-English answer.' },
  { icon: BarChart3, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10 border-accent-secondary/20', title: 'Company analysis', description: 'Live quote, price chart, quarterly results, key ratios and an AI-written summary for any NSE-listed company.' },
  { icon: TrendingUp, color: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/20', title: 'Portfolio tracker', description: 'Log your holdings and see invested value, current value and P&L at live prices.' },
  { icon: Newspaper, color: 'text-accent-warn', bg: 'bg-accent-warn/10 border-accent-warn/20', title: 'Market news', description: 'Searchable headlines, filtered by topic, stock and mood, with a bullish / bearish read on each story.' },
  { icon: SlidersHorizontal, color: 'text-accent-red', bg: 'bg-accent-red/10 border-accent-red/20', title: 'Stock screener', description: 'Filter ~265 large, mid and small caps by sector, market cap, PE and ROE. Sort by growth or dividend yield.' },
  { icon: Scale, color: 'text-accent-primary', bg: 'bg-accent-primary/10 border-accent-primary/20', title: 'Compare stocks', description: 'Put up to four companies side by side: normalized performance chart and a metrics table with the best value highlighted.' },
];

const steps = [
  { step: '01', title: 'Search or ask', desc: 'Type a company name, or ask the AI a question like "What fund suits a 25-year-old?"' },
  { step: '02', title: 'Read the analysis', desc: 'See ratios, results, news and an AI-written summary with strengths and risks.' },
  { step: '03', title: 'Track and decide', desc: 'Add stocks to your watchlist, record holdings and watch your portfolio over time.' },
];

const previewBars = [40, 35, 55, 48, 62, 58, 70, 65, 80, 75, 88, 85, 92, 90, 95];

const headline = ['Understand', 'stocks,', 'funds', '&'];

// Soft glow that follows the cursor across the hero
function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const left = useTransform(x, (v) => v - 250);
  const top = useTransform(y, (v) => v - 250);
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left); y.set(e.clientY - r.top); }}
      style={{ pointerEvents: 'auto', zIndex: 0 }}
      aria-hidden="true"
    >
      <motion.div style={{ left, top }} className="absolute w-[500px] h-[500px] rounded-full bg-accent-primary/10 blur-3xl" />
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-0.5 origin-left bg-gradient-to-r from-accent-primary to-accent-secondary z-[60]" />;
}

const fetchPulse = () => api.market.pulse();

// Real market data from the public endpoint. If it can't load, the whole block quietly disappears.
function MarketPulse({ cta }) {
  const { data } = useApi(fetchPulse);
  if (!data?.indices?.length) return null;

  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <Reveal className="text-center mb-10">
        <p className="inline-flex items-center gap-2 text-xs font-medium text-accent-green mb-3">
          <span className="relative flex w-2 h-2"><span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-accent-green" /></span>
          LIVE FROM THE MARKET
        </p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary">This isn&apos;t a mockup</h2>
        <p className="text-text-secondary mt-2">Real prices, pulled from NSE and BSE as you load the page.</p>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-5">
        {data.indices.map((i, k) => (
          <Reveal key={i.name} delay={k * 0.06}>
            <div className="bg-bg-secondary/90 border border-bg-border rounded-xl p-4 hover:border-accent-primary/30 transition-colors">
              <p className="text-xs text-text-muted mb-1">{i.name}</p>
              <p className="font-mono font-bold text-xl text-text-primary"><CountUp value={i.value} decimals={2} /></p>
              <p className={`flex items-center gap-1 text-xs font-mono font-semibold mt-1 ${i.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {i.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{i.change >= 0 ? '+' : ''}{i.change.toFixed(2)}%
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[['Top gainers today', data.gainers, 'text-accent-green'], ['Top losers today', data.losers, 'text-accent-red']].map(([title, list, tone], k) => (
          <Reveal key={title} delay={0.1 + k * 0.1}>
            <div className="bg-bg-secondary/90 border border-bg-border rounded-xl p-5 h-full">
              <h3 className="font-display font-semibold text-text-primary mb-3">{title}</h3>
              <ul className="divide-y divide-bg-border">
                {list.map((s) => (
                  <li key={s.symbol} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center text-xs font-bold font-mono text-accent-primary">{s.symbol[0]}</div>
                      <div className="min-w-0"><p className="text-sm font-semibold text-text-primary">{s.symbol}</p><p className="text-xs text-text-muted truncate">{s.name}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-mono text-text-primary">₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p><p className={`text-xs font-mono font-semibold ${tone}`}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="text-center mt-8">{cta}</Reveal>
    </section>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden">
      <ScrollProgress />
      <div className="app-bg" aria-hidden="true" />
      <div className="aurora aurora-a" aria-hidden="true" />
      <div className="aurora aurora-b" aria-hidden="true" />
      <div className="aurora aurora-c" aria-hidden="true" />

      {/* NAV */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="sticky top-0 z-50 border-b border-bg-border bg-bg-primary/70 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">FinSight AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">Open dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get started</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative">
        <CursorGlow />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full text-xs text-accent-primary font-medium mb-6"
          >
            <Zap size={12} fill="currentColor" />
            Stock research with an AI assistant built in
          </motion.div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-text-primary leading-[1.08] mb-6">
            {headline.map((w, i) => (
              <motion.span
                key={w + i}
                className="inline-block mr-[0.25em]"
                initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.08 }}
              >
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="gradient-text inline-block"
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            >
              markets like a pro
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
            className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            FinSight pulls together market data, company financials and a conversational AI, so you can research an investment without a finance degree.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.85 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link to={user ? '/dashboard' : '/signup'} className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              {user ? 'Go to dashboard' : 'Start for free'}
              <ArrowRight size={18} />
            </Link>
            {!user && <GuestButton className="btn-secondary text-base px-8 py-3">Try it as a guest</GuestButton>}
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1 } } }}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {[
              ['265+', 'NSE stocks tracked live'],
              ['AI', 'Company summaries'],
              ['Daily', 'Mutual fund NAVs'],
              ['Free', 'To sign up'],
            ].map(([a, b]) => (
              <motion.li key={a} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="text-center">
                <p className="font-display font-bold text-2xl gradient-text">{a}</p>
                <p className="text-text-muted text-sm">{b}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
          style={{ perspective: 1200 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
        >
          <div className="animate-float">
            <div className="rounded-2xl border border-bg-border bg-bg-secondary overflow-hidden shadow-2xl shadow-accent-primary/10">
              <div className="flex items-center gap-2 px-4 py-3 bg-bg-tertiary border-b border-bg-border">
                <div className="w-3 h-3 rounded-full bg-accent-red/60" />
                <div className="w-3 h-3 rounded-full bg-accent-warn/60" />
                <div className="w-3 h-3 rounded-full bg-accent-green/60" />
                <div className="flex-1 mx-4 bg-bg-secondary rounded-md px-3 py-1 text-xs text-text-muted font-mono">dashboard</div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted">Illustrative</span>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { l: 'Portfolio value', v: 847235, p: '₹', c: '+3.24%' },
                    { l: 'Total P&L', v: 35235, p: '+₹', c: '+4.34%' },
                    { l: 'Holdings', v: 12, p: '', c: null },
                    { l: 'Watchlist', v: 8, p: '', c: null },
                  ].map((s) => (
                    <div key={s.l} className="bg-bg-tertiary rounded-lg p-3 border border-bg-border text-left">
                      <p className="text-text-muted text-xs mb-1">{s.l}</p>
                      <p className="font-mono font-bold text-text-primary text-sm"><CountUp value={s.v} prefix={s.p} /></p>
                      {s.c && <p className="text-xs font-mono text-accent-green">{s.c}</p>}
                    </div>
                  ))}
                </div>

                <div className="bg-bg-tertiary rounded-lg p-4 border border-bg-border text-left">
                  <p className="text-text-secondary text-sm mb-3 font-medium">Portfolio performance</p>
                  <div className="h-24 flex items-end gap-1">
                    {previewBars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t origin-bottom"
                        style={{
                          height: `${h}%`,
                          background: i === previewBars.length - 1 ? 'linear-gradient(180deg, #8B5CF6, #6D28D9)' : 'rgb(var(--c-border))',
                          animation: `grow-bar 0.7s ${1.6 + i * 0.05}s cubic-bezier(0.22,1,0.36,1) both`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <MarketPulse cta={<Link to={user ? '/dashboard' : '/signup'} className="btn-primary inline-flex items-center gap-2 px-8 py-3">{user ? 'Open your dashboard' : 'See it all in the app'}<ArrowRight size={18} /></Link>} />

      {/* FEATURES */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-16">
        <Reveal className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-4">Everything in one workspace</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            From a company deep-dive to a chat with the AI to tracking what you own.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div
                onMouseMove={trackSpotlight}
                className="spotlight h-full bg-bg-secondary/90 border border-bg-border rounded-xl p-6 hover:border-accent-primary/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${f.bg}`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="font-display font-semibold text-text-primary text-lg mb-2 group-hover:text-accent-primary transition-colors">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center mt-8"><p className="text-sm text-text-muted">Plus mutual fund comparison, a SIP calculator, a finance dictionary and a command palette (⌘K) to jump anywhere.</p></Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative bg-bg-secondary/80 border-y border-bg-border py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-4">From question to decision</h2>
            <p className="text-text-secondary text-lg">Three steps.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent" aria-hidden="true" />
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.12} className="text-center relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-primary border border-accent-primary/30 mb-4 shadow-lg shadow-accent-primary/10">
                  <span className="font-mono font-bold text-accent-primary text-lg">{s.step}</span>
                </div>
                <h3 className="font-display font-semibold text-text-primary text-lg mb-3">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-text-primary mb-4">Start researching today</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">Free to sign up. No card needed.</p>
          <Link to={user ? '/dashboard' : '/signup'} className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            {user ? 'Go to dashboard' : 'Create free account'}
            <ChevronRight size={18} />
          </Link>
        </Reveal>
      </section>

      <footer className="relative border-t border-bg-border bg-bg-secondary/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Zap size={12} className="text-white" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-text-primary">FinSight AI</span>
          </div>
          <p className="text-text-muted text-sm text-center">For educational purposes only. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}

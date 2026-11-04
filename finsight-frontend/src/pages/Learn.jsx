// Learn.jsx — lessons, SIP calculator, finance dictionary

import { useState } from 'react';
import { Search, GraduationCap, BookOpen, Calculator, ChevronDown, SearchX } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Card, SectionHeader, EmptyState } from '../components/ui';
import { motion } from 'framer-motion';
import { Stagger, Item, CountUp } from '../components/motion';
import { EASE } from '../lib/motion';
import { financeDictionary, investmentBasics } from '../data/learningData';

function Collapse({ open, children }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chevron({ open }) {
  return <ChevronDown size={16} className={`text-text-muted shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />;
}

function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  // FV of an annuity-due: M × [((1 + r)^n − 1) / r] × (1 + r)
  const r = rate / 12 / 100;
  const n = years * 12;
  const futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const gains = futureValue - invested;
  const investedPct = Math.round((invested / futureValue) * 100);

  const sliders = [
    { id: 'sip-m', label: `Monthly SIP: ₹${monthly.toLocaleString('en-IN')}`, value: monthly, min: 500, max: 100000, step: 500, set: setMonthly },
    { id: 'sip-y', label: `Duration: ${years} years`, value: years, min: 1, max: 30, step: 1, set: setYears },
    { id: 'sip-r', label: `Expected return: ${rate}% p.a.`, value: rate, min: 5, max: 30, step: 1, set: setRate },
  ];

  return (
    <Card className="border-accent-primary/20">
      <SectionHeader title="SIP calculator" subtitle="Projected growth, assuming a constant return" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {sliders.map(({ id, label, value, min, max, step, set }) => (
          <div key={id}>
            <label htmlFor={id} className="text-sm text-text-secondary mb-2 block">{label}</label>
            <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-accent-primary" />
          </div>
        ))}
      </div>

      <div className="h-2.5 rounded-full overflow-hidden bg-accent-green/80 mb-4 flex" aria-hidden="true">
        <div className="h-full bg-accent-primary" style={{ width: `${investedPct}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Total invested</p>
          <p className="font-mono font-bold text-text-primary">₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Estimated gains</p>
          <p className="font-mono font-bold text-accent-green">₹{gains.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Final value</p>
          <p className="font-mono font-bold text-accent-primary"><CountUp value={Math.round(futureValue)} prefix="₹" /></p>
        </div>
      </div>
      <p className="text-xs text-text-muted mt-3">Illustration only. Real returns vary and are not guaranteed.</p>
    </Card>
  );
}

export default function Learn() {
  const [openTerm, setOpenTerm] = useState(null);
  const [openLesson, setOpenLesson] = useState(null);
  const [search, setSearch] = useState('');
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const q = search.toLowerCase();
  const terms = financeDictionary.filter((d) => d.term.toLowerCase().includes(q) || d.short.toLowerCase().includes(q));

  const quick = [
    { key: 'dictionary', icon: BookOpen, title: 'Finance dictionary', desc: 'Plain-English explanations of financial terms', color: 'text-accent-primary', bg: 'bg-accent-primary/10 border-accent-primary/20' },
    { key: 'lessons', icon: GraduationCap, title: 'Investment basics', desc: 'From "what is a stock" onwards', color: 'text-accent-secondary', bg: 'bg-accent-secondary/10 border-accent-secondary/20' },
    { key: 'sip', icon: Calculator, title: 'SIP calculator', desc: 'See how a monthly investment could grow', color: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/20' },
  ];

  return (
    <Stagger className="space-y-6">
      <Item><SectionHeader title="Learning center" subtitle="Understand finance from the basics up" /></Item>

      <Item className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quick.map(({ key, icon: Icon, title, desc, color, bg }) => (
          <Card key={key} hover className="text-center" onClick={() => scrollTo(`learn-${key}`)}>
            <div className={`w-12 h-12 rounded-xl border mx-auto flex items-center justify-center mb-3 ${bg}`}><Icon size={22} className={color} /></div>
            <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-text-secondary text-sm">{desc}</p>
          </Card>
        ))}
      </Item>

      <Item><div id="learn-lessons" className="scroll-mt-28">
        <SectionHeader title="Investment basics" subtitle="Build a foundation before you invest" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          {investmentBasics.map((lesson) => {
            const open = openLesson === lesson.id;
            return (
              <Card key={lesson.id} className="cursor-pointer" onClick={() => setOpenLesson(open ? null : lesson.id)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center shrink-0"><GraduationCap size={17} className="text-accent-secondary" /></div>
                    <h3 className="font-semibold text-text-primary text-sm">{lesson.title}</h3>
                  </div>
                  <Chevron open={open} />
                </div>
                <Collapse open={open}>
                  <div className="mt-4 pt-3 border-t border-bg-border space-y-3">
                    <p className="text-sm text-text-secondary leading-relaxed">{lesson.description}</p>
                    <div className="bg-accent-secondary/5 border border-accent-secondary/20 rounded-lg p-3">
                      <p className="text-xs text-accent-secondary font-semibold mb-1">KEY TAKEAWAY</p>
                      <p className="text-sm text-text-primary">{lesson.keyPoint}</p>
                    </div>
                  </div>
                </Collapse>
              </Card>
            );
          })}
        </div>
      </div></Item>

      <Item><div id="learn-sip" className="scroll-mt-28"><SIPCalculator /></div></Item>

      <Item><div id="learn-dictionary" className="scroll-mt-28">
        <SectionHeader title="Finance dictionary" subtitle="Every term explained simply" />
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input-field pl-9 text-sm" aria-label="Search the dictionary" placeholder="Search: PE ratio, EBITDA, ROE…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {terms.length === 0 ? (
          <Card><EmptyState icon={SearchX} title="No matching terms" description={`Nothing found for "${search}".`} /></Card>
        ) : (
          <div className="space-y-2">
            {terms.map((item) => {
              const open = openTerm === item.term;
              return (
                <Card key={item.term} className="cursor-pointer" onClick={() => setOpenTerm(open ? null : item.term)}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-display font-semibold text-text-primary">{item.term}</span>
                      <span className="text-text-muted text-sm ml-2">— {item.short}</span>
                    </div>
                    <Chevron open={open} />
                  </div>
                  <Collapse open={open}>
                    <div className="mt-4 space-y-3 border-t border-bg-border pt-3">
                      <p className="text-text-secondary text-sm leading-relaxed">{item.definition}</p>
                      <div className="bg-bg-tertiary border border-bg-border rounded-lg p-3">
                        <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">Example</p>
                        <p className="text-sm text-text-primary leading-relaxed">{item.example}</p>
                      </div>
                    </div>
                  </Collapse>
                </Card>
              );
            })}
          </div>
        )}
      </div></Item>
    </Stagger>
  );
}

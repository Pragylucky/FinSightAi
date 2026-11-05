// Dock.jsx — floating app navigation. On desktop it behaves like a macOS dock: icons swell as the
// cursor approaches, a label floats above the hovered one, and the active page glows. On phones it
// becomes a bottom tab bar with a "More" sheet.

import { useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Grid2x2, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { EASE } from '../../lib/motion';
import { PAGES } from '../../lib/pages';


const BASE = 46;
const PEAK = 74;
const RANGE = 140;

function DockItem({ item, mouseX, active }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const Icon = item.icon;

  // Distance from the cursor to this icon's centre drives its size
  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? x - (box.left + box.width / 2) : RANGE * 2;
  });
  const size = useSpring(useTransform(distance, [-RANGE, 0, RANGE], [BASE, PEAK, BASE]), { stiffness: 380, damping: 26, mass: 0.4 });
  const iconSize = useTransform(size, (v) => v * 0.46);

  return (
    <NavLink to={item.path} aria-label={item.label} className="relative flex flex-col items-center justify-end" ref={ref}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-11 whitespace-nowrap rounded-lg border border-bg-border bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-primary shadow-xl shadow-black/40"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center rounded-2xl border transition-colors duration-200 ${
          active ? 'border-accent-primary/60 bg-accent-primary/20 text-white shadow-[0_0_28px_rgb(var(--c-primary)/0.45)]' : 'border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary hover:bg-white/10'
        }`}
      >
        {active && <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary/40 to-accent-secondary/20" aria-hidden="true" />}
        <motion.span style={{ width: iconSize, height: iconSize }} className="relative flex items-center justify-center">
          <Icon style={{ width: '100%', height: '100%' }} strokeWidth={1.8} />
        </motion.span>
        {item.badge && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-secondary ring-2 ring-bg-primary" aria-hidden="true" />}
      </motion.div>

      <span className="h-2 flex items-center">
        {active && <motion.span layoutId="dock-dot" className="block w-1 h-1 rounded-full bg-accent-primary shadow-[0_0_8px_rgb(var(--c-primary))]" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />}
      </span>
    </NavLink>
  );
}

function MobileBar() {
  const { pathname } = useLocation();
  const [moreAt, setMoreAt] = useState(null);
  const more = moreAt === pathname;
  const isActive = (p) => (p.match ? pathname.startsWith(p.match) : pathname === p.path);
  const main = [PAGES[0], PAGES[1], PAGES[3], PAGES[4]];
  const rest = PAGES.filter((p) => !main.includes(p));
  const moreActive = rest.some(isActive);

  return (
    <>
      <AnimatePresence>
        {more && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreAt(null)} />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="fixed z-50 left-3 right-3 bottom-24 rounded-2xl border border-bg-border bg-bg-secondary p-3 shadow-2xl shadow-black/60"
            >
              <div className="grid grid-cols-3 gap-2">
                {rest.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <motion.div key={p.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                      <NavLink to={p.path} className={`flex flex-col items-center gap-2 rounded-xl border py-3.5 text-xs font-medium ${isActive(p) ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-primary' : 'border-bg-border text-text-secondary'}`}>
                        <Icon size={20} />{p.label}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav aria-label="Primary" className="fixed z-50 bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-bg-secondary/90 backdrop-blur-xl shadow-2xl shadow-black/60 flex items-center justify-around px-2 py-2">
        {main.map((p) => {
          const Icon = p.icon;
          const active = isActive(p);
          return (
            <NavLink key={p.path} to={p.path} aria-label={p.label} className="relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[60px]">
              {active && <motion.span layoutId="mobile-active" className="absolute inset-0 rounded-xl bg-accent-primary/15 border border-accent-primary/40" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              <Icon size={19} className={`relative ${active ? 'text-accent-primary' : 'text-text-secondary'}`} />
              <span className={`relative text-[10px] font-medium ${active ? 'text-text-primary' : 'text-text-muted'}`}>{p.label}</span>
            </NavLink>
          );
        })}
        <button onClick={() => setMoreAt(more ? null : pathname)} aria-label="More pages" aria-expanded={more} className="relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[60px]">
          {(moreActive && !more) && <span className="absolute inset-0 rounded-xl bg-accent-primary/15 border border-accent-primary/40" />}
          {more ? <X size={19} className="relative text-text-primary" /> : <Grid2x2 size={19} className={`relative ${moreActive ? 'text-accent-primary' : 'text-text-secondary'}`} />}
          <span className="relative text-[10px] font-medium text-text-muted">More</span>
        </button>
      </nav>
    </>
  );
}

export default function Dock() {
  const { pathname } = useLocation();
  const mouseX = useMotionValue(Infinity);
  const isActive = (p) => (p.match ? pathname.startsWith(p.match) : pathname === p.path);

  return (
    <>
      <div className="md:hidden"><MobileBar /></div>

      <div className="hidden md:flex fixed z-50 bottom-5 inset-x-0 justify-center pointer-events-none">
      <motion.nav
        aria-label="Primary"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 24 }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end gap-2 rounded-[26px] border border-white/10 bg-bg-secondary/70 px-3 pt-3 pb-1.5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.03)_inset]"
      >
        {PAGES.map((item, i) => (
          <div key={item.path} className="flex items-end gap-2">
            {i === 6 && <span className="self-center h-8 w-px bg-white/10 mx-0.5" aria-hidden="true" />}
            <DockItem item={item} mouseX={mouseX} active={isActive(item)} />
          </div>
        ))}
      </motion.nav>
      </div>
    </>
  );
}

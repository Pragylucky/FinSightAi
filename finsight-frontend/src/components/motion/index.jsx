// Small motion primitives shared across pages.
// framer-motion respects the user's reduced-motion setting via <MotionConfig> in main.jsx.

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

import { EASE } from '../../lib/motion';

// Wraps a route's content: fades/slides in on mount, out on unmount.
export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Staggers its <Item> children on mount.
const listVariants = {
  hidden: {},
  show: (stagger = 0.06) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export function Stagger({ children, className = '', stagger = 0.06, as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={listVariants} custom={stagger} initial="hidden" animate="show">
      {children}
    </Tag>
  );
}

export function Item({ children, className = '', as = 'div', ...rest }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={itemVariants} {...rest}>
      {children}
    </Tag>
  );
}

// Reveals when scrolled into view (landing page sections).
export function Reveal({ children, className = '', delay = 0, y = 24, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Animates a number up to `value` when it first appears.
export function CountUp({ value, decimals = 0, locale = 'en-IN', prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 18, mass: 0.8 });
  const text = useTransform(spring, (v) =>
    `${prefix}${v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  );

  useEffect(() => {
    if (inView) mv.set(Number.isFinite(value) ? value : 0);
  }, [inView, value, mv]);

  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}


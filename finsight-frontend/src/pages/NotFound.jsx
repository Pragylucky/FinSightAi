import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden flex items-center justify-center p-6">
      <div className="app-bg" aria-hidden="true" />
      <div className="aurora aurora-a" aria-hidden="true" />
      <div className="aurora aurora-b" aria-hidden="true" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="relative text-center max-w-md">
        <p className="font-display font-bold text-8xl gradient-text mb-2">404</p>
        <div className="w-12 h-12 rounded-xl bg-bg-secondary border border-bg-border flex items-center justify-center mx-auto mb-4 animate-float"><Compass size={22} className="text-accent-primary" /></div>
        <h1 className="font-display font-bold text-2xl text-text-primary mb-2">This page doesn&apos;t exist</h1>
        <p className="text-text-secondary text-sm mb-6">The link may be broken or the page may have moved.</p>
        <div className="flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">Open dashboard</Link>
          <Link to="/" className="btn-secondary">Home</Link>
        </div>
      </motion.div>
    </div>
  );
}

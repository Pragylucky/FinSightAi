// Shared pieces for every logged-out account screen.

import useSlow from '../../lib/useSlow';
import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowLeft, AlertCircle, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { EASE } from '../../lib/motion';

export function AuthInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required, autoComplete, minLength }) {
  const id = useId();
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`input-field ${Icon ? 'pl-9' : ''} ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

// Shown when a sign-in call is taking unusually long
export function WakeNotice({ show }) {
  if (!show) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="text-xs text-text-muted text-center leading-relaxed"
      role="status"
    >
      Waking the server up. It runs on free hosting and sleeps when idle, so the first request can take up to a minute.
    </motion.p>
  );
}

export function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red overflow-hidden"
    >
      <AlertCircle size={16} className="shrink-0" />
      {children}
    </motion.div>
  );
}

// One-click demo account. `variant="outline"` is the quiet button used under the auth forms.
export function GuestButton({ className = '', children = 'Continue as guest', onError }) {
  const { guest } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const slow = useSlow(busy);

  const go = async () => {
    setBusy(true);
    try {
      await guest();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      onError?.(err.message || 'Could not start a guest session. Please try again.');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className={`flex items-center justify-center gap-2 disabled:opacity-60 ${className}`}
      >
        {busy ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <UserRound size={16} />}
        {children}
      </button>
      <WakeNotice show={slow} />
    </>
  );
}

export function OrDivider() {
  return (
    <div className="relative my-1" aria-hidden="true">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-bg-border" /></div>
      <div className="relative flex justify-center"><span className="bg-bg-secondary px-3 text-xs text-text-muted">or</span></div>
    </div>
  );
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />;
}

export function AuthLayout({ children, title, subtitle, icon: Icon = Zap }) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      <div className="app-bg" aria-hidden="true" />
      <div className="aurora aurora-a" aria-hidden="true" />
      <div className="aurora aurora-b" aria-hidden="true" />
      <div className="aurora aurora-c" aria-hidden="true" />

      <div className="relative z-10 p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <Zap size={14} className="text-white" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-text-primary">FinSight AI</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div className="bg-bg-secondary/90 backdrop-blur border border-bg-border rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-primary/20">
                <Icon size={22} className="text-white" fill={Icon === Zap ? 'currentColor' : 'none'} />
              </div>
              <h1 className="font-display font-bold text-2xl text-text-primary">{title}</h1>
              {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
            </div>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

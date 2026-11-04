// Auth.jsx — Login and Signup

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthInput, AuthLayout, ErrorBanner, Spinner, GuestButton, OrDivider } from '../components/auth/AuthShell';
import { motion } from 'framer-motion';
import { COLORS } from '../lib/theme';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const justReset = location.state?.passwordReset;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify', { state: { email: form.email.trim(), fromLogin: true } });
        return;
      }
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your FinSight account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {justReset && !error && (
          <p className="p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg text-sm text-accent-green">
            Password updated. Sign in with your new password.
          </p>
        )}
        <ErrorBanner>{error}</ErrorBanner>

        <AuthInput
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={Mail}
          autoComplete="email"
          required
        />
        <AuthInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          icon={Lock}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs text-accent-primary hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 h-11">
          {loading ? <Spinner /> : 'Sign in'}
        </button>

        <OrDivider />
        <GuestButton onError={setError} className="w-full h-11 rounded-lg border border-bg-border bg-bg-tertiary text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-colors" />

        <p className="text-center text-sm text-text-muted pt-2">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-accent-primary hover:underline font-medium">Sign up free</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
const getStrength = (p) => {
  if (!p) return { label: '', color: '', pct: 0 };
  if (p.length < 6) return { label: 'Too short — use at least 6 characters', color: COLORS.bear, pct: 20 };
  if (p.length < 8) return { label: 'Weak', color: COLORS.warn, pct: 40 };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: COLORS.warn, pct: 60 };
  if (!/[^A-Za-z0-9]/.test(p)) return { label: 'Good', color: COLORS.primary, pct: 80 };
  return { label: 'Strong', color: COLORS.bull, pct: 100 };
};

export function Signup() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await register(form.name.trim(), form.email.trim(), form.password);
      if (res.accessToken) navigate('/dashboard', { replace: true }); // verification off: already signed in
      else navigate('/verify', { state: { email: form.email.trim(), emailSent: res.emailSent !== false } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start your free research journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner>{error}</ErrorBanner>

        <AuthInput label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} icon={User} autoComplete="name" required />
        <AuthInput label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={Mail} autoComplete="email" required />

        <div className="space-y-2">
          <AuthInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} icon={Lock} autoComplete="new-password" minLength={6} required />
          {form.password && (
            <div className="space-y-1">
              <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
        </div>

        <AuthInput label="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} icon={Lock} autoComplete="new-password" required />

        <p className="text-xs text-text-muted">
          FinSight AI provides educational information only — not financial advice.
        </p>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 h-11">
          {loading ? <Spinner /> : 'Create account'}
        </button>

        <OrDivider />
        <GuestButton onError={setError} className="w-full h-11 rounded-lg border border-bg-border bg-bg-tertiary text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-colors" />

        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:underline font-medium">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

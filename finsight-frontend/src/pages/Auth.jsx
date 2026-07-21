// Auth.jsx — Login and Signup pages in one file
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Shared Input Component ───────────────────────────────────────────────────
function AuthInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required }) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field ${Icon ? 'pl-9' : ''} ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Auth Layout Wrapper ──────────────────────────────────────────────────────
function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top bar */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <Zap size={14} className="text-bg-primary" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-text-primary">FinSight AI</span>
        </div>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Glow effect behind the card */}
          <div className="relative">
            <div className="absolute -top-10 -left-10 -right-10 h-40 bg-accent-cyan/5 rounded-full blur-3xl" />
            
            <div className="relative bg-bg-secondary border border-bg-border rounded-2xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center mx-auto mb-4">
                  <Zap size={22} className="text-bg-primary" fill="currentColor" />
                </div>
                <h1 className="font-display font-bold text-2xl text-text-primary">{title}</h1>
                <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When backend is ready: POST /api/auth/login
  // Store the JWT token in localStorage
  // Redirect to dashboard
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await login(form.email, form.password);
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your FinSight account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <AuthInput
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          icon={Mail}
          required
        />

        <AuthInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
          icon={Lock}
          required
        />

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs text-accent-cyan hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 h-11 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
          ) : 'Sign in'}
        </button>

        {/* Google OAuth — when ready: implement on backend */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bg-border" />
          </div>
          <div className="relative flex justify-center text-xs text-text-muted bg-bg-secondary px-3">or</div>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 h-11 bg-bg-tertiary border border-bg-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-cyan/30 transition-all"
          onClick={() => navigate('/dashboard')} 
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.82v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.53a4.8 4.8 0 0 1 0-3.06V5.4H1.82a8 8 0 0 0 0 7.18l2.69-2.04z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.82 5.4l2.69 2.08C5.14 5.58 6.9 4.18 8.98 4.18z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-text-muted mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-accent-cyan hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────────────
export function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password strength checker
  const getStrength = (p) => {
    if (!p) return { label: '', color: '', pct: 0 };
    if (p.length < 6) return { label: 'Too short', color: '#FF3B5C', pct: 20 };
    if (p.length < 8) return { label: 'Weak', color: '#FFB800', pct: 40 };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: '#FFB800', pct: 60 };
    if (!/[^A-Za-z0-9]/.test(p)) return { label: 'Good', color: '#00D4FF', pct: 80 };
    return { label: 'Strong', color: '#00E676', pct: 100 };
  };
  const strength = getStrength(form.password);

  // When backend is ready: POST /api/auth/register
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);
  setError('');

  try {
    await register(form.name, form.email, form.password);
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1500);
  } catch (err) {
    setError(err.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
  if (success) {
    return (
      <AuthLayout title="Account created!" subtitle="Welcome to FinSight AI">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-accent-green/10 border-2 border-accent-green flex items-center justify-center">
            <CheckCircle2 size={28} className="text-accent-green" />
          </div>
          <p className="text-text-secondary text-sm text-center">
            Your account is ready. Taking you to the dashboard...
          </p>
          <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start your free research journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <AuthInput
          label="Full name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="User Name"
          icon={User}
          required
        />

        <AuthInput
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          icon={Mail}
          required
        />

        <div className="space-y-1.5">
          <AuthInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 characters"
            icon={Lock}
            required
          />
          {/* Password strength bar */}
          {form.password && (
            <div className="space-y-1">
              <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                />
              </div>
              <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
        </div>

        <AuthInput
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Repeat password"
          icon={Lock}
          required
        />

        <p className="text-xs text-text-muted">
          By signing up, you agree to our Terms of Service and Privacy Policy. FinSight AI provides educational information only — not financial advice.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 h-11"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
          ) : 'Create account'}
        </button>

        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

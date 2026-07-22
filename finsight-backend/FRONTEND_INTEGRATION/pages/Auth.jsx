import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required }) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
          )}        
          <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field ${Icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm">
          <ArrowLeft size={16} /> Back to home
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <Zap size={14} className="text-bg-primary" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-text-primary">FinSight AI</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="relative">
            <div className="absolute -top-10 -left-10 -right-10 h-40 bg-accent-cyan/5 rounded-full blur-3xl" />
            <div className="relative bg-bg-secondary border border-bg-border rounded-2xl p-8">
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
  const { login } = useAuth();                    // ← REAL: from AuthContext
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);      // ← REAL: POST /api/auth/login
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
            <AlertCircle size={16} />{error}
          </div>
        )}
        <AuthInput label="" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="" icon={Mail} required />
        <AuthInput label="" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="" icon={Lock} required />
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs text-accent-cyan hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 h-11 mt-2">
          {loading
            ? <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
            : 'Sign in'}
        </button>
        <p className="text-center text-sm text-text-muted mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-accent-cyan hover:underline font-medium">Sign up free</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────────────
export function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();                 // ← REAL: from AuthContext
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getStrength = (p) => {
    if (!p) return { label: '', color: '', pct: 0 };
    if (p.length < 6) return { label: 'Too short', color: '#FF3B5C', pct: 20 };
    if (p.length < 8) return { label: 'Weak', color: '#FFB800', pct: 40 };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: '#FFB800', pct: 60 };
    if (!/[^A-Za-z0-9]/.test(p)) return { label: 'Good', color: '#00D4FF', pct: 80 };
    return { label: 'Strong', color: '#00E676', pct: 100 };
  };
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
      await register(form.name, form.email, form.password);  // ← REAL: POST /api/auth/register
      setSuccess(true);
  
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    if (success) {
      return (
        <AuthLayout
          title="Check your email"
          subtitle="One last step to activate your FinSight account"
        >
          <div className="flex flex-col items-center gap-4 py-4">

            <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border-2 border-accent-cyan flex items-center justify-center">
              <Mail size={28} className="text-accent-cyan" />
            </div>

            <div className="text-center">
              <p className="text-text-primary font-medium">
                Verification email sent!
              </p>

              <p className="text-text-secondary text-sm mt-2">
                We've sent a verification link to
              </p>

              <p className="text-accent-cyan text-sm font-medium mt-1">
                {form.email}
              </p>
            </div>

            <p className="text-text-muted text-xs text-center">
              Click the link in the email to activate your account.
              The verification link expires in 24 hours.
            </p>

            <Link
              to="/login"
              className="btn-primary w-full h-11 flex items-center justify-center"
            >
              Back to sign in
            </Link>

          </div>
        </AuthLayout>
      );
    }

  return (
    <AuthLayout title="Create your account" subtitle="Start your free research journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red">
            <AlertCircle size={16} />{error}
          </div>
        )}
        <AuthInput label="Full name" type="text" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
           icon={User} required />
        <AuthInput label="Email address" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={Mail} required />
        <div className="space-y-1.5">
          <AuthInput label="Password" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 6 characters" icon={Lock} required />
          {form.password && (
            <div className="space-y-1">
              <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
              </div>
              <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
        </div>
        <AuthInput label="Confirm password" type="password" value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Repeat password" icon={Lock} required />
        <p className="text-xs text-text-muted">
          By signing up you agree to our Terms. FinSight provides educational information only — not financial advice.
        </p>
        <button type="submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 h-11">
          {loading
            ? <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
            : 'Create account'}
        </button>
        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-medium">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

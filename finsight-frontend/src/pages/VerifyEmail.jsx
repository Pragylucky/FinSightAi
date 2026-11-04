// VerifyEmail.jsx — enter the 6-digit code that was emailed after sign-up

import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, AuthInput, ErrorBanner, Spinner } from '../components/auth/AuthShell';

const LENGTH = 6;
const COOLDOWN = 60;

function CodeInput({ value, onChange, onComplete, disabled, invalid }) {
  const refs = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

  const set = (next) => {
    const clean = next.replace(/\D/g, '').slice(0, LENGTH);
    onChange(clean);
    if (clean.length === LENGTH) onComplete(clean);
    return clean;
  };

  const onInput = (i, e) => {
    const typed = e.target.value.replace(/\D/g, '');
    if (!typed) return;
    const clean = set(value.slice(0, i) + typed + value.slice(i + 1));
    refs.current[Math.min(i + typed.length, LENGTH - 1)]?.focus();
    return clean;
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[i]) set(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) { set(value.slice(0, i - 1) + value.slice(i)); refs.current[i - 1]?.focus(); }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const clean = set(e.clipboardData.getData('text'));
    refs.current[Math.min(clean.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          onChange={(e) => onInput(i, e)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={LENGTH}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          autoFocus={i === 0}
          className={`w-11 h-14 text-center text-xl font-mono font-bold rounded-lg bg-bg-secondary border text-text-primary outline-none transition-all focus:border-accent-primary focus:shadow-[0_0_0_3px_rgb(var(--c-primary)/0.15)] ${invalid ? 'border-accent-red animate-[shake_0.3s]' : d ? 'border-accent-primary/50' : 'border-bg-border'}`}
        />
      ))}
    </div>
  );
}

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, verifyCode, resendCode } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [askEmail, setAskEmail] = useState(!location.state?.email);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);
  // Just registered: a code was sent seconds ago, so start the resend timer
  const [cooldown, setCooldown] = useState(location.state?.emailSent === false || location.state?.fromLogin ? 0 : COOLDOWN);
  const autoSent = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async (addr = email) => {
    setError('');
    setInfo('');
    try {
      const res = await resendCode(addr);
      setInfo('A new code is on its way. Check your inbox and spam folder.');
      setCooldown(res.retryAfter || COOLDOWN);
      setCode('');
    } catch (err) {
      if (err.code === 'COOLDOWN') { setCooldown(err.retryAfter || COOLDOWN); setInfo('A code was sent a moment ago. Check your inbox.'); }
      else setError(err.message);
    }
  };

  // Arriving from a blocked login: send a fresh code once, automatically
  useEffect(() => {
    if (location.state?.fromLogin && email && !autoSent.current) {
      autoSent.current = true;
      resend(email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (value = code) => {
    if (busy || value.length !== LENGTH) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await verifyCode(email, value);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      setInvalid(true);
      setTimeout(() => setInvalid(false), 400);
      if (err.code !== 'INVALID_CODE') setCode('');
      if (err.code === 'ALREADY_VERIFIED') setTimeout(() => navigate('/login'), 1500);
    } finally {
      setBusy(false);
    }
  };

  if (user) return <Navigate to="/dashboard" replace />;

  if (askEmail) {
    return (
      <AuthLayout title="Verify your email" subtitle="Enter the email you signed up with" icon={MailCheck}>
        <form
          onSubmit={(e) => { e.preventDefault(); setAskEmail(false); resend(email); }}
          className="space-y-4"
        >
          <AuthInput label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} autoComplete="email" required />
          <button type="submit" className="btn-primary w-full h-11">Send me a code</button>
          <p className="text-center text-sm text-text-muted"><Link to="/login" className="text-accent-primary hover:underline">Back to sign in</Link></p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter your code" subtitle={undefined} icon={MailCheck}>
      <div className="space-y-5">
        <p className="text-center text-sm text-text-secondary leading-relaxed -mt-4">
          We sent a 6-digit code to <span className="text-text-primary font-medium break-all">{email}</span>. It expires in 15 minutes.
        </p>

        <CodeInput value={code} onChange={setCode} onComplete={submit} disabled={busy} invalid={invalid} />

        <ErrorBanner>{error}</ErrorBanner>
        {info && !error && <p className="text-center text-sm text-accent-green">{info}</p>}
        {location.state?.emailSent === false && !info && !error && (
          <p className="text-center text-sm text-accent-warn">We couldn&apos;t send the email on sign-up. Tap resend below.</p>
        )}

        <button onClick={() => submit()} disabled={busy || code.length !== LENGTH} className="btn-primary w-full h-11 flex items-center justify-center">
          {busy ? <Spinner /> : 'Verify and continue'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => resend()}
            disabled={cooldown > 0}
            className="text-accent-primary hover:underline disabled:text-text-muted disabled:no-underline disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
          <button onClick={() => { setAskEmail(true); setCode(''); setError(''); }} className="text-text-muted hover:text-text-secondary">
            Wrong email?
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

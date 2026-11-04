// Forgot / reset password — the backend emails a link to /reset-password/:token

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, KeyRound, MailCheck } from 'lucide-react';
import api from '../services/api';
import { AuthInput, AuthLayout, ErrorBanner, Spinner } from '../components/auth/AuthShell';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.auth.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle="If that email is registered, a reset link is on its way" icon={MailCheck}>
        <Link to="/login" className="btn-primary w-full h-11 flex items-center justify-center">Back to sign in</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll email you a link to reset it" icon={KeyRound}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner>{error}</ErrorBanner>
        <AuthInput label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} autoComplete="email" required />
        <button type="submit" disabled={loading} className="btn-primary w-full h-11 flex items-center justify-center">
          {loading ? <Spinner /> : 'Send reset link'}
        </button>
        <p className="text-center text-sm text-text-muted">
          <Link to="/login" className="text-accent-primary hover:underline">Back to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.auth.resetPassword(token, password);
      // The reset endpoint also sets a session cookie; make the user sign in explicitly.
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something you haven't used before" icon={KeyRound}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner>{error}</ErrorBanner>
        <AuthInput label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} autoComplete="new-password" minLength={6} required />
        <AuthInput label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} icon={Lock} autoComplete="new-password" required />
        <button type="submit" disabled={loading} className="btn-primary w-full h-11 flex items-center justify-center">
          {loading ? <Spinner /> : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}

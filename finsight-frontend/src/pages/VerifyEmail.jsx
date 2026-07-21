import { useEffect, useRef, useState } from 'react';import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const hasVerified = useRef(false);

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
  if (hasVerified.current) return;
  hasVerified.current = true;

  const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/verify/${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Email verification failed'
          );
        }

        setStatus('success');
        setMessage(
          data.message || 'Your email has been verified successfully!'
        );
      } catch (error) {
        setStatus('error');
        setMessage(
          error.message ||
            'The verification link is invalid or has expired.'
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-secondary border border-bg-border rounded-2xl p-8 text-center">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <Zap
              size={18}
              className="text-bg-primary"
              fill="currentColor"
            />
          </div>

          <span className="font-display font-bold text-xl text-text-primary">
            FinSight AI
          </span>
        </div>

        {status === 'loading' && (
          <>
            <Loader2
              size={48}
              className="animate-spin text-accent-cyan mx-auto mb-4"
            />

            <h1 className="text-xl font-bold text-text-primary">
              Verifying your email...
            </h1>

            <p className="text-sm text-text-secondary mt-2">
              Please wait while we activate your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2
              size={56}
              className="text-accent-green mx-auto mb-4"
            />

            <h1 className="text-2xl font-bold text-text-primary">
              Email verified!
            </h1>

            <p className="text-sm text-text-secondary mt-2 mb-6">
              {message}
            </p>

            <Link
              to="/login"
              className="btn-primary w-full h-11 flex items-center justify-center"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle
              size={56}
              className="text-accent-red mx-auto mb-4"
            />

            <h1 className="text-2xl font-bold text-text-primary">
              Verification failed
            </h1>

            <p className="text-sm text-text-secondary mt-2 mb-6">
              {message}
            </p>

            <Link
              to="/login"
              className="btn-primary w-full h-11 flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
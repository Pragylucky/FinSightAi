// Global authentication state — wraps the whole app.
// Any component can call useAuth() to get user info / login / logout.

import { createContext, useContext, useState, useEffect } from 'react';
import track from '../lib/track';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking if user is logged in

  // On app load: check if user is already logged in (has token in localStorage)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const data = await api.auth.getMe();
          setUser(data.user);
        } catch (err) {
          if (err.status === 401) {
            // Token genuinely invalid/expired: clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          } else {
            // Server asleep or unreachable: don't sign people out for that. Use the saved profile.
            try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { /* no saved profile */ }
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Shared by every flow that ends with a signed-in user
  const startSession = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => startSession(await api.auth.login({ email, password }));

  // One-click throwaway account for demos
  const guest = async () => {
    const data = await startSession(await api.auth.guest());
    track('guest_started');
    return data;
  };

  // Resolves with the server response. If the server returned a session (verification
  // switched off) the user is signed in; otherwise they still need to verify their email.
  const register = async (name, email, password) => {
    const data = await api.auth.register({ name, email, password });
    if (data.accessToken) { startSession(data); track('signup'); }
    return data;
  };

  // Confirming the emailed code also signs the user in
  const verifyCode = async (email, code) => startSession(await api.auth.verifyCode(email, code));

  const resendCode = (email) => api.auth.resendCode(email);

  const logout = async () => {
    try { await api.auth.logout(); } catch { /* already logged out server-side */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, guest, register, verifyCode, resendCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — cleaner than using useContext everywhere
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

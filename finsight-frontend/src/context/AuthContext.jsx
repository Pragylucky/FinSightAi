// ================================================================
// src/context/AuthContext.jsx  ← ADD THIS TO YOUR FRONTEND
// ================================================================
// Global authentication state — wraps the whole app
// Any component can call useAuth() to get user info / login / logout
// ================================================================

import { createContext, useContext, useState, useEffect } from 'react';
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
        } catch {
          // Token invalid/expired — clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
  const data = await api.auth.register({ name, email, password });

  // Don't log the user in yet.
  // They must verify their email first.
  return data;
};

  const logout = async () => {
    try { await api.auth.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — cleaner than using useContext everywhere
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

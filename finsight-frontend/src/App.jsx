// App.jsx — routes. Pages are lazy-loaded so the first paint ships less JS.

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

const Landing = lazy(() => import('./pages/Landing'));
const ForgotPassword = lazy(() => import('./pages/PasswordReset').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/PasswordReset').then((m) => ({ default: m.ResetPassword })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Company = lazy(() => import('./pages/Company'));
const Chat = lazy(() => import('./pages/Chat'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const News = lazy(() => import('./pages/News'));
const Screener = lazy(() => import('./pages/Screener'));
const Funds = lazy(() => import('./pages/Funds'));
const Learn = lazy(() => import('./pages/Learn'));

const Login = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Signup })));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loader" />}>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify" element={<VerifyEmail />} />
          {/* Old emailed links pointed here; codes replaced them */}
          <Route path="/verify-email/:token" element={<Navigate to="/verify" replace />} />

          {/* Protected routes — sidebar + header */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/company/:symbol" element={<Company />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/news" element={<News />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/learn" element={<Learn />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

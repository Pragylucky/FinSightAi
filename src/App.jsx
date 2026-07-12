// App.jsx — Root of our React app
// React Router controls which page renders based on the URL

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import { Login, Signup } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Company from './pages/Company';
import Chat from './pages/Chat';
import { Portfolio, Watchlist, News, Screener, Funds, Learn } from './pages/OtherPages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes — wrapped in Layout (sidebar + header) */}
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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

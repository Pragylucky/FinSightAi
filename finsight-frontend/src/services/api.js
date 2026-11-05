import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // IMPORTANT: sends the refreshToken cookie automatically
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ───────────────────────────────────────
// Runs before EVERY request — attaches the JWT access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
// Runs after EVERY response
// If we get 401 (token expired), automatically gets a new token and retries
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  // Success: just return the data
  (response) => response.data,

  // Error handler
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints return 401 for bad credentials / dead refresh tokens.
    // Refreshing for those would deadlock (the refresh call itself would queue behind itself).
    const isAuthCall = /\/auth\/(login|register|refresh|forgot-password|reset-password)/.test(originalRequest?.url || '');

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
      if (isRefreshing) {
        // If refresh is in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — uses the httpOnly cookie automatically
        const response = await axiosInstance.post('/auth/refresh');
        const newToken = response.accessToken;
        localStorage.setItem('accessToken', newToken);
        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — log user out
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract error message from backend response
    const message = error.response?.data?.message
      || (error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : null)
      || (error.request && !error.response ? 'Cannot reach the server. Check your connection.' : null)
      || 'Something went wrong';
    // Keep the server's machine-readable code / status so screens can react (e.g. EMAIL_NOT_VERIFIED)
    const err = new Error(message);
    err.code = error.response?.data?.code;
    err.status = error.response?.status;
    err.retryAfter = error.response?.data?.retryAfter;
    return Promise.reject(err);
  }
);

// ── API methods — grouped by feature ─────────────────────────
const api = {

  // ── Auth ────────────────────────────────────────────────────
  auth: {
    register: (data) => axiosInstance.post('/auth/register', data),
    login: (data) => axiosInstance.post('/auth/login', data),
    guest: () => axiosInstance.post('/auth/guest'),
    logout: () => axiosInstance.post('/auth/logout'),
    getMe: () => axiosInstance.get('/auth/me'),
    forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => axiosInstance.post(`/auth/reset-password/${token}`, { password }),
    verifyCode: (email, code) => axiosInstance.post('/auth/verify-email', { email, code }),
    resendCode: (email) => axiosInstance.post('/auth/resend-code', { email }),
  },

  // ── Company / Stocks ─────────────────────────────────────────
  company: {
    search: (q) => axiosInstance.get('/companies/search', { params: { q } }),
    get: (symbol) => axiosInstance.get(`/companies/${encodeURIComponent(symbol)}`),
    getQuote: (symbol) => axiosInstance.get(`/companies/${encodeURIComponent(symbol)}/quote`),
    getChart: (symbol, days = 30) => axiosInstance.get(`/companies/${encodeURIComponent(symbol)}/chart`, { params: { days } }),
    getNews: (symbol) => axiosInstance.get(`/companies/${encodeURIComponent(symbol)}/news`),
    getAnalysis: (symbol) => axiosInstance.get(`/companies/${encodeURIComponent(symbol)}/analysis`, { timeout: 60000 }),
  },

  // ── Portfolio ────────────────────────────────────────────────
  portfolio: {
    get: () => axiosInstance.get('/portfolio'),
    addHolding: (data) => axiosInstance.post('/portfolio/holdings', data),
    updateHolding: (symbol, data) => axiosInstance.put(`/portfolio/holdings/${encodeURIComponent(symbol)}`, data),
    removeHolding: (symbol) => axiosInstance.delete(`/portfolio/holdings/${encodeURIComponent(symbol)}`),
  },

  // ── Watchlist ────────────────────────────────────────────────
  watchlist: {
    get: () => axiosInstance.get('/watchlist'),
    add: (data) => axiosInstance.post('/watchlist', data),
    update: (symbol, data) => axiosInstance.put(`/watchlist/${encodeURIComponent(symbol)}`, data),
    remove: (symbol) => axiosInstance.delete(`/watchlist/${encodeURIComponent(symbol)}`),
  },

  // ── News ────────────────────────────────────────────────────
  news: {
    get: (category = 'general') => axiosInstance.get('/news', { params: { category } }),
    summarize: (data) => axiosInstance.post('/news/summarize', data),
  },

  // ── AI Chat ──────────────────────────────────────────────────
  chat: {
    send: (message, chatId = null) => axiosInstance.post('/chat/message', { message, chatId }),
    getHistory: () => axiosInstance.get('/chat/history'),
    getChat: (chatId) => axiosInstance.get(`/chat/${chatId}`),
    delete: (chatId) => axiosInstance.delete(`/chat/${chatId}`),
  },

  // ── Market overview (indices, movers, ticker) ────────────────
  market: {
    overview: () => axiosInstance.get('/market/overview'),
    pulse: () => axiosInstance.get('/market/pulse'), // public: used on the landing page
  },

  // ── Screener ─────────────────────────────────────────────────
  screener: {
    get: (params) => axiosInstance.get('/screener', { params }),
    getSectors: () => axiosInstance.get('/screener/sectors'),
  },

  // ── AI ───────────────────────────────────────────────────────
  ai: {
    chat: (messages) => axiosInstance.post('/ai/chat', { messages }, { timeout: 60000 }),
  },

  // ── MUTUAL FUNDS ─────────────────────────────────────────────────────
  mutualFunds: {
    get: () => axiosInstance.get('/mutual-funds'),
  },
  // ── User ─────────────────────────────────────────────────────
  user: {
    getProfile: () => axiosInstance.get('/user/profile'),
    updateProfile: (data) => axiosInstance.put('/user/profile', data),
    changePassword: (data) => axiosInstance.put('/user/change-password', data),
  },
};

export default api;

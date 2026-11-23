import axios from 'axios';

/**
 * Central Axios instance. All API calls in the app should go through this,
 * never call axios directly from components — keeps auth headers, base URL,
 * and error handling in one place.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Render's free tier sleeps when idle. While it wakes, requests fail fast
// (502/503/504, or a CORS-looking "Network Error" with no response). We poll
// /health with backoff, then replay the request once. All concurrent failures
// share one poll, and the UI hears about it through the "server-status" event.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const emit = (status) => window.dispatchEvent(new CustomEvent('server-status', { detail: status }));
let wakePoll = null;

const waitForServer = () => {
  wakePoll ??= (async () => {
    emit('waking');
    let delay = 2000;
    for (let i = 0; i < 12; i++) { // ~2 min worst case
      await sleep(delay);
      delay = Math.min(delay * 2, 15000);
      try {
        await axios.get(`${api.defaults.baseURL}/health`, { timeout: 10000 });
        emit('up');
        return true;
      } catch { /* still asleep, keep polling */ }
    }
    emit('down');
    return false;
  })().finally(() => { wakePoll = null; });
  return wakePoll;
};

const serverLooksDown = (error) =>
  !error.response || [502, 503, 504].includes(error.response.status);

// Access tokens are short-lived. On a 401 we trade the refresh token for a new one (all
// concurrent 401s share one call) and replay the request; only if that fails do we log out.
let refreshing = null;
const refreshAccessToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return Promise.resolve(false);
  // Resolves true (new token saved), false (session really over) or null (couldn't reach the server)
  refreshing ??= axios
    .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
    .then(({ data }) => {
      localStorage.setItem('token', data.token);
      return true;
    })
    .catch((e) => (e.response?.status === 401 ? false : null))
    .finally(() => { refreshing = null; });
  return refreshing;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const cfg = error.config;
    // Skip offline users, cancelled requests, replays, and file uploads (never re-send those).
    if (
      cfg && !cfg._replayed && navigator.onLine && !axios.isCancel(error) &&
      !(cfg.data instanceof FormData) && serverLooksDown(error)
    ) {
      cfg._replayed = true;
      if (await waitForServer()) return api(cfg);
    }
    const isAuthCall = /\/auth\/(login|signup|refresh)$/.test(cfg?.url || '');
    if (error.response?.status === 401 && cfg && !cfg._refreshed && !isAuthCall) {
      cfg._refreshed = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) return api(cfg); // request interceptor attaches the new token
      if (refreshed === null) return Promise.reject(error); // server unreachable: keep the session
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

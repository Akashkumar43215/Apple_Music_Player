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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

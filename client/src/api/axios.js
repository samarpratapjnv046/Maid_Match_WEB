import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
let isRefreshing = false;
let queue = [];

// These endpoints must never trigger a token refresh attempt
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = NO_REFRESH_URLS.some((u) => original.url?.includes(u));
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        queue.forEach((p) => p.resolve(newToken));
        queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        queue.forEach((p) => p.reject(e));
        queue = [];
        localStorage.removeItem('accessToken');
        // Dispatch event so AuthContext can clear user state via React Router (no full-page reload)
        window.dispatchEvent(new Event('auth:sessionExpired'));
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

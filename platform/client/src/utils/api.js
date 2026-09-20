import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 → logout (only redirect if on a protected route)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fw_token');
      const publicPaths = ['/login', '/register', '/', '/browse', '/impact', '/privacy'];
      const pathname = window.location.pathname;
      if (!publicPaths.includes(pathname) && !pathname.startsWith('/donations/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

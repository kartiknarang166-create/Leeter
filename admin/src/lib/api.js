import axios from 'axios';

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://leeter.onrender.com/api' : 'http://localhost:3001/api'),
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const secret = localStorage.getItem('admin_secret') || ADMIN_SECRET;
  if (secret) config.headers.Authorization = `Bearer ${secret}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_secret');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

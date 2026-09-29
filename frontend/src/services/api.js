import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('localfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('localfix_token');
      localStorage.removeItem('localfix_user');
      if (!window.location.pathname.includes('/login')) {
        const targetLogin = window.location.pathname.startsWith('/admin')
          ? '/admin/login?session_expired=true'
          : '/login?session_expired=true';
        window.location.href = targetLogin;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

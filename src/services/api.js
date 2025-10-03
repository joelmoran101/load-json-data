import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Log API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE);
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
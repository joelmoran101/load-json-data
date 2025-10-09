import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Log API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE);
}

// Create axios instance with secure cookie configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
});

// Request interceptor for additional security headers
api.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking in development
    if (process.env.NODE_ENV === 'development') {
      config.headers['X-Request-Time'] = new Date().toISOString();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 && error.response?.data?.action === 'login_required') {
      // Token expired - emit event for app to handle
      window.dispatchEvent(new CustomEvent('auth:session-expired', {
        detail: { 
          message: error.response.data.error,
          action: 'login_required'
        }
      }));
    }
    
    return Promise.reject(error);
  }
);

export default api;
import api from './api';

const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise that resolves to user data
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });
      
      if (response.data.success && response.data.data.user) {
        // Cookie is automatically set by the server (httpOnly)
        // Store user data in memory/state, not localStorage
        return response.data.data.user;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error('Please provide valid email and password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
      }
    }
  },

  /**
   * Logout user and clear authentication cookie
   * @returns {Promise} Promise that resolves when logout is complete
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      
      if (response.data.success) {
        // Cookie is automatically cleared by the server
        return response.data;
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if logout fails on server, we should clear client-side state
      // The cookie might still be cleared by the server
      if (error.response?.status >= 500) {
        throw new Error('Server error during logout');
      } else {
        throw new Error('Logout failed');
      }
    }
  },

  /**
   * Get current user information from server
   * @returns {Promise} Promise that resolves to user data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success && response.data.data.user) {
        return response.data.data.user;
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // User is not authenticated
        return null;
      }
      
      console.error('Failed to get current user:', error);
      throw new Error('Failed to get user information');
    }
  },

  /**
   * Check authentication status
   * @returns {Promise} Promise that resolves to authentication status
   */
  checkAuthStatus: async () => {
    try {
      const response = await api.get('/auth/status');
      
      if (response.data.success) {
        return {
          authenticated: response.data.data.authenticated,
          user: response.data.data.user
        };
      } else {
        throw new Error('Failed to check auth status');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      
      // If we can't check status, assume not authenticated
      return {
        authenticated: false,
        user: null
      };
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise} Promise that resolves to refreshed user data
   */
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      
      if (response.data.success && response.data.data.user) {
        // New cookie is automatically set by the server
        return response.data.data.user;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      if (error.response?.status === 401) {
        // Token is invalid, user needs to login again
        throw new Error('Session expired. Please login again.');
      } else {
        throw new Error('Failed to refresh session');
      }
    }
  },

  /**
   * Get demo users for testing (development only)
   * @returns {Promise} Promise that resolves to demo users list
   */
  getDemoUsers: async () => {
    try {
      const response = await api.get('/auth/demo-users');
      
      if (response.data.success && response.data.data.users) {
        return response.data.data.users;
      } else {
        throw new Error('Failed to get demo users');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Demo users not available (probably production)
        return [];
      }
      
      console.error('Failed to get demo users:', error);
      throw new Error('Failed to get demo users');
    }
  },

  /**
   * Handle API response for authentication errors
   * This function should be called by axios response interceptor
   * @param {Object} error - Axios error object
   * @returns {Promise} Rejected promise with error
   */
  handleAuthError: (error) => {
    if (error.response?.status === 401 && error.response?.data?.action === 'login_required') {
      // Token expired, trigger logout/login flow
      console.log('Session expired, please login again');
      
      // You could dispatch an action here to update app state
      // For example, using a global state management solution like Redux
      // dispatch(logout());
      
      // Or emit a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('auth:session-expired', {
        detail: { message: error.response.data.error }
      }));
    }
    
    return Promise.reject(error);
  }
};

export default authService;
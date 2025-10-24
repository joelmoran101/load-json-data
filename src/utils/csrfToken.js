// src/utils/csrfToken.js

/**
 * CSRF Token Manager
 * 
 * Implements double-submit cookie pattern for CSRF protection.
 * 
 * How it works:
 * 1. Generate a random token and store it in a cookie (done by backend on first request)
 * 2. Read that token from the cookie
 * 3. Send it in a custom header (X-CSRF-Token) with state-changing requests
 * 4. Backend validates that cookie value matches header value
 * 
 * This protects against CSRF because:
 * - Attacker sites cannot read cookies from your domain (Same-Origin Policy)
 * - Attacker sites cannot set custom headers on cross-origin requests
 */

/**
 * Generate a cryptographically secure random token
 * @returns {string} Random token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Get CSRF token from cookie
 * @param {string} cookieName - Name of the CSRF cookie (default: 'XSRF-TOKEN')
 * @returns {string|null} CSRF token or null if not found
 */
export const getCSRFTokenFromCookie = (cookieName = 'XSRF-TOKEN') => {
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
};

/**
 * Set CSRF token in a cookie (for client-side initialization if backend doesn't set it)
 * Note: In production, the backend should set the cookie with Secure and SameSite flags
 * @param {string} token - CSRF token to store
 * @param {string} cookieName - Name of the CSRF cookie (default: 'XSRF-TOKEN')
 */
export const setCSRFTokenCookie = (token, cookieName = 'XSRF-TOKEN') => {
  // Set cookie with security flags
  const isProduction = import.meta.env.PROD;
  const secure = isProduction ? 'Secure;' : '';
  const sameSite = 'SameSite=Lax';
  
  // Cookie expires in 24 hours
  const expires = new Date();
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
  
  document.cookie = `${cookieName}=${encodeURIComponent(token)}; ${secure} ${sameSite}; Path=/; Expires=${expires.toUTCString()}`;
};

/**
 * Initialize CSRF token if not already present
 * This should be called on app initialization
 * @returns {string} The CSRF token
 */
export const initializeCSRFToken = () => {
  let token = getCSRFTokenFromCookie();
  
  if (!token) {
    token = generateCSRFToken();
    setCSRFTokenCookie(token);
    
    if (import.meta.env.DEV) {
      console.log('🔒 CSRF token initialized');
    }
  }
  
  return token;
};

/**
 * Get CSRF token for use in requests
 * If no token exists, initialize one
 * @returns {string} CSRF token
 */
export const getCSRFToken = () => {
  let token = getCSRFTokenFromCookie();
  
  if (!token) {
    token = initializeCSRFToken();
  }
  
  return token;
};

/**
 * Check if a request method requires CSRF protection
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
 * @returns {boolean} True if method requires CSRF protection
 */
export const requiresCSRFProtection = (method) => {
  const safeHttpMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
  return !safeHttpMethods.includes(method?.toUpperCase());
};

/**
 * Refresh CSRF token
 * Useful after logout or when backend indicates token should be refreshed
 */
export const refreshCSRFToken = () => {
  const token = generateCSRFToken();
  setCSRFTokenCookie(token);
  
  if (import.meta.env.DEV) {
    console.log('🔄 CSRF token refreshed');
  }
  
  return token;
};

/**
 * Clear CSRF token (typically on logout)
 */
export const clearCSRFToken = () => {
  document.cookie = 'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  if (import.meta.env.DEV) {
    console.log('🗑️ CSRF token cleared');
  }
};

export default {
  generateCSRFToken,
  getCSRFTokenFromCookie,
  setCSRFTokenCookie,
  initializeCSRFToken,
  getCSRFToken,
  requiresCSRFProtection,
  refreshCSRFToken,
  clearCSRFToken
};

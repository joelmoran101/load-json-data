import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './AuthTest.css';

const AuthTest = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for session expiration events
    const handleSessionExpired = (event) => {
      setUser(null);
      setError('Session expired. Please login again.');
    };
    
    window.addEventListener('auth:session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await authService.checkAuthStatus();
      if (status.authenticated && status.user) {
        setUser(status.user);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      console.log('✅ Login successful with secure httpOnly cookies!');
    } catch (error) {
      setError(error.message);
      console.error('❌ Login failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      setUser(null);
      console.log('✅ Logout successful - httpOnly cookie cleared!');
    } catch (error) {
      setError(error.message);
      console.error('❌ Logout failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      console.log('✅ User info retrieved from httpOnly cookie!');
    } catch (error) {
      setError(error.message);
      setUser(null);
      console.error('❌ Failed to get user info:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.refreshToken();
      setUser(userData);
      console.log('✅ Token refreshed successfully!');
    } catch (error) {
      setError(error.message);
      console.error('❌ Token refresh failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-test-container">
      <h2>🔐 Secure Cookie Authentication Test</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {user ? (
        <div className="user-info">
          <h3>✅ Authenticated User</h3>
          <div className="user-details">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
          
          <div className="auth-actions">
            <button 
              onClick={handleGetUserInfo} 
              disabled={loading}
              className="btn btn-info"
            >
              {loading ? 'Loading...' : 'Refresh User Info'}
            </button>
            
            <button 
              onClick={handleRefreshToken} 
              disabled={loading}
              className="btn btn-warning"
            >
              {loading ? 'Refreshing...' : 'Refresh Token'}
            </button>
            
            <button 
              onClick={handleLogout} 
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
          
          <div className="security-info">
            <h4>🛡️ Security Features</h4>
            <ul>
              <li>✅ httpOnly Cookie - Cannot be accessed by JavaScript</li>
              <li>✅ Secure Flag - Only sent over HTTPS in production</li>
              <li>✅ SameSite=Lax - CSRF protection</li>
              <li>✅ 7-day expiration with auto-refresh</li>
              <li>✅ No localStorage token storage</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="login-form">
          <h3>🔑 Login Required</h3>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Logging in...' : 'Login with Secure Cookies'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
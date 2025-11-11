import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';
import AuthModal from './AuthModal';

/**
 * ProtectedRoute component - wraps routes that require authentication
 * Shows loading while checking auth, then either shows content or login modal
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal('choose');
    } else {
      closeAuthModal();
    }
  }, [isLoading, isAuthenticated, openAuthModal, closeAuthModal]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <Loading />
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Checking authentication...</p>
      </div>
    );
  }

  // If authenticated, show the protected content
  if (isAuthenticated) {
    return (
      <>
        {/* User info indicator */}
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#e8f5e9',
          borderLeft: '4px solid #4caf50',
          marginBottom: '1rem',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>
              ✓ Authenticated
            </span>
            {user && (
              <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                {user.name} ({user.role})
              </span>
            )}
          </div>
          {user?.isDemo && (
            <span style={{
              backgroundColor: '#ff9800',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              DEMO MODE
            </span>
          )}
        </div>
        {children}
      </>
    );
  }

  // Not authenticated - show login modal
  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#856404', marginBottom: '1rem' }}>
            🔒 Authentication Required
          </h2>
          <p style={{ color: '#856404' }}>
            Please sign in to access this content.
          </p>
        </div>
      </div>
    </>
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './OTPLoginModal.css';

const OTPLoginModal = ({ isOpen, onClose }) => {
  const { requestOTP, verifyOTP, isLoading, error, otpSent, otpEmail, resetOTP, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateOTPInput = (otpValue) => {
    if (otpValue.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return false;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpError('OTP must contain only numbers');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    try {
      await requestOTP({ email });
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateOTPInput(otp)) {
      return;
    }

    try {
      await verifyOTP({ email: otpEmail || email, otp });
      // If successful, modal will close as user becomes authenticated
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
    if (error) {
      clearError();
    }
  };

  const handleOtpChange = (value) => {
    // Only allow numeric input and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (otpError) {
      setOtpError('');
    }
    if (error) {
      clearError();
    }
  };

  const handleRequestNewOTP = () => {
    resetOTP();
    setOtp('');
    setOtpError('');
    clearError();
  };

  const handleClose = () => {
    if (!isLoading && onClose) {
      resetOTP();
      setEmail('');
      setOtp('');
      setEmailError('');
      setOtpError('');
      clearError();
      onClose();
    }
  };

  const handleCloseAndGoHome = () => {
    if (isLoading) return;
    resetOTP();
    setEmail('');
    setOtp('');
    setEmailError('');
    setOtpError('');
    clearError();
    if (onClose) onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  const isAccountLocked = error && error.includes('ACCOUNT_PERMANENTLY_LOCKED');
  const attemptsMatch = error ? error.match(/(\d+)\s+attempts?\s+remaining/i) : null;
  const attemptsRemaining = attemptsMatch ? parseInt(attemptsMatch[1], 10) : null;

  return (
    <div className="otp-modal-overlay" onClick={handleClose}>
      <div className="otp-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="otp-modal-close" 
          onClick={handleCloseAndGoHome}
          disabled={isLoading}
          aria-label="Close modal"
        >
          ×
        </button>

        {otpSent ? (
          // OTP Verification Step
          <div className="otp-modal-body">
            <div className="otp-modal-header">
              <h2>Enter OTP</h2>
              <p>
                We've sent a 6-digit code to <strong>{otpEmail}</strong>
              </p>
              <p className="otp-helper-text">
                Check your email and enter the code below
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="otp-form">
              <div className="form-group">
                <label htmlFor="otp">One-Time Password</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  className={`otp-input ${otpError ? 'input-error' : ''}`}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  autoFocus
                />
                {otpError && (
                  <p className="error-message">{otpError}</p>
                )}
              </div>

              {error && (
                <div className={`alert ${isAccountLocked ? 'alert-error' : 'alert-warning'}`}>
                  <div className="alert-icon">
                    {isAccountLocked ? '🔒' : '⚠️'}
                  </div>
                  <div className="alert-content">
                    <h4>{isAccountLocked ? 'Account Locked' : 'Invalid OTP'}</h4>
                    <p>
                      {isAccountLocked 
                        ? 'This account has been locked. Contact an administrator for a new invitation code.'
                        : error
                      }
                    </p>
                    {attemptsRemaining !== null && !isAccountLocked && (
                      <p className="alert-attempts">
                        <strong>Warning:</strong> {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before permanent lockout
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="btn btn-primary btn-full"
              >
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Sign In'
                )}
              </button>
            </form>

            <div className="otp-actions">
              <button
                onClick={handleRequestNewOTP}
                className="link-button"
                disabled={isLoading}
              >
                Didn't receive the code? Request new OTP
              </button>
            </div>

            <div className="demo-notice">
              <p><strong>📧 Demo Mode:</strong> The OTP will be shown in a browser alert</p>
            </div>
          </div>
        ) : (
          // Email Input Step
          <div className="otp-modal-body">
            <div className="otp-modal-header">
              <h2>Sign In</h2>
              <p>Enter your email to receive a one-time password</p>
            </div>

            <form onSubmit={handleRequestOTP} className="otp-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`form-input ${emailError ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
                {emailError && (
                  <p className="error-message">{emailError}</p>
                )}
              </div>

              {error && (
                <div className={`alert ${isAccountLocked ? 'alert-error' : 'alert-warning'}`}>
                  <div className="alert-icon">
                    {isAccountLocked ? '🔒' : '⚠️'}
                  </div>
                  <div className="alert-content">
                    <p>
                      {isAccountLocked
                        ? 'This account has been locked. Contact an administrator for a new invitation code.'
                        : error
                      }
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="btn btn-primary btn-full"
              >
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Sending OTP...
                  </span>
                ) : (
                  'Send One-Time Password'
                )}
              </button>
            </form>

            <div className="demo-users">
              <h4>Demo Users:</h4>
              <p><strong>Admin:</strong> jm.beaminstitute@gmail.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

OTPLoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func
};

export default OTPLoginModal;

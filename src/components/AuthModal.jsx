import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './OTPLoginModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const {
    requestOTP,
    verifyOTP,
    register,
    requestInvite,
    validateInvite,
    isLoading,
    error,
    otpSent,
    otpEmail,
    resetOTP,
    clearError,
    authModalStep,
    goToAuthStep,
    selectedEmail,
  } = useAuth();
  const navigate = useNavigate();
  // Login state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteInfo, setInviteInfo] = useState(null);

  // Sync register email with selectedEmail from context when it appears
  useEffect(() => {
    if (selectedEmail && !regEmail) {
      setRegEmail(selectedEmail);
    }
  }, [selectedEmail, regEmail]);

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
    if (!validateEmail(email)) return;
    try {
      await requestOTP({ email });
    } catch {
      // handled by context
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateOTPInput(otp)) return;
    try {
      await verifyOTP({ email: otpEmail || email, otp });
      // success handled by context consumer
    } catch {
      // handled by context
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailError) setEmailError('');
    if (error) clearError();
  };

  const handleOtpChange = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (otpError) setOtpError('');
    if (error) clearError();
  };

  const handleRequestNewOTP = () => {
    resetOTP();
    setOtp('');
    setOtpError('');
    clearError();
  };

  // Register flows
  const handleRequestInvite = async (e) => {
    e.preventDefault();
    const targetEmail = regEmail.trim();
    if (!targetEmail) return;
    try {
      if (import.meta.env.DEV) console.log('📨 AuthModal: submitting invite request for', targetEmail);
      const result = await requestInvite(targetEmail);
      setInviteInfo(result);
      if (import.meta.env.DEV) console.log('📨 AuthModal: invite request result', result);
    } catch (err) {
      if (import.meta.env.DEV) console.error('📨 AuthModal: invite request failed', err);
      setInviteInfo({ error: err?.message || 'Failed to submit request' });
    }
  };

  const handleValidateAndRegister = async (e) => {
    e.preventDefault();
    const targetEmail = regEmail || selectedEmail || '';
    if (!targetEmail.trim() || !inviteCode.trim()) return;
    try {
      console.log('🔍 Validating invite...', { email: targetEmail.trim(), code: inviteCode.trim() });
      const validation = await validateInvite(inviteCode.trim(), targetEmail.trim());
      console.log('🔍 Validation result:', validation);
      
      if (validation && validation.valid) {
        console.log('✅ Validation successful, calling register...');
        await register({ email: targetEmail.trim(), name: targetEmail.split('@')[0], inviteCode: inviteCode.trim() });
        console.log('✅ Registration complete!');
        // Auth success handled by context; modal will close due to route auth state
      } else {
        console.log('❌ Validation failed:', validation);
        // surface an error via clearError + local message
        setInviteInfo({ error: 'Invalid invitation code' });
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setInviteInfo({ error: err?.message || 'Validation failed' });
    }
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

        {authModalStep === 'choose' && (
          <div className="otp-modal-body">
            <div className="otp-modal-header">
              <h2>Log In or Register</h2>
              <p>Choose how you want to continue</p>
            </div>
            <div className="otp-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => goToAuthStep('login')} disabled={isLoading}>
                Log In with OTP
              </button>
              <button className="btn" onClick={() => goToAuthStep('register:choose')} disabled={isLoading}>
                Register
              </button>
              <button className="btn" onClick={handleCloseAndGoHome} disabled={isLoading}>
                Cancel
              </button>
            </div>
            <div className="demo-users" style={{ marginTop: '1rem' }}>
              <h4>Demo Users:</h4>
              <p><strong>Admin:</strong> jm.beaminstitute@gmail.com</p>
            </div>
          </div>
        )}

        {authModalStep === 'login' && (
          otpSent ? (
            <div className="otp-modal-body">
              <div className="otp-modal-header">
                <h2>Enter OTP</h2>
                <p>We've sent a 6-digit code to <strong>{otpEmail}</strong></p>
                <p className="otp-helper-text">Check your email and enter the code below</p>
              </div>
              <form onSubmit={handleVerifyOTP} className="otp-form">
                <div className="form-group">
                  <label htmlFor="otp">One-Time Password</label>
                  <input id="otp" type="text" inputMode="numeric" pattern="\d{6}" value={otp} onChange={(e) => handleOtpChange(e.target.value)} className={`otp-input ${otpError ? 'input-error' : ''}`} placeholder="000000" maxLength={6} disabled={isLoading} autoComplete="one-time-code" autoFocus />
                  {otpError && <p className="error-message">{otpError}</p>}
                </div>
                {error && (
                  <div className={`alert ${isAccountLocked ? 'alert-error' : 'alert-warning'}`}>
                    <div className="alert-icon">{isAccountLocked ? '🔒' : '⚠️'}</div>
                    <div className="alert-content">
                      <h4>{isAccountLocked ? 'Account Locked' : 'Invalid OTP'}</h4>
                      <p>{isAccountLocked ? 'This account has been locked. Contact an administrator for a new invitation code.' : error}</p>
                      {attemptsRemaining !== null && !isAccountLocked && (
                        <p className="alert-attempts"><strong>Warning:</strong> {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before permanent lockout</p>
                      )}
                    </div>
                  </div>
                )}
                <button type="submit" disabled={isLoading || otp.length !== 6} className="btn btn-primary btn-full">
                  {isLoading ? (<span className="btn-loading"><span className="spinner"></span>Verifying...</span>) : 'Verify & Sign In'}
                </button>
              </form>
              <div className="otp-actions">
                <button onClick={handleRequestNewOTP} className="link-button" disabled={isLoading}>Didn't receive the code? Request new OTP</button>
              </div>
              <div className="demo-notice"><p><strong>📧 Demo Mode:</strong> The OTP will be shown in a browser alert</p></div>
            </div>
          ) : (
            <div className="otp-modal-body">
              <div className="otp-modal-header">
                <h2>Log In</h2>
                <p>Enter your email to receive a one-time password</p>
              </div>
              <form onSubmit={handleRequestOTP} className="otp-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} className={`form-input ${emailError ? 'input-error' : ''}`} placeholder="Enter your email" disabled={isLoading} autoComplete="email" autoFocus />
                  {emailError && <p className="error-message">{emailError}</p>}
                </div>
                {error && (
                  <div className={`alert ${isAccountLocked ? 'alert-error' : 'alert-warning'}`}>
                    <div className="alert-icon">{isAccountLocked ? '🔒' : '⚠️'}</div>
                    <div className="alert-content"><p>{isAccountLocked ? 'This account has been locked. Contact an administrator for a new invitation code.' : error}</p></div>
                  </div>
                )}
                <button type="submit" disabled={isLoading || !email} className="btn btn-primary btn-full">
                  {isLoading ? (<span className="btn-loading"><span className="spinner"></span>Sending OTP...</span>) : 'Send One-Time Password'}
                </button>
              </form>
              <div className="otp-actions" style={{ marginTop: '1rem' }}>
                <button className="link-button" onClick={() => goToAuthStep('choose')} disabled={isLoading}>Back</button>
              </div>
              <div className="demo-users"><h4>Demo Users:</h4><p><strong>Admin:</strong> jm.beaminstitute@gmail.com</p></div>
            </div>
          )
        )}

        {authModalStep === 'register:choose' && (
          <div className="otp-modal-body">
            <div className="otp-modal-header">
              <h2>Register</h2>
              <p>Choose an option</p>
            </div>
            <div className="otp-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => goToAuthStep('register:request')} disabled={isLoading}>Request Invitation</button>
              <button className="btn" onClick={() => goToAuthStep('register:verify')} disabled={isLoading}>I have an Invitation</button>
              <button className="btn" onClick={() => goToAuthStep('choose')} disabled={isLoading}>Back</button>
            </div>
          </div>
        )}

        {authModalStep === 'register:request' && (
          <div className="otp-modal-body">
            <div className="otp-modal-header">
              <h2>Request Invitation</h2>
              <p>Enter your email and we'll notify the admin to review your request</p>
            </div>
            <form onSubmit={handleRequestInvite} className="otp-form">
              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="form-input" placeholder="your@email"
                  disabled={isLoading} autoComplete="email" autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading || !regEmail}>Submit Request</button>
            </form>
            {inviteInfo && inviteInfo.requestId && (
              <div className="alert" style={{ marginTop: '1rem' }}>
                <div className="alert-content">
                  <p>Your request has been submitted. You will receive an invitation code by email if approved.</p>
                </div>
              </div>
            )}
            <div className="otp-actions" style={{ marginTop: '1rem' }}>
              <button className="link-button" onClick={() => goToAuthStep('choose')} disabled={isLoading}>Done</button>
              <button className="link-button" onClick={() => goToAuthStep('register:verify')} disabled={isLoading}>I already have a code</button>
            </div>
          </div>
        )}

        {authModalStep === 'register:verify' && (
          <div className="otp-modal-body">
            <div className="otp-modal-header">
              <h2>Complete Registration</h2>
              <p>Enter your email and invitation code</p>
            </div>
            <form onSubmit={handleValidateAndRegister} className="otp-form">
              <div className="form-group">
                <label htmlFor="verify-email">Email Address</label>
                <input id="verify-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="form-input" placeholder="your@email"
                  disabled={isLoading} autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="invite-code">Invitation Code</label>
                <input id="invite-code" type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="form-input" placeholder="DEMO-VIEWER-2024" disabled={isLoading} />
              </div>
              {inviteInfo && inviteInfo.error && (
                <p className="error-message">{inviteInfo.error}</p>
              )}
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading || !regEmail || !inviteCode}>Register</button>
            </form>
            <div className="otp-actions" style={{ marginTop: '1rem' }}>
              <button className="link-button" onClick={() => goToAuthStep('register:choose')} disabled={isLoading}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default AuthModal;

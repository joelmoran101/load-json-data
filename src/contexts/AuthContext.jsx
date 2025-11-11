import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { requestOTP, verifyOTP, register, getCurrentUser, logout as authLogout, requestInvite, validateInviteCode } from '../services/authService';
import { secureUserStorage, secureTokenStorage, legacyStorage, isSecureStorageAvailable, clearSecureAuthData } from '../utils/secureStorage';

/**
 * @typedef {import('../types/auth').User} User
 * @typedef {import('../types/auth').AuthState} AuthState
 * @typedef {import('../types/auth').OTPRequest} OTPRequest
 * @typedef {import('../types/auth').OTPVerification} OTPVerification
 * @typedef {import('../types/auth').RegisterData} RegisterData
 * @typedef {import('../types/auth').DemoOTPDisplay} DemoOTPDisplay
 */

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  otpSent: false,
  otpEmail: null,
  isDemo: false,
  // Modal state
  isAuthModalOpen: false,
  authModalStep: 'choose', // 'choose' | 'login' | 'register:choose' | 'register:request' | 'register:verify'
  selectedEmail: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
        isDemo: action.payload.isDemo || false
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
        // Preserve OTP state during auth failures (don't reset if OTP was just sent)
        isDemo: false
      };
    case 'OTP_SENT':
      return {
        ...state,
        isLoading: false,
        error: null,
        otpSent: true,
        otpEmail: action.payload
      };
    case 'DEMO_MODE_ENTER': {
      const demoUser = {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'Demo',
        invitedBy: 'system',
        invitedAt: new Date(),
        isDemo: true
      };
      return {
        ...state,
        isAuthenticated: true,
        user: demoUser,
        isLoading: false,
        error: null,
        isDemo: true
      };
    }
    case 'DEMO_OTP_DISPLAY':
      return {
        ...state,
        isLoading: false,
        error: null,
        otpSent: true,
        otpEmail: action.payload.email
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        otpSent: false,
        otpEmail: null,
        isDemo: false,
        isAuthModalOpen: false,
        authModalStep: 'choose',
        selectedEmail: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_OTP':
      return { ...state, otpSent: false, otpEmail: null };
    case 'AUTH_END':
      return { ...state, isLoading: false };
    case 'AUTH_MODAL_OPEN':
      return { ...state, isAuthModalOpen: true, authModalStep: action.payload?.step || 'choose', selectedEmail: action.payload?.email || null };
    case 'AUTH_MODAL_CLOSE':
      return { ...state, isAuthModalOpen: false, authModalStep: 'choose', selectedEmail: null, error: null, otpSent: false, otpEmail: null };
    case 'AUTH_MODAL_STEP':
      return { ...state, authModalStep: action.payload, error: null };
    case 'SET_SELECTED_EMAIL':
      return { ...state, selectedEmail: action.payload };
    default:
      return state;
  }
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'AUTH_START' });
      
      try {
        const user = await getCurrentUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: 'No valid session found' });
        }
      } catch {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to validate session' });
      }
    };

    initAuth();
  }, []);

  const handleRequestOTP = useCallback(async (request) => {
    try {
      await requestOTP(request);
      dispatch({ type: 'OTP_SENT', payload: request.email });
    } catch (error) {
      console.log('❌ AuthContext: OTP request failed:', error);
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to send OTP'
      });
      throw error;
    }
  }, []);

  const handleVerifyOTP = useCallback(async (verification) => {
    console.log('🔐 AuthContext: Starting OTP verification for:', verification.email);
    dispatch({ type: 'AUTH_START' });
    
    try {
      const user = await verifyOTP(verification);
      console.log('✅ AuthContext: OTP verified, user:', user);
      
      // Use secure storage if available, otherwise fallback to regular storage
      if (isSecureStorageAvailable()) {
        await secureUserStorage.setUser(user);
        await secureTokenStorage.setToken(`token-${user.id}`);
      } else {
        legacyStorage.setUser(user);
        legacyStorage.setToken(`token-${user.id}`);
      }
      
      console.log('✅ AuthContext: Dispatching AUTH_SUCCESS');
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      console.log('✅ AuthContext: User authenticated successfully');
    } catch (error) {
      console.log('❌ AuthContext: OTP verification failed:', error);
      dispatch({
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'OTP verification failed'
      });
      throw error;
    }
  }, []);

  const handleRegister = useCallback(async (data) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const user = await register(data);
      
      // Use secure storage if available, otherwise fallback to regular storage
      if (isSecureStorageAvailable()) {
        await secureUserStorage.setUser(user);
        await secureTokenStorage.setToken(`token-${user.id}`);
      } else {
        legacyStorage.setUser(user);
        legacyStorage.setToken(`token-${user.id}`);
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Registration failed'
      });
      throw error;
    }
  }, []);

  const handleLogout = useCallback(() => {
    authLogout();
    
    // Clear secure storage if available, otherwise clear legacy storage
    if (isSecureStorageAvailable()) {
      clearSecureAuthData();
    } else {
      legacyStorage.clear();
    }
    
    dispatch({ type: 'LOGOUT' });
  }, []);

  const handleClearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const handleResetOTP = useCallback(() => {
    dispatch({ type: 'RESET_OTP' });
  }, []);

  const handleEnterDemoMode = useCallback(() => {
    dispatch({ type: 'DEMO_MODE_ENTER' });
  }, []);

  const simulateDemoOTP = useCallback((email) => {
    const demoOTP = {
      email,
      otp: '123456', // Demo OTP is always 123456
      timestamp: new Date()
    };
    
    // Dispatch action to show OTP sent state
    dispatch({ type: 'DEMO_OTP_DISPLAY', payload: demoOTP });
    
    return demoOTP;
  }, []);

  const openAuthModal = useCallback((step = 'choose', email = null) => {
    dispatch({ type: 'AUTH_MODAL_OPEN', payload: { step, email } });
  }, []);

  const closeAuthModal = useCallback(() => {
    dispatch({ type: 'AUTH_MODAL_CLOSE' });
  }, []);

  const goToAuthStep = useCallback((step) => {
    dispatch({ type: 'AUTH_MODAL_STEP', payload: step });
  }, []);

  const handleRequestInvite = useCallback(async (email) => {
    if (import.meta.env.DEV) console.log('📨 AuthContext: requestInvite start', email);
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await requestInvite(email);
      if (import.meta.env.DEV) console.log('📨 AuthContext: requestInvite success', result);
      dispatch({ type: 'SET_SELECTED_EMAIL', payload: email });
      // Do NOT change step here; UI will show "request submitted" message
      dispatch({ type: 'CLEAR_ERROR' });
      return result;
    } catch (error) {
      if (import.meta.env.DEV) console.error('📨 AuthContext: requestInvite failed', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Failed to request invitation' });
      throw error;
    } finally {
      dispatch({ type: 'AUTH_END' });
    }
  }, []);

  const handleValidateInvite = useCallback(async (code, email) => {
    try {
      const res = await validateInviteCode(code, email);
      return res;
    } catch (e) {
      throw e;
    }
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    requestOTP: handleRequestOTP,
    verifyOTP: handleVerifyOTP,
    register: handleRegister,
    requestInvite: handleRequestInvite,
    validateInvite: handleValidateInvite,
    openAuthModal,
    closeAuthModal,
    goToAuthStep,
    enterDemoMode: handleEnterDemoMode,
    simulateDemoOTP: simulateDemoOTP,
    logout: handleLogout,
    clearError: handleClearError,
    resetOTP: handleResetOTP
  }), [state, handleRequestOTP, handleVerifyOTP, handleRegister, handleRequestInvite, handleValidateInvite, openAuthModal, closeAuthModal, goToAuthStep, handleEnterDemoMode, simulateDemoOTP, handleLogout, handleClearError, handleResetOTP]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

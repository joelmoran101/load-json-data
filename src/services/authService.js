/**
 * @typedef {import('../types/auth').User} User
 * @typedef {import('../types/auth').OTPRequest} OTPRequest
 * @typedef {import('../types/auth').OTPVerification} OTPVerification
 * @typedef {import('../types/auth').RegisterData} RegisterData
 * @typedef {import('../types/auth').InviteCode} InviteCode
 * @typedef {import('../types/auth').RolePermissions} RolePermissions
 */

// Mock database - in production, this would be replaced with actual API calls
const MOCK_USERS = [
  {
    id: '1',
    email: 'jm.beaminstitute@gmail.com',  // Default admin email
    name: 'Joel Moran',
    role: 'Admin',
    invitedBy: 'system',
    invitedAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
];

export const MOCK_INVITE_CODES = [
  {
    code: 'DEMO-ANALYST-2024',
    email: 'analyst@company.com',
    role: 'Analyst',
    expiresAt: new Date('2025-12-31'),
    isUsed: false,
    invitedBy: 'admin@company.com',
    createdAt: new Date('2024-01-01')
  },
  {
    code: 'DEMO-VIEWER-2024',
    email: 'viewer@company.com',
    role: 'Viewer',
    expiresAt: new Date('2025-12-31'),
    isUsed: false,
    invitedBy: 'admin@company.com',
    createdAt: new Date('2024-01-01')
  }
];

// Security configuration
const permanentlyLockedAccounts = new Set(); // Permanently locked accounts

// Mock OTP storage - in production, this would be in a database with TTL
const MOCK_OTPS = {};

// OTP configuration
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;

/**
 * Get role permissions
 * @param {string} role
 * @returns {RolePermissions}
 */
export const getRolePermissions = (role) => {
  switch (role) {
    case 'Admin':
      return {
        canViewDashboard: true,
        canExportData: true,
        canManageUsers: true,
        canViewAllCompanies: true
      };
    case 'Analyst':
      return {
        canViewDashboard: true,
        canExportData: true,
        canManageUsers: false,
        canViewAllCompanies: true
      };
    case 'Viewer':
      return {
        canViewDashboard: true,
        canExportData: false,
        canManageUsers: false,
        canViewAllCompanies: false
      };
    case 'Demo':
      return {
        canViewDashboard: true,
        canExportData: true, // Allow demo users to try export features
        canManageUsers: false,
        canViewAllCompanies: true // Allow demo users to explore all companies
      };
    default:
      return {
        canViewDashboard: false,
        canExportData: false,
        canManageUsers: false,
        canViewAllCompanies: false
      };
  }
};

/**
 * Generate a random salt
 * @returns {string}
 */
const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash OTP with salt for secure storage
 * @param {string} otp
 * @param {string} salt
 * @returns {Promise<string>}
 */
const hashOTP = async (otp, salt) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify OTP against hash using constant-time comparison
 * @param {string} otp
 * @param {string} salt
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const verifyOTPHash = async (otp, salt, hash) => {
  const otpHash = await hashOTP(otp, salt);
  
  // Constant-time comparison to prevent timing attacks
  if (otpHash.length !== hash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < otpHash.length; i++) {
    result |= otpHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Security check for OTP requests with permanent lockout
 * @param {string} email
 * @returns {{ allowed: boolean, reason?: string }}
 */
const checkAccountSecurity = (email) => {
  // Check if account is permanently locked
  if (permanentlyLockedAccounts.has(email)) {
    return { 
      allowed: false, 
      reason: 'ACCOUNT_PERMANENTLY_LOCKED'
    };
  }
  
  return { allowed: true };
};

/**
 * Request OTP for login - calls backend API
 * @param {OTPRequest} request
 * @returns {Promise<void>}
 */
export const requestOTP = async (request) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      
      // Check account security status
      const securityCheck = checkAccountSecurity(request.email);
      if (!securityCheck.allowed) {
        if (securityCheck.reason === 'ACCOUNT_PERMANENTLY_LOCKED') {
          reject(new Error('ACCOUNT_PERMANENTLY_LOCKED: This account has been permanently locked due to too many failed login attempts. Please contact an administrator to request a new invitation code.'));
          return;
        }
      }

      const user = MOCK_USERS.find(u => u.email === request.email);
      
      if (!user) {
        reject(new Error('User not found. Please check your email address.'));
        return;
      }
      
      try {
        // Call backend to generate and send OTP
        const response = await fetch('http://localhost:3002/api/auth/request-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: request.email })
        });
        
        if (!response.ok) {
          throw new Error('Failed to request OTP from backend');
        }
        
        const result = await response.json();
        
        // Handle OTP from backend (both demo and real emails)
        if (result.otp) {
          // Backend provided the OTP, use it for verification
          const otp = result.otp;
          const salt = generateSalt();
          const otpHash = await hashOTP(otp, salt);
          const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
          
          // Store for verification
          const existingAttempts = MOCK_OTPS[request.email]?.attempts || 0;
          MOCK_OTPS[request.email] = {
            otpHash,
            expires,
            attempts: existingAttempts,
            salt
          };
          
          if (result.isDemoMode) {
            // Show OTP in alert for demo mode
            if (typeof window !== 'undefined') {
              alert(`📧 DEMO MODE - Your OTP is: ${otp}\n\nThis would normally be sent via email to ${request.email}`);
            }
          }
        } else {
          // No OTP returned (shouldn't happen in current setup)
          throw new Error('No OTP received from backend');
        }
        
        resolve();
      } catch (error) {
        reject(new Error('Failed to send OTP. Please try again.'));
      }
    }, 800);
  });
};

/**
 * Verify OTP and login
 * @param {OTPVerification} verification
 * @returns {Promise<User>}
 */
export const verifyOTP = async (verification) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const user = MOCK_USERS.find(u => u.email === verification.email);
      const otpData = MOCK_OTPS[verification.email];
      
      if (!user) {
        reject(new Error('User not found'));
        return;
      }
      
      if (!otpData) {
        reject(new Error('OTP not found. Please request a new one.'));
        return;
      }
      
      // Check if OTP expired
      if (new Date() > otpData.expires) {
        delete MOCK_OTPS[verification.email];
        reject(new Error('OTP has expired. Please request a new one.'));
        return;
      }
      
      // Check attempt limit
      if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
        // Permanently lock the account after max attempts
        permanentlyLockedAccounts.add(verification.email);
        delete MOCK_OTPS[verification.email];
        reject(new Error('ACCOUNT_PERMANENTLY_LOCKED: Too many failed OTP attempts. This account has been permanently locked for security reasons. Please contact an administrator to request a new invitation code.'));
        return;
      }
      
      try {
        // Verify OTP using secure hash comparison
        const isValid = await verifyOTPHash(verification.otp, otpData.salt, otpData.otpHash);
        
        if (!isValid) {
          otpData.attempts += 1;
          const remainingAttempts = MAX_OTP_ATTEMPTS - otpData.attempts;
          
          // If this was the last attempt, permanently lock the account
          if (remainingAttempts <= 0) {
            permanentlyLockedAccounts.add(verification.email);
            delete MOCK_OTPS[verification.email];
            reject(new Error('ACCOUNT_PERMANENTLY_LOCKED: Too many failed OTP attempts. This account has been permanently locked for security reasons. Please contact an administrator to request a new invitation code.'));
            return;
          }
          
          reject(new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`));
          return;
        }
        
        // OTP is valid, clean up and return user
        delete MOCK_OTPS[verification.email];
        user.lastLogin = new Date();
        
        resolve(user);
      } catch (error) {
        console.error('OTP verification failed:', error);
        reject(new Error('OTP verification failed. Please try again.'));
      }
    }, 1000);
  });
};

/**
 * Register new user
 * @param {RegisterData} data
 * @returns {Promise<User>}
 */
export const register = async (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find and validate invite code
      const inviteCode = MOCK_INVITE_CODES.find(
        code => code.code === data.inviteCode && 
                code.email === data.email &&
                !code.isUsed &&
                new Date() < code.expiresAt
      );
      
      if (!inviteCode) {
        reject(new Error('Invalid or expired invitation code'));
        return;
      }
      
      // Check if user already exists
      if (MOCK_USERS.find(u => u.email === data.email)) {
        reject(new Error('User already exists'));
        return;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: inviteCode.role,
        invitedBy: inviteCode.invitedBy,
        invitedAt: inviteCode.createdAt,
        lastLogin: new Date()
      };
      
      // Mark invite code as used
      inviteCode.isUsed = true;
      
      // Add user to mock database
      MOCK_USERS.push(newUser);
      
      resolve(newUser);
    }, 1500); // Simulate network delay
  });
};

/**
 * Validate invite code
 * @param {string} code
 * @param {string} email
 * @returns {Promise<InviteCode>}
 */
export const validateInviteCode = async (code, email) => {
  try {
    // Try backend API first if backend URL is configured
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
    
    const response = await fetch(`${backendUrl}/api/auth/validate-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteCode: code, email })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Validation failed');
    }
    
    if (result.success && result.valid) {
      // Convert backend response to InviteCode format
      return {
        code,
        email,
        role: result.role,
        expiresAt: new Date('2025-12-31'), // Default expiry
        isUsed: false,
        invitedBy: result.invitedBy,
        createdAt: new Date('2024-01-01')
      };
    }
    
    throw new Error('Invalid invitation code');
  } catch (error) {
    // Fallback to mock validation if backend is not available
    console.warn('Backend validation failed, falling back to mock data:', error);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const inviteCode = MOCK_INVITE_CODES.find(
          inv => inv.code === code && 
                 inv.email === email &&
                 !inv.isUsed &&
                 new Date() < inv.expiresAt
        );
        
        if (!inviteCode) {
          reject(new Error('Invalid or expired invitation code'));
          return;
        }
        
        resolve(inviteCode);
      }, 500);
    });
  }
};

/**
 * Get current user from storage
 * @returns {Promise<User | null>}
 */
export const getCurrentUser = async () => {
  try {
    const { secureUserStorage, legacyStorage, isSecureStorageAvailable } = await import('../utils/secureStorage');
    
    let user = null;
    
    // Try secure storage first, then fallback to legacy
    if (isSecureStorageAvailable()) {
      user = await secureUserStorage.getUser();
    } else {
      user = legacyStorage.getUser();
    }
    
    if (!user) return null;
    
    // Validate user still exists in mock database
    const existingUser = MOCK_USERS.find(u => u.id === user.id);
    return existingUser || null;
  } catch {
    return null;
  }
};

/**
 * Logout user
 * @returns {void}
 */
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
};

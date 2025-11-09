/**
 * @typedef {'Admin' | 'Analyst' | 'Viewer' | 'Demo'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {UserRole} role
 * @property {string} invitedBy
 * @property {Date} invitedAt
 * @property {Date} [lastLogin]
 * @property {boolean} [isDemo]
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {User | null} user
 * @property {boolean} isLoading
 * @property {string | null} error
 * @property {boolean} otpSent
 * @property {string | null} otpEmail
 * @property {boolean} isDemo
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} [otp]
 */

/**
 * @typedef {Object} OTPRequest
 * @property {string} email
 */

/**
 * @typedef {Object} OTPVerification
 * @property {string} email
 * @property {string} otp
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} name
 * @property {string} email
 * @property {string} inviteCode
 */

/**
 * @typedef {Object} InviteCode
 * @property {string} code
 * @property {string} email
 * @property {'Admin' | 'Analyst' | 'Viewer'} role
 * @property {Date} expiresAt
 * @property {boolean} isUsed
 * @property {string} invitedBy
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} DemoOTPDisplay
 * @property {string} email
 * @property {string} otp
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} RolePermissions
 * @property {boolean} canViewDashboard
 * @property {boolean} canExportData
 * @property {boolean} canManageUsers
 * @property {boolean} canViewAllCompanies
 */

/**
 * @typedef {
 *   | { type: 'AUTH_START' }
 *   | { type: 'AUTH_SUCCESS', payload: User }
 *   | { type: 'AUTH_FAILURE', payload: string }
 *   | { type: 'OTP_SENT', payload: string }
 *   | { type: 'DEMO_MODE_ENTER' }
 *   | { type: 'DEMO_OTP_DISPLAY', payload: DemoOTPDisplay }
 *   | { type: 'LOGOUT' }
 *   | { type: 'CLEAR_ERROR' }
 *   | { type: 'RESET_OTP' }
 * } AuthAction
 */

// Export empty object to make this a module
export {};

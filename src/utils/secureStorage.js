// Secure storage utilities with encryption for sensitive data

/**
 * @typedef {import('../types/auth').User} User
 */

// Simple encryption/decryption using Web Crypto API
class SecureStorage {
  static STORAGE_KEY_PREFIX = 'secure_';
  static ENCRYPTION_ALGORITHM = 'AES-GCM';
  static KEY_LENGTH = 256;
  static IV_LENGTH = 12;

  /**
   * Generate a key for encryption/decryption
   * @returns {Promise<CryptoKey>}
   */
  static async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: this.ENCRYPTION_ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derive a key from a password/passphrase
   * @param {string} password
   * @param {Uint8Array} salt
   * @returns {Promise<CryptoKey>}
   */
  static async deriveKey(password, salt) {
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive actual encryption key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.ENCRYPTION_ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a session-based encryption key
   * @returns {string}
   */
  static getSessionKey() {
    // In a real application, this would be derived from user session or server
    // For demo purposes, we'll use a combination of session storage and a fixed salt
    let sessionKey = sessionStorage.getItem('session_key');
    if (!sessionKey) {
      // Generate a random session key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      sessionKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('session_key', sessionKey);
    }
    return sessionKey;
  }

  /**
   * Encrypt data
   * @param {string} data
   * @returns {Promise<string>}
   */
  static async encrypt(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    // Derive key from session key
    const key = await this.deriveKey(this.getSessionKey(), salt);

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ENCRYPTION_ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data
   * @param {string} encryptedData
   * @returns {Promise<string>}
   */
  static async decrypt(encryptedData) {
    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract salt, IV, and encrypted data
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 16 + this.IV_LENGTH);
      const encrypted = combined.slice(16 + this.IV_LENGTH);

      // Derive key from session key
      const key = await this.deriveKey(this.getSessionKey(), salt);

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ENCRYPTION_ALGORITHM,
          iv: iv,
        },
        key,
        encrypted
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Store encrypted data
   * @param {string} key
   * @param {unknown} value
   * @returns {Promise<void>}
   */
  static async setSecureItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = await this.encrypt(serialized);
      localStorage.setItem(this.STORAGE_KEY_PREFIX + key, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
      throw new Error('Failed to securely store data');
    }
  }

  /**
   * Retrieve and decrypt data
   * @template T
   * @param {string} key
   * @returns {Promise<T | null>}
   */
  static async getSecureItem(key) {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY_PREFIX + key);
      if (!encrypted) {
        return null;
      }

      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      // Clean up corrupted data
      this.removeSecureItem(key);
      return null;
    }
  }

  /**
   * Remove encrypted data
   * @param {string} key
   * @returns {void}
   */
  static removeSecureItem(key) {
    localStorage.removeItem(this.STORAGE_KEY_PREFIX + key);
  }

  /**
   * Clear all secure data
   * @returns {void}
   */
  static clearSecureStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    // Also clear session key
    sessionStorage.removeItem('session_key');
  }
}

// Secure user storage
export const secureUserStorage = {
  /**
   * @param {User} user
   * @returns {Promise<void>}
   */
  async setUser(user) {
    await SecureStorage.setSecureItem('user', user);
  },

  /**
   * @returns {Promise<User | null>}
   */
  async getUser() {
    return await SecureStorage.getSecureItem('user');
  },

  removeUser() {
    SecureStorage.removeSecureItem('user');
  }
};

// Secure auth token storage
export const secureTokenStorage = {
  /**
   * @param {string} token
   * @returns {Promise<void>}
   */
  async setToken(token) {
    await SecureStorage.setSecureItem('authToken', token);
  },

  /**
   * @returns {Promise<string | null>}
   */
  async getToken() {
    return await SecureStorage.getSecureItem('authToken');
  },

  removeToken() {
    SecureStorage.removeSecureItem('authToken');
  }
};

// Clear all secure auth data
export const clearSecureAuthData = () => {
  SecureStorage.clearSecureStorage();
};

// Fallback to regular localStorage for environments that don't support crypto
export const legacyStorage = {
  /**
   * @param {User} user
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * @returns {User | null}
   */
  getUser() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  /**
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  /**
   * @returns {string | null}
   */
  getToken() {
    return localStorage.getItem('authToken');
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  removeToken() {
    localStorage.removeItem('authToken');
  },

  clear() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }
};

// Check if secure storage is available
export const isSecureStorageAvailable = () => {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
};

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { validateEnvironmentVariables, initializeEnvironment } from './envValidation';

describe('Environment Validation', () => {
  beforeEach(() => {
    // Clear console mocks
    vi.clearAllMocks();
  });

  describe('validateEnvironmentVariables', () => {
    test('validates that function exists and is callable', () => {
      expect(typeof validateEnvironmentVariables).toBe('function');
    });

    test('accepts custom required variables parameter', () => {
      // Test with empty object should not throw since default vars are provided by Vite
      expect(() => {
        validateEnvironmentVariables({});
      }).not.toThrow();
    });

    test('function accepts custom variables object', () => {
      const customVars = {
        VITE_TEST_VAR: 'Test variable'
      };
      
      // This should throw since VITE_TEST_VAR doesn't exist
      expect(() => {
        validateEnvironmentVariables(customVars);
      }).toThrow('VITE_TEST_VAR');
    });
  });

  describe('initializeEnvironment', () => {
    beforeEach(() => {
      // Mock console methods
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('function exists and is callable', () => {
      expect(typeof initializeEnvironment).toBe('function');
    });

    test('returns true when called', () => {
      const result = initializeEnvironment();
      expect(result).toBe(true);
    });

    test('logs environment info in development mode', () => {
      // The test environment has DEV = true, so it should log
      initializeEnvironment();
      
      // Should log in DEV environment
      expect(console.log).toHaveBeenCalledWith('🌍 Environment Configuration:');
      expect(console.log).toHaveBeenCalledWith('  Environment: test');
    });

    test('handles environment validation gracefully', () => {
      // Test that it doesn't throw errors with the current test environment
      expect(() => {
        initializeEnvironment();
      }).not.toThrow();
    });
  });
});
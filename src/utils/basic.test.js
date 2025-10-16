import { describe, test, expect } from 'vitest';

// Simple utility functions to test
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

describe('Basic Utility Functions', () => {
  describe('add', () => {
    test('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('adds negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    test('adds zero', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('multiply', () => {
    test('multiplies two positive numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    test('multiplies by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    test('multiplies negative numbers', () => {
      expect(multiply(-2, -3)).toBe(6);
    });
  });

  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    test('handles all caps', () => {
      expect(capitalize('HELLO')).toBe('Hello');
    });

    test('handles mixed case', () => {
      expect(capitalize('hELLo')).toBe('Hello');
    });

    test('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    test('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('Environment', () => {
    test('vitest globals are available', () => {
      expect(describe).toBeDefined();
      expect(test).toBeDefined();
      expect(expect).toBeDefined();
    });

    test('import.meta.env is available', () => {
      expect(import.meta.env).toBeDefined();
      expect(typeof import.meta.env).toBe('object');
    });
  });
});
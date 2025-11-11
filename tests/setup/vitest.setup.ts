import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Vitest Setup File
 * 
 * This file runs before each test file and sets up:
 * - Global mocks for Supabase
 * - Testing Library cleanup
 * - Custom matchers from jest-dom
 * - Environment variables
 */

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock environment variables for tests
process.env.PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

// Mock window.matchMedia (not implemented in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (not implemented in jsdom)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (not implemented in jsdom)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

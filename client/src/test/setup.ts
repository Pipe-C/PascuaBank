import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatic DOM and mock cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

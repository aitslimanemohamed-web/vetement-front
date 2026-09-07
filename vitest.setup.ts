import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// @testing-library/react's automatic cleanup only self-registers when it finds
// `afterEach` on the global scope; this project imports test helpers explicitly
// from 'vitest' instead of enabling globals, so cleanup is wired up here.
afterEach(() => {
  cleanup();
});

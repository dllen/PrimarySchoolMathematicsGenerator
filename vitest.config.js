
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Use JSDOM to simulate a browser environment
    setupFiles: './tests/setup.js', // Path to the setup file
  },
});

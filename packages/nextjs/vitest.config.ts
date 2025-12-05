import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.tsx'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});

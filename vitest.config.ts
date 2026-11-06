import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': new URL('.', import.meta.url).pathname } },
  test: {
    // Component tests opt in to a DOM with a `// @vitest-environment jsdom` comment.
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
});

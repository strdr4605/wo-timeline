import { defineConfig } from 'vitest/config';

// Plain vitest for pure logic. Component behaviour is covered by Playwright.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    environment: 'node',
  },
});

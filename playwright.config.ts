import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests, including the regression tests the factory's tester
 * files with its issues (tests/regressions, protected).
 *
 * With BASE_URL set, tests run against that server (the tester's crawl).
 * Without it, Playwright starts the built app itself: run `pnpm build` first.
 */
const external = process.env.BASE_URL;
const baseURL = external ?? 'http://127.0.0.1:3123';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  ...(external
    ? {}
    : {
        webServer: {
          command: 'pnpm start --port 3123',
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});

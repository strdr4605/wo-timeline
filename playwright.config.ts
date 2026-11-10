import { defineConfig, devices } from '@playwright/test';

// The design artboard is 1440x1024, so the tests measure at that size.
const viewport = { width: 1440, height: 1024 };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list']],
  use: {
    // The suite must run without a window, also on a machine without a display.
    headless: true,
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    viewport,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    // The lead keeps a dev server on :4200. With CI=1 a fresh start would fail on the busy port,
    // so the suite always reuses a running server and starts one only when none answers.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

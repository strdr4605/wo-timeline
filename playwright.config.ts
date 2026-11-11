import { defineConfig, devices } from '@playwright/test';

// The design artboard is 1440x1024, so the tests measure at that size.
const viewport = { width: 1440, height: 1024 };

// A second checkout can run its own server next to the shared one on 4200.
const port = Number(process.env['PORT'] ?? 4200);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list']],
  use: {
    // The suite must run without a window, also on a machine without a display.
    headless: true,
    baseURL,
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
    command: `npx ng serve --port ${port}`,
    url: baseURL,
    // The lead keeps a dev server on :4200. With CI=1 a fresh start would fail on the busy port,
    // so the suite always reuses a running server and starts one only when none answers.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

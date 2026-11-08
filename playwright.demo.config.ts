import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Demo run: headed Chrome, slow motion and one video per test under docs/demo/videos/.
// The fast config that verify.mjs uses is not affected.
export default defineConfig({
  ...base,
  testDir: './tests/e2e',
  // Playwright puts the video of each test in the output directory.
  outputDir: 'docs/demo/videos',
  reporter: [['list']],
  workers: 1,
  use: {
    ...base.use,
    headless: false,
    launchOptions: { slowMo: 500 },
    video: 'on',
  },
});

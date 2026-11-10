import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Demo run (npm run demo): the same requirement tests as the fast suite, but in a headed Chrome
// window, in slow motion, with one video per test. The fast config that verify.mjs and
// npm run test:all use is not affected: Playwright reads this file only with --config.
const viewport = { width: 1440, height: 1024 };
const SLOW_MO_MS = 400;
const MOTION_SPEC = /motion\.spec\.ts$/;

// The demo is headed for a human who watches. DEMO_HEADLESS=1 records the same videos with no
// window, so an unattended run does not open Chrome on the screen.
const headless = process.env['DEMO_HEADLESS'] === '1';
const demoBrowser = { ...devices['Desktop Chrome'], viewport, headless };

export default defineConfig({
  ...base,
  testDir: './tests/e2e',

  // Only the tests with an item id such as [C1] in the title. One video per requirement test.
  grep: /\[[A-Z]\d+\]/,

  // One window at a time, so a human can watch the run and the videos do not compete for CPU.
  fullyParallel: false,
  workers: 1,

  // The window is real: when the OS pointer rests over it, Chrome gets real mouse events, and a
  // hover test can lose its hover. One retry absorbs that. The reporter keeps the last video.
  retries: 1,

  // slowMo makes every action slower, so a test needs more time than in the fast suite.
  timeout: 120_000,

  // Playwright cleans its output directory before each run. The raw videos go to a sub-folder,
  // and the reporter copies each one to docs/demo/videos/<id>-<title>.webm.
  outputDir: 'docs/demo/videos/.raw',
  reporter: [['list'], ['./tests/demo/video-reporter.ts', { outDir: 'docs/demo/videos' }]],

  use: {
    ...base.use,
    headless,
    viewport,
    video: { mode: 'on', size: viewport },
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: MOTION_SPEC,
      use: { ...demoBrowser, launchOptions: { slowMo: SLOW_MO_MS } },
    },
    {
      // The motion specs read a CSS transition while it runs. A slowMo pause after each step
      // outlasts the 300 ms transition, so these tests record at normal speed.
      name: 'chromium-motion',
      testMatch: MOTION_SPEC,
      use: { ...demoBrowser, launchOptions: { slowMo: 0 } },
    },
  ],
});

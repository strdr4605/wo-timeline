import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Unit b8-headless: a static check of the test setup. It needs no page: headless mode and the
// test:all script are properties of the config, and a later edit must not turn them off.

test('[I4] test:all runs build, vitest and playwright, and the suite is headless', () => {
  const scripts = JSON.parse(read('package.json')).scripts as Record<string, string>;
  const testAll = scripts['test:all'];
  expect(testAll, 'npm script test:all').toBeTruthy();

  // && stops the chain at the first failure, so a red step cannot hide behind a green one.
  const steps = testAll.split('&&').map((step) => step.trim());
  expect(steps).toEqual(['npm run build', 'vitest run', 'playwright test']);

  const config = read('playwright.config.ts');
  expect(config, 'headless must not be off').not.toMatch(/headless:\s*false/);
  expect(config).toMatch(/headless:\s*true/);
  expect(config).toMatch(/reuseExistingServer:\s*true/);
});

function read(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

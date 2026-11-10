import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Unit b9-demo: a static check of the demo setup. It needs no page: the demo config and the
// npm script are files, and a later edit must not turn the video off or touch the fast config.

test('[J1] the demo config records a headed, slow video per requirement test under docs/demo/videos', () => {
  const demo = read('playwright.demo.config.ts');
  // Headed by default. Only DEMO_HEADLESS=1 hides the window.
  expect(demo).toMatch(/const headless = process\.env\['DEMO_HEADLESS'\] === '1';/);
  expect(demo).not.toMatch(/headless:\s*true/);
  expect(demo).toMatch(/video:\s*\{\s*mode:\s*'on'/);
  expect(demo).toMatch(/grep:\s*\/\\\[\[A-Z\]\\d\+\\\]\//);
  expect(demo).toMatch(/workers:\s*1/);
  expect(demo).toMatch(/outputDir:\s*'docs\/demo\/videos\/\.raw'/);
  expect(demo).toMatch(/outDir:\s*'docs\/demo\/videos'/);

  const slowMo = Number(demo.match(/SLOW_MO_MS\s*=\s*(\d+)/)?.[1]);
  expect(slowMo).toBeGreaterThan(0);
  expect(demo).toMatch(/slowMo:\s*SLOW_MO_MS/);

  // The fast config stays headless and records no video, so verify.mjs is not affected.
  const fast = read('playwright.config.ts');
  expect(fast).toMatch(/headless:\s*true/);
  expect(fast).not.toMatch(/video|slowMo/);

  expect(read('.gitignore')).toMatch(/^docs\/demo\/videos\/$/m);
});

test('[J2] npm run demo runs the suite with the demo config, test:all keeps the fast config', () => {
  const scripts = JSON.parse(read('package.json')).scripts as Record<string, string>;
  expect(scripts['demo']).toBe('playwright test --config=playwright.demo.config.ts');
  expect(scripts['test:all']).not.toContain('demo');
  expect(scripts['test:e2e']).toBe('playwright test');
});

function read(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8');
}

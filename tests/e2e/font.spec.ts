import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CDN = 'https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css';

// The Circular Std files are licensed, so public/fonts is not in the repo. A fresh clone and CI
// have no local copy and use the CDN only.
const LOCAL_BOOK = join(process.cwd(), 'public/fonts/CircularStd-Book.otf');

test('[A5] Circular Std comes from the font CDN with a local fallback', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator(`link[rel="stylesheet"][href="${CDN}"]`)).toHaveCount(1);

  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFamily).toBe('Circular-Std');

  // The local fallback check runs only when the licensed files are on disk.
  if (!existsSync(LOCAL_BOOK)) return;

  const fallback = await page.request.get('/fonts/CircularStd-Book.otf');
  expect(fallback.status()).toBe(200);
  expect(fallback.headers()['content-type']).not.toContain('text/html');
});

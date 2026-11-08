import { expect, test } from '@playwright/test';

const CDN = 'https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css';

test('[A5] Circular Std comes from the Naologic CDN with a local fallback', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator(`link[rel="stylesheet"][href="${CDN}"]`)).toHaveCount(1);

  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFamily).toBe('Circular-Std');

  // The local copy in docs/design/fonts is served as the fallback.
  const fallback = await page.request.get('/fonts/CircularStd-Book.otf');
  expect(fallback.status()).toBe(200);
});

import { expect, test } from '@playwright/test';

test('[A1] app builds and serves the shell', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    // A font that cannot be fetched is not an app error.
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      consoleErrors.push(message.text());
    }
  });

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  await expect(page.locator('app-root')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Work Orders' })).toBeVisible();
  await expect(page.locator('.timescale-chip')).toBeVisible();
  await expect(page.locator('.top-bar .logo')).toBeVisible();
  await expect(page.locator('.work-center-row')).toHaveCount(5);
  await expect(page.locator('.grid__header .grid-header-cell').first()).toBeVisible();

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

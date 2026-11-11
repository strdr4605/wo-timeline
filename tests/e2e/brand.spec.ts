import { expect, test } from '@playwright/test';

// Release r1-brand: a neutral wordmark in the logo box, and neutral localStorage keys.
// The old keys are not migrated, so stored data from before the rename is lost (accepted).

const WORK_ORDERS_KEY = 'wo-timeline.workOrders.v1';
const RAIL_WIDTH_KEY = 'wo-timeline.railWidth.v1';

test.use({ viewport: { width: 1440, height: 1024 } });

test('[R1] the top bar shows the neutral WO Timeline wordmark and the app uses the wo-timeline storage keys', async ({
  page,
}) => {
  await test.step('the wordmark keeps the logo box of the design', async () => {
    await page.goto('/');

    const logo = page.locator('.top-bar .logo');
    await expect(logo).toHaveAttribute('src', 'wo-timeline-logo.svg');
    await expect(logo).toHaveAttribute('alt', 'WO Timeline');
    expect(await logo.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(80);
    expect(await logo.boundingBox()).toEqual({ x: 101, y: 20, width: 80, height: 10 });

    const svg = await (await page.request.get('/wo-timeline-logo.svg')).text();
    expect(svg).toContain('<title>WO Timeline</title>');
    expect(svg).toContain('>WO Timeline</text>');
  });

  await test.step('the app reads the work orders and the rail width from the new keys', async () => {
    await page.evaluate(
      ([ordersKey, railKey]) => {
        localStorage.setItem(ordersKey, '[]');
        localStorage.setItem(railKey, '300');
      },
      [WORK_ORDERS_KEY, RAIL_WIDTH_KEY],
    );
    await page.reload();

    await expect(page.locator('.work-order-bar')).toHaveCount(0);
    await expect(page.locator('.grid-rail-divider')).toHaveAttribute('aria-valuenow', '300');
  });

  await test.step('the app writes only the new keys', async () => {
    await page.locator('.grid-rail-divider').focus();
    await page.keyboard.press('ArrowRight');

    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), RAIL_WIDTH_KEY))
      .toBe('320');
    const keys = await page.evaluate(() => Object.keys(localStorage).sort());
    expect(keys).toEqual([RAIL_WIDTH_KEY, WORK_ORDERS_KEY].sort());
  });
});

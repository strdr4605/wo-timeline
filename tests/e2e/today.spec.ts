import { expect, test, type Page } from '@playwright/test';

// Bonus b2-today: the Today button scrolls the timeline back to today in every timescale.
// The design has no Today button, so parity mode hides it.

const TIMESCALES = ['Hour', 'Day', 'Week', 'Month'];

test.use({ viewport: { width: 1440, height: 1024 } });

test('[I2] the Today button centres the viewport on today in every timescale', async ({ page }) => {
  await test.step('parity mode shows no Today button', async () => {
    await page.goto('./?parity=1');
    await expect(page.locator('.grid-row').first()).toBeVisible();
    await expect(page.locator('.today-button')).toHaveCount(0);
  });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const button = page.getByRole('button', { name: 'Today' });
  await expect(button).toBeVisible();

  for (const timescale of TIMESCALES) {
    await test.step(timescale, async () => {
      await selectTimescale(page, timescale);
      await scrollGridTo(page, 0);
      expect(Math.abs(await todayOffset(page))).toBeGreaterThan(100);

      await button.click();
      await expect.poll(() => todayOffset(page).then(Math.abs)).toBeLessThanOrEqual(3);
    });
  }

  await test.step('keyboard reaches the button and shows a focus ring', async () => {
    await scrollGridTo(page, 0);
    await page.locator('.timescale-chip__value').focus();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');

    await page.keyboard.press('Enter');
    await expect.poll(() => todayOffset(page).then(Math.abs)).toBeLessThanOrEqual(3);
  });
});

async function selectTimescale(page: Page, timescale: string): Promise<void> {
  await page.locator('.timescale-chip__value').click();
  await page.getByRole('option', { name: timescale, exact: true }).click();
  await expect(page.locator('.timescale-chip__value')).toHaveText(timescale);
}

async function scrollGridTo(page: Page, left: number): Promise<void> {
  await page.locator('.grid').evaluate((grid, x) => (grid.scrollLeft = x), left);
}

/** The distance of the today line from the middle of the visible timeline area, in px. */
function todayOffset(page: Page): Promise<number> {
  return page.evaluate(() => {
    const marker = document.querySelector('.grid-today-marker')!.getBoundingClientRect();
    const rail = document.querySelector('.grid__rail')!.getBoundingClientRect();
    const grid = document.querySelector('.grid')!.getBoundingClientRect();
    return marker.left + marker.width / 2 - (rail.right + grid.right) / 2;
  });
}

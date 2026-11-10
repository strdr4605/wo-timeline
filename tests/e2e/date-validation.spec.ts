import { expect, test } from '@playwright/test';

// Unit b10-dates: a date that does not exist shows its error when the field loses focus.

/** An empty cell of the Rodriques Electrics row, in the middle of the September 2024 column. */
const EMPTY_CELL = { x: 654, y: 322 };

test.use({ viewport: { width: 1440, height: 1024 } });

test('[E1] an impossible end date shows its error on Tab and Create does not save', async ({
  page,
}) => {
  await page.goto('/?parity=1');
  await page.evaluate(() => document.fonts.ready);
  const bars = page.locator('app-work-order-bar');
  const barCount = await bars.count();

  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await page.locator('#drawer-name').fill('Acme Inc.');

  const end = page.locator('#drawer-end');
  const error = page.locator('#drawer-end-error');
  await end.focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('40.13.2024');

  // While the user types, the field stays quiet.
  await expect(error).toHaveCount(0);

  await page.keyboard.press('Tab');
  await expect(error).toHaveText('40.13.2024 is not a valid date.');
  await expect(end).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#drawer-name-error')).toHaveCount(0);

  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await expect(bars).toHaveCount(barCount);

  // A wrong shape keeps the format message.
  await end.fill('12.2024');
  await end.blur();
  await expect(error).toHaveText('Enter the date as dd.mm.yyyy.');
});

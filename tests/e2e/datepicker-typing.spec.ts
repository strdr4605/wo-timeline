import { expect, Page, test } from '@playwright/test';

// Unit b18-datepicker: a click on a date field opens the calendar, but the focus stays in the
// field, so the user can type a date at once.

/** An empty cell of the Rodriques Electrics row, in the middle of the September 2024 column. */
const EMPTY_CELL = { x: 600, y: 322 };

test.use({ viewport: { width: 1440, height: 1024 } });

test('[D12] a click on a date field opens the calendar and keeps the focus for typing', async ({
  page,
}) => {
  await page.goto('/?parity=1');
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);

  const calendar = page.locator('ngb-datepicker');

  for (const id of ['#drawer-end', '#drawer-start']) {
    const field = page.locator(id);
    const error = page.locator(`${id}-error`);

    await test.step(`${id}: typed text is kept and the calendar selects the typed date`, async () => {
      await field.click();
      await expect(calendar).toBeVisible();

      // A human starts to type about 300 ms after the click.
      await page.waitForTimeout(300);
      await expect(field).toBeFocused();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('01.11.2026', { delay: 30 });

      await expect(field).toHaveValue('01.11.2026');
      await expect(field).toBeFocused();
      expect(await selectedDay(page)).toBe('Sunday, November 1, 2026');
      await expect(calendar.locator('.ngb-dp-month-name')).toHaveText('November 2026');
    });

    await test.step(`${id}: partial text leaves the calendar and shows no error`, async () => {
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');

      await expect(field).toHaveValue('01.11.20');
      expect(await selectedDay(page)).toBe('Sunday, November 1, 2026');
      await expect(calendar.locator('.ngb-dp-month-name')).toHaveText('November 2026');
      await expect(error).toHaveCount(0);
    });

    await test.step(`${id}: a mouse pick still selects a day and closes the calendar`, async () => {
      await calendar.locator('.ngb-dp-day[aria-label="Tuesday, November 10, 2026"]').click();

      await expect(calendar).toHaveCount(0);
      await expect(field).toHaveValue('10.11.2026');
      await expect(field).toBeFocused();
      await expect(error).toHaveCount(0);
    });
  }

  await test.step('Escape closes the calendar first, then the drawer', async () => {
    await page.locator('#drawer-end').click();
    await expect(calendar).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(calendar).toHaveCount(0);
    await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);

    await page.keyboard.press('Escape');
    await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  });
});

test('[D12] a click on End date while the Start calendar is open gives the focus to End', async ({
  page,
}) => {
  await openCreateDrawer(page);
  const start = page.locator('#drawer-start');
  const end = page.locator('#drawer-end');
  const startValue = await start.inputValue();

  await start.click();
  await expect(page.locator('ngb-datepicker')).toHaveCount(1);

  await end.click();
  // The closed Start calendar must not take the focus back later.
  await page.waitForTimeout(700);
  await expect(page.locator('ngb-datepicker')).toHaveCount(1);
  await expect(end).toBeFocused();

  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('05.05.2025', { delay: 30 });

  await expect(end).toHaveValue('05.05.2025');
  await expect(start).toHaveValue(startValue);
  await expect(page.locator('ngb-datepicker .ngb-dp-month-name')).toHaveText('May 2025');
});

test('[D12] after a mouse pick, typed text shows no date error until the field loses focus', async ({
  page,
}) => {
  await openCreateDrawer(page);
  const start = page.locator('#drawer-start');
  const error = page.locator('#drawer-start-error');

  await start.click();
  await page
    .locator('ngb-datepicker .ngb-dp-day[aria-label="Tuesday, September 10, 2024"]')
    .click();
  await expect(start).toHaveValue('10.09.2024');
  await expect(start).toBeFocused();

  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('31.02', { delay: 30 });
  await page.waitForTimeout(300);
  await expect(start).toBeFocused();
  await expect(error).toHaveCount(0);

  await page.keyboard.press('Tab');
  await expect(error).toHaveText('Enter the date as dd.mm.yyyy.');

  // Create stays blocked for an invalid date.
  await page.locator('.drawer button[type="submit"]').click();
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await expect(error).toHaveText('Enter the date as dd.mm.yyyy.');
});

async function openCreateDrawer(page: Page): Promise<void> {
  await page.goto('/?parity=1');
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
}

/** The aria-label of the day that the open calendar shows as selected. */
async function selectedDay(page: Page): Promise<string | null> {
  return page
    .locator('ngb-datepicker .ngb-dp-day')
    .filter({ has: page.locator('.bg-primary') })
    .getAttribute('aria-label');
}

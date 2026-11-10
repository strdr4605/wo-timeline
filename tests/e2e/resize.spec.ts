import { expect, test, type Locator, type Page } from '@playwright/test';

// Bonus b4-resize: a drag on a bar-end handle changes the start or the end date.
// The sample data is used: Konsulting Inc runs Sep 18, 2026 to Jan 21, 2027, and Compleks Systems
// on the same work centre starts Mar 7, 2027. Month view has 114px columns.

const STORAGE_KEY = 'naologic.workOrders.v1';
const MONTH_COLUMN = 114;

test.use({ viewport: { width: 1440, height: 1024 } });

test('[C9] a drag on a bar-end handle resizes the order, snapped to days, with checks and keys', async ({
  page,
}) => {
  await page.goto('/');

  const bar = barNamed(page, 'Konsulting Inc');
  const label = bar.locator('.work-order-resize-label');
  const dates = bar.locator('.work-order-tooltip__dates');
  const alert = page.locator('.resize-alert');

  await test.step('the handle shows "Drag to resize" above it', async () => {
    const box = (await bar.boundingBox())!;
    await page.mouse.move(box.x + box.width - 3, box.y + box.height / 2);

    await expect(label).toHaveCSS('opacity', '1');
    await expect(label).toHaveText('Drag to resize');
    await expect(label.locator('.work-order-resize-label__strong')).toHaveText('Drag');
    await expect(label.locator('.work-order-resize-label__strong')).toHaveCSS('font-weight', '700');
    await expect(label).toHaveCSS('background-color', 'rgb(104, 113, 150)');
    await expect(label).toHaveCSS('border-radius', '8px');
    await expect(bar.locator('.work-order-bar__handle--end')).toHaveCSS('cursor', 'ew-resize');

    // The design centres the label on the bar end, 3px above the bar.
    const labelBox = (await label.boundingBox())!;
    expect(Math.abs(labelBox.x + labelBox.width / 2 - (box.x + box.width))).toBeLessThan(1);
    expect(Math.round(box.y - (labelBox.y + labelBox.height))).toBe(3);
    expect(Math.round(labelBox.height)).toBe(26);
  });

  await test.step('a drag on the end handle previews live and commits on release', async () => {
    await dragHandle(page, bar, 'end', MONTH_COLUMN, async () => {
      await expect(dates).toHaveText('Sep 18, 2026 to Feb 19, 2027');
      await expect(label).toHaveCSS('opacity', '0');
    });

    await expect(bar).toHaveAttribute('aria-label', /Sep 18, 2026 to Feb 19, 2027$/);
    await expect(page.locator('.work-order-menu--open')).toHaveCount(0);
    await expect(page.locator('.drawer--open')).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toContain(
      '"endDate":"2027-02-19"',
    );
  });

  await test.step('a drag on the start handle moves the start date', async () => {
    await dragHandle(page, bar, 'start', MONTH_COLUMN);
    await expect(bar).toHaveAttribute('aria-label', /Oct 19, 2026 to Feb 19, 2027$/);
  });

  await test.step('Escape during a drag puts the bar back', async () => {
    await dragHandle(page, bar, 'end', 2 * MONTH_COLUMN, async () => {
      await expect(dates).not.toHaveText('Oct 19, 2026 to Feb 19, 2027');
      await page.keyboard.press('Escape');
      await expect(dates).toHaveText('Oct 19, 2026 to Feb 19, 2027');
    });
    await expect(bar).toHaveAttribute('aria-label', /Oct 19, 2026 to Feb 19, 2027$/);
  });

  await test.step('an end before the start is refused', async () => {
    await dragHandle(page, bar, 'end', -6 * MONTH_COLUMN);
    await expect(alert).toHaveText('The end date must be after the start date.');
    await expect(bar).toHaveAttribute('aria-label', /Oct 19, 2026 to Feb 19, 2027$/);
  });

  await test.step('an overlap with another order of the work centre is refused', async () => {
    await dragHandle(page, bar, 'end', 2 * MONTH_COLUMN);
    await expect(alert).toHaveText('These dates overlap another order on Konsulting Inc.');
    await expect(bar).toHaveAttribute('aria-label', /Oct 19, 2026 to Feb 19, 2027$/);
  });

  await test.step('Shift+Arrow moves the end, Alt+Shift+Arrow the start', async () => {
    await bar.focus();
    await expect(page.locator('#' + (await bar.getAttribute('aria-describedby')))).toContainText(
      'Shift and an arrow key move the end date one day',
    );

    await page.keyboard.press('Shift+ArrowRight');
    await expect(bar).toHaveAttribute('aria-label', /Oct 19, 2026 to Feb 20, 2027$/);

    await page.keyboard.press('Alt+Shift+ArrowLeft');
    await expect(bar).toHaveAttribute('aria-label', /Oct 18, 2026 to Feb 20, 2027$/);
    await expect(page.locator('.work-order-menu--open')).toHaveCount(0);
  });

  await test.step('the new dates survive a reload', async () => {
    await page.reload();
    await expect(bar).toHaveAttribute('aria-label', /Oct 18, 2026 to Feb 20, 2027$/);
  });
});

const barNamed = (page: Page, name: string) =>
  page
    .locator('.work-order-bar')
    .filter({ has: page.locator('.work-order-bar__name', { hasText: new RegExp(`^${name}$`) }) });

/**
 * Presses one handle, moves the pointer by `dx` and 80px down (off the bar: the capture keeps the
 * drag), runs `during`, then releases.
 */
async function dragHandle(
  page: Page,
  bar: Locator,
  edge: 'start' | 'end',
  dx: number,
  during?: () => Promise<void>,
): Promise<void> {
  const box = (await bar.boundingBox())!;
  const x = edge === 'end' ? box.x + box.width - 3 : box.x + 3;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + 80, { steps: 6 });
  await during?.();
  await page.mouse.up();
}

import { expect, test, type Page } from '@playwright/test';

const rgb = (hex: string) =>
  `rgb(${hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => parseInt(part, 16))
    .join(', ')})`;

/** The bar of one work order. */
const barNamed = (page: Page, name: string) =>
  page
    .locator('.work-order-bar')
    .filter({ has: page.locator('.work-order-bar__name', { hasText: new RegExp(`^${name}$`) }) });

/** The colours of the design for the four statuses. */
const STATUS_CASES = [
  {
    status: 'open',
    barFill: '#edeeff',
    barBorder: '#dee0ff',
    badgeFill: '#d6d8ff',
    text: '#3e40db',
  },
  {
    status: 'in-progress',
    barFill: '#edeeff',
    barBorder: '#dee0ff',
    badgeFill: '#d6d8ff',
    text: '#3e40db',
  },
  {
    status: 'complete',
    barFill: '#f8fff3',
    barBorder: '#d1fab3',
    badgeFill: '#e1ffcc',
    text: '#08a268',
  },
  {
    status: 'blocked',
    barFill: '#fffcf1',
    barBorder: '#fff5cf',
    badgeFill: '#fceeb5',
    text: '#b13600',
  },
];

test('[C1] the bar starts at the start date and ends at the end date', async ({ page }) => {
  await page.goto('/');

  // Concentrix Ltd runs on Genesis Hardware from 2026-10-18 to 2027-02-22.
  const box = await barNamed(page, 'Concentrix Ltd').boundingBox();

  const expected = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('.grid-header-cell')] as HTMLElement[];
    const cell = (label: string) => {
      const element = cells.find((candidate) => candidate.textContent?.trim() === label)!;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    };

    const october = cell('Oct 2026');
    const february = cell('Feb 2027');

    return {
      // The bar starts at the interpolated position of the start date.
      start: october.x + ((18 - 1) / 31) * october.width,
      // The bar ends at the interpolated position of the end date.
      end: february.x + ((22 - 1) / 28) * february.width,
    };
  });

  expect(Math.abs(box!.x - expected.start)).toBeLessThan(1.5);
  expect(Math.abs(box!.x + box!.width - expected.end)).toBeLessThan(1.5);
});

test('[C2] the bar shows the work order name and a status badge', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  await expect(bar.locator('.work-order-bar__name')).toHaveText('Concentrix Ltd');
  await expect(bar.locator('.work-order-bar__badge')).toHaveText('Complete');

  // The badge sits inside the bar.
  const barBox = await bar.boundingBox();
  const badgeBox = await bar.locator('.work-order-bar__badge').boundingBox();
  expect(badgeBox!.x).toBeGreaterThanOrEqual(barBox!.x);
  expect(badgeBox!.x + badgeBox!.width).toBeLessThanOrEqual(barBox!.x + barBox!.width);
});

test('[C3] every status has the colours of the design', async ({ page }) => {
  await page.goto('/');

  for (const status of STATUS_CASES) {
    const bar = page.locator(`.work-order-bar[data-status='${status.status}']`).first();
    await expect(bar).toHaveCSS('background-color', rgb(status.barFill));
    await expect(bar).toHaveCSS('border-color', rgb(status.barBorder));

    const badge = bar.locator('.work-order-bar__badge');
    await expect(badge).toHaveCSS('background-color', rgb(status.badgeFill));
    await expect(badge).toHaveCSS('color', rgb(status.text));
  }
});

test('[C4] the bar is 38 high, has a radius of 8 and a 1px border', async ({ page }) => {
  await page.goto('/');

  const bar = page.locator('.work-order-bar[data-status=\'open\']').first();
  const box = await bar.boundingBox();

  expect(Math.round(box!.height)).toBe(38);
  await expect(bar).toHaveCSS('border-radius', '8px');
  await expect(bar).toHaveCSS('border-top-width', '1px');
  await expect(bar).toHaveCSS('background-color', rgb('#edeeff'));
  await expect(bar).toHaveCSS('border-color', rgb('#dee0ff'));
});

test('[C5] the three-dot button appears on hover and opens a menu with Edit and Delete', async ({
  page,
}) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  const actions = bar.locator('.work-order-bar__actions');
  const menu = bar.locator('.work-order-menu');

  await expect(actions).toHaveCSS('opacity', '0');

  await bar.hover();
  await expect(bar).toHaveClass(/work-order-bar--hovered/);
  await expect(actions).toHaveCSS('opacity', '1');

  await actions.click();
  await expect(menu).toHaveClass(/work-order-menu--open/);
  await expect(menu.locator('.work-order-menu__item')).toHaveText(['Edit', 'Delete']);

  // A click outside the bar closes the menu.
  await page.locator('.work-center-name').first().click();
  await expect(menu).not.toHaveClass(/work-order-menu--open/);
});

test('[C6] the menu is the menu of the design, not a system menu', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  await bar.hover();
  await bar.locator('.work-order-bar__actions').click();

  const menu = bar.locator('.work-order-menu');
  const box = await menu.boundingBox();

  expect(Math.round(box!.width)).toBe(200);
  await expect(menu).toHaveCSS('border-radius', '5px');
  await expect(menu).toHaveCSS('background-color', rgb('#ffffff'));

  const item = menu.locator('.work-order-menu__item').first();
  const itemBox = await item.boundingBox();
  expect(Math.round(itemBox!.height)).toBe(28);
});

test('[C7] the bar shows a tooltip with name, status and the full date range', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  const tooltip = bar.locator('.work-order-tooltip');

  await expect(tooltip).toHaveCSS('opacity', '0');

  await bar.hover();
  await expect(tooltip).toHaveCSS('opacity', '1');
  await expect(tooltip).toContainText('Concentrix Ltd');
  await expect(tooltip).toContainText('Complete');
  await expect(tooltip).toContainText('Oct 18, 2026');
  await expect(tooltip).toContainText('Feb 22, 2027');

  const box = await tooltip.boundingBox();
  expect(Math.round(box!.height)).toBe(26);
});

test('[C8] the bar shows a drag handle at both ends on hover', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  const startHandle = bar.locator('.work-order-bar__handle--start');
  const endHandle = bar.locator('.work-order-bar__handle--end');

  await expect(startHandle).toHaveCSS('opacity', '0');

  await bar.hover();
  await expect(startHandle).toHaveCSS('opacity', '1');
  await expect(endHandle).toHaveCSS('opacity', '1');

  const barBox = await bar.boundingBox();
  const startBox = await startHandle.boundingBox();
  const endBox = await endHandle.boundingBox();

  expect(Math.round(startBox!.width)).toBe(4);
  expect(Math.round(startBox!.x)).toBe(Math.round(barBox!.x));
  expect(Math.round(endBox!.x + endBox!.width)).toBe(Math.round(barBox!.x + barBox!.width));
});

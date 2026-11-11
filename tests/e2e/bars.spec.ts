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
    barFill: '#f2feff',
    barBorder: '#cefbff',
    badgeFill: '#e4fdff',
    text: '#00b0bf',
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

/** The bars of the artboards "Default" and "Options CTA Controls": name, x, y, width. */
const PARITY_BARS: [string, number, number, number][] = [
  ['Concentrix Ltd', 437, 249, 381],
  ['Rodriques Electrics', 501, 303, 381],
  ['Konsulting Inc', 556, 352, 381],
  ['Compleks Systems', 945, 352, 381],
  ['McMarrow Distribution', 677, 401, 533],
  // The mock draws this bar 5px under the centre of its row (y 455). The app centres every bar.
  ['Spartan Distribution', 583, 450, 533],
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

  // In parity mode the dates of the design fixture put every bar on the pixels of the artboard.
  // A day is 3.7px wide in Month view, so an edge can miss the mock by up to 2px.
  await page.goto('/?parity=1&fixture=hover');

  for (const [name, x, y, width] of PARITY_BARS) {
    const parityBox = await barNamed(page, name).boundingBox();
    expect(Math.abs(parityBox!.x - x)).toBeLessThanOrEqual(2);
    expect(Math.abs(parityBox!.x + parityBox!.width - (x + width))).toBeLessThanOrEqual(2);
    expect(parityBox!.y).toBe(y);
  }
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

  const bar = page.locator(".work-order-bar[data-status='in-progress']").first();
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

  // The button of the design: 24 x 22, radius 4, 8px from the bar end.
  const barBox = await bar.boundingBox();
  const actionsBox = await actions.boundingBox();
  expect(Math.round(actionsBox!.width)).toBe(24);
  expect(Math.round(actionsBox!.height)).toBe(22);
  expect(Math.round(barBox!.x + barBox!.width - (actionsBox!.x + actionsBox!.width))).toBe(8);
  await expect(actions).toHaveCSS('border-radius', '4px');
  await expect(actions).toHaveCSS('background-color', rgb('#f1f3f8'));

  await actions.click();
  await expect(menu).toHaveClass(/work-order-menu--open/);
  await expect(menu.locator('.work-order-menu__item')).toHaveText(['Edit', 'Delete']);

  // The menu starts at the left edge of the button, 5px below it.
  const menuBox = await menu.boundingBox();
  expect(Math.round(menuBox!.x)).toBe(Math.round(actionsBox!.x));
  expect(Math.round(menuBox!.y - (actionsBox!.y + actionsBox!.height))).toBe(5);

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

  // Two shadows with a negative spread, and the 10% border as an inset shadow.
  await expect(menu).toHaveCSS(
    'box-shadow',
    'rgb(216, 220, 235) 0px 4.5px 5px -1px, rgb(200, 207, 233) 0px 2.5px 3px -1.5px, rgba(104, 113, 150, 0.1) 0px 0px 0px 1px inset',
  );

  const item = menu.locator('.work-order-menu__item').first();
  const itemBox = await item.boundingBox();
  expect(Math.round(itemBox!.height)).toBe(28);
  expect(Math.round(itemBox!.width)).toBe(200);
  await expect(item).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  await item.hover();
  await expect(item).toHaveCSS('background-color', rgb('#f1f3f8'));
});

test('[C7] the bar shows a tooltip with name, status and the full date range', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  const tooltip = bar.locator('.work-order-tooltip');

  await expect(tooltip).toHaveCSS('opacity', '0');

  // On the bar body the tooltip waits for a dwell, as the hovered bar of the design has none.
  await bar.hover();
  await page.waitForTimeout(300);
  await expect(tooltip).toHaveCSS('opacity', '0');
  await expect(tooltip).toHaveCSS('opacity', '1');
  await expect(tooltip).toContainText('Concentrix Ltd');
  await expect(tooltip).toContainText('Complete');
  await expect(tooltip).toContainText('Oct 18, 2026');
  await expect(tooltip).toContainText('Feb 22, 2027');

  // Centred above the bar, 5px over its top edge.
  const barBox = await bar.boundingBox();
  const box = await tooltip.boundingBox();
  expect(Math.round(box!.height)).toBe(26);
  expect(Math.abs(box!.x + box!.width / 2 - (barBox!.x + barBox!.width / 2))).toBeLessThan(1);
  expect(Math.round(barBox!.y - (box!.y + box!.height))).toBe(5);
  await expect(tooltip).toHaveCSS('background-color', rgb('#687196'));

  // On a drag handle the dates show at once.
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCSS('opacity', '0');
  await page.mouse.move(barBox!.x + barBox!.width - 2, barBox!.y + barBox!.height / 2);
  await page.waitForTimeout(100);
  await expect(tooltip).toHaveCSS('opacity', '1', { timeout: 100 });
});

test('[C8] the bar shows a drag handle at both ends on hover', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  const startHandle = bar.locator('.work-order-bar__handle--start');
  const endHandle = bar.locator('.work-order-bar__handle--end');

  // The design shows a bar hovered on its body without handles.
  await bar.hover();
  await expect(startHandle).toHaveCSS('opacity', '0');

  // The pointer on one end shows both handles.
  const barBox = await bar.boundingBox();
  await page.mouse.move(barBox!.x + barBox!.width - 2, barBox!.y + barBox!.height / 2);
  await expect(startHandle).toHaveCSS('opacity', '1');
  await expect(endHandle).toHaveCSS('opacity', '1');

  const startBox = await startHandle.boundingBox();
  const endBox = await endHandle.boundingBox();

  // A handle covers the border and the full height of the bar, and fills 4px of #dee0ff.
  expect(Math.round(startBox!.x)).toBe(Math.round(barBox!.x));
  expect(Math.round(endBox!.x + endBox!.width)).toBe(Math.round(barBox!.x + barBox!.width));
  expect(Math.round(startBox!.height)).toBe(38);
  await expect(startHandle).toHaveCSS(
    'background-image',
    'linear-gradient(to right, rgb(222, 224, 255) 4px, rgba(0, 0, 0, 0) 4px)',
  );
});

test('[P9] the three-dot button uses the pressed fill while its menu is open', async ({ page }) => {
  await page.goto('/');

  const bar = barNamed(page, 'Concentrix Ltd');
  const actions = bar.locator('.work-order-bar__actions');

  await bar.hover();
  await expect(actions).toHaveCSS('background-color', rgb('#f1f3f8'));

  await actions.click();
  await expect(actions).toHaveCSS('background-color', rgb('#d8dceb'));

  await page.locator('.work-center-name').first().click();
  await expect(actions).toHaveCSS('background-color', rgb('#f1f3f8'));
});

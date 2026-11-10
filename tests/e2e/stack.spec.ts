import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Unit u6-small: the stack items of the brief (A2-A4) and the must items I7 and I8.

const DRAWER_SOURCE = 'src/app/work-order-drawer/work-order-drawer.ts';

/** An empty cell of the Rodriques Electrics row, in the middle of the September 2024 column. */
const EMPTY_CELL = { x: 654, y: 322 };

test('[A2] the drawer form is a Reactive Forms FormGroup with Validators', async ({ page }) => {
  const source = readFileSync(DRAWER_SOURCE, 'utf8');
  expect(source).toContain('ReactiveFormsModule');
  expect(source).toMatch(/new FormGroup\(/);
  expect(source).toMatch(/new FormControl/);
  expect(source).toContain('Validators.required');

  await openDrawer(page);

  // The reactive directives bind each field by its control name.
  const form = page.locator('.drawer form');
  await expect(form.locator('[formcontrolname]')).toHaveCount(4);

  // Validators.required runs: an empty name makes the control invalid.
  const name = page.locator('#drawer-name');
  await expect(name).toHaveClass(/ng-invalid/);
  await name.fill('Acme Inc.');
  await expect(name).toHaveClass(/ng-valid/);
});

test('[A3] the status field is ng-select, restyled, with no system dropdown', async ({ page }) => {
  await openDrawer(page);

  const drawer = page.locator('.drawer');
  await expect(drawer.locator('select')).toHaveCount(0);

  const status = drawer.locator('ng-select.drawer-status');
  await expect(status).toBeVisible();
  await expect(status.locator('.drawer-status__pill')).toHaveText('Open');

  await status.click();
  const panel = page.locator('ng-dropdown-panel');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.ng-option')).toHaveText(['Open', 'In progress', 'Complete', 'Blocked']);

  // The theme of the design replaces the default ng-select border colour (#ccc).
  const border = await status
    .locator('.ng-select-container')
    .evaluate((element) => getComputedStyle(element).borderTopColor);
  expect(border).not.toBe('rgb(204, 204, 204)');
});

test('[A4] the start and end dates use ngb-datepicker', async ({ page }) => {
  await openDrawer(page);

  for (const id of ['#drawer-end', '#drawer-start']) {
    await page.locator(id).click();
    const calendar = page.locator('ngb-datepicker');
    await expect(calendar).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(calendar).toHaveCount(0);
  }
});

test('[I7] a phone screen keeps the timeline, the scroll and the drawer usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // No page-wide horizontal scroll: the grid scrolls inside its card.
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);

  const grid = page.locator('.grid');
  const gridBox = (await grid.boundingBox())!;
  const railBox = (await page.locator('.grid__rail').boundingBox())!;
  expect(railBox.x + railBox.width).toBeLessThan(gridBox.x + gridBox.width - 50);

  const scroll = await grid.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(scroll).toBeGreaterThan(0);

  // The drawer fits the screen.
  // An empty cell of the McMarrow Distribution row, right of the rail.
  await page.mouse.click(330, 420);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await page.waitForTimeout(300);
  expect(await page.locator('.drawer').boundingBox()).toEqual({ x: 0, y: 0, width: 375, height: 667 });
  await expect(page.locator('#drawer-name')).toBeInViewport();
});

test('[I8] Day and Week reuse the Month rows, bars and header of the design', async ({ page }) => {
  await page.goto('/');
  const month = await layoutOf(page);

  for (const [option, columnWidth] of [
    ['Week', 114],
    ['Day', 48],
  ] as const) {
    await page.locator('.timescale-chip__value').click();
    await page.locator('.timescale-menu__item', { hasText: option }).click();
    await expect(page.locator('.timescale-chip__value')).toContainText(option);

    const layout = await layoutOf(page);
    expect(layout.columnWidth).toBe(columnWidth);
    expect({ ...layout, columnWidth: 0 }).toEqual({ ...month, columnWidth: 0 });
  }
});

async function openDrawer(page: Page): Promise<void> {
  await page.goto('/?parity=1');
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  // The slide-in is 200ms.
  await page.waitForTimeout(300);
}

/** The sizes and colours that must not change between zoom levels. */
async function layoutOf(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
    const rows = [...document.querySelectorAll('.grid-row')].map((row) => row.getBoundingClientRect().height);
    const bar = style('.work-order-bar');

    return {
      columnWidth: box('.grid-header-cell').width,
      headerHeight: box('.grid__header').height,
      rows,
      barHeight: box('.work-order-bar').height,
      barRadius: bar.borderRadius,
      barFont: bar.fontFamily,
      headerColor: style('.grid-header-cell__label').color,
    };
  });
}

import { expect, test } from '@playwright/test';

const MONTH_LABEL = /^[A-Z][a-z]{2} \d{4}$/;
const WEEK_LABEL = /^[A-Z][a-z]{2} \d{1,2}$/;
const DAY_LABEL = /^\d{1,2}$/;

const rgb = (hex: string) =>
  `rgb(${hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => parseInt(part, 16))
    .join(', ')})`;

/** Opens the timescale menu and picks one of its options. */
async function chooseTimescale(page: import('@playwright/test').Page, option: string) {
  await page.locator('.timescale-chip__value').click();
  await page.locator('.timescale-menu__item', { hasText: option }).click();
}

test('[B1] the work center panel stays fixed while the timeline scrolls sideways', async ({
  page,
}) => {
  await page.goto('/');

  const rail = page.locator('.grid__rail');
  const name = page.locator('.work-center-name').first();
  const railBefore = await rail.boundingBox();
  const nameBefore = await name.boundingBox();

  await page.locator('.grid').evaluate((element) => element.scrollTo({ left: 400 }));
  await expect
    .poll(() => page.locator('.grid').evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);

  const railAfter = await rail.boundingBox();
  const nameAfter = await name.boundingBox();

  expect(railAfter!.x).toBe(railBefore!.x);
  expect(railAfter!.width).toBe(railBefore!.width);
  expect(nameAfter!.x).toBe(nameBefore!.x);
});

test('[B2] the timeline grid scrolls horizontally', async ({ page }) => {
  await page.goto('/');

  const grid = page.locator('.grid');
  const scrollable = await grid.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  expect(scrollable).toBe(true);

  const firstCellBefore = await page.locator('.grid-header-cell').first().boundingBox();

  await grid.hover();
  await page.mouse.wheel(400, 0);
  await expect.poll(() => grid.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  const firstCellAfter = await page.locator('.grid-header-cell').first().boundingBox();
  expect(firstCellAfter!.x).toBeLessThan(firstCellBefore!.x);
});

test('[B3] the timescale dropdown offers Day, Week and Month', async ({ page }) => {
  await page.goto('/');

  await page.locator('.timescale-chip__value').click();

  const menu = page.locator('.timescale-menu');
  await expect(menu).toBeVisible();
  await expect(menu.locator('.timescale-menu__item')).toHaveText(['Day', 'Week', 'Month']);
});

test('[B4] the default timescale is Month', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.timescale-chip__value')).toContainText('Month');

  const labels = await page.locator('.grid-header-cell').allTextContents();
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect(label.trim()).toMatch(MONTH_LABEL);
  }
});

test('[B5] the header row re-labels per zoom level', async ({ page }) => {
  await page.goto('/');

  const monthLabels = await page.locator('.grid-header-cell').allTextContents();
  for (const label of monthLabels) {
    expect(label.trim()).toMatch(MONTH_LABEL);
  }

  await chooseTimescale(page, 'Day');
  await expect(page.locator('.grid-header-cell')).toHaveCount(29);
  const dayLabels = await page.locator('.grid-header-cell').allTextContents();
  for (const label of dayLabels) {
    expect(label.trim()).toMatch(DAY_LABEL);
  }

  await chooseTimescale(page, 'Week');
  await expect(page.locator('.grid-header-cell')).toHaveCount(13);
  const weekLabels = await page.locator('.grid-header-cell').allTextContents();
  for (const label of weekLabels) {
    expect(label.trim()).toMatch(WEEK_LABEL);
  }
});

test('[B6] the current period shows a pill in the header and a vertical line', async ({
  page,
}) => {
  await page.goto('/');

  const current = new Date();
  const expected = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const pill = page.locator('.grid-header-cell--current .grid-header-cell__label');
  await expect(pill).toHaveText(expected);
  expect(await pill.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    rgb('#d4d7ff'),
  );

  const marker = page.locator('.grid-current-marker');
  const markerBox = await marker.boundingBox();
  expect(markerBox!.width).toBe(3);
  expect(await marker.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    rgb('#d4d7ff'),
  );

  // The marker stands on the left edge of the current column.
  const cell = await page.locator('.grid-header-cell--current').boundingBox();
  expect(Math.abs(markerBox!.x - cell!.x)).toBeLessThan(2);
});

test('[B7] the grid shows a line for the current day', async ({ page }) => {
  await page.goto('/');

  const marker = page.locator('.grid-today-marker');
  const markerBox = await marker.boundingBox();
  expect(markerBox!.width).toBe(1);
  expect(await marker.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    rgb('#3e40db'),
  );

  // The line stands inside the column of today.
  const cell = await page.locator('.grid-header-cell--current').boundingBox();
  expect(markerBox!.x).toBeGreaterThanOrEqual(cell!.x - 1);
  expect(markerBox!.x).toBeLessThan(cell!.x + cell!.width);
});

test('[B8] the initial view centres on today with a buffer', async ({ page }) => {
  await page.goto('/');

  const rail = await page.locator('.grid__rail').boundingBox();
  const grid = await page.locator('.grid').boundingBox();
  const marker = await page.locator('.grid-today-marker').boundingBox();

  const centre = (rail!.x + rail!.width + grid!.x + grid!.width) / 2;
  expect(Math.abs(marker!.x + marker!.width / 2 - centre)).toBeLessThan(10);

  // Two weeks of days on each side of today in Day view.
  await chooseTimescale(page, 'Day');
  await expect(page.locator('.grid-header-cell')).toHaveCount(29);
  const days = await page.locator('.grid-header-cell').allTextContents();

  const today = new Date().getDate();
  const todayIndex = days.findIndex((label) => label.trim() === String(today));
  expect(todayIndex).toBe(14);
});

test('[B9] hovering a row highlights the row background', async ({ page }) => {
  await page.goto('/');

  const row = page.locator('.grid-row').first();
  await row.hover();

  expect(await row.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgba(241, 243, 248, 0.75)',
  );

  const railRow = page.locator('.work-center-row').first();
  await railRow.hover();
  expect(await railRow.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgba(241, 243, 248, 0.75)',
  );
});

test('[B10] rows are 48 high and the work center panel is 380 wide', async ({ page }) => {
  await page.goto('/');

  const row = await page.locator('.work-center-row').first().boundingBox();
  expect(row!.height).toBe(48);

  const rail = await page.locator('.grid__rail').boundingBox();
  expect(rail!.width).toBe(380);
});

test('[B11] grid lines are 1px #e6ebf0 and columns follow the timescale', async ({
  page,
}) => {
  await page.goto('/');

  const cell = page.locator('.grid-cell').first();
  expect(await cell.evaluate((element) => getComputedStyle(element).borderRightWidth)).toBe(
    '1px',
  );
  expect(await cell.evaluate((element) => getComputedStyle(element).borderRightColor)).toBe(
    rgb('#e6ebf0'),
  );

  const monthWidth = (await page.locator('.grid-header-cell').first().boundingBox())!.width;
  expect(monthWidth).toBe(114);

  await chooseTimescale(page, 'Day');
  await expect(page.locator('.grid-header-cell')).toHaveCount(29);
  const dayWidth = (await page.locator('.grid-header-cell').first().boundingBox())!.width;
  expect(dayWidth).toBe(48);

  await chooseTimescale(page, 'Week');
  await expect(page.locator('.grid-header-cell')).toHaveCount(13);
  const weekWidth = (await page.locator('.grid-header-cell').first().boundingBox())!.width;
  expect(weekWidth).toBe(114);
});

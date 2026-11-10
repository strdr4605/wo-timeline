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
  const scrollBefore = await grid.evaluate((element) => element.scrollLeft);

  await grid.hover();
  await page.mouse.wheel(400, 0);
  await expect
    .poll(() => grid.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(scrollBefore);

  const firstCellAfter = await page.locator('.grid-header-cell').first().boundingBox();
  expect(firstCellAfter!.x).toBeLessThan(firstCellBefore!.x);
});

test('[B3] the timescale dropdown offers Hour, Day, Week and Month', async ({ page }) => {
  await page.goto('/');

  await page.locator('.timescale-chip__value').click();

  // The menu of the artboard 'View Selection': 200 x 136 at (101, 185), Month selected.
  const menu = page.locator('.timescale-menu');
  await expect(menu).toBeVisible();
  await expect(menu.locator('.timescale-menu__item')).toHaveText(['Hour', 'Day', 'Week', 'Month']);
  expect(await menu.boundingBox()).toEqual({ x: 101, y: 185, width: 200, height: 136 });
  await expect(menu.locator('.timescale-menu__item--selected')).toHaveText('Month');

  // The design has no Hour artboard. Hour columns are as wide as Day columns.
  await menu.locator('.timescale-menu__item', { hasText: 'Hour' }).click();
  await expect(page.locator('.timescale-chip__value')).toContainText('Hour');
  await expect(page.locator('.grid-header-cell').first()).toHaveText(/^\d{2}:00$/);
  const cell = await page.locator('.grid-header-cell').first().boundingBox();
  expect(cell!.width).toBe(48);
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

test('[B6] the current month shows the chip of the design and a vertical line', async ({
  page,
}) => {
  await page.goto('/');

  const chip = page.locator('.grid-current-chip');
  await expect(chip).toHaveText('Current month');
  expect(await chip.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    rgb('#d4d7ff'),
  );
  expect(await chip.evaluate((element) => getComputedStyle(element).color)).toBe(rgb('#3e40db'));

  const chipBox = await chip.boundingBox();
  expect(chipBox!.width).toBe(109);
  expect(chipBox!.height).toBe(22);

  // The chip sits on the header band edge, at the top of the current month column.
  const header = await page.locator('.grid__header').boundingBox();
  expect(Math.abs(chipBox!.y - (header!.y + header!.height))).toBeLessThan(2);

  const marker = page.locator('.grid-current-marker');
  const markerBox = await marker.boundingBox();
  expect(markerBox!.width).toBe(3);
  expect(await marker.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    rgb('#d4d7ff'),
  );

  // The marker stands on the left edge of the current column.
  const cell = await page.locator('.grid-header-cell--current').boundingBox();
  expect(Math.abs(markerBox!.x - cell!.x)).toBeLessThan(2);
  expect(Math.abs(chipBox!.x - cell!.x)).toBeLessThan(2);
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

test('[B9] the work centre row and the timeline row hover together', async ({ page }) => {
  await page.goto('/');

  const hover = 'rgba(241, 243, 248, 0.75)';
  const railRow = page.locator('.work-center-row').nth(1);
  const gridRow = page.locator('.grid-row').nth(1);

  await railRow.hover();
  await expect
    .poll(() => railRow.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(hover);
  await expect
    .poll(() => gridRow.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(hover);

  await gridRow.hover();
  await expect
    .poll(() => gridRow.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(hover);
  await expect
    .poll(() => railRow.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(hover);
});

test('[G2] the timescale chip is 146 wide with the segments at 75 and 71', async ({ page }) => {
  await page.goto('/');

  const chip = await page.locator('.timescale-chip').boundingBox();
  expect(chip!.width).toBe(146);
  expect(chip!.height).toBe(25);

  const label = await page.locator('.timescale-chip__label').boundingBox();
  const value = await page.locator('.timescale-chip__value').boundingBox();
  expect(label!.width).toBe(75);
  expect(value!.width).toBe(71);

  // The value segment starts at x 176, the chip starts at x 101 and y 155.
  expect(chip!.x).toBe(101);
  expect(chip!.y).toBe(155);
  expect(value!.x).toBe(176);

  // One white rectangle with a shadow and no border. The label segment is tinted.
  const style = await page.locator('.timescale-chip').evaluate((element) => {
    const css = getComputedStyle(element);
    return { fill: css.backgroundColor, border: css.borderTopWidth, shadow: css.boxShadow };
  });
  expect(style).toEqual({
    fill: rgb('#ffffff'),
    border: '0px',
    shadow: 'rgb(200, 207, 233) 1px 2.5px 3px 0px',
  });
  expect(
    await page
      .locator('.timescale-chip__label')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgba(241, 243, 248, 0.75)');

  // The chevron is the line icon of the design, 8.47 x 5 at (230.53, 165.91).
  const chevron = await page.locator('.timescale-chip__chevron').boundingBox();
  expect(chevron!.x).toBeCloseTo(230.53, 0);
  expect(chevron!.y).toBeCloseTo(165.91, 0);
});

test('[G3] the NAOLOGIC wordmark sits at (101, 20), 80 x 10, on a top bar without a border', async ({
  page,
}) => {
  await page.goto('/');

  const logo = page.locator('.top-bar .logo');
  await expect(logo).toHaveAttribute('alt', 'Naologic');
  expect(await logo.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  expect(await logo.boundingBox()).toEqual({ x: 101, y: 20, width: 80, height: 10 });

  const bar = page.locator('.top-bar');
  expect((await bar.boundingBox())!.height).toBe(50);
  expect(await bar.evaluate((element) => getComputedStyle(element).borderBottomWidth)).toBe('0px');

  // The title line box of the design starts at y 95.
  const title = await page.locator('.page__title').boundingBox();
  expect(title!.y).toBe(95);
});

test('parity mode shows the artboard view: Aug 2024 first, Sep 2024 current, the fixture bars', async ({
  page,
}) => {
  await page.goto('/?parity=1');

  const firstVisible = page.locator('.grid-header-cell', { hasText: 'Aug 2024' });
  await expect.poll(async () => (await firstVisible.boundingBox())!.x).toBe(482);
  await expect(page.locator('.grid-header-cell--current')).toHaveText('Sep 2024');
  await expect(page.locator('app-work-order-bar')).toHaveCount(4);
  await expect(page.locator('.timescale-chip__value')).toContainText('Month');
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

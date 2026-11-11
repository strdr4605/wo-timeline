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
  await page.goto('./');

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
  await page.goto('./');

  const grid = page.locator('.grid');
  const scrollable = await grid.evaluate((element) => element.scrollWidth > element.clientWidth);
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
  await page.goto('./');

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
  await page.goto('./');

  await expect(page.locator('.timescale-chip__value')).toContainText('Month');

  const labels = await page.locator('.grid-header-cell').allTextContents();
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect(label.trim()).toMatch(MONTH_LABEL);
  }
});

test('[B5] the header row re-labels per zoom level', async ({ page }) => {
  await page.goto('./');

  const monthLabels = await page.locator('.grid-header-cell').allTextContents();
  for (const label of monthLabels) {
    expect(label.trim()).toMatch(MONTH_LABEL);
  }

  await chooseTimescale(page, 'Day');
  // The count is no wait condition: I1 extends the range after the render.
  await expect(page.locator('.grid-header-cell').first()).toHaveText(DAY_LABEL);
  const dayLabels = await page.locator('.grid-header-cell').allTextContents();
  for (const label of dayLabels) {
    expect(label.trim()).toMatch(DAY_LABEL);
  }

  await chooseTimescale(page, 'Week');
  await expect(page.locator('.grid-header-cell').first()).toHaveText(WEEK_LABEL);
  const weekLabels = await page.locator('.grid-header-cell').allTextContents();
  for (const label of weekLabels) {
    expect(label.trim()).toMatch(WEEK_LABEL);
  }
});

test('[B8] the initial view centres on today with a buffer', async ({ page }) => {
  await page.goto('./');

  const rail = await page.locator('.grid__rail').boundingBox();
  const grid = await page.locator('.grid').boundingBox();
  const marker = await page.locator('.grid-today-marker').boundingBox();

  const centre = (rail!.x + rail!.width + grid!.x + grid!.width) / 2;
  expect(Math.abs(marker!.x + marker!.width / 2 - centre)).toBeLessThan(10);

  // At least two weeks of days on each side of today in Day view. I1 adds more at the edges.
  await chooseTimescale(page, 'Day');
  const cells = page.locator('.grid-header-cell');
  await expect(cells.and(page.locator('.grid-header-cell--current'))).toHaveText(
    String(new Date().getDate()),
  );
  const { todayIndex, count } = await cells.evaluateAll((elements) => ({
    todayIndex: elements.findIndex((element) =>
      element.classList.contains('grid-header-cell--current'),
    ),
    count: elements.length,
  }));
  expect(todayIndex).toBeGreaterThanOrEqual(14);
  expect(count - 1 - todayIndex).toBeGreaterThanOrEqual(14);
});

test('[G2] the timescale chip is 146 wide with the segments at 75 and 71', async ({ page }) => {
  await page.goto('./');

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
    shadow: 'rgb(200, 207, 233) 1px 2.5px 3px -1.5px',
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

test('[G3] the wordmark sits at (101, 20), 80 x 10, on a top bar without a border', async ({
  page,
}) => {
  await page.goto('./');

  const logo = page.locator('.top-bar .logo');
  await expect(logo).toHaveAttribute('alt', 'WO Timeline');
  expect(await logo.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(
    0,
  );
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
  await page.goto('./?parity=1');

  const firstVisible = page.locator('.grid-header-cell', { hasText: 'Aug 2024' });
  await expect.poll(async () => (await firstVisible.boundingBox())!.x).toBe(483);
  await expect(page.locator('.grid-header-cell--current')).toHaveText('Sep 2024');
  await expect(page.locator('app-work-order-bar')).toHaveCount(4);
  await expect(page.locator('.timescale-chip__value')).toContainText('Month');
});

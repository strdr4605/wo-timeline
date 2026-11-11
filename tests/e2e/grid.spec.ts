import { expect, test, type Page } from '@playwright/test';

// Unit u2-grid: the timeline frame under the page head of 'Schedule - Default'.
// Positions are artboard pixels: the parity view renders the artboard 1:1 at 1440 x 1024.

const rgb = (hex: string) =>
  `rgb(${hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => parseInt(part, 16))
    .join(', ')})`;

test.use({ viewport: { width: 1440, height: 1024 } });

test('[B1] the grid is a card from the header line to the page bottom with a white rail', async ({
  page,
}) => {
  await openParity(page);

  const grid = await page.locator('.grid').boundingBox();
  expect(grid).toMatchObject({ x: 101, y: 204, height: 820 });
  expect(await style(page, '.grid', 'borderLeft')).toBe(`1px solid ${rgb('#e6ebf0')}`);

  const rail = await page.locator('.grid__rail').boundingBox();
  expect(rail).toMatchObject({ x: 102, width: 380 });
  expect(rail!.y + rail!.height).toBe(1024);
  expect(await style(page, '.grid__rail', 'backgroundColor')).toBe(rgb('#ffffff'));

  // The timeline border is the rail edge at x 482. The body is #f7f9fc down to the page bottom.
  const timeline = await page.locator('.grid__timeline').boundingBox();
  expect(timeline!.y + timeline!.height).toBe(1024);
  expect(await style(page, '.grid__timeline', 'borderLeft')).toBe(`1px solid ${rgb('#e6ebf0')}`);
  expect(await style(page, '.grid__timeline', 'backgroundColor')).toBe(rgb('#f7f9fc'));

  // The header lines end with the last column, at x 1395, as the card edge of the design.
  const last = await page.locator('.grid-header-cell').last().boundingBox();
  expect(last!.x + last!.width).toBe(1395);

  // The header, the rows and their fills go on past the last column, to the page right edge.
  const header = await page.locator('.grid__header').boundingBox();
  expect(header!.x + header!.width).toBeGreaterThanOrEqual(1440);
  const row = await page.locator('.grid-row').first().boundingBox();
  expect(row!.x + row!.width).toBeGreaterThanOrEqual(1440);

  // The page is white left of the card. The body fill stops 2px above the page bottom.
  expect(await style(page, '.page', 'backgroundColor')).toBe(rgb('#ffffff'));
  expect(await style(page, '.grid__timeline', 'borderBottom')).toBe(`2px solid ${rgb('#ffffff')}`);
});

test('[B5] the header shows Work Center and centred month labels without separators', async ({
  page,
}) => {
  await openParity(page);

  const header = await page.locator('.grid__rail-header').boundingBox();
  expect(header).toMatchObject({ y: 204, height: 34 });
  await expect(page.locator('.grid__rail-header')).toHaveText('Work Center');

  const cell = page.locator('.grid-header-cell', { hasText: 'Sep 2024' });
  const cellBox = await cell.boundingBox();
  const labelBox = await cell.locator('.grid-header-cell__label').boundingBox();
  expect(cellBox).toMatchObject({ x: 597, width: 114 });
  expect(Math.abs(labelBox!.x + labelBox!.width / 2 - 654)).toBeLessThanOrEqual(1);

  expect(await style(page, '.grid-header-cell', 'borderRightWidth')).toBe('0px');
  expect(await style(page, '.grid__header', 'backgroundColor')).toBe(rgb('#ffffff'));
});

test('[B6] the Current month chip sits on the header line at the current month', async ({
  page,
}) => {
  await openParity(page);

  const chip = page.locator('.grid-current-chip');
  await expect(chip).toHaveText('Current month');
  expect(await chip.boundingBox()).toEqual({ x: 595, y: 237, width: 109, height: 22 });
  expect(await style(page, '.grid-current-chip', 'backgroundColor')).toBe(rgb('#d4d7ff'));
  expect(await style(page, '.grid-current-chip', 'color')).toBe(rgb('#3e40db'));

  // Normal mode: the chip names the current week or day.
  await page.goto('/');
  for (const [option, label] of [
    ['Week', 'Current week'],
    ['Day', 'Today'],
    ['Hour', 'Today'],
    ['Month', 'Current month'],
  ] as const) {
    await page.locator('.timescale-chip__value').click();
    await page.locator('.timescale-menu__item', { hasText: option }).click();
    await expect(chip).toHaveText(label);
  }
});

test('[B7] one 3px #d4d7ff today line, 709 long, on the edge of the current month', async ({
  page,
}) => {
  await openParity(page);

  await expect(page.locator('.grid-today-marker')).toHaveCount(1);
  await expect(page.locator('.grid-current-marker')).toHaveCount(0);

  const line = await page.locator('.grid-today-marker').boundingBox();
  expect(line).toEqual({ x: 595, y: 238, width: 3, height: 709 });
  expect(await style(page, '.grid-today-marker', 'backgroundColor')).toBe(rgb('#d4d7ff'));
});

test('[B9] row hover: rail and timeline row, the placeholder box and its tooltip', async ({
  page,
}) => {
  await openParity(page);

  // The pointer of the design cursor is at about x 727. The box centre is about 5px right of it.
  await page.mouse.move(727, 322);

  const railRow = page.locator('.work-center-row').nth(1);
  const gridRow = page.locator('.grid-row').nth(1);
  await expect.poll(() => railRow.evaluate(backgroundOf)).toBe(rgb('#fafbfd'));
  await expect.poll(() => gridRow.evaluate(backgroundOf)).toBe(rgb('#eef0ff'));

  const box = page.locator('.grid-cell-hover');
  expect(await box.boundingBox()).toEqual({ x: 675, y: 303, width: 113, height: 38 });
  expect(await box.evaluate((element) => getComputedStyle(element).borderColor)).toBe(
    rgb('#c3c7ff'),
  );

  const tooltip = page.locator('.grid-cell-hover__tooltip');
  await expect(tooltip).toHaveText('Click to add dates');
  expect(await tooltip.boundingBox()).toEqual({ x: 665, y: 272, width: 130, height: 26 });
  expect(await tooltip.evaluate(backgroundOf)).toBe(rgb('#687196'));

  // Over a bar the placeholder goes away, the row stays hovered.
  await page.mouse.move(700, 370);
  await expect(page.locator('.grid-cell-hover')).toHaveCount(0);

  // On the first row the tooltip shows over the sticky header.
  await page.mouse.move(1100, 268);
  const tip = (await tooltip.boundingBox())!;
  expect(tip.y).toBeLessThan(238);
  // The tooltip has no pointer events, so read the painted pixel inside the header band.
  const shot = await page.screenshot({ clip: { x: tip.x + 4, y: tip.y + 4, width: 1, height: 1 } });
  expect(await pixelOf(page, shot)).toBe('#687196');

  await page.mouse.move(1300, 800);
  await expect(page.locator('.grid-row--hovered')).toHaveCount(0);
});

test('[B10] the first row is 60 high, the next rows 48 with a 1px divider', async ({ page }) => {
  await openParity(page);

  const railTops = await tops(page, '.work-center-row');
  expect(railTops).toEqual([238, 298, 347, 396, 445]);

  const gridRows = page.locator('.grid-row');
  expect((await gridRows.nth(0).boundingBox())!.height).toBe(60);
  expect((await gridRows.nth(1).boundingBox())!.height).toBe(48);
  expect(await tops(page, '.grid-row')).toEqual(railTops);

  // The white first row of the design covers its divider at y 297.
  const dividers = await page
    .locator('.work-center-row')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).borderBottom));
  expect(dividers[0]).toBe('1px solid rgba(0, 0, 0, 0)');
  expect(dividers[1]).toBe(`1px solid ${rgb('#e6ebf0')}`);
});

test('[B11] column lines run 747 down from the header line in every timescale', async ({
  page,
}) => {
  await openParity(page);

  // The column under 'Sep 2024' has its line at x 710.
  const index = (await page.locator('.grid-header-cell').allTextContents())
    .map((label) => label.trim())
    .indexOf('Sep 2024');
  const column = page.locator('.grid-cell').nth(index);
  const box = await column.boundingBox();
  expect(box!.x + box!.width - 1).toBe(710);
  expect(box!.y).toBe(238);
  expect(box!.height).toBe(747);
  expect(await column.evaluate((element) => getComputedStyle(element).borderRight)).toBe(
    `1px solid ${rgb('#e6ebf0')}`,
  );

  // The today line at x 596 replaces the column line under it, down to the line end.
  const underToday = page.locator('.grid-cell').nth(index - 1);
  expect(await underToday.evaluate((element) => getComputedStyle(element).borderRightColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );

  // Normal mode: the same lines with the column width of each timescale.
  await page.goto('/');
  for (const [option, width] of [
    ['Day', 48],
    ['Week', 114],
    ['Month', 114],
  ] as const) {
    await page.locator('.timescale-chip__value').click();
    await page.locator('.timescale-menu__item', { hasText: option }).click();
    const size = () =>
      page
        .locator('.grid-cell')
        .first()
        .evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
    await expect.poll(size).toEqual({ width, height: 747 });
    await expect(page.locator('.grid-today-marker')).toHaveCount(1);
  }
});

async function openParity(page: Page) {
  await page.goto('/?parity=1');
  await expect
    .poll(
      async () =>
        (await page.locator('.grid-header-cell', { hasText: 'Aug 2024' }).boundingBox())!.x,
    )
    .toBe(483);
}

async function style(page: Page, selector: string, property: keyof CSSStyleDeclaration) {
  return page
    .locator(selector)
    .first()
    .evaluate((element, name) => String(getComputedStyle(element)[name as never]), property);
}

async function tops(page: Page, selector: string) {
  const boxes = await page
    .locator(selector)
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
  return boxes;
}

async function pixelOf(page: Page, png: Buffer) {
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
  }, png.toString('base64'));
}

function backgroundOf(element: Element) {
  return getComputedStyle(element).backgroundColor;
}

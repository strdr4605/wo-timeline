import { expect, test, type Page } from '@playwright/test';

// Bonus b13-virtual: the grid renders only a window of the columns, about one viewport on each
// side of the visible ones, and only the bars that overlap it. The focused bar, the bar in a drag
// and the bar of the open drawer stay in the DOM. Parity mode renders every column.

test.use({ viewport: { width: 1440, height: 1024 } });

/** Day columns are 48 wide. Two years of days are about 35 000 px. */
const TWO_YEARS = 730 * 48;

/** The window holds about five viewports of columns: 1060 / 48 is 22 Day columns per viewport. */
const MAX_DAY_COLUMNS = 110;

test('[I9] a scroll of about two years in Day view keeps the column DOM count bounded', async ({
  page,
}) => {
  await openDayView(page);

  for (let left = 0; left < TWO_YEARS; left += 1500) {
    await scrollGridBy(page, 1500);
    const { header, grid } = await domColumns(page);
    expect(header).toBeLessThanOrEqual(MAX_DAY_COLUMNS);
    expect(grid).toBe(header);
  }

  // The range grew past two years, the DOM did not.
  expect(await columnCount(page)).toBeGreaterThan(730);
  expect(await visibleHeaderCount(page)).toBeGreaterThanOrEqual(20);
});

test('[I9] a bar far from the view is not in the DOM', async ({ page }) => {
  await openDayView(page);
  const near = await page.locator('.work-order-bar').count();
  expect(near).toBeGreaterThan(0);

  for (let left = 0; left < TWO_YEARS; left += 1500) {
    await scrollGridBy(page, 1500);
  }
  await expect(page.locator('.work-order-bar')).toHaveCount(0);

  await page.getByRole('button', { name: 'Today' }).click();
  await expect(page.locator('.work-order-bar')).toHaveCount(near);
});

test('[I9] the scroll position stays the same when columns are added on the left', async ({
  page,
}) => {
  await openDayView(page);

  // Just outside the edge zone first, so the window is at the place of the next scroll.
  const margin = await page.locator('.grid').evaluate((grid) => grid.clientWidth);
  await scrollGridTo(page, margin + 20);
  await waitForSettledColumns(page);
  const before = await columnCount(page);

  // The header is read in the same task as the scroll, so before the extend.
  const header = await firstVisibleHeader(page, margin - 20);

  await expect.poll(() => columnCount(page)).toBeGreaterThan(before);
  expect(await firstVisibleHeader(page)).toEqual(header);
  expect((await domColumns(page)).header).toBeLessThanOrEqual(MAX_DAY_COLUMNS);
});

test('[I9] the focus stays on a bar after a scroll moves it out of the window', async ({ page }) => {
  await openDayView(page);
  const bar = page.locator('.work-order-bar').first();
  const name = (await bar.getAttribute('aria-label'))!;
  await bar.focus();

  for (let left = 0; left < TWO_YEARS / 2; left += 1500) {
    await scrollGridBy(page, 1500);
  }

  // Only the focused bar is left in the DOM, and the keys still work on it.
  await expect(page.locator('.work-order-bar')).toHaveCount(1);
  expect(await focusedBarName(page)).toBe(name);
  await page.keyboard.press('Shift+ArrowRight');
  await expect.poll(() => focusedBarName(page)).not.toBe(name);

  // The blur lets the bar go.
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(page.locator('.work-order-bar')).toHaveCount(0);
});

test('[I9] a drag across the window edge resizes the bar', async ({ page }) => {
  await openDayView(page);
  const bar = page.locator('.work-order-bar').first();
  const name = (await bar.locator('.work-order-bar__name').textContent())!;
  const byName = page.locator('.work-order-bar').filter({ hasText: name });
  await bringEndIntoView(page, byName);
  const endBefore = endDateOf((await byName.getAttribute('aria-label'))!);

  const handle = (await byName.locator('.work-order-bar__handle--end').boundingBox())!;
  const x = handle.x + handle.width / 2;
  const y = handle.y + handle.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 2 * 48, y, { steps: 4 });

  // The grid scrolls the bar far out of the window during the drag. The bar stays in the DOM.
  for (let step = 0; step < 8; step++) {
    await scrollGridBy(page, 1500);
  }
  await expect(byName).toHaveCount(1);
  expect((await byName.boundingBox())!.x + (await byName.boundingBox())!.width).toBeLessThan(0);

  await page.mouse.move(x - 3 * 48, y, { steps: 4 });
  await page.mouse.up();

  // After the release the bar leaves the DOM. Back at today it shows the new end date.
  await expect(byName).toHaveCount(0);
  await page.getByRole('button', { name: 'Today' }).click();
  const expected = new Date(endBefore);
  expected.setDate(expected.getDate() - 3);
  await expect(byName).toHaveAttribute('aria-label', new RegExp(`to ${formatDate(expected)}$`));
});

test('[I9] parity mode renders every column', async ({ page }) => {
  await page.goto('/?parity=1');
  await expect(page.locator('.grid-row').first()).toBeVisible();

  const { header, grid } = await domColumns(page);
  expect(header).toBe(await columnCount(page));
  expect(grid).toBe(header);
  // The window starts at the first column, so no pixel moves.
  expect(
    await page.locator('.grid__window').first().evaluate((element) => getComputedStyle(element).transform),
  ).toBe('matrix(1, 0, 0, 1, 0, 0)');
});

async function openDayView(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('.grid-row').first()).toBeVisible();
  await page.locator('.timescale-chip__value').click();
  await page.locator('.timescale-menu__item', { hasText: 'Day' }).click();
  await expect(page.locator('.timescale-chip__value')).toContainText('Day');
  await waitForSettledColumns(page);
}

/** The first load extends while today is centred. Wait until the column count stops changing. */
async function waitForSettledColumns(page: Page): Promise<void> {
  let previous = -1;
  await expect
    .poll(async () => {
      const count = await columnCount(page);
      const settled = count === previous;
      previous = count;
      return settled;
    })
    .toBe(true);
}

/** The columns of the range. The DOM holds only the window of them. */
async function columnCount(page: Page): Promise<number> {
  return page
    .locator('.grid__timeline')
    .evaluate((timeline) => Number((timeline as HTMLElement).style.getPropertyValue('--column-count')));
}

async function domColumns(page: Page): Promise<{ header: number; grid: number }> {
  return {
    header: await page.locator('.grid-header-cell').count(),
    grid: await page.locator('.grid-cell').count(),
  };
}

/** The header cells between the rail and the right edge of the grid. */
async function visibleHeaderCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const railRight = document.querySelector('.grid__rail')!.getBoundingClientRect().right;
    const gridRight = document.querySelector('.grid')!.getBoundingClientRect().right;
    return [...document.querySelectorAll('.grid-header-cell')].filter((cell) => {
      const box = cell.getBoundingClientRect();
      return box.right > railRight && box.x < gridRight;
    }).length;
  });
}

/** A wheel-sized scroll, then a frame for the scroll event to move the window. */
async function scrollGridBy(page: Page, left: number): Promise<void> {
  await page.locator('.grid').evaluate(async (grid, dx) => {
    grid.scrollBy({ left: dx, behavior: 'instant' });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, left);
}

async function scrollGridTo(page: Page, left: number): Promise<void> {
  await page.locator('.grid').evaluate((grid, x) => grid.scrollTo({ left: x, behavior: 'instant' }), left);
}

/** The label and x of the first column header right of the rail, after an optional scroll. */
async function firstVisibleHeader(
  page: Page,
  scrollLeft?: number,
): Promise<{ label: string; x: number }> {
  return page.evaluate((left) => {
    if (left !== undefined) {
      document.querySelector('.grid')!.scrollLeft = left;
    }
    const railRight = document.querySelector('.grid__rail')!.getBoundingClientRect().right;
    const cells = [...document.querySelectorAll('.grid-header-cell')];
    const cell = cells.find((element) => element.getBoundingClientRect().x >= railRight - 1)!;
    return { label: cell.textContent!.trim(), x: cell.getBoundingClientRect().x };
  }, scrollLeft);
}

async function focusedBarName(page: Page): Promise<string | null> {
  return page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? null);
}

/** Scrolls until the end handle of the bar is near the middle of the grid. */
async function bringEndIntoView(page: Page, bar: ReturnType<Page['locator']>): Promise<void> {
  await expect
    .poll(async () => {
      const box = (await bar.boundingBox())!;
      const right = box.x + box.width;
      if (right > 700 && right < 1300) {
        return true;
      }
      await scrollGridBy(page, Math.max(-1500, Math.min(1500, right - 1000)));
      return false;
    })
    .toBe(true);
}

/** The end date in the accessible name of a bar: 'Name, Status, Oct 18, 2026 to Feb 22, 2027'. */
function endDateOf(label: string): Date {
  return new Date(label.split(' to ').pop()!);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    date,
  );
}

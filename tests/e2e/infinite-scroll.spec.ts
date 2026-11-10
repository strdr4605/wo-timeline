import { expect, test, type Page } from '@playwright/test';

// Bonus b12-infinite: a scroll near an edge of the timeline adds a chunk of columns there.
// A left extend keeps the visible content in place. Parity mode keeps the fixed range of the design.

test.use({ viewport: { width: 1440, height: 1024 } });

test('[I1] a scroll to the right edge adds columns on the right', async ({ page }) => {
  await page.goto('/');
  await waitForSettledColumns(page);
  const before = await columnCount(page);
  const lastBefore = await page.locator('.grid-header-cell').last().textContent();

  await scrollGridTo(page, Number.MAX_SAFE_INTEGER);

  await expect.poll(() => columnCount(page)).toBeGreaterThan(before);
  // The old columns stay, the new ones come after them.
  await expect(page.locator('.grid-header-cell').nth(before - 1)).toHaveText(lastBefore!);
});

test('[I1] a scroll to the left edge adds columns on the left and the view does not jump', async ({
  page,
}) => {
  await page.goto('/');
  await waitForSettledColumns(page);
  const before = await columnCount(page);

  // Less than one viewport from the edge: the scroll event extends. The header is read in the
  // same task as the scroll, so before the extend.
  const header = await firstVisibleHeader(page, 300);

  await expect.poll(() => columnCount(page)).toBeGreaterThan(before);
  const after = await headerX(page, header.label);
  expect(Math.abs(after - header.x)).toBeLessThanOrEqual(1);
  expect(await firstVisibleHeader(page)).toEqual(header);
});

test('[I1] parity mode keeps the fixed range of the design', async ({ page }) => {
  await page.goto('/?parity=1');
  await expect(page.locator('.grid-row').first()).toBeVisible();
  const before = await columnCount(page);
  const startScroll = await page.locator('.grid').evaluate((grid) => grid.scrollLeft);

  await scrollGridTo(page, 0);
  await scrollGridTo(page, Number.MAX_SAFE_INTEGER);
  await page.waitForTimeout(300);

  expect(await columnCount(page)).toBe(before);

  // Nothing moved the view by itself: the design view comes back on a reload.
  await page.reload();
  await expect(page.locator('.grid-row').first()).toBeVisible();
  expect(await page.locator('.grid').evaluate((grid) => grid.scrollLeft)).toBe(startScroll);
});

test('[I1] a bar stays at its date after a left extend', async ({ page }) => {
  await page.goto('/');
  await waitForSettledColumns(page);
  const bar = page.locator('.work-order-bar').first();
  const before = await columnCount(page);
  const anchor = await barAnchor(page);

  await scrollGridTo(page, 300);
  await expect.poll(() => columnCount(page)).toBeGreaterThan(before);

  // The bar keeps its distance to the header of the column that holds its start date.
  const barX = (await bar.boundingBox())!.x;
  expect(Math.abs(barX - (await headerX(page, anchor.label)) - anchor.offset)).toBeLessThanOrEqual(1);
});

for (const timescale of ['Day', 'Hour']) {
  test(`[I1] in ${timescale} a scroll to the right end keeps adding columns, no empty area`, async ({
    page,
  }) => {
    await page.goto('/');
    await chooseTimescale(page, timescale);
    await waitForSettledColumns(page);

    // A bar past the last column must not widen the scroll area: then the right edge never comes
    // near and the header ends with empty space. A wheel stops at the last column, so the test
    // scrolls there, not to the scrollWidth.
    for (let step = 0; step < 4; step++) {
      const before = await columnCount(page);
      await scrollToLastColumn(page);
      await expect.poll(() => columnCount(page)).toBeGreaterThan(before);
      await waitForSettledColumns(page);

      const { gap, viewport } = await page.locator('.grid').evaluate((grid) => {
        const cells = grid.querySelectorAll('.grid-header-cell');
        const lastRight = cells[cells.length - 1].getBoundingClientRect().right;
        const contentRight = lastRight - grid.getBoundingClientRect().left + grid.scrollLeft;
        return { gap: grid.scrollWidth - contentRight, viewport: grid.clientWidth };
      });
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThan(viewport);
    }
  });
}

/** Opens the timescale menu and picks one of its options. */
async function chooseTimescale(page: Page, option: string): Promise<void> {
  await expect(page.locator('.grid-row').first()).toBeVisible();
  await page.locator('.timescale-chip__value').click();
  await page.locator('.timescale-menu__item', { hasText: option }).click();
  await expect(page.locator('.timescale-chip__value')).toContainText(option);
}

/** Scrolls until the right edge of the last column is at the right edge of the grid. */
async function scrollToLastColumn(page: Page): Promise<void> {
  await page.locator('.grid').evaluate((grid) => {
    const cells = grid.querySelectorAll('.grid-header-cell');
    const lastRight = cells[cells.length - 1].getBoundingClientRect().right;
    const visibleRight = grid.getBoundingClientRect().left + grid.clientLeft + grid.clientWidth;
    grid.scrollBy({ left: lastRight - visibleRight, behavior: 'instant' });
  });
}

/** The first load extends while today is centred. Wait until the column count stops changing. */
async function waitForSettledColumns(page: Page): Promise<void> {
  await expect(page.locator('.grid-row').first()).toBeVisible();
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

async function columnCount(page: Page): Promise<number> {
  return page.locator('.grid-header-cell').count();
}

async function scrollGridTo(page: Page, left: number): Promise<void> {
  await page.locator('.grid').evaluate((grid, x) => grid.scrollTo({ left: x, behavior: 'instant' }), left);
}

async function headerX(page: Page, label: string): Promise<number> {
  const cell = page.locator('.grid-header-cell').filter({ hasText: new RegExp(`^${label}$`) });
  return (await cell.boundingBox())!.x;
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

/** The header that holds the left edge of the first bar, and the bar offset from that header. */
async function barAnchor(page: Page): Promise<{ label: string; offset: number }> {
  return page.evaluate(() => {
    const barX = document.querySelector('.work-order-bar')!.getBoundingClientRect().x;
    const cells = [...document.querySelectorAll('.grid-header-cell')];
    const cell = cells.find((element) => {
      const box = element.getBoundingClientRect();
      return barX >= box.x && barX < box.right;
    })!;
    return { label: cell.textContent!.trim(), offset: barX - cell.getBoundingClientRect().x };
  });
}

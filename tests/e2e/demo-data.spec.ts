import { expect, test, type Page } from '@playwright/test';

// Bonus b19-demo-data: `?demo=1` adds buttons that load about 5,000 generated orders (and 50 more
// work centres), a Reset data button and a live DOM counter. `?virtual=0` turns the column
// windowing off. The demo data stays in memory. Parity mode never shows the demo controls.

const STORAGE_KEYS = ['wo-timeline.workOrders.v1', 'wo-timeline.railWidth.v1'];

const SAMPLE_NAMES = [
  'Concentrix Ltd',
  'Polymer Extrusion',
  'Rodriques Electrics',
  'Steel Fabrication',
  'Konsulting Inc',
  'Compleks Systems',
  'McMarrow Distribution',
  'Spartan Manufacturing',
];

const DEMO_BUTTONS = ['Load 5,000 orders', 'Load 50 work centres', 'Reset data'];

/** Day view shows about 22 columns. The window holds about five viewports: 205 bars measured. */
const MAX_DAY_VIEW_BARS = 400;

test.use({ viewport: { width: 1440, height: 1024 } });

test('[I12] the demo buttons and the counter show only with ?demo=1, never in parity mode', async ({
  page,
}) => {
  for (const url of ['/', '/?parity=1', '/?parity=1&demo=1']) {
    await test.step(url, async () => {
      await openApp(page, url);
      for (const name of DEMO_BUTTONS) {
        await expect(page.getByRole('button', { name })).toHaveCount(0);
      }
      await expect(page.locator('.demo-badge')).toHaveCount(0);
    });
  }

  await openApp(page, '/?demo=1');
  for (const name of DEMO_BUTTONS) {
    await expect(page.getByRole('button', { name })).toBeVisible();
  }
  await expect(page.locator('.demo-badge')).toContainText('Orders 8');
});

test('[I12] Load 5,000 orders: the counter shows 5000 and the bars in the DOM stay bounded', async ({
  page,
}) => {
  await openApp(page, '/?demo=1');
  await page.getByRole('button', { name: 'Load 5,000 orders' }).click();
  await expect(badgeCount(page, 'orders')).toHaveText('5000');

  await selectTimescale(page, 'Day');
  await expect(page.locator('.work-order-bar').first()).toBeVisible();
  for (let step = 0; step < 6; step++) {
    await scrollGridBy(page, 1500);
    const bars = await page.locator('.work-order-bar').count();
    expect(bars).toBeGreaterThan(0);
    expect(bars).toBeLessThanOrEqual(MAX_DAY_VIEW_BARS);
  }

  // The counter follows the scroll and agrees with the DOM.
  await expect
    .poll(async () => (await badgeCount(page, 'bars').textContent()) === String(await page.locator('.work-order-bar').count()))
    .toBe(true);
  await expect(badgeCount(page, 'columns')).toHaveText(String(await page.locator('.grid-header-cell').count()));
  await expect(badgeCount(page, 'frame')).toHaveText(/^\d+$/);
});

test('[I12] the generated orders use every status and never overlap on a work centre', async ({
  page,
}) => {
  await openApp(page, '/?demo=1&virtual=0');

  for (const [button, rows] of [
    ['Load 5,000 orders', 5],
    ['Load 50 work centres', 55],
  ] as const) {
    await test.step(button, async () => {
      await page.getByRole('button', { name: button }).click();
      await expect(page.locator('.grid-row')).toHaveCount(rows);
      await expect(page.locator('.work-order-bar')).toHaveCount(5000);

      const statuses = await page.locator('.work-order-bar').evaluateAll((bars) => [
        ...new Set(bars.map((bar) => bar.getAttribute('data-status'))),
      ]);
      expect(statuses.sort()).toEqual(['blocked', 'complete', 'in-progress', 'open']);

      // In each row the next bar starts after the previous one ends.
      const touching = await page.locator('.grid-row').evaluateAll((gridRows) =>
        gridRows.flatMap((row, rowIndex) => {
          const position = (bar: HTMLElement, edge: 'start' | 'end') =>
            Number(bar.style.getPropertyValue(`--${edge}-index`)) +
            Number(bar.style.getPropertyValue(`--${edge}-fraction`));
          const ranges = [...row.querySelectorAll<HTMLElement>('.work-order-bar')]
            .map((bar) => ({ start: position(bar, 'start'), end: position(bar, 'end') }))
            .sort((a, b) => a.start - b.start);
          return ranges.slice(1).flatMap((range, i) => (range.start > ranges[i].end ? [] : [rowIndex]));
        }),
      );
      expect(touching).toEqual([]);
    });
  }
});

test('[I12] Reset data brings back the sample data', async ({ page }) => {
  await openApp(page, '/?demo=1');
  await page.getByRole('button', { name: 'Load 50 work centres' }).click();
  await expect(page.locator('.grid-row')).toHaveCount(55);
  await expect(badgeCount(page, 'orders')).toHaveText('5000');

  await page.getByRole('button', { name: 'Reset data' }).click();
  await expect(page.locator('.grid-row')).toHaveCount(5);
  await expect(badgeCount(page, 'orders')).toHaveText('8');
  await page.getByRole('button', { name: 'Today' }).click();
  await expect(page.locator('.work-order-bar__name')).toHaveText(SAMPLE_NAMES);
});

test('[I12] ?virtual=0 renders every column and every bar', async ({ page }) => {
  await test.step('windowing on: fewer columns in the DOM than in the range', async () => {
    await openApp(page, '/?demo=1');
    await selectTimescale(page, 'Day');
    await scrollGridBy(page, 3000);
    await expect.poll(() => columnsInDom(page)).toBeLessThan(await columnsInRange(page));
  });

  await test.step('windowing off: every column of the range and all 5,000 bars', async () => {
    await openApp(page, '/?demo=1&virtual=0');
    await page.getByRole('button', { name: 'Load 5,000 orders' }).click();
    await selectTimescale(page, 'Day');
    await scrollGridBy(page, 3000);
    await expect.poll(() => columnsInRange(page)).toBeGreaterThan(29);
    expect(await columnsInDom(page)).toBe(await columnsInRange(page));
    await expect(page.locator('.work-order-bar')).toHaveCount(5000);
  });
});

test('[I12] the demo data never goes to localStorage, also after an edit', async ({ page }) => {
  await openApp(page, '/?demo=1');
  await page.getByRole('button', { name: 'Load 5,000 orders' }).click();
  await expect(badgeCount(page, 'orders')).toHaveText('5000');

  // A delete saves the orders in the normal app. With demo data it must not.
  const bar = page.locator('.work-order-bar').first();
  await bar.focus();
  await bar.press('Enter');
  await bar.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(badgeCount(page, 'orders')).toHaveText('4999');

  await page.getByRole('button', { name: 'Load 50 work centres' }).click();
  await page.getByRole('button', { name: 'Reset data' }).click();
  expect(await storedValues(page)).toEqual([null, null]);

  await page.reload();
  await expect(page.locator('.grid-row')).toHaveCount(5);
  await expect(badgeCount(page, 'orders')).toHaveText('8');
});

async function openApp(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('.grid-row').first()).toBeVisible();
}

async function selectTimescale(page: Page, timescale: string): Promise<void> {
  await page.locator('.timescale-chip__value').click();
  await page.getByRole('option', { name: timescale, exact: true }).click();
  await expect(page.locator('.timescale-chip__value')).toHaveText(timescale);
}

/** Scrolls the grid in small steps, so the window and the extends follow as for a user. */
async function scrollGridBy(page: Page, distance: number): Promise<void> {
  for (let moved = 0; moved < distance; moved += 300) {
    await page.locator('.grid').evaluate((grid) => (grid.scrollLeft += 300));
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(200);
}

function badgeCount(page: Page, name: 'orders' | 'bars' | 'columns' | 'frame') {
  return page.locator(`.demo-badge [data-count="${name}"]`);
}

function columnsInDom(page: Page): Promise<number> {
  return page.locator('.grid-header-cell').count();
}

function columnsInRange(page: Page): Promise<number> {
  return page
    .locator('.grid__timeline')
    .evaluate((timeline) => Number((timeline as HTMLElement).style.getPropertyValue('--column-count')));
}

function storedValues(page: Page): Promise<(string | null)[]> {
  return page.evaluate((keys) => keys.map((key) => localStorage.getItem(key)), STORAGE_KEYS);
}

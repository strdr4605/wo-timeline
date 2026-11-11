import { expect, test, type Page } from '@playwright/test';

// Bonus b1-storage: the work orders survive a reload through localStorage.
// The normal app (no `?parity=1`) reads and writes the storage. Parity mode ignores it.

const STORAGE_KEY = 'wo-timeline.workOrders.v1';

/** The bar names of the sample data, in the order of docs/requirements/SAMPLE-DATA.md. */
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

const PARITY_NAMES = [
  'Concentrix Ltd',
  'Konsulting Inc',
  'Compleks Systems',
  'McMarrow Distribution',
];

test.use({ viewport: { width: 1440, height: 1024 } });

test('[F5] first load with empty storage seeds the sample data and writes nothing', async ({
  page,
}) => {
  await openApp(page);

  await expect(barNames(page)).toHaveText(SAMPLE_NAMES);
  expect(await readStorage(page)).toBeNull();
});

test('[F5] create, edit and delete survive a reload', async ({ page }) => {
  await openApp(page);

  // Create on an empty row: an empty stored list leaves every row free.
  await writeStorage(page, '[]');
  await page.reload();
  await expect(barNames(page)).toHaveCount(0);

  // A click under the today line: I9 renders only the bars near the visible columns.
  const row = page.locator('.grid-row').nth(1);
  const rowX = (await row.boundingBox())!.x;
  const todayX = (await page.locator('.grid-today-marker').boundingBox())!.x;
  await row.click({ position: { x: todayX - rowX + 20, y: 20 } });
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await page.locator('#drawer-name').fill('Stored Order');
  await page.getByRole('button', { name: 'Create' }).click();
  await reloadApp(page);
  await expect(barNames(page)).toHaveText(['Stored Order']);

  await openMenuItem(page, 'Stored Order', 'Edit');
  await page.locator('#drawer-name').fill('Stored Order Edited');
  await page.getByRole('button', { name: 'Save' }).click();
  await reloadApp(page);
  await expect(barNames(page)).toHaveText(['Stored Order Edited']);

  await openMenuItem(page, 'Stored Order Edited', 'Delete');
  await expect(barNames(page)).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(500);
  await expect(barNames(page)).toHaveCount(0);
  expect(JSON.parse((await readStorage(page)) ?? 'null')).toEqual([]);
});

test('[F5] the stored data keeps the document structure of the brief', async ({ page }) => {
  await openApp(page);
  await openMenuItem(page, 'Concentrix Ltd', 'Delete');

  const documents = JSON.parse((await readStorage(page)) ?? '[]');
  expect(documents).toHaveLength(SAMPLE_NAMES.length - 1);
  expect(documents[0]).toEqual({
    docId: expect.any(String),
    docType: 'workOrder',
    data: {
      name: 'Polymer Extrusion',
      workCenterId: expect.any(String),
      status: expect.any(String),
      startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    },
  });
});

test('[F5] corrupt or wrong-shaped storage falls back to the sample data', async ({ page }) => {
  await openApp(page);

  for (const value of [
    '{not json',
    '{"docId":"x"}',
    '[{"docId":1}]',
    '[{"docId":"x","docType":"workOrder","data":{}}]',
  ]) {
    await writeStorage(page, value);
    await reloadApp(page);
    await expect(barNames(page)).toHaveText(SAMPLE_NAMES);
  }

  // The next change replaces the corrupt entry.
  await openMenuItem(page, 'Concentrix Ltd', 'Delete');
  await reloadApp(page);
  await expect(barNames(page)).toHaveText(SAMPLE_NAMES.slice(1));
});

test('[F5] parity mode neither reads nor writes the storage', async ({ page }) => {
  await openApp(page);
  await writeStorage(page, '[]');

  await page.goto('/?parity=1');
  await expect(barNames(page)).toHaveText(PARITY_NAMES);

  await openMenuItem(page, 'Concentrix Ltd', 'Delete');
  await expect(barNames(page)).toHaveText(PARITY_NAMES.slice(1));
  expect(await readStorage(page)).toBe('[]');
});

async function openApp(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('.grid-row').first()).toBeVisible();
}

async function reloadApp(page: Page): Promise<void> {
  await page.reload();
  await expect(page.locator('.work-order-bar').first()).toBeVisible();
}

async function openMenuItem(page: Page, orderName: string, item: 'Edit' | 'Delete'): Promise<void> {
  const bar = barNamed(page, orderName);
  await bar.hover();
  await bar.locator('.work-order-bar__actions').click();
  await bar.getByRole('menuitem', { name: item }).click();

  if (item === 'Edit') {
    await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
    await page.waitForTimeout(300);
  }
}

function barNames(page: Page) {
  return page.locator('.work-order-bar__name');
}

function barNamed(page: Page, name: string) {
  return page.locator('.work-order-bar').filter({
    has: page.locator('.work-order-bar__name', { hasText: new RegExp(`^${name}$`) }),
  });
}

function readStorage(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
}

function writeStorage(page: Page, value: string): Promise<void> {
  return page.evaluate(([key, item]) => localStorage.setItem(key, item), [STORAGE_KEY, value]);
}

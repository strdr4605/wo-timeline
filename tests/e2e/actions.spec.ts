import { expect, test, type Page } from '@playwright/test';

// Unit u5-actions: create, edit and delete, with the validation of the drawer.
// Positions are artboard pixels: the parity view renders the artboard 1:1 at 1440 x 1024.
// Parity data: Konsulting Inc runs 21.08.2024 to 30.11.2024 and Compleks Systems 03.12.2024 to
// 13.03.2025, both on the Konsulting Inc work centre.

const rgb = (hex: string) =>
  `rgb(${hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => parseInt(part, 16))
    .join(', ')})`;

/** An empty cell of the Rodriques Electrics row, in September 2024. */
const RODRIQUES_CELL = { x: 654, y: 322 };
/** An empty cell of the Konsulting Inc row, early August 2024, before the first bar. */
const KONSULTING_CELL = { x: 500, y: 371 };

test.use({ viewport: { width: 1440, height: 1024 } });

test('[D14] Cancel and the primary button: 66 x 32 at the top right, white and #5659ff', async ({
  page,
}) => {
  await openParity(page);
  await openCreate(page, RODRIQUES_CELL);

  const cancel = page.getByRole('button', { name: 'Cancel' });
  const create = page.getByRole('button', { name: 'Create' });
  expect(await cancel.boundingBox()).toEqual({ x: 1276, y: 25, width: 66, height: 32 });
  expect(await create.boundingBox()).toEqual({ x: 1350, y: 25, width: 66, height: 32 });
  await expect(create).toHaveCSS('background-color', rgb('#5659ff'));
  await expect(cancel).toHaveCSS('background-color', rgb('#ffffff'));
});

test('[E1] a valid form creates the order and closes the drawer', async ({ page }) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  await openCreate(page, RODRIQUES_CELL);
  await page.locator('#drawer-name').fill('Rodriques Rewire');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars + 1);
  await expect(barNamed(page, 'Rodriques Rewire')).toBeVisible();
});

test('[E1] every field is required: no order, an inline error under each empty field', async ({
  page,
}) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  await openCreate(page, RODRIQUES_CELL);
  // No error before the first Create: the design of an untouched form stays clean.
  await expect(page.locator('.drawer-field__error')).toHaveCount(0);

  await page.locator('#drawer-start').fill('');
  await page.locator('#drawer-end').fill('');
  await page.locator('#drawer-name').fill('   ');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.locator('#drawer-name-error')).toHaveText('Enter a work order name.');
  await expect(page.locator('#drawer-start-error')).toHaveText('Enter a date.');
  await expect(page.locator('#drawer-end-error')).toHaveText('Enter a date.');
  await expect(page.locator('#drawer-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#drawer-name-error')).toHaveCSS('color', rgb('#b13600'));
  await expect(page.locator('#drawer-name-error')).toHaveCSS('font-size', '14px');
  await expect(page.locator('#drawer-name')).toHaveCSS('border-top-color', rgb('#b13600'));

  // The error sits under its field, inside the field block.
  const field = await page.locator('#drawer-name').boundingBox();
  const error = await page.locator('#drawer-name-error').boundingBox();
  expect(error!.y).toBeGreaterThan(field!.y + field!.height);

  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars);

  // A fixed field loses its error.
  await page.locator('#drawer-name').fill('Rodriques Rewire');
  await expect(page.locator('#drawer-name-error')).toHaveCount(0);
});

test('[E1] the end date must be after the start date', async ({ page }) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  await openCreate(page, RODRIQUES_CELL);
  await page.locator('#drawer-name').fill('Backwards');
  await page.locator('#drawer-end').fill('16.09.2024');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.locator('#drawer-end-error')).toHaveText(
    'The end date must be after the start date.',
  );
  await expect(page.locator('.work-order-bar')).toHaveCount(bars);

  await page.locator('#drawer-end').fill('31.13.2024');
  await expect(page.locator('#drawer-end-error')).toHaveText('31.13.2024 is not a valid date.');

  await page.locator('#drawer-end').fill('17.09.2024');
  await expect(page.locator('#drawer-end-error')).toHaveCount(0);
});

test('[E2] an overlap on the same work centre is rejected and creates no order', async ({
  page,
}) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  await openCreate(page, KONSULTING_CELL);
  await page.locator('#drawer-name').fill('Clash');
  // The end date touches the first day of Konsulting Inc.
  await page.locator('#drawer-end').fill('21.08.2024');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars);
  await expect(barNamed(page, 'Clash')).toHaveCount(0);
});

test('[E4] the overlap error names the work centre and sits between the buttons and the fields', async ({
  page,
}) => {
  await openParity(page);
  await openCreate(page, KONSULTING_CELL);
  await page.locator('#drawer-name').fill('Clash');
  await page.locator('#drawer-end').fill('25.08.2024');
  await page.getByRole('button', { name: 'Create' }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toHaveText(
    'These dates overlap another order on Konsulting Inc.',
  );
  await expect(alert).toHaveCSS('color', rgb('#b13600'));
  await expect(alert).toHaveCSS('background-color', rgb('#fffcf1'));

  const buttons = await page.getByRole('button', { name: 'Create' }).boundingBox();
  const alertBox = await alert.boundingBox();
  const nameField = await page.locator('#drawer-name').boundingBox();
  expect(alertBox!.y).toBeGreaterThan(buttons!.y + buttons!.height);
  expect(alertBox!.y + alertBox!.height).toBeLessThan(nameField!.y);

  // A changed date makes the message stale, and a free range saves.
  await page.locator('#drawer-end').fill('20.08.2024');
  await expect(alert).toHaveCount(0);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  await expect(barNamed(page, 'Clash')).toBeVisible();
});

test('[E3] Edit saves in place and ignores the old dates of the edited order', async ({ page }) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  await openMenuItem(page, 'Konsulting Inc', 'Edit');
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  // The new range lies inside the old one: only the edited order is there.
  await page.locator('#drawer-name').fill('Konsulting Retool');
  await page.locator('#drawer-start').fill('01.09.2024');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars);
  await expect(barNamed(page, 'Konsulting Retool')).toBeVisible();
  await expect(barNamed(page, 'Konsulting Inc')).toHaveCount(0);

  // The saved values come back in the next Edit.
  await openMenuItem(page, 'Konsulting Retool', 'Edit');
  await expect(page.locator('#drawer-start')).toHaveValue('01.09.2024');
  await expect(page.locator('#drawer-end')).toHaveValue('30.11.2024');
});

test('[E3] Edit still rejects an overlap with another order of the work centre', async ({
  page,
}) => {
  await openParity(page);
  await openMenuItem(page, 'Konsulting Inc', 'Edit');

  await page.locator('#drawer-end').fill('03.12.2024');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('alert')).toContainText('Konsulting Inc');
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);

  // Cancel keeps the old order.
  await page.getByRole('button', { name: 'Cancel' }).click();
  await openMenuItem(page, 'Konsulting Inc', 'Edit');
  await expect(page.locator('#drawer-end')).toHaveValue('30.11.2024');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('[E5] the same dates on another work centre are allowed', async ({ page }) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  // Rodriques Electrics has no order; Konsulting Inc runs on these days.
  await openCreate(page, RODRIQUES_CELL);
  await page.locator('#drawer-name').fill('Parallel Run');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars + 1);
});

test('[C5] Delete from the three-dot menu removes the order', async ({ page }) => {
  await openParity(page);
  const bars = await page.locator('.work-order-bar').count();

  await openMenuItem(page, 'Compleks Systems', 'Delete');

  await expect(barNamed(page, 'Compleks Systems')).toHaveCount(0);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars - 1);
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);

  // The freed range now takes a new order.
  await openCreate(page, KONSULTING_CELL);
  await page.locator('#drawer-name').fill('After Delete');
  await page.locator('#drawer-start').fill('05.12.2024');
  await page.locator('#drawer-end').fill('10.12.2024');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(barNamed(page, 'After Delete')).toHaveCount(1);
});

test('[D9] Escape and a click outside close an edit without a save', async ({ page }) => {
  await openParity(page);

  await openMenuItem(page, 'McMarrow Distribution', 'Edit');
  await page.locator('#drawer-name').fill('Not saved');
  await page.keyboard.press('Escape');
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);

  await openMenuItem(page, 'McMarrow Distribution', 'Edit');
  await expect(page.locator('#drawer-name')).toHaveValue('McMarrow Distribution');
  await page.locator('#drawer-name').fill('Not saved');
  await page.mouse.click(400, 700);
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);

  await expect(barNamed(page, 'Not saved')).toHaveCount(0);
  await expect(barNamed(page, 'McMarrow Distribution')).toHaveCount(1);
});

async function openParity(page: Page): Promise<void> {
  await page.goto('/?parity=1');
  await page.evaluate(() => document.fonts.ready);
}

async function openCreate(page: Page, cell: { x: number; y: number }): Promise<void> {
  await page.mouse.click(cell.x, cell.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  // The slide-in is 200ms.
  await page.waitForTimeout(300);
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

function barNamed(page: Page, name: string) {
  return page.locator('.work-order-bar').filter({
    has: page.locator('.work-order-bar__name', { hasText: name }),
  });
}

import { expect, test, type Page } from '@playwright/test';

// Unit u4-drawer: the create and edit drawer of the 'Create New Event' artboards.
// Positions are artboard pixels: the parity view renders the artboard 1:1 at 1440 x 1024.

const rgb = (hex: string) =>
  `rgb(${hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => parseInt(part, 16))
    .join(', ')})`;

/** An empty cell of the Rodriques Electrics row, in the middle of the September 2024 column. */
const EMPTY_CELL = { x: 654, y: 322 };

test.use({ viewport: { width: 1440, height: 1024 } });

test('[D1] the drawer slides in from the right: 591 wide, radius 12, the design shadow', async ({
  page,
}) => {
  await openParity(page);
  await expect(page.locator('.drawer')).not.toBeVisible();

  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  const drawer = page.locator('.drawer');
  await expect(drawer).toHaveClass(/drawer--open/);
  expect(await style(page, '.drawer', 'transitionProperty')).toContain('transform');

  await page.waitForTimeout(400);
  expect(await drawer.boundingBox()).toEqual({ x: 849, y: 0, width: 591, height: 1024 });
  expect(await style(page, '.drawer', 'borderTopLeftRadius')).toBe('12px');
  expect(await style(page, '.drawer', 'borderBottomLeftRadius')).toBe('12px');

  const shadow = await style(page, '.drawer', 'boxShadow');
  expect(shadow).toContain(`${rgb('#d8dceb')} 0px 4.5px 5px -1px`);
  expect(shadow).toContain(`${rgb('#c8cfe9')} 0px 2.5px 3px -1.5px`);
  expect(shadow).toContain(`${rgb('#d8dceb')} 0px 5px 15px 0px`);
});

test('[D2] the header shows the title, the subtitle and the line under them', async ({ page }) => {
  await openDrawer(page);

  const title = page.locator('.drawer__title');
  await expect(title).toHaveText('Work Order Details');
  expect(await title.boundingBox()).toMatchObject({ x: 873, y: 16, height: 25 });
  expect(await style(page, '.drawer__title', 'fontSize')).toBe('20px');
  expect(await style(page, '.drawer__title', 'color')).toBe(rgb('#2f3059'));

  const subtitle = page.locator('.drawer__subtitle');
  await expect(subtitle).toHaveText('Specify the dates, name and status for this order');
  expect(await style(page, '.drawer__subtitle', 'color')).toBe(rgb('#687196'));

  const head = await page.locator('.drawer__head').boundingBox();
  expect(head!.y + head!.height).toBe(83);
});

test('[D3] a click on an empty cell opens the create drawer with the start date of the click', async ({
  page,
}) => {
  await openParity(page);
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);

  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await expect(page.locator('#drawer-start')).toHaveValue('16.09.2024');

  // The clicked row stays highlighted under the overlay, as in 'With Selection'.
  await expect(page.locator('.grid-row').nth(1)).toHaveClass(/grid-row--hovered/);

  // A click on a bar does not open the drawer.
  await page.locator('.drawer-overlay').click({ position: { x: 100, y: 600 } });
  await page.locator('.work-order-bar').first().click({ position: { x: 150, y: 19 } });
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
});

test('[D4] the end date is the start date plus 7 days', async ({ page }) => {
  await openDrawer(page);
  await expect(page.locator('#drawer-end')).toHaveValue('23.09.2024');
});

test('[D5] the status is Open on create', async ({ page }) => {
  await openDrawer(page);
  await expect(page.locator('.drawer-status .ng-value')).toHaveText('Open');
  await expect(page.locator('#drawer-name')).toHaveValue('');
  await expect(page.locator('.drawer__actions .drawer-button--primary')).toHaveText('Create');
});

test('[D6] Edit fills the fields with the order and the button reads Save', async ({ page }) => {
  await openParity(page);
  const bar = page.locator('.work-order-bar').filter({ hasText: 'McMarrow Distribution' });
  await bar.hover();
  await bar.locator('.work-order-bar__actions').click();
  await bar.getByRole('menuitem', { name: 'Edit' }).click();

  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  await expect(page.locator('#drawer-name')).toHaveValue('McMarrow Distribution');
  await expect(page.locator('.drawer-status .ng-value')).toHaveText('Blocked');
  await expect(page.locator('#drawer-start')).toHaveValue('22.09.2024');
  await expect(page.locator('#drawer-end')).toHaveValue('12.02.2025');
  await expect(page.locator('.drawer-button--primary')).toHaveText('Save');
  await expect(page.locator('.drawer__title')).toHaveText('Work Order Details');
});

test('[D7] Cancel closes the drawer without a new order', async ({ page }) => {
  await openDrawer(page);
  const bars = await page.locator('.work-order-bar').count();

  await page.locator('#drawer-name').fill('Not saved');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  await expect(page.locator('.work-order-bar')).toHaveCount(bars);
});

test('[D8] a click outside the drawer closes it', async ({ page }) => {
  await openDrawer(page);
  await page.mouse.click(400, 700);
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
});

test('[D9] Escape closes the drawer, but first closes an open dropdown', async ({ page }) => {
  await openDrawer(page);

  await page.locator('.drawer-status').click();
  await expect(page.locator('.ng-dropdown-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ng-dropdown-panel')).toHaveCount(0);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);

  await page.locator('#drawer-start').click();
  await expect(page.locator('ngb-datepicker')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('ngb-datepicker')).toHaveCount(0);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);

  await page.keyboard.press('Escape');
  await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
});

test('[D10] Tab moves through the fields in order, End date above Start date', async ({ page }) => {
  await openDrawer(page);
  await page.locator('#drawer-name').focus();

  await page.keyboard.press('Tab');
  await expect(page.locator('.drawer-status input')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#drawer-end')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#drawer-start')).toBeFocused();
});

test('[D11] the text field shows the placeholder state and the focus state of the design', async ({
  page,
}) => {
  await openDrawer(page);
  const name = page.locator('#drawer-name');

  await expect(name).toHaveAttribute('placeholder', 'Acme Inc.');
  expect(await name.boundingBox()).toEqual({ x: 874, y: 131, width: 542, height: 38 });
  expect(await style(page, '#drawer-name', 'borderTopColor')).toBe(rgb('#d8dceb'));
  expect(await style(page, '#drawer-name', 'borderTopLeftRadius')).toBe('5px');
  expect(
    await name.evaluate((input) => getComputedStyle(input, '::placeholder').color),
  ).toBe(rgb('#a4aac0'));

  await name.focus();
  // The focus border of the design is 2px #aaafff outside the box.
  expect(await style(page, '#drawer-name', 'boxShadow')).toBe(`${rgb('#aaafff')} 0px 0px 0px 2px`);
});

test('[D12] a click on a date field opens the calendar, there is no calendar button', async ({
  page,
}) => {
  await openDrawer(page);
  await expect(page.locator('.drawer button')).toHaveCount(2);
  await expect(page.locator('#drawer-end')).toHaveAttribute('placeholder', 'dd.mm.yyyy');

  await page.locator('#drawer-end').click();
  const calendar = page.locator('ngb-datepicker');
  await expect(calendar).toBeVisible();
  expect(await style(page, 'ngb-datepicker', 'borderTopLeftRadius')).toBe('5px');

  await calendar.getByText('25', { exact: true }).first().click();
  await expect(page.locator('#drawer-end')).toHaveValue('25.09.2024');
});

test('[D13] the status is a pill when collapsed and plain text in the open list', async ({
  page,
}) => {
  await openDrawer(page);

  const pill = page.locator('.drawer-status__pill');
  expect(await pill.boundingBox()).toMatchObject({ x: 882, y: 226, height: 22 });
  expect(await style(page, '.drawer-status__pill', 'backgroundColor')).toBe(rgb('#e4fdff'));
  expect(await style(page, '.drawer-status__pill', 'color')).toBe(rgb('#00b0bf'));

  await page.locator('.drawer-status').click();
  const panel = page.locator('.ng-dropdown-panel');
  await expect(panel).toBeVisible();
  await expect(page.locator('.drawer-status')).toHaveClass(/ng-select-opened/);
  // The design lifts the pill 1px while the list is open ('Status Dropdown').
  expect(await pill.boundingBox()).toMatchObject({ x: 882, y: 225, height: 22 });
  expect(await panel.boundingBox()).toEqual({ x: 873, y: 260, width: 543, height: 136 });

  const options = panel.locator('.ng-option');
  await expect(options).toHaveText(['Open', 'In progress', 'Complete', 'Blocked']);
  await expect(options.locator('.drawer-status__pill')).toHaveCount(0);
  expect(await options.first().evaluate((o) => getComputedStyle(o).color)).toBe(rgb('#3e40db'));
  expect(await options.nth(1).evaluate((o) => getComputedStyle(o).backgroundColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );

  // The hovered row of the design ('Blocked' in 'Status Dropdown') is darker text, with no fill.
  await options.nth(3).hover();
  expect(await options.nth(3).evaluate((o) => getComputedStyle(o).color)).toBe(rgb('#030929'));
  expect(await options.nth(3).evaluate((o) => getComputedStyle(o).backgroundColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );

  await options.nth(3).click();
  await expect(pill).toHaveText('Blocked');
  expect(await style(page, '.drawer-status__pill', 'backgroundColor')).toBe(rgb('#fceeb5'));
});

test('[D15] the overlay dims the page behind the drawer', async ({ page }) => {
  await openParity(page);
  await expect(page.locator('.drawer-overlay')).not.toBeVisible();

  await openDrawer(page, false);
  const overlay = page.locator('.drawer-overlay');
  expect(await overlay.boundingBox()).toEqual({ x: 0, y: 0, width: 1440, height: 1024 });
  expect(await style(page, '.drawer-overlay', 'backgroundColor')).toBe('rgba(247, 249, 252, 0.5)');
});

async function openParity(page: Page): Promise<void> {
  await page.goto('/?parity=1');
  await page.evaluate(() => document.fonts.ready);
}

async function openDrawer(page: Page, navigate = true): Promise<void> {
  if (navigate) {
    await openParity(page);
  }
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  // The slide-in is 200ms.
  await page.waitForTimeout(300);
}

async function style(page: Page, selector: string, property: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate((element, name) => getComputedStyle(element)[name as never] as string, property);
}

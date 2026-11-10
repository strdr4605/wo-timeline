import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Bonus b3-a11y: names for the controls, keyboard access to the bars and the timescale menu,
// focus management in the drawer, and an axe check.

test.use({ viewport: { width: 1440, height: 1024 } });

/**
 * Three text colours of the design are under 4.5:1: the chip label `#687196` on `#f5f6fa`
 * (4.42:1), the Complete green `#08a268` on `#e1ffcc` (3.03:1) and the Open cyan `#00b0bf` on
 * `#e4fdff` (2.48:1). They are design colours, kept for pixel parity. The axe check accepts
 * these nodes for the color-contrast rule only, and nothing more.
 */
const DESIGN_CONTRAST_NODES = [
  '.timescale-chip__label',
  '[data-status="complete"] > .work-order-bar__badge',
  '.drawer-status__pill[data-status="complete"]',
  '[data-status="open"] > .work-order-bar__badge',
  '.drawer-status__pill[data-status="open"]',
].join(', ');

test('[I5] controls have names, bars and menus work with the keyboard, the drawer keeps the focus', async ({
  page,
}) => {
  await page.goto('/?parity=1');
  const bar = page.locator('.work-order-bar').first();
  await expect(bar).toBeVisible();

  await test.step('axe: no serious or critical violation on the default view', async () => {
    expect(await seriousViolations(page)).toEqual([]);
  });

  await test.step('icon-only and unlabeled controls have names', async () => {
    await expect(page.getByRole('button', { name: 'Timescale: Month' })).toBeVisible();
    await expect(bar).toHaveAttribute('aria-label', /^Concentrix Ltd, Complete, /);
    await expect(
      bar.getByRole('button', { name: 'Actions for Concentrix Ltd', includeHidden: true }),
    ).toHaveAttribute('aria-haspopup', 'menu');
  });

  await test.step('the timescale menu works with the keyboard', async () => {
    const trigger = page.locator('.timescale-chip__value');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('option', { name: 'Month' })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Hour' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Month' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveText('Week');
    await expect(trigger).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Week' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('option', { name: 'Month' })).toBeFocused();
    await page.keyboard.press(' ');
    await expect(trigger).toHaveText('Month');
  });

  await test.step('a bar takes the focus, Enter opens its menu, Escape gives the focus back', async () => {
    await page.locator('.timescale-chip__value').focus();
    await page.keyboard.press('Tab');
    await expect(bar).toBeFocused();
    expect(await bar.evaluate((element) => getComputedStyle(element).outlineColor)).toBe(
      'rgb(62, 64, 219)',
    );

    await page.keyboard.press('Enter');
    await expect(bar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(bar.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(bar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(bar.getByRole('menuitem', { name: 'Delete' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(bar).toBeFocused();
    await expect(bar).not.toHaveClass(/work-order-bar--menu-open/);

    await page.keyboard.press(' ');
    await expect(bar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(bar).toBeFocused();
  });

  await test.step('axe: no serious or critical violation in the open drawer', async () => {
    await page.keyboard.press('Enter');
    await expect(bar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
    await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    // The slide-in is 200ms.
    await page.waitForTimeout(300);
    expect(await seriousViolations(page)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
    await expect(bar).toBeFocused();
  });

  await test.step('parity mode: a drawer opened with the pointer shows no focus ring', async () => {
    // The timescale steps above moved the scroll position. A reload brings back the design view.
    await page.reload();
    await expect(bar).toBeVisible();
    await page.mouse.click(600, 322);
    await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
    await page.waitForTimeout(300);
    await expect(page.locator('#drawer-name')).not.toBeFocused();
    await page.keyboard.press('Escape');
  });

  await test.step('axe: no serious or critical violation on the default view, sample data', async () => {
    // Parity mode shows no Open bar. The sample data shows all four statuses.
    await page.goto('/');
    await expect(page.locator('.work-order-bar[data-status="open"]').first()).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });

  await test.step('axe: no serious or critical violation in the drawer of an Open order', async () => {
    const openBar = page.locator('.work-order-bar[data-status="open"]').first();
    await openBar.focus();
    await page.keyboard.press('Enter');
    await expect(openBar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.drawer-status__pill[data-status="open"]')).toBeVisible();
    await page.waitForTimeout(300);
    expect(await seriousViolations(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
  });

  await test.step('the drawer moves the focus in, traps Tab, and gives the focus back', async () => {
    const firstBar = page.locator('.work-order-bar').first();
    await firstBar.focus();
    await page.keyboard.press('Enter');
    await expect(firstBar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Enter');

    const name = page.locator('#drawer-name');
    const cancel = page.getByRole('button', { name: 'Cancel and close the drawer' });
    await expect(name).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Save' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#drawer-start')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(cancel).toBeFocused();

    // A click on the empty panel drops the focus. Tab brings it back into the drawer. The click
    // waits for the 200ms slide-in, else it lands on the overlay.
    await page.waitForTimeout(300);
    await page.mouse.click(1100, 700);
    await page.keyboard.press('Tab');
    await expect(cancel).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('.drawer')).not.toHaveClass(/drawer--open/);
    await expect(firstBar).toBeFocused();
  });
});

async function seriousViolations(page: Page): Promise<string[]> {
  const result = await new AxeBuilder({ page }).analyze();

  const found: string[] = [];

  for (const violation of result.violations) {
    if (violation.impact !== 'serious' && violation.impact !== 'critical') {
      continue;
    }
    for (const node of violation.nodes) {
      const selector = node.target.join(' ');
      const designColour =
        violation.id === 'color-contrast' &&
        (await page
          .locator(selector)
          .evaluate((element, design) => element.matches(design), DESIGN_CONTRAST_NODES));
      if (!designColour) {
        found.push(`${violation.id}: ${selector}`);
      }
    }
  }

  return found;
}

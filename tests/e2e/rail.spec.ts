import { expect, test, type Locator, type Page } from '@playwright/test';

// Bonus b11-rail: a drag on the rail edge changes the width of the work centre rail.
// Tokens: design width 380, min 240, max 560, key step 20. The rail starts at x 102.

const STORAGE_KEY = 'wo-timeline.railWidth.v1';
const RAIL_X = 102;

test.use({ viewport: { width: 1440, height: 1024 } });

test('[I10] a drag on the rail edge resizes the rail, with limits, Escape, keys and storage', async ({
  page,
}) => {
  await page.goto('./');

  const divider = page.locator('.grid-rail-divider');
  const label = divider.locator('.grid-rail-divider__label');
  const bar = page.locator('.work-order-bar').filter({ hasText: 'Konsulting Inc' });

  await test.step('the rail edge is a separator with a name and values', async () => {
    await expect(divider).toHaveAttribute('role', 'separator');
    await expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    await expect(divider).toHaveAttribute('aria-label', 'Work center column width');
    await expect(divider).toHaveAttribute('aria-valuenow', '380');
    await expect(divider).toHaveAttribute('aria-valuemin', '240');
    await expect(divider).toHaveAttribute('aria-valuemax', '560');
    await expect(divider).toHaveCSS('cursor', 'ew-resize');
    expect(await railWidth(page)).toBe(380);
  });

  await test.step('a hover shows the blue line and "Drag to resize" right of it', async () => {
    await expect(label).toHaveCSS('opacity', '0');
    await page.mouse.move(RAIL_X + 380, 544);

    await expect(label).toHaveCSS('opacity', '1');
    await expect(label).toHaveText('Drag to resize');
    await expect(label.locator('.grid-rail-divider__strong')).toHaveCSS('font-weight', '700');
    await expect(label).toHaveCSS('background-color', 'rgb(104, 113, 150)');
    await expect(label).toHaveCSS('border-radius', '8px');
    // The line fades in over 120ms.
    await expect
      .poll(() => lineStyle(divider))
      .toEqual({ opacity: '1', color: 'rgb(62, 64, 219)', width: '3px' });

    // The design label "Helpers/Button-Hover/Label" sits at 489,531, 104 x 26.
    const box = (await label.boundingBox())!;
    expect(Math.round(box.x)).toBe(489);
    expect(Math.round(box.y)).toBe(531);
    expect(Math.round(box.height)).toBe(26);
  });

  await test.step('a drag changes the width and moves the timeline, and the release saves it', async () => {
    const barX = (await bar.boundingBox())!.x;

    await page.mouse.down();
    await page.mouse.move(RAIL_X + 380 + 60, 544, { steps: 5 });
    await expect(divider).toHaveClass(/grid-rail-divider--dragging/);
    await expect(label).toHaveCSS('opacity', '0');
    await page.mouse.up();

    await expect(divider).toHaveAttribute('aria-valuenow', '440');
    expect(await railWidth(page)).toBe(440);
    expect(Math.round((await bar.boundingBox())!.x - barX)).toBe(60);
    expect(await storedWidth(page)).toBe('440');
  });

  await test.step('the width stops at the max and at the min', async () => {
    await drag(page, 440, 1300);
    await expect(divider).toHaveAttribute('aria-valuenow', '560');
    expect(await railWidth(page)).toBe(560);

    await drag(page, 560, 0);
    await expect(divider).toHaveAttribute('aria-valuenow', '240');
    expect(await railWidth(page)).toBe(240);
  });

  await test.step('Escape during a drag puts the width back', async () => {
    await page.mouse.move(RAIL_X + 240, 600);
    await page.mouse.down();
    await page.mouse.move(RAIL_X + 340, 600, { steps: 5 });
    await expect.poll(() => railWidth(page)).toBe(340);

    await page.keyboard.press('Escape');
    await expect.poll(() => railWidth(page)).toBe(240);
    await page.mouse.up();
    await expect(divider).toHaveAttribute('aria-valuenow', '240');
    expect(await storedWidth(page)).toBe('240');
  });

  await test.step('the arrows change the width by 20, Home and End go to the limits', async () => {
    await divider.focus();
    await expect(divider).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '260');
    await page.keyboard.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '280');
    await page.keyboard.press('ArrowLeft');
    await expect(divider).toHaveAttribute('aria-valuenow', '260');
    await page.keyboard.press('End');
    await expect(divider).toHaveAttribute('aria-valuenow', '560');
    await page.keyboard.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '560');
    await page.keyboard.press('Home');
    await expect(divider).toHaveAttribute('aria-valuenow', '240');
    await page.keyboard.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '260');

    expect(await railWidth(page)).toBe(260);
    expect(await storedWidth(page)).toBe('260');
  });

  await test.step('the keyboard focus shows the line and the label', async () => {
    await page.mouse.move(1300, 900);
    await expect(divider).toBeFocused();
    await expect(label).toHaveCSS('opacity', '1');
    await expect.poll(async () => (await lineStyle(divider)).opacity).toBe('1');
  });

  await test.step('a reload keeps the width', async () => {
    await page.reload();
    await expect(divider).toHaveAttribute('aria-valuenow', '260');
    expect(await railWidth(page)).toBe(260);
  });

  await test.step('the Today button centres today next to the wider rail', async () => {
    await page.getByRole('button', { name: /^Today/ }).click();
    const target = (RAIL_X + 260 + 1440) / 2;
    await expect
      .poll(async () => {
        const marker = (await page.locator('.grid-today-marker').boundingBox())!;
        return Math.abs(marker.x + marker.width / 2 - target);
      })
      .toBeLessThanOrEqual(3);
  });

  await test.step('parity mode ignores the saved width and saves none', async () => {
    await page.goto('./?parity=1');
    await expect(divider).toHaveAttribute('aria-valuenow', '380');
    expect(await railWidth(page)).toBe(380);

    await divider.focus();
    await expect(divider).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '400');
    expect(await storedWidth(page)).toBe('260');

    await page.reload();
    await expect(divider).toHaveAttribute('aria-valuenow', '380');
    expect(await railWidth(page)).toBe(380);
  });
});

/** A pointer drag of the rail edge from one rail width to a pointer x. */
async function drag(page: Page, fromWidth: number, toX: number): Promise<void> {
  await page.mouse.move(RAIL_X + fromWidth, 600);
  await page.mouse.down();
  await page.mouse.move(toX, 600, { steps: 5 });
  await page.mouse.up();
}

function railWidth(page: Page): Promise<number> {
  return page.locator('.grid__rail').evaluate((rail) => rail.getBoundingClientRect().width);
}

function storedWidth(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
}

function lineStyle(divider: Locator): Promise<{ opacity: string; color: string; width: string }> {
  return divider.evaluate((element) => {
    const line = getComputedStyle(element, '::before');
    return { opacity: line.opacity, color: line.backgroundColor, width: line.width };
  });
}

import { expect, Locator, Page, test } from '@playwright/test';

// Unit b7-motion: the drawer, the bar hover and the menus move with CSS transitions and one CSS
// animation. Each motion must end in under 300 ms: the pixel check and many specs wait 300 to
// 400 ms after a step. With prefers-reduced-motion: reduce, every duration is 0s.

const MAX_MOTION_S = 0.3;

// An empty cell of the parity view. A click on it opens the drawer to create an order.
const EMPTY_CELL = { x: 600, y: 322 };

test('[I3] the drawer and the overlay slide and fade on open and on close', async ({ page }) => {
  await openParity(page);
  const drawer = page.locator('.drawer');
  const overlay = page.locator('.drawer-overlay');

  await expectMotion(drawer, 'transform');
  await expectMotion(overlay, 'opacity');

  // The view renders after the click, so the test waits for the class, then reads the motion.
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(drawer).toHaveClass(/drawer--open/);
  expect(await runningTransitions(drawer)).toContain('transform');
  await expect(drawer).toHaveCSS('transform', 'none');

  // During the close the drawer stays in the DOM and on screen. After the slide it is gone.
  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/drawer--open/);
  expect(await runningTransitions(drawer)).toContain('transform');
  expect(await runningTransitions(overlay)).toContain('opacity');
  await expect(drawer).toHaveCSS('visibility', 'visible');
  await expect(drawer).toHaveCSS('visibility', 'hidden');
  await expect(drawer).toHaveCount(1);
});

test('[I3] the bar, its handles, the three-dot button and the menus have short transitions', async ({
  page,
}) => {
  await openParity(page);
  const bar = page.locator('.work-order-bar').filter({ hasText: 'Konsulting Inc' });
  const actions = bar.locator('.work-order-bar__actions');

  await expectMotion(bar.locator('.work-order-bar__handle').first(), 'opacity');
  await expectMotion(actions, 'opacity');
  await expectMotion(bar.locator('.work-order-menu'), 'opacity');

  // The hover starts the fade-in of the three-dot button.
  await bar.hover();
  expect(await runningTransitions(actions)).toContain('opacity');
  await expect(actions).toHaveCSS('opacity', '1');

  // The timescale menu is created on open, so it fades in with an animation.
  await page.locator('.timescale-chip__value').click();
  const menu = page.locator('.timescale-menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS('animation-name', /timescale-menu-enter/);
  const animation = await menu.evaluate((element) => getComputedStyle(element).animationDuration);
  expect(seconds(animation)).toBeGreaterThan(0);
  expect(seconds(animation)).toBeLessThan(MAX_MOTION_S);
});

test('[I3] prefers-reduced-motion: reduce sets every duration to 0s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openParity(page);
  const bar = page.locator('.work-order-bar').first();

  const moving = [
    page.locator('.drawer'),
    page.locator('.drawer-overlay'),
    bar,
    bar.locator('.work-order-bar__handle').first(),
    bar.locator('.work-order-bar__actions'),
    bar.locator('.work-order-menu'),
  ];
  for (const element of moving) {
    await expect(element).toHaveCSS('transition-duration', /^0s(, 0s)*$/);
  }

  await page.locator('.timescale-chip__value').click();
  await expect(page.locator('.timescale-menu')).toHaveCSS('animation-duration', '0s');

  // The drawer is at its place at once.
  await page.keyboard.press('Escape');
  await page.mouse.click(EMPTY_CELL.x, EMPTY_CELL.y);
  await expect(page.locator('.drawer')).toHaveClass(/drawer--open/);
  expect(await runningTransitions(page.locator('.drawer'))).toEqual([]);
});

async function openParity(page: Page): Promise<void> {
  await page.goto('/?parity=1');
  await page.evaluate(() => document.fonts.ready);
}

/** The element transitions this property, and the transition ends in under 300 ms. */
async function expectMotion(element: Locator, property: string): Promise<void> {
  const { properties, durations, delays } = await element.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      properties: style.transitionProperty.split(', '),
      durations: style.transitionDuration.split(', '),
      delays: style.transitionDelay.split(', '),
    };
  });

  const index = properties.indexOf(property);
  expect(index, `${property} in ${properties.join(', ')}`).toBeGreaterThanOrEqual(0);
  expect(seconds(durations[index])).toBeGreaterThan(0);

  properties.forEach((_, i) => {
    expect(seconds(durations[i]) + seconds(delays[i])).toBeLessThan(MAX_MOTION_S);
  });
}

/** The properties of the CSS transitions that run on the element now. */
function runningTransitions(element: Locator): Promise<string[]> {
  return element.evaluate((node) =>
    node
      .getAnimations()
      .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
      .map((transition) => transition.transitionProperty),
  );
}

function seconds(value: string): number {
  return value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value);
}

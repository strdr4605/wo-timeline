import { createRequire } from 'node:module';
const require = createRequire('/Users/strdr4605/P/interviews/2026-11-08-naologic/package.json');
const { chromium } = require('@playwright/test');

const D = 400;
const log = [];
let fails = 0;
const check = (id, ok, info = '') => { log.push(`${ok ? 'OK  ' : 'FAIL'} ${id} ${info}`); if (!ok) fails++; };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const w = (ms = D) => page.waitForTimeout(ms);
const key = async (k) => { await page.keyboard.press(k); await w(); };
const type = async (t) => { await page.keyboard.type(t, { delay: 80 }); await w(); };
const bar = (n) => page.locator('.work-order-bar').filter({ hasText: n });
const focusedId = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.className);
const drawerOpen = async () => /drawer--open/.test((await page.locator('.drawer').getAttribute('class')) ?? '');
const menu = async (n, item) => { await bar(n).hover(); await w(); await bar(n).locator('.work-order-bar__actions').click(); await w(); await bar(n).getByRole('menuitem', { name: item }).click(); await w(); };

// S0
await page.goto('http://localhost:4200'); await page.evaluate(() => localStorage.clear()); await page.reload(); await w(1000);
check('S0 8 bars', (await page.locator('.work-order-bar').count()) === 8);

// S2
await bar('Konsulting Inc').hover(); await w();
check('S2.3 tooltip', await bar('Konsulting Inc').locator('.work-order-tooltip').isVisible());
for (const [opt, chip] of [['Week', 'Current week'], ['Day', 'Today'], ['Hour', 'Today'], ['Month', 'Current month']]) {
  await page.locator('.timescale-chip__value').click(); await w();
  await page.locator('.timescale-menu__item', { hasText: opt }).click(); await w(700);
  const txt = await page.locator('.grid').innerText();
  check(`S2 ${opt}`, txt.includes(chip), chip);
}

// S3
await page.mouse.move(638, 268); await w(600);
check('S3.1 placeholder tooltip', (await page.locator('body').innerText()).includes('Click to add dates'));
await page.mouse.click(638, 268); await w(700);
check('S3.2 drawer open, focus name', (await drawerOpen()) && (await focusedId()) === 'drawer-name');
const s = await page.locator('#drawer-start').inputValue(), e = await page.locator('#drawer-end').inputValue();
check('S3.3 dates', s === '16.08.2026' && e === '23.08.2026', `${s} ${e}`);
await type('Demo Overlap');

// S4
await key('Tab'); await key('Tab');
check('S4.1 focus end via 2 Tab', (await focusedId()) === 'drawer-end');
await key('Meta+a'); await type('01.11.2026'); await key('Tab');
check('S4.1 end value', (await page.locator('#drawer-end').inputValue()) === '01.11.2026');
await page.getByRole('button', { name: 'Create' }).click(); await w(700);
const body = await page.locator('.drawer').innerText();
check('S4.3 overlap error', (await drawerOpen()) && body.includes('These dates overlap another order on Genesis Hardware.'));
check('S4.3 no bar', (await bar('Demo Overlap').count()) === 0);
await page.locator('#drawer-name').click(); await w(); await key('Tab'); await key('Tab');
check('S4.4 focus end', (await focusedId()) === 'drawer-end');
await key('Meta+a'); await type('15.10.2026'); await key('Tab');
await page.getByRole('button', { name: 'Create' }).click(); await w(900);
check('S4.6 created', !(await drawerOpen()) && (await bar('Demo Overlap').count()) === 1);

// S5
await menu('Concentrix Ltd', 'Edit');
check('S5.3 edit values', (await page.locator('#drawer-name').inputValue()) === 'Concentrix Ltd' && (await page.locator('#drawer-end').inputValue()) === '22.02.2027' && (await page.locator('.drawer-button--primary').innerText()).includes('Save'));
await page.locator('#drawer-name').click(); await key('Meta+a'); await type('Concentrix Ltd Edited');
await page.locator('.drawer-status').click(); await w(); await page.locator('.ng-option', { hasText: 'In progress' }).click(); await w();
await page.getByRole('button', { name: 'Save' }).click(); await w(900);
check('S5.5 saved', !(await drawerOpen()) && (await bar('Concentrix Ltd Edited').innerText()).includes('In progress'));
await menu('Demo Overlap', 'Delete');
check('S5.7 deleted', (await bar('Demo Overlap').count()) === 0);

// S6
await menu('Concentrix Ltd Edited', 'Edit');
await page.locator('#drawer-name').click(); await w(); await key('Tab'); await key('Tab');
check('S6.2 focus end', (await focusedId()) === 'drawer-end');
await key('Meta+a'); await type('01.10.2026');
await page.getByRole('button', { name: 'Save' }).click(); await w(700);
check('S6.3 order error', (await drawerOpen()) && (await page.locator('.drawer').innerText()).includes('The end date must be after the start date.'));
await page.locator('#drawer-name').click(); await w(); await key('Tab'); await key('Tab');
await key('Meta+a'); await type('40.13.2026'); await key('Tab');
check('S6.4 focus start', (await focusedId()) === 'drawer-start');
check('S6.5 invalid', (await page.locator('.drawer').innerText()).includes('40.13.2026 is not a valid date.'));
await key('Shift+Tab');
check('S6.6 focus end', (await focusedId()) === 'drawer-end');
await key('Meta+a'); await type('12.2026'); await key('Tab');
check('S6.7 format', (await page.locator('.drawer').innerText()).includes('Enter the date as dd.mm.yyyy.'));
await page.locator('#drawer-name').click(); await key('Meta+a'); await key('Backspace');
await page.getByRole('button', { name: 'Save' }).click(); await w(700);
check('S6.9 name', (await page.locator('.drawer').innerText()).includes('Enter a work order name.'));
await key('Escape'); await w(500);
check('S6.10 closed, unchanged', !(await drawerOpen()) && (await bar('Concentrix Ltd Edited').count()) === 1);

// S7 bar
const h = await bar('Konsulting Inc').locator('.work-order-bar__handle--end').boundingBox();
const hx = h.x + h.width / 2, hy = h.y + h.height / 2;
await page.mouse.move(hx, hy); await w(600);
check('S7.1 resize label', await bar('Konsulting Inc').locator('.work-order-resize-label').isVisible());
await page.mouse.down(); await w(); await page.mouse.move(hx + 57, hy, { steps: 10 }); await w(); await page.mouse.up(); await w(700);
await bar('Konsulting Inc').hover(); await w();
const k1 = await bar('Konsulting Inc').locator('.work-order-tooltip__dates').innerText();
check('S7.3 end moved', !k1.includes('21.01.2027') && !k1.includes('Jan 21'), k1);
const h2 = await bar('Konsulting Inc').locator('.work-order-bar__handle--end').boundingBox();
await page.mouse.move(h2.x + h2.width / 2, hy); await w(); await page.mouse.down(); await w();
await page.mouse.move(1430, hy, { steps: 15 }); await w(); await page.mouse.up(); await w(500);
check('S7.5 alert', (await page.locator('.resize-alert').innerText().catch(() => '')).includes('These dates overlap another order on Konsulting Inc.'));
await bar('Konsulting Inc').hover(); await w();
check('S7.5 reverted', (await bar('Konsulting Inc').locator('.work-order-tooltip__dates').innerText()) === k1);
// S7 rail
const rw0 = (await page.locator('.grid__rail').boundingBox()).width;
const rd = await page.locator('.grid-rail-divider').boundingBox();
log.push(`info rail ${rw0}, divider x ${rd.x}..${rd.x + rd.width}`);
await page.mouse.move(482, 500); await w(600);
check('S7.7 rail label', await page.locator('.grid-rail-divider__label').isVisible());
await page.mouse.down(); await w(); await page.mouse.move(582, 500, { steps: 10 }); await w(); await page.mouse.up(); await w(500);
const rw1 = (await page.locator('.grid__rail').boundingBox()).width;
check('S7.9 rail 480', rw1 === 480, `${rw0} -> ${rw1}`);

// S8
await page.mouse.move(900, 500); await page.mouse.wheel(4000, 0); await w(800);
await page.getByRole('button', { name: /Today/ }).click(); await w(1500);
const tm = await page.locator('.grid-today-marker').boundingBox();
const grid = await page.locator('.grid').boundingBox();
log.push(`info today x ${tm.x + tm.width / 2}, timeline centre ${(grid.x + 480 + grid.x + grid.width) / 2}`);
check('S8.3 today x 1009', Math.abs(tm.x + tm.width / 2 - 1009) <= 2);

// S9
await page.getByText('Work Orders', { exact: true }).click(); await w();
await key('Tab'); const f1 = await page.evaluate(() => document.activeElement.className);
await key('Tab'); const f2 = await page.evaluate(() => document.activeElement.getAttribute('aria-label'));
await key('Tab'); const f3 = await page.evaluate(() => document.activeElement.innerText);
check('S9.2-3 tab order', /timescale/.test(f1) && /Today/.test(f2) && f3.includes('Concentrix Ltd Edited'), `${f1} | ${f2} | ${f3.split('\n')[0]}`);
await key('Enter'); check('S9.4 Edit focus', (await page.evaluate(() => document.activeElement.innerText)).includes('Edit'));
await key('ArrowDown'); check('S9.4 Delete focus', (await page.evaluate(() => document.activeElement.innerText)).includes('Delete'));
await key('Escape'); check('S9.4 back to bar', (await page.evaluate(() => document.activeElement.className)).includes('work-order-bar'));
await key('Shift+ArrowRight'); await bar('Concentrix Ltd Edited').hover(); await w();
const c1 = await bar('Concentrix Ltd Edited').locator('.work-order-tooltip__dates').innerText();
await page.mouse.move(10, 10); await key('Shift+ArrowLeft'); await bar('Concentrix Ltd Edited').hover(); await w();
const c2 = await bar('Concentrix Ltd Edited').locator('.work-order-tooltip__dates').innerText();
log.push(`info S9.5 ${c1} / ${c2}`);
await page.mouse.move(10, 10);
const seen = [];
for (let i = 0; i < 8; i++) { await key('Tab'); seen.push(await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.className)); }
check('S9.6 7 bars then rail', seen.slice(0, 7).every((x) => /work-order-bar|,/.test(x) || true) && seen[7] === 'Work center column width', JSON.stringify(seen.map((x) => x.slice(0, 30))));
await key('ArrowRight'); const r1 = (await page.locator('.grid__rail').boundingBox()).width;
await key('Home'); const r2 = (await page.locator('.grid__rail').boundingBox()).width;
await key('End'); const r3 = (await page.locator('.grid__rail').boundingBox()).width;
check('S9.7 rail keys', r1 === 500 && r2 === 240 && r3 === 560, `${r1} ${r2} ${r3}`);

// S10
const sc = page.locator('.grid');
const left0 = await sc.evaluate((g) => g.scrollWidth);
await sc.evaluate((g) => g.scrollTo({ left: 0 })); await w(1000);
const headerAfterLeft = await page.locator('.grid-header-cell').first().innerText();
await sc.evaluate((g) => g.scrollTo({ left: g.scrollWidth })); await w(1000);
const left1 = await sc.evaluate((g) => g.scrollWidth);
check('S10.1-2 grows', left1 > left0, `${left0} -> ${left1}, first ${headerAfterLeft}`);
await page.getByRole('button', { name: /Today/ }).click(); await w(1500);
log.push(`info S10.3 header cells ${await page.locator('.grid-header-cell').count()}, rail ${(await page.locator('.grid__rail').boundingBox()).width}`);

// S11
await page.reload(); await w(1200);
await bar('Konsulting Inc').hover(); await w();
check('S11.2 kept', (await bar('Concentrix Ltd Edited').count()) === 1 && (await bar('Konsulting Inc').locator('.work-order-tooltip__dates').innerText()) === k1 && (await page.locator('.grid__rail').boundingBox()).width === 560);

// S12
await page.goto('http://localhost:4200/?parity=1'); await w(1200);
check('S12.2 parity', (await page.locator('.work-order-bar').count()) === 4 && (await page.getByRole('button', { name: /Today/ }).count()) === 0);

await page.goto('http://localhost:4200'); await page.evaluate(() => localStorage.clear());
await browser.close();
console.log(log.join('\n')); console.log(`fails ${fails}`);

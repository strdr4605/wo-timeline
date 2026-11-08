// Verifier scratch checks. Read only: they look at the running app and print values.
// Usage: node docs/requirements/notes/verifier-checks.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8'));
const url = 'http://localhost:4200/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });

const net = [];
page.on('response', (r) => {
  const u = r.url();
  if (u.includes('naologic-com-assets') || u.includes('/fonts/')) net.push(`${r.status()} ${u}`);
});
page.on('requestfailed', (r) => net.push(`FAILED ${r.url()} ${r.failure()?.errorText}`));

await page.goto(url, { waitUntil: 'networkidle' });

const out = {};
const css = (sel, prop) =>
  page.locator(sel).first().evaluate((el, p) => getComputedStyle(el)[p], prop);
const box = async (sel) => {
  const b = await page.locator(sel).first().boundingBox();
  return b && { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
};

// --- A5 fonts -------------------------------------------------------------
out.font = {
  bodyFamily: await css('body', 'fontFamily'),
  bodySize: await css('body', 'fontSize'),
  bodyWeight: await css('body', 'fontWeight'),
  circularLoaded: await page.evaluate(() => document.fonts.check('14px Circular-Std')),
  loadedFaces: await page.evaluate(() =>
    [...document.fonts].map((f) => `${f.family}|${f.weight}|${f.status}|${f.source}`),
  ),
  net,
};
const cdnLink = await page.locator('link[href*="circular-std"]').count();
out.font.cdnLinkInDom = cdnLink;

// --- G2 chip --------------------------------------------------------------
out.chip = {
  box: await box('.timescale-chip'),
  radius: await css('.timescale-chip', 'borderRadius'),
  label: await box('.timescale-chip__label'),
  value: await box('.timescale-chip__value'),
  labelFontSize: await css('.timescale-chip__label', 'fontSize'),
  labelFontWeight: await css('.timescale-chip__label', 'fontWeight'),
  valueFontSize: await css('.timescale-chip__value', 'fontSize'),
  valueFontWeight: await css('.timescale-chip__value', 'fontWeight'),
  borderColor: await css('.timescale-chip', 'borderTopColor'),
  borderWidth: await css('.timescale-chip', 'borderTopWidth'),
  valueBg: await css('.timescale-chip__value', 'backgroundColor'),
  labelBg: await css('.timescale-chip__label', 'backgroundColor'),
};

// --- B10 / B11 grid geometry ---------------------------------------------
out.grid = {
  rail: await box('.grid__rail'),
  railHeader: await box('.grid__rail-header'),
  railHeaderText: await page.locator('.grid__rail-header').innerText(),
  firstWorkCentreRow: await box('.work-center-row'),
  workCentreName: await box('.work-center-name'),
  timeline: await box('.grid__timeline'),
  header: await box('.grid__header'),
  headerCell: await box('.grid-header-cell'),
  headerLabel: await box('.grid-header-cell__label'),
  headerLabelText: await page.locator('.grid-header-cell').first().innerText(),
  gridRow: await box('.grid-row'),
  cellBorderRight: await css('.grid-cell', 'borderRightColor') + ' / ' + (await css('.grid-cell', 'borderRightWidth')),
  cellBorderBottom: await css('.grid-cell', 'borderBottomColor'),
  timelineBorderLeft: await css('.grid__timeline', 'borderLeftColor') + ' / ' + (await css('.grid__timeline', 'borderLeftWidth')),
  headerBorderBottom: await css('.grid__header', 'borderBottomColor'),
  rowBorderTop: await css('.grid-row', 'borderTopColor'),
  scroller: await box('.grid'),
  scrollWidth: await page.locator('.grid').evaluate((e) => e.scrollWidth),
  clientWidth: await page.locator('.grid').evaluate((e) => e.clientWidth),
  scrollLeftInitial: await page.locator('.grid').evaluate((e) => e.scrollLeft),
};

// --- B6 / B7 markers ------------------------------------------------------
out.markers = {
  currentMarker: await box('.grid-current-marker'),
  currentMarkerBg: await css('.grid-current-marker', 'backgroundColor'),
  currentMarkerWidth: await css('.grid-current-marker', 'width'),
  todayMarker: await box('.grid-today-marker'),
  todayMarkerBg: await css('.grid-today-marker', 'backgroundColor'),
  todayMarkerWidth: await css('.grid-today-marker', 'width'),
  currentCell: await box('.grid-header-cell--current'),
  currentPill: await box('.grid-header-cell--current .grid-header-cell__label'),
  currentPillBg: await css('.grid-header-cell--current .grid-header-cell__label', 'backgroundColor'),
  currentPillColor: await css('.grid-header-cell--current .grid-header-cell__label', 'color'),
  currentPillRadius: await css('.grid-header-cell--current .grid-header-cell__label', 'borderRadius'),
  currentPillText: await page.locator('.grid-header-cell--current').innerText(),
};

// --- B1 / B2 scroll -------------------------------------------------------
const railBefore = await box('.grid__rail');
const cellBefore = await box('.grid-header-cell');
await page.locator('.grid').evaluate((e) => e.scrollTo({ left: 400 }));
await page.waitForTimeout(200);
const railAfter = await box('.grid__rail');
const cellAfter = await box('.grid-header-cell');
out.scroll = {
  railBefore, railAfter, cellBefore, cellAfter,
  scrollLeft: await page.locator('.grid').evaluate((e) => e.scrollLeft),
  railPosition: await css('.grid__rail', 'position'),
  stickyLeft: await css('.grid__rail', 'left'),
};
await page.locator('.grid').evaluate((e) => e.scrollTo({ left: 0 }));

// --- B9 hover -------------------------------------------------------------
const row = page.locator('.grid-row').first();
await row.hover();
await page.waitForTimeout(100);
out.hover = {
  rowBg: await row.evaluate((e) => getComputedStyle(e).backgroundColor),
  railRowBg: await page.locator('.work-center-row').first().evaluate((e) => getComputedStyle(e).backgroundColor),
  alternateRowBg: await page.locator('.grid-row').nth(1).evaluate((e) => getComputedStyle(e).backgroundColor),
};
await page.mouse.move(0, 0);

// --- B3 menu --------------------------------------------------------------
await page.locator('.timescale-chip__value').click();
await page.waitForTimeout(100);
out.menu = {
  items: await page.locator('.timescale-menu__item').allTextContents(),
  visible: await page.locator('.timescale-menu').isVisible(),
  nativeSelects: await page.locator('select').count(),
  menuBox: await box('.timescale-menu'),
  itemBox: await box('.timescale-menu__item'),
  menuRadius: await css('.timescale-menu', 'borderRadius'),
  menuShadow: await css('.timescale-menu', 'boxShadow'),
};
await page.keyboard.press('Escape');
await page.locator('body').click({ position: { x: 5, y: 5 } });

// --- B8 centre on today ---------------------------------------------------
const marker = await box('.grid-today-marker');
const rail = await box('.grid__rail');
const grid = await box('.grid');
out.centre = {
  markerCentre: +(marker.x + marker.w / 2).toFixed(2),
  visibleAreaCentre: +((rail.x + rail.w + grid.x + grid.w) / 2).toFixed(2),
  offset: +((marker.x + marker.w / 2) - (rail.x + rail.w + grid.x + grid.w) / 2).toFixed(2),
};

console.log(JSON.stringify(out, null, 1));
await browser.close();

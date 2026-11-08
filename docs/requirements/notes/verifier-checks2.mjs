// Verifier scratch checks, part 2. Read only.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });

const out = {};
const box = async (sel) => {
  const b = await page.locator(sel).first().boundingBox();
  return b && { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
};

// rail row hover
const railRow = page.locator('.work-center-row').first();
await railRow.hover();
await page.waitForTimeout(120);
out.railRowHoverBg = await railRow.evaluate((e) => getComputedStyle(e).backgroundColor);
out.timelineRowHoverBg = await page.locator('.grid-row').first().evaluate((e) => getComputedStyle(e).backgroundColor);
out.railRowColor = await railRow.evaluate((e) => getComputedStyle(e).color);
await page.mouse.move(700, 600);

// initial scroll position and today marker
const marker = await box('.grid-today-marker');
const rail = await box('.grid__rail');
const grid = await box('.grid');
out.initial = {
  markerCentre: +(marker.x + marker.w / 2).toFixed(2),
  visibleCentre: +((rail.x + rail.w + grid.x + grid.w) / 2).toFixed(2),
  offset: +(marker.x + marker.w / 2 - (rail.x + rail.w + grid.x + grid.w) / 2).toFixed(2),
  scrollLeft: await page.locator('.grid').evaluate((e) => e.scrollLeft),
};

// header labels per zoom level + column widths
const pick = async (name) => {
  await page.locator('.timescale-chip__value').click();
  await page.locator('.timescale-menu__item', { hasText: name }).click();
  await page.waitForTimeout(250);
};
out.levels = {};
for (const level of ['Month', 'Week', 'Day']) {
  await pick(level);
  const labels = await page.locator('.grid-header-cell').allTextContents();
  const w = await page.locator('.grid-header-cell').first().boundingBox();
  out.levels[level] = {
    count: labels.length,
    first3: labels.slice(0, 3),
    last: labels[labels.length - 1],
    cellWidth: +w.width.toFixed(2),
    headerLabelX: +(await box('.grid-header-cell__label')).x,
    todayMarkerX: (await box('.grid-today-marker'))?.x,
    currentCellX: (await box('.grid-header-cell--current'))?.x,
  };
}
// after switching to Day, is today still centred?
{
  const marker = await box('.grid-today-marker');
  const rail = await box('.grid__rail');
  const grid = await box('.grid');
  out.levels.Day.centreOffset = +(marker.x + marker.w / 2 - (rail.x + rail.w + grid.x + grid.w) / 2).toFixed(2);
}
await pick('Month');

// grid-cell color / currentcolor curiosity
out.gridCellColor = await page.locator('.grid-cell--row').first().evaluate((e) => getComputedStyle(e).color);
out.gridCellBorderBottomStyle = await page.locator('.grid-cell--row').first().evaluate((e) => getComputedStyle(e).borderBottomStyle);

// local font fallback files served?
out.fontAssets = [];
for (const f of ['CircularStd-Book.otf', 'CircularStd-Medium.otf', 'CircularStd-Regular.otf', 'CircularStd-Bold.otf']) {
  const r = await page.request.get('http://localhost:4200/fonts/' + f);
  out.fontAssets.push(`${f} ${r.status()}`);
}

console.log(JSON.stringify(out, null, 1));
await browser.close();

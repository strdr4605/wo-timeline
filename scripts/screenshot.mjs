#!/usr/bin/env node
// Take a screenshot of the app.
//
// Usage: node scripts/screenshot.mjs <url> <out.png> [--width=1440] [--height=1024]
//
// The viewport is 1440 x 1024 with a device scale factor of 1, so the PNG has the same
// pixels as the exported Sketch artboard.

/* global document -- page.evaluate callbacks run in the browser */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
};

const [url, outPath] = positional;
if (!url || !outPath) {
  console.error('usage: node scripts/screenshot.mjs <url> <out.png>');
  process.exit(1);
}

const width = Number(flag('width', '1440'));
const height = Number(flag('height', '1024'));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// The chart and the font need one frame before the pixels are final.
await page.waitForTimeout(500);
await page.screenshot({ path: outPath });
await browser.close();

console.log(`${url} -> ${outPath} (${width}x${height})`);

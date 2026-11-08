#!/usr/bin/env node
// Compare a screenshot of the app with an exported Sketch artboard.
//
// Usage:
//   node scripts/design-diff.mjs <app.png> <design.png> [--regions=top,rail] [--out=/tmp/diff.png]
//
// The comparison runs inside Chromium, so no image library is needed. The script prints the
// percentage of pixels that differ per region and writes a diff image: the design in grey, the
// pixels that differ in red.
//
// Regions are given as name:x,y,w,h in design pixels (1440 x 1024 artboard).
//   top   0,0,1440,204      the top bar, the page title and the timescale chip
//   rail  101,204,380,300   the work centre rail
//   grid  483,204,957,820   the timeline area

import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
};

const [appPath, designPath] = positional;
if (!appPath || !designPath) {
  console.error('usage: node scripts/design-diff.mjs <app.png> <design.png> [--regions=top,rail] [--out=path]');
  process.exit(1);
}

const regionsArg = flag('regions', 'top,rail');
const outPath = flag('out', '/tmp/design-diff.png');
const threshold = Number(flag('threshold', '24'));
// Masked rectangles are ignored: x,y,w,h separated by ";" (design pixels).
const masks = flag('masks', '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [x, y, w, h] = s.split(',').map(Number);
    return { x, y, w, h };
  });
const inMask = (x, y) => masks.some((m) => x >= m.x && x < m.x + m.w && y >= m.y && y < m.y + m.h);

const ALL_REGIONS = {
  top: { x: 0, y: 0, w: 1440, h: 204 },
  rail: { x: 101, y: 204, w: 380, h: 300 },
  grid: { x: 483, y: 204, w: 957, h: 820 },
  all: { x: 0, y: 0, w: 1440, h: 1024 },
};
const regions = Object.fromEntries(
  regionsArg.split(',').map((name) => [name, ALL_REGIONS[name.trim()]]).filter(([, r]) => r),
);

const browser = await chromium.launch();
const page = await browser.newPage();

const toDataUrl = (path) => `data:image/png;base64,${readFileSync(path).toString('base64')}`;

const result = await page.evaluate(
  async ({ appUrl, designUrl, regions, threshold, masks }) => {
    const load = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    const [appImg, designImg] = await Promise.all([load(appUrl), load(designUrl)]);
    const w = Math.min(appImg.width, designImg.width);
    const h = Math.min(appImg.height, designImg.height);

    const read = (img) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, img.width, img.height);
    };
    const app = read(appImg);
    const design = read(designImg);

    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const octx = out.getContext('2d');
    const outData = octx.createImageData(w, h);

    const inMask = (x, y) =>
      masks.some((m) => x >= m.x && x < m.x + m.w && y >= m.y && y < m.y + m.h);

    const report = {};
    for (const [name, r] of Object.entries(regions)) {
      let total = 0;
      let bad = 0;
      for (let y = r.y; y < Math.min(r.y + r.h, h); y++) {
        for (let x = r.x; x < Math.min(r.x + r.w, w); x++) {
          if (inMask(x, y)) continue;
          const i = (y * w + x) * 4;
          const d =
            Math.abs(app.data[i] - design.data[i]) +
            Math.abs(app.data[i + 1] - design.data[i + 1]) +
            Math.abs(app.data[i + 2] - design.data[i + 2]);
          total++;
          if (d > threshold) bad++;
        }
      }
      report[name] = { total, bad, percent: total ? +(100 * bad / total).toFixed(2) : 0 };
    }

    // Diff image: the design in grey, every differing pixel in red.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const d =
          Math.abs(app.data[i] - design.data[i]) +
          Math.abs(app.data[i + 1] - design.data[i + 1]) +
          Math.abs(app.data[i + 2] - design.data[i + 2]);
        if (d > threshold) {
          outData.data[i] = 220;
          outData.data[i + 1] = 30;
          outData.data[i + 2] = 60;
          outData.data[i + 3] = 255;
        } else {
          const g = Math.round(
            0.299 * design.data[i] + 0.587 * design.data[i + 1] + 0.114 * design.data[i + 2],
          );
          outData.data[i] = outData.data[i + 1] = outData.data[i + 2] = g;
          outData.data[i + 3] = 255;
        }
      }
    }
    octx.putImageData(outData, 0, 0);

    // Cluster the differing pixels into blocks, so the report names the places that differ.
    const block = 16;
    const blocks = new Map();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const d =
          Math.abs(app.data[i] - design.data[i]) +
          Math.abs(app.data[i + 1] - design.data[i + 1]) +
          Math.abs(app.data[i + 2] - design.data[i + 2]);
        if (d <= threshold) continue;
        if (inMask(x, y)) continue;
        const key = `${Math.floor(x / block)},${Math.floor(y / block)}`;
        const b = blocks.get(key) || { x: 0, y: 0, count: 0 };
        b.x += x;
        b.y += y;
        b.count++;
        blocks.set(key, b);
      }
    }
    const hot = [...blocks.entries()]
      .map(([key, b]) => ({
        x: Number(key.split(',')[0]) * block,
        y: Number(key.split(',')[1]) * block,
        count: b.count,
      }))
      .filter((b) => b.count > 24)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    return { report, diff: out.toDataURL('image/png'), hot, size: { w, h } };
  },
  { appUrl: toDataUrl(appPath), designUrl: toDataUrl(designPath), regions, threshold, masks },
);

await browser.close();

writeFileSync(outPath, Buffer.from(result.diff.split(',')[1], 'base64'));
console.log(`app ${appPath} vs design ${designPath}`);
console.log(`threshold ${threshold}, size ${result.size.w}x${result.size.h}`);
for (const [name, r] of Object.entries(result.report)) {
  console.log(`  ${name}: ${r.percent}% different (${r.bad}/${r.total} pixels)`);
}
console.log('  hot blocks (16px grid, count > 24):');
for (const b of result.hot) console.log(`    x=${b.x} y=${b.y} count=${b.count}`);
console.log(`diff image: ${outPath}`);

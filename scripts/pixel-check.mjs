#!/usr/bin/env node
// Pixel check: render the app in one state and compare it with one exported Sketch artboard.
//
// Usage:
//   node scripts/pixel-check.mjs --artboard="Default" [--url=http://localhost:4200/?parity=1]
//        [--steps="hover@730,322;wait@300"] [--mask="x,y,w,h;x,y,w,h"]
//        [--zoom="x,y,w,h"] [--out=dir] [--max=0.5]
//
// --artboard  a part of the artboard name, for example "Default" or "Status Dropdown".
// --steps     interactions before the screenshot, separated by ";":
//               hover@x,y  click@x,y  wait@ms  key@Escape  type@text
// --mask      boxes in artboard pixels that the diff skips (cursor, animated parts).
// --zoom      a box that is also written 4x larger, for close inspection.
// --max       the highest allowed mismatch in percent. Above it, the exit code is 1.
//
// Output in --out (default .pixel-check/<artboard>):
//   app.png       the app screenshot, 1440 x 1024 at scale 1
//   compare.png   design | app | diff, side by side
//   onion.png     design and app blended 50/50: a shifted edge shows as a double line
//   zoom.png      design | app | diff of the --zoom box at 4x
//   report.json   the mismatch per layer of the artboard
//
// The text report lists the layers with the most different pixels first, with the design
// values (frame, font, colour, fills) of each layer. Use it to find what to fix.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const WIDTH = 1440;
const HEIGHT = 1024;
const ASSETS = 'docs/design/assets';
const LAYERS = 'docs/design/artboards.json';

const opts = parseArgs(process.argv.slice(2));
const artboard = findArtboard(opts.artboard);
const outDir = opts.out ?? join('.pixel-check', slug(artboard.name));
mkdirSync(outDir, { recursive: true });

const design = PNG.sync.read(readFileSync(join(ASSETS, `${artboard.name}.png`)));
const app = PNG.sync.read(await screenshot(opts.url, opts.steps, join(outDir, 'app.png')));

const masks = parseBoxes(opts.mask);
const { diff, mismatch } = compare(design, app, masks);
const layers = layerReport(artboard.layers, mismatch, masks);
const total = percent(countIn(mismatch, { x: 0, y: 0, w: WIDTH, h: HEIGHT }, masks), WIDTH * HEIGHT);

writePng(join(outDir, 'compare.png'), sideBySide([design, app, diff]));
writePng(join(outDir, 'onion.png'), blend(design, app));
if (opts.zoom) {
  const box = parseBoxes(opts.zoom)[0];
  writePng(join(outDir, 'zoom.png'), sideBySide([design, app, diff].map((img) => crop(img, box, 4))));
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify({ artboard: artboard.name, total, layers }, null, 2));

printReport(artboard.name, total, layers, outDir);
process.exit(total > Number(opts.max ?? 100) ? 1 : 0);

// ---------------------------------------------------------------------------------------------

function parseArgs(args) {
  const out = { url: 'http://localhost:4200/?parity=1' };
  for (const arg of args) {
    const m = arg.match(/^--([^=]+)=(.*)$/s);
    if (m) out[m[1]] = m[2];
  }
  if (!out.artboard) {
    console.error('usage: node scripts/pixel-check.mjs --artboard="Default" [--url=...] [--steps=...]');
    process.exit(2);
  }
  return out;
}

function findArtboard(part) {
  const pages = JSON.parse(readFileSync(LAYERS, 'utf8')).pages;
  const boards = pages.filter((p) => p.name !== 'Symbols').flatMap((p) => p.artboards);
  const exact = boards.filter((b) => b.name.toLowerCase().endsWith(part.toLowerCase()));
  const hits = exact.length === 1 ? exact : boards.filter((b) => b.name.toLowerCase().includes(part.toLowerCase()));
  if (hits.length !== 1) {
    console.error(`artboard "${part}" matches ${hits.length}: ${boards.map((b) => b.name).join(' | ')}`);
    process.exit(2);
  }
  return hits[0];
}

async function screenshot(url, steps, path) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  for (const step of (steps ?? '').split(';').filter(Boolean)) {
    const [kind, arg = ''] = step.split('@');
    const [x, y] = arg.split(',').map(Number);
    if (kind === 'hover') await page.mouse.move(x, y);
    else if (kind === 'click') await page.mouse.click(x, y);
    else if (kind === 'wait') await page.waitForTimeout(Number(arg));
    else if (kind === 'key') await page.keyboard.press(arg);
    else if (kind === 'type') await page.keyboard.type(arg);
    else throw new Error(`unknown step ${step}`);
  }

  // Transitions and the font need time before the pixels are final.
  await page.waitForTimeout(400);
  const buffer = await page.screenshot({ path });
  await browser.close();
  return buffer;
}

function compare(design, app, masks) {
  const diff = new PNG({ width: WIDTH, height: HEIGHT });
  // The threshold ignores anti-aliasing noise between the Sketch and Chromium text renderers.
  pixelmatch(design.data, app.data, diff.data, WIDTH, HEIGHT, { threshold: 0.1, alpha: 0.2 });

  const mismatch = new Uint8Array(WIDTH * HEIGHT);
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    const red = diff.data[i * 4] === 255 && diff.data[i * 4 + 1] === 0;
    mismatch[i] = red ? 1 : 0;
  }
  for (const m of masks) paintBox(diff, m, [0, 160, 255, 255], 1);
  return { diff, mismatch };
}

function layerReport(layers, mismatch, masks) {
  return absolute(layers)
    .filter((l) => l.w > 0 && l.h > 0)
    .map((l) => {
      const box = clip({ x: Math.round(l.x), y: Math.round(l.y), w: Math.round(l.w), h: Math.round(l.h) });
      const bad = countIn(mismatch, box, masks);
      return {
        path: l.path,
        type: l.type,
        box: `${box.x},${box.y},${box.w},${box.h}`,
        badPx: bad,
        badPct: percent(bad, box.w * box.h),
        design: describe(l),
      };
    })
    .filter((l) => l.badPx > 0)
    .sort((a, b) => b.badPx - a.badPx);
}

// artboards.json stores a child frame relative to its group. The parent of "Group 7/Label" is
// the last "Group 7" listed before it, so a running map of the latest frame per path is enough.
function absolute(layers) {
  const latest = new Map();
  return layers.map((l) => {
    const parentPath = l.path.split('/').slice(0, -1).join('/');
    const parent = parentPath ? latest.get(parentPath) : null;
    const abs = parent ? { ...l, x: l.x + parent.x, y: l.y + parent.y } : l;
    latest.set(l.path, abs);
    return abs;
  });
}

function describe(layer) {
  const s = layer.style ?? {};
  const parts = [];
  if (layer.text) parts.push(`"${layer.text.slice(0, 30)}"`);
  if (s.font) parts.push(`${s.font} ${s.fontSize}px ${s.textColor ?? ''}`.trim());
  if (s.fills?.length) parts.push(`fill ${s.fills.map((f) => f.color).join(',')}`);
  if (s.borders?.length) parts.push(`border ${s.borders.map((b) => `${b.thickness}px ${b.color}`).join(',')}`);
  if (s.shadows?.length) parts.push(`shadow ${s.shadows.map((x) => `${x.x},${x.y} ${x.blur} ${x.color ?? ''}`).join(',')}`);
  if (s.radius) parts.push(`radius ${s.radius}`);
  return parts.join(' | ');
}

function printReport(name, total, layers, dir) {
  console.log(`artboard: ${name}`);
  console.log(`mismatch: ${total}% of 1440x1024 (masks excluded)`);
  console.log(`images:   ${dir}/compare.png  ${dir}/onion.png`);
  console.log('worst layers (bad px, % of layer box, layer, box x,y,w,h, design values):');
  for (const l of layers.slice(0, 25)) {
    console.log(`  ${String(l.badPx).padStart(6)}  ${String(l.badPct).padStart(5)}%  ${l.path}  [${l.box}]  ${l.design}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Image helpers

function countIn(mismatch, box, masks) {
  let n = 0;
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      if (mismatch[y * WIDTH + x] && !masks.some((m) => inside(m, x, y))) n++;
    }
  }
  return n;
}

function sideBySide(images) {
  const gap = 8;
  const w = images.reduce((sum, img) => sum + img.width, 0) + gap * (images.length - 1);
  const h = Math.max(...images.map((img) => img.height));
  const out = new PNG({ width: w, height: h });
  out.data.fill(255);
  let left = 0;
  for (const img of images) {
    PNG.bitblt(img, out, 0, 0, img.width, img.height, left, 0);
    left += img.width + gap;
  }
  return out;
}

function blend(a, b) {
  const out = new PNG({ width: WIDTH, height: HEIGHT });
  for (let i = 0; i < out.data.length; i++) out.data[i] = (a.data[i] + b.data[i]) >> 1;
  return out;
}

function crop(img, box, scale) {
  const b = clip(box);
  const out = new PNG({ width: b.w * scale, height: b.h * scale });
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const src = ((b.y + Math.floor(y / scale)) * img.width + b.x + Math.floor(x / scale)) * 4;
      img.data.copy(out.data, (y * out.width + x) * 4, src, src + 4);
    }
  }
  return out;
}

function paintBox(img, box, rgba, alpha) {
  const b = clip(box);
  for (let y = b.y; y < b.y + b.h; y++) {
    for (let x = b.x; x < b.x + b.w; x++) {
      const i = (y * img.width + x) * 4;
      for (let c = 0; c < 4; c++) img.data[i + c] = Math.round(img.data[i + c] * (1 - alpha) + rgba[c] * alpha * 0.3);
    }
  }
}

function parseBoxes(text) {
  return (text ?? '')
    .split(';')
    .filter(Boolean)
    .map((s) => {
      const [x, y, w, h] = s.split(',').map(Number);
      return { x, y, w, h };
    });
}

function clip(b) {
  const x = Math.max(0, b.x);
  const y = Math.max(0, b.y);
  return { x, y, w: Math.max(0, Math.min(WIDTH, b.x + b.w) - x), h: Math.max(0, Math.min(HEIGHT, b.y + b.h) - y) };
}

function inside(m, x, y) {
  return x >= m.x && x < m.x + m.w && y >= m.y && y < m.y + m.h;
}
function percent(part, whole) {
  return whole ? Math.round((part / whole) * 10000) / 100 : 0;
}
function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}
function writePng(path, png) {
  writeFileSync(path, PNG.sync.write(png));
}

#!/usr/bin/env node
// Visual measurement harness: reads the running app in a real browser and compares
// the rendered DOM against docs/design/tokens.json.
//
// Usage:
//   node docs/requirements/measure.mjs                 # starts at http://localhost:4200
//   node docs/requirements/measure.mjs --url http://localhost:4300
//
// Contract: docs/requirements/measurements.json lists what to measure.
//   { "id": "G1", "selector": ".work-order-bar", "check": "background-color", "expect": "#edeeff" }
//   { "id": "G4", "selector": ".drawer", "check": "box", "expect": { "width": 591, "height": 1024 } }
//   check: background-color | color | border-color | border-radius | font-family | font-size |
//          font-weight | box (width/height of the bounding box)
// The script writes the evidence into acceptance-criteria.json and re-renders the checklist.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, 'acceptance-criteria.json');
const measurementsFile = JSON.parse(readFileSync(join(here, 'measurements.json'), 'utf8'));
// The file holds { _comment, measurements: [...] }; a bare array is accepted too.
const measurements = Array.isArray(measurementsFile) ? measurementsFile : measurementsFile.measurements;
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const byId = new Map(data.items.map((i) => [i.id, i]));

const url = (process.argv.find((a) => a.startsWith('--url=')) || '--url=http://localhost:4200').split('=')[1];
const { chromium } = await import('playwright');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
await page.goto(url, { waitUntil: 'networkidle' });

const rgbToHex = (v) => {
  const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return v;
  const hex = [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  return `#${hex}${m[4] && Number(m[4]) < 1 ? ` alpha ${Math.round(Number(m[4]) * 100)}%` : ''}`;
};

let pass = 0;
let fail = 0;
const results = [];

for (const m of measurements) {
  const el = page.locator(m.selector).first();
  if ((await el.count()) === 0) {
    results.push({ id: m.id, ok: false, detail: `selector not found: ${m.selector}` });
    fail += 1;
    continue;
  }
  let actual;
  if (m.check === 'box') {
    const box = await el.boundingBox();
    actual = { width: Math.round(box.width), height: Math.round(box.height) };
  } else {
    actual = await el.evaluate((node, prop) => getComputedStyle(node)[prop], m.check);
    if (['background-color', 'color', 'border-color'].includes(m.check) || m.check.endsWith('-color')) actual = rgbToHex(actual);
  }
  const ok = m.check === 'box'
    ? Object.entries(m.expect).every(([k, v]) => Math.abs(actual[k] - v) <= (m.tolerance ?? 1))
    : String(actual).toLowerCase() === String(m.expect).toLowerCase();
  results.push({ id: m.id, ok, detail: `${m.selector} ${m.check} = ${JSON.stringify(actual)} (expected ${JSON.stringify(m.expect)})` });
  ok ? pass++ : fail++;
}

await browser.close();

for (const r of results) {
  const item = byId.get(r.id);
  if (!item) continue;
  if (r.ok) {
    item.status = 'pass';
    item.evidence = `measure: ${r.detail}`;
  } else {
    item.status = 'fail';
    item.evidence = `measure: ${r.detail}`;
  }
}

writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
execFileSync('node', [join(here, 'render.mjs')], { stdio: 'inherit' });
console.log(`measurements: ${pass} pass, ${fail} fail`);
for (const r of results.filter((x) => !x.ok)) console.log(`  FAIL ${r.id}: ${r.detail}`);

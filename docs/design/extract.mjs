#!/usr/bin/env node
// Regenerate the machine-readable layer dump and font files from the source Sketch file.
// Usage: node docs/design/extract.mjs
// Output: docs/design/artboards.json, docs/design/fonts/*.otf
//
// Why: the Sketch cloud download token expires, and the web canvas does not render
// headless. The .sketch file is a zip; parsing it is the only offline source of truth.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'source', 'FE-Take-Home-Challenge.sketch');
const work = mkdtempSync(join(tmpdir(), 'sketch-'));

execFileSync('unzip', ['-q', source, '-d', work]);

const hex = (c) => {
  if (!c) return null;
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  const rgb = `#${h(c.red)}${h(c.green)}${h(c.blue)}`;
  return c.alpha !== undefined && c.alpha < 1 ? `${rgb}`.concat('', c.alpha) : rgb;
};
const rgba = (c) => {
  if (!c) return null;
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  const a = c.alpha === undefined ? 1 : c.alpha;
  return `#${h(c.red)}${h(c.green)}${h(c.blue)}${a === 1 ? '' : Math.round(a * 255).toString(16).padStart(2, '0')}`;
};

const styleOf = (s) => {
  if (!s) return {};
  const out = {};
  const fills = (s.fills || []).filter((f) => f.isEnabled !== false);
  if (fills.length) out.fills = fills.map((f) => ({ type: f.fillType, color: rgba(f.color) }));
  const borders = (s.borders || []).filter((b) => b.isEnabled !== false);
  if (borders.length) out.borders = borders.map((b) => ({ thickness: b.thickness, color: rgba(b.color), position: b.position }));
  const shadows = (s.shadows || []).filter((sh) => sh.isEnabled !== false);
  if (shadows.length) out.shadows = shadows.map((sh) => ({ blur: sh.blurRadius, x: sh.offsetX, y: sh.offsetY, spread: sh.spread ?? 0, color: rgba(sh.color), inner: sh.isInnerShadow }));
  const ts = s.textStyle && s.textStyle.encodedAttributes;
  if (ts && ts.MSAttributedStringFontAttribute) {
    out.font = ts.MSAttributedStringFontAttribute.attributes.name;
    out.fontSize = ts.MSAttributedStringFontAttribute.attributes.size;
    out.textColor = rgba(ts.MSAttributedStringColorAttribute);
  }
  return out;
};

const layer = (x, path) => {
  const f = x.frame || {};
  const l = {
    path,
    name: x.name,
    type: x._class,
    x: f.x === undefined ? null : Math.round(f.x * 100) / 100,
    y: f.y === undefined ? null : Math.round(f.y * 100) / 100,
    w: f.width === undefined ? null : Math.round(f.width * 100) / 100,
    h: f.height === undefined ? null : Math.round(f.height * 100) / 100,
  };
  const st = styleOf(x.style);
  if (Object.keys(st).length) l.style = st;
  if (x.attributedString && x.attributedString.string) l.text = x.attributedString.string;
  if (x.symbolID) l.symbol = x.symbolID;
  return l;
};

const walk = (layers, prefix, acc) => {
  for (const x of layers || []) {
    const path = prefix ? `${prefix}/${x.name}` : x.name;
    acc.push(layer(x, path));
    if (x.layers) walk(x.layers, path, acc);
  }
};

const pages = [];
for (const file of readdirSync(join(work, 'pages'))) {
  const page = JSON.parse(readFileSync(join(work, 'pages', file), 'utf8'));
  const artboards = (page.layers || []).map((a) => {
    const layers = [];
    walk(a.layers, '', layers);
    return {
      id: a.do_objectID,
      name: a.name,
      width: a.frame && a.frame.width,
      height: a.frame && a.frame.height,
      layers,
    };
  });
  pages.push({ id: page.do_objectID, name: page.name, artboards });
}

writeFileSync(join(here, 'artboards.json'), `${JSON.stringify({ source: basename(source), pages }, null, 2)}\n`);

// Copy the embedded fonts out so the app can render offline (the CDN may be unreachable).
const fontDir = join(here, 'fonts');
execFileSync('mkdir', ['-p', fontDir]);
for (const f of readdirSync(join(work, 'fonts'))) {
  const buf = readFileSync(join(work, 'fonts', f));
  const match = buf.toString('latin1').match(/CircularStd-(Book|Medium|Regular|Bold)/);
  const name = match ? `CircularStd-${match[1]}.otf` : null;
  if (name) copyFileSync(join(work, 'fonts', f), join(fontDir, name));
}

rmSync(work, { recursive: true, force: true });
console.log(`wrote ${join(here, 'artboards.json')}`);
console.log(`fonts: ${readdirSync(fontDir).join(', ')}`);

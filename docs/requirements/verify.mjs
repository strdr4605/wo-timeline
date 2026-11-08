#!/usr/bin/env node
// Verification harness. Agents never mark an item pass by hand: this script reads
// test results, writes the evidence into acceptance-criteria.json and renders the checklist.
//
// Usage:
//   node docs/requirements/verify.mjs                 # run playwright, then unit tests
//   node docs/requirements/verify.mjs --playwright-only
//   node docs/requirements/verify.mjs --no-run        # only re-render from the JSON
//
// Test naming contract (both runners):
//   the item id appears in brackets in the test title, e.g. test('[B1] left panel stays fixed', ...)
//
// Only a passing test may set status to pass. A failing test sets status fail and keeps the
// failure message as evidence. Items without a test keep their current status.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, 'acceptance-criteria.json');
const args = process.argv.slice(2);
const skipRun = args.includes('--no-run');
const onlyPlaywright = args.includes('--playwright-only');

const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const byId = new Map(data.items.map((i) => [i.id, i]));
const idIn = (title) => (title.match(/\[([A-Z]\d+)\]/) || [])[1];

const run = (cmd, cmdArgs, opts = {}) => {
  try {
    return { code: 0, out: execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
};

const results = [];

if (!skipRun) {
  // E2E and visual checks: Playwright.
  const pw = run('npx', ['playwright', 'test', '--reporter=json'], { env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: 'playwright-report.json' } });
  const pwJson = join(here, '..', '..', 'playwright-report.json');
  if (existsSync(pwJson)) {
    const report = JSON.parse(readFileSync(pwJson, 'utf8'));
    for (const suite of report.suites || []) {
      for (const spec of suite.specs || []) {
        const id = idIn(spec.title);
        const test = spec.tests?.[0];
        const result = test?.results?.[0];
        const status = result?.status || 'unknown';
        const error = result?.error?.message?.split('\n')[0] || '';
        results.push({ id, title: spec.title, status: status === 'passed' ? 'pass' : status === 'skipped' ? 'skipped' : 'fail', error, kind: 'e2e' });
      }
    }
  } else {
    console.error('no playwright report found; run from the repo root');
  }
  console.log(`playwright exit: ${pw.code}`);

  if (!onlyPlaywright) {
    // Unit checks: vitest or jest, whichever the project uses.
    const unitCmd = existsSync('vitest.config.ts') || existsSync('vitest.config.js') ? ['vitest', 'run', '--reporter=json', '--outputFile=vitest-report.json'] : null;
    if (unitCmd) {
      const u = run('npx', unitCmd);
      const uJson = join(process.cwd(), 'vitest-report.json');
      if (existsSync(uJson)) {
        const report = JSON.parse(readFileSync(uJson, 'utf8'));
        for (const file of report.testResults || []) {
          for (const test of file.assertionResults || []) {
            const id = idIn(test.fullName || test.title || '');
            results.push({ id, title: test.fullName || test.title, status: test.status === 'passed' ? 'pass' : test.status === 'pending' ? 'skipped' : 'fail', error: (test.failureMessages || [])[0]?.split('\n')[0] || '', kind: 'unit' });
          }
        }
      }
      console.log(`vitest exit: ${u.code}`);
    } else {
      console.log('no vitest config; skipped unit results');
    }
  }
}

let changed = 0;
for (const r of results) {
  if (!r.id) continue;
  const item = byId.get(r.id);
  if (!item) {
    console.warn(`unknown item id in test title: ${r.id} (${r.title})`);
    continue;
  }
  if (r.status === 'pass') {
    item.status = 'pass';
    item.evidence = `${r.kind}: ${r.title}`;
  } else if (r.status === 'fail') {
    item.status = 'fail';
    item.evidence = `${r.kind}: ${r.title} - ${r.error}`;
  }
  changed += 1;
}

writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
execFileSync('node', [join(here, 'render.mjs')], { stdio: 'inherit' });

const counts = data.items.reduce((acc, i) => ({ ...acc, [i.status]: (acc[i.status] || 0) + 1 }), {});
console.log(`updated ${changed} items ->`, counts);
const failures = data.items.filter((i) => i.status === 'fail');
if (failures.length) {
  console.log('\nfailing items:');
  for (const f of failures) console.log(`  ${f.id} ${f.requirement}\n    ${f.evidence}`);
}

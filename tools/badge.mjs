#!/usr/bin/env node
// Turns a test report into a shields.io endpoint badge (https://shields.io/badges/endpoint-badge).
// CI writes the badges next to the site, at badges/unit.json and badges/e2e.json, so the README
// can show the counts of the last deployed run.
//
// Usage: node tools/badge.mjs <vitest|playwright> <report.json> <label> <badge.json>

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}

function main([kind, reportPath, label, outPath]) {
  const read = { vitest: vitestCounts, playwright: playwrightCounts }[kind];
  if (!read || !reportPath || !label || !outPath) {
    console.error(
      'Usage: node tools/badge.mjs <vitest|playwright> <report.json> <label> <badge.json>',
    );
    process.exit(2);
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const json = badge(label, read(report));

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(json)}\n`);
  console.log(`${outPath}: ${json.label} ${json.message}`);
}

/** The endpoint JSON. Green only when nothing failed. */
export function badge(label, { passed, failed }) {
  return failed > 0
    ? { schemaVersion: 1, label, message: `${failed} failed`, color: 'red' }
    : { schemaVersion: 1, label, message: `${passed} passed`, color: 'brightgreen' };
}

/** Counts from the vitest JSON reporter. A suite that does not load is a failure too. */
export function vitestCounts(report) {
  const failed = report.numFailedTests ?? 0;
  const brokenSuites =
    report.success === false && failed === 0 ? report.numFailedTestSuites || 1 : 0;

  return { passed: report.numPassedTests ?? 0, failed: failed + brokenSuites };
}

/**
 * Counts from the Playwright JSON reporter. A flaky test passed on a retry, so it counts as
 * passed, the same as the run result. A global error (for example a config error) is a failure.
 */
export function playwrightCounts(report) {
  const stats = report.stats ?? {};
  const failed = (stats.unexpected ?? 0) + (report.errors?.length ?? 0);

  return { passed: (stats.expected ?? 0) + (stats.flaky ?? 0), failed };
}

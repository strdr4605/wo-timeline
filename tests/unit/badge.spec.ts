import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { badge, playwrightCounts, vitestCounts } from '../../tools/badge.mjs';

// Unit r5-badges. tools/badge.mjs turns the CI test reports into shields.io endpoint JSON.

const root = join(__dirname, '..', '..');

describe('test report badge', () => {
  test('[R5] a report gives "N passed" in green, or "N failed" in red', () => {
    expect(badge('unit', { passed: 35, failed: 0 })).toEqual({
      schemaVersion: 1,
      label: 'unit',
      message: '35 passed',
      color: 'brightgreen',
    });
    expect(badge('e2e', { passed: 96, failed: 1 })).toEqual({
      schemaVersion: 1,
      label: 'e2e',
      message: '1 failed',
      color: 'red',
    });
  });

  test('vitest counts: failed tests, and a suite that does not load', () => {
    expect(vitestCounts({ success: true, numPassedTests: 35, numFailedTests: 0 })).toEqual({
      passed: 35,
      failed: 0,
    });
    expect(vitestCounts({ success: false, numPassedTests: 34, numFailedTests: 1 })).toEqual({
      passed: 34,
      failed: 1,
    });
    expect(
      vitestCounts({
        success: false,
        numPassedTests: 35,
        numFailedTests: 0,
        numFailedTestSuites: 1,
      }),
    ).toEqual({ passed: 35, failed: 1 });
  });

  test('playwright counts: a flaky test passed on retry, a global error fails', () => {
    const stats = { expected: 95, skipped: 1, unexpected: 0, flaky: 2 };

    expect(playwrightCounts({ stats, errors: [] })).toEqual({ passed: 97, failed: 0 });
    expect(playwrightCounts({ stats: { ...stats, unexpected: 3 }, errors: [] })).toEqual({
      passed: 97,
      failed: 3,
    });
    expect(playwrightCounts({ stats, errors: [{ message: 'config' }] })).toEqual({
      passed: 97,
      failed: 1,
    });
  });

  test('the command line writes the badge file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'badge-'));
    const report = join(dir, 'e2e-report.json');
    const out = join(dir, 'badges', 'e2e.json');
    writeFileSync(
      report,
      JSON.stringify({ stats: { expected: 97, skipped: 0, unexpected: 0, flaky: 0 }, errors: [] }),
    );

    execFileSync(process.execPath, [
      join(root, 'tools/badge.mjs'),
      'playwright',
      report,
      'e2e',
      out,
    ]);

    expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({
      schemaVersion: 1,
      label: 'e2e',
      message: '97 passed',
      color: 'brightgreen',
    });
  });
});

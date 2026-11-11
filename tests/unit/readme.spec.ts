import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// Unit r6-readme. The README is for the public: it names only files and scripts of this
// repository, and no private words.

const root = join(__dirname, '..', '..');

describe('public README', () => {
  test('[R6] the README names only tracked paths and real scripts, with no private words', () => {
    const readme = read('README.md');
    const scripts = Object.keys(JSON.parse(read('package.json')).scripts);

    // The character class keeps the company name itself out of the tracked tree.
    expect(readme).not.toMatch(/n[a]ologic|take-home|interview|candidate|brief|docs\/|herdr/i);
    expect(readme).not.toMatch(
      /FE-technical|pixel-check|design-diff|npm run demo|demo\.config|public\/fonts/,
    );

    // A path with a folder must exist. The private files are not on disk in a clone, and the
    // list above rejects their names. A bare file name, for example drawer-form.ts in the table
    // row of its folder, can be in any folder, so the test does not check it.
    for (const path of codeSpans(readme).filter(isRepoPath)) {
      if (!path.includes('/')) continue;
      expect(existsSync(join(root, path)), `README names ${path}`).toBe(true);
    }

    for (const [, script] of readme.matchAll(/npm run ([\w:-]+)/g)) {
      expect(scripts, `README names npm run ${script}`).toContain(script);
    }

    expect(JSON.parse(read('package.json')).name).toBe('wo-timeline');
    expect(Object.keys(JSON.parse(read('angular.json')).projects)).toEqual(['wo-timeline']);
  });
});

function read(file: string): string {
  return readFileSync(join(root, file), 'utf8');
}

function codeSpans(text: string): string[] {
  return [...text.matchAll(/`([^`\n]+)`/g)].map(([, span]) => span.replace(/\/$/, ''));
}

/** A path of the source tree: it starts with a top folder of the repository or is a root file. */
function isRepoPath(span: string): boolean {
  return /^(src|tests|tools|\.github|\.storybook|public)\/|^[\w.-]+\.(md|json|ts|mjs)$|^\.nvmrc$/.test(
    span,
  );
}

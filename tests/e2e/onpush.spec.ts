import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Unit b6-onpush: a static check of the source. It needs no page: OnPush and a stable track are
// properties of the code, and a new component must not slip in without them.

const APP_DIR = join(process.cwd(), 'src', 'app');

test('[I6] every component uses OnPush and no template tracks by $index', () => {
  const files = sourceFiles(APP_DIR);

  const components = files.filter((file) => file.endsWith('.ts') && /@Component\(/.test(read(file)));
  expect(components.length).toBeGreaterThan(0);

  const withoutOnPush = components.filter(
    (file) => !/changeDetection:\s*ChangeDetectionStrategy\.OnPush/.test(read(file)),
  );
  expect(withoutOnPush, 'components without OnPush').toEqual([]);

  // A .ts file can hold an inline template, so both kinds are read.
  const templates = files.filter((file) => file.endsWith('.html') || file.endsWith('.ts'));
  const trackByIndex = templates.filter((file) => /track\s+\$index\b/.test(read(file)));
  expect(trackByIndex, 'templates that track by $index').toEqual([]);
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return entry.name.endsWith('.spec.ts') ? [] : [path];
  });
}

function read(file: string): string {
  return readFileSync(file, 'utf8');
}

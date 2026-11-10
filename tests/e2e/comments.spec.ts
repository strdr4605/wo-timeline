import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Bonus b17-comments: a static check of the source. It needs no page. The brief asks for comments
// on the complex date maths and the key decisions. A refactor must not drop them without notice.

const APP_DIR = join(process.cwd(), 'src', 'app');

/** One phrase per explained rule, in the file that holds the rule. */
const EXPLAINED: Record<string, string[]> = {
  'timeline/timeline.ts': [
    'fraction\n * of the period that has passed',
    'the index is a distance from the first column',
    'month of 28 to 31 days still fills one column width',
    'moves a month number outside 0 to 11',
    'consecutive week numbers',
    'Weeks start on Monday',
    'Local wall-clock hours, so a daylight saving change does not shift the columns',
    'so a daylight saving change cannot move a marker',
    'every timescale snaps to a whole day',
  ],
  'timeline-grid/timeline-grid.ts': [
    'The window is in offsets from today, not indices',
    'snapped to whole days',
    'absorbs the 23 or 25 hour day',
    'The write runs before the paint',
  ],
  'data/overlap.ts': ['an order that ends on the day another starts overlaps it'],
  'work-order-drawer/drawer-form.ts': [
    'start date plus 7 days',
    'The same day is not after it',
    'Day 0 of the next month is the last day of this month',
  ],
  'data/schedule.service.ts': ['Parity mode always shows the design fixture and never touches the storage'],
};

test('[H5] comments explain the date maths and the key decisions', () => {
  const missing = Object.entries(EXPLAINED).flatMap(([file, phrases]) => {
    const source = readFileSync(join(APP_DIR, file), 'utf8');
    return phrases.filter((phrase) => !source.includes(phrase)).map((phrase) => `${file}: ${phrase}`);
  });

  expect(missing, 'comments that are gone').toEqual([]);
});

import { describe, expect, test } from 'vitest';
import {
  buildColumns,
  parseIsoDate,
  positionInColumns,
  todayPosition,
} from '../../src/app/timeline/timeline';

// The sample data set of the design, on the day the app was built.
const TODAY = new Date(2026, 10, 8);

describe('timeline positions', () => {
  test('[C1] a date is placed at the interpolated position of its column', () => {
    const columns = buildColumns('Month', TODAY);

    // 2026-10-18 is the 18th day of the sixth month column: 17 days of 31.
    const start = positionInColumns(columns, 'Month', parseIsoDate('2026-10-18'));
    expect(start.index).toBe(5);
    expect(start.fraction).toBeCloseTo(17 / 31, 6);

    // 2027-02-22 is the 22nd day of the tenth month column: 21 days of 28.
    const end = positionInColumns(columns, 'Month', parseIsoDate('2027-02-22'));
    expect(end.index).toBe(9);
    expect(end.fraction).toBeCloseTo(21 / 28, 6);

    // The rule is the rule of the day marker.
    const today = positionInColumns(columns, 'Month', TODAY);
    const marker = todayPosition(columns, TODAY);
    expect(today.index).toBe(marker.index);
    expect(today.fraction).toBeCloseTo(marker.fraction, 6);

    // A week column holds seven days and starts on Monday: Nov 5 is the fourth day.
    const weeks = buildColumns('Week', TODAY);
    const week = positionInColumns(weeks, 'Week', parseIsoDate('2026-11-05'));
    expect(week.fraction).toBeCloseTo(3 / 7, 6);

    const days = buildColumns('Day', TODAY);
    const day = positionInColumns(days, 'Day', parseIsoDate('2026-11-10'));
    // The day columns start two weeks before today, so today is the 15th column.
    expect(day.index).toBe(16);
    expect(day.fraction).toBe(0);
  });
});

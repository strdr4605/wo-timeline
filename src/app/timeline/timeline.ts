/**
 * Timeline grid date maths.
 *
 * The grid has one column per period: a day, a week or a month. Every column
 * has a fixed pixel width, so a date inside a column is placed by the fraction
 * of the period that has passed. A later wave reuses that fraction to place the
 * work order bars.
 */

export type Timescale = 'Day' | 'Week' | 'Month';

export interface WorkCenter {
  id: string;
  name: string;
}

export interface TimelineColumn {
  /** First day of the period as yyyy-mm-dd. Stable key for the template. */
  key: string;
  start: Date;
  /** First day after the period. */
  end: Date;
  label: string;
  /** True for the column that holds today. */
  current: boolean;
}

/** Columns rendered on each side of today: two weeks in Day view, six months in Month view. */
const BUFFER: Record<Timescale, number> = { Day: 14, Week: 6, Month: 6 };

const MONTH_NAME = new Intl.DateTimeFormat('en-US', { month: 'short' });

export function buildColumns(timescale: Timescale, today: Date): TimelineColumn[] {
  const buffer = BUFFER[timescale];
  const columns: TimelineColumn[] = [];

  for (let offset = -buffer; offset <= buffer; offset++) {
    columns.push(columnFor(timescale, today, offset));
  }

  return columns;
}

export function columnFor(timescale: Timescale, today: Date, offset: number): TimelineColumn {
  if (timescale === 'Day') {
    const start = addDays(startOfDay(today), offset);
    const end = addDays(start, 1);
    return {
      key: isoDate(start),
      start,
      end,
      label: String(start.getDate()),
      current: offset === 0,
    };
  }

  if (timescale === 'Week') {
    const start = addDays(startOfWeek(today), offset * 7);
    const end = addDays(start, 7);
    return {
      key: isoDate(start),
      start,
      end,
      label: `${MONTH_NAME.format(start)} ${start.getDate()}`,
      current: offset === 0,
    };
  }

  const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1);
  return {
    key: isoDate(start),
    start,
    end,
    label: `${MONTH_NAME.format(start)} ${start.getFullYear()}`,
    current: offset === 0,
  };
}

/** Where today sits: the index of its column and the fraction of that column that has passed. */
export function todayPosition(
  columns: TimelineColumn[],
  today: Date,
): { index: number; fraction: number } {
  const index = columns.findIndex((column) => column.current);
  const column = columns[index];
  const span = dayNumber(column.end) - dayNumber(column.start);
  const elapsed = dayNumber(today) - dayNumber(column.start);

  return { index, fraction: span > 0 ? elapsed / span : 0 };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Weeks start on Monday. */
function startOfWeek(date: Date): Date {
  const mondayOffset = (date.getDay() + 6) % 7;
  return addDays(startOfDay(date), -mondayOffset);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Days since the epoch in UTC, so a daylight saving change cannot move a marker. */
function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

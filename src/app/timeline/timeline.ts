/**
 * Timeline grid date maths.
 *
 * The grid has one column per period: a day, a week or a month. Every column
 * has a fixed pixel width, so a date inside a column is placed by the fraction
 * of the period that has passed. The work order bars use the same fraction.
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

/**
 * Where a date sits in the timeline: the index of its column and the fraction of that column.
 *
 * The rule is the one of the current day marker, so a bar starts and ends at the same place as
 * the marker of that day. A date outside the rendered columns keeps its index: the columns are
 * consecutive periods, so the index is a distance from the first column.
 */
export function positionInColumns(
  columns: TimelineColumn[],
  timescale: Timescale,
  date: Date,
): { index: number; fraction: number } {
  const first = columns[0].start;
  const index = periodNumber(timescale, date) - periodNumber(timescale, first);

  const start = periodStart(timescale, date);
  const end = periodEnd(timescale, date);
  const span = dayNumber(end) - dayNumber(start);
  const elapsed = dayNumber(date) - dayNumber(start);

  return { index, fraction: span > 0 ? elapsed / span : 0 };
}

/** An ISO date, yyyy-mm-dd, as a local date. The app works with local calendar days. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** The number of the period a date belongs to, counted from an arbitrary origin. */
function periodNumber(timescale: Timescale, date: Date): number {
  if (timescale === 'Day') {
    return dayNumber(startOfDay(date));
  }
  if (timescale === 'Week') {
    return Math.floor(dayNumber(startOfWeek(date)) / 7);
  }
  return date.getFullYear() * 12 + date.getMonth();
}

/** The first day of the period a date belongs to. */
function periodStart(timescale: Timescale, date: Date): Date {
  if (timescale === 'Day') {
    return startOfDay(date);
  }
  if (timescale === 'Week') {
    return startOfWeek(date);
  }
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** The first day after the period a date belongs to. */
function periodEnd(timescale: Timescale, date: Date): Date {
  if (timescale === 'Day') {
    return addDays(startOfDay(date), 1);
  }
  if (timescale === 'Week') {
    return addDays(startOfWeek(date), 7);
  }
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
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

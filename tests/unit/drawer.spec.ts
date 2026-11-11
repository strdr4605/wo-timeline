import { describe, expect, test } from 'vitest';
import {
  draftFor,
  formatDottedDate,
  isDottedShape,
  isEndAfterStart,
  formValueFor,
  parseDottedDate,
} from '../../src/app/work-order-drawer/drawer-form';

describe('drawer form defaults', () => {
  test('[D4] the end date is the start date plus 7 days, also over a month end', () => {
    const value = formValueFor({
      mode: 'create',
      workCenterId: 'wc-genesis',
      startDate: new Date(2026, 11, 28),
    });

    expect(value.startDate).toEqual({ year: 2026, month: 12, day: 28 });
    expect(value.endDate).toEqual({ year: 2027, month: 1, day: 4 });
  });

  test('[D5] a new order is Open with an empty name', () => {
    const value = formValueFor({
      mode: 'create',
      workCenterId: 'wc-genesis',
      startDate: new Date(2026, 10, 10),
    });

    expect(value.status).toBe('open');
    expect(value.name).toBe('');
  });

  test('[D6] edit fills the values of the order', () => {
    const value = formValueFor({
      mode: 'edit',
      order: {
        docId: 'wo-1',
        name: 'Konsulting Inc',
        workCenterId: 'wc-konsulting',
        status: 'in-progress',
        startDate: '2026-11-03',
        endDate: '2027-01-15',
      },
    });

    expect(value).toEqual({
      name: 'Konsulting Inc',
      status: 'in-progress',
      startDate: { year: 2026, month: 11, day: 3 },
      endDate: { year: 2027, month: 1, day: 15 },
    });
  });

  test('[D12] dates read and write as DD.MM.YYYY, as in the design', () => {
    expect(formatDottedDate({ year: 2026, month: 1, day: 1 })).toBe('01.01.2026');
    expect(formatDottedDate({ year: 2025, month: 12, day: 3 })).toBe('03.12.2025');
    expect(formatDottedDate(null)).toBe('');
    expect(parseDottedDate('30.12.2025')).toEqual({ year: 2025, month: 12, day: 30 });
    expect(parseDottedDate('2025-12-30')).toBeNull();
  });
});

describe('drawer form validation', () => {
  test('[E1] the end date must be after the start date, the same day is not after it', () => {
    const start = { year: 2026, month: 3, day: 10 };
    expect(isEndAfterStart(start, { year: 2026, month: 3, day: 11 })).toBe(true);
    expect(isEndAfterStart(start, start)).toBe(false);
    expect(isEndAfterStart(start, { year: 2026, month: 2, day: 28 })).toBe(false);
    // The month is compared as a number, not as text: 10 is after 9.
    expect(
      isEndAfterStart({ year: 2026, month: 9, day: 30 }, { year: 2026, month: 10, day: 1 }),
    ).toBe(true);
  });

  test('[E1] a valid form gives an ISO draft on the work centre of the request', () => {
    const value = {
      name: '  Acme Inc.  ',
      status: 'blocked' as const,
      startDate: { year: 2026, month: 3, day: 9 },
      endDate: { year: 2026, month: 3, day: 16 },
    };
    const create = { mode: 'create' as const, workCenterId: 'wc-genesis', startDate: new Date() };

    expect(draftFor(create, value)).toEqual({
      name: 'Acme Inc.',
      workCenterId: 'wc-genesis',
      status: 'blocked',
      startDate: '2026-03-09',
      endDate: '2026-03-16',
    });

    const order = {
      docId: 'wo-1',
      name: 'Old',
      workCenterId: 'wc-spartan',
      status: 'open' as const,
      startDate: '2026-01-01',
      endDate: '2026-01-05',
    };
    expect(draftFor({ mode: 'edit', order }, value).workCenterId).toBe('wc-spartan');
  });

  test('[E1] a day that does not exist is not a date', () => {
    expect(parseDottedDate('40.13.2024')).toBeNull();
    expect(parseDottedDate('31.02.2025')).toBeNull();
    expect(parseDottedDate('29.02.2025')).toBeNull();
    expect(parseDottedDate('00.01.2025')).toBeNull();
    expect(parseDottedDate('31.04.2025')).toBeNull();
    expect(parseDottedDate('29.02.2024')).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseDottedDate('31.12.2025')).toEqual({ year: 2025, month: 12, day: 31 });
  });

  test('[E1] the shape check tells a wrong shape from a day that does not exist', () => {
    expect(isDottedShape('40.13.2024')).toBe(true);
    expect(isDottedShape(' 1.2.2026 ')).toBe(true);
    expect(isDottedShape('2025-12-30')).toBe(false);
    expect(isDottedShape('12.2025')).toBe(false);
  });
});

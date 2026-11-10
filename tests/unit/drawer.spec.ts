import { describe, expect, test } from 'vitest';
import {
  formatDottedDate,
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

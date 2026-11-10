import { describe, expect, test } from 'vitest';
import { OverlapCandidate, overlaps } from '../../src/app/data/overlap';
import { ScheduleService } from '../../src/app/data/schedule.service';

// Unit u5-actions: the overlap rule of the create and edit drawer.

const EXISTING: OverlapCandidate = {
  docId: 'wo-existing',
  workCenterId: 'wc-genesis',
  startDate: '2026-03-10',
  endDate: '2026-03-20',
};

const order = (startDate: string, endDate: string, extra: Partial<OverlapCandidate> = {}) => ({
  workCenterId: 'wc-genesis',
  startDate,
  endDate,
  ...extra,
});

describe('overlap', () => {
  test('[E2] an order that crosses an order of the same work centre is rejected', () => {
    expect(overlaps(order('2026-03-05', '2026-03-12'), [EXISTING])).toBe(true);
    expect(overlaps(order('2026-03-18', '2026-03-25'), [EXISTING])).toBe(true);
  });

  test('[E2] touching ends overlap: both dates are working days', () => {
    expect(overlaps(order('2026-03-01', '2026-03-10'), [EXISTING])).toBe(true);
    expect(overlaps(order('2026-03-20', '2026-03-30'), [EXISTING])).toBe(true);
  });

  test('[E2] the day before the start and the day after the end are free', () => {
    expect(overlaps(order('2026-03-01', '2026-03-09'), [EXISTING])).toBe(false);
    expect(overlaps(order('2026-03-21', '2026-03-30'), [EXISTING])).toBe(false);
  });

  test('[E2] a one-day order on a day of another order overlaps', () => {
    expect(overlaps(order('2026-03-15', '2026-03-15'), [EXISTING])).toBe(true);
    expect(overlaps(order('2026-03-10', '2026-03-10'), [EXISTING])).toBe(true);
  });

  test('[E2] a contained order and a containing order overlap', () => {
    expect(overlaps(order('2026-03-12', '2026-03-14'), [EXISTING])).toBe(true);
    expect(overlaps(order('2026-02-01', '2026-04-30'), [EXISTING])).toBe(true);
  });

  test('[E2] an order across a month end and a daylight saving change is compared by day', () => {
    const march = order('2026-03-28', '2026-04-02', { docId: 'wo-march' });
    expect(overlaps(order('2026-04-02', '2026-04-05'), [march])).toBe(true);
    expect(overlaps(order('2026-04-03', '2026-04-05'), [march])).toBe(false);
  });

  test('[E3] edit skips the order being edited', () => {
    const edited = { ...EXISTING, startDate: '2026-03-12', endDate: '2026-03-25' };
    expect(overlaps(edited, [EXISTING])).toBe(false);

    // The other orders of the work centre still count.
    const neighbour = { ...EXISTING, docId: 'wo-neighbour', startDate: '2026-03-24', endDate: '2026-03-30' };
    expect(overlaps(edited, [EXISTING, neighbour])).toBe(true);
  });

  test('[E3] a new order without a docId never matches an existing order by id', () => {
    expect(overlaps(order('2026-03-12', '2026-03-14'), [{ ...EXISTING, docId: undefined }])).toBe(
      true,
    );
  });

  test('[E5] the same dates on another work centre are allowed', () => {
    expect(overlaps(order('2026-03-10', '2026-03-20', { workCenterId: 'wc-spartan' }), [EXISTING])).toBe(
      false,
    );
  });
});

describe('schedule service save and remove', () => {
  const draft = {
    name: 'Night Shift Batch',
    workCenterId: 'wc-genesis',
    status: 'open' as const,
    startDate: '2030-01-10',
    endDate: '2030-01-20',
  };

  test('[E2] a free range is added, an overlapping range adds nothing', () => {
    const service = new ScheduleService();
    const count = service.workOrders().length;

    expect(service.save(draft)).toBe('saved');
    expect(service.workOrders().length).toBe(count + 1);

    expect(service.save({ ...draft, name: 'Clash', startDate: '2030-01-20' })).toBe('overlap');
    expect(service.workOrders().length).toBe(count + 1);
    expect(service.workOrders().some((order) => order.name === 'Clash')).toBe(false);
  });

  test('[E3] save with a docId updates that order in place and ignores its old dates', () => {
    const service = new ScheduleService();
    service.save(draft);
    const added = service.workOrders().at(-1)!;
    const index = service.workOrders().length - 1;

    expect(service.save({ ...draft, endDate: '2030-01-25' }, added.docId)).toBe('saved');
    expect(service.workOrders()[index]).toEqual({ ...added, endDate: '2030-01-25' });
  });

  test('[E5] the same range on another work centre is saved', () => {
    const service = new ScheduleService();
    service.save(draft);
    expect(service.save({ ...draft, workCenterId: 'wc-spartan' })).toBe('saved');
  });

  test('[E2] the new order gets a docId that no other order has', () => {
    const service = new ScheduleService();
    service.save(draft);
    service.save({ ...draft, startDate: '2030-02-01', endDate: '2030-02-05' });
    const ids = service.workOrders().map((order) => order.docId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('remove deletes only the given order', () => {
    const service = new ScheduleService();
    const [first, ...rest] = service.workOrders();
    service.remove(first.docId);
    expect(service.workOrders()).toEqual(rest);
  });
});

import { describe, expect, test } from 'vitest';
import { ScheduleService, overlaps } from '../../src/app/data/schedule.service';
import {
  SAMPLE_DOCUMENTS,
  SAMPLE_WORK_CENTER_DOCUMENTS,
  SAMPLE_WORK_ORDER_DOCUMENTS,
} from '../../src/app/data/sample-data';

const STATUSES = ['open', 'in-progress', 'complete', 'blocked'];

describe('sample data', () => {
  test('[F1] at least 5 work centers with realistic manufacturing names', () => {
    expect(SAMPLE_WORK_CENTER_DOCUMENTS.length).toBeGreaterThanOrEqual(5);

    for (const document of SAMPLE_WORK_CENTER_DOCUMENTS) {
      expect(document.data.name.trim().length).toBeGreaterThan(0);
    }

    expect(new Set(SAMPLE_WORK_CENTER_DOCUMENTS.map((d) => d.data.name)).size).toBe(
      SAMPLE_WORK_CENTER_DOCUMENTS.length,
    );
  });

  test('[F2] at least 8 work orders, all 4 statuses, one centre with several orders', () => {
    expect(SAMPLE_WORK_ORDER_DOCUMENTS.length).toBeGreaterThanOrEqual(8);

    const statuses = new Set(SAMPLE_WORK_ORDER_DOCUMENTS.map((d) => d.data.status));
    for (const status of STATUSES) {
      expect(statuses.has(status as never), `status ${status} is missing`).toBe(true);
    }

    // One work centre holds several orders that do not overlap.
    const perCentre = new Map<string, number>();
    for (const document of SAMPLE_WORK_ORDER_DOCUMENTS) {
      perCentre.set(
        document.data.workCenterId,
        (perCentre.get(document.data.workCenterId) ?? 0) + 1,
      );
    }
    const withSeveral = [...perCentre.values()].filter((count) => count > 1);
    expect(withSeveral.length).toBeGreaterThan(0);

    // No two orders of the same work centre overlap.
    for (const document of SAMPLE_WORK_ORDER_DOCUMENTS) {
      const others = SAMPLE_WORK_ORDER_DOCUMENTS.filter(
        (other) =>
          other.docId !== document.docId && other.data.workCenterId === document.data.workCenterId,
      );
      expect(overlaps(document.data, others), `${document.docId} overlaps`).toBe(false);
    }
  });

  test('[F3] the documents follow the docId / docType / data structure', () => {
    expect(SAMPLE_DOCUMENTS.length).toBe(
      SAMPLE_WORK_CENTER_DOCUMENTS.length + SAMPLE_WORK_ORDER_DOCUMENTS.length,
    );

    const ids = new Set<string>();
    for (const document of SAMPLE_DOCUMENTS) {
      expect(typeof document.docId).toBe('string');
      expect(document.docId.length).toBeGreaterThan(0);
      expect(ids.has(document.docId)).toBe(false);
      ids.add(document.docId);

      expect(document.docType).toMatch(/^work(Center|Order)$/);
      expect(typeof document.data).toBe('object');
      expect(document.data).not.toBeNull();
    }

    for (const document of SAMPLE_WORK_ORDER_DOCUMENTS) {
      expect(document.docType).toBe('workOrder');
      expect(typeof document.data.name).toBe('string');
      expect(STATUSES).toContain(document.data.status);
      expect(document.data.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(document.data.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // The work centre of an order is one of the work centre documents.
      expect(SAMPLE_WORK_CENTER_DOCUMENTS.map((d) => d.docId)).toContain(
        document.data.workCenterId,
      );
    }
  });

  test('[F4] the overlap detection is a pure function of the service', () => {
    const candidate = {
      workCenterId: 'wc-genesis',
      startDate: '2027-03-01',
      endDate: '2027-03-31',
    };

    // The function does not change its input and does not need Angular.
    const orders = [{ workCenterId: 'wc-genesis', startDate: '2026-10-18', endDate: '2026-11-30' }];
    const snapshot = JSON.stringify(orders);

    expect(overlaps(candidate, orders)).toBe(false);
    expect(JSON.stringify(orders)).toBe(snapshot);

    // Touching ranges overlap.
    expect(overlaps(candidate, [{ ...candidate, startDate: '2027-03-31' }])).toBe(true);
    expect(overlaps(candidate, [{ ...candidate, endDate: '2027-03-01' }])).toBe(true);
    expect(overlaps(candidate, [{ ...candidate, startDate: '2027-04-01' }])).toBe(false);

    // Another work centre never overlaps.
    expect(overlaps(candidate, [{ ...candidate, workCenterId: 'wc-spartan' }])).toBe(false);

    // The service holds the data set and the same check.
    const service = new ScheduleService();
    expect(service.workCenters().length).toBe(5);
    expect(service.workOrders().length).toBe(8);
    expect(service.hasOverlap(candidate)).toBe(false);
    expect(service.hasOverlap({ ...candidate, startDate: '2027-01-01' })).toBe(true);
  });
});

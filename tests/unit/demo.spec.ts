import { describe, expect, test } from 'vitest';
import { overlaps } from '../../src/app/data/overlap';
import { generateDemoCenters, generateDemoOrders } from '../../src/app/demo';
import { addDays, isoDate } from '../../src/app/timeline/timeline';

// Bonus b19-demo-data: the generator of `?demo=1`.

const TODAY = new Date(2026, 10, 11);

const SAMPLE_CENTERS = ['wc-a', 'wc-b', 'wc-c', 'wc-d', 'wc-e'].map((id) => ({ id, name: id }));

describe('demo data generator', () => {
  for (const [label, centers] of [
    ['5 work centres', SAMPLE_CENTERS],
    ['55 work centres', [...SAMPLE_CENTERS, ...generateDemoCenters(50)]],
  ] as const) {
    test(`[I12] ${label}: 5,000 orders, every status, no overlap, end after start`, () => {
      const orders = generateDemoOrders(centers, 5000, TODAY);

      expect(orders).toHaveLength(5000);
      expect(new Set(orders.map((order) => order.docId)).size).toBe(5000);
      expect(new Set(orders.map((order) => order.status))).toEqual(
        new Set(['open', 'in-progress', 'complete', 'blocked']),
      );
      expect(orders.every((order) => order.endDate > order.startDate)).toBe(true);
      expect(orders.filter((order) => overlaps(order, orders))).toEqual([]);
    });
  }

  test('[I12] 55 work centres fill about two years before and after today', () => {
    const centers = [...SAMPLE_CENTERS, ...generateDemoCenters(50)];
    const dates = generateDemoOrders(centers, 5000, TODAY)
      .flatMap((o) => [o.startDate, o.endDate])
      .sort();

    expect(dates[0] >= isoDate(addDays(TODAY, -740))).toBe(true);
    expect(dates.at(-1)! <= isoDate(addDays(TODAY, 740))).toBe(true);
  });

  test('[I12] the same seed gives the same data', () => {
    expect(generateDemoOrders(SAMPLE_CENTERS, 100, TODAY)).toEqual(
      generateDemoOrders(SAMPLE_CENTERS, 100, TODAY),
    );
  });
});

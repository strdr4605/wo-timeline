/**
 * Demo mode: a test hook that loads a large data set, so the owner can see the column and bar
 * windowing of the grid at work.
 *
 * Open the app with `?demo=1`. Parity mode never shows the demo controls: the parity screenshots
 * must stay the same. `?virtual=0` turns the windowing off, to compare the DOM count and the frame
 * time with the windowing on. The generated data stays in memory: a reload gives the normal data.
 */

import { WorkOrder, WorkOrderStatus } from './data/sample-data';
import { PARITY_MODE } from './parity';
import { WorkCenter, addDays, isoDate } from './timeline/timeline';

const PARAMS = new URLSearchParams(globalThis.location?.search ?? '');

/** True with `?demo=1`, outside parity mode. Read once: the hook does not change at runtime. */
export const DEMO_MODE = PARAMS.get('demo') === '1' && !PARITY_MODE;

/** False with `?virtual=0`: the grid then renders every column and every bar. */
export const VIRTUAL_MODE = PARAMS.get('virtual') !== '0';

/** The order count of the "Load 5,000 orders" button. */
export const DEMO_ORDER_COUNT = 5000;

/** The work centres that the "Load 50 work centres" button adds. */
export const DEMO_CENTER_COUNT = 50;

/** A fixed seed: each load gives the same data, so two runs are comparable. */
const DEMO_SEED = 20261111;

/** The orders spread over about two years before and after today. */
const DEMO_HALF_SPAN_DAYS = 730;

/** The brief: the end date must be after the start date, so an order holds at least two days. */
const MIN_ORDER_DAYS = 2;

const STATUSES: readonly WorkOrderStatus[] = ['open', 'in-progress', 'complete', 'blocked'];

/**
 * Makes the orders for the given work centres, spread evenly over the centres.
 *
 * Each centre gets a row of equal slots and each order sits inside its own slot, so two orders of
 * one centre never touch: the overlap rule holds by construction. The slots fill about two years
 * before and after today. When a centre gets more orders than two-day slots fit in that span, the
 * span grows: 5,000 orders on 5 centres need about 2.7 years on each side.
 */
export function generateDemoOrders(centers: readonly WorkCenter[], count: number, today: Date): WorkOrder[] {
  const random = mulberry32(DEMO_SEED);
  const orders: WorkOrder[] = [];

  centers.forEach((center, centerIndex) => {
    const centerCount = Math.floor(count / centers.length) + (centerIndex < count % centers.length ? 1 : 0);
    if (centerCount === 0) {
      return;
    }

    const slotDays = Math.max(MIN_ORDER_DAYS, Math.floor((2 * DEMO_HALF_SPAN_DAYS) / centerCount));
    const firstDay = addDays(today, -Math.floor((centerCount * slotDays) / 2));

    for (let slot = 0; slot < centerCount; slot++) {
      const days = MIN_ORDER_DAYS + Math.floor(random() * (slotDays - MIN_ORDER_DAYS + 1));
      const offset = Math.floor(random() * (slotDays - days + 1));
      const start = addDays(firstDay, slot * slotDays + offset);

      orders.push({
        docId: `demo-${orders.length + 1}`,
        name: `Demo order ${orders.length + 1}`,
        workCenterId: center.id,
        status: STATUSES[Math.floor(random() * STATUSES.length)],
        startDate: isoDate(start),
        endDate: isoDate(addDays(start, days - 1)),
      });
    }
  });

  return orders;
}

/** Extra work centres after the sample ones. The rows are not windowed: see the b19 notes. */
export function generateDemoCenters(count: number): WorkCenter[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `demo-wc-${index + 1}`,
    name: `Demo centre ${index + 1}`,
  }));
}

/** A small seeded random generator, so the demo data is the same on every load. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

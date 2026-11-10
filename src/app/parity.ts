/**
 * Parity mode: a test hook that makes the app render the view of the Sketch artboards.
 *
 * Open the app with `?parity=1`. See docs/requirements/DESIGN-PARITY.md. The normal app does not
 * read anything from this file except the flag.
 */

import { WorkOrderDocument } from './data/sample-data';

/** True when the page was opened with `?parity=1`. Read once: the hook does not change at runtime. */
export const PARITY_MODE = new URLSearchParams(globalThis.location?.search ?? '').get('parity') === '1';

/** The artboards mark September 2024 as the current month. */
export const PARITY_TODAY = new Date(2024, 8, 1);

/** The artboards start the timeline with August 2024, one column before the current month. */
export const PARITY_FIRST_COLUMN_OFFSET = -1;

/**
 * The four bars of the artboard "Work Order Schedule - Default".
 *
 * The dates convert the artboard pixels with the date mapping of the app: the timeline starts at
 * x 483 with August 2024, a month column is 114 wide, and a date sits at the fraction of its month
 * that has passed. Each date is the day whose edge is nearest to the artboard pixel.
 */
export const PARITY_WORK_ORDER_DOCUMENTS: WorkOrderDocument[] = [
  {
    docId: 'wo-concentrix',
    docType: 'workOrder',
    // x 437 to 900.
    data: {
      name: 'Concentrix Ltd',
      workCenterId: 'wc-genesis',
      status: 'complete',
      startDate: '2024-07-20',
      endDate: '2024-11-21',
    },
  },
  {
    docId: 'wo-konsulting',
    docType: 'workOrder',
    // x 556 to 1019.
    data: {
      name: 'Konsulting Inc',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: '2024-08-21',
      endDate: '2024-12-23',
    },
  },
  {
    docId: 'wo-compleks',
    docType: 'workOrder',
    // x 945 to 1408. The mock overlaps it with Konsulting Inc. Parity mode keeps the mock.
    data: {
      name: 'Compleks Systems',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: '2024-12-03',
      endDate: '2025-04-04',
    },
  },
  {
    docId: 'wo-mcmarrow',
    docType: 'workOrder',
    // x 677 to 1210.
    data: {
      name: 'McMarrow Distribution',
      workCenterId: 'wc-mcmarrow',
      status: 'blocked',
      startDate: '2024-09-22',
      endDate: '2025-02-12',
    },
  },
];

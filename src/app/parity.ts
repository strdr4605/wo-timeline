/**
 * Parity mode: a test hook that makes the app render the view of the Sketch artboards.
 *
 * Open the app with `?parity=1`. The normal app does not read anything from this file except the
 * flag.
 */

import { WorkOrderDocument } from './data/sample-data';

/** True when the page was opened with `?parity=1`. Read once: the hook does not change at runtime. */
export const PARITY_MODE =
  new URLSearchParams(globalThis.location?.search ?? '').get('parity') === '1';

/**
 * `?parity=1&fixture=hover` selects the fixture of the hover artboards ("Options CTA Controls" and
 * "Edit and Delete Controls Expanded"). They show two bars more than the default artboard.
 */
const HOVER_FIXTURE =
  new URLSearchParams(globalThis.location?.search ?? '').get('fixture') === 'hover';

/** The artboards mark September 2024 as the current month. */
export const PARITY_TODAY = new Date(2024, 8, 1);

/** The artboards start the timeline with August 2024, one column before the current month. */
export const PARITY_FIRST_COLUMN_OFFSET = -1;

/**
 * The four bars of the artboard "Work Order Schedule - Default".
 *
 * The x ranges are the bar rectangles ("Rectangle 2"), not their groups: a group frame is 463 wide,
 * but three of the rectangles are 381 wide.
 *
 * The dates convert the artboard pixels with the date mapping of the app: the timeline starts at
 * x 483 with August 2024, a month column is 114 wide, and a date sits at the fraction of its month
 * that has passed. Each date is the day whose edge is nearest to the artboard pixel.
 */
const DEFAULT_WORK_ORDER_DOCUMENTS: WorkOrderDocument[] = [
  {
    docId: 'wo-concentrix',
    docType: 'workOrder',
    // x 437 to 818.
    data: {
      name: 'Concentrix Ltd',
      workCenterId: 'wc-genesis',
      status: 'complete',
      startDate: '2024-07-20',
      endDate: '2024-10-30',
    },
  },
  {
    docId: 'wo-konsulting',
    docType: 'workOrder',
    // x 556 to 937.
    data: {
      name: 'Konsulting Inc',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: '2024-08-21',
      endDate: '2024-11-30',
    },
  },
  {
    docId: 'wo-compleks',
    docType: 'workOrder',
    // x 945 to 1326.
    data: {
      name: 'Compleks Systems',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: '2024-12-03',
      endDate: '2025-03-13',
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

/** The two bars that only the hover artboards show, converted with the same rule. */
const HOVER_WORK_ORDER_DOCUMENTS: WorkOrderDocument[] = [
  {
    docId: 'wo-rodriques',
    docType: 'workOrder',
    // x 501 to 882.
    data: {
      name: 'Rodriques Electrics',
      workCenterId: 'wc-rodriques',
      status: 'in-progress',
      startDate: '2024-08-06',
      endDate: '2024-11-16',
    },
  },
  {
    docId: 'wo-spartan',
    docType: 'workOrder',
    // x 583 to 1116.
    data: {
      name: 'Spartan Distribution',
      workCenterId: 'wc-spartan',
      status: 'open',
      startDate: '2024-08-28',
      endDate: '2025-01-18',
    },
  },
];

/** The work orders of parity mode. */
export const PARITY_WORK_ORDER_DOCUMENTS: WorkOrderDocument[] = HOVER_FIXTURE
  ? [...DEFAULT_WORK_ORDER_DOCUMENTS, ...HOVER_WORK_ORDER_DOCUMENTS]
  : DEFAULT_WORK_ORDER_DOCUMENTS;

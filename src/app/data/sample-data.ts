/**
 * The sample data set of the design.
 *
 * The names come from the Sketch artboard "Work Order Schedule - Default" and the dates are
 * the Sketch bar positions shifted by 27 months, so the months run from 2026. See
 * docs/requirements/SAMPLE-DATA.md for the locked set.
 *
 * Every document follows the structure of the brief: docId, docType, data.
 */

export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    /** The docId of the work centre the order runs on. */
    workCenterId: string;
    status: WorkOrderStatus;
    /** ISO date, yyyy-mm-dd. */
    startDate: string;
    /** ISO date, yyyy-mm-dd. */
    endDate: string;
  };
}

/** A work order as the app uses it: the document without its envelope. */
export interface WorkOrder {
  docId: string;
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
}

/** The rail order of the design. */
export const SAMPLE_WORK_CENTER_DOCUMENTS: WorkCenterDocument[] = [
  { docId: 'wc-genesis', docType: 'workCenter', data: { name: 'Genesis Hardware' } },
  { docId: 'wc-rodriques', docType: 'workCenter', data: { name: 'Rodriques Electrics' } },
  { docId: 'wc-konsulting', docType: 'workCenter', data: { name: 'Konsulting Inc' } },
  { docId: 'wc-mcmarrow', docType: 'workCenter', data: { name: 'McMarrow Distribution' } },
  { docId: 'wc-spartan', docType: 'workCenter', data: { name: 'Spartan Manufacturing' } },
];

export const SAMPLE_WORK_ORDER_DOCUMENTS: WorkOrderDocument[] = [
  {
    docId: 'wo-concentrix',
    docType: 'workOrder',
    data: {
      name: 'Concentrix Ltd',
      workCenterId: 'wc-genesis',
      status: 'complete',
      startDate: '2026-10-18',
      endDate: '2027-02-22',
    },
  },
  {
    docId: 'wo-polymer',
    docType: 'workOrder',
    data: {
      name: 'Polymer Extrusion',
      workCenterId: 'wc-genesis',
      status: 'open',
      startDate: '2027-06-07',
      endDate: '2027-07-19',
    },
  },
  {
    docId: 'wo-rodriques',
    docType: 'workOrder',
    data: {
      name: 'Rodriques Electrics',
      workCenterId: 'wc-rodriques',
      status: 'open',
      startDate: '2026-11-05',
      endDate: '2027-03-10',
    },
  },
  {
    docId: 'wo-steel',
    docType: 'workOrder',
    data: {
      name: 'Steel Fabrication',
      workCenterId: 'wc-rodriques',
      status: 'complete',
      startDate: '2027-04-01',
      endDate: '2027-05-10',
    },
  },
  {
    docId: 'wo-konsulting',
    docType: 'workOrder',
    data: {
      name: 'Konsulting Inc',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: '2026-09-18',
      endDate: '2027-01-21',
    },
  },
  {
    docId: 'wo-compleks',
    docType: 'workOrder',
    data: {
      name: 'Compleks Systems',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: '2027-03-07',
      endDate: '2027-07-10',
    },
  },
  {
    docId: 'wo-mcmarrow',
    docType: 'workOrder',
    data: {
      name: 'McMarrow Distribution',
      workCenterId: 'wc-mcmarrow',
      status: 'blocked',
      startDate: '2027-01-08',
      endDate: '2027-05-30',
    },
  },
  {
    docId: 'wo-spartan',
    docType: 'workOrder',
    data: {
      name: 'Spartan Manufacturing',
      workCenterId: 'wc-spartan',
      status: 'open',
      startDate: '2026-11-26',
      endDate: '2027-04-18',
    },
  },
];

export const SAMPLE_DOCUMENTS: (WorkCenterDocument | WorkOrderDocument)[] = [
  ...SAMPLE_WORK_CENTER_DOCUMENTS,
  ...SAMPLE_WORK_ORDER_DOCUMENTS,
];

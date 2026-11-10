import { Injectable, signal } from '@angular/core';
import { WorkCenter } from '../timeline/timeline';
import { PARITY_MODE, PARITY_WORK_ORDER_DOCUMENTS } from '../parity';
import { OverlapCandidate, overlaps } from './overlap';
import {
  SAMPLE_WORK_CENTER_DOCUMENTS,
  SAMPLE_WORK_ORDER_DOCUMENTS,
  WorkOrder,
} from './sample-data';

// The overlap function is re-exported here: the service owns it, the sibling file keeps it pure.
export { overlaps };

/** Holds the work centres and the work orders of the schedule. */
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  readonly workCenters = signal<WorkCenter[]>(
    SAMPLE_WORK_CENTER_DOCUMENTS.map((document) => ({
      id: document.docId,
      name: document.data.name,
    })),
  ).asReadonly();

  readonly workOrders = signal<WorkOrder[]>(
    (PARITY_MODE ? PARITY_WORK_ORDER_DOCUMENTS : SAMPLE_WORK_ORDER_DOCUMENTS).map((document) => ({
      docId: document.docId,
      ...document.data,
    })),
  ).asReadonly();

  /** The orders of one work centre, in the order of the sample data. */
  ordersOf(workCenterId: string): WorkOrder[] {
    return this.workOrders().filter((order) => order.workCenterId === workCenterId);
  }

  /** True when the candidate touches an order of the same work centre. */
  hasOverlap(candidate: OverlapCandidate, existingOrders?: readonly OverlapCandidate[]): boolean {
    return overlaps(candidate, existingOrders ?? this.workOrders());
  }
}

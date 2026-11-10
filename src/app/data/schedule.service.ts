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

  private readonly orders = signal<WorkOrder[]>(
    (PARITY_MODE ? PARITY_WORK_ORDER_DOCUMENTS : SAMPLE_WORK_ORDER_DOCUMENTS).map((document) => ({
      docId: document.docId,
      ...document.data,
    })),
  );

  readonly workOrders = this.orders.asReadonly();

  /** The orders of one work centre, in the order of the sample data. */
  ordersOf(workCenterId: string): WorkOrder[] {
    return this.workOrders().filter((order) => order.workCenterId === workCenterId);
  }

  /** True when the candidate touches another order of the same work centre. */
  hasOverlap(candidate: OverlapCandidate, existingOrders?: readonly OverlapCandidate[]): boolean {
    return overlaps(candidate, existingOrders ?? this.workOrders());
  }

  /**
   * Adds the draft as a new order, or replaces the order with the given docId. An overlap with
   * another order of the same work centre changes nothing.
   */
  save(draft: WorkOrderDraft, docId?: string): SaveResult {
    if (this.hasOverlap({ ...draft, docId })) {
      return 'overlap';
    }

    if (docId === undefined) {
      this.orders.update((orders) => [...orders, { docId: this.nextDocId(), ...draft }]);
    } else {
      this.orders.update((orders) =>
        orders.map((order) => (order.docId === docId ? { docId, ...draft } : order)),
      );
    }
    return 'saved';
  }

  remove(docId: string): void {
    this.orders.update((orders) => orders.filter((order) => order.docId !== docId));
  }

  private nextDocId(): string {
    const ids = new Set(this.orders().map((order) => order.docId));
    let index = ids.size + 1;
    while (ids.has(`wo-${index}`)) {
      index++;
    }
    return `wo-${index}`;
  }
}

/** A work order without its id: what the drawer form produces. */
export type WorkOrderDraft = Omit<WorkOrder, 'docId'>;

export type SaveResult = 'saved' | 'overlap';

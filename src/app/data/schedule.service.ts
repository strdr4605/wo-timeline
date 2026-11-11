import { Injectable, signal } from '@angular/core';
import { WorkCenter } from '../timeline/timeline';
import { PARITY_MODE, PARITY_WORK_ORDER_DOCUMENTS } from '../parity';
import { OverlapCandidate, overlaps } from './overlap';
import {
  SAMPLE_WORK_CENTER_DOCUMENTS,
  SAMPLE_WORK_ORDER_DOCUMENTS,
  WorkOrder,
  WorkOrderDocument,
  WorkOrderStatus,
} from './sample-data';

// The overlap function is re-exported here: the service owns it, the sibling file keeps it pure.
export { overlaps };

/** Holds the work centres and the work orders of the schedule. */
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly centers = signal<WorkCenter[]>(sampleWorkCenters());

  readonly workCenters = this.centers.asReadonly();

  /**
   * Parity mode always shows the design fixture and never touches the storage, so the parity
   * screenshots do not depend on what a user saved before.
   */
  private readonly orders = signal<WorkOrder[]>(
    PARITY_MODE ? toWorkOrders(PARITY_WORK_ORDER_DOCUMENTS) : loadWorkOrders(),
  );

  readonly workOrders = this.orders.asReadonly();

  /** The width of the work centre rail set by the user, or null for the design width. */
  private readonly savedRailWidth = signal<number | null>(PARITY_MODE ? null : loadRailWidth());

  readonly railWidth = this.savedRailWidth.asReadonly();

  /** True while the demo data is shown. The demo data never goes to the storage. */
  private demoData = false;

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
    this.persist();
    return 'saved';
  }

  remove(docId: string): void {
    this.orders.update((orders) => orders.filter((order) => order.docId !== docId));
    this.persist();
  }

  /** Shows the generated data of demo mode, in memory only. Edits to it are not saved either. */
  loadDemo(centers: WorkCenter[], orders: WorkOrder[]): void {
    this.demoData = true;
    this.centers.set(centers);
    this.orders.set(orders);
  }

  /** Brings back the data of a fresh load: the saved orders, or the sample data. */
  resetData(): void {
    this.demoData = false;
    this.centers.set(sampleWorkCenters());
    this.orders.set(PARITY_MODE ? toWorkOrders(PARITY_WORK_ORDER_DOCUMENTS) : loadWorkOrders());
  }

  /** Parity mode keeps the new width for this page only. */
  saveRailWidth(width: number): void {
    this.savedRailWidth.set(width);
    if (!PARITY_MODE) {
      writeStorage(RAIL_WIDTH_STORAGE_KEY, String(width));
    }
  }

  private persist(): void {
    if (!PARITY_MODE && !this.demoData) {
      storeWorkOrders(this.orders());
    }
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

/** The storage key. The version suffix lets a later data shape ignore old entries. */
export const WORK_ORDERS_STORAGE_KEY = 'wo-timeline.workOrders.v1';

export const RAIL_WIDTH_STORAGE_KEY = 'wo-timeline.railWidth.v1';

const STATUSES: readonly WorkOrderStatus[] = ['open', 'in-progress', 'complete', 'blocked'];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The saved orders, or the sample data when nothing is saved. A corrupt entry also gives the
 * sample data: the next save then replaces it.
 */
function loadWorkOrders(): WorkOrder[] {
  const saved = readStorage(WORK_ORDERS_STORAGE_KEY);
  if (saved !== null) {
    try {
      const documents: unknown = JSON.parse(saved);
      if (Array.isArray(documents) && documents.every(isWorkOrderDocument)) {
        return toWorkOrders(documents);
      }
    } catch {
      // Not JSON: fall through to the sample data.
    }
  }
  return toWorkOrders(SAMPLE_WORK_ORDER_DOCUMENTS);
}

/** Saves the orders in the document structure of the brief. */
function storeWorkOrders(orders: readonly WorkOrder[]): void {
  const documents: WorkOrderDocument[] = orders.map(({ docId, ...data }) => ({
    docId,
    docType: 'workOrder',
    data,
  }));
  writeStorage(WORK_ORDERS_STORAGE_KEY, JSON.stringify(documents));
}

/** The saved rail width. A value that is not a positive number gives the design width. */
function loadRailWidth(): number | null {
  const width = Number(readStorage(RAIL_WIDTH_STORAGE_KEY) ?? NaN);
  return Number.isFinite(width) && width > 0 ? width : null;
}

function sampleWorkCenters(): WorkCenter[] {
  return SAMPLE_WORK_CENTER_DOCUMENTS.map((document) => ({
    id: document.docId,
    name: document.data.name,
  }));
}

function toWorkOrders(documents: readonly WorkOrderDocument[]): WorkOrder[] {
  return documents.map((document) => ({ docId: document.docId, ...document.data }));
}

function readStorage(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    storage()?.setItem(key, value);
  } catch {
    // Full or blocked storage: the change stays in memory for this session.
  }
}

/** Undefined outside a browser (unit tests) and where the browser blocks the storage. */
function storage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isWorkOrderDocument(value: unknown): value is WorkOrderDocument {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { docId, docType, data } = value as Partial<WorkOrderDocument>;
  if (typeof docId !== 'string' || docType !== 'workOrder' || typeof data !== 'object' || !data) {
    return false;
  }
  return (
    typeof data.name === 'string' &&
    SAMPLE_WORK_CENTER_DOCUMENTS.some((center) => center.docId === data.workCenterId) &&
    STATUSES.includes(data.status) &&
    ISO_DATE.test(String(data.startDate)) &&
    ISO_DATE.test(String(data.endDate))
  );
}

/**
 * Overlap detection.
 *
 * Pure functions only, no Angular, so a plain vitest test can call them. Two orders overlap
 * when they sit on the same work centre and their date ranges touch. Both dates are working
 * days of the order, so an order that ends on the day another starts overlaps it.
 */

export interface OverlapCandidate {
  /** Set when the candidate is an existing order: the check then skips that order. */
  docId?: string;
  workCenterId: string;
  /** ISO date, yyyy-mm-dd. */
  startDate: string;
  /** ISO date, yyyy-mm-dd. */
  endDate: string;
}

/** True when the candidate touches another order of the same work centre. */
export function overlaps(
  candidate: OverlapCandidate,
  existingOrders: readonly OverlapCandidate[],
): boolean {
  const start = dayNumber(candidate.startDate);
  const end = dayNumber(candidate.endDate);

  return existingOrders.some(
    (order) =>
      !isSameOrder(order, candidate) &&
      order.workCenterId === candidate.workCenterId &&
      dayNumber(order.startDate) <= end &&
      dayNumber(order.endDate) >= start,
  );
}

/** An edited order must not collide with its own old dates. */
function isSameOrder(order: OverlapCandidate, candidate: OverlapCandidate): boolean {
  return candidate.docId !== undefined && order.docId === candidate.docId;
}

/** Days since the epoch in UTC, so a daylight saving change cannot move an order. */
function dayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

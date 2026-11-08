/**
 * Overlap detection.
 *
 * Pure functions only, no Angular, so a plain vitest test can call them. Two orders overlap
 * when they sit on the same work centre and their date ranges touch.
 */

export interface OverlapCandidate {
  workCenterId: string;
  /** ISO date, yyyy-mm-dd. */
  startDate: string;
  /** ISO date, yyyy-mm-dd. */
  endDate: string;
}

/** Days since the epoch in UTC, so a daylight saving change cannot move an order. */
function dayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** True when the candidate touches an existing order of the same work centre. */
export function overlaps(
  candidate: OverlapCandidate,
  existingOrders: readonly OverlapCandidate[],
): boolean {
  const start = dayNumber(candidate.startDate);
  const end = dayNumber(candidate.endDate);

  return existingOrders.some(
    (order) =>
      order.workCenterId === candidate.workCenterId &&
      dayNumber(order.startDate) <= end &&
      dayNumber(order.endDate) >= start,
  );
}

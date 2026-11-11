/**
 * The pure logic of the drawer form: the default values and the date format of the design.
 * No Angular here, so plain vitest can test it.
 */

import { WorkOrder, WorkOrderStatus } from '../data/sample-data';
import type { WorkOrderDraft } from '../data/schedule.service';

/** What the drawer is open for: a new order on a clicked cell, or an existing order. */
export type DrawerRequest =
  { mode: 'create'; workCenterId: string; startDate: Date } | { mode: 'edit'; order: WorkOrder };

/** A calendar day as ngb-datepicker holds it. The month counts from 1. */
export interface DayStruct {
  year: number;
  month: number;
  day: number;
}

export interface DrawerFormValue {
  name: string;
  status: WorkOrderStatus;
  startDate: DayStruct | null;
  endDate: DayStruct | null;
}

/** The requirements: the end date of a new order is the start date plus 7 days. */
const DEFAULT_LENGTH_DAYS = 7;

const DOTTED_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;

/** The form values of a request: the order for edit, the default values of the requirements for create. */
export function formValueFor(request: DrawerRequest): DrawerFormValue {
  if (request.mode === 'edit') {
    const { order } = request;
    return {
      name: order.name,
      status: order.status,
      startDate: isoToStruct(order.startDate),
      endDate: isoToStruct(order.endDate),
    };
  }

  // The Date constructor moves a day past the month end into the next month.
  const start = request.startDate;
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + DEFAULT_LENGTH_DAYS,
  );
  return {
    name: '',
    status: 'open',
    startDate: dateToStruct(start),
    endDate: dateToStruct(end),
  };
}

/** The requirements: the end date must be after the start date. The same day is not after it. */
export function isEndAfterStart(start: DayStruct, end: DayStruct): boolean {
  return structToIso(end) > structToIso(start);
}

/** The order that a valid form describes. */
export function draftFor(
  request: DrawerRequest,
  value: DrawerFormValue & { startDate: DayStruct; endDate: DayStruct },
): WorkOrderDraft {
  return {
    name: value.name.trim(),
    workCenterId: request.mode === 'edit' ? request.order.workCenterId : request.workCenterId,
    status: value.status,
    startDate: structToIso(value.startDate),
    endDate: structToIso(value.endDate),
  };
}

/** DD.MM.YYYY, as the date fields of the design ('01.01.2026'). */
export function formatDottedDate(date: DayStruct | null): string {
  if (!date) {
    return '';
  }
  return `${pad(date.day)}.${pad(date.month)}.${date.year}`;
}

/** The typed text has the DD.MM.YYYY shape. It can still be a day that does not exist. */
export function isDottedShape(value: string): boolean {
  return DOTTED_DATE.test(value.trim());
}

/** The day of a DD.MM.YYYY text, or null when the shape is wrong or the day does not exist. */
export function parseDottedDate(value: string): DayStruct | null {
  const match = value.trim().match(DOTTED_DATE);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

function dateToStruct(date: Date): DayStruct {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function isoToStruct(isoDate: string): DayStruct {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month, day };
}

/** yyyy-mm-dd. The fixed width makes the string order the date order. */
function structToIso(date: DayStruct): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
}

/** Day 0 of the next month is the last day of this month. The month counts from 1. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

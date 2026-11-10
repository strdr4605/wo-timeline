/**
 * The pure logic of the drawer form: the default values and the date format of the design.
 * No Angular here, so plain vitest can test it.
 */

import { WorkOrder, WorkOrderStatus } from '../data/sample-data';

/** What the drawer is open for: a new order on a clicked cell, or an existing order. */
export type DrawerRequest =
  | { mode: 'create'; workCenterId: string; startDate: Date }
  | { mode: 'edit'; order: WorkOrder };

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

/** The brief: the end date of a new order is the start date plus 7 days. */
const DEFAULT_LENGTH_DAYS = 7;

/** The form values of a request: the order for edit, the defaults of the brief for create. */
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

  const start = request.startDate;
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + DEFAULT_LENGTH_DAYS);
  return {
    name: '',
    status: 'open',
    startDate: dateToStruct(start),
    endDate: dateToStruct(end),
  };
}

/** DD.MM.YYYY, as the date fields of the design ('01.01.2026'). */
export function formatDottedDate(date: DayStruct | null): string {
  if (!date) {
    return '';
  }
  return `${pad(date.day)}.${pad(date.month)}.${date.year}`;
}

export function parseDottedDate(value: string): DayStruct | null {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) {
    return null;
  }
  const [, day, month, year] = match.map(Number);
  return { year, month, day };
}

function dateToStruct(date: Date): DayStruct {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function isoToStruct(isoDate: string): DayStruct {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month, day };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

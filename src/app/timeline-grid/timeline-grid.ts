import {
  AfterViewInit,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { WorkOrder } from '../data/sample-data';
import {
  Timescale,
  TimelineColumn,
  WorkCenter,
  buildColumns,
  parseIsoDate,
  positionInColumns,
  todayPosition,
} from '../timeline/timeline';
import { PARITY_FIRST_COLUMN_OFFSET, PARITY_MODE, PARITY_TODAY } from '../parity';
import { BarPosition, WorkOrderBar } from '../work-order-bar/work-order-bar';

/** A bar with the two positions it is placed by. */
interface BarPlacement {
  order: WorkOrder;
  start: BarPosition;
  end: BarPosition;
}

@Component({
  selector: 'app-timeline-grid',
  imports: [WorkOrderBar],
  templateUrl: './timeline-grid.html',
  styleUrl: './timeline-grid.scss',
})
export class TimelineGrid implements AfterViewInit {
  readonly timescale = input.required<Timescale>();
  readonly workCenters = input.required<WorkCenter[]>();
  readonly workOrders = input.required<WorkOrder[]>();

  /** Captured once, so every column of one render speaks about the same day. */
  private readonly now = PARITY_MODE ? PARITY_TODAY : new Date();

  protected readonly columns = computed<TimelineColumn[]>(() =>
    buildColumns(this.timescale(), this.now),
  );
  protected readonly today = computed(() => todayPosition(this.columns(), this.now));
  protected readonly currentIndex = computed(() =>
    this.columns().findIndex((column) => column.current),
  );

  /** The bars of every work centre, placed by the dates of the order. */
  private readonly barsByCenter = computed(() => {
    const columns = this.columns();
    const timescale = this.timescale();
    const bars = new Map<string, BarPlacement[]>();

    for (const order of this.workOrders()) {
      const placement: BarPlacement = {
        order,
        start: positionInColumns(columns, timescale, parseIsoDate(order.startDate)),
        end: positionInColumns(columns, timescale, parseIsoDate(order.endDate)),
      };
      bars.set(order.workCenterId, [...(bars.get(order.workCenterId) ?? []), placement]);
    }

    return bars;
  });

  /** The work centre whose row is hovered. The rail row and the timeline row hover together. */
  protected readonly hovered = signal<string | null>(null);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  private readonly timeline = viewChild<ElementRef<HTMLElement>>('timeline');

  constructor() {
    // Runs after the render, so the columns of the new zoom level are in the DOM.
    afterRenderEffect(() => {
      this.timescale();
      this.scrollToStart();
    });
  }

  ngAfterViewInit(): void {
    this.scrollToStart();
  }

  /** The bars of one work centre. */
  protected barsOf(workCenterId: string): BarPlacement[] {
    return this.barsByCenter().get(workCenterId) ?? [];
  }

  /** The design view in parity mode, today in the middle otherwise. */
  private scrollToStart(): void {
    if (PARITY_MODE && this.timescale() === 'Month') {
      this.scrollToColumn(this.currentIndex() + PARITY_FIRST_COLUMN_OFFSET);
      return;
    }
    this.centerOnToday();
  }

  /** Scrolls the timeline so that the column sits at the left edge of the visible grid. */
  private scrollToColumn(index: number): void {
    const scroller = this.scroller()?.nativeElement;
    const rail = this.rail()?.nativeElement;
    const timeline = this.timeline()?.nativeElement;

    if (!scroller || !rail || !timeline) {
      return;
    }

    const columnWidth = parseFloat(
      getComputedStyle(timeline).getPropertyValue('--column-width'),
    );
    const contentLeft = timeline.getBoundingClientRect().left + timeline.clientLeft;
    scroller.scrollLeft += contentLeft + index * columnWidth - rail.getBoundingClientRect().right;
  }

  /** Scrolls the timeline so that today sits in the middle of the visible grid. */
  private centerOnToday(): void {
    const scroller = this.scroller()?.nativeElement;
    const rail = this.rail()?.nativeElement;
    const timeline = this.timeline()?.nativeElement;

    if (!scroller || !rail || !timeline) {
      return;
    }

    const columnWidth = parseFloat(
      getComputedStyle(timeline).getPropertyValue('--column-width'),
    );
    const { index, fraction } = this.today();

    // The marker of today sits at this offset inside the timeline content.
    const markerX = (index + fraction) * columnWidth;
    const contentLeft = timeline.getBoundingClientRect().left + timeline.clientLeft;

    // The rail is sticky, so the visible grid area starts at its right edge.
    const target = (rail.getBoundingClientRect().right + scroller.getBoundingClientRect().right) / 2;
    scroller.scrollLeft += contentLeft + markerX - target;
  }
}

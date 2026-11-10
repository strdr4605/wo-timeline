import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  NgZone,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { WorkOrder } from '../data/sample-data';
import {
  Timescale,
  TimelineColumn,
  WorkCenter,
  BUFFER,
  addDays,
  columnsInRange,
  dateAtPosition,
  isoDate,
  parseIsoDate,
  positionInColumns,
  todayPosition,
} from '../timeline/timeline';
import { PARITY_FIRST_COLUMN_OFFSET, PARITY_MODE, PARITY_TODAY } from '../parity';
import {
  BarNudge,
  BarPosition,
  BarResize,
  WorkOrderBar,
} from '../work-order-bar/work-order-bar';

/** The empty cell under the pointer: the row and the pointer x inside the row. */
interface CellHover {
  workCenterId: string;
  x: number;
}

/** An empty cell that was clicked: the row and the day under the pointer. */
export interface CellPick {
  workCenterId: string;
  date: Date;
}

/** A resized order asks for new dates. The app checks them and saves them. */
export interface ResizeRequest {
  order: WorkOrder;
  startDate: string;
  endDate: string;
}

/** The rail width limits and key step, read from the tokens in the CSS. */
interface RailLimits {
  min: number;
  max: number;
  step: number;
}

/** A pointer drag of the rail edge: the press x and the rail width at the press. */
interface RailDrag {
  originX: number;
  originWidth: number;
}

/** A bar with the two positions it is placed by. */
interface BarPlacement {
  /** The order as drawn: during a drag it has the preview dates. */
  order: WorkOrder;
  /** The order as stored. A drag measures from these dates. */
  source: WorkOrder;
  start: BarPosition;
  end: BarPosition;
}

@Component({
  selector: 'app-timeline-grid',
  imports: [WorkOrderBar],
  templateUrl: './timeline-grid.html',
  styleUrl: './timeline-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGrid implements AfterViewInit {
  readonly timescale = input.required<Timescale>();
  readonly workCenters = input.required<WorkCenter[]>();
  readonly workOrders = input.required<WorkOrder[]>();

  /** The row of the open create drawer. It stays highlighted while the overlay covers the grid. */
  readonly selectedCenterId = input<string | null>(null);

  /** The rail width chosen by the user, or null for the design width. */
  readonly railWidth = input<number | null>(null);

  readonly cellPick = output<CellPick>();
  readonly editOrder = output<WorkOrder>();
  readonly deleteOrder = output<WorkOrder>();
  readonly resizeOrder = output<ResizeRequest>();
  readonly railWidthChange = output<number>();

  /** Captured once, so every column of one render speaks about the same day. */
  private readonly now = PARITY_MODE ? PARITY_TODAY : new Date();

  /**
   * The rendered range as column offsets from today. A scroll near an edge extends it, a new
   * timescale and the Today button put it back to the buffer around today.
   */
  private readonly firstOffset = linkedSignal(() => -BUFFER[this.timescale()]);
  private readonly lastOffset = linkedSignal(() => BUFFER[this.timescale()]);

  protected readonly columns = computed<TimelineColumn[]>(() =>
    columnsInRange(this.timescale(), this.now, this.firstOffset(), this.lastOffset()),
  );
  protected readonly today = computed(() => todayPosition(this.columns(), this.now));
  protected readonly currentIndex = computed(() =>
    this.columns().findIndex((column) => column.current),
  );

  /** The chip names the current month, week or day. */
  protected readonly chipLabel = computed(() => CHIP_LABELS[this.timescale()]);

  /** The column whose right line is under the today line, or -1 when today is inside a column. */
  protected readonly lineUnderToday = computed(() => {
    const { index, fraction } = this.today();
    return fraction === 0 ? index - 1 : -1;
  });

  /** The bars of every work centre, placed by the dates of the order. */
  private readonly barsByCenter = computed(() => {
    const columns = this.columns();
    const timescale = this.timescale();
    const bars = new Map<string, BarPlacement[]>();

    const preview = this.resizePreview();

    for (const source of this.workOrders()) {
      const order = preview?.order.docId === source.docId ? { ...source, ...preview.dates } : source;
      const placement: BarPlacement = {
        order,
        source,
        start: positionInColumns(columns, timescale, parseIsoDate(order.startDate)),
        end: positionInColumns(columns, timescale, parseIsoDate(order.endDate)),
      };
      bars.set(order.workCenterId, [...(bars.get(order.workCenterId) ?? []), placement]);
    }

    return bars;
  });

  /** The dates of the bar that a pointer drag resizes, before the release commits them. */
  private readonly resizePreview = signal<{
    order: WorkOrder;
    dates: { startDate: string; endDate: string };
  } | null>(null);

  /** The work centre whose row is hovered. The rail row and the timeline row hover together. */
  protected readonly hovered = signal<string | null>(null);

  /** The placeholder box follows the pointer over the empty part of a timeline row. */
  protected readonly cellHover = signal<CellHover | null>(null);

  /** The rail width during a pointer drag. The release asks the parent to save it. */
  private readonly railPreview = signal<number | null>(null);
  protected readonly railDrag = signal<RailDrag | null>(null);
  protected readonly shownRailWidth = computed(() => this.railPreview() ?? this.railWidth());

  /** Null until the first render, because the CSS holds the limits. */
  protected readonly railLimits = signal<RailLimits | null>(null);
  /** The design width, read from the CSS with the limits. */
  private readonly defaultRailWidth = signal<number | null>(null);
  /** The width that the CSS draws: a saved width out of the limits is clamped there too. */
  protected readonly railValue = computed(() => {
    const width = this.shownRailWidth() ?? this.defaultRailWidth();
    return width === null ? null : this.clampRailWidth(width);
  });

  /** The resize label follows the pointer along the rail edge. */
  protected readonly railPointerY = signal<number | null>(null);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  private readonly timeline = viewChild<ElementRef<HTMLElement>>('timeline');
  private readonly railDivider = viewChild<ElementRef<HTMLElement>>('railDivider');

  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  /** True from an extend to the render of its columns, so one edge adds one chunk at a time. */
  private extending = false;

  /** True during the smooth scroll of the Today button: a left extend would stop that scroll. */
  private extendPaused = false;

  constructor() {
    afterNextRender(() => {
      this.readRailLimits();
      this.listenForEdges();
    });

    // Runs after the render, so the columns of the new zoom level are in the DOM. Only the
    // timescale triggers it: an extend changes the columns but must not move the view.
    afterRenderEffect(() => {
      this.timescale();
      untracked(() => this.scrollToStart());
    });
  }

  ngAfterViewInit(): void {
    this.scrollToStart();
  }

  /**
   * Scrolls the timeline so that today sits in the middle of the visible grid.
   * The Today button asks for a smooth scroll. Reduced motion jumps at once.
   */
  centerOnToday(smooth = false): void {
    if (this.resetRange()) {
      afterNextRender({ write: () => this.scrollToToday(smooth) }, { injector: this.injector });
      return;
    }
    this.scrollToToday(smooth);
  }

  private scrollToToday(smooth: boolean): void {
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

    // The visible grid area starts at the right edge of the sticky rail. The rail box is not used:
    // after a reset shrinks the range, the old scroll is past the content and the rail moves away.
    const scrollerBox = scroller.getBoundingClientRect();
    const railRight = scrollerBox.left + scroller.clientLeft + rail.getBoundingClientRect().width;
    const target = (railRight + scrollerBox.right) / 2;
    const left = scroller.scrollLeft + contentLeft + markerX - target;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = smooth && !reducedMotion;

    // The scrollend event ends the pause. A scroll of less than a pixel fires no scrollend.
    this.extendPaused = animate && Math.abs(left - scroller.scrollLeft) >= 1;
    scroller.scrollTo({ left, behavior: animate ? 'smooth' : 'instant' });
  }

  /**
   * A press on the rail edge starts a resize. Pointer capture keeps the drag alive when the
   * pointer leaves the edge. The default is prevented, so the press selects no text.
   */
  protected startRailResize(event: PointerEvent): void {
    const rail = this.rail()?.nativeElement;
    if (event.button !== 0 || !rail) {
      return;
    }
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.railDrag.set({ originX: event.clientX, originWidth: rail.getBoundingClientRect().width });
  }

  protected moveRailResize(event: PointerEvent): void {
    const drag = this.railDrag();
    if (drag === null) {
      const divider = event.currentTarget as HTMLElement;
      this.railPointerY.set(event.clientY - divider.getBoundingClientRect().top);
      return;
    }
    this.railPreview.set(this.clampRailWidth(drag.originWidth + event.clientX - drag.originX));
  }

  protected endRailResize(): void {
    const width = this.railPreview();
    if (this.railDrag() !== null && width !== null) {
      this.railWidthChange.emit(width);
    }
    this.cancelRailResize();
  }

  /** The browser took the pointer away, or Escape: the rail keeps its width. */
  protected cancelRailResize(): void {
    this.railDrag.set(null);
    this.railPreview.set(null);
  }

  /** Escape during a drag puts the rail back. The edge may not have the focus, so this is global. */
  @HostListener('document:keydown.escape', ['$event'])
  protected cancelRailResizeOnEscape(event: Event): void {
    if (this.railDrag() !== null) {
      event.preventDefault();
      this.cancelRailResize();
    }
  }

  /** The arrows change the width by one step, Home and End go to the limits. */
  protected onRailKeydown(event: KeyboardEvent): void {
    const limits = this.railLimits();
    const width = this.railValue();
    if (limits === null || width === null) {
      return;
    }

    const next = railKeyTarget(event.key, width, limits);
    if (next === null) {
      return;
    }
    // The arrows would scroll the grid.
    event.preventDefault();
    if (next !== width) {
      this.railWidthChange.emit(next);
    }
  }

  /** The bars of one work centre. */
  protected barsOf(workCenterId: string): BarPlacement[] {
    return this.barsByCenter().get(workCenterId) ?? [];
  }

  /**
   * A drag moves one edge by the pointer travel, snapped to whole days. The bar and its tooltip
   * show the preview. The release asks the app to save it, Escape drops it.
   */
  protected onBarResize(bar: BarPlacement, resize: BarResize): void {
    const dates = this.resizedDates(bar.source, resize);

    if (resize.phase === 'move') {
      this.resizePreview.set({ order: bar.source, dates });
      return;
    }

    if (resize.phase === 'end' && !sameDates(bar.source, dates)) {
      this.resizeOrder.emit({ order: bar.source, ...dates });
    }
    this.resizePreview.set(null);
  }

  /** Shift+Arrow and Alt+Shift+Arrow move one edge by one day. */
  protected onBarNudge(bar: BarPlacement, nudge: BarNudge): void {
    const { startDate, endDate } = bar.source;
    const edgeDate = nudge.edge === 'start' ? startDate : endDate;
    const moved = isoDate(addDays(parseIsoDate(edgeDate), nudge.days));

    this.resizeOrder.emit(
      nudge.edge === 'start'
        ? { order: bar.source, startDate: moved, endDate }
        : { order: bar.source, startDate, endDate: moved },
    );
  }

  /** Shows the placeholder under the pointer, or hides it while the pointer is on a bar. */
  protected trackCellHover(workCenterId: string, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.work-order-bar')) {
      this.cellHover.set(null);
      return;
    }

    const row = event.currentTarget as HTMLElement;
    this.cellHover.set({ workCenterId, x: event.clientX - row.getBoundingClientRect().left });
  }

  /** A row is highlighted while the pointer is on it or while its create drawer is open. */
  protected isHighlighted(workCenterId: string): boolean {
    return this.hovered() === workCenterId || this.selectedCenterId() === workCenterId;
  }

  /** A click on the empty part of a row asks for a new order that starts on the day under the pointer. */
  protected pickCell(workCenterId: string, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const timeline = this.timeline()?.nativeElement;
    if (target.closest('.work-order-bar') || !timeline) {
      return;
    }

    const row = event.currentTarget as HTMLElement;
    const columnWidth = parseFloat(getComputedStyle(timeline).getPropertyValue('--column-width'));
    const position = (event.clientX - row.getBoundingClientRect().left) / columnWidth;
    const column = this.columns()[Math.floor(position)];
    if (!column) {
      return;
    }

    this.cellPick.emit({ workCenterId, date: dayInColumn(column, position % 1) });
  }

  protected leaveRow(): void {
    this.hovered.set(null);
    this.cellHover.set(null);
  }

  /** The dates of an order with one edge moved by the pointer travel of a drag. */
  private resizedDates(order: WorkOrder, resize: BarResize): { startDate: string; endDate: string } {
    const timeline = this.timeline()?.nativeElement;
    if (!timeline || resize.phase === 'cancel') {
      return { startDate: order.startDate, endDate: order.endDate };
    }

    const columns = this.columns();
    const timescale = this.timescale();
    const columnWidth = parseFloat(getComputedStyle(timeline).getPropertyValue('--column-width'));
    const edgeDate = resize.edge === 'start' ? order.startDate : order.endDate;
    const origin = positionInColumns(columns, timescale, parseIsoDate(edgeDate));
    const position = origin.index + origin.fraction + resize.deltaX / columnWidth;
    const moved = isoDate(dateAtPosition(columns, timescale, position));

    return resize.edge === 'start'
      ? { startDate: moved, endDate: order.endDate }
      : { startDate: order.startDate, endDate: moved };
  }

  private clampRailWidth(width: number): number {
    const limits = this.railLimits();
    const rounded = Math.round(width);
    return limits ? Math.min(limits.max, Math.max(limits.min, rounded)) : rounded;
  }

  /** The limits live in the tokens. The CSS gives them to the divider as custom properties. */
  private readRailLimits(): void {
    const divider = this.railDivider()?.nativeElement;
    if (!divider) {
      return;
    }
    const style = getComputedStyle(divider);
    const read = (name: string) => parseFloat(style.getPropertyValue(name));

    this.railLimits.set({
      min: read('--rail-min-width'),
      max: read('--rail-max-width'),
      step: read('--rail-key-step'),
    });
    this.defaultRailWidth.set(read('--rail-default-width'));
  }

  /**
   * A scroll event fires many times a second. The listener runs outside Angular, so only an
   * extend starts change detection. Parity mode keeps the fixed range of the design.
   */
  private listenForEdges(): void {
    const scroller = this.scroller()?.nativeElement;
    if (PARITY_MODE || !scroller) {
      return;
    }

    const onScroll = () => this.extendAtEdges();
    const onScrollEnd = () => {
      this.extendPaused = false;
      this.extendAtEdges();
    };

    this.zone.runOutsideAngular(() => {
      scroller.addEventListener('scroll', onScroll, { passive: true });
      scroller.addEventListener('scrollend', onScrollEnd, { passive: true });
    });
    this.destroyRef.onDestroy(() => {
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('scrollend', onScrollEnd);
    });
  }

  /**
   * Adds a chunk of columns when less than one viewport of columns is left at an edge. After the
   * render it checks again, so a wide screen gets as many chunks as it needs.
   */
  private extendAtEdges(): void {
    const scroller = this.scroller()?.nativeElement;
    const timeline = this.timeline()?.nativeElement;
    if (this.extending || this.extendPaused || !scroller || !timeline) {
      return;
    }

    // A short range is near both edges. Both extend in one pass: with only the left one, the
    // short right side would clamp the scroll that keeps the view in place.
    const margin = scroller.clientWidth;
    const scrollLeft = scroller.scrollLeft;
    const columnWidth = parseFloat(getComputedStyle(timeline).getPropertyValue('--column-width'));
    const atLeft = scrollLeft < margin;
    const atRight = columnsRightGap(scroller, timeline, this.columns().length * columnWidth) < margin;
    if (!atLeft && !atRight) {
      return;
    }

    const shift = atLeft ? EXTEND_CHUNK * columnWidth : 0;
    const timescale = this.timescale();
    const firstOffset = atLeft ? this.firstOffset() - EXTEND_CHUNK : this.firstOffset();

    this.extending = true;
    this.zone.run(() => {
      if (atLeft) {
        this.firstOffset.set(firstOffset);
        // The row moves left under a still pointer, so the placeholder moves with the content.
        this.cellHover.update((hover) => hover && { ...hover, x: hover.x + shift });
      }
      if (atRight) {
        this.lastOffset.update((offset) => offset + EXTEND_CHUNK);
      }

      // The write runs before the paint, so the new left columns never show as a jump.
      afterNextRender(
        {
          write: () => {
            // A reset by the Today button or a new timescale already placed the view.
            const sameRange = this.timescale() === timescale && this.firstOffset() === firstOffset;
            if (atLeft && sameRange) {
              scroller.scrollLeft = scrollLeft + shift;
            }
            this.extending = false;
            this.extendAtEdges();
          },
        },
        { injector: this.injector },
      );
    });
  }

  /** Puts the range back to the buffer around today. True when the range changed. */
  private resetRange(): boolean {
    const buffer = BUFFER[this.timescale()];
    if (this.firstOffset() === -buffer && this.lastOffset() === buffer) {
      return false;
    }
    this.firstOffset.set(-buffer);
    this.lastOffset.set(buffer);
    return true;
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
    // The left border of the timeline stays visible next to the rail, as in the design.
    const contentLeft = timeline.getBoundingClientRect().left + timeline.clientLeft;
    const visibleLeft = rail.getBoundingClientRect().right + timeline.clientLeft;
    scroller.scrollLeft += contentLeft + index * columnWidth - visibleLeft;
  }
}

/** The columns that one extend adds at an edge. A chunk of day columns is wider than the screen. */
const EXTEND_CHUNK = 30;

/**
 * The width from the right edge of the visible grid to the end of the last column. The
 * scrollWidth is not used: a bar can end far past the last column, and then the right edge
 * never comes near.
 */
function columnsRightGap(scroller: HTMLElement, timeline: HTMLElement, columnsWidth: number): number {
  const contentLeft = timeline.getBoundingClientRect().left + timeline.clientLeft;
  const visibleRight = scroller.getBoundingClientRect().left + scroller.clientLeft + scroller.clientWidth;
  return contentLeft + columnsWidth - visibleRight;
}

/** The day at a fraction of a column. An hour column sits inside one day. */
function dayInColumn(column: TimelineColumn, fraction: number): Date {
  const days = Math.round((column.end.getTime() - column.start.getTime()) / 86_400_000);
  const start = column.start;
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + Math.floor(fraction * days));
}

/** The width that a key asks for, or null for a key that does not resize. */
function railKeyTarget(key: string, width: number, limits: RailLimits): number | null {
  const clamp = (value: number) => Math.min(limits.max, Math.max(limits.min, value));
  switch (key) {
    case 'ArrowLeft':
      return clamp(width - limits.step);
    case 'ArrowRight':
      return clamp(width + limits.step);
    case 'Home':
      return limits.min;
    case 'End':
      return limits.max;
    default:
      return null;
  }
}

function sameDates(order: WorkOrder, dates: { startDate: string; endDate: string }): boolean {
  return order.startDate === dates.startDate && order.endDate === dates.endDate;
}

/** The chip text per zoom level. Hour columns sit inside today, so Hour names the day. */
const CHIP_LABELS: Record<Timescale, string> = {
  Hour: 'Today',
  Day: 'Today',
  Week: 'Current week',
  Month: 'Current month',
};

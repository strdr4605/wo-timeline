import {
  AfterViewInit,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  viewChild,
} from '@angular/core';
import {
  Timescale,
  TimelineColumn,
  WorkCenter,
  buildColumns,
  todayPosition,
} from '../timeline/timeline';

@Component({
  selector: 'app-timeline-grid',
  templateUrl: './timeline-grid.html',
  styleUrl: './timeline-grid.scss',
})
export class TimelineGrid implements AfterViewInit {
  readonly timescale = input.required<Timescale>();
  readonly workCenters = input.required<WorkCenter[]>();

  /** Captured once, so every column of one render speaks about the same day. */
  private readonly now = new Date();

  protected readonly columns = computed<TimelineColumn[]>(() =>
    buildColumns(this.timescale(), this.now),
  );
  protected readonly today = computed(() => todayPosition(this.columns(), this.now));
  protected readonly currentIndex = computed(() =>
    this.columns().findIndex((column) => column.current),
  );

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  private readonly timeline = viewChild<ElementRef<HTMLElement>>('timeline');

  constructor() {
    // Runs after the render, so the columns of the new zoom level are in the DOM.
    afterRenderEffect(() => {
      this.timescale();
      this.centerOnToday();
    });
  }

  ngAfterViewInit(): void {
    this.centerOnToday();
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

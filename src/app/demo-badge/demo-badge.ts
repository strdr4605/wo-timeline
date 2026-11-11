import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * The live DOM counter of demo mode: the order count, the bars and the columns in the DOM, and
 * the longest frame of the last half second. It shows what the windowing of the grid saves.
 */
@Component({
  selector: 'app-demo-badge',
  template: `
    <p class="demo-badge" role="status" aria-live="off">
      Orders <span data-count="orders">{{ orderCount() }}</span> · bars in DOM
      <span data-count="bars">{{ bars() }}</span> · columns in DOM
      <span data-count="columns">{{ columns() }}</span> · frame
      <span data-count="frame">{{ frame() }}</span> ms
    </p>
  `,
  styleUrl: './demo-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoBadge {
  readonly orderCount = input.required<number>();

  protected readonly bars = signal(0);
  protected readonly columns = signal(0);
  protected readonly frame = signal(0);

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.measure()));
  }

  /**
   * A frame loop outside Angular records the frame gaps. A scroll and a slow tick read the DOM.
   * A signal changes only when its value changes, so an idle badge starts no change detection.
   */
  private measure(): void {
    let frames: number[] = [];
    let last = performance.now();
    const tick = (now: number) => {
      frames.push(now - last);
      last = now;
      frameId = requestAnimationFrame(tick);
    };
    let frameId = requestAnimationFrame(tick);

    const update = () => {
      this.bars.set(document.querySelectorAll('.work-order-bar').length);
      this.columns.set(document.querySelectorAll('.grid-header-cell').length);
      this.frame.set(Math.round(Math.max(0, ...frames)));
      frames = [];
    };
    const timer = setInterval(update, FRAME_WINDOW_MS);
    // The scroller is not the document: a capture listener sees the scroll of every element.
    document.addEventListener('scroll', update, { capture: true, passive: true });

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frameId);
      clearInterval(timer);
      document.removeEventListener('scroll', update, { capture: true });
    });
    update();
  }
}

/** The frame value is the longest frame of this window. */
const FRAME_WINDOW_MS = 500;

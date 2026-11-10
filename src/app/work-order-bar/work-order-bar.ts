import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { WorkOrder } from '../data/sample-data';
import { parseIsoDate } from '../timeline/timeline';
import { menuKeyTarget } from '../keyboard';

/** Where a bar sits: the index of its column and the fraction of that column. */
export interface BarPosition {
  index: number;
  fraction: number;
}

/** The end of the bar that a resize moves. */
export type BarEdge = 'start' | 'end';

/**
 * One step of a pointer resize. `deltaX` is the pointer travel in pixels since the press. The
 * grid turns it into a date, because only the grid knows the columns.
 */
export interface BarResize {
  edge: BarEdge;
  phase: 'move' | 'end' | 'cancel';
  deltaX: number;
}

/** A keyboard resize: one edge moves by a number of days. */
export interface BarNudge {
  edge: BarEdge;
  days: number;
}

export const STATUS_LABELS: Record<WorkOrder['status'], string> = {
  open: 'Open',
  'in-progress': 'In progress',
  complete: 'Complete',
  blocked: 'Blocked',
};

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

@Component({
  selector: 'app-work-order-bar',
  templateUrl: './work-order-bar.html',
  styleUrl: './work-order-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderBar {
  readonly order = input.required<WorkOrder>();
  readonly start = input.required<BarPosition>();
  readonly end = input.required<BarPosition>();

  readonly edit = output<void>();
  readonly remove = output<void>();
  readonly resize = output<BarResize>();
  readonly nudge = output<BarNudge>();

  /** The bar is hovered. The row hover is a class of its own, this one is the bar. */
  protected readonly hovered = signal(false);
  /** The handle under the pointer. The design then shows both handles and the dates at once. */
  protected readonly hoveredEdge = signal<BarEdge | null>(null);
  protected readonly edgeHovered = computed(() => this.hoveredEdge() !== null);

  /** The handle that a pointer drag holds. The resize label hides: the dates show the change. */
  protected readonly resizing = signal<BarEdge | null>(null);
  /** The three-dot menu is open. */
  protected readonly menuOpen = signal(false);

  protected readonly statusLabel = computed(() => STATUS_LABELS[this.order().status]);

  protected readonly dateRange = computed(
    () =>
      `${DATE_FORMAT.format(parseIsoDate(this.order().startDate))} to ${DATE_FORMAT.format(
        parseIsoDate(this.order().endDate),
      )}`,
  );

  /** A screen reader reads the content of the tooltip, which only the pointer can show. */
  protected readonly accessibleName = computed(
    () => `${this.order().name}, ${this.statusLabel()}, ${this.dateRange()}`,
  );

  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly injector = inject(Injector);

  /** The pointer x at the press of the handle. */
  private dragOriginX = 0;

  /**
   * The press on a handle starts a resize. Pointer capture keeps the drag alive when the pointer
   * leaves the bar. The default is prevented, so the press selects no text.
   */
  protected startResize(edge: BarEdge, event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragOriginX = event.clientX;
    this.resizing.set(edge);
  }

  protected moveResize(event: PointerEvent): void {
    const edge = this.resizing();
    if (edge !== null) {
      this.resize.emit({ edge, phase: 'move', deltaX: event.clientX - this.dragOriginX });
    }
  }

  protected endResize(event: PointerEvent): void {
    this.finishResize('end', event.clientX - this.dragOriginX);
  }

  /** The browser took the pointer away (for example a touch scroll): nothing changes. */
  protected cancelResize(): void {
    this.finishResize('cancel', 0);
  }

  /** A click on a handle ends a drag. It must not reach the row, the menu or the drawer. */
  protected swallowClick(event: Event): void {
    event.stopPropagation();
  }

  /** Escape during a drag puts the bar back. The bar may not have the focus, so this is global. */
  @HostListener('document:keydown.escape', ['$event'])
  protected cancelResizeOnEscape(event: Event): void {
    if (this.resizing() !== null) {
      event.preventDefault();
      this.finishResize('cancel', 0);
    }
  }

  /**
   * Enter or Space on the focused bar opens its menu, as a click on the three-dot button. Escape
   * closes the menu and gives the focus back to the bar.
   */
  protected onBarKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.menuOpen()) {
      event.preventDefault();
      this.menuOpen.set(false);
      this.bar().nativeElement.focus();
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }
    const nudge = nudgeFor(event);
    if (nudge !== null) {
      // The arrows would scroll the grid.
      event.preventDefault();
      this.nudge.emit(nudge);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // Space would scroll the grid.
      event.preventDefault();
      this.openMenuWithFocus();
    }
  }

  /** The arrows move between the menu items. The bar handles Escape. */
  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems();
    const index = items.indexOf(event.target as HTMLElement);
    const next = menuKeyTarget(event.key, index, items.length);
    if (next !== null) {
      event.preventDefault();
      items[next].focus();
    }
  }

  /** Tab out of the bar closes its menu, so no open menu stays behind the focus. */
  protected closeMenuOnFocusLeave(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.bar().nativeElement.contains(next)) {
      this.menuOpen.set(false);
    }
  }

  /**
   * The bar takes the focus before the drawer opens. The drawer gives the focus back to it on
   * close, because the menu item is then inert.
   */
  protected activate(action: 'edit' | 'remove'): void {
    this.bar().nativeElement.focus({ preventScroll: true });
    this.menuOpen.set(false);
    if (action === 'edit') {
      this.edit.emit();
    } else {
      this.remove.emit();
    }
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  /** A click outside the bar closes the menu. */
  @HostListener('document:click')
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** The menu is inert until it opens, so the first item can take the focus only after render. */
  private openMenuWithFocus(): void {
    this.menuOpen.set(true);
    afterNextRender(() => this.menuItems()[0]?.focus(), { injector: this.injector });
  }

  private menuItems(): HTMLElement[] {
    return Array.from(this.bar().nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  }

  private finishResize(phase: 'end' | 'cancel', deltaX: number): void {
    const edge = this.resizing();
    if (edge === null) {
      return;
    }
    this.resizing.set(null);
    this.resize.emit({ edge, phase, deltaX });
  }
}

/** Shift+Arrow moves the end date one day, Alt+Shift+Arrow the start date. */
function nudgeFor(event: KeyboardEvent): BarNudge | null {
  if (!event.shiftKey || event.ctrlKey || event.metaKey) {
    return null;
  }
  const days = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (days === 0) {
    return null;
  }
  return { edge: event.altKey ? 'start' : 'end', days };
}

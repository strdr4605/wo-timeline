import {
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
})
export class WorkOrderBar {
  readonly order = input.required<WorkOrder>();
  readonly start = input.required<BarPosition>();
  readonly end = input.required<BarPosition>();

  readonly edit = output<void>();
  readonly remove = output<void>();

  /** The bar is hovered. The row hover is a class of its own, this one is the bar. */
  protected readonly hovered = signal(false);
  /** The pointer is on a drag handle: the design then shows both handles and the dates at once. */
  protected readonly edgeHovered = signal(false);
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
}

import { Component, HostListener, computed, input, signal } from '@angular/core';
import { WorkOrder } from '../data/sample-data';
import { parseIsoDate } from '../timeline/timeline';

/** Where a bar sits: the index of its column and the fraction of that column. */
export interface BarPosition {
  index: number;
  fraction: number;
}

const STATUS_LABELS: Record<WorkOrder['status'], string> = {
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

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  /** A click outside the bar closes the menu. */
  @HostListener('document:click')
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

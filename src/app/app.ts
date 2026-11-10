import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ScheduleService } from './data/schedule.service';
import { Timescale } from './timeline/timeline';
import { TimescaleChip } from './timescale-chip/timescale-chip';
import { CellPick, ResizeRequest, TimelineGrid } from './timeline-grid/timeline-grid';
import { WorkOrder } from './data/sample-data';
import { PARITY_MODE } from './parity';
import { DrawerRequest } from './work-order-drawer/drawer-form';
import { WorkOrderDrawer } from './work-order-drawer/work-order-drawer';

@Component({
  selector: 'app-root',
  imports: [TimescaleChip, TimelineGrid, WorkOrderDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Month is the default of the design and of the owner demo. See decision Q1. */
  protected readonly timescale = signal<Timescale>('Month');

  protected readonly parityMode = PARITY_MODE;

  private readonly schedule = inject(ScheduleService);

  protected readonly workCenters = this.schedule.workCenters;
  protected readonly workOrders = this.schedule.workOrders;

  /** The reason the last resize was refused. It hides after a few seconds. */
  protected readonly resizeError = signal<string | null>(null);
  private resizeErrorTimer: ReturnType<typeof setTimeout> | undefined;

  /** The open drawer, or null. */
  protected readonly drawer = signal<DrawerRequest | null>(null);

  /** The design keeps the clicked row highlighted under the overlay. */
  protected readonly selectedCenterId = computed(() => {
    const request = this.drawer();
    return request?.mode === 'create' ? request.workCenterId : null;
  });

  protected openCreate(pick: CellPick): void {
    this.drawer.set({ mode: 'create', workCenterId: pick.workCenterId, startDate: pick.date });
  }

  protected openEdit(order: WorkOrder): void {
    this.drawer.set({ mode: 'edit', order });
  }

  protected deleteOrder(order: WorkOrder): void {
    this.schedule.remove(order.docId);
  }

  /**
   * A resize keeps the rules of the drawer: the end after the start and no overlap on the work
   * centre. A refused resize keeps the old dates and says why.
   */
  protected resizeOrder({ order, startDate, endDate }: ResizeRequest): void {
    if (endDate <= startDate) {
      this.showResizeError('The end date must be after the start date.');
      return;
    }

    const { docId, ...draft } = order;
    if (this.schedule.save({ ...draft, startDate, endDate }, docId) === 'overlap') {
      const center = this.workCenters().find((c) => c.id === order.workCenterId)?.name ?? '';
      this.showResizeError(`These dates overlap another order on ${center}.`);
      return;
    }

    this.resizeError.set(null);
  }

  private showResizeError(message: string): void {
    clearTimeout(this.resizeErrorTimer);
    this.resizeError.set(message);
    this.resizeErrorTimer = setTimeout(() => this.resizeError.set(null), RESIZE_ERROR_MS);
  }
}

/** How long the resize error stays on screen. A behaviour value, not a design token. */
const RESIZE_ERROR_MS = 4000;

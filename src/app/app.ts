import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ScheduleService } from './data/schedule.service';
import { Timescale, WorkCenter } from './timeline/timeline';
import { TimescaleChip } from './timescale-chip/timescale-chip';
import { CellPick, ResizeRequest, TimelineGrid } from './timeline-grid/timeline-grid';
import { WorkOrder } from './data/sample-data';
import { PARITY_MODE } from './parity';
import { DEMO_CENTER_COUNT, DEMO_MODE, DEMO_ORDER_COUNT, generateDemoCenters, generateDemoOrders } from './demo';
import { DemoBadge } from './demo-badge/demo-badge';
import { DrawerRequest } from './work-order-drawer/drawer-form';
import { WorkOrderDrawer } from './work-order-drawer/work-order-drawer';

@Component({
  selector: 'app-root',
  imports: [TimescaleChip, TimelineGrid, WorkOrderDrawer, DemoBadge],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Month is the default of the design and of the owner demo. See decision Q1. */
  protected readonly timescale = signal<Timescale>('Month');

  protected readonly parityMode = PARITY_MODE;

  protected readonly demoMode = DEMO_MODE;

  private readonly schedule = inject(ScheduleService);

  protected readonly workCenters = this.schedule.workCenters;
  protected readonly workOrders = this.schedule.workOrders;
  protected readonly railWidth = this.schedule.railWidth;

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

  /** The bar of the open edit drawer stays in the DOM of the grid. */
  protected readonly drawerOrderId = computed(() => {
    const request = this.drawer();
    return request?.mode === 'edit' ? request.order.docId : null;
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

  /** About 5,000 orders on the current work centres, in memory only. */
  protected loadDemoOrders(): void {
    this.loadDemo(this.workCenters());
  }

  /** The sample work centres and 50 more, with about 5,000 orders spread over all of them. */
  protected loadDemoCenters(): void {
    const sampleCenters = this.workCenters().filter((center) => !center.id.startsWith('demo-'));
    this.loadDemo([...sampleCenters, ...generateDemoCenters(DEMO_CENTER_COUNT)]);
  }

  protected resetData(): void {
    this.drawer.set(null);
    this.schedule.resetData();
  }

  protected resizeRail(width: number): void {
    this.schedule.saveRailWidth(width);
  }

  private loadDemo(centers: WorkCenter[]): void {
    this.drawer.set(null);
    this.schedule.loadDemo(centers, generateDemoOrders(centers, DEMO_ORDER_COUNT, new Date()));
  }

  private showResizeError(message: string): void {
    clearTimeout(this.resizeErrorTimer);
    this.resizeError.set(message);
    this.resizeErrorTimer = setTimeout(() => this.resizeError.set(null), RESIZE_ERROR_MS);
  }
}

/** How long the resize error stays on screen. A behaviour value, not a design token. */
const RESIZE_ERROR_MS = 4000;

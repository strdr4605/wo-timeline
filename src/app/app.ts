import { Component, computed, inject, signal } from '@angular/core';
import { ScheduleService } from './data/schedule.service';
import { Timescale } from './timeline/timeline';
import { TimescaleChip } from './timescale-chip/timescale-chip';
import { CellPick, TimelineGrid } from './timeline-grid/timeline-grid';
import { WorkOrder } from './data/sample-data';
import { PARITY_MODE } from './parity';
import { DrawerRequest } from './work-order-drawer/drawer-form';
import { WorkOrderDrawer } from './work-order-drawer/work-order-drawer';

@Component({
  selector: 'app-root',
  imports: [TimescaleChip, TimelineGrid, WorkOrderDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Month is the default of the design and of the owner demo. See decision Q1. */
  protected readonly timescale = signal<Timescale>('Month');

  protected readonly parityMode = PARITY_MODE;

  private readonly schedule = inject(ScheduleService);

  protected readonly workCenters = this.schedule.workCenters;
  protected readonly workOrders = this.schedule.workOrders;

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
}

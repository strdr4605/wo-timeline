import { Component, inject, signal } from '@angular/core';
import { ScheduleService } from './data/schedule.service';
import { Timescale } from './timeline/timeline';
import { TimescaleChip } from './timescale-chip/timescale-chip';
import { TimelineGrid } from './timeline-grid/timeline-grid';

@Component({
  selector: 'app-root',
  imports: [TimescaleChip, TimelineGrid],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Month is the default of the design and of the owner demo. See decision Q1. */
  protected readonly timescale = signal<Timescale>('Month');

  private readonly schedule = inject(ScheduleService);

  protected readonly workCenters = this.schedule.workCenters;
  protected readonly workOrders = this.schedule.workOrders;
}

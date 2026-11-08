import { Component, signal } from '@angular/core';
import { Timescale, WorkCenter } from './timeline/timeline';
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

  // Placeholder rows. The sample data set belongs to a later wave.
  protected readonly workCenters: WorkCenter[] = [
    { id: 'genesis-hardware', name: 'Genesis Hardware' },
    { id: 'rodriques-electrics', name: 'Rodriques Electrics' },
    { id: 'konsulting-inc', name: 'Konsulting Inc' },
    { id: 'mcmarrow-distribution', name: 'McMarrow Distribution' },
    { id: 'spartan-manufacturing', name: 'Spartan Manufacturing' },
  ];
}

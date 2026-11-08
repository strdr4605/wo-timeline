import { Component } from '@angular/core';
import { TimescaleChip } from './timescale-chip/timescale-chip';

interface WorkCenter {
  id: string;
  name: string;
}

@Component({
  selector: 'app-root',
  imports: [TimescaleChip],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly timescale = 'Month';

  protected readonly months = ['Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027'];

  // Placeholder rows. The sample data set belongs to a later wave.
  protected readonly workCenters: WorkCenter[] = [
    { id: 'genesis-hardware', name: 'Genesis Hardware' },
    { id: 'rodriques-electrics', name: 'Rodriques Electrics' },
    { id: 'konsulting-inc', name: 'Konsulting Inc' },
    { id: 'mcmarrow-distribution', name: 'McMarrow Distribution' },
    { id: 'spartan-manufacturing', name: 'Spartan Manufacturing' },
  ];
}

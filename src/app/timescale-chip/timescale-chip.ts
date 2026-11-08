import { Component, input } from '@angular/core';

@Component({
  selector: 'app-timescale-chip',
  templateUrl: './timescale-chip.html',
  styleUrl: './timescale-chip.scss',
})
export class TimescaleChip {
  readonly label = input('Timescale');
  readonly value = input('Month');
}

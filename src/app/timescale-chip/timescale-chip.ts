import { Component, ElementRef, HostListener, input, output, signal } from '@angular/core';
import { Timescale } from '../timeline/timeline';

@Component({
  selector: 'app-timescale-chip',
  templateUrl: './timescale-chip.html',
  styleUrl: './timescale-chip.scss',
})
export class TimescaleChip {
  readonly label = input('Timescale');
  readonly value = input<Timescale>('Month');
  readonly options = input<Timescale[]>(['Day', 'Week', 'Month']);
  readonly valueChange = output<Timescale>();

  /** The menu is a styled list, not a system dropdown. */
  protected readonly open = signal(false);

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected select(option: Timescale): void {
    this.open.set(false);
    this.valueChange.emit(option);
  }

  @HostListener('document:click', ['$event'])
  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}

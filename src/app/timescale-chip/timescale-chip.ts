import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TIMESCALES, Timescale } from '../timeline/timeline';
import { menuKeyTarget } from '../keyboard';

@Component({
  selector: 'app-timescale-chip',
  templateUrl: './timescale-chip.html',
  styleUrl: './timescale-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimescaleChip {
  readonly label = input('Timescale');
  readonly value = input<Timescale>('Month');
  readonly options = input<Timescale[]>(TIMESCALES);
  readonly valueChange = output<Timescale>();

  /** The menu is a styled list, not a system dropdown. */
  protected readonly open = signal(false);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  /**
   * A click from the keyboard (Enter or Space, `detail` 0) moves the focus into the menu. A
   * pointer click does not, so the focus ring does not show in the design state.
   */
  protected toggle(event: MouseEvent): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    this.open.set(true);
    if (event.detail === 0) {
      this.focusOption(this.value());
    }
  }

  protected select(option: Timescale): void {
    const focusInMenu = this.elementRef.nativeElement.contains(document.activeElement);
    this.open.set(false);
    this.valueChange.emit(option);
    if (focusInMenu) {
      this.trigger().nativeElement.focus();
    }
  }

  /**
   * The keyboard model of a select: the arrows open the menu and move between the options,
   * Escape closes the menu and gives the focus back to the chip.
   */
  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.open.set(false);
      this.trigger().nativeElement.focus();
      return;
    }

    const options = this.optionButtons();
    const index = options.indexOf(event.target as HTMLElement);
    if (index === -1) {
      if (!this.open() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        this.open.set(true);
        this.focusOption(this.value());
      }
      return;
    }

    const next = menuKeyTarget(event.key, index, options.length);
    if (next !== null) {
      event.preventDefault();
      options[next].focus();
    }
  }

  /** Tab out of the chip closes the menu. */
  @HostListener('focusout', ['$event'])
  protected closeOnFocusLeave(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.elementRef.nativeElement.contains(next)) {
      this.open.set(false);
    }
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

  /** The menu exists only while it is open, so the option can take the focus only after render. */
  private focusOption(option: Timescale): void {
    afterNextRender(() => this.optionButtons()[this.options().indexOf(option)]?.focus(), {
      injector: this.injector,
    });
  }

  private optionButtons(): HTMLElement[] {
    return Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[role="option"]'),
    );
  }
}

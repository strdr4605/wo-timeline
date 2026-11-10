import {
  Component,
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { NgLabelTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { WorkOrderStatus } from '../data/sample-data';
import { STATUS_LABELS } from '../work-order-bar/work-order-bar';
import { DrawerRequest, formatDottedDate, formValueFor, parseDottedDate } from './drawer-form';

/** The status options of the dropdown, in the order of the design. */
const STATUS_OPTIONS: { value: WorkOrderStatus; label: string }[] = (
  ['open', 'in-progress', 'complete', 'blocked'] as const
).map((value) => ({ value, label: STATUS_LABELS[value] }));

@Component({
  selector: 'app-work-order-drawer',
  imports: [ReactiveFormsModule, NgSelectComponent, NgLabelTemplateDirective, NgbInputDatepicker],
  templateUrl: './work-order-drawer.html',
  styleUrl: './work-order-drawer.scss',
  providers: [{ provide: NgbDateParserFormatter, useFactory: () => new DottedDateFormatter() }],
})
export class WorkOrderDrawer {
  /** The open request, or null when the drawer is closed. */
  readonly request = input<DrawerRequest | null>(null);

  readonly closed = output<void>();

  protected readonly open = computed(() => this.request() !== null);
  protected readonly submitLabel = computed(() =>
    this.request()?.mode === 'edit' ? 'Save' : 'Create',
  );

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    status: new FormControl<WorkOrderStatus>('open', { nonNullable: true }),
    startDate: new FormControl<NgbDateStruct | null>(null, Validators.required),
    endDate: new FormControl<NgbDateStruct | null>(null, Validators.required),
  });

  private readonly statusSelect = viewChildren(NgSelectComponent);
  private readonly datepickers = viewChildren(NgbInputDatepicker);

  constructor() {
    effect(() => {
      const request = this.request();
      if (request) {
        this.form.reset(formValueFor(request));
      }
    });

    this.closeOnEscape();
  }

  protected cancel(): void {
    this.closed.emit();
  }

  /** Saving and validation belong to the next unit. For now the button only closes. */
  protected submit(): void {
    this.closed.emit();
  }

  /**
   * Escape closes the drawer, but not while a dropdown or a calendar is open: then Escape closes
   * only that popup. The listener runs in the capture phase, before ng-select and the datepicker
   * close their popups, so their open state is still true here.
   */
  private closeOnEscape(): void {
    const document = inject(DOCUMENT);
    const listener = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !this.open() || this.popupOpen()) {
        return;
      }
      this.closed.emit();
    };

    document.addEventListener('keydown', listener, true);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', listener, true));
  }

  private popupOpen(): boolean {
    return (
      this.statusSelect().some((select) => select.isOpen()) ||
      this.datepickers().some((picker) => picker.isOpen())
    );
  }
}

/** The design writes dates as DD.MM.YYYY. */
@Injectable()
export class DottedDateFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    return parseDottedDate(value);
  }

  format(date: NgbDateStruct | null): string {
    return formatDottedDate(date);
  }
}

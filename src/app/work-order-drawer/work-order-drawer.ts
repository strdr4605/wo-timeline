import {
  Component,
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { NgLabelTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { WorkOrderStatus } from '../data/sample-data';
import { ScheduleService } from '../data/schedule.service';
import { STATUS_LABELS } from '../work-order-bar/work-order-bar';
import {
  DayStruct,
  DrawerRequest,
  draftFor,
  formatDottedDate,
  formValueFor,
  isEndAfterStart,
  parseDottedDate,
} from './drawer-form';

/** The status options of the dropdown, in the order of the design. */
const STATUS_OPTIONS: { value: WorkOrderStatus; label: string }[] = (
  ['open', 'in-progress', 'complete', 'blocked'] as const
).map((value) => ({ value, label: STATUS_LABELS[value] }));

type DateField = 'startDate' | 'endDate';

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

  protected readonly form = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
      status: new FormControl<WorkOrderStatus>('open', { nonNullable: true }),
      startDate: new FormControl<NgbDateStruct | null>(null, Validators.required),
      endDate: new FormControl<NgbDateStruct | null>(null, Validators.required),
    },
    { validators: endAfterStart },
  );

  /**
   * The errors stay hidden until the first Create or Save. A field that the user only passes
   * through must not turn red.
   */
  protected readonly submitted = signal(false);

  /** The name of the work centre that the dates collide on, or null. */
  protected readonly overlapCenter = signal<string | null>(null);

  private readonly schedule = inject(ScheduleService);
  private readonly statusSelect = viewChildren(NgSelectComponent);
  private readonly datepickers = viewChildren(NgbInputDatepicker);

  constructor() {
    effect(() => {
      const request = this.request();
      if (request) {
        this.form.reset(formValueFor(request));
        this.submitted.set(false);
        this.overlapCenter.set(null);
      }
    });

    // The overlap message is about the old values. A changed value makes it stale.
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.overlapCenter.set(null));

    this.closeOnEscape();
  }

  protected nameError(): string | null {
    if (!this.submitted() || this.form.controls.name.valid) {
      return null;
    }
    return 'Enter a work order name.';
  }

  protected dateError(field: DateField): string | null {
    const control = this.form.controls[field];
    if (!this.submitted()) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Enter a date.';
    }
    if (control.invalid) {
      return 'Enter the date as dd.mm.yyyy.';
    }
    if (field === 'endDate' && this.form.hasError('endBeforeStart')) {
      return 'The end date must be after the start date.';
    }
    return null;
  }

  protected cancel(): void {
    this.closed.emit();
  }

  protected submit(): void {
    const request = this.request();
    this.submitted.set(true);
    if (!request || this.form.invalid) {
      return;
    }

    // A valid form has both dates.
    const { name, status, startDate, endDate } = this.form.getRawValue();
    const draft = draftFor(request, { name, status, startDate: startDate!, endDate: endDate! });
    const docId = request.mode === 'edit' ? request.order.docId : undefined;
    if (this.schedule.save(draft, docId) === 'overlap') {
      this.overlapCenter.set(this.centerName(draft.workCenterId));
      return;
    }

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

  private centerName(workCenterId: string): string {
    return (
      this.schedule.workCenters().find((center) => center.id === workCenterId)?.name ??
      'this work center'
    );
  }

  private popupOpen(): boolean {
    return (
      this.statusSelect().some((select) => select.isOpen()) ||
      this.datepickers().some((picker) => picker.isOpen())
    );
  }
}

/**
 * The end date must be after the start date. A field that is empty or not a date has its own
 * error, so this check waits for two real dates.
 */
function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;
  if (!isDay(start) || !isDay(end)) {
    return null;
  }
  return isEndAfterStart(start, end) ? null : { endBeforeStart: true };
}

/** ngbDatepicker writes the typed text into the control when it cannot parse it. */
function isDay(value: unknown): value is DayStruct {
  return typeof value === 'object' && value !== null && 'year' in value;
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

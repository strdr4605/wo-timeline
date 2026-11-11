import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  ElementRef,
  Injectable,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
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
  NgbDatepicker,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { NgLabelTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { WorkOrderStatus } from '../data/sample-data';
import { ScheduleService } from '../data/schedule.service';
import { PARITY_MODE } from '../parity';
import { STATUS_LABELS } from '../work-order-bar/work-order-bar';
import {
  DayStruct,
  DrawerRequest,
  draftFor,
  formatDottedDate,
  formValueFor,
  isDottedShape,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
   * The name error stays hidden until the first Create or Save. A field that the user only
   * passes through must not turn red.
   */
  protected readonly submitted = signal(false);

  /**
   * The date field that has the focus, or null. Before the first Create or Save, its error waits
   * for the blur (E1). A mouse pick marks the field touched, but the user can still be in the
   * middle of a correction.
   */
  protected readonly editedDate = signal<DateField | null>(null);

  /** The name of the work centre that the dates collide on, or null. */
  protected readonly overlapCenter = signal<string | null>(null);

  private readonly schedule = inject(ScheduleService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly statusSelect = viewChildren(NgSelectComponent);
  private readonly datepickers = viewChildren(NgbInputDatepicker);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  constructor() {
    effect(() => {
      const request = this.request();
      if (request) {
        this.form.reset(formValueFor(request));
        this.submitted.set(false);
        this.overlapCenter.set(null);
      }
    });

    // The overlap message is about the old values. A changed value makes it stale. The datepicker
    // popup and the ng-select panel write the value from outside this view, so OnPush must be told.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.overlapCenter.set(null);
      this.changeDetector.markForCheck();
    });

    this.closeOnEscape();
    this.manageFocus();
    this.trapFocus();
  }

  protected nameError(): string | null {
    if (!this.submitted() || this.form.controls.name.valid) {
      return null;
    }
    return 'Enter a work order name.';
  }

  /**
   * A date field shows its own error when it loses focus: a typo must show before Create. After
   * the first Create or Save, the error follows the typed text at once. The end-before-start
   * error waits for the first Create or Save, because the user often changes one date and then
   * the other.
   */
  protected dateError(field: DateField): string | null {
    const control = this.form.controls[field];
    if (!this.submitted() && (!control.touched || this.editedDate() === field)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Enter a date.';
    }
    if (control.invalid) {
      return invalidDateMessage(control.value);
    }
    if (field === 'endDate' && this.submitted() && this.form.hasError('endBeforeStart')) {
      return 'The end date must be after the start date.';
    }
    return null;
  }

  /**
   * A click opens the calendar, but the focus stays in the field, so the user can type at once.
   * ngbDatepicker 19 has no input for this: open() moves the focus to a day one time, in a
   * setTimeout. We skip only that call. When the user tabs into the calendar, the arrow keys
   * still move the focus from day to day.
   */
  protected toggleCalendar(picker: NgbInputDatepicker, field: HTMLInputElement): void {
    this.closeOtherCalendars(picker, field);
    picker.toggle();

    const calendar = calendarOf(picker);
    if (calendar) {
      calendar.focus = () => delete (calendar as Partial<NgbDatepicker>).focus;
    }
  }

  /**
   * A typed date that is complete shows as the selected day of the open calendar. The calendar
   * gets the date directly: picker.writeValue() would reformat the text under the caret and mark
   * the field touched, and a touched field shows its error before blur (E1).
   */
  protected showTypedDate(picker: NgbInputDatepicker, text: string): void {
    const date = parseDottedDate(text);
    const calendar = calendarOf(picker);
    if (!date || !calendar) {
      return;
    }

    calendar.writeValue(date);
    picker.navigateTo(date);
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

  /**
   * Open moves the focus to the first field. Close gives the focus back to the control that
   * opened the drawer: a bar, or nothing when a click on an empty cell opened it.
   *
   * Parity mode leaves the first field alone: the design shows the open drawer with no focus
   * ring ("Placeholder and Defaults").
   */
  private manageFocus(): void {
    const document = inject(DOCUMENT);
    const injector = inject(Injector);
    let opener: HTMLElement | null = null;

    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open && !opener) {
          opener = document.activeElement as HTMLElement | null;
          if (PARITY_MODE) {
            return;
          }
          // The panel is inert until the render removes the attribute.
          afterNextRender(() => this.nameInput().nativeElement.focus({ preventScroll: true }), {
            injector,
          });
        } else if (!open && opener) {
          if (opener.isConnected) {
            opener.focus({ preventScroll: true });
          }
          opener = null;
        }
      });
    });
  }

  /**
   * Tab and Shift+Tab stay in the open drawer. The listener wraps at the first and the last
   * control, and pulls the focus back when a click on the empty panel dropped it on the page.
   */
  private trapFocus(): void {
    const document = inject(DOCUMENT);
    const listener = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !this.open()) {
        return;
      }

      const controls = this.focusableControls();
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      const inside = this.panel().nativeElement.contains(active);

      if (!inside || (event.shiftKey && active === first)) {
        event.preventDefault();
        (event.shiftKey && inside ? last : first).focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', listener);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', listener));
  }

  private focusableControls(): HTMLElement[] {
    const selector = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(this.panel().nativeElement.querySelectorAll<HTMLElement>(selector)).filter(
      (element) => !element.matches(':disabled') && element.tabIndex >= 0 && element.offsetParent,
    );
  }

  private centerName(workCenterId: string): string {
    return (
      this.schedule.workCenters().find((center) => center.id === workCenterId)?.name ??
      'this work center'
    );
  }

  /**
   * Only one calendar is open at a time. The other calendar closes before this one opens, and it
   * gives the focus to the clicked field, not back to its own field. Without this, its outside
   * click handler closes it later and moves the focus away from the field the user types in.
   */
  private closeOtherCalendars(picker: NgbInputDatepicker, field: HTMLInputElement): void {
    for (const other of this.datepickers()) {
      if (other === picker || !other.isOpen()) {
        continue;
      }

      const restoreFocus = other.restoreFocus;
      other.restoreFocus = field;
      other.close();
      other.restoreFocus = restoreFocus;
    }
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

/**
 * The control holds the typed text when the parser rejects it. A text with the right shape is a
 * day that does not exist, such as 31.02.2025.
 */
function invalidDateMessage(value: unknown): string {
  if (typeof value === 'string' && isDottedShape(value)) {
    return `${value.trim()} is not a valid date.`;
  }
  return 'Enter the date as dd.mm.yyyy.';
}

/**
 * The calendar popup of an input datepicker, or null when it is closed. ngbDatepicker 19.0.1
 * keeps it in the private _cRef field and has no public getter.
 */
function calendarOf(picker: NgbInputDatepicker): NgbDatepicker | null {
  const popup = (picker as unknown as { _cRef: ComponentRef<NgbDatepicker> | null })._cRef;
  return popup?.instance ?? null;
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

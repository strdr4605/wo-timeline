# Unit b18-datepicker: builder notes

Builder, 2026-11-11. Lead: t38. Bug fix for the drawer date fields (End date, Start date).
Item D12 (the date picker opens on a click). ng-bootstrap 19.0.1, Node 26.

## Bug

A click on a date field ran `picker.toggle()`. `NgbInputDatepicker.open()` then runs
`setTimeout(() => this._cRef?.instance.focus())`, and `NgbDatepicker.focus()` moves the focus to
`div.ngb-dp-day[tabindex="0"]`. The typed text went to the calendar and was lost.

## What changed

- `src/app/work-order-drawer/work-order-drawer.html`: both date inputs call
  `toggleCalendar(picker)` on click and `showTypedDate(picker, text)` on input.
- `src/app/work-order-drawer/work-order-drawer.ts`:
  - `toggleCalendar()`: toggles the popup. Then it replaces `focus()` on the popup instance with
    a one-shot function that deletes itself. Only the first call (the one from `open()`) is
    skipped. Later calls (arrow keys inside the calendar) use the normal prototype method.
  - `showTypedDate()`: when `parseDottedDate(text)` returns a date and the popup is open, it calls
    `NgbDatepicker.writeValue(date)` on the popup (selection only) and the public
    `picker.navigateTo(date)`. Invalid or partial text does nothing.
  - `calendarOf()`: reads the popup from the private `_cRef` field. ng-bootstrap 19.0.1 has no
    public getter and no input to disable the open focus. This is the only private access.

Why not `picker.writeValue(date)`: it rewrites the input text with the formatter (`1.11.2026`
becomes `01.11.2026` under the caret) and calls `_onTouched()`. A touched field shows its error
before blur, which breaks the E1 blur rule.

## Keyboard behaviour (checked by hand, headless Playwright)

| Key | Result |
|---|---|
| Escape, calendar open | Closes the calendar. Focus stays in the field. The drawer stays open. |
| Escape again | Closes the drawer (D9, unchanged). |
| Tab, calendar open | Moves into the calendar: Previous month, Next month, the focused day. The ng-bootstrap focus trap then wraps inside the popup, as before the fix. |
| Arrow keys in the calendar | Move the focused day, as before. |
| ArrowDown in the field | No effect. The ng-bootstrap 19 input directive has no key that opens or focuses the calendar. Not added: out of scope. |
| Tab, calendar closed | D10 order and the I5 trap are unchanged (a11y.spec and drawer.spec pass). |

A mouse click on a day selects it, closes the calendar and gives the focus back to the field.

## Evidence

- `tests/e2e/datepicker-typing.spec.ts`: `[D12] a click on a date field opens the calendar and
  keeps the focus for typing`. For both fields: click, wait 300 ms, Cmd+A, type `01.11.2026`;
  the value is kept, the field has focus, the selected day is November 1, 2026 and the month is
  November 2026. Two Backspaces leave the calendar unchanged and show no error. A mouse pick
  (November 10, 2026) closes the calendar and writes `10.11.2026`. Escape order checked.
- The spec fails on the old code (`toBeFocused` received inactive), checked with a temporary
  revert of the End date handler.
- `npm run build` clean, `npx vitest run` 31 passed, `npx playwright test` 89 passed.
- `node docs/requirements/verify.mjs`: 73 pass, 2 pending. verify.mjs writes the D12 unit title
  last, so the e2e evidence is appended by hand to D12 in `acceptance-criteria.json`, then
  `render.mjs`.

## Pixel check (before = after)

| Artboard | Before | After |
|---|---|---|
| Schedule - Default (bar masks) | 0.21% | 0.21% |
| Create New Event - With Selection | 0.3% | 0.3% |
| Create New Event - Placeholder and Defaults | 0.3% | 0.3% |
| Create New Event - Active Text Field | 0.32% | 0.32% |
| Create New Event - Status Dropdown | 0.29% | 0.29% |

Steps from `u4-fix.md`. No style change. Parity mode is unchanged: no stored data, no new element.

## Risk

`calendarOf()` depends on the private `_cRef` field of ng-bootstrap 19.0.1. An upgrade can rename
it. Then `calendarOf()` returns null, the fix is off, and the old focus behaviour comes back. The
D12 e2e test catches this.

## Fix b18-fix

Builder, 2026-11-11. Lead: t38. Fixes the 2 failures in `b18-verify.md`, with the lead decisions.

### Failure 1: switch Start -> End

Cause: the auto close of the Start popup runs after the End click (`mouseup` + `delay(0)`) and
gives the focus back to its own input.

- `toggleCalendar(picker, field)` now calls `closeOtherCalendars()` before `picker.toggle()`.
- `closeOtherCalendars()`: for each other open picker, it sets the public `restoreFocus` input to
  the clicked field, calls `close()`, then puts the old `restoreFocus` value back. `close()`
  completes the auto close stream, so the delayed outside-click close does not run. No timer.
- Result: one calendar at a time. The clicked field keeps the focus. Typed text goes into it.
- The template passes `$any($event.target)` as the clicked field.

### Failure 2: error after a mouse pick

- New signal `editedDate`: the date field with the focus. `(focus)` and `(input)` set it,
  `(blur)` clears it.
- `dateError()`: before the first Create or Save, a date field shows its error only when it is
  touched and does not have the focus. A mouse pick marks the field touched, but the error now
  waits for the blur.
- After the first Create or Save, the date error follows the typed text at once, as before. Why:
  the existing test `[E1] the end date must be after the start date` (actions.spec.ts) types
  invalid text after Create and expects the error before blur. Lead rule "keep all other tests"
  wins over a literal "never while focused". The lead can change this.
- The name field keeps the submit rule. Create and Save stay blocked for an invalid date.

### Checked by hand (headless Playwright, parity and normal mode)

| Flow | Result |
|---|---|
| Start open, click End, wait 700 ms | 1 calendar (End), focus in End |
| Then Cmd+A, type `05.05.2025` | End `05.05.2025`, month May 2025, Start unchanged |
| Start: mouse pick, Cmd+A, type `31.02` | No error, focus in Start, calendar closed |
| Tab out | `Enter the date as dd.mm.yyyy.` |
| Click Start again, type | Error hidden while focused (before submit) |
| Create with invalid Start | Drawer stays open, error shows |
| Page errors | None |

### Evidence

- `tests/e2e/datepicker-typing.spec.ts`: 2 new tests under D12:
  `[D12] a click on End date while the Start calendar is open gives the focus to End` and
  `[D12] after a mouse pick, typed text shows no date error until the field loses focus`.
- Both fail on the old code (temporary revert of the two changes: `toBeFocused` and
  `toHaveCount` failed), both pass on the new code.
- `npm run build` clean. `npx vitest run` 31 passed. `npx playwright test` 91 passed.
- `node docs/requirements/verify.mjs`: 73 pass, 2 pending. D12 e2e evidence added by hand to
  the JSON again, then `render.mjs`.

### Pixel check (before = after)

| Artboard | Before | After |
|---|---|---|
| Schedule - Default (bar masks) | 0.2% | 0.2% |
| Create New Event - With Selection | 0.3% | 0.3% |
| Create New Event - Placeholder and Defaults | 0.3% | 0.3% |
| Create New Event - Active Text Field | 0.32% | 0.32% |
| Create New Event - Status Dropdown | 0.29% | 0.29% |

No style change. Parity mode: no stored data, no new element, no scroll change.

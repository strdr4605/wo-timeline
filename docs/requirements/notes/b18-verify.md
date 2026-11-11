# Unit b18-verify: verifier notes for b18-datepicker

Verifier, 2026-11-11. Lead: t38. Row D12. Change: jj working copy (6 files, +201 -4).
ng-bootstrap 19.0.1, Node 26 (`/opt/homebrew/opt/node@26/bin`). Headless Chromium only.

Walk scripts (scratchpad, not in the repo): `walk.mjs` (2 modes x 2 flows x 2 fields, 350 ms
between steps, `keyboard.press` per character, mouse down/up with 80 ms) and `switch.mjs`.

## Regressions

- build pass - `npm run build` exit 0, no warning, no error - Node 26
- vitest pass - `npx vitest run`: 5 files, 31 passed
- playwright pass - `npx playwright test`: 89 passed (20.9 s), includes the new D12 spec

## Pixels (no style change in the unit)

- Default pass - 0.2% with the 5 bar masks (limit 0.2%)
- With Selection pass - 0.3%
- Placeholder and Defaults pass - 0.3%
- Active Text Field pass - 0.32%
- Status Dropdown pass - 0.29%

Steps from `u4-fix.md`. Same values as the builder before/after table.

## Behaviour, spec 1: a click opens the calendar, the focus stays in the input

Checked in parity/Create, parity/Edit, normal/Create, normal/Edit, for End date and Start date
(8 runs).

- click-open-focus pass - 8/8: calendar open, `document.activeElement` is the input 700 ms after
  the click - walk.mjs
- mouse-pick pass - 8/8: a click on March 17, 2027 closes the calendar, writes `17.03.2027`,
  focus back in the input, no error - walk.mjs
- toggle pass - parity and normal: click 1 opens, click 2 closes, click 3 opens, focus in input
- switch Start -> End fail - Start calendar open, click End: End calendar opens, but the focus
  goes back to Start. Events: `mousedown:drawer-end | focusin:drawer-end | click:drawer-end |
  focusin:drawer-start`. Typed `05.05.2025` goes into Start; End keeps `08.09.2024`; the open End
  calendar does not move. Cause: the auto close of the Start popup runs after the End click and
  restores the focus to its own input (`_elWithFocus`). Before b18, the End `open()` timer moved
  the focus into the End calendar after that. b18 skips that call, so the restore wins - switch.mjs
- switch End -> Start n/a - the open End calendar covers the Start input. The click lands on the
  calendar (`ngb-dp-weekday`). Same as before b18.

## Behaviour, spec 2: typing selects the date in the open calendar

- typed-date-selects pass - 8/8: `07.03.2027` typed one key at a time gives value `07.03.2027`,
  month `March 2027`, selected `Sunday, March 7, 2027`, focus in input, no error - walk.mjs
- partial-no-change pass - 8/8: the 9 partial states (`0` ... `07.03.202`) keep the start month
  and selected day, no error, focus in input - walk.mjs
- invalid-no-change pass - 8/8: `31.02.2027` leaves the calendar on the last valid date, no
  error before blur. (The script expected March 2027, but its own `07.03.9999` step is a valid
  date, so the calendar was on March 9999. Correct behaviour.) - walk.mjs
- error after mouse pick fail (not a b18 regression) - 8/8: after a mouse pick, Cmd+A and
  `31.02` show `Enter the date as dd.mm.yyyy.` before blur. The pick calls ng-bootstrap
  `_onTouched()` (registerOnChange in `open()`), `dateError()` shows errors for a touched field.
  Old behaviour, but it breaks the literal spec 2 text in this flow - walk.mjs
- E1 blur, fresh field pass - typed invalid text without a pick shows no error until blur

## Behaviour, spec 3: keyboard

- D10 Tab order pass - calendar closed: name > status > end > start > Cancel > primary > name
  (wraps, I5 trap), parity and normal
- Tab into calendar pass - after a click on End: Tab > Previous month > Next month > focused day;
  ArrowRight and ArrowDown move the day; further Tabs stay inside the popup (ng-bootstrap trap)
- Enter on a day pass - selects `09.09.2024`, closes the calendar, focus back in End
- Escape order pass - Escape 1 closes the calendar, drawer open, focus in the field; Escape 2
  closes the drawer, parity and normal
- ArrowDown in the field documented - no effect, ng-bootstrap 19 has no key for it (builder notes)
- console pass - 8/8 runs without page errors

## Code

- ng-bootstrap API pass with note - `picker.toggle()`, `picker.navigateTo()`,
  `NgbDatepicker.writeValue()` are public. `_cRef` is private (documented, covered by the D12
  e2e). The one-shot `focus` override on the popup instance is a monkey patch, but no own timer:
  it is consumed by ng-bootstrap's own `setTimeout(() => this._cRef?.instance.focus())` in
  `open()` (ng-bootstrap.mjs:4123). Later `focus()` calls (arrow keys, model focusVisible) use the
  prototype. Checked: Tab and arrows in the calendar still move the focus.
- `calendar.writeValue()` pass - sets `_controlValue` before the model update, so no
  `onChange`/`onTouched` fires (checked in source, and no error before blur in the walk)
- tokens, dead code, order pass - no style change, no literals, helper `calendarOf()` at the
  bottom, entry methods above; only drawer files, the D12 row and the new spec changed
- D12 e2e pass - covers both fields, focus, partial, mouse pick, Escape; does not cover the
  field switch

## Failures

1. switch Start -> End - with the Start calendar open, a click on End opens the End calendar
   but the focus returns to Start. Typed text overwrites Start. Spec 1 broken in this flow.
   Possible fix (lead decides): close the other picker, or refocus the clicked input after the
   other popup's focus restore, or set `[restoreFocus]` so a close does not steal the focus.
2. error after mouse pick (pre-existing) - after a mouse pick the field is touched, so partial or
   invalid typed text shows the error before blur. Not caused by b18; spec 2 wording says no
   error before blur. Lead decides if it is in scope.

# Unit b10-dates: builder notes

Builder, 2026-11-11. Lead: t38. Item E1 (bonus wave). Bug fix: an impossible date showed no
warning until Create.

## What changed

- `src/app/work-order-drawer/drawer-form.ts`: `parseDottedDate` returns null for a day that
  does not exist (month 1 to 12, day 1 to the last day of the month, leap years from `Date`).
  New `isDottedShape` tells a wrong shape from an impossible day. The regex is one constant.
- `src/app/work-order-drawer/work-order-drawer.ts`: `dateError` shows the own error of a date
  field when the field is touched (blur), or after the first Create/Save. Messages:
  - empty: `Enter a date.` (existing text)
  - wrong shape: `Enter the date as dd.mm.yyyy.` (existing text)
  - impossible day: `<typed value> is not a valid date.` (new, same `.drawer-field__error` style)
- The end-before-start error keeps the submit rule. Reason: the parity steps of the drawer
  artboards type End 01.01.2026 and then Start 02.01.2026 and Tab out. A blur rule for this
  cross-field error would show a red error in the parity screenshots. The user also often
  changes one date and then the other.
- The name field keeps the submit rule.
- Create stays blocked: the form is invalid while a date is invalid (no change needed).
- ngb-datepicker: a pick writes a valid day, so the error goes away (checked by hand).

## Tests

- Unit `tests/unit/drawer.spec.ts`: `[E1] a day that does not exist is not a date` (40.13.2024,
  31.02.2025, 29.02.2025, 00.01.2025, 31.04.2025 null; 29.02.2024, 31.12.2025 valid) and
  `[E1] the shape check tells a wrong shape from a day that does not exist`.
- E2e `tests/e2e/date-validation.spec.ts`: `[E1] an impossible end date shows its error on Tab
  and Create does not save`. No error while typing, error after Tab, Create keeps the drawer
  open and adds no bar, wrong shape keeps the format message.
- `tests/e2e/actions.spec.ts` `[E1] the end date must be after the start date`: the expectation
  for `31.13.2024` changed from the format message to `31.13.2024 is not a valid date.` This is
  the intended new behaviour.
- `npm run build` clean. `npx vitest run` 31 passed. `npx playwright test` 73 passed.
- `node docs/requirements/verify.mjs`: E1 row refreshed (evidence: the new unit test title).

## Pixel-check (before = after)

Masks: bars from the handover; cursor `715,330,25,25` on the drawer states. Steps of the
drawer states from `u4-fix.md`.

| State | Before | After |
|---|---|---|
| Schedule - Default | 0.21% | 0.21% |
| With Selection | 0.30% | 0.30% |
| Placeholder and Defaults | 0.30% | 0.30% |
| Active Text Field | 0.32% | 0.32% |
| Status Dropdown | 0.29% | 0.29% |

No error shows at rest. Parity mode is not changed: no stored data, no new controls.

## By-hand check (headless Playwright, not parity)

typing 40.13.2024: no error. Tab: `40.13.2024 is not a valid date.`, aria-invalid true.
`12.2024` + Tab: format message. `29.02.2025`: invalid. Create: drawer stays open, bars 8 = 8.
Pick day 20 in the calendar: value `20.11.2026`, no error.

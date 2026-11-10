# Unit u5-actions: builder notes

Builder, 2026-11-10. Lead: t38. Scope: drawer and menu behaviour, brief sections 3, 4, 5 and
'Form Validation', items D14 and E1-E5. Node 22.14.0.

E6 does not exist in `acceptance-criteria.json` (the Validation group ends at E5). The Delete
flow has no item of its own: its e2e test uses C5, the item of the three-dot menu.

## What changed

- `src/app/data/overlap.ts`: `OverlapCandidate` has an optional `docId`. The check skips the
  order with that id, so an edited order does not collide with its own old dates (E3). Touching
  ends overlap: both dates are working days of an order.
- `src/app/data/schedule.service.ts`: the orders are a private writable signal, exposed read
  only. New `save(draft, docId?)` returns `'saved'` or `'overlap'`. Without `docId` it adds the
  order with a new unique id. With `docId` it replaces that order in place. On overlap nothing
  changes. New `remove(docId)`.
- `src/app/work-order-drawer/drawer-form.ts`: pure `isEndAfterStart` (the same day is not after
  the start) and `draftFor` (form value to ISO draft, the work centre from the request).
- `src/app/work-order-drawer/work-order-drawer.ts`:
  - Name: required and not only spaces.
  - Dates: required. ngbDatepicker marks a text that is not a date as invalid.
  - Form group validator `endBeforeStart`.
  - Submit: validate, `schedule.save`, close. On overlap the drawer stays open with the alert.
  - The errors show only after the first Create or Save. Reason: the pixel-check steps pass
    through the empty name field, and an untouched form must look like the design.
  - A changed value clears the overlap alert. A new request clears all errors.
- `work-order-drawer.html`: an inline error under each field, with `aria-invalid` and
  `aria-describedby`. The overlap alert (`role="alert"`) sits under the head, above the fields.
- `work-order-drawer.scss`: invalid border, error text, alert. All values are tokens.
- Delete: `WorkOrderBar.remove` > `TimelineGrid.deleteOrder` > `App.deleteOrder` >
  `ScheduleService.remove`.
- `docs/design/tokens.json` + `npm run tokens`: new `components.formError` (color `#b13600`,
  gapY 4, alert fill `#fffcf1`, border `#fff5cf` 1, radius 5, pad 8/12, marginTop 16). Reason in
  `agentChoices["components.formError (u5-actions)"]`.

## Error design (no artboard shows errors)

- Text: Blocked status text colour `#b13600`, control label type (Regular 14, line 16).
- Invalid field: border `#b13600`, also while focused.
- Overlap alert: Blocked bar fill `#fffcf1`, border `#fff5cf`, text field radius 5. One line:
  "These dates overlap another order on <work centre>."
- Placement: the brief asks for the alert above the buttons. The buttons are in the head at
  y 25, with no free space above them. The alert is right under the head divider, above the
  fields, so it is the first thing under the buttons. Lead: tell me if you want another place.

## Tests

- `tests/unit/overlap.spec.ts` (new, 14 tests): touching ends, day before and after, one-day
  order, contained and containing, month end across a DST change, edited order excluded,
  other orders of the centre still count, other centre allowed; service save, update in place,
  unique docId, remove.
- `tests/unit/drawer.spec.ts`: +2 tests, `isEndAfterStart` and `draftFor` (E1).
- `tests/e2e/actions.spec.ts` (new, 11 tests): D14, E1 x3 (create, required, end after start),
  E2, E4, E3 x2 (save in place, overlap on edit + Cancel keeps data), E5, C5 (Delete),
  D9 (Escape and click outside on edit do not save).

## Checks

- `npm run build`: exit 0, no warnings.
- `npx vitest run`: 29 passed.
- `npx playwright test`: 52 passed.

## Final pixel-check lines

Steps as in `u4-fix.md`. No error shows in these flows.

| Artboard | u4-fix | Now |
|---|---|---|
| With Selection | 0.30% | 0.30% |
| Placeholder and Defaults | 0.30% | 0.30% |
| Active Text Field | 0.32% | 0.32% |
| Status Dropdown | 0.29% | 0.29% |

Drawer layers, Status Dropdown (unchanged from u4-fix):

    2565   0.42%  Rectangle [849,0,591,1024]           panel
    1138  16.16%  Specify the dates, n [873,46,352,20] glyph AA
     513   8.11%  Work Order Details [873,16,253,25]   glyph AA

## What still differs and why

- Nothing new. The residue is the u4-fix residue (glyph anti-aliasing, date value colour,
  End date field x in 3 artboards).
- The error and alert styles have no design reference. See 'Error design'.

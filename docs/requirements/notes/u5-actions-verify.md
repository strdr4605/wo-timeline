# Unit u5-actions: verify

Verifier, 2026-11-10. Lead: t38. Node 22.14.0. Dev server http://localhost:4200.
Drive scripts (own, not the builder e2e): scratchpad `drive.mjs`, `d2.mjs`. Builder notes not trusted.

## Pixels (`?parity=1`, steps from `u4-fix.md`)

With Selection pass - 0.30% total, drawer layers only glyph AA (Specify the dates 16.16% of box, same as u4-fix) - pixel-check
Placeholder and Defaults pass - 0.30% total, no new layer in the list - pixel-check
Active Text Field pass - 0.32% total, no new layer in the list - pixel-check
Status Dropdown pass - 0.29% total, no new layer in the list - pixel-check
Buttons/Secondary 1276,25,66,32 pass - 137 px, 6.49%: zoom shows glyph AA on 'Cancel' only - pixel-check --zoom
Buttons/Primary 1350,25,66,32 pass - 63 px, 2.98%: zoom shows glyph AA on 'Create' only - pixel-check --zoom

The four artboards are unchanged from u4-fix. No error state shows in these flows.

## Behaviour

D14 pass - buttons at 1276,25 and 1350,25, 66x32, primary #5659ff, secondary white; zoom matches design - Sketch, e2e [D14]
Create, Month pass - 'Dec 2026' at 5% > 02.12.2026, at 95% > 30.12.2026; end 09.12.2026 and 06.01.2027 (start + 7) - brief 3 "Pre-filled from click position", "Start Date + 7 days"
Create, Week pass - 'Nov 16' at 5% > 16.11, 95% > 22.11; 'Nov 23' at 50% > 26.11; end = start + 7 each - brief 3
Create, Day pass - '11' at 5% and 95% > 11.11.2026, '12' > 12.11.2026; end = start + 7 - brief 3
Create on bar pass - click on a bar opens no drawer - brief 5 "Click empty timeline area"
Create defaults pass - name empty, status 'Open', button 'Create' - brief 3 "Default: Open"
Create save pass - valid form: drawer closes, bars 4 > 5, new bar 'Verifier One' shows - brief 3 "If valid, add to work orders and close panel"
E1 required name pass - empty name: drawer stays open, 'Enter a work order name.', no bar added; spaces only also rejected - brief "All fields required"
E1 required date pass - empty start: 'Enter a date.'; text 'abc' and 31.02.2026: 'Enter the date as dd.mm.yyyy.', no bar added - brief "All fields required"
E1 end after start pass - end 05.08 < start 10.08: 'The end date must be after the start date.'; end = start same error; drawer open, no bar - brief "End date must be after start date"
E1 errors clear pass - a fixed value removes its error without a new submit - own drive
E2 touching start pass - 10.08-21.08.2024 vs Konsulting Inc 21.08-30.11.2024: rejected, 0 added - brief 3 "If overlap detected, show error and don't create"
E2 touching end pass - 30.11-02.12.2024: rejected, 0 added - brief 3
E2 contained pass - 01.09-10.09.2024: rejected - brief 3
E2 containing pass - 01.08-31.12.2024: rejected - brief 3
E2 gap pass - 01.12-02.12.2024 (between 30.11 and 03.12): saved, drawer closed - brief 3
E3 save unchanged pass - Edit 'Konsulting Inc', Save with no change: saved, closed, 0 bars added - brief 4 "excluding the order being edited"
E3 edit into overlap pass - edit to 21.08-03.12.2024: alert, drawer open, data unchanged - brief 4 "Same overlap validation"
E3 edit save pass - rename to 'Konsulting Renamed': bar updates in place, count unchanged - brief 4
E4 pass - alert 'These dates overlap another order on Konsulting Inc.', role=alert, under head - brief "show error if work orders overlap"
E5 pass - 01.10-30.11.2024 on Rodriques Electrics (same range as Konsulting Inc on another centre): saved - brief "on same work center"
E6 n/a - item does not exist in acceptance-criteria.json (Validation ends at E5) - acceptance-criteria.json
Edit prefill pass - name 'Konsulting Inc', 21.08.2024, 30.11.2024, 'In progress', button 'Save' - brief 4 "pre-populated", "Save instead of Create"
Menu pass - three-dot on hover opens 'Edit', 'Delete' - brief 5
Delete pass - 'Konsulting Renamed' removed, bars 7 > 6, no drawer - brief 5 "Click Delete from dropdown: Delete the work order"
Cancel pass - changed name 'CHANGED2', Cancel: closed, not saved - brief 3 "Cancel button closes without saving"
Outside click pass - changed name 'CHANGED', click at 300,600: closed, not saved - brief 3 "Clicking outside closes the panel"
Escape pass - closes; reopen shows original values - acceptance D9

## Error UI

Tokens pass - all error values use `t.$component-form-error-*`, type tokens, `layout-panel-*`; new tokens in tokens.json + `_tokens.scss` - work-order-drawer.scss
Look pass - text #b13600 Regular 14, invalid border #b13600, alert fill #fffcf1 border #fff5cf radius 5; reads as part of the design - screenshots err-name, err-end, err-overlap
Layout shift pass - a field error pushes the fields below by 20 px (start field y 389 > 409); the alert pushes all fields by 50 px (name field y 131 > 181). Nothing overlaps, buttons do not move - own drive

## overlap.ts unit tests

Coverage pass - touching both ends, day before/after free, one-day order, contained, containing, month end + DST, edited order excluded, other orders of the centre still count, no docId never matches, other centre; service save/update/unique id/remove - tests/unit/overlap.spec.ts (14 tests)

## Regressions

R1 `npm run build` pass - exit 0, no warnings
R2 `npx vitest run` pass - 5 files, 29 passed
R3 `npx playwright test` pass - 52 passed (10.4s)

## Code

Tokens pass - no colour or size literals in the new SCSS
Dead code pass - old 'Delete does nothing yet' comment and placeholder submit comment removed; no unused import
Top-down pass - overlap.ts helpers moved under `overlaps`; types and validator functions at file end
Scope pass - changes limited to drawer, schedule service, overlap, delete wiring (app, grid, bar), tokens, tests

## Notes (not failures)

- Builder notes say "the brief asks for the alert above the buttons". The brief has no placement rule (lines 19, 149 only say "show error"). The placement under the head is fine.
- Builder notes use C5 for the Delete e2e test. No item covers Delete itself.
- Overlap uses inclusive days: an order that ends on the start day of another is rejected. This is a choice; the brief does not define touching ends.

## Failures

None.

# Unit u6-small: verify

Verifier, 2026-11-10. Lead: t38. Node 26. Dev server http://localhost:4200.

## Checks

- A2 pass - e2e `[A2]` passes; `work-order-drawer.ts` has ReactiveFormsModule, new FormGroup, new FormControl, Validators.required; 4 `[formcontrolname]` fields, empty name `ng-invalid` - brief l.138 "use Reactive Forms with FormGroup", l.243
- A3 pass - e2e `[A3]` passes; no `<select>`, `ng-select.drawer-status` with Open pill, panel Open / In progress / Complete / Blocked, border not `#ccc`; 375 px screenshot shows restyled pill - brief l.143 "ng-select dropdown", l.244
- A4 pass - e2e `[A4]` passes; click on `#drawer-end` and `#drawer-start` opens `ngb-datepicker`, Escape closes it - brief l.144-145, l.245
- G4 pass - `measure.mjs`: no G4 failure (43 pass, 9 fail, all 9 in C2 C3 C4 C5 C8). Builder cause confirmed: `.drawer` is in the DOM; design and SCSS round only the left corners (`radius 0 0 radius`), so the split into top-left and bottom-left radius checks is correct - `docs/requirements/measurements.json`
- I7 pass - own Playwright run: 375x667: page scrollWidth 375, rail 150 px in 274 px grid, timeline visible, 2 names ellipsed, drawer box 0,0,375,667, all fields visible. 768x1024: rail 307 px, drawer 591 px at x 177. 1024x768: rail 380 px, drawer 591 px at x 433. e2e `[I7]` passes - brief l.260-262 "Should not break badly on smaller screens"
- I8 pass - `timeline-grid.scss` l.100-113 sets only `--column-width` per zoom from tokens (month, week, day); e2e `[I8]` passes: header height, row heights, bar height, radius, font, header colour equal Month; columns 114 px and 48 px - acceptance-criteria I8
- H5 pass (manual, lead sets status) - `timeline.ts` header on column fraction, l.119 index as distance, l.150 wall-clock hours for DST, l.198 Monday weeks, l.223 UTC day number; `drawer-form.ts` l.28 +7 days, l.53 same day not after; `overlap.ts` l.41 UTC days - brief l.303-305 "Code comments explaining: Complex date calculations, Key decisions"
- Pixels Schedule - Default pass - no visual change from this unit: A/B screenshot at 1440x1024, hover@727,322, with and without a style that reverts the unit CSS (rail 380px, name overflow visible, drawer 591px): 0 px different. Name `scrollWidth` = `clientWidth` for all 5 names, so no ellipsis at 1440 - `scripts/pixel-check.mjs`, scratchpad A/B script
- Pixels Schedule - Default note - masked run with handover masks: no steps 0.2%, `hover@727,322;wait@300` 0.11%, unmasked 0.44% (builder 0.44%). 0.11% is above committed u2 0.09%, but the A/B above shows 0 px from this unit; the 0.02% gap is from an earlier unit or a different u2 run setup. Worst layers: rail Rectangle 820 px, McMarrow name 305 px, Table/Header/3 197 px - handover "Pixel-check states used"
- Build pass - `npm run build` clean
- Vitest pass - 29 passed
- Playwright pass - 57 passed (stack.spec.ts 5)
- verify.mjs pass - playwright exit 0, vitest exit 0, 55 pass, 16 pending, 0 fail; warning `unknown item id in test title: P9`
- Code tokens pass with note - `min(token, 40vw)` and `min(token, 100vw)`: 40vw and 100vw are responsive limits with no design token; comments explain them - `timeline-grid.scss` l.30-31, `work-order-drawer.scss` l.32-33
- Code order pass - `stack.spec.ts`: tests on top, helpers `openDrawer`, `layoutOf` at the bottom
- Code scope pass - diff only in the 7 unit files (2 SCSS, 1 spec, measurements.json, criteria JSON/MD, builder notes)
- Code note - `stack.spec.ts` l.4 calls I7 and I8 "bonus items"; checklist has them as must. Wording only.
- I7 note - at 375 px the page keeps the 101 px left gutter, and the drawer subtitle wraps to 2 lines and touches the header line. Not broken; brief accepts.

## Failures

None.

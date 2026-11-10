# Unit u6-small: builder notes

Builder, 2026-11-10. Lead: t38. Node 26 (`/opt/homebrew/opt/node@26/bin`).

## What changed

| File | Change |
|---|---|
| `tests/e2e/stack.spec.ts` | New. Tests `[A2]`, `[A3]`, `[A4]`, `[I7]`, `[I8]`. |
| `docs/requirements/measurements.json` | G4: the `border-radius` check is now two checks, `border-top-left-radius` and `border-bottom-left-radius`, each 12px. The expected value did not change. |
| `src/app/timeline-grid/timeline-grid.scss` | Rail width is `min(380px token, 40vw)`. The work centre name clips with an ellipsis. |
| `src/app/work-order-drawer/work-order-drawer.scss` | Drawer width is `min(591px token, 100vw)`. |

At 1440 px, `min()` gives the token value (40vw = 576 px, 100vw = 1440 px). Thus the parity
pixels do not change. The ellipsis has no effect at 380 px: all names fit.

## Item results

### A2 Reactive Forms: pass

Test `[A2]` reads `work-order-drawer.ts` (it has `ReactiveFormsModule`, `new FormGroup`,
`new FormControl`, `Validators.required`). It also checks the DOM: 4 `[formcontrolname]` fields,
and the empty name is `ng-invalid` until text is typed.

### A3 ng-select, restyled: pass

Test `[A3]`: no `<select>` in the drawer. `ng-select.drawer-status` shows the `Open` pill. The
panel lists Open, In progress, Complete, Blocked. The container border is not the default
ng-select `#ccc`. The pixel match of the restyle is already in D13 and the u4 pixel-check lines.

### A4 ngb-datepicker: pass

Test `[A4]`: a click on End date and on Start date opens `ngb-datepicker`. Escape closes it.

### G4 measure: pass

The cause was not the selector. `.drawer` is in the DOM (the closed drawer is off-screen, not
removed). The check failed because the design rounds only the left corners:
`border-radius = "12px 0px 0px 12px"` did not equal `"12px"`. Now:
`measure: .drawer border-bottom-left-radius = "12px" (expected "12px")`.

### I7 responsive: was fail, now pass

Before: at 375 x 667 the sticky rail was 380 px wide in a 274 px grid viewport. The timeline was
not visible at all, and a horizontal scroll did not show it (the rail is sticky). The 591 px
drawer was cut off on the left side (title, fields).

After: rail 150 px at 375 px, the timeline is visible to its right, the grid scrolls sideways
inside its card, no page-wide scroll (`scrollWidth` = 375). The drawer is 375 x 667 and all
fields are visible. Test `[I7]` checks these values.

Still differs: at 375 px the drawer subtitle wraps to 2 lines and touches the header line. The
brief accepts this ("should not break badly").

### I8 Day and Week from Month: pass

`timeline-grid.scss` sets only `--column-width` per zoom level, from the tokens
`$layout-grid-header-column-width-week` (114 px) and `-day` (48 px). Rows, bars and header use
the same rules for all levels. Test `[I8]` switches to Week and Day and checks that the header
height, row heights, bar height, bar radius, bar font and header label colour equal the Month
values, and that the column width is 114 px and 48 px.

### H5 comments on date maths: pass (manual, status stays pending)

`src/app/timeline/timeline.ts` has a file header on the column-fraction model. Comments explain:
the bar and the today marker use the same rule, an index outside the rendered columns is a
distance, local wall-clock hours for DST, `dayNumber` in UTC so DST cannot move a marker, weeks
start on Monday, ISO strings sort as dates. `drawer-form.ts` explains the +7 days default, the
"same day is not after" rule and the fixed-width ISO compare. `timeline-grid.ts` explains the
sticky-rail scroll offsets. No change needed. verify.mjs cannot set a manual item, so the lead
must set H5.

## Note for the lead

`measure.mjs` still has stale C2-C5 and C8 entries (old Open colours before the cyan decision,
24 px menu button, 4 px handles). A measure run sets those items to fail. A verify run after it
sets them back to pass from the e2e tests. I did not change them: they are outside this unit.
Run verify after measure.

`verify.mjs` warns: `unknown item id in test title: P9`. A test uses `[P9]`, which is not in
the checklist.

## Checks

- `npm run build`: clean.
- `npx vitest run`: 29 passed.
- `npx playwright test`: exit 0 (stack.spec.ts: 5 passed).
- Pixel-check, before and after: Schedule - Default 0.44% / 0.44%, Placeholder and Defaults
  0.3% / 0.3%, View Selection 0.43% / 0.43%.
- `node docs/requirements/measure.mjs`: 43 pass, 9 fail (all 9 are the stale C entries above).
- `node docs/requirements/verify.mjs`: all items 55 pass, 16 pending, 0 fail.
  Must items: 51 pass, 5 pending (H1, H2, H3, H5, J3), 0 fail.

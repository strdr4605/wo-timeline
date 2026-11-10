# b6-onpush (item I6)

## What changed

- `changeDetection: ChangeDetectionStrategy.OnPush` is on all 5 components under `src/app`:
  `app.ts`, `timeline-grid/timeline-grid.ts`, `timescale-chip/timescale-chip.ts`,
  `work-order-bar/work-order-bar.ts`, `work-order-drawer/work-order-drawer.ts`.
- `work-order-drawer.ts`: the `form.valueChanges` subscription now also calls
  `ChangeDetectorRef.markForCheck()`. The ngb-datepicker popup and the ng-select panel write
  the form value from outside the drawer view. Without the call, OnPush could keep a stale
  error message (`dateError`, `nameError`) on screen.
- No `@for` change was necessary. All tracks were already stable: `center.id`, `column.key`,
  `bar.order.docId`, and `option` (a Timescale string, unique in its list). No `track $index`.
- All other component state was already signals, `input()` or `computed()`. The resize error
  timer in `app.ts` sets a signal, so it hides under OnPush. `dragOriginX` in the bar is not
  rendered.
- New spec `tests/e2e/onpush.spec.ts`, test `[I6] every component uses OnPush and no template
  tracks by $index`. It reads `src/app/**` (no `*.spec.ts`). I removed OnPush from the chip and
  added a `track $index` line to its template: the test failed. Then I restored both files.

## Checks by hand (Playwright scratch spec, deleted after the run)

- Create drawer, overlap error, then a date pick in the datepicker popup: the input shows
  `28.08.2024` and the overlap alert goes away.
- ng-select: a pick of Complete shows `Complete`.
- Resize to an end before the start (normal mode): `.resize-alert` shows, then hides after 4 s.
- C9 live preview, keyboard resize, Today (I2), timescale menu, Options menu, F5 storage: all
  are in the existing specs, all green.

## Pixel-check (before = after)

| State | Before | After |
|---|---|---|
| Schedule - Default (bar masks) | 0.21% | 0.21% |
| Schedule - Default hover@727,322 | 0.11% | 0.11% |
| View Selection | 0.43% | 0.43% |
| Options CTA (fixture=hover) | 0.31% | 0.31% |
| Edit and Delete Expanded (fixture=hover) | 0.26% | 0.26% |
| Create New Event: With Selection / Placeholder / Active Text / Status Dropdown | 0.3 / 0.3 / 0.32 / 0.29% | 0.3 / 0.3 / 0.32 / 0.29% |

The handover says Default 0.2%. The run before my change already gave 0.21%. This is not a
change from this unit.

## Results

- `npm run build`: clean. `npx vitest run`: 29 passed. `npx playwright test`: 66 passed (65 + I6).
- `node docs/requirements/verify.mjs`: I6 pass, progress 62 pass, 10 pending. It also prints
  `unknown item id in test title: P9`. The P9 test is not from this unit.

Nothing still differs.

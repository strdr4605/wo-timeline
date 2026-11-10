# b13-verify: verification of b13-virtual (I9)

Scope: the jj working copy `uspnxumk` on top of `da003f0` (I1). All browser runs are headless
Playwright on http://localhost:4200, viewport 1440 x 1024. Node v22.14.0 (the shell default
v16.20.0 cannot run Angular or Playwright). The probe scripts are not in the repo.

## Checks

- I9 custom windowing pass - `columnWindow` is a `linkedSignal` on the timescale, `windowIndices`, `windowColumns`, `windowStart` are `computed`. No `@angular/cdk` in `package.json` or `src/` (grep: 0 hits) - `src/app/timeline-grid/timeline-grid.ts`
- I9 DOM holds only the window pass - Hour and Day, 80 frames of +1500 px and 160 frames of -1500 px: max 85 `.grid-cell`, header count equal to grid count. Far bars: 0 in DOM after +2 years in Day (spec test 2) - probe + `virtualization.spec.ts`
- I9 spacer keeps scrollWidth pass - `.grid__track` width is `--column-count` x `--column-width`. In 440 sampled frames `scrollWidth` never got smaller - probe
- I9 no gap, no jump, no layout loop pass - each rAF frame in Hour and Day (fast +-1500 px/frame, slow 37 px/frame): 0 frames with uncovered visible grid or header, 0 frames with header and grid cells misaligned. After the scroll stops: 0 `.grid__window` childList mutations in 1 s (no loop) - probe
- I9 prepend keeps position pass - spec test `[I9] the scroll position stays the same when columns are added on the left` green. `[I1]` prepend tests green - `npx playwright test`
- I9 focused bar always rendered pass - spec test 4 green. Tab from a focused bar that is out of the window goes to the rail divider, Shift+Tab goes back to the Today button (the bar left the DOM after the blur), no console error - probe
- I9 dragged bar always rendered pass - spec test 5 green (`phase: 'start'` pins the bar, the release unpins it) - `virtualization.spec.ts`
- I9 open-drawer bar always rendered pass - Day, edit drawer open on "Rodriques Electrics", grid scrolled +8000 px: the bar is in the DOM. Escape gives the focus back to that bar - probe
- I9 today line after far scrolls pass - Day, marker x - current header cell x = -2 px at the start, after 40 x -1500 px + Today, after 40 x +1500 px + Today, and after 30 left + 30 right. The offset never changes - probe
- I9 hover placeholder after far scrolls pass - Hour, Day, Month: pointer x - placeholder left = 52 px at the start, after +45 000 px and after -60 000 px. A click after +37 500 px in Day opens create with start 03.01.2029 under header cell "3" - probe
- I9 window resize pass - viewport 900 and 2400 wide: the cells cover the visible grid (ResizeObserver) - probe
- I10 rail pass - separator Home / End (rail 240 / 560 px), at start and after +20 000 px: the cells cover the visible grid. `rail.spec.ts` green - probe + `npx playwright test`
- C9 drag pass - `resize.spec.ts` green, `[I9]` drag across the window edge green - `npx playwright test`
- I5 keyboard pass - `a11y.spec.ts` (axe) green. Tab from the first bar: Concentrix -> Rodriques -> Konsulting -> Spartan -> rail divider -> header controls. Row order as before. Note: bars outside the window (more than about one viewport away) are not in the Tab order now. Before I9 Tab reached every bar. This is the normal cost of windowing; the lead decides - probe
- I1 extend pass - all `[I1]` tests in `infinite-scroll.spec.ts` green. The range grows past 730 columns in Day (spec test 1) - `npx playwright test`
- I9 parity mode pass - spec test 6: every column in the DOM, `.grid__window` transform `matrix(1, 0, 0, 1, 0, 0)` - `virtualization.spec.ts`
- Pixels Schedule - Default pass - 0.2% (limit 0.2%), exit 0, masks `437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25` - `scripts/pixel-check.mjs`
- Pixels Schedule - Default hover pass - 0.11% (limit 0.11%), exit 0, steps `hover@727,322;wait@300`, same masks - `scripts/pixel-check.mjs`
- Build pass - `npm run build` exit 0, no warnings - log
- Unit tests pass - `npx vitest run`: 5 files, 31 passed - log
- E2E pass - `npx playwright test`: 86 passed (18.2 s) - log
- Tracker pass - `node docs/requirements/verify.mjs`: 69 pass, 5 pending. It did not change the tracker files - `docs/requirements/acceptance-criteria.md`
- Console pass - 0 page errors and 0 console errors in all probes - probe
- Code pass - SCSS uses `--column-width` / `--column-count`, no new literals. `ColumnWindow` and helpers at the bottom (top-down). No dead code found. Changes outside the grid: `app.ts` / `app.html` (`drawerOrderId`), `work-order-bar.ts` (`start` phase), test changes in `infinite-scroll.spec.ts` and `storage.spec.ts` adapt to the window; all needed by I9 - `jj diff`

## Observations (not failures)

- Tab order: far bars are out of the Tab order until the user scrolls to them (see I5 line).
- `updateWindow` does not run on a rail width change (the ResizeObserver watches the scroller).
  The one-viewport buffer covers it: rail 240 -> 560 px kept the grid covered.
- Pixel mismatch of the default state is exactly at the 0.2% limit.

## Failures


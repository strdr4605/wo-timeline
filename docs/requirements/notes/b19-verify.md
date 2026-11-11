# b19-verify (I12, demo data)

Verifier of `b19-demo-data`, uncommitted in the working copy. Scope: handover
`session-handover-2026-11-10b.md`, points 1 to 7 (core, extra A, extra B). Headless Chromium,
1440 x 1024, dev server on :4200. Probe scripts are in the session scratchpad (not in the repo).

## Checks

Format: `<id> pass|fail - <evidence> - <source>`.

### Pixels and parity

- Pixels `Schedule - Default` pass - mismatch 0.2% with bar and cursor masks; b18 committed value 0.2% (`b18-datepicker.md`). No increase - pixel-check.mjs
- Parity screenshot pass - `app.png` of `?parity=1`, `?parity=1&demo=1`, `?parity=1&demo=1&virtual=0` and the default URL: same MD5 `318944ca…` - pixel-check.mjs
- Parity DOM pass - `?parity=1&demo=1` and `?parity=1&demo=1&virtual=0`: no demo button, no badge; same button list as `?parity=1`; 13 columns, 4 bars, scrollLeft 570 as before - probe P1, P5

### Point 1: the button and the flag

- I12.1 no flag pass - `/` and `/?demo=0`: no "Load 5,000 orders" in the DOM, no `.demo-badge` - probe P1
- I12.1 with flag pass - `/?demo=1`: toolbar children are `chip | Today | Load 5,000 orders | Load 50 work centres | Reset data` (same parent, after Today) - probe P1

### Point 2: the generator and the storage

- I12.2 count pass - badge "Orders 5000"; `?virtual=0` renders 5,000 bars - probe P2, P5
- I12.2 statuses pass - complete 1292, in-progress 1270, open 1209, blocked 1229 - probe P5 (DOM `data-status`)
- I12.2 no overlap pass - `?virtual=0`, all 5,000 bars, per row sorted by position: 0 overlaps on 5 rows and on 55 rows; unit test uses the real `overlaps()` - probe P5, `tests/unit/demo.spec.ts`
- I12.2 span pass (with note) - 55 rows: about 2 years each side (unit test, 740-day bound). 5 rows: months 3.5 to 69.2 of a 73-month range, about 2.7 years each side. This is needed: 5,000 orders x 2 days / 5 centres = 2,000 days minimum. The builder notes say so - probe P5, `demo.ts`
- I12.2 no localStorage write pass - `setItem`/`removeItem` spy from page start: load 5,000, a delete, an edit with Save (bar "Edited demo" shows), load 50 centres, reset: 0 calls; `localStorage` empty - probe P2
- I12.2 saving still works after reset pass - after Reset, a delete of a sample order writes `naologic.workOrders.v1` once (normal behaviour comes back) - probe P4
- I12.2 reload pass - reload after the demo: 5 rows, "Orders 8" - probe P2

### Point 3: the badge

- I12.3 text pass - "Orders 8 · bars in DOM 8 · columns in DOM 37 · frame 0 ms" - probe P3
- I12.3 style pass - `position: fixed`, right 24px, bottom 24px, 13px, white fill, 5px radius; chip tokens only in `demo-badge.scss` - probe P3, code
- I12.3 update on scroll pass - Day view, scroll 2,000 px: bars 205 to 215, columns 81 to 85; values agree with the DOM count - probe P3
- I12.3 only with ?demo=1 pass - see point 1

### Point 4: Reset data

- I12.4 pass - after "Load 50 work centres" then Reset: 5 rows, "Orders 8", sample order names after Today; an open drawer closes (code `app.ts` `resetData`) - probe P4, e2e

### Point 5: extra A, `?virtual=0`

- I12.5 off pass - Day view after a 3,000 px scroll: 149 header cells for `--column-count` 149, 5,000 bars. Month: 73 of 73 (103 of 103 after scroll) - probe P5, perf
- I12.5 default on pass - `?demo=1` Day view, same scroll: 84 header cells for 149 - probe P5

### Point 6: extra B, 50 work centres

- I12.6 pass - 55 rows, "Orders 5000"; rows not windowed: 298 bars in the DOM in Day view against 205 on 5 rows - probe P6, perf
- I12.6 effect reported pass - table in `b19-demo-data.md`; my numbers below agree in direction

### Point 7: e2e evidence

- I12.7 titles pass - 6 tests `[I12]` in `tests/e2e/demo-data.spec.ts`, 4 in `tests/unit/demo.spec.ts`
- I12.7 no button without flag / parity pass - test 1 checks `/`, `?parity=1`, `?parity=1&demo=1` for all 3 buttons and the badge
- I12.7 bounded bars pass (with note) - test 2 bounds the bars at 400 in Day view only. In Month view (the default) 2,825 of 5,000 bars stay in the DOM; the test does not claim more than Day view
- I12.7 no overlap pass - test 3 reads every bar with `?virtual=0`, strict gap check per row, 5 and 55 rows
- I12.7 reset pass - test 4
- I12.7 `?virtual=0` pass - test 5 compares the DOM columns with `--column-count`, both modes
- I12.7 localStorage pass (with note) - test 6 checks the final storage after a delete, so the guard in `persist()` is under test. It does not spy `setItem`; the app has no `removeItem`, so the end state is enough

### Regressions

- `npm run build` pass - no warnings
- `npx vitest run` pass - 35 passed
- `npx playwright test` pass - 97 passed
- `verify.mjs` pass - 74 pass, 0 fail, 2 pending. It overwrote the D12 and I12 evidence again (the builder saw this too). I restored both files from my copy; `acceptance-criteria.*` is as the builder left it

### Code

- Code tokens pass - only tokens in `demo-badge.scss`; `z-index: 20` is a literal, same as `.resize-alert` in `app.scss`
- Code scope pass - `timeline-grid.ts` gets one early return under `VIRTUAL_MODE`; `schedule.service.ts` change is the writable centres signal, `loadDemo`, `resetData`, and the `persist()` guard
- Code order pass - entry points first, helpers (`mulberry32`, `FRAME_WINDOW_MS`, `sampleWorkCenters`) at the bottom
- Code note - `?virtual=0` also works in parity mode (`VIRTUAL_MODE` does not check `PARITY_MODE`). Parity already renders every column, so the screenshot is the same (MD5 above)

## Builder finding: Month view, windowing on is slower than off

Real. Reproduced twice. 160 frames, 60 px a frame (80 right, 80 left), frame gap in ms.

| View | Rows | Virtual | Bars in DOM | Median / p95 / max | Total | DOM mutations |
|---|---|---|---|---|---|---|
| Month | 5 | on | 2,825 | 64.7 / 159.0 / 195.5 | 12,053 | 47,194 |
| Month | 5 | off | 5,000 | 16.7 / 44.5 / 204.4 | 3,194 | 60 |
| Month | 55 | on | 3,905 | 68.8 / 225.6 / 399.6 | 14,684 | 51,130 |
| Month | 55 | off | 5,000 | 16.8 / 45.3 / 231.6 | 3,446 | 60 |
| Day | 5 | on | 205 | 16.6 / 28.3 / 46.6 | 2,700 | 4,594 |
| Day | 5 | off | 5,000 | 16.3 / 39.5 / 223.0 | 3,510 | 240 |
| Day | 55 | on | 298 | 16.8 / 34.6 / 52.0 | 2,826 | 5,568 |
| Day | 55 | off | 5,000 | 16.7 / 45.5 / 265.7 | 3,909 | 240 |

Second run within 5% of the first. My Month medians (65 to 69 ms) are lower than the builder's
(117 to 132 ms), but the result is the same: in Month view the window holds most of the bars and
each window move re-renders them (47,194 mutations against 60). The cause is in the b13 window
code (I9), not in b19. I did not repeat the CDP profile.

Effect on the demo: Month is the default view. A human who clicks "Load 5,000 orders" and scrolls
in Month view sees the windowing make it slower. Day view shows the benefit.

Also seen (b13 behaviour, not b19): after a load, a timescale change or Today, the badge shows a
long frame (200 ms to 533 ms), and Today in Month view showed 995 bars and 13 columns before the
next scroll measure.

## Failures

1. Badge over the drawer (minor, UI). The badge has `z-index: 20`; the drawer has 10 and 11. With
   the drawer open, the badge covers the bottom-right of the drawer panel (box x 950, y 975,
   466 x 25). `pointer-events: none`, so clicks pass through. Demo mode only. Fix: put the badge
   under the drawer, or at the bottom left.

No other failures. Items for the lead to decide (not failures of b19):

- Month-view windowing is slower than no windowing with the demo data (above). b13 scope.
- `verify.mjs` keeps only the first test title as evidence and overwrites the D12 and I12 rows.

## Lead fixes

- Failure 1: the badge is now at the bottom left (`left` instead of `right` in
  `demo-badge.scss`). With the drawer open: badge x 24 to 453, drawer x 849 to 1440. No overlap.
  `tests/e2e/demo-data.spec.ts`: 6 passed.

## Lead decision

- The Month-view slowdown with windowing on is real, but it is b13 (I9) code. It is not fixed in
  this unit. It is an open note in the handover.

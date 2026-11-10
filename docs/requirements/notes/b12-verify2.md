# b12-infinite verify 2 (I1 after fix b12-fix)

Verifier, 2026-11-11. Lead: t38. Node 26 (`/opt/homebrew/opt/node@26/bin`). All browser checks are
headless, 1440x1024. Scripts in the verifier scratchpad
(`/private/tmp/claude-501/-Users-strdr4605-P-interviews-2026-11-08-naologic/ea0e7bd8-166b-4b37-8c5b-a0d776e367df/scratchpad`):
`edges.mjs`, `clip.mjs`, `after.mjs`, `after2.mjs`, `day9.mjs`. Baseline screenshots: the
`px-4300-*` output of the first verify (commit `bd53520`, before b12).

## Pixels (`scripts/pixel-check.mjs`)

- Schedule - Default, masks `437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25`
  pass - 0.2% (limit 0.2%), `app.png` byte-identical (`cmp`) to the baseline before b12 - pixel-check
- Schedule - Default, same masks, `hover@727,322;wait@300` pass - 0.11% (limit 0.11%), `app.png`
  byte-identical to the baseline - pixel-check

## Behaviour. Spec: "Dynamically load more date columns as user scrolls left/right (prepend past dates, append future dates)", "When prepending, adjust scroll position to maintain view"

Right edge: 12 rounds of 10 `mouse.wheel(400, 0)`, then a jump to `scrollWidth`. The gap is the
last header cell right edge minus the visible right edge of the grid. A gap below 0 is an empty
area.

- I1 right edge Hour pass - 97 -> 1087 columns by wheel, min gap 1351 px; jump to the end: 1117
  columns, gap 1392 - edges.mjs
- I1 right edge Day pass - 89 -> 1109 columns, min gap 1361 px; jump: 1139 columns, gap 1392 -
  edges.mjs
- I1 right edge Week pass - 73 -> 493 columns, min gap 1386 px; jump: 523 columns, gap 3306 -
  edges.mjs
- I1 right edge Month pass - 73 -> 493 columns, min gap 1381 px; jump: 523 columns, gap 3306 -
  edges.mjs
- scrollWidth matches the columns pass - in all four, `scrollWidth - clientWidth - scrollLeft`
  minus the gap is 48 px (Hour, Day) and 114 px (Week, Month): the header `::after` column. The
  bars past the range no longer widen the scroll area - edges.mjs
- I1 left extend keeps position pass - `scrollLeft = 300`: Hour 97 -> 127, Day 89 -> 119, Week
  73 -> 103, Month 73 -> 103; a visible bar moves 0 px on each of 6 rAF frames - edges.mjs
- Parity fixed range pass - `?parity=1` loads with 13 columns; scroll to 0 and to the end change
  nothing (e2e `[I1] parity mode keeps the fixed range of the design`, and clip.mjs: same edges
  after both scrolls)

## Bar clip (`overflow-x: clip` on `.grid__timeline`)

Method: for each visible bar, screenshot the state with the clip, then with
`.grid__timeline { overflow-x: visible !important }`, and diff (pixelmatch, threshold 0). States:
static, hover (tooltip after the dwell), menu open, keyboard focus ring (`:focus-visible` true).
Plus the hover placeholder next to each visible timeline edge. Views: parity at start scroll, at
0, at the end; default at load, at 0, at the end.

- Clip does not hide bars inside the range pass - 0 px diff in all 6 static views - clip.mjs
- Focus ring near edges pass - 0 px diff for 18 focused bars (parity bars at x 370..1782) - clip.mjs
- Three-dot menu near edges pass - 0..2 px diff for 18 bars, 12 with the menu open - clip.mjs
- Tooltip near edges pass - 0..1 px diff for 18 hovered bars - clip.mjs
- Hover placeholder near edges pass - 0..2 px diff at x 522 (parity, left edge at 482), 1320 and
  1389 (parity, right part) - clip.mjs
- Diff pixels are noise pass - all diff pixels are single pixels at y 388 or y 438, at x 614..1253,
  far from the timeline edges (left 482, right 1440..1509). No diff on an edge - clip.mjs, loc.mjs
- In default mode the timeline edges stay off screen pass - the right gap stays >= 1351 px and a
  left extend runs at `scrollLeft < clientWidth`, so the clip line is never in view - edges.mjs

## Regressions after an extend, with the clip

- C9 drag pass - Day, after left extends (89 -> 209 columns): end handle +96 px (2 columns) moves
  the end Feb 22 -> Feb 24, 2027. Month after a left extend: +120 px moves Feb 22 -> Mar 26, 2027
  - day9.mjs, after.mjs
- I5 keyboard pass - Day and Month after an extend: Enter opens the menu, Escape closes it, focus
  goes back to the bar - day9.mjs, after.mjs
- I10 rail pass - Day after extends: rail 380 -> 440 px for a 60 px drag; Month: 440 -> 500 px -
  after.mjs
- Today line pass - after Today: Month marker centre x 991 inside the current cell 953..1067; Day
  marker centre x 961 at the left edge of the current cell 961..1009 (local time 00:5x, so the
  day fraction is near 0) - after2.mjs
- Hover placeholder pass - Day and Month: placeholder x 648, width 113, contains the pointer at x
  700; after a left extend under the still pointer it is at x 649 and still contains it - after.mjs

## Regressions

- `npm run build` pass - clean, no warnings
- `npx vitest run` pass - 31 passed
- `npx playwright test` pass - 80 passed (15.4s)

## Code

- Right-edge test pass - `columnsRightGap` uses column count x `--column-width`, not
  `scrollWidth` - `src/app/timeline-grid/timeline-grid.ts:581`
- Tokens pass - no new literals; the column width comes from `--column-width`
- Top-down pass - `columnsRightGap` sits with the other module helpers after the class
- Clip comment pass - the comment gives the reason for `clip`, not `hidden` (sticky header) -
  `src/app/timeline-grid/timeline-grid.scss:102`
- Scope pass - src changes only in `timeline.ts`, `timeline-grid.ts`, `timeline-grid.scss`; tests in
  `infinite-scroll.spec.ts`, `timeline.spec.ts`
- Dead code note (carried from verify 1) - `buildColumns` has no caller in `src/`; only unit tests
  call it

## Failures

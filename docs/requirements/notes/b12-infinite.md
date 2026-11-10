# b12-infinite: infinite horizontal scroll (I1)

## What changed

- `src/app/timeline/timeline.ts`: `BUFFER` is exported. New `columnsInRange(timescale, today,
  firstOffset, lastOffset)`. `buildColumns` uses it. No change to the date maths.
- `src/app/timeline-grid/timeline-grid.ts`:
  - The range is two `linkedSignal`s, `firstOffset` and `lastOffset`, as column offsets from
    today. A new timescale resets them to `-BUFFER..BUFFER`. `columns` is
    `columnsInRange(...)`. No stored column array.
  - A `scroll` listener runs outside Angular (`listenForEdges`). Parity mode attaches no
    listener, so the range stays fixed (13 Month columns).
  - `extendAtEdges`: when less than one viewport (`clientWidth`) is left at an edge, it adds
    `EXTEND_CHUNK = 30` columns there. When both edges are near (short range), both extend in
    one pass. A left extend sets `scrollLeft = old + 30 x column width` in an `afterNextRender`
    write, before the paint. The hover placeholder x moves by the same shift. After the render
    it checks the edges again.
  - The compensation is skipped when a Today reset or a timescale change came between the
    extend and its render.
  - `centerOnToday`: resets the range (`resetRange`). When the range changed, it centres after
    the next render. During the smooth scroll, extends are paused until `scrollend`.
  - The centre target uses the scroller left + rail width, not the rail box. Cause: after a
    reset shrinks the range, the old scrollLeft is past the end of `grid__inner`, so the sticky
    rail moves off screen and its box gives a wrong target. This was the I2 failure in Week.
  - The `afterRenderEffect` that scrolls on a timescale change now calls `scrollToStart` in
    `untracked`. Without it, an extend (new columns, new today index) re-centred the view.
- `tests/e2e/infinite-scroll.spec.ts`: 4 tests `[I1]`.
- `tests/e2e/timeline.spec.ts`: B8 and B5 expected exactly 29 Day columns and 13 Week columns.
  The load now extends, so B8 checks at least 14 days on each side of today (by the current
  header class), and B5 waits for the first label instead of the count.

## Checks by hand (headless Playwright)

- Per-frame sample (rAF) after `scrollLeft = 300`: bar x delta 0 on the first frame, columns
  73 -> 103, no jump.
- Wheel left / right in Hour, Day, Week, Month: columns grow, then Today (smooth) centres
  today within 1px in all four.
- End-edge drag resize after a left extend: end date moves (Feb 22 -> Mar 27, 2027).
- Parity: 13 columns, scrollLeft 570, no change after scroll to 0 and to the end.

## Pixel check

| State | Before | After |
|---|---|---|
| Schedule - Default, bar masks | 0.21% | 0.21% |
| Schedule - Default, `hover@727,322;wait@300`, bar + cursor masks | not measured | 0.11% |

The parity code path did not change (no listener, same range), so the hover state is the same
as before.

## Results

- `npm run build`: clean.
- `npx vitest run`: 31 passed.
- `npx playwright test`: 78 passed. `infinite-scroll` and `today` specs: 25/25 with
  `--repeat-each=5`.
- Mutation: without the left compensation, 3 of the 4 `[I1]` tests fail.
- `node docs/requirements/verify.mjs`: I1 pass. The evidence shows one `[I1]` title (the tool
  keeps the last one).

## Ready for I9

The columns come from the offset range only. Windowing can render a slice of
`firstOffset..lastOffset` with a left spacer. Nothing else stores column indices.

## Fix b12-fix

Verifier failure: in Day and Hour, bars past the rendered range made `scrollWidth` larger. The
right-edge test used `scrollWidth`, so it stayed false. The header and grid ended with empty
space on the right.

### What changed

- `src/app/timeline-grid/timeline-grid.ts`: the right-edge test uses the column extent (column
  count x `--column-width`). New helper `columnsRightGap` gives the width from the right edge of
  the visible grid to the end of the last column. The left test and the left compensation did
  not change.
- `src/app/timeline-grid/timeline-grid.scss`: `.grid__timeline` has `overflow-x: clip`. A bar
  past the last column is cut and does not make the scroll area wider. `clip`, not `hidden`:
  `clip` makes no scroll container, so the sticky header still works. The vertical axis stays
  visible.
- `tests/e2e/infinite-scroll.spec.ts`: 2 new tests `[I1] in Day|Hour a scroll to the right end
  keeps adding columns, no empty area`. Each scrolls 4 times until the last column is at the
  right edge of the grid (as a wheel does, not to `scrollWidth`). The columns must grow, and
  `scrollWidth` minus the last header right edge must be from 0 to one viewport.

### Checks by hand (headless Playwright)

| Timescale | Before | After |
|---|---|---|
| Hour | 397 columns, no growth, last column right 19438, scrollWidth 290853 | 127 -> 277 columns in 5 extends, scrollWidth - last right = 47 |
| Day | grows only with a jump to `scrollWidth` | 119 -> 269 columns, scrollWidth - last right = 47 |

The 47 px is the empty `::after` column of the header (design view, unchanged).

### Mutation

- Old edge test and no clip: both new tests fail.
- New edge test, no clip: both new tests fail (gap larger than one viewport).

### Pixel check

| State | Before | After |
|---|---|---|
| Schedule - Default, bar masks | 0.21% | 0.21% |
| Schedule - Default, `hover@727,322;wait@300`, bar + cursor masks | 0.11% | 0.11% |

Parity mode has no scroll listener. The clip cuts nothing in the design view.

### Results

- `npm run build`: clean.
- `npx vitest run`: 31 passed.
- `npx playwright test`: 80 passed. `infinite-scroll.spec.ts` 18/18 with `--repeat-each=3`.
- `node docs/requirements/verify.mjs`: I1 pass (68 pass, 5 pending).

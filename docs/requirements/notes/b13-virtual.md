# b13-virtual: virtual scrolling of the timeline (I9)

## What changed

- `src/app/timeline-grid/timeline-grid.ts`:
  - New signal `columnWindow`: the columns in the DOM, as column offsets from today (the same
    unit as `firstOffset..lastOffset`). Null renders every column. It is null before the first
    measure, after a new timescale (`linkedSignal` on the timescale), after a range reset by the
    Today button, and always in parity mode (parity attaches no listener).
  - `updateWindow` runs in the scroll listener (outside Angular), in a `ResizeObserver` on the
    grid, at the start, and after each extend. It measures the visible columns and sets a window
    of the visible columns plus one viewport on each side. The window snaps to steps of one
    viewport, so the DOM changes about once per viewport of scroll. The signal is set in
    `zone.run` only when the window changes.
  - The window is in offsets, not indices. A left extend changes `firstOffset`, the window keeps
    its offsets, and the indices move by the same 30 columns as the scroll compensation. The
    view does not move.
  - `windowColumns` and `windowStart` are computed from the window. The full column list stays
    (an array of small objects): the date maths, `pickCell`, today and the edge test use it.
  - `barsOf` keeps only the bars that overlap the window (a test on the bar start and end
    positions). Bar positions stay logical (from the first column). Three bars are always kept:
    the focused bar (`focusin` / `focusout` on the bar host), the bar in a pointer drag (from
    the new `start` phase to `end` / `cancel`) and the bar of the open edit drawer (new input
    `drawerOrderId`).
  - `resetRange` sets the window to null. Without it, the Today button showed one empty frame:
    the old window was outside the new range.
- `src/app/timeline-grid/timeline-grid.html`: the header cells and the grid columns are in a
  `.grid__track` (all columns wide) and a `.grid__window` (only the window). The timeline sets
  `--column-count` and `--window-start`. The "under today" column test uses `windowStart() + i`.
- `src/app/timeline-grid/timeline-grid.scss`: `.grid__track` width is column count x column
  width, so the scroll width does not change. `.grid__window` is a flex row moved with
  `translateX(window start x column width)`. `.grid__columns` lost `display: flex` and
  `width: max-content` (the window has them now).
- `src/app/work-order-bar/work-order-bar.ts`: `BarResize.phase` has a new value `start`, sent on
  the press of a handle. The grid uses it to keep the bar in the DOM. Nothing else changed.
- `src/app/app.ts`, `app.html`: `drawerOrderId` (the order of the edit drawer) goes to the grid.
  The drawer gives the focus back to that bar on close, so the bar must exist.
- The today line, the chip and the hover placeholder did not change. They are in the body, which
  is as wide as all columns, and use logical positions.

## Tests changed (not the behaviour they check)

- `tests/e2e/infinite-scroll.spec.ts`: the DOM no longer holds every column. The tests count
  the range from `--column-count` on `.grid__timeline`. The right-edge tests use the right edge
  of the header track, not the last DOM cell. The left-extend test first scrolls to just
  outside the edge zone, so the window is at the place of the next scroll. The bar test keeps
  the bar in the DOM with the focus and measures it from the today line. Mutation: without the
  left compensation, 2 of the 6 `[I1]` tests fail.
- `tests/e2e/storage.spec.ts` `[F5]`: the create click was at x 300 of the row, about 3 years
  before today in Month view. That bar is now out of the window, so `reloadApp` found no bar.
  The click is now under the today line.

## New tests: `tests/e2e/virtualization.spec.ts`, 6 tests `[I9]`

1. A scroll of about 2 years in Day view: at each 1500 px step, header and grid cells are equal
   and at or below 110. The range grows past 730 columns. At least 20 cells are visible.
2. After that scroll no bar is in the DOM. The Today button brings them back.
3. Prepend: the first visible header keeps its label and x after a left extend.
4. Focus: a focused bar stays (the only bar in the DOM) after a 1 year scroll. Shift+ArrowRight
   still changes it. A blur lets it go.
5. Drag: press the end handle, move 2 days, scroll the bar far out of the window, move to
   3 days, release. The bar stays in the DOM during the drag and leaves after. The new end date
   is 3 days earlier.
6. Parity: every column is in the DOM, the window transform is the identity.

Mutations (each restored after):

| Mutation | Result |
|---|---|
| No window update (render all) | 5 of 6 fail (parity passes) |
| Focused bar not kept | test 4 fails |
| Dragged bar not kept | test 5 fails |

## Checks by hand (headless Playwright)

- Day view, scroll +2 years then -4 years in 450 px steps: 61 to 81 columns in the DOM, 0 bars
  far away, header cell x equal to grid cell x.
- Fast scroll, 1500 px per frame, 80 frames, each timescale: the cells cover the visible grid
  in every frame. Max DOM columns: Hour 85, Day 85, Week 41, Month 41.
- Today button (smooth), 60 frames sampled with rAF: no empty frame after the fix above.
- Edit drawer open, grid scrolled 8000 px: the bar stays in the DOM. Escape gives it the focus.
- Drag of the end handle, no scroll: Jan 21 -> Jan 18. With a scroll during the drag: Jan 18
  -> Jan 15.
- No console errors.

## Pixel check

| State | Before | After |
|---|---|---|
| Schedule - Default, bar masks | 0.21% | 0.21% |
| Schedule - Default, `hover@727,322;wait@300`, bar + cursor masks | 0.11% | 0.11% |

Parity mode keeps the window null: every column, every bar, `translateX(0)`.

## Results

- `npm run build`: clean.
- `npx vitest run`: 31 passed.
- `npx playwright test`: 86 passed. virtualization, infinite-scroll, today, rail, resize and a11y
  with `--repeat-each=3`: 48 passed.
- `node docs/requirements/verify.mjs`: I9 pass (69 pass, 5 pending). The evidence shows the last
  `[I9]` title (the tool keeps the last one).

## Open points

- The first render after a new timescale renders the whole reset range (Hour 97 columns) until
  the first measure. It is small and bounded.
- The full column list is still computed (one small object per column). Only the DOM is
  windowed. In Hour view after a very long scroll this list grows by 30 per extend.

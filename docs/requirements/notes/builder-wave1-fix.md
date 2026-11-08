# Builder wave 1 fix notes

Fix round after the verifier report of round 1 (`docs/requirements/notes/verifier.md`).
Items touched: **B6, B9, G2, G5** (plus the token file note).

## What was fixed

| # | Fix | Evidence |
|---|---|---|
| 1 | **B6 current month chip.** The pill that sat inside the header band is gone. The chip of the Sketch is now in the grid: `.grid-current-chip`, 109 wide, 22 high, radius 5, fill `#d4d7ff`, text `#3e40db`, text "Current month". It sits on the header band bottom edge (y 237) at the left edge of the current month column, the same place as the 3px `#d4d7ff` marker, which stays. Artboard: `Group 2` x 595 y 237 w 109 h 22, `Group 2/Rectangle` fill `#d4d7ff`, `Group 2/Group 33/Current month` 14 Book `#3e40db`. | e2e `[B6] the current month shows the chip of the design and a vertical line`; measure `.grid-current-chip` background `#d4d7ff`, color `#3e40db`, box 109x22; `.grid-current-marker` box 3, `#d4d7ff`. |
| 2 | **B9 one hover.** The rail row and the timeline row of a work centre hover together. A `hovered` signal in `TimelineGrid` holds the work centre id; both rows take the `--hovered` class, so the rail row and the timeline row of the same work centre get `#f1f3f8` at 75% alpha. The plain CSS `:hover` rules are gone, the class is the single source. | e2e `[B9] the work centre row and the timeline row hover together`. |
| 3 | **G2 chip width.** The chip is 146 wide (`75 + 71` from the tokens), the 1px border sits inside the segments, so the label segment starts at x 101 and the value segment at x 176, as in the Sketch. The border ring is drawn with an inset outline because the segments lie on it. | e2e `[G2] the timescale chip is 146 wide with the segments at 75 and 71`; measure `.timescale-chip` box 146x25. |
| 4 | **Harness noise.** The G5 measurement for `.drawer__title` (a wave 3 element) is removed from `docs/requirements/measurements.json`. A bare `node docs/requirements/measure.mjs` no longer flips G5 to fail. Re-add it in wave 3 with the drawer. | `measure.mjs` now reports 16 pass, 9 fail and G5 stays pass. |
| 5 | **Agent choices recorded.** `docs/design/tokens.json` has a new top level `agentChoices` note that names `layout.grid.header.columnWidthDay` (48) and `layout.grid.header.columnWidthWeek` (114) as agent choices and points at `docs/decisions/2026-11-08-grill-session.md` Q15. No measured value changed. | `docs/design/tokens.json`. |

## Files changed

- `docs/design/tokens.json`: `agentChoices` note, new measured token
  `layout.grid.currentMonthChip` (width 109, height 22, from the artboard).
- `src/styles/_tokens.scss`: regenerated (`npm run tokens`).
- `src/app/timeline-grid/timeline-grid.html`: the chip in the marker layer, the hover bindings.
- `src/app/timeline-grid/timeline-grid.scss`: chip style, `--hovered` row styles.
- `src/app/timeline-grid/timeline-grid.ts`: the `hovered` signal.
- `src/app/timescale-chip/timescale-chip.scss`: the 146 wide chip.
- `docs/requirements/measurements.json`: G5 `.drawer__title` entry removed, B6 selector moved to
  `.grid-current-chip` (same expected value `#d4d7ff`), G2 width entry added (new, 146 from the
  Sketch). No other selector and no other expected value changed.
- `tests/e2e/timeline.spec.ts`: B6 and B9 rewritten for the new behaviour, a new G2 test, and the
  B2 wheel assertion now waits for the scroll to change instead of only checking `scrollLeft > 0`
  (the grid already starts at a scroll position of 233 after the initial centring).

## Commands run

```bash
npm run tokens
npm run build                 # clean
npx playwright test           # 14 passed
npx vitest run                # 3 passed
node docs/requirements/measure.mjs    # 16 pass, 9 fail (all failures are wave 2 and 3 selectors)
node docs/requirements/verify.mjs     # A1 A5 G1 G2 G5 and B1 to B11 pass
```

## Commit

- Message: `wave1 fix: current month chip, shared row hover, chip width, measurement cleanup (B6 B9 G2 G5)`
- Change id (stable): `pquvvlxzptzu`
- Resolve the commit with `jj log -r 'pquvvlxzptzu'`.
- The commit also carries the verifier round 1 files (`docs/requirements/notes/verifier*.md`,
  `verifier*.mjs` and `docs/requirements/prompts/verifier.md`), they were in the working copy.

## What the next wave must know

- The current month chip lives in the marker layer of the timeline, not in the header. It floats
  over the first row, as in the Sketch. Do not put a pill back into the header cell.
- The chip copy is the copy of the design: "Current month", also in Day and Week view.
- The hover state is a class, not a CSS `:hover`: `TimelineGrid.hovered` holds the work centre id
  and both rows of that work centre take the `--hovered` class. A bar that has its own hover state
  must not fight with the row hover.
- The chip is 146 wide with the border inside the segments. If the chip grows, keep the value
  segment at x 176.
- The grid is still the only scroll container. `.grid__markers` holds the current month marker,
  the current month chip and the today marker; it starts at the header band bottom edge (y 237).

# Builder wave 1 notes

Timeline grid and zoom levels. Items: **B1 to B11**.

## Items done

| Item | What was built | Evidence |
|---|---|---|
| B1 | Left rail is `position: sticky; left: 0` inside the scroll container, so it stays at x 102 while the timeline scrolls. | e2e `[B1] the work center panel stays fixed while the timeline scrolls sideways`. |
| B2 | The grid is one scroll container (`overflow: auto`); the timeline inside is wider than the viewport and scrolls sideways. | e2e `[B2] the timeline grid scrolls horizontally`. |
| B3 | The chip value segment is a button that opens a styled list (Day, Week, Month). No system dropdown. | e2e `[B3] the timescale dropdown offers Day, Week and Month`. |
| B4 | `timescale` starts at `Month` in `src/app/app.ts`. | e2e `[B4] the default timescale is Month`. |
| B5 | One column per period, label per zoom level: `Mon YYYY` (Month), week start date (Week), day number (Day). | e2e `[B5] the header row re-labels per zoom level`; measure `.grid-header-cell` width 114. |
| B6 | Current period gets a pill in the header (`#d4d7ff`, `#3e40db`) and a 3px `#d4d7ff` line on the left edge of its column. | e2e `[B6] the current period shows a pill in the header and a vertical line`; measure `.grid-header-cell--current .grid-header-cell__label` = `#d4d7ff`, `.grid-current-marker` width 3. |
| B7 | 1px `#3e40db` line at the interpolated position of today inside its column. | e2e `[B7] the grid shows a line for the current day`. |
| B8 | Initial scroll centres today in the visible grid area. Buffer: 14 days (Day), 6 weeks (Week), 6 months (Month) on each side. | e2e `[B8] the initial view centres on today with a buffer`. |
| B9 | Row hover paints `#f1f3f8` at 75% alpha on the rail row and on the timeline row. | e2e `[B9] hovering a row highlights the row background`. |
| B10 | Row height 48, rail width 380. | e2e `[B10] rows are 48 high and the work center panel is 380 wide`; measure `.grid__rail` width 380. |
| B11 | 1px `#e6ebf0` column dividers, column width per timescale (Month 114, Week 114, Day 48). | e2e `[B11] grid lines are 1px #e6ebf0 and columns follow the timescale`; measure `.grid-cell` border-right. |

## Items not done

Nothing of B1 to B11 is missing. Bars, drawer, forms and the sample data set belong to later waves
and were not touched.

## Commit

- Message: `wave1: timeline grid, zoom levels and markers (B1 B2 B3 B4 B5 B6 B7 B8 B9 B10 B11)`
- Change id (stable): `vwyyttwzxwsk`
- Resolve the commit with `jj log -r 'vwyyttwzxwsk'`.
- The commit also carries the orchestrator change of `docs/requirements/prompts/builder-wave1.md`
  (it was already in the working copy).

## Commands run

```bash
npm run tokens                # after the token file change
npm run build                 # clean
npx playwright test           # 13 passed
npx vitest run                # 3 passed
node docs/requirements/measure.mjs    # 13 pass, 10 fail (all failures are later waves)
node docs/requirements/verify.mjs     # B1 to B11 pass
```

Node: the system `node` is v16, too old for Angular 20. Use `/opt/homebrew/opt/node@26/bin` in PATH.

## Files

- `src/app/timeline/timeline.ts`: the date maths. `buildColumns` returns one column per period,
  `todayPosition` returns the index of today and the fraction of that period that has passed.
  Weeks start on Monday. The fraction is computed on UTC day numbers, so a daylight saving
  change cannot move a marker.
- `src/app/timeline-grid/`: the grid. Rail (sticky), header band, rows, markers.
- `src/app/timescale-chip/`: the chip now carries the zoom menu.
- `tests/e2e/timeline.spec.ts`: one test per item, id in the title.
- `docs/requirements/measurements.json`: new entries for B5, B6, B10, B11.

## What the next wave must know

- **Layout**: `.grid` is the only scroll container (`overflow: auto`, height `100vh - 204px`).
  Inside it `.grid__inner` is a flex row: the sticky rail (380) and the timeline. The timeline
  width follows from its cells (`width: max-content`), so there is no hard coded width.
- **Column width** lives in CSS only, as the custom property `--column-width` on
  `.grid__timeline--day|--week|--month`. A marker position is
  `calc((var(--col-index) + var(--col-fraction)) * var(--column-width))`. The next wave (bars)
  can place a bar with the same rule.
- **Bars**: put them inside `.grid-row` (one `.grid-row` per work center, one `.grid-cell` per
  column). A bar needs `position: absolute` inside a `position: relative` row, or a second layer
  over the cells.
- **Tokens added** to `docs/design/tokens.json` (and regenerated into `src/styles/_tokens.scss`):
  `layout.grid.header.columnWidthDay` 48, `columnWidthWeek` 114, `labelPaddingX` 14,
  `layout.grid.leftRail.namePaddingX` 31, `layout.dropdownMenu.shadowBlur` 5 and `shadowColor`
  `#d8dceb`. The Day and Week widths are the agent choices of decision Q15.
- **Grid geometry**: rail x 102 w 380, timeline content starts at 483, header band 204 to 237,
  rows 48 high, first row top 238 (the 1px line of the header band sits at 237).
- **Scrolling pitfall**: the sticky rail needs a higher `z-index` than the sticky header
  (rail 2, header 1), otherwise the scrolling column labels paint over the rail title.
- The chip menu lives outside `.timescale-chip` (the chip clips its corners with
  `overflow: hidden`) and is styled with the `layout.dropdownMenu` tokens: 200 wide, radius 5,
  rows 28, shadow y 4.5 blur 5.
- The app has no work order data yet. The five work centres are placeholders in `src/app/app.ts`.

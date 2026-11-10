# Unit u2-grid: the timeline frame (B1, B5, B6, B7, B9, B10, B11)

Builder notes, 2026-11-10. Scope: everything at y >= 204 on "Work Order Schedule - Default",
without the work order bars.

## What changed

### Layout and layers (`src/app/timeline-grid/timeline-grid.{html,scss,ts}`)

- B1 card: the grid starts at x 101 with a 1px `#e6ebf0` left border (`src/app/app.scss` moves
  the host 1px left). The rail is white down to the page bottom (y 1024). The timeline border is
  the line at x 482. The timeline body is `#f7f9fc` to the page bottom. The timeline grows to the
  page right edge, so the body fill and the row hover run to x 1440, as in the artboard.
- B1 parity scroll: `scrollToColumn` keeps the timeline left border visible. August 2024 now
  starts at x 483, as in the artboard (it was at 482: the border was under the rail).
- B5 header: 34 high (lines at y 204 and y 237), white. The header lines are on the month cells,
  so they end with the last column (x 1395, the card edge of the design). No column separators.
  The month labels are centred in the column (text box 86 wide at column + 14).
- B10 rows: rail rows are 48 + a 1px bottom divider. The first row is 60, divider included, and
  its name has 13px top padding, so the name sits at y 266 as in the design. Timeline rows have no
  line: 48 high with a 1px gap, the first row 60. Rail tops: 238, 298, 347, 396, 445.
- Timeline layers, bottom to top: body fill; the backdrop (white first-row band, column lines,
  today line); the rows (hover fill, placeholder, bars); the chip. So a hovered row covers the
  column lines and the today line, and the bars cover both, as in the export.
- B11 column lines: `.grid-cell` columns in the backdrop, 1px `#e6ebf0` on the right edge,
  747 high from y 238 (`Group 5/Line 3`). They grow with the rows when there are more rows.
- B7 today line: one line. The old 1px `#3e40db` today line and the 3px current month marker are
  gone. The line is `Group 5/Line 3`: 3px `#d4d7ff`, 709 high (export y 238 to 946), centred on
  the column line left of today: x 595 to 597 in parity mode. Normal mode keeps the interpolated
  position of today.
- B6 chip: 109 x 22 at (595, 237), on the header bottom line, left edge in line with the today
  line. Text padding 8.
- B9 hover: the rail row `#fafbfd`, the timeline row `#eef0ff`. Over an empty part of a
  timeline row, a placeholder box follows the pointer: 113 x 38, centred on the pointer x,
  vertically centred in the row, `#6570ff` at 10%, 1px inside border `#c3c7ff`, radius 8. The
  tooltip "Click to add dates" is 130 x 26, 5px above the box, 10px left of it (design x 665),
  `#687196`, two shadows with spread (0 0 16 -8 `#e6ebf0`, 0 2 4 -2 `#c8cfe9`). Over a bar the
  box goes away.
- Normal mode: the same CSS for Hour, Day, Week and Month. Only `--column-width` changes.

### Tokens (`docs/design/tokens.json`, then `npm run tokens`)

- `layout.grid.todayMarker`: `#3e40db` 1px changed to `#d4d7ff` 3px, length 709 (the old line
  was not in the design).
- New: `verticalGridLine.length` 747, `headerFill`, `bodyFill`, `firstRowFill`, `railRowFill`,
  `railRowHoverFill`, `timelineRowHoverFill`, `currentMonthChipText.paddingX`, `cellHover.*`.
- Note under `agentChoices` key `layout.grid (u2-grid)`.
- `currentMonthMarker` is no longer used. Left in the file for the other notes that name it.

### Tests

- `tests/e2e/grid.spec.ts` (new): one test per item, `[B1] [B5] [B6] [B7] [B9] [B10] [B11]`,
  with the artboard pixel boxes in parity mode. B11 also checks Day, Week, Month in normal mode.
- `tests/e2e/timeline.spec.ts`: the old B6, B7, B9, B10, B11 tests are removed (they asserted the
  old 1px today line, the `#f1f3f8` hover, the 48px first row). The parity test expects
  August 2024 at x 483.
- `tests/e2e/smoke.spec.ts`: header selector `.grid-header-cell` (header cells are no longer
  `.grid-cell`).
- `docs/requirements/measurements.json`: B10 row height on `.grid-row:not(.grid-row--first)`,
  B6 marker on `.grid-today-marker`. Expected values unchanged.

Results: `npm run build` clean. `npx vitest run` 9 passed. `npx playwright test` 25 passed,
1 failed: `[G2]` expects the chip shadow spread `0px`, the chip has `-1.5px`. That is the state at
the parent commit `8952ee88` (token spread added by the tooling commit). Not this unit.

## Final pixel check

```
node scripts/pixel-check.mjs --artboard="Schedule - Default" --steps="hover@731,322;wait@300" \
  --mask="0,0,1440,204;437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25"
mismatch: 0.09%
     820   0.29%  Rectangle  [101,275,382,749]  fill #ffffff
     305  12.54%  McMarrow Distributio  [133,412,152,16]
     147   7.12%  Genesis Hardware  [133,266,129,16]
     129    5.6%  Rodriques Electrics  [133,314,144,16]
      86   3.89%  Work Center  [133,213,138,16]
      59   4.29%  Mar 2025  [1295,213,86,16]
      58   0.01%  Group 5  [596,275,799,747]
      58   2.42%  Group 2  [595,237,109,22]
```

The placeholder box and the tooltip are no longer in the list. With the lead's
`hover@727,322`: 0.11%. No mask at all: 0.37% (bars and cursor included). Before this unit:
0.63% masked.

## What still differs, and why

- Hover point: the box is centred on the pointer. The fingertip of the design cursor
  (`Cursor/Hand/Pointing` at 710, 325) is at x 731, and the box centre is 731.5. With
  `hover@727` the box lands 4px left (x 671). Use `hover@731,322` for this artboard.
- Rail names, header labels, chip text: glyph run width only (Sketch Core Text against
  Chromium), the same as the title in u1-top. Glyph boxes start at the design x and y.
- Rail line at y 297 (380 px): the layer `Line 3 [102,297,380,1]` exists, but the white first row
  rectangle covers it in the export. The app draws it, so rows 1 and 2 stay apart when no row is
  hovered.
- Timeline row 2 when not hovered: the mock grey starts at y 309, not 298. The app fills all rows
  after the first with `#f7f9fc`.
- Page bottom: the export is white at y 1022 and 1023 under the timeline. The app keeps
  `#f7f9fc` to y 1023 (1914 px, outside the reported layers).
- Column lines and the today line have the fixed lengths of the mock (747, 709), so they stop
  above the page bottom, as in the artboard.

## Files of this unit

`src/app/timeline-grid/timeline-grid.{html,scss,ts}`, `src/app/app.scss` (grid offset, 1 line),
`docs/design/tokens.json`, `src/styles/_tokens.scss` (generated), `tests/e2e/grid.spec.ts`,
`tests/e2e/timeline.spec.ts`, `tests/e2e/smoke.spec.ts`, `docs/requirements/measurements.json`.

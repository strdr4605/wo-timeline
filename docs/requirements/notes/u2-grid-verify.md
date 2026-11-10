# Unit u2-grid: verify report

Verifier, 2026-11-10. Artboard `Work Order Schedule - Default`, parity mode, lead steps
`hover@727,322;wait@300`, lead mask (bars, cursor 715,330,25,25, and y < 204).
Pixel check: mismatch 0.11% (out `.pixel-check/u2v`). Zoom crops in `.pixel-check/u2v-z1`,
`u2v-z2`, `u2v-zz1` to `u2v-zz6`. Spot pixel values read from `app.png` and the design PNG.

## Pixels (layers in the unit area)

- Rectangle [101,275,382,749] rail fill pass - #ffffff in design and app, 820 px are the rail name glyphs and the y 297 line - artboards.json, zz3
- Rail names (Genesis Hardware, Rodriques Electrics, Konsulting Inc, McMarrow Distribution, Spartan Manufacturing) pass - glyph box at design x/y, anti-aliasing and glyph run width only - pixel-check report
- Work Center label, month labels (Nov 2024, Mar 2025) pass - anti-aliasing only - zz6, pixel-check report
- Header lines y 204 and y 237, end x 1395 pass - app #e6ebf0 at both lines, 1394,220 #ffffff both - zz4
- Header and first row right of x 1395 fail - design #ffffff (1420,220; 1420,250; 1420,280; 1395,237), app #f7f9fc: the timeline content ends at x 1395 in parity mode (`.grid__timeline` right = 1395), the strip 1395-1440 is the `.grid` background - zz4, Playwright getBoundingClientRect
- Rectangle [483,298,957,48] hovered row #eef0ff fail - design #eef0ff to x 1440 (1420,320), app #f7f9fc from x 1395: the row hover stops at the content edge. Builder note says "row hover run to x 1440", not true in parity mode - zz4, pixel 1420,320
- Rectangle [483,309,957,713] body #f7f9fc pass - 75 px, edges only - pixel-check report
- Page left of the card (x 0-100, y 204-1024) fail - design #ffffff (50,250; 50,600; 98,300), app #f7f9fc (body background). Below the pixel-check colour threshold, so the report does not list it - pixel 50,600
- Rail divider y 297 (x 102-482) fail (known) - design #ffffff (200,297), app #e6ebf0. Builder keeps it on purpose (note "What still differs") - zz3
- Group 5 column lines (747 long from y 238) pass - x 710 and 1394 #e6ebf0 in both, end y 985 - zz5, pixels
- Column line under the today line (x 596, y 947-984) fail - design #f7f9fc (596,984), app #e6ebf0: the design has no column line under the today line, the app draws it below y 946 - zz2
- Group 5/Line 3 today line 3px #d4d7ff, y 238-946, x 595-597 pass - 596,940 #d4d7ff both - zz2
- Group 2 Current month chip [595,237,109,22] pass - box and fill match, text anti-aliasing only - zz1
- Rectangle [675,303,113,38] placeholder box fail - with the lead step hover@727 the box is at x 671, design x 675 (4px left). The design cursor `Cursor/Hand/Pointing` is at (710,325); its glyph `pointing` starts at x 719.4, fingertip at about x 724-727, not x 731 as the builder note says. The design box is not centred on the pointer: its centre (731.5) is ~5px right of the fingertip. With hover@731 the box matches - z1 vs z2 zoom, artboards.json
- Helpers/Button-Hover/Label tooltip [665,272,130,26] fail - same 4px shift with hover@727 (app x 661). Size, fill #687196, shadows and text match with hover@731 - z1, z2
- Page bottom y 1022-1023 under the timeline fail (known) - design #ffffff (1000,1022), app #f7f9fc. Builder note lists it - pixel 1000,1022

## Behaviour (Playwright, normal mode unless noted)

- B1 pass - "Work center panel on the left stays fixed while the timeline scrolls horizontally": rail sticky, e2e [B1] in grid.spec.ts and timeline.spec.ts pass; parity Aug 2024 at x 483 - acceptance-criteria.md, e2e
- B5 pass - "Header row re-labels per zoom level": Month "May 2026, Jun 2026...", 13 cells 114 wide; Week "Sep 28, Oct 5...", 13 cells 114; Day "27, 28...", 29 cells 48. Header 34 high (y 204-238) in all three - Playwright
- B6 pass - "highlighted current month pill in the header plus a vertical line on the grid": chip 109x22 at y 237 in Month/Week/Day, line 3x709 from y 238 - Playwright
- B6 chip label in Day and Week fail (pre-existing, not new in this unit) - the chip text is "Current month" also on the current week and the current day column (Day: chip x 959 on a 48 wide day cell) - Playwright
- B7 pass - "Current day indicator: Vertical line showing today's date": Month x 959.19 inside Nov 2026 cell (927-1041), Week x 959.28 inside cell 945-1059, Day x 959 at cell 961 minus 2px offset - FE-technical-test-10-2026.md line 100, Playwright
- B9 row hover pass - "Hover on row | Highlight row background": timeline hover gives rail #fafbfd + row #eef0ff; rail hover gives row #eef0ff; leave clears both and removes the box. Same in Month/Week/Day - FE-technical-test-10-2026.md line 175, Playwright
- B9 placeholder over a bar pass - pointer on a bar: 0 `.grid-cell-hover` - Playwright
- B9 placeholder and tooltip on rows 2-5 pass - box 113x38 centred on pointer x, tooltip 130x26 "Click to add dates" 5px above - Playwright
- B9 tooltip on the first row fail - hover at (560,268) puts the tooltip at y 218-244; the sticky `.grid__header` (y 204-238) covers it, only ~6px of it shows. Screenshot `first.png` in the verifier scratchpad - Playwright
- B9 placeholder next to a bar (observation) - hover 30px left of a bar shows the box at x 789-902, under the bar that starts at x 875. Design shows no such case - Playwright
- B10 pass - "Row height 48 ... left panel width 380": rail rows 238/60, 298/49, 347/49, 396/49, 445/49 (48 + 1px divider); timeline rows 60 then 48 with a 1px gap; rail 380 wide - Playwright, measurements.json
- B11 pass - "Grid lines 1px #e6ebf0, column dividers per timescale": `.grid-cell` 1px #e6ebf0, 747 high from y 238, width 114/114/48 for Month/Week/Day - Playwright, e2e [B11]

## Regressions

- npm run build pass - bundle complete, no warnings in tail
- npx vitest run pass - 3 files, 9 tests passed
- npx playwright test pass - 26 passed (includes the updated [G2] spread -1.5px)

## Code

- Tokens pass - all new sizes and colours come from `_tokens.scss` (generated from tokens.json)
- Dead tokens fail - no longer used in `src`: `$color-surface-row-alternate`, `$color-surface-row-hover(-alpha)`, `$layout-grid-header-label-padding-x`, `$layout-grid-current-month-marker-*`. Builder note keeps `currentMonthMarker` on purpose; the other three are not named - grep src
- Tooltip offset fail (minor) - `timeline-grid.scss` `.grid-cell-hover__tooltip left`: "centred, rounded to whole pixels, plus one", where "plus one" is `2 * border-width`. The formula fits one design number, not a rule. A token `tooltipOffsetX: -10` is clearer - timeline-grid.scss:213-215
- Top-down order pass - SCSS: grid, rail, timeline, header, backdrop, rows, hover, chip. TS: new methods sit with the other protected methods
- Scope pass - changes in grid files, app.scss (1 line), tokens, measurements.json, e2e specs. The [G2] expectation change in timeline.spec.ts is the lead's

## Failures

1. Header and first row right of x 1395 are #f7f9fc, design #ffffff (parity mode).
2. Hovered timeline row stops at x 1395, design #eef0ff to x 1440.
3. Page area left of the card (x 0-100, y >= 204) is #f7f9fc, design #ffffff.
4. Placeholder box and tooltip 4px left of design with lead step hover@727 (box x 671 vs 675). Design box centre is ~5px right of the cursor fingertip; builder claim "fingertip at x 731" not supported by the cursor layer (glyph at x 719.4).
5. First-row hover: the "Click to add dates" tooltip is under the sticky header, mostly hidden.
6. Column line drawn under the today line at x 596, y 947-984; design has none.
7. Rail divider at y 297 (known, builder choice).
8. Page bottom y 1022-1023 #f7f9fc, design #ffffff (known, builder note).
9. Chip says "Current month" on the current week/day column in Week/Day (pre-existing).
10. Dead tokens left: row-alternate, row-hover, header-label-padding-x, current-month-marker.
11. Tooltip left offset uses an ad-hoc "plus one" formula.

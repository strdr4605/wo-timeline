# Unit u2-grid2: verify report

Verifier, 2026-11-10. Recheck of `u2-grid-verify.md` after `u2-fix`. Artboard
`Work Order Schedule - Default`, parity mode (`/?parity=1`), steps `hover@727,322;wait@300`,
mask `0,0,1440,204;437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;715,330,25,25`.
Pixel check: mismatch 0.09% (out `.pixel-check/u2g2`). Without hover, with the hover layers also
masked (`483,298,957,48;660,268,140,34`): 0.09% (out `.pixel-check/u2g2-nohover`).
Spot pixels: design PNG against `.pixel-check/u2g2/app.png`.

## Pixels (layers in the unit area)

- Rectangle [101,275,382,749] rail fill pass - 820 px are rail name glyphs only, #ffffff both - pixel-check report
- Rail names (Genesis Hardware ... Spartan Manufacturing) pass - glyph anti-aliasing and run width only (Core Text against Chromium) - pixel-check report
- Work Center, month labels (Aug 2024 ... Mar 2025) pass - 27 to 86 px each, anti-aliasing only - pixel-check report
- Header lines y 204 and y 237 pass - 1300,204 / 1300,237 / 1394,204 / 1394,237 #e6ebf0 both; 1394,220 #ffffff both - spot pixels
- Header and first row right of x 1395 pass (old failure 1) - 1420,220 / 1420,250 / 1420,280 / 1395,237 #ffffff both - spot pixels
- Rectangle [483,298,957,48] hovered row pass (old failure 2) - 1420,320 and 1439,320 #eef0ff both - spot pixels
- Rectangle [102,298,380,48] hovered rail row #fafbfd pass - 129 px, glyphs of "Rodriques Electrics" only - pixel-check report
- Page left of the card pass (old failure 3) - 50,250 / 50,600 / 98,300 #ffffff both - spot pixels
- Rail divider y 297 pass (old failure 7) - 200,297 #ffffff both - spot pixels
- Group 5 column lines pass - 710,600 and 1394,600 #e6ebf0 both; 58 px in the layer box (0.01%) - spot pixels, pixel-check report
- Column line under the today line pass (old failure 6) - 596,960 and 596,984 #f7f9fc both - spot pixels
- Group 5/Line 3 today line pass - 596,940 #d4d7ff both - spot pixels
- Group 2 Current month chip [595,237,109,22] pass - 58 px, text anti-aliasing only - pixel-check report
- Rectangle [675,303,113,38] placeholder box pass (old failure 4) - app box (675,303) 113x38; 674,320 #eef0ff, 675,320 #c3c7ff, 787,320 #c3c7ff, 788,320 #eef0ff both; 676,320 #e0e3ff vs #dfe2ff (1 step) - Playwright, spot pixels
- Helpers/Button-Hover/Label tooltip [665,272,130,26] pass (old failure 4) - app (665,272) 130x26; 665,280 and 794,280 #687196 both; outer shadow pixel #f5fcf2 vs #f2faf2 (AA); 54 px in box - Playwright, spot pixels
- Body fill bottom y 1022-1023 pass (old failure 8) - 1000,1021 #f7f9fc both; 1000,1022 / 1000,1023 / 300,1023 #ffffff both - spot pixels

## Behaviour (Playwright, normal mode unless noted)

- B1 pass - "Work center panel on the left stays fixed while the timeline scrolls horizontally": scrollLeft 840, rail stays at x 102, 380 wide - acceptance-criteria.md, Playwright
- B5 pass - "Header row re-labels per zoom level": Hour "20:00, 21:00..." 48; Day "27, 28..." 48; Week "Sep 28, Oct 5..." 114; Month "May 2026, Jun 2026..." 114. Rail header 204/34 in all four - Playwright
- B6 pass - "highlighted current month pill in the header plus a vertical line on the grid": chip 109x22 at y 237 in all four zoom levels, line 3x709 from y 238 - Playwright
- B6 chip label pass (old failure 9) - Month "Current month", Week "Current week", Day "Today", Hour "Today" - Playwright
- B7 pass - "Current day indicator: Vertical line showing today's date": Month x 959.19 inside Nov 2026 cell (927-1041); Week x 959.28 inside cell 945-1059; Day x 747 = cell 749 minus 2px offset, `.grid-cell--under-today` count 1; Hour x 958.59 inside cell 923-971 - FE-technical-test-10-2026.md line 100, Playwright
- B9 row hover pass - "Hover on row | Highlight row background": timeline hover gives rail #fafbfd and row #eef0ff; rail hover gives row #eef0ff and no placeholder; leave clears both and removes the box - FE-technical-test-10-2026.md line 175, Playwright
- B9 placeholder over a bar pass - pointer at (500,268) on a bar: no `.grid-cell-hover` - Playwright
- B9 placeholder lead step pass - hover@727,322: box (675,303) 113x38, tooltip (665,272) 130x26 "Click to add dates" - Playwright
- B9 first-row tooltip pass (old failure 5) - parity hover (1100,268): tooltip (1038,218), pixels at 1041,221 / 1103,222 / 1165,231 / 1058,241 all #687196, so it draws over the sticky header. Normal Month hover (700,268): same result at (638,218). Zoom crop shows full tooltip over the header labels - Playwright screenshot `first-zoom.png` in verifier scratchpad
- B10 pass - "Row height 48 ... left panel width 380": rail rows 238/60, 298/49, 347/49, 396/49, 445/49 (48 + 1px divider); timeline rows 238/60 then 48 high with 1px gap; rail 380 wide; same in all four zoom levels - Playwright, measurements.json
- B11 pass - "Grid lines 1px #e6ebf0, column dividers per timescale": `.grid-cell` 1px rgb(230,235,240), 747 high from y 238, width 48/48/114/114 for Hour/Day/Week/Month - Playwright

## Regressions

- npm run build pass - "Application bundle generation complete", no warnings in tail
- npx vitest run pass - 3 files, 9 tests passed
- npx playwright test pass - 26 passed

## Code

- Tokens pass - no colour or px literal in `timeline-grid.scss` or `app.scss` outside comments - grep
- Dead tokens pass (old failure 10) - `row-alternate`, `header-label-padding`, `current-month-marker`: 0 hits in `src`; every `$layout-grid-*` var in `_tokens.scss` is used in `src/app` - grep
- Tooltip offset pass (old failure 11) - `left: tooltip-offset-x - border-width`, comment says why - timeline-grid.scss:229-230
- Top-down order pass - SCSS: grid, rail, timeline, header, body, backdrop, columns, today, rows, hover, chip. TS: `CHIP_LABELS` at file bottom
- Blank line fail (minor) - `.grid-row` has an empty line before its closing brace - timeline-grid.scss:202
- Token note format fail (minor) - `"layout.page.title"` note lost its 4-space indent (now 2 spaces), diff noise in tokens.json - jj diff
- Scope pass - only grid files, app.scss, tokens, measurements.json, e2e specs, notes

## Failures

1. Stray empty line before `}` in `.grid-row` (timeline-grid.scss:202). Minor.
2. `tokens.json` note `"layout.page.title"` re-indented to 2 spaces. Minor.

# Unit u2-fix: fixes for the u2-grid verify report

Builder notes, 2026-11-10. Input: `docs/requirements/notes/u2-grid-verify.md`, section
"Failures", items 1 to 11, with the decisions of the lead.

## What changed

| Item | Fix | Files |
|---|---|---|
| 1, 2 | The header gets an empty trailing column (`.grid__header::after`, width `--column-width`). The timeline is now one column wider than its columns. The header fill, the white first row and the row hover run past x 1395 to the page edge. The header lines and the column lines still end at x 1395. | `timeline-grid.scss` |
| 3 | `.page` is white (`$color-surface-panel`). The page left of the card is white. | `src/app/app.scss` |
| 4 | The box left edge is the pointer x minus 52 (token `cellHover.pointerX`). `hover@727,322` gives box x 675 and tooltip x 665. | `tokens.json`, `timeline-grid.scss` |
| 5 | The box has no `transform` now. The transform made a stacking context, so the sticky header (z-index 1) covered the tooltip of the first row. The box is centred with `top: calc(50% - 19px)`. | `timeline-grid.scss` |
| 6 | The column whose right line is under the today line gets `.grid-cell--under-today` (transparent line). This applies only when the today line sits on a column line (`fraction === 0`). | `timeline-grid.{ts,html,scss}` |
| 7 | Design wins: the first rail row has a transparent divider. The white `Rectangle [102,238,380,60]` covers `Line 3` at y 297. | `timeline-grid.scss` |
| 8 | Design wins: the body fill stops 2px above the page bottom (`Rectangle [483,309,957,713]` ends at y 1022). The timeline has a 2px white bottom border (token `bodyFillBottomGap`). | `tokens.json`, `timeline-grid.scss` |
| 9 | Chip text per zoom level: Month "Current month", Week "Current week", Day and Hour "Today". | `timeline-grid.{ts,html}` |
| 10 | Deleted tokens: `colors.surface.rowAlternate`, `rowHover`, `rowHoverAlpha`, `layout.grid.header.labelPaddingX`, `layout.grid.currentMonthMarker`, and the stale `notInDesign.rowHover`. `npm run tokens` removed the SCSS vars. | `tokens.json`, `_tokens.scss` |
| 11 | Tooltip left = `cellHover.tooltipOffsetX` (-10, tooltip x 665 minus box x 675) minus the box border width. The comment says why: CSS counts from inside the box border. | `tokens.json`, `timeline-grid.scss` |

Token note: `agentChoices` key `layout.grid (u2-fix)`.

## Tests

`tests/e2e/grid.spec.ts`:

- `[B1]`: header and first row reach x 1440, `.page` white, timeline bottom border 2px white.
- `[B6]`: chip text in Week, Day, Hour and Month (normal mode).
- `[B9]`: hover at 727,322 gives box (675, 303) and tooltip (665, 272). First-row hover at
  1100,268: the tooltip pixel inside the header band is `#687196`. The verifier point 560,268 is on
  the Concentrix bar, so it shows no box.
- `[B10]`: first rail row divider transparent, second row divider `#e6ebf0`.
- `[B11]`: the column line under the today line is transparent.

Results: `npm run build` clean. `npx vitest run` 9 passed. `npx playwright test` 26 passed.

## Final pixel check

Mask `B` = `0,0,1440,204;437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38` (page
head and bars).

```
--steps="hover@727,322;wait@300" --mask="B;715,330,25,25"     mismatch 0.09%
     820   0.29%  Rectangle  [101,275,382,749]  fill #ffffff
     305   1.67%  Rectangle  [102,396,380,48]  fill #ffffff
     305  12.54%  McMarrow Distributio  [133,412,152,16]
     150   6.51%  Spartan Manufacturin  [133,461,144,16]
     147   7.12%  Genesis Hardware  [133,266,129,16]
     136   8.67%  Konsulting Inc  [133,363,98,16]
--steps="hover@727,322;wait@300", no mask                     mismatch 0.37%
no steps --mask="B"                                           mismatch 0.19%
    1590   0.27%  Group 5  [596,275,799,747]
    1210  35.8%   Helpers/Button-Hover/Label  [665,272,130,26]
     624  30.41%  Helpers/Button-Hover/Label/Click to add dates
     340   0.74%  Rectangle  [483,298,957,48]  fill #eef0ff
     307   7.15%  Rectangle  [675,303,113,38]
no steps --mask="B;483,298,957,48;660,268,140,34;715,330,25,25"   mismatch 0.09%
```

With hover, the box and the tooltip are not in the list. The rest is rail name glyphs
(anti-aliasing and glyph run width). Without hover, the extra layers are the hover states of the
artboard (row, box, tooltip). With those masked, the result is 0.09%.

Spot pixels, design = app (hover run): 1420,220 / 1420,250 / 1420,280 / 1395,237 `#ffffff`;
1420,320 `#eef0ff`; 50,250 / 50,600 / 98,300 `#ffffff`; 200,297 `#ffffff`; 596,960 / 596,984
`#f7f9fc`; 1000,1022 / 1000,1023 / 300,1023 `#ffffff`; 1000,1021 `#f7f9fc`; 675,320 `#c3c7ff`;
665,280 `#687196`.

## What still differs, and why

- Rail names: glyph run width only (Sketch Core Text against Chromium). Not in this unit.
- No-mask 0.37%: bars and the design cursor.
- Scroll overflow from another unit: the hidden `.work-order-menu` of the Compleks bar ends at
  x 1573 in parity view. It makes the scroll width larger than the timeline. At the right scroll
  end, about 64px of the page (white) shows right of the timeline. Fix belongs to the bar unit
  (hide the menu with `display: none`, or clip it).
- The trailing column is one `--column-width` wide (114 Month/Week, 48 Day). The design only
  shows 45px past the last column. One column is the smallest value that lets Day mode also scroll
  the last column clear of the page edge.

## Files of this unit

`src/app/timeline-grid/timeline-grid.{html,scss,ts}`, `src/app/app.scss`,
`docs/design/tokens.json`, `src/styles/_tokens.scss` (generated), `tests/e2e/grid.spec.ts`,
`docs/requirements/notes/u2-fix.md`.

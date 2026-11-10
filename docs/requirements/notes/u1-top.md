# Unit u1-top: parity mode and the page top (G2, G3, B3)

Builder notes, 2026-11-10. Scope: parity mode, and everything above y 204 on the artboards
"Work Order Schedule - Default" and "Work Order Schedule - View Selection".

## What changed

### A. Parity mode (`?parity=1`)

- `src/app/parity.ts` (new): the flag, today 2024-09-01, the first column offset (-1, so August
  2024 is the first visible column), and the design fixture of four work orders.
- `src/app/data/schedule.service.ts`: uses the fixture orders in parity mode. The work centres
  stay the same five.
- `src/app/timeline-grid/timeline-grid.ts`: uses the parity today. In parity mode and Month view,
  the grid scrolls so that August 2024 starts at the right edge of the rail. Otherwise it centres
  on today, as before.
- The fixture dates convert the artboard pixels with the date mapping of the app. Measured bar
  boxes in the app (x, width) against the artboard:

  | Bar | App | Artboard |
  |---|---|---|
  | Concentrix Ltd | 438, 462 | 437, 463 |
  | Konsulting Inc | 556, 463 | 556, 463 |
  | Compleks Systems | 945, 460 | 945, 463 |
  | McMarrow Distribution | 676, 535 | 677, 533 |

  The bar y values are wrong by the row height (B10). That is not in this unit.

### B. Page top

- G3 logo: `public/naologic-logo.svg` is a vector. It was extracted from the Sketch layer
  "Group 3" of `docs/design/source/FE-Take-Home-Challenge.sketch` (11 paths, fill `#3e40db`,
  even-odd). It is drawn as an `<img>` at (101, 20), 80 x 10.
- Top bar: 50 high, white, no border (the artboard has none).
- Page head (`.page__head`): white from y 50 to y 204, as in the artboard. Before, the body colour
  `#f7f9fc` showed there.
- Title: the 34px line box starts at y 95. The Sketch symbol "Table/Header/3" sits at y 97 and
  holds the text layer at y -2.
- G2 chip: one white 146 x 25 rectangle, radius 5, shadow `1 2.5 3 #c8cfe9`. The label segment is
  `#f1f3f8` at 75%. The value segment has no fill. No border. The chevron is now the line icon of
  the design (inline SVG, 8.47 x 5 at 230.53, 165.91), `#687196`, `#5659ff` while the menu is open.
- B3 dropdown: options Hour, Day, Week, Month. The menu is 200 x 136 at (101, 185): 5px under
  the chip, at its left edge. Border 1px `#687196` at 10%, two shadows. Rows 28 high, text at x 12.
  The selected row is `#3e40db`.
- Hour timescale: `src/app/timeline/timeline.ts` has the Hour period (48 columns each side of the
  current hour, label `HH:00`, fraction = minutes / 60). `.grid__timeline--hour` uses the Day
  column width (48).

### Tokens (`docs/design/tokens.json`, then `npm run tokens`)

- `components.scaleChip`: removed `border` (#979797) and `segments.value.fill` (#e6ebf0). Both
  were Sketch placeholders. Added `fill`, `shadow`, `chevron`, `menuGap`, `text`.
- `layout.dropdownMenu`: added `shadow2Y`, `shadow2Blur`, `shadow2Color`, `borderColor`,
  `borderAlpha` from the symbol "Dropdown/Simple". The existing values did not change, so the bar
  menu is not affected.
- `layout.page.title`: x 101, y 95 (new).
- Each fix has a note under `agentChoices`.

### Tests

- `tests/e2e/timeline.spec.ts`: `[B3]` now expects Hour, Day, Week, Month, the menu box and the
  48px Hour column. `[G2]` also checks the fill, no border, the shadow, the label tint and the
  chevron box. `[G3]` is new: the logo box, the 50px top bar without a border, the title at y 95.
  One parity test without an id: August 2024 at x 482, September 2024 current, four bars.
- `tests/unit/timeline.spec.ts`: one `[B3]` unit test for the Hour maths.
- Results: `npx playwright test` 24 passed. `npx vitest run` 9 passed. `npm run build` clean.

## Final pixel check

Above y 204 only (`--mask="0,204,1440,820"`), "Schedule - Default": mismatch 0.02%.

```
 197   4.08%  Table/Header/3  [101,97,142,34]
  53   1.45%  Rectangle 2  [101,155,146,25]  fill #ffffff | shadow 1,2.5 3 #c8cfe9
  44   2.35%  Rectangle 2  [101,155,75,25]  fill #f1f3f8bf
  44   4.66%  Timescale  [109,159,59,16]  "Timescale" | CircularStd-Book 13px #687196
   9   0.51%  Rectangle 2  [176,155,71,25]
   8   1.25%  Month  [184,159,40,16]  "Month" | CircularStd-Medium 13px #3e40db
   1    2.5%  Nao_Icons/Line/Arrow/Simple/Down  [231,166,8,5]  fill #687196
```

The logo, the top bar and the page head have no wrong pixels.

"View Selection" with the menu open (`--steps="click@210,167;wait@300"`, grid masked except the
menu box): mismatch 0.02%. `Dropdown/Simple Copy` 72 px, 0.26%.

Whole artboard "Schedule - Default", no mask: 1.17%. Nearly all of it is below y 204 (rows, bars,
hover states), outside this unit.

## What still differs, and why

- Title, 4.08%: the glyph run is 138 wide in the app and 141 in the export. The glyph box top
  (y 103) and left (x 101) match. The Sketch text has no kerning. The difference is the text
  rendering of Sketch (Core Text) against Chromium.
- "Timescale" label, 4.66%: same glyph box (109, 162, 58 x 10). Only anti-aliasing differs.
- The "Month" value text is pinned at y 4 in the chip, 16 high, as the design text box. Centred,
  the Medium weight lands 1px low. The Book label is centred: pinned, it lands 1px high.

## Files of this unit

`src/app/parity.ts`, `src/app/app.html`, `src/app/app.scss`, `src/app/data/schedule.service.ts`,
`src/app/timeline/timeline.ts`, `src/app/timeline-grid/timeline-grid.{ts,html,scss}`,
`src/app/timescale-chip/timescale-chip.{ts,html,scss}`, `public/naologic-logo.svg`,
`docs/design/tokens.json`, `src/styles/_tokens.scss` (generated), `tests/e2e/timeline.spec.ts`,
`tests/unit/timeline.spec.ts`.

# Unit u3-bars: builder notes

Builder, 2026-11-10. Items C1 to C8. Lead: t38.

## Pointer positions

The hotspot of the `Cursor/Hand/Pointing` symbol is the fingertip at (+12, +8) from the symbol
origin. This value is measured on the exported PNGs.

| Artboard | Cursor layer | Hotspot | Steps | Mask |
|---|---|---|---|---|
| Schedule - Default | 710,325 | 722,333 | `hover@722,333;wait@300` | `710,325,32,32` |
| Options CTA Controls | 710,325 | 722,333 | `hover@722,333;wait@300` | `710,325,32,32` |
| Edit and Delete Controls Expanded | 850+9, 338-18 = 859,320 | 871,328 | `hover@871,328;click@871,328;wait@300` | `859,320,32,32` |
| Timeline - Hover Options | 1008,440 | 1020,448 | see below | - |

The hover artboards need `--url='http://localhost:4200/?parity=1&fixture=hover'`.

## What changed

- `src/app/parity.ts`
  - The bar boxes of the design are the `Rectangle 2` layers, not the `Group 7` frames. Three bars
    are 381 wide, not 463. New end dates: Concentrix Ltd 2024-10-30, Konsulting Inc 2024-11-30,
    Compleks Systems 2025-03-13. The overlap of Konsulting Inc and Compleks Systems is gone.
  - `?parity=1&fixture=hover` adds the two bars that only the hover artboards show: Rodriques
    Electrics (in-progress, 2024-08-06 to 2024-11-16) and Spartan Distribution (open, 2024-08-28
    to 2025-01-18). The lead approved this. The default fixture does not change.
- `docs/design/tokens.json` (then `npm run tokens`)
  - Open status uses the design cyan: bar `#f2feff`, border `#cefbff`, badge `#e4fdff`, text
    `#00b0bf`. The lead decided this. In-progress keeps the blue.
  - `layout.bar.actionsButton`: height 22 (was 24), radius 4 (new), dot colour `#687196` (was
    `#2f3059`), dot size 3 (was 1.5), dot group 13.5 (was 12). New `layout.bar.menuGap` 5.
  - `layout.dropdownMenu.rowHoverFill`: `#f1f3f8` (was `#a4aac0`, which no export shows).
  - `layout.tooltip.gapToBar` 5 and `layout.tooltip.showDelay` 800ms (new).
  - The reasons are in `agentChoices`.
- `work-order-bar.scss`
  - Open and in-progress have separate rules. The badge default is the in-progress token.
  - The name inset, the badge offset and the button gap subtract the bar border, because the design
    measures them from the outer edge of the bar.
  - Three-dot button: 24 x 22, radius 4, fill `#f1f3f8`, three 3px dots `#687196`.
  - Menu: left edge on the button left edge, 5px below the button. Two shadows with spread
    (`0 4.5 5 -1 #d8dceb`, `0 2.5 3 -1.5 #c8cfe9`). The 10% border is an inset shadow, so the rows
    are 200 wide and the text sits 12 from the outer edge, as in the design. Rows are transparent,
    hover is `#f1f3f8`.
  - Z-order: a hovered bar or a bar with an open menu gets z-index 2. The menu and tooltip then draw
    over the rows below and over the sticky header. The current month chip has the same level and
    comes later in the DOM, so it stays over the bar, as in the design. The today line stays under
    the bars.
  - Tooltip: centred above the bar, 5px gap, shadow of the grid tooltip, `width: max-content`. On
    the bar body it shows after 800ms. On a drag handle it shows at once.
  - Handles: an 8px box (the corner radius) at each end that covers the border and the full height.
    It is clipped by the 8px radius, and a gradient fills the outer 4px with `#dee0ff`. Both handles
    show only when the pointer is on one of them.
- `work-order-bar.html` / `.ts`: the `edgeHovered` signal, set by mouseenter and mouseleave on the
  handles.
- `tests/e2e/bars.spec.ts`: C1 to C8 updated. C1 also checks the six parity bars against the
  artboard pixels (max 2px). C3 checks the cyan Open colours. C5 checks button geometry and menu
  position. C6 checks the shadows and item hover. C7 checks the dwell, the centring, the gap and the
  immediate tooltip on a handle. C8 checks that the handles do not show on the body, show on an end,
  and have the 4px fill.

## Why handles and tooltip work this way

- "Options CTA Controls" hovers the bar body (722,333). It shows the button, no handles and no
  tooltip.
- "Timeline - Hover Options" puts the pointer at the bar end. It shows both handles and the date
  tooltip.
- So handles and the immediate tooltip are tied to the handle zone. The tooltip on the body needs a
  dwell, because the brief asks for it (C7, bonus) and the design does not show it.

## Final pixel-check lines

Default (`hover@722,333;wait@300`, mask `710,325,32,32`): **0.27%**

    792  5.47%  Group 7/Rectangle 2 [437,249,381,38]   bar edge at 438.9, see below
    635  3.14%  Group 6/Rectangle 2 [677,401,533,38]   end at 1211.8
    548  3.79%  Group 7/Rectangle 2 [945,352,381,38]   start at 946.3
    255  1.76%  Group 7/Rectangle 2 [556,352,381,38]
    411 16.79%  Compleks Systems / 405 15.1% McMarrow Distribution / 186 9.31% Concentrix Ltd   glyph AA
    230 15.6%   Blocked badge / 183 10.53% Complete badge   glyph AA, text 1-2px narrower

Options CTA Controls (`fixture=hover`, `hover@722,333;wait@300`): **0.31%**

    694  3.43%  Spartan Distribution bar [583,455,533,38]   mock bar is 5px low, see below
    412  2.85%  Rodriques Electrics bar [501,303,381,38]
    The three-dot button (Group 7/Group 2 [850,311,24,22]) is not in the list: 0 bad px.

Edit and Delete Controls Expanded (`hover@871,328;click@871,328;wait@300`): **0.26%**

    No layer of Dropdown/Simple Copy is in the list: menu, rows, text and shadow are clean.

Timeline - Hover Options: no full pixel check. This artboard is an older mock with a different page
(filters row, header at y 275, rows 49 high, extra text such as "9% complete"). Its bars sit about
71px lower than in the app. I compared the bar-local values only:
`hover@931,371` (on the end handle of Konsulting Inc). Handle 4px `#dee0ff` at both ends, full
height, corners rounded. Tooltip 26 high, `#687196`, bottom 5px over the bar top. All match.

## What still differs and why

- Bar edges are 0.2 to 1.9px off the mock. A day is 3.7px wide in Month view, so a date cannot hit
  every artboard pixel (DESIGN-PARITY.md allows this). Worst: Concentrix Ltd start 438.9 against 437,
  Konsulting Inc end 935.1 against 937, McMarrow Distribution end 1211.8 against 1210.
- Spartan Distribution: the mock draws it at y 455, 5px under the centre of its row. The app centres
  every bar (y 450).
- Text in names and badges: glyph anti-aliasing (Core Text against Chromium). Badge text renders
  1 to 2px narrower, so badges are 77.7 / 85 / 65.8 wide against 79 / 87 / 67. The right edges match.
- Not built: the "Drag to resize" tooltip of "Timeline - Hover Options". The app has no resize
  behaviour yet, so the tooltip would promise something that does not work. Add it with resize.
- The tooltip shows name, status and dates (brief, C7). The mock shows dates only.
- Not mine, seen during the run: with the cursor-derived hotspot (722,333) on Default, the grid
  "Click to add dates" placeholder lands 5px off the mock (474 bad px). The grid unit was verified
  with `hover@727,322`.
- `docs/requirements/DESIGN-PARITY.md`: its fixture table still lists width 463 for three bars and
  does not mention `fixture=hover`. I did not change it because it is outside my unit.

## Regressions

- `npm run build`: clean, 0 warnings.
- `npx vitest run`: 9 passed.
- `npx playwright test`: 26 passed.

Note: the default `node` on this machine is 16.20.0. Playwright needs Node 20+. I ran everything with
`~/.nvm/versions/node/v22.14.0/bin` first in PATH.

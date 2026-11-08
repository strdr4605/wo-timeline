# Design parity: how the app is compared with the Sketch artboard

The design truth is the Sketch file. On 2026-11-08 the Sketch Cloud export was pulled with surf
(the export link of the file page, `Export Assets`), so the repo now holds the artboards as 1x
PNGs of exactly 1440 x 1024:

    docs/design/assets/Work Order Schedule - Default.png
    docs/design/assets/Work Order Schedule - View Selection.png
    docs/design/assets/Work Order Schedule - Options CTA Controls (shown on hover).png
    docs/design/assets/Work Order Schedule - Edit and Delete Controls Expanded.png
    docs/design/assets/Work Order Schedule - Create New Event - With Selection.png
    docs/design/assets/Work Order Schedule - Create New Event - Placeholder and Defaults.png
    docs/design/assets/Work Order Schedule - Create New Event - Active Text Field.png
    docs/design/assets/Work Order Schedule - Create New Event - Status Dropdown.png
    docs/design/assets/Timeline - Hover Options.png
    docs/design/assets/Group 3.png          the logo, exported at 10x (800 x 100)

`scripts/design-diff.mjs` compares a screenshot of the app with one of these PNGs. It prints the
percentage of different pixels per region and writes a diff image. It runs inside Chromium, so no
image library is needed.

## Parity mode

The artboards show August 2024 to March 2025 and mark September 2024 as the current month. To
compare 1:1, the app needs the same view. Parity mode is a test hook, not a product feature:

    http://localhost:4200/?parity=1

In parity mode the app:

1. takes **2024-09-01** as today, so the current month column is September 2024 and the current
   month chip and the today line sit at the start of that column, as in the artboard;
2. starts the timeline at the left edge, so the first column is August 2024;
3. uses the **design fixture data set** of the artboard instead of the sample data of
   `docs/requirements/SAMPLE-DATA.md`;
4. keeps the timescale Month.

The design fixture:

| Work centre | Work order | Status | Bar in the artboard |
|---|---|---|---|
| Genesis Hardware | Concentrix Ltd | complete | x 437, width 463, y 249 |
| Konsulting Inc | Konsulting Inc | in-progress | x 556, width 463, y 352 |
| Konsulting Inc | Compleks Systems | in-progress | x 945, width 463, y 352 |
| McMarrow Distribution | McMarrow Distribution | blocked | x 677, width 533, y 401 |

The x values are artboard pixels. The timeline starts at x 483 and a month column is 114 wide.
Convert them with the date mapping of the app, so that the bar lands on the same pixel. The artboard
is a mock: its own hover tooltip ("Sep 20, 2024 to Feb 11, 2025") does not match its own pixel
geometry, so a bar may sit a few pixels off the mock. The chrome must not.

## Masked areas

The artboards show interaction states that a static screenshot cannot show. Mask them in the diff:

    --masks=437,249,463,38;556,352,463,38;945,352,463,38;677,401,533,38;660,268,140,34;700,310,60,60;670,300,125,45;483,298,957,48

- the four bars,
- the "Click to add dates" tooltip,
- the cursor,
- the hovered empty cell,
- the hovered timeline row.

## Measured deviations, 2026-11-08

These come from sampling the exported artboard and the app screenshot pixel by pixel.

| What | Design | App before the fix |
|---|---|---|
| Logo | the NAOLOGIC wordmark, 80 x 10 at (101, 20) | a blue placeholder rectangle |
| Page title | text box at x 102, y 104, 139 wide | x 103, y 110, 137 wide: 6px too low |
| Timescale chip, value segment | fill `#ffffff` | fill `#e6ebf0` |
| Timescale chip, border | no dark border, the top edge is `#f5f6fa` | 1px `#979797` |
| First row height | 60 (`layout.grid.firstRowHeight`) | 48, so every row below sits 12px too high |
| Hovered timeline row | `#eef0ff` (`brand.surfaceStrong`) | `#f1f3f8` at 75% alpha |
| Rail row 4 | `#ffffff` | `#fafbfd` (alternating) |
| Timescale dropdown | Hour, Day, Week, Month | Day, Week, Month |

Values that only the exported PNG holds are added to `docs/design/tokens.json` with a note that
says they were measured from the export, so the token file stays the single source of truth.

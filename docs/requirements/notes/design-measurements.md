# Measured facts from the exported artboard

Source: `docs/design/assets/Work Order Schedule - Default.png`, 1440 x 1024, exported from the Sketch
Cloud file on 2026-11-08. Every number below was sampled pixel by pixel, or read from the Sketch
layer tree in `docs/design/source/FE-Take-Home-Challenge.sketch`.

A builder must not repeat this work. Use these numbers.

## Page

| What | Value |
|---|---|
| Logo | the NAOLOGIC wordmark, 80 x 10 at (101, 20). The export is `docs/design/assets/sketch-layers/Group 3.png` (800 x 100, 10 times the size). The layers of the wordmark are `Group 3-1.png` to `Group 3-8.png` in the same folder. |
| Page title | text box x 102, y 104, 139 wide, 17 high (cap height plus descender). Font size 24, weight Medium. |
| Timescale chip | 146 wide at x 101, 25 high at y 155. Label segment 75 wide with fill `#f5f6fa`, value segment 71 wide at x 176 with fill `#ffffff`. The chip has no dark border: the top edge of the chip is `#f5f6fa`. |
| Page background | `#f7f9fc` |
| Top bar | `#ffffff`, height 48 (the logo sits at y 20) |

## Grid

| What | Value |
|---|---|
| Grid area | starts at x 483, the rail ends at x 482 with a 1px line `#e6ebf0` |
| Header band | white, from y 204 to y 237. A 1px line `#e6ebf0` at y 204 runs from x 101 to the right edge. A 1px line `#e6ebf0` at y 237 runs from x 101 to x 596. |
| Month labels | one per column, centred over its column, 13 high at y 216. The first label is "Aug 2024" over the column 483 to 597. |
| Current month chip | x 597 to 705, y 238 to 264, fill `#d4d7ff`, dark blue text "Current month". It sits on the column line of the current month, which is September 2024 in the artboard. |
| Column separators | 1px light lines at every column start, from y 238 down. |
| Row separator | 1px `#e6ebf0` at y 346, from x 101 to x 482 only. The timeline has no row separator. |
| Row 1 | y 238 to 298, 60 high. White. |
| Row 2 | y 298 to 346, 48 high. White. |
| Rows 3 to 5 | 48 high each. Background `#f7f9fc`, the same as the page. |
| Hovered row | the row under the pointer is `#eef0ff` (`brand.surfaceStrong`) in the timeline. In the rail the same row is `#fafbfd`. |
| Hovered empty cell | 113 x 38 at (675, 303), rounded 8, fill `#eef0ff`. |

## Rail

| What | Value |
|---|---|
| Rail | x 101 to 482. Row 1 white, row 2 `#fafbfd`, rows 3 to 5 white. The rail label of a row is at x 133. |
| Rail label | "Work Center" in the header at (133, 216), the row names below it, 14 Book, `#3e40db` for the name and a second line for the location. |

## Bars of the artboard

| Bar | Box | Status |
|---|---|---|
| Concentrix Ltd | x 437, y 249, 463 x 38 | complete |
| Konsulting Inc | x 556, y 352, 463 x 38 | in progress |
| Compleks Systems | x 945, y 352, 463 x 38 | in progress |
| McMarrow Distribution | x 677, y 401, 533 x 38 | blocked |

The artboard is a mock: its own hover tooltip ("Sep 20, 2024 to Feb 11, 2025" in
`Timeline - Hover Options.png`) does not match its own pixel geometry. So a bar may sit a few
pixels off the mock, the chrome may not.

## Other artboards

| Artboard | What it shows |
|---|---|
| `Work Order Schedule - View Selection.png` | the timescale dropdown open. The options are Hour, Day, Week, Month, in that order. |
| `Work Order Schedule - Options CTA Controls (shown on hover).png` | the three-dot button on a bar, with the Edit and Delete menu. |
| `Work Order Schedule - Edit and Delete Controls Expanded.png` | the menu open, with the row under the cursor in `#a4aac0`. |
| `Work Order Schedule - Create New Event - *.png` | the drawer: title "Work Order Details" at (873, 16), the fields at y 107 (name), 193 (status), 279 (start), 365 (end). |
| `Timeline - Hover Options.png` | the tooltip on a bar, and the drag handles at both ends of a bar. |

## Sketch layers in the repo

`docs/design/assets/sketch-layers/` holds the layers that were extracted from the `.sketch` file:
the wordmark (`Group 3.png` and its eight layers), the cursor
(`Cursor/Hand/Pointing.svg`), the triangles of the resize handles (`Triangle*.svg`) and the cancel
icon (`Icon/cancel-2/*.svg`).

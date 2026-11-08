# Builder wave 2 notes

Work order bars and the data set. Items: **C1 to C8, F1 to F4**.

## Items done

| Item | What was built | Evidence |
|---|---|---|
| C1 | The bar starts at the interpolated position of the start date and ends at the interpolated position of the end date. The rule is the one of the current day marker: `left: calc((var(--start-index) + var(--start-fraction)) * var(--column-width))`. A date outside the rendered columns keeps its index, so a bar can start before the first column. | unit `[C1] a date is placed at the interpolated position of its column`; e2e `[C1] the bar starts at the start date and ends at the end date` (compares the bar with the header cells of the design). |
| C2 | The bar shows the name (14 Book) and a status badge (22 high, radius 5, padding 8, text 14 Book in the status colour). | e2e `[C2] the bar shows the work order name and a status badge`; measure `.work-order-bar__badge` height 22, radius 5px, fills and texts per status. |
| C3 | Fill and border per status: open and in-progress `#edeeff` / `#dee0ff`, complete `#f8fff3` / `#d1fab3`, blocked `#fffcf1` / `#fff5cf`. Badge fills `#d6d8ff` / `#e1ffcc` / `#fceeb5`. | e2e `[C3] every status has the colours of the design`; measure `.work-order-bar[data-status=...]` background-color and border-color. |
| C4 | Bar height 38, radius 8, 1px border. | e2e `[C4] the bar is 38 high, has a radius of 8 and a 1px border`; measure `.work-order-bar[data-status='open']` box height 38, radius 8px, fill, border. |
| C5 | The three-dot button (24x24, `#f1f3f8`, three 1.5px dots `#2f3059`) appears on hover of the bar and opens the menu with **Edit** and **Delete**. Edit and Delete do nothing yet, the drawer is the next wave. A click outside closes the menu. | e2e `[C5] the three-dot button appears on hover and opens a menu with Edit and Delete`; measure `.work-order-bar__actions` fill and box. |
| C6 | The menu of the design: 200 wide, radius 5, rows 28 high, padding 12, rows in `#f1f3f8`, shadow y 4.5 blur 5 `#d8dceb`. Not a system menu. | e2e `[C6] the menu is the menu of the design, not a system menu`; measure `.work-order-menu` width, radius, fill and `.work-order-menu__item` height. |
| C7 | The tooltip on hover shows name, status and the full date range. Height 26, radius 8, padding 8, background `#687196`, text `#f9faff`. | e2e `[C7] the bar shows a tooltip with name, status and the full date range`; measure `.work-order-tooltip` height, radius, fill, colour. |
| C8 | The drag handles at both ends of the bar, 4px wide, full height, `#dee0ff`. They show on hover and do not resize yet. | e2e `[C8] the bar shows a drag handle at both ends on hover`; measure `.work-order-bar__handle--start/--end` width and fill. |
| F1 | 5 work centres with the names of the design: Genesis Hardware, Rodriques Electrics, Konsulting Inc, McMarrow Distribution, Spartan Manufacturing. | unit `[F1] at least 5 work centers with realistic manufacturing names`. |
| F2 | 8 work orders, all 4 statuses (open 3, in-progress 2, complete 2, blocked 1). Three work centres hold two orders each, and no two orders of a centre overlap. | unit `[F2] at least 8 work orders, all 4 statuses, one centre with several orders`. |
| F3 | Every document follows `{ docId, docType, data }`. Work centres in `docType: 'workCenter'`, work orders in `docType: 'workOrder'`. | unit `[F3] the documents follow the docId / docType / data structure`. |
| F4 | `overlaps(candidate, existingOrders)` is a pure function without Angular, in `src/app/data/overlap.ts`. The service owns it and re-exports it. | unit `[F4] the overlap detection is a pure function of the service`. |

## Files

- `src/app/data/sample-data.ts`: the sample data set, the document types and the `WorkOrder` model.
- `src/app/data/overlap.ts`: the pure overlap function.
- `src/app/data/schedule.service.ts`: holds the work centres and the work orders, re-exports `overlaps`.
- `src/app/work-order-bar/`: the bar, the badge, the three-dot button, the menu, the tooltip, the drag handles.
- `src/app/timeline/timeline.ts`: `positionInColumns` (the position of a date in the timeline) and `parseIsoDate`.
- `src/app/timeline-grid/`: the rows now carry the bars of their work centre.
- `tests/unit/data.spec.ts` (F1 to F4), `tests/unit/timeline.spec.ts` (C1), `tests/e2e/bars.spec.ts` (C1 to C8).

## Decisions that came from the Sketch file

The artboards were read again from `docs/design/source/FE-Take-Home-Challenge.sketch`, because a few
values of the token file are not what the design draws:

| Case | Finding | Decision |
|---|---|---|
| Bar shadow | `components.bar.shadow` exists, but the shadow of the bar in the artboard has `isEnabled: false`. | No shadow on the bar. |
| Badge border | `components.badge.border` exists, but the border of the badge in the artboard has `isEnabled: false`. | No border on the badge. |
| Badge place | The badge is hand placed in the artboards. Its right edge is 36px from the bar end in every bar (4 bars, 3 sizes of badge). That space holds the three-dot button: 4px gap, 24px button, 8px to the bar end. | New token `layout.badge.offsetFromBarEnd: 36`. The badge keeps that space free, so it never moves when the button appears. The token `layout.badge.gapToBarEnd` (8) is the gap of the three-dot button to the bar end; it is recorded in the `agentChoices` note of the token file. |
| Badge size | The badge rect is the text plus 8px padding on each side (`Complete` 63 + 16 = 79). | The badge is as wide as its text plus the padding. |
| Three-dot button | The symbol `Buttons/Alt/Icon Subtle/Hover` is 24x24, fill `#f1f3f8`, three 1.5px dots `#2f3059` over 12px. | New tokens under `layout.bar.actionsButton`. The dots use `space-between` over 12px, which gives the 5.25px pitch of the artboard. |
| Drag handles | `Timeline - Hover Options`: 4px wide, full height, `#dee0ff`, at both ends. | New tokens `layout.bar.handleWidth` and `layout.bar.handleFill`. The handle covers the border of the bar, as in the design. |
| Menu rows | The rows of `Dropdown/Simple` are filled `#f1f3f8`, and the row under the cursor in `Work Order Schedule - Edit and Delete Controls Expanded` is `#a4aac0`. | New token `layout.dropdownMenu.rowHoverFill: "#a4aac0"`. The menu keeps the padding of 12 above and below the rows. |

The hover of a bar is a class (`work-order-bar--hovered`), not a CSS `:hover`, so it does not fight
with the row hover of wave 1. The menu and the tooltip stay in the DOM and are switched with
`opacity`, so the measurement script can read them.

## Tokens added to `docs/design/tokens.json`

`layout.bar.handleWidth`, `layout.bar.handleFill`, `layout.bar.actionsButton` (width, height,
gapToBarEnd, fill, dotColor, dotSize, dotGroupWidth), `layout.badge.offsetFromBarEnd`,
`layout.dropdownMenu.paddingY`, `layout.dropdownMenu.rowHoverFill`, `layout.tooltip.gap`.
No existing value was changed.

## Commands run

```bash
npm run tokens                # after the token file change
npm run build                 # clean
npx playwright test           # 22 passed
npx vitest run                # 8 passed
node docs/requirements/measure.mjs    # 49 pass, 2 fail (G4, the drawer of wave 3)
node docs/requirements/verify.mjs     # C1 to C8 and F1 to F4 pass
```

Node: the system `node` is v16, too old for Angular 20. Use `/opt/homebrew/opt/node@26/bin` in PATH.

## Commit

- Message: `wave2: work order bars, three-dot menu, tooltip, drag handles and the data set (C1 C2 C3 C4 C5 C6 C7 C8 F1 F2 F3 F4)`
- Change id (stable): `qrrtlonrtosy`
- Resolve the commit with `jj log -r 'qrrtlonrtosy'`.
- The commit also carries the files that were already in the working copy when this wave started
  (`docs/design/assets/`, `docs/requirements/SAMPLE-DATA.md`, `docs/requirements/prompts/builder-wave2.md`).

## What the next wave must know

- The bars live in `src/app/work-order-bar/`. The grid hands the component the order and the two
  positions; the component owns the hover, the menu and the tooltip.
- `ScheduleService` holds the data. It is the place to add, change and delete orders in wave 4.
- `overlaps(candidate, existingOrders)` is pure and compares ISO dates as UTC day numbers. Two
  orders that only touch already overlap.
- The positions come from `positionInColumns(columns, timescale, date)` in
  `src/app/timeline/timeline.ts`. The index of a date outside the rendered columns keeps its
  distance to the first column, so a bar may start before the first column and end after the last.
- The menu items **Edit** and **Delete** do nothing yet. They are the entry points of the drawer
  (wave 3) and of the delete (wave 4).
- The current month chip of the grid floats over the first row and can cover the name of a bar
  that starts in the current month. That is the behaviour of the design, the chip is not moved.

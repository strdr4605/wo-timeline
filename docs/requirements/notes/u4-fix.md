# Unit u4-fix: builder notes

Builder, 2026-11-10. Lead: t38. Fixes the failures of `u4-drawer-verify.md`, with the lead
decisions. Node 22.14.0 (the shell default is Node 16, which cannot run npm 11).

## Steps for each artboard

The field order is now name, status, End date, Start date. Tab goes in that order. The date
fields get typed values in DD.MM.YYYY, so that they render like the design ('01.01.2026').

```sh
OPEN="click@600,322;wait@400"
BLOCKED="click@1144,236;wait@200;click@910,371;wait@200"
DATES="click@1000,150;key@Tab;key@Tab;key@Meta+a;type@01.01.2026;key@Tab;key@Meta+a;type@02.01.2026;click@1100,700;wait@300"

# With Selection
--steps="$OPEN;click@1000,150;type@McMarrow Distribution;key@Tab;key@Tab;key@Meta+a;type@30.12.2025;key@Tab;key@Meta+a;type@23.12.2025;click@1100,700;wait@300"
# Placeholder and Defaults
--steps="$OPEN;$BLOCKED;$DATES"
# Active Text Field
--steps="$OPEN;$BLOCKED;$DATES;click@1000,150;type@McMarrow Distributio"
# Status Dropdown (the pointer is on the 'Blocked' row, the hovered row of the design)
--steps="$OPEN;$DATES;click@1144,236;wait@300;hover@910,371;wait@200"
```

## What changed

- **P11** `work-order-drawer.html`: End date is above Start date, as in the design. The DOM
  order gives the Tab order name, status, end, start. The D10 test checks this order.
- **P12** `drawer-form.ts`: the ngb parser and formatter use DD.MM.YYYY. The placeholder of an
  empty date field is 'dd.mm.yyyy'. The unit test D12 and the e2e date values use the new
  format (for example '16.09.2024').
- **P15** `_form-controls.scss`: while the list is open, the pill has no top margin
  (`statusPill.openOffsetY` 0). The pill is at y 225, as in 'Status Dropdown'. Closed, it stays
  at y 226 (`offsetY` 1).
- **P18** No change. The chevron stays `#687196`. 'With Selection' has `#b3b7ca`, the other
  three artboards have `#687196`. Noted in `agentChoices`.
- **P20** The option rows get `statusMenu.textOffsetY` 1 as top padding. The text layers are at
  row y + 5, 1px under the centre of the Chromium line box.
- **P21** Why `#030929`: in `Dropdown/Simple Copy`, the Blocked row has the fill `#d8dceb`, the
  other rows `#f1f3f8`, and the text `#030929`. That is the hovered row. The export shows no
  row fill at all. Rule for all rows: a hovered row, or a row that the keyboard moved to, has
  the text colour `statusMenu.hoverColor` `#030929` and no fill. The selected row keeps
  `#3e40db`. The `#f1f3f8` hover fill is removed. The D13 test checks the hover colour.
- **K1** New tokens: `layout.dropdownMenu.borderWidth` 1, `layout.panel.divider.width` 1,
  `components.datepicker.navPaddingX` 8, `typography.styles.datepickerMonth` (Medium 14). The
  datepicker no longer uses the tooltip and chip tokens. The menu ring, the weekday border and
  the panel head divider use the width tokens. The only `1px` left is in `.visually-hidden`: it
  is the standard screen-reader clip, not a design value.
- **K2** New partial `src/styles/_control-shadows.scss` holds `$control-shadow`, `$focus-ring`
  and `$menu-shadow`. `work-order-drawer.scss` and `_form-controls.scss` use it.
- **K5** No change. `cli.analytics: false` in `angular.json` is the lead's change.
- `docs/design/tokens.json`, then `npm run tokens`: the tokens above, and
  `agentChoices["layout.panel and components (u4-fix)"]` with the reasons.

## Checks

- `npm run build`: exit 0, no warnings.
- `npx vitest run`: 13 passed.
- `npx playwright test`: 41 passed. D13 now waits for the `ng-select-opened` class before it
  measures the pill: the panel can be visible one frame before the host class changes.

## Final pixel-check lines

| Artboard | Total before | Total now |
|---|---|---|
| With Selection | 0.32% | 0.30% |
| Placeholder and Defaults | 0.32% | 0.30% |
| Active Text Field | 0.34% | 0.32% |
| Status Dropdown | 0.33% | 0.29% |

Drawer layers, Status Dropdown:

    2565   0.42%  Rectangle [849,0,591,1024]          panel: the sum of the text below
    1138  16.16%  Specify the dates, n [873,46,352,20] glyph AA (unchanged)
     513   8.11%  Work Order Details [873,16,253,25]  glyph AA (unchanged)
     241   0.33%  Dropdown/Simple Copy/Rectangle      menu (was 614)
     226   0.67%  Controls/Text Field/Dropdown         name field
     225   0.67%  Group [873,365,543,62]              Start date value colour, see below

Box scans, Status Dropdown, design = app: row ink Open y 282-294 `#3e40db`, In progress
310-322 `#2f3059`, Complete 338-350 `#2f3059`, Blocked 366-375 `#030929`; pill text 231-243.

Date fields: With Selection `Group [873,279]` 214 px (0.64%), `Group [873,365]` 201 px (0.6%).
Placeholder and Defaults `Group [873,279]` 372 px (1.1%).

## What still differs and why

- **Colour of the date values in 3 artboards.** Placeholder, Active Text Field and Status
  Dropdown draw '01.01.2026' and '02.01.2026' in the placeholder grey `#a4aac0`. The app shows
  them as values, `#030929`. With an empty field, the app shows 'dd.mm.yyyy' (lead decision).
- **'With Selection' date text.** The design shows 12.30.2025 and 12.23.2025 (MM.DD). In
  DD.MM.YYYY the app shows 30.12.2025 and 23.12.2025: the glyphs differ, the box is the same.
- **End date field x in 3 artboards.** Placeholder, Active and Status Dropdown put the End date
  field at x 874, w 542 (symbol at x 1 in its group). With Selection puts it at x 873, w 543,
  as the Start date field. The app uses x 873 for both. This gives a 1px edge line in the diff.
  It was not in the failure list, so I did not change it. Lead: tell me if it must follow the
  3 artboards.
- **P18 chevron** in With Selection, see above.
- Glyph anti-aliasing of the title and subtitle, and the grid residue behind the overlay
  (u2/u3), are unchanged.

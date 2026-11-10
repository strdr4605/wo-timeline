# Unit u4-drawer: builder notes

Builder, 2026-11-10. Items D1 to D13 and D15. Lead: t38.

## Steps for each artboard

The pointer opens the drawer on the Rodriques Electrics row (600,322), as the row highlight of the
artboards shows. No artboard shows a cursor or a cell box: the overlay covers the grid.

The datepicker moves the focus into the calendar when it opens. Thus the steps go to the date
fields with Tab, not with a click.

```sh
OPEN="click@600,322;wait@400"
CLEAR="click@1000,150;key@Tab;key@Tab;key@Meta+a;key@Backspace;key@Tab;key@Meta+a;key@Backspace;click@1100,700;wait@300"
BLOCKED="click@1144,236;wait@200;click@910,371;wait@200"

# With Selection
--steps="$OPEN;click@1000,150;type@McMarrow Distribution;key@Tab;key@Tab;key@Meta+a;type@12.23.2025;key@Tab;key@Meta+a;type@12.30.2025;click@1100,700;wait@300"
# Placeholder and Defaults
--steps="$OPEN;$BLOCKED;$CLEAR"
# Active Text Field
--steps="$OPEN;$BLOCKED;$CLEAR;click@1000,150;type@McMarrow Distributio"
# Status Dropdown
--steps="$OPEN;$CLEAR;click@1144,236;wait@300"
```

No mask is necessary.

## What changed

- New `src/app/work-order-drawer/`
  - `work-order-drawer.ts/.html/.scss`: an overlay and an `aside.drawer`, always in the DOM, in
    the app root, outside the scrolling grid (decision Q12). The drawer slides in with a 200ms
    transform. When it is closed, it is `inert` and `visibility: hidden`.
  - A reactive `FormGroup`: name (required), status (ng-select, default Open), start date and
    end date (ngb-datepicker input popups, required). Header "Work Order Details", buttons
    Cancel and Create, or Save in edit mode.
  - The submit button only closes the drawer. Saving, validation errors, overlap and delete are
    for the next unit.
  - Escape closes the drawer. A capture-phase listener ignores Escape while the dropdown or a
    calendar is open, so that Escape closes only that popup.
  - `drawer-form.ts`: pure logic, no Angular. `formValueFor` gives the defaults (end = start +
    7 days, status Open, empty name) or the values of the edited order. The date format is
    `MM.DD.YYYY`, as in 'With Selection' (12.23.2025).
- New `src/styles/_form-controls.scss` (used by `styles.scss`): the ng-select and datepicker
  restyle. Their DOM is outside the component view, so these rules are global and scoped by the
  `.drawer-status` and `.drawer ngb-datepicker` classes. This also keeps the component SCSS
  under the 4 kB budget.
- Wiring outside the unit, kept small:
  - `timeline-grid`: output `cellPick` (row and day under the pointer), output `editOrder`
    (relayed from the bar), input `selectedCenterId`. The row of the open create drawer stays
    highlighted, because all four artboards show the Rodriques row highlighted under the
    overlay. A click on a bar does not open the drawer.
  - `work-order-bar`: output `edit` on the Edit menu item. `STATUS_LABELS` is exported. There is
    no visual change. The Default artboard is still at 0.27%.
  - `app.ts/html`: the `drawer` signal and the `<app-work-order-drawer>`.
- Dependencies: `@angular/localize` 20.3.35 and `@popperjs/core` 2.11.8, the peer dependencies
  of ng-bootstrap 19. The `@angular/localize/init` polyfill is in `angular.json`. The dev server
  needed a restart for this (done by the lead).
- `docs/design/tokens.json`, then `npm run tokens`:
  - Fixed: `components.textField.placeholderColor` `#a4aac0` (was `#687196`). Measured on the
    export ('Acme Inc.' and the date placeholders).
  - Fixed: `layout.panel.shadow`. It now has the three shadows of the panel layer (it had one).
  - Fixed: `layout.panel.subtitle.y` 47 (layer y 46). The Chromium line box puts the glyphs 1px
    too high otherwise.
  - New: panel overlay (`#f7f9fc` at 0.5), padX, divider colour, button gap, slide duration,
    title and subtitle line heights, `nameField.x` 874.
  - New: text field value inset 8.64, focus ring (2px `#aaafff` outside the box), field
    shadows, chevron `insetRight` 12.64.
  - New: `statusPill`, `statusMenu`, `button` (shadow, border, `textOffsetY` 1) and
    `datepicker`.
  - The reasons are in `agentChoices["layout.panel and components (u4-drawer)"]`.
- Tests: `tests/e2e/drawer.spec.ts` has one test for each id from D1 to D13 and for D15.
  `tests/unit/drawer.spec.ts` has D4, D5, D6 and D12 (the date format).

## Final pixel-check lines

Total of the page. The drawer area (x 836 to 1440) is in brackets.

| Artboard | Total | Drawer area |
|---|---|---|
| With Selection | 0.32% | 0.51% |
| Placeholder and Defaults | 0.32% | 0.51% |
| Active Text Field | 0.34% | 0.55% |
| Status Dropdown | 0.33% | 0.53% |

Drawer layers, Status Dropdown:

    3197   0.53%  Rectangle [849,0,591,1024]          panel: the sum of the text below
    1138  16.16%  Specify the dates, n [873,46,352,20] glyph AA, the line is 7px narrower
     614   0.83%  Dropdown/Simple Copy/Rectangle       menu box: edges match (873,260 543x136)
     513   8.11%  Work Order Details [873,16,253,25]  glyph AA, 3px narrower
     480   1.43%  Group [873,365,543,62]              label text 'End date' / 'Start date', see below
     192   7.11%  In progress (menu row)              glyph AA

Measured edges that match the design to the pixel: the panel edge, the corner and the shadow
ramp at x 836 to 848, the divider at y 82, the button boxes, the field boxes (name 874 to 1415,
the others 873 to 1415), the focus rings (2px outside the box), the status pill (882,226, 22
high), the chevron triangle (y 234 to 238), the menu box and the row text.

## What still differs and why

- **Order of the date fields.** The artboards show 'End date' above 'Start date'. The values of
  'With Selection' (12.30.2025 above 12.23.2025) agree with these labels. The app shows Start
  date first, in the order of the brief and of `tokens.json` (`fields`: startDate y 279, endDate
  y 365). I think the artboard order is a design error. **Lead: please confirm.** To change it,
  swap the two `drawer-field` blocks.
- **Date placeholders.** The design shows '01.01.2026' and '02.01.2026' in grey. A placeholder
  that looks like a real date can be read as a value, so the app uses 'MM.DD.YYYY'.
- **'With Selection' date text** sits at x 881 in the design, but the date placeholders of the
  other artboards sit at x 883, as the name text does. The app uses one inset (883) for all.
- **'Active Text Field'** shows 'McMarrow Distributio…' with an ellipsis. That is a mock of the
  typing. The app shows the typed text and the caret.
- **The chevron of 'With Selection'** is lighter (`#b3b7ca`) than in the other three artboards
  (`#687196`). The app uses `#687196`.
- **Pill borders.** Only the Open pill has a border in the export (`#cefbff`). Blocked has the
  fill only. The app gives In progress and Complete the fill only, as Blocked.
- **Row fills of the open list.** The `Dropdown/Simple Copy` layer has row fills, but the export
  shows none. The app shows no fill on open. Hover, and a row that the keyboard moved to, get
  `#f1f3f8`.
- **Datepicker popup.** No artboard shows it. It uses the menu tokens: radius 5, the 10% border,
  the two menu shadows, `#f1f3f8` hover. The selected day is `#5659ff` with white text. The
  navigation is arrows and the month name, no select boxes. The calendar opens 5px under the
  field. It takes the focus when it opens (ngb behaviour). Typing a date works after Tab.
- **The grid behind the overlay** is u2/u3 work. Its residue (bars, 'Group 5') is the same as
  in the Default artboard.

# Unit u4-drawer: verify

Verifier, 2026-11-10. Lead: t38. Node 22.14.0. Run artifacts are in the session scratchpad
(`pc/sel`, `pc/ph`, `pc/act`, `pc/dd` and the `z` zoom folders, `v/*.mjs` scripts).

The steps of the builder notes are correct: all four states render with them. Pointer (600,322)
opens the drawer on the Rodriques Electrics row.

## Pixels

P1 With Selection total pass - 0.32%, drawer panel layer 0.51% - pixel-check
P2 Placeholder and Defaults total pass - 0.32%, panel 0.52% - pixel-check
P3 Active Text Field total pass - 0.34%, panel 0.56% - pixel-check
P4 Status Dropdown total pass - 0.33%, panel 0.53% - pixel-check
P5 Panel Rectangle [849,0,591,1024] pass - box 849,0 591x1024, radius 12px, 3 shadows = design (`#d8dceb 0 4.5 5 -1`, `#c8cfe9 0 2.5 3 -1.5`, `#d8dceb 0 5 15 0`) - Playwright computed style
P6 Work Order Details / subtitle pass - glyph anti-aliasing only (8.11%, 16.16% of text boxes), ink colours #2f3059 / #687196 match - zoom 860,0,280,440
P7 Buttons Cancel / Create pass - ink Cancel x1285-1330 vs 1286-1330, Create box x1355-1414 y30-51 = design - darkest-pixel box scan
P8 Work Order Name field pass - value ink x883-1027 vs 884-1026, #030929; placeholder 'Acme Inc.' #a4aac0 x883-943 y145-154 = design - box scan
P9 Name focus ring (Active Text Field) pass - 2px #aaafff outside the box, Rectangle 7 layer 1.27% (AA) - zoom 860,90,580,90
P10 Active Text Field value pass - design 'McMarrow Distributio…' is a typing mock with ellipsis; app shows the typed text - zoom
P11 Date field order fail - design: 'End date' at y 279, 'Start date' at y 365 (With Selection values 12.30.2025 above 12.23.2025). App: 'Start date' above 'End date'. Lead decision: follow the design - zoom 860,0,280,440, label order from DOM
P12 Date placeholders fail - design '01.01.2026' (y 279 field) and '02.01.2026' (y 365 field), #a4aac0; app 'MM.DD.YYYY' (ink x883-967, wider) - zoom 836,0,604,440
P13 Date values (With Selection) pass - ink x882-947/948 y317-326 and y403-412 = design - box scan
P14 Status pill collapsed, 3 artboards pass - pill top y 226, bottom y 247, fill and border = design (With Selection, Placeholder, Active) - column scan x 885
P15 Status pill collapsed, Status Dropdown fail - design pill y 225 to 246 (Controls/Label/5 at 881.5,225 51x22), app y 226 to 247: 1px low in the focused state - column scan x 885
P16 Status field focus ring (Status Dropdown) pass - 2px #aaafff, Rectangle 7 873,217 543x38 - zoom 836,180,604,260
P17 Chevron pass - #687196, y 234-237 = design in 3 artboards - box scan
P18 Chevron, With Selection fail - design #b3b7ca (lighter), app #687196. Design is not consistent with the other 3 artboards; lead to decide - box scan 1385,226,25,16
P19 Dropdown/Simple Copy menu box pass - 873,260 543x136, radius 5, border 10% #687196, 2 shadows = design - Playwright boundingBox, zoom
P20 Dropdown rows text position fail - every row ink 1px higher than design: Open y281-293 vs 282-294, In progress 309-321 vs 310-322, Complete 337-349 vs 338-350, Blocked 365-374 vs 366-375. Design text layers at row y + 5 (12+5, 40+5 ...) - box scan
P21 Dropdown 'Blocked' row colour fail - design layer textColor #030929 and export ink #030929; app #2f3059 - artboards.json, box scan
P22 Dropdown row fills pass - layers have #f1f3f8 / #d8dceb fills, the export shows none, app shows none on open - export pixels
P23 Overlay pass - rgba(247,249,252,0.5) over 0,0 1440x1024; Rectangle [0,0,1440,1024] residue is grid u2/u3 work behind it - Playwright computed style
P24 Grid behind overlay pass - Group 5, Group 6/7 bars residue same class as Default artboard (u2/u3) - pixel-check

## Behaviour

D1 pass - closed: hidden and inert; 60ms after click transform matrix tx 309.9 (slides from right), open box 849,0 591x1024, radius 12px - "Slides in from the right / Fixed width (see designs)" - Playwright
D2 pass - 'Work Order Details' / 'Specify the dates, name and status for this order' - "Header: \"Work Order Details\" (same as create)" - Playwright
D3 pass - parity Month: click x 600 -> 09.01.2024, 500 -> 08.05.2024, 540 -> 08.16.2024, 700 -> 09.28.2024, 760 -> 10.14.2024 (match column math, 114px per month). Live mode: x 700 -> 09.01.2026, x 1000 -> 11.20.2026. Click on a bar or the rail does not open - "Click empty timeline area | Open Create panel, pre-fill start date from click position" - Playwright
D4 pass - 09.01.2024 -> 09.08.2024, 10.14.2024 -> 10.21.2024; unit test over month end 12.28.2026 -> 01.04.2027 - "End Date | ngb-datepicker | Pre-filled: Start Date + 7 days" - Playwright, vitest
D5 pass - status 'Open' on each create, form resets after a typed name - "Status | ng-select dropdown | Default: \"Open\"" - Playwright
D6 pass - Edit from three-dot menu on Concentrix Ltd: name 'Concentrix Ltd', 07.20.2024, 10.30.2024, Complete, button 'Save' - "Fields pre-populated with existing data / Button text: \"Save\" instead of \"Create\"" - Playwright
D7 pass - Cancel closes, bar count 4 -> 4 - "Cancel button closes without saving" - Playwright
D8 pass - click 400,700 on overlay closes; clicks inside the ng-select list and the calendar keep the drawer open - "Clicking outside closes the panel" - Playwright
D9 pass - Escape with list open closes the list only, with calendar open closes the calendar only, next Escape closes the drawer; works in edit too - acceptance D9 (bonus) - Playwright
D10 pass - Tab from name: status, start, end. Note: next Tab leaves the drawer to the page behind (BODY, then the timescale chip); no focus trap - acceptance D10 (bonus) - Playwright
D11 pass - placeholder 'Acme Inc.' #a4aac0; focus: border white, ring 0 0 0 2px #aaafff - acceptance D11 - Playwright computed style, P8/P9
D12 pass - click on the field opens ngb-datepicker (1 instance), no button in the fields before open; popup restyled (radius 5, Circular-Std, #5659ff selected day, menu shadow); a day pick sets the value and closes the popup - "Start Date | ngb-datepicker" - Playwright screenshot `v/dp.png`
D13 pass - collapsed: pill (Open #e4fdff/#cefbff, Complete #e1ffcc); list: plain text, Open #3e40db, others #2f3059; pick updates the pill - acceptance D13 - Playwright
D15 pass - overlay rgba(247,249,252,0.5) full page, opacity 1 when open - acceptance D15 - Playwright
F1 Reactive FormGroup pass - `FormGroup` with name (required), status, startDate, endDate (required) - "use Reactive Forms with FormGroup" - work-order-drawer.ts:57

## Regressions

R1 `npm run build` pass - exit 0, no warnings
R2 `npx vitest run` pass - 4 files, 13 passed
R3 `npx playwright test` pass - 41 passed (6.9s)

## Code

K1 Tokens fail - borrowed tokens with other meaning: `.ngb-dp-arrow-btn` padding uses `$layout-tooltip-padding-x`, `.ngb-dp-month-name` weight uses `$type-chip-value-font-weight`; literal `1px` in the menu ring and the weekday border - src/styles/_form-controls.scss
K2 Duplication fail - `$control-shadow` and `$focus-ring` are defined twice with the same value - src/app/work-order-drawer/work-order-drawer.scss:3, src/styles/_form-controls.scss:6
K3 Dead code pass - no unused imports, members or rules found - drawer files
K4 Top-down order pass - component then the formatter; drawer-form.ts exports first, helpers at the end - drawer files
K5 Change outside unit fail - `angular.json` adds `"cli.analytics": false`, not needed by the unit - angular.json:6
K6 Dependencies pass - `@angular/localize` 20.3.35 and `@popperjs/core` 2.11.8 (ng-bootstrap 19 peers); lockfile adds the @babel/@types transitive deps of localize - package.json, package-lock.json
K7 Wiring pass - grid `cellPick`, `editOrder`, `selectedCenterId`; bar `edit`; `STATUS_LABELS` export. Small and in line with the unit - timeline-grid.ts, work-order-bar.ts, app.ts
K8 tokens.json pass - diff is mostly reformatting; changed values are the 3 the builder lists (placeholder #a4aac0, panel shadow x3, subtitle y 47) - git diff, _tokens.scss diff

## Failures

- P11 Date field order: design End above Start, app Start above End (lead decision: follow design). The e2e D10 Tab order test will need the new order.
- P12 Date placeholders: design '01.01.2026' / '02.01.2026', app 'MM.DD.YYYY'.
- P15 Status pill 1px low in the Status Dropdown (focused) state: design y 225, app y 226.
- P18 Chevron colour in With Selection: design #b3b7ca, app #687196 (design inconsistent, lead to decide).
- P20 Dropdown row text 1px high on all 4 rows.
- P21 Dropdown 'Blocked' row text: design #030929, app #2f3059.
- K1 Borrowed tooltip/chip tokens and `1px` literals in the datepicker restyle.
- K2 `$control-shadow` and `$focus-ring` duplicated in 2 SCSS files.
- K5 `angular.json` analytics change outside the unit.

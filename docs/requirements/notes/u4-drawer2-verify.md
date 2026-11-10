# Unit u4-drawer2: verify

Verifier, 2026-11-10. Lead: t38. Node 22.14.0. Recheck of the failures in `u4-drawer-verify.md`
after `u4-fix.md`, with the lead decisions: End date above Start date; DD.MM.YYYY; chevron
#687196 kept; `angular.json` analytics intended. Then a regression pass of the u4 scope.
Run artifacts: session scratchpad `v2/` (`sel`, `ph`, `act`, `dd`, `scan.mjs`, `probe.mjs`).
Steps: the four step strings of `u4-fix.md`.

## Rechecked failures

P11 Date field order pass - labels in DOM order: Work Order Name, Status, End date, Start date; Tab order name, status, endDate, startDate; zoom shows End date field at y 279, Start date at y 365 = design - Playwright, zoom 836,180,604,260
P12 Date placeholders pass (lead decision DD.MM.YYYY) - empty field placeholder 'dd.mm.yyyy', colour rgb(164,170,192) = #a4aac0; typed '31.01.2026' kept as is. Design '01.01.2026' grey is a sample value: app renders it as a value #030929, ink box x882-946 y317-327 vs design x883-947 y318-326 - Playwright, box scan
P15 Status pill, Status Dropdown pass - pill fill column x 886: design y 225-246, app y 225-246; pill text y 231-243 both - column scan
P15b Status pill closed (With Selection) pass - pill text y 232-244 design and app - box scan
P18 Chevron, With Selection pass (lead decision) - app #687196, design #b3b7ca; box x1395-1402 y234-238 vs x1396-1402 y234-238 - box scan 1385,226,25,16
P20 Dropdown rows text position pass - Open y282-294, In progress 310-322, Complete 338-350, Blocked 366-375, design = app - box scan
P21 Dropdown 'Blocked' row colour pass - hovered row #030929 design = app; computed: hover Complete -> rgb(3,9,41), ArrowDown to Blocked -> rgb(3,9,41), selected Open stays rgb(62,64,219), no row fill - box scan, Playwright
K1 Tokens pass - no `tooltip-padding` or `chip-value-font` in drawer files; new tokens `datepicker-nav-padding-x`, `type-datepicker-month-*`, `layout-dropdown-menu-border-width`, `layout-panel-divider-width`; only `1px` left is `.visually-hidden` (standard clip) - src/styles/_form-controls.scss
K2 Duplication pass - `$control-shadow`, `$focus-ring`, `$menu-shadow` defined once in src/styles/_control-shadows.scss:5,12,14; used by work-order-drawer.scss and _form-controls.scss - grep
K5 angular.json pass (lead decision) - `cli.analytics: false` is the lead's change - angular.json:6

## Pixels (regression)

P1 With Selection total pass - 0.30% (was 0.32%), panel 0.47% - pixel-check
P2 Placeholder and Defaults total pass - 0.30% (was 0.32%), panel 0.46% - pixel-check
P3 Active Text Field total pass - 0.32% (was 0.34%), panel 0.50%, name field 1.38% - pixel-check
P4 Status Dropdown total pass - 0.29% (was 0.33%), panel 0.42% - pixel-check
P6 Title / subtitle pass - unchanged glyph AA, 8.11% / 16.16% - pixel-check
P13 Date values (With Selection) pass - ink End x882-947 y317-326, Start x882-946 y403-412 = design box; glyphs differ only by DD.MM order (30.12.2025 vs 12.30.2025) - box scan
P19 Menu box pass - zoom 836,200,604,200: box, ring and shadow match; no new diff - zoom
P23 Overlay / grid residue pass - Rectangle [0,0,1440,1024] 0.29-0.32%, Group 5 / Group 6 residue same as before (u2/u3) - pixel-check

## Behaviour (regression)

D1 pass - closed drawer `visibility: hidden` after overlay click; open from (600,322) - Playwright
D2 pass - covered by e2e drawer.spec.ts, 41 passed - playwright test
D3 pass - click x 600 on Rodriques Electrics -> start 01.09.2024 - "pre-fill start date from click position" - Playwright
D4 pass - end 08.09.2024 = start + 7 days - "Pre-filled: Start Date + 7 days" - Playwright
D5 pass - status pill 'Open' on create - "Default: \"Open\"" - Playwright, e2e
D6 pass - e2e edit test with DD.MM.YYYY values - "Fields pre-populated with existing data" - playwright test
D7 pass - e2e Cancel test - "Cancel button closes without saving" - playwright test
D8 pass - click 400,700 on overlay closes - "Clicking outside closes the panel" - Playwright
D9 pass - e2e Escape test - acceptance D9 - playwright test
D10 pass - Tab name, status, endDate, startDate (new design order) - acceptance D10 - Playwright, e2e
D11 pass - placeholder 'Acme Inc.'; focus ring zoom Active Text Field unchanged - acceptance D11 - Playwright, zoom
D12 pass - e2e datepicker test with DD.MM.YYYY; typed value parsed and kept - "ngb-datepicker" - playwright test, Playwright
D13 pass - list plain text, Open #3e40db, others #2f3059, hover/keyboard #030929; Enter on Blocked sets pill 'Blocked' - acceptance D13 - Playwright
D15 pass - overlay unchanged (P23) - acceptance D15 - pixel-check, e2e

## Regressions

R1 `npm run build` pass - exit 0, no warnings
R2 `npx vitest run` pass - 4 files, 13 passed
R3 `npx playwright test` pass - 41 passed (6.7s)

## Notes (not failures)

- End date field x: 3 artboards draw it at x 874 w 542, With Selection and the app at x 873 w 543. 1px edge line in the diff. Open question from u4-fix, for the lead.
- `parseDottedDate` accepts impossible days such as 31.02.2026 (regex only). Not in the u4 failure list.

## Failures

None.
